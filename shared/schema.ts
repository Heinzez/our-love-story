import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const emailSubscribers = pgTable("email_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryEmail: text("primary_email").notNull(),
  backupEmail: text("backup_email"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedNotes = pgTable("saved_notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const giftBalance = pgTable("gift_balance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  amountKes: integer("amount_kes").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const giftTransactions = pgTable("gift_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  recipientName: text("recipient_name"),
  amountKes: integer("amount_kes").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userPhotos = pgTable("user_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  sender: text("sender").notNull(),
  status: text("status").notNull().default("sent"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  isAi: boolean("is_ai").notNull().default(false),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type SavedNote       = typeof savedNotes.$inferSelect;
export type GiftBalance     = typeof giftBalance.$inferSelect;
export type GiftTx          = typeof giftTransactions.$inferSelect;
export type SiteSetting     = typeof siteSettings.$inferSelect;
export type UserPhoto       = typeof userPhotos.$inferSelect;
export type ChatMessage     = typeof chatMessages.$inferSelect;
