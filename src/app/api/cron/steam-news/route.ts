import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import {
  broadcasts,
  deliveryLogs,
  type NotificationTopic,
  telegramSubscribers,
} from "@/db/schema";
import { createBroadcastText, sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type SteamNewsItem = {
  gid?: string;
  title?: string;
  contents?: string;
  url?: string;
};

type SteamNewsResponse = {
  appnews?: {
    newsitems?: SteamNewsItem[];
  };
};

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const adminKey = process.env.ADMIN_API_KEY;
  const authorization = request.headers.get("authorization");

  return Boolean(
    (cronSecret && authorization === `Bearer ${cronSecret}`) ||
      (adminKey && request.headers.get("x-admin-key") === adminKey),
  );
}

function toPlainText(value: string) {
  return value
    .replace(/\{STEAM_CLAN_IMAGE\}/gi, "")
    .replace(/\[\/?[^\]]+\]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function identifyTopic(title: string, contents: string): NotificationTopic {
  const text = `${title} ${contents}`.toLowerCase();
  if (/update|patch|release notes|обновлен|патч/.test(text)) return "updates";
  if (/bug|fix|fixed|crash|exploit|баг|исправлен/.test(text)) return "bugs";
  return "news";
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 503 });
  }

  try {
    const response = await fetch(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=1&maxlength=900&feeds=steam_community_announcements",
      { cache: "no-store" },
    );

    if (!response.ok) {
      return Response.json({ ok: false, error: `Steam returned ${response.status}` }, { status: 502 });
    }

    const data = (await response.json()) as SteamNewsResponse;
    const item = data.appnews?.newsitems?.[0];
    const externalId = item?.gid ? `steam:${item.gid}` : null;
    const title = item?.title ? toPlainText(item.title).slice(0, 180) : "";
    const body = item?.contents ? toPlainText(item.contents).slice(0, 900) : "";

    if (!externalId || !title || !body) {
      return Response.json({ ok: false, error: "Steam returned an incomplete news item" }, { status: 502 });
    }

    const topic = identifyTopic(title, body);
    const [broadcast] = await db
      .insert(broadcasts)
      .values({
        externalId,
        topic,
        title,
        body,
        sourceUrl: item?.url ?? null,
      })
      .onConflictDoNothing({ target: broadcasts.externalId })
      .returning({ id: broadcasts.id });

    if (!broadcast) {
      return Response.json({ ok: true, status: "already_processed", title });
    }

    const subscribers = await db
      .select({
        id: telegramSubscribers.id,
        chatId: telegramSubscribers.chatId,
        topics: telegramSubscribers.topics,
      })
      .from(telegramSubscribers)
      .where(eq(telegramSubscribers.isActive, true));

    const recipients = subscribers.filter((subscriber) => subscriber.topics.includes(topic));
    const message = createBroadcastText({ topic, title, body, sourceUrl: item?.url ?? null });
    let sent = 0;
    let failed = 0;

    for (const subscriber of recipients) {
      const result = await sendTelegramMessage({ chatId: subscriber.chatId, text: message });
      if (result.ok) sent += 1;
      else failed += 1;

      await db.insert(deliveryLogs).values({
        broadcastId: broadcast.id,
        subscriberId: subscriber.id,
        status: result.ok ? "sent" : "failed",
        error: result.ok ? null : result.error.slice(0, 1000),
      });
    }

    await db.update(broadcasts).set({ sentAt: new Date() }).where(eq(broadcasts.id, broadcast.id));

    return Response.json({
      ok: true,
      status: "delivered",
      topic,
      title,
      recipients: recipients.length,
      sent,
      failed,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Steam sync failed" },
      { status: 502 },
    );
  }
}
