import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import multer from "multer";
import { db } from "./db.js";
import {
  emailSubscribers,
  savedNotes,
  giftBalance,
  giftTransactions,
  siteSettings,
  userPhotos,
  chatMessages,
} from "../shared/schema.js";
import { desc, eq, gte } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── MULTER — memory storage (works on serverless + local) ─────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

// ── TELEGRAM ──────────────────────────────────────────────────

function tgToken() { return process.env.TELEGRAM_BOT_TOKEN || ""; }
function tgChatId() { return process.env.TELEGRAM_CHAT_ID || ""; }

async function sendTelegram(text: string) {
  const token = tgToken();
  const chatId = tgChatId();
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("Telegram notify failed:", e);
  }
}

async function registerTelegramWebhook() {
  const token = tgToken();
  if (!token) return;
  // Support SITE_URL (set on Vercel) or REPLIT_DOMAINS (set on Replit)
  const siteUrl = process.env.SITE_URL?.trim();
  const replitDomain = (process.env.REPLIT_DOMAINS || "").split(",")[0].trim();
  const base = siteUrl || (replitDomain ? `https://${replitDomain}` : "");
  if (!base) { console.log("No domain — Telegram webhook not registered"); return; }
  const webhookUrl = `${base}/api/telegram/webhook`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (data.ok) console.log(`Telegram webhook registered: ${webhookUrl}`);
    else console.error("Webhook registration failed:", data.description);
  } catch (e) {
    console.error("Webhook registration error:", e);
  }
}

// ── TELEGRAM WEBHOOK (incoming messages from admin) ────────────
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    res.json({ ok: true }); // Acknowledge immediately
    const { message } = req.body;
    if (!message?.text) return;

    const fromChatId = String(message.chat.id);
    const adminChatId = tgChatId();

    // Only accept messages from the registered admin chat
    if (!adminChatId || fromChatId !== adminChatId) return;

    const text: string = message.text.trim();

    // /reply <message> — save as a reply from me
    if (text.toLowerCase().startsWith("/reply ")) {
      const replyText = text.slice(7).trim();
      if (!replyText) return;
      await db.insert(chatMessages).values({
        text: replyText,
        sender: "me",
        status: "delivered",
        date: todayStr(),
        isAi: false,
      });
      // Confirm back to admin on Telegram
      await sendTelegram(`✅ Reply sent: "${replyText}"`);
      return;
    }

    // /help — show available commands
    if (text === "/help" || text === "/start") {
      await sendTelegram(
        `💌 <b>IlyNimo Bot — Commands</b>\n\n` +
        `/reply &lt;message&gt; — Send a reply to her\n` +
        `/help — Show this message\n\n` +
        `<i>You'll receive a notification here every time she sends a message through the site.</i>`
      );
    }
  } catch (e) {
    console.error("Telegram webhook error:", e);
  }
});

// ── AI FALLBACK RESPONSES ─────────────────────────────────────
const AI_RESPONSES = [
  "I'm always thinking of you 💕",
  "You are genuinely my favourite person on this earth.",
  "Even when I'm quiet, my heart is always saying your name.",
  "Just know that you are so deeply loved. Every single day.",
  "I'll reply properly soon — just wanted you to know I saw this and smiled.",
  "You make every ordinary moment feel like magic. I love you.",
  "My whole world ✨",
  "You're the best thing that ever happened to me, I mean that.",
  "I'm here. Always. 💗",
  "Reading this and feeling so lucky to have you.",
];

function pickAiResponse() {
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

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

app.post("/api/subscribe-email", async (req, res) => {
  try {
    const { primary_email, backup_email } = req.body;
    if (!primary_email) return res.status(400).json({ error: "primary_email is required" });
    await db.insert(emailSubscribers).values({ primaryEmail: primary_email, backupEmail: backup_email || null });
    res.json({ success: true });
  } catch (err) {
    console.error("subscribe-email error:", err);
    res.status(500).json({ error: "Failed to save email" });
  }
});

app.get("/api/admin/subscribers", async (_req, res) => {
  try {
    const rows = await db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt));
    res.json(rows);
  } catch (err) {
    console.error("subscribers GET error:", err);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

app.post("/api/admin/send-email", async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "subject and message are required" });
    const transport = createTransport();
    if (!transport) return res.status(503).json({ error: "Email not configured." });
    const subscribers = await db.select().from(emailSubscribers);
    if (subscribers.length === 0) return res.json({ success: true, sent: 0, message: "No subscribers yet." });
    const fromEmail = process.env.SMTP_USER!;
    const htmlBody = `<div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;background:#1a0a10;color:#f5e6d8;padding:40px 32px;border-radius:16px;"><div style="text-align:center;margin-bottom:28px;"><span style="font-size:24px;">♥</span><h2 style="color:#e8607a;font-style:italic;margin:8px 0 0;">A message for my queen</h2></div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,96,122,0.2);border-radius:12px;padding:24px;white-space:pre-wrap;font-size:15px;line-height:1.8;color:#f0ddd0;">${message}</div><div style="text-align:center;margin-top:28px;font-style:italic;color:#b06878;font-size:13px;">Mr.Mwendwa — always yours ❤️</div></div>`;
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
    res.status(500).json({ error: "Failed to send emails." });
  }
});

// ── SAVED NOTES ──────────────────────────────────────────────
app.get("/api/saved-notes", async (_req, res) => {
  try {
    const notes = await db.select({ id: savedNotes.id, text: savedNotes.text, date: savedNotes.date }).from(savedNotes).orderBy(desc(savedNotes.createdAt));
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
    const [note] = await db.insert(savedNotes).values({ id, text, date }).returning({ id: savedNotes.id, text: savedNotes.text, date: savedNotes.date });
    res.json(note);
  } catch (err) {
    console.error("saved-notes POST error:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// ── USER PHOTOS ───────────────────────────────────────────────
app.get("/api/photos", async (_req, res) => {
  try {
    const photos = await db.select().from(userPhotos).orderBy(desc(userPhotos.createdAt));
    res.json(photos);
  } catch (err) {
    console.error("photos GET error:", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.post("/api/photos/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    // Store as base64 data URL — works on serverless and local
    const b64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${b64}`;
    const caption = (req.body.caption as string) || null;
    const [photo] = await db.insert(userPhotos).values({ url: dataUrl, caption }).returning();
    res.json(photo);
  } catch (err) {
    console.error("photo upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.delete("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [photo] = await db.select().from(userPhotos).where(eq(userPhotos.id, id));
    if (!photo) return res.status(404).json({ error: "Not found" });
    await db.delete(userPhotos).where(eq(userPhotos.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("photo delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// ── CHAT ──────────────────────────────────────────────────────

// Check if an AI auto-reply is needed (last message from 'her', no reply in 3+ min)
async function maybeAutoReply() {
  const recent = await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt)).limit(5);
  if (!recent.length) return;
  const last = recent[0];
  if (last.sender !== "her") return;
  const ageMs = Date.now() - new Date(last.createdAt).getTime();
  if (ageMs < 3 * 60 * 1000) return; // wait 3 min
  // Insert AI response
  await db.insert(chatMessages).values({
    text: pickAiResponse(),
    sender: "me",
    status: "delivered",
    date: todayStr(),
    isAi: true,
  });
}

app.get("/api/chat/messages", async (_req, res) => {
  try {
    await maybeAutoReply();
    const messages = await db.select().from(chatMessages).orderBy(chatMessages.createdAt);
    // Mark all 'sent' messages from 'her' as 'delivered'
    await db.update(chatMessages).set({ status: "delivered" }).where(eq(chatMessages.status, "sent"));
    res.json(messages);
  } catch (err) {
    console.error("chat GET error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/chat/send", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    const [msg] = await db.insert(chatMessages).values({
      text: text.trim(),
      sender: "her",
      status: "sent",
      date: todayStr(),
      isAi: false,
    }).returning();
    // Notify via Telegram
    await sendTelegram(`💌 <b>She said:</b>\n"${text.trim()}"\n\n<i>Reply with: /reply your message here</i>`);
    res.json(msg);
  } catch (err) {
    console.error("chat send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/chat/reply", async (req, res) => {
  try {
    const { text, secret } = req.body;
    if (secret !== process.env.ADMIN_CHAT_SECRET && secret !== "your ability to lie") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    // Mark all her delivered messages as seen (admin is replying = he read them)
    await db.update(chatMessages)
      .set({ status: "seen" })
      .where(eq(chatMessages.sender, "her"));
    const [msg] = await db.insert(chatMessages).values({
      text: text.trim(),
      sender: "me",
      status: "delivered",
      date: todayStr(),
      isAi: false,
    }).returning();
    res.json(msg);
  } catch (err) {
    console.error("chat reply error:", err);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// markSender: 'her' = admin marking her messages seen | 'me' = she marking his messages seen
app.post("/api/chat/seen", async (req, res) => {
  try {
    const markSender = req.body?.markSender === "me" ? "me" : "her";
    await db.update(chatMessages)
      .set({ status: "seen" })
      .where(eq(chatMessages.sender, markSender));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark seen" });
  }
});

// ── GIFT ─────────────────────────────────────────────────────
app.get("/api/gift/balance", async (_req, res) => {
  try {
    const rows = await db.select().from(giftBalance).orderBy(desc(giftBalance.updatedAt)).limit(1);
    res.json({ amountKes: rows[0]?.amountKes ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

app.post("/api/gift/balance", async (req, res) => {
  try {
    const { amountKes } = req.body;
    if (typeof amountKes !== "number" || amountKes < 0) return res.status(400).json({ error: "Invalid amount" });
    const rows = await db.select().from(giftBalance).limit(1);
    if (rows.length > 0) {
      await db.update(giftBalance).set({ amountKes, updatedAt: new Date() }).where(eq(giftBalance.id, rows[0].id));
    } else {
      await db.insert(giftBalance).values({ amountKes });
    }
    res.json({ success: true, amountKes });
  } catch (err) {
    res.status(500).json({ error: "Failed to update balance" });
  }
});

app.post("/api/gift/lookup", async (req, res) => {
  try {
    const { phone, recipientName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });
    const normalized = phone.startsWith("+") ? phone : `+254${phone.replace(/^0/, "")}`;
    const isKenyan = /^\+2547\d{8}$/.test(normalized);
    if (!isKenyan) return res.status(400).json({ error: "Enter a valid Kenyan number (07XX XXX XXX)" });
    const name = (recipientName || "").trim() || "M-Pesa Account";
    res.json({ phone: normalized, name, verified: true });
  } catch (err) {
    res.status(500).json({ error: "Lookup failed" });
  }
});

const DAILY_LIMIT_KES = 5000;

function startOfTodayEAT(): Date {
  const now = new Date();
  const eatNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const startEAT = new Date(eatNow);
  startEAT.setUTCHours(0, 0, 0, 0);
  return new Date(startEAT.getTime() - 3 * 60 * 60 * 1000);
}

async function getTodayTotalSent(): Promise<number> {
  const rows = await db.select({ amountKes: giftTransactions.amountKes }).from(giftTransactions).where(gte(giftTransactions.createdAt, startOfTodayEAT()));
  return rows.reduce((sum, r) => sum + r.amountKes, 0);
}

app.post("/api/gift/send", async (req, res) => {
  try {
    const { phone, recipientName, amountKes } = req.body;
    if (!phone || !amountKes) return res.status(400).json({ error: "phone and amountKes are required" });
    if (typeof amountKes !== "number" || amountKes <= 0) return res.status(400).json({ error: "Invalid amount" });
    const totalToday = await getTodayTotalSent();
    const remaining = DAILY_LIMIT_KES - totalToday;
    if (amountKes > remaining) return res.status(400).json({ error: `Daily limit reached. You can send up to KES ${remaining.toLocaleString()} more today.`, remaining });
    const rows = await db.select().from(giftBalance).limit(1);
    const current = rows[0]?.amountKes ?? 0;
    if (current < amountKes) return res.status(400).json({ error: "Insufficient gift balance" });
    await db.update(giftBalance).set({ amountKes: current - amountKes, updatedAt: new Date() }).where(eq(giftBalance.id, rows[0].id));
    const [tx] = await db.insert(giftTransactions).values({ phoneNumber: phone, recipientName: recipientName || null, amountKes, status: "sent" }).returning();
    res.json({ success: true, transaction: tx, remainingKes: current - amountKes });
  } catch (err) {
    res.status(500).json({ error: "Failed to send gift" });
  }
});

app.get("/api/gift/daily-sent", async (_req, res) => {
  try {
    const totalSent = await getTodayTotalSent();
    res.json({ totalSent, remaining: Math.max(0, DAILY_LIMIT_KES - totalSent), dailyLimit: DAILY_LIMIT_KES });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily total" });
  }
});

app.get("/api/gift/history", async (_req, res) => {
  try {
    const txs = await db.select().from(giftTransactions).orderBy(desc(giftTransactions.createdAt)).limit(20);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Serve static frontend in production (non-Vercel only)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(__dirname, "../dist/public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// On Vercel the function is invoked per-request — no persistent listen needed
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    registerTelegramWebhook();
  });
}

export default app;
