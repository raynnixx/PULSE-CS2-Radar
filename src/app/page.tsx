import { eq, sql } from "drizzle-orm";

import { PulseDashboard } from "@/components/pulse-dashboard";
import { db } from "@/db";
import { telegramSubscribers } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats] = await db
    .select({ activeSubscribers: sql<number>`count(*)::int` })
    .from(telegramSubscribers)
    .where(eq(telegramSubscribers.isActive, true));

  return (
    <PulseDashboard
      activeSubscribers={stats?.activeSubscribers ?? 0}
      botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
    />
  );
}
