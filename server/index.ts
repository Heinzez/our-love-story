import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { db } from "./db.js";
import {
  emailSubscribers,
  savedNotes,
  giftBalance,
  giftTransactions,
  siteSettings,
} from "../shared/schema.js";
import { desc, eq, gte } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── SETTINGS ─────────────────────────────────────────────────

const DEFAULT_SETTINGS: Record<string, string> = {
  gift_locked: "false",
  weekly_gift_amount: "500",
};

async function getSetting(key: string): Promise<string> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return rows[0]?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

async function setSetting(key: string, value: string): Promise<void> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  if (rows.length > 0) {
    await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

// GET /api/settings — public settings for the frontend
app.get("/api/settings", async (_req, res) => {
  try {
    const [giftLocked, weeklyGiftAmount] = await Promise.all([
      getSetting("gift_locked"),
      getSetting("weekly_gift_amount"),
    ]);
    res.json({ giftLocked: giftLocked === "true", weeklyGiftAmount: parseInt(weeklyGiftAmount, 10) || 500 });
  } catch (err) {
    console.error("settings GET error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// POST /api/admin/settings — admin updates settings
app.post("/api/admin/settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: "key and value are required" });
    await setSetting(String(key), String(value));
    res.json({ success: true, key, value });
  } catch (err) {
    console.error("admin settings POST error:", err);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

// ── EMAIL ─────────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

// POST /api/subscribe-email
app.post("/api/subscribe-email", async (req, res) => {
  try {
    const { primary_email, backup_email } = req.body;
    if (!primary_email) return res.status(400).json({ error: "primary_email is required" });
    await db.insert(emailSubscribers).values({
      primaryEmail: primary_email,
      backupEmail: backup_email || null,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("subscribe-email error:", err);
    res.status(500).json({ error: "Failed to save email" });
  }
});

// GET /api/admin/subscribers
app.get("/api/admin/subscribers", async (_req, res) => {
  try {
    const rows = await db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt));
    res.json(rows);
  } catch (err) {
    console.error("subscribers GET error:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// POST /api/admin/send-email — send a notification to all subscribers
app.post("/api/admin/send-email", async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "subject and message are required" });

    const transport = createTransport();
    if (!transport) {
      return res.status(503).json({
        error: "Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and optionally SMTP_PORT as environment variables.",
      });
    }

    const subscribers = await db.select().from(emailSubscribers);
    if (subscribers.length === 0) {
      return res.json({ success: true, sent: 0, message: "No subscribers yet." });
    }

    const fromEmail = process.env.SMTP_USER!;
    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; background: #1a0a10; color: #f5e6d8; padding: 40px 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 24px;">♥</span>
          <h2 style="color: #e8607a; font-style: italic; margin: 8px 0 0;">A message for my queen</h2>
        </div>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(232,96,122,0.2); border-radius: 12px; padding: 24px; white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #f0ddd0;">
${message}
        </div>
        <div style="text-align: center; margin-top: 28px; font-style: italic; color: #b06878; font-size: 13px;">
          Mr.Mwendwa — always yours ❤️
        </div>
      </div>`;

    let sent = 0;
    for (const sub of subscribers) {
      const emails = [sub.primaryEmail, sub.backupEmail].filter(Boolean) as string[];
      for (const to of emails) {
        await transport.sendMail({ from: `"Mr.Mwendwa" <${fromEmail}>`, to, subject, html: htmlBody });
        sent++;
      }
    }

    res.json({ success: true, sent, subscribers: subscribers.length });
  } catch (err) {
    console.error("send-email error:", err);
    res.status(500).json({ error: "Failed to send emails. Check SMTP credentials." });
  }
});

// ── SAVED NOTES ──────────────────────────────────────────────

app.get("/api/saved-notes", async (_req, res) => {
  try {
    const notes = await db
      .select({ id: savedNotes.id, text: savedNotes.text, date: savedNotes.date })
      .from(savedNotes)
      .orderBy(desc(savedNotes.createdAt));
    res.json(notes);
  } catch (err) {
    console.error("saved-notes GET error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/api/saved-notes", async (req, res) => {
  try {
    const { id, text, date } = req.body;
    if (!text || !date) return res.status(400).json({ error: "text and date are required" });
    const [note] = await db
      .insert(savedNotes)
      .values({ id, text, date })
      .returning({ id: savedNotes.id, text: savedNotes.text, date: savedNotes.date });
    res.json(note);
  } catch (err) {
    console.error("saved-notes POST error:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// ── GIFT ─────────────────────────────────────────────────────

app.get("/api/gift/balance", async (_req, res) => {
  try {
    const rows = await db.select().from(giftBalance).orderBy(desc(giftBalance.updatedAt)).limit(1);
    const amount = rows[0]?.amountKes ?? 0;
    res.json({ amountKes: amount });
  } catch (err) {
    console.error("gift balance GET error:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

app.post("/api/gift/balance", async (req, res) => {
  try {
    const { amountKes } = req.body;
    if (typeof amountKes !== "number" || amountKes < 0) {
      return res.status(400).json({ error: "amountKes must be a non-negative number" });
    }
    const rows = await db.select().from(giftBalance).limit(1);
    if (rows.length > 0) {
      await db.update(giftBalance).set({ amountKes, updatedAt: new Date() }).where(eq(giftBalance.id, rows[0].id));
    } else {
      await db.insert(giftBalance).values({ amountKes });
    }
    res.json({ success: true, amountKes });
  } catch (err) {
    console.error("gift balance POST error:", err);
    res.status(500).json({ error: "Failed to update balance" });
  }
});

// POST /api/gift/lookup — validate Kenyan phone number format
// NOTE: Africa's Talking does NOT provide a public API to look up another person's
// name from their phone number — this is restricted for privacy. The name you see
// on M-Pesa is only confirmed during the actual transaction (STK push) on the
// recipient's phone. This endpoint validates the number format only.
app.post("/api/gift/lookup", async (req, res) => {
  try {
    const { phone, recipientName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });

    const normalized = phone.startsWith("+") ? phone : `+254${phone.replace(/^0/, "")}`;
    const isKenyan = /^\+2547\d{8}$/.test(normalized);
    if (!isKenyan) {
      return res.status(400).json({ error: "Enter a valid Kenyan number (07XX XXX XXX or +2547XX XXX XXX)" });
    }

    const name = (recipientName || "").trim() || "M-Pesa Account";
    res.json({ phone: normalized, name, verified: true });
  } catch (err) {
    console.error("gift lookup error:", err);
    res.status(500).json({ error: "Lookup failed" });
  }
});

const DAILY_LIMIT_KES = 5000;

// Start of today in EAT (UTC+3) expressed as UTC Date
function startOfTodayEAT(): Date {
  const now = new Date();
  const eatNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const startEAT = new Date(eatNow);
  startEAT.setUTCHours(0, 0, 0, 0);
  return new Date(startEAT.getTime() - 3 * 60 * 60 * 1000);
}

async function getTodayTotalSent(): Promise<number> {
  const rows = await db
    .select({ amountKes: giftTransactions.amountKes })
    .from(giftTransactions)
    .where(gte(giftTransactions.createdAt, startOfTodayEAT()));
  return rows.reduce((sum, r) => sum + r.amountKes, 0);
}

app.post("/api/gift/send", async (req, res) => {
  try {
    const { phone, recipientName, amountKes } = req.body;
    if (!phone || !amountKes) return res.status(400).json({ error: "phone and amountKes are required" });
    if (typeof amountKes !== "number" || amountKes <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Check daily limit
    const totalToday = await getTodayTotalSent();
    const remaining = DAILY_LIMIT_KES - totalToday;
    if (amountKes > remaining) {
      return res.status(400).json({
        error: `Daily limit reached. You can send up to KES ${remaining.toLocaleString()} more today.`,
        remaining,
      });
    }

    const rows = await db.select().from(giftBalance).limit(1);
    const current = rows[0]?.amountKes ?? 0;
    if (current < amountKes) {
      return res.status(400).json({ error: "Insufficient gift balance" });
    }

    await db.update(giftBalance)
      .set({ amountKes: current - amountKes, updatedAt: new Date() })
      .where(eq(giftBalance.id, rows[0].id));

    const [tx] = await db.insert(giftTransactions).values({
      phoneNumber: phone,
      recipientName: recipientName || null,
      amountKes,
      status: "sent",
    }).returning();

    res.json({ success: true, transaction: tx, remainingKes: current - amountKes });
  } catch (err) {
    console.error("gift send error:", err);
    res.status(500).json({ error: "Failed to send gift" });
  }
});

// GET /api/gift/daily-sent — how much has been sent today vs the 5000 limit
app.get("/api/gift/daily-sent", async (_req, res) => {
  try {
    const totalSent = await getTodayTotalSent();
    res.json({ totalSent, remaining: Math.max(0, DAILY_LIMIT - totalSent), dailyLimit: DAILY_LIMIT });
  } catch (err) {
    console.error("daily-sent GET error:", err);
    res.status(500).json({ error: "Failed to fetch daily total" });
  }
});

app.get("/api/gift/history", async (_req, res) => {
  try {
    const txs = await db.select().from(giftTransactions).orderBy(desc(giftTransactions.createdAt)).limit(20);
    res.json(txs);
  } catch (err) {
    console.error("gift history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist/public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
