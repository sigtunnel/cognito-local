import { expect, it } from "vitest";

// vitest has no public getter for the hooks' limit: its worker state holds the project's resolved
// config, which beforeEach and afterEach read when no timeout is passed.
const hookTimeout = () =>
  (globalThis as any).__vitest_worker__.config.hookTimeout;

// The longer timeouts in vitest.config.mts are for the integration tests alone: unit tests keep
// vitest's defaults, 5 s for a test and 10 s for a hook.
it("runs with vitest's default timeouts", ({ task }) => {
  expect(task.timeout).toBe(5_000);
  expect(hookTimeout()).toBe(10_000);
});
