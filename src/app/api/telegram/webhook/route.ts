import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { telegramSubscribers } from "@/db/schema";
import { botWelcomeText, sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

type TelegramMessage = {
  text?: string;
  chat?: { id?: number | string };
  from?: { username?: string; first_name?: string; language_code?: string };
};

type TelegramUpdate = {
  message?: TelegramMessage;
};

function parseCommand(text: string) {
  return text.trim().toLowerCase().split(/\s+/)[0]?.split("@")[0] ?? "";
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: false, error: "Invalid Telegram update" }, { status: 400 });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (!chatId || !text) {
    return Response.json({ ok: true });
  }

  const normalizedChatId = String(chatId);
  const command = parseCommand(text);
  const identity = {
    username: message.from?.username ?? null,
    firstName: message.from?.first_name ?? null,
    languageCode: message.from?.language_code ?? null,
    updatedAt: new Date(),
    lastCommandAt: new Date(),
  };

  if (command === "/start") {
    await db
      .insert(telegramSubscribers)
      .values({ chatId: normalizedChatId, ...identity, isActive: true })
      .onConflictDoUpdate({
        target: telegramSubscribers.chatId,
        set: { ...identity, isActive: true },
      });

    await sendTelegramMessage({ chatId: normalizedChatId, text: botWelcomeText });
    return Response.json({ ok: true });
  }

  if (command === "/stop") {
    await db
      .update(telegramSubscribers)
      .set({ isActive: false, ...identity })
      .where(eq(telegramSubscribers.chatId, normalizedChatId));

    await sendTelegramMessage({
      chatId: normalizedChatId,
      text: "◌ <b>PULSE на паузе</b>\n\nУведомления отключены. Отправьте /start в любой момент, чтобы снова включить радар.",
    });
    return Response.json({ ok: true });
  }

  if (command === "/status") {
    const [subscriber] = await db
      .select({ isActive: telegramSubscribers.isActive })
      .from(telegramSubscribers)
      .where(eq(telegramSubscribers.chatId, normalizedChatId))
      .limit(1);

    const statusText = subscriber?.isActive
      ? "● <b>Радар активен</b>\n\nВы получаете обновления, новости, баг-репорты и события CS2."
      : "◌ <b>Радар выключен</b>\n\nОтправьте /start, чтобы снова получать сводки по CS2.";

    await sendTelegramMessage({ chatId: normalizedChatId, text: statusText });
    return Response.json({ ok: true });
  }

  const [subscriber] = await db
    .select({ id: telegramSubscribers.id })
    .from(telegramSubscribers)
    .where(and(eq(telegramSubscribers.chatId, normalizedChatId), eq(telegramSubscribers.isActive, true)))
    .limit(1);

  if (subscriber) {
    await sendTelegramMessage({
      chatId: normalizedChatId,
      text: "Напишите /status, чтобы проверить радар, или /stop, чтобы отключить уведомления.",
    });
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({ ok: true, service: "telegram-webhook" });
}
