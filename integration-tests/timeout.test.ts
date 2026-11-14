import { expect, it } from "vitest";

// vitest.config.mts gives the integration tests 20 s, for slow disks such as a Raspberry Pi's.
it("runs with the integration tests' 20 s timeout", ({ task }) => {
  expect(task.timeout).toBe(20_000);
});
