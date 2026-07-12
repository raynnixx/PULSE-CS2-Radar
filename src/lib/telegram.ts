import type { NotificationTopic } from "@/db/schema";

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

type InlineKeyboard = {
  inline_keyboard: Array<Array<{ text: string; url: string }>>;
};

export type TelegramSendResult =
  | { ok: true }
  | { ok: false; error: string };

const topicLabels: Record<NotificationTopic, string> = {
  updates: "ОБНОВЛЕНИЕ",
  news: "НОВОСТИ",
  bugs: "БАГ-РАДАР",
  events: "ТУРНИРЫ",
};

const topicIcons: Record<NotificationTopic, string> = {
  updates: "⚡",
  news: "◈",
  bugs: "◌",
  events: "🏆",
};

export function escapeTelegramHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function createBroadcastText({
  topic,
  title,
  body,
  sourceUrl,
}: {
  topic: NotificationTopic;
  title: string;
  body: string;
  sourceUrl?: string | null;
}) {
  const header = `${topicIcons[topic]} <b>${topicLabels[topic]} // CS2</b>`;
  const parts = [
    header,
    "",
    `<b>${escapeTelegramHtml(title)}</b>`,
    escapeTelegramHtml(body),
  ];

  if (sourceUrl) {
    parts.push("", `<a href=\"${escapeTelegramHtml(sourceUrl)}\">Открыть первоисточник ↗</a>`);
  }

  return parts.join("\n");
}

export async function telegramRequest<T>(method: string, payload: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured" } as TelegramApiResponse<T>;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return (await response.json()) as TelegramApiResponse<T>;
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Telegram request failed",
    } as TelegramApiResponse<T>;
  }
}

export async function sendTelegramMessage({
  chatId,
  text,
  replyMarkup,
}: {
  chatId: string;
  text: string;
  replyMarkup?: InlineKeyboard;
}): Promise<TelegramSendResult> {
  const result = await telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  });

  if (!result.ok) {
    return { ok: false, error: result.description ?? "Telegram rejected the message" };
  }

  return { ok: true };
}

export const botWelcomeText = [
  "⚡ <b>PULSE / CS2</b>",
  "",
  "Радар включён. Я буду присылать проверенные обновления, важные новости, известные баги и турнирные события по Counter-Strike 2.",
  "",
  "<b>Команды</b>",
  "/status — проверить подписку",
  "/stop — поставить уведомления на паузу",
  "/start — включить уведомления снова",
].join("\n");
