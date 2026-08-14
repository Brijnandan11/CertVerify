import { Pool } from "pg";
import { env } from "./env";
import { logger } from "./logger";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected PG pool error");
});

export async function query<T = any>(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  logger.debug({ text, duration: Date.now() - start, rows: res.rowCount }, "db query");
  return res as unknown as { rows: T[]; rowCount: number };
}
