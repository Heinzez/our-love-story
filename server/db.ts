import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Lazy initialization — avoids crashing at module load time on serverless
let _pool: pg.Pool | undefined;
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Add it to your Vercel project environment variables."
      );
    }
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3, // keep pool small for serverless
    });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

// Proxy so all existing `db.select(...)` call sites work unchanged
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { _pool as pool };
