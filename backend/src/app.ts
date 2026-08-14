import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import apiRoutes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1", apiRoutes);

// Serve the built frontend so a single URL (PUBLIC_APP_URL) runs the whole app.
if (fs.existsSync(env.frontendDistPath)) {
  app.use(express.static(env.frontendDistPath));
  // SPA fallback: any non-API GET route renders index.html for client-side routing.
  app.get(/^\/(?!api|health).*/, (req, res) => {
    res.sendFile(path.join(env.frontendDistPath, "index.html"));
  });
} else {
  logger.warn(
    { frontendDistPath: env.frontendDistPath },
    "Frontend build not found — API-only mode. Build the frontend first (cd frontend && npm run build)."
  );
}

app.use(notFoundHandler);
app.use(errorHandler);
