import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { runMigrations } from "./db/migrate";

async function start() {
  await runMigrations();
  app.listen(env.port, () => {
    logger.info(`certverify backend listening on port ${env.port}`);
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
