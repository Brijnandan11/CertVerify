import fs from "fs";
import path from "path";
import { pool } from "../config/db";
import { logger } from "../config/logger";

/**
 * Runs pending SQL migrations (once per file, tracked in schema_migrations).
 * Safe to call on every server start — already-applied files are skipped.
 */
export async function runMigrations() {
  const dir = path.join(__dirname, "migrations");
  if (!fs.existsSync(dir)) {
    logger.warn({ dir }, "Migrations directory not found — skipping");
    return;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       filename TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`
  );
  const { rows } = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations"
  );
  const applied = new Set(rows.map((r) => r.filename));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    logger.info(`Running migration: ${file}`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  logger.info("Migrations complete");
}

// CLI entry point (npm run migrate)
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      logger.error({ err }, "Migration failed");
      process.exit(1);
    });
}
