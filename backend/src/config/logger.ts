import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.password_hash", "*.token"],
});
