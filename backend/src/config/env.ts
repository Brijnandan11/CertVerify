import "dotenv/config";
import path from "path";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "http://localhost:4000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  // Directory holding the built frontend. Defaults to the repo's frontend/dist
  // when running from the backend folder; override in Docker via FRONTEND_DIST_PATH.
  frontendDistPath:
    process.env.FRONTEND_DIST_PATH ?? path.resolve(__dirname, "../../../frontend/dist"),
};
