import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const notificationTopics = ["updates", "news", "bugs", "events"] as const;
export type NotificationTopic = (typeof notificationTopics)[number];

export const defaultNotificationTopics: NotificationTopic[] = [
  "updates",
  "news",
  "bugs",
  "events",
];

export const telegramSubscribers = pgTable(
  "telegram_subscribers",
  {
    id: serial("id").primaryKey(),
    chatId: text("chat_id").notNull(),
    username: text("username"),
    firstName: text("first_name"),
    languageCode: text("language_code"),
    isActive: boolean("is_active").notNull().default(true),
    topics: jsonb("topics")
      .$type<NotificationTopic[]>()
      .notNull()
      .default(sql`'["updates", "news", "bugs", "events"]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastCommandAt: timestamp("last_command_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("telegram_subscribers_chat_id_unique").on(table.chatId),
    index("telegram_subscribers_active_idx").on(table.isActive),
  ],
);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: serial("id").primaryKey(),
    topic: text("topic").$type<NotificationTopic>().notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    sourceUrl: text("source_url"),
    externalId: text("external_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [
    index("broadcasts_created_at_idx").on(table.createdAt),
    uniqueIndex("broadcasts_external_id_unique").on(table.externalId),
  ],
);

export const deliveryLogs = pgTable(
  "delivery_logs",
  {
    id: serial("id").primaryKey(),
    broadcastId: integer("broadcast_id").references(() => broadcasts.id, {
      onDelete: "cascade",
    }),
    subscriberId: integer("subscriber_id")
      .notNull()
      .references(() => telegramSubscribers.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("delivery_logs_broadcast_idx").on(table.broadcastId),
    index("delivery_logs_subscriber_idx").on(table.subscriberId),
  ],
);
