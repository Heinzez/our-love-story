import type { VercelRequest, VercelResponse } from "@vercel/node";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { primary_email, backup_email } = req.body ?? {};

  if (!primary_email) {
    return res.status(400).json({ error: "primary_email is required" });
  }

  try {
    await pool.query(
      `INSERT INTO email_subscribers (primary_email, backup_email) VALUES ($1, $2)`,
      [primary_email, backup_email ?? null]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("subscribe-email error:", err);
    return res.status(500).json({ error: "Failed to save email" });
  }
}
