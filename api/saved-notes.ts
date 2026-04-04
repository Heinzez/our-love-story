import type { VercelRequest, VercelResponse } from "@vercel/node";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const result = await pool.query(
        `SELECT id, text, date FROM saved_notes ORDER BY created_at DESC`
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("saved-notes GET error:", err);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
  }

  if (req.method === "POST") {
    const { id, text, date } = req.body ?? {};

    if (!text || !date) {
      return res.status(400).json({ error: "text and date are required" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO saved_notes (id, text, date)
         VALUES (COALESCE($1, gen_random_uuid()), $2, $3)
         RETURNING id, text, date`,
        [id ?? null, text, date]
      );
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("saved-notes POST error:", err);
      return res.status(500).json({ error: "Failed to save note" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
