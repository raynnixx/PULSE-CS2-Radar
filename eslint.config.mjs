import { NextRequest } from "next/server";

import { telegramRequest } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  return Boolean(adminKey && request.headers.get("x-admin-key") === adminKey);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await telegramRequest<{
    url?: string;
    pending_update_count?: number;
    last_error_message?: string;
  }>("getWebhookInfo", {});

  return Response.json(result, { status: result.ok ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "TELEGRAM_WEBHOOK_SECRET is not configured" }, { status: 503 });
  }

  let webhookUrl: unknown;
  try {
    ({ webhookUrl } = (await request.json()) as { webhookUrl?: unknown });
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof webhookUrl !== "string") {
    return Response.json({ ok: false, error: "webhookUrl is required" }, { status: 422 });
  }

  try {
    const url = new URL(webhookUrl);
    if (url.protocol !== "https:") {
      return Response.json({ ok: false, error: "Telegram webhook URL must use HTTPS" }, { status: 422 });
    }
  } catch {
    return Response.json({ ok: false, error: "webhookUrl must be a valid URL" }, { status: 422 });
  }

  const result = await telegramRequest<boolean>("setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });

  return Response.json(result, { status: result.ok ? 200 : 503 });
}
