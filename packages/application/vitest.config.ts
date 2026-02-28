import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@trekmind/domain": path.resolve(__dirname, "../domain/src/index.ts"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts"],
    exclude: ["dist", "node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.d.ts"],
    },
  },
});
