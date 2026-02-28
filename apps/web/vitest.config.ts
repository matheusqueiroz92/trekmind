import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.spec.ts", "**/*.spec.tsx"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["app/**/*.ts", "lib/**/*.ts", "proxy.ts"],
      exclude: ["**/*.spec.ts", "**/*.d.ts", ".next/**"],
    },
  },
});
