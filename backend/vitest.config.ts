import { defineConfig } from "vitest/config";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
process.env.JWT_ACCESS_SECRET ??= "test_access_secret_at_least_32_chars_long";
process.env.JWT_REFRESH_SECRET ??= "test_refresh_secret_at_least_32_chars_long";

export default defineConfig({ test: { environment: "node" } });
