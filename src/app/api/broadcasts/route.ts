import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import {
  broadcasts,
  deliveryLogs,
  notificationTopics,
  type NotificationTopic,
  telegramSubscribers,
} from "@/db/schema";
import { createBroadcastText, sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type BroadcastInput = {
  topic?: unknown;
  title?: unknown;
  body?: unknown;
  sourceUrl?: unknown;
};

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  return Boolean(adminKey && request.headers.get("x-admin-key") === adminKey);
}

function isTopic(value: unknown): value is NotificationTopic {
  return typeof value === "string" && notificationTopics.includes(value as NotificationTopic);
}

function validText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const recent = await db
    .select({
      id: broadcasts.id,
      topic: broadcasts.topic,
      title: broadcasts.title,
      createdAt: broadcasts.createdAt,
      sentAt: broadcasts.sentAt,
    })
    .from(broadcasts)
    .orderBy(desc(broadcasts.createdAt))
    .limit(20);

  return Response.json({ ok: true, broadcasts: recent });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return Response.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 503 },
    );
  }

  let input: BroadcastInput;
  try {
    input = (await request.json()) as BroadcastInput;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isTopic(input.topic) || !validText(input.title, 180) || !validText(input.body, 3500)) {
    return Response.json(
      { ok: false, error: "Provide a valid topic, title (1–180) and body (1–3500)." },
      { status: 422 },
    );
  }

  const sourceUrl = typeof input.sourceUrl === "string" && input.sourceUrl.trim() ? input.sourceUrl.trim() : null;
  if (sourceUrl) {
    try {
      new URL(sourceUrl);
    } catch {
      return Response.json({ ok: false, error: "sourceUrl must be a valid URL" }, { status: 422 });
    }
  }

  const topic = input.topic;
  const title = input.title as string;
  const body = input.body as string;
  const normalizedTitle = title.trim();
  const normalizedBody = body.trim();
  const [broadcast] = await db
    .insert(broadcasts)
    .values({ topic, title: normalizedTitle, body: normalizedBody, sourceUrl })
    .returning({ id: broadcasts.id });

  if (!broadcast) {
    return Response.json({ ok: false, error: "Could not create broadcast" }, { status: 500 });
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
  const message = createBroadcastText({
    topic,
    title: normalizedTitle,
    body: normalizedBody,
    sourceUrl,
  });
  let sent = 0;
  let failed = 0;

  for (const subscriber of recipients) {
    const result = await sendTelegramMessage({ chatId: subscriber.chatId, text: message });
    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
    }

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
    broadcastId: broadcast.id,
    recipients: recipients.length,
    sent,
    failed,
  });
}
