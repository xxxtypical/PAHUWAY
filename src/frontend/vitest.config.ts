import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Test-only Vite config. Mirrors the `@` and `declarations` aliases from
 * `vite.config.js` so tests import the same modules the app does, without
 * pulling in the environment plugin (which expects a canister id at build
 * time). The DOM environment is supplied by the `test` script flag.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    // The build container sets a thread-pool range that conflicts with
    // Vitest's defaults; pin a single fork so the suite runs deterministically.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
