import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./setupTests.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          exclude: [...configDefaults.exclude, "integration-tests/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          // Every test file under integration-tests (the default include, scanned from there).
          dir: "integration-tests",
          // These tests start a real server and save every change to a JSON file under /tmp. On the
          // lab's Raspberry Pis (2026-11-07) the same test took 0.2 s in one run and over 5 s in
          // another; the slowest that passed took 6.3 s with its hooks, and five went past vitest's
          // 5 s default. GitHub's runner took at most 0.8 s. 20 s is about three times that 6.3 s.
          // The unit tests write no files, stayed under 1 s per file on the Pis, and keep 5 s.
          testTimeout: 20_000,
        },
      },
    ],
  },
});
