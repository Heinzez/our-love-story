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

// Gift balance — single row updated by admin
export const giftBalance = pgTable("gift_balance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  amountKes: integer("amount_kes").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Gift transactions — each sent gift
export const giftTransactions = pgTable("gift_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  recipientName: text("recipient_name"),
  amountKes: integer("amount_kes").notNull(),
  status: text("status").notNull().default("pending"), // pending | sent | failed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Site-wide settings (key-value store)
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type SavedNote       = typeof savedNotes.$inferSelect;
export type GiftBalance     = typeof giftBalance.$inferSelect;
export type GiftTx          = typeof giftTransactions.$inferSelect;
export type SiteSetting     = typeof siteSettings.$inferSelect;
