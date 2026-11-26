import { describe, expect, it } from "vitest";
import { linePath, monthTicks, niceStep, niceTicks } from "./chartScale";

describe("niceStep", () => {
  it("picks round steps", () => {
    expect(niceStep(400, 4)).toBe(100);
    expect(niceStep(387, 4)).toBe(100);
    expect(niceStep(60, 6)).toBe(10);
    expect(niceStep(1000, 4)).toBe(250);
  });

  it("falls back to 1 for a non-positive range", () => {
    expect(niceStep(0, 4)).toBe(1);
  });
});

describe("niceTicks", () => {
  it("starts at 0 and ends at or above max", () => {
    const ticks = niceTicks(387, 4);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(387);
    expect(ticks).toEqual([0, 100, 200, 300, 400]);
  });
});

describe("monthTicks", () => {
  it("stays within the term", () => {
    expect(monthTicks(60, 6)).toEqual([10, 20, 30, 40, 50, 60]);
    expect(monthTicks(1, 5)).toEqual([1]);
    expect(Math.max(...monthTicks(360, 6))).toBeLessThanOrEqual(360);
  });
});

describe("linePath", () => {
  it("builds an SVG path", () => {
    expect(linePath([{ x: 0, y: 1 }, { x: 2.25, y: 3 }])).toBe("M0.0 1.0 L2.3 3.0");
  });
});
