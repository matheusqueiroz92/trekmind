import path from "path";
import { config } from "dotenv";

// Load .env from monorepo root so DATABASE_URL is available
config({ path: path.resolve(__dirname, "../../.env") });

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;