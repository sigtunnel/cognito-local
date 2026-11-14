import { expect, it } from "vitest";

// vitest has no public getter for the hooks' limit: its worker state holds the project's resolved
// config, which beforeEach and afterEach read when no timeout is passed.
const hookTimeout = () =>
  (globalThis as any).__vitest_worker__.config.hookTimeout;

// vitest.config.mts gives the integration tests and their hooks 20 s, for slow disks such as a
// Raspberry Pi's.
it("runs with the integration tests' 20 s timeouts", ({ task }) => {
  expect(task.timeout).toBe(20_000);
  expect(hookTimeout()).toBe(20_000);
});
