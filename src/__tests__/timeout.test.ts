import { expect, it } from "vitest";

// The longer timeout in vitest.config.mts is for the integration tests alone: unit tests keep 5 s.
it("runs with vitest's default 5 s timeout", ({ task }) => {
  expect(task.timeout).toBe(5_000);
});
