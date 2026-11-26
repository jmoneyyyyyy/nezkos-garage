import { describe, expect, it } from "vitest";
import { balanceAfter, buildSchedule, findCrossover, monthlyPayment, totalInterest } from "./loan";

describe("monthlyPayment", () => {
  it("computes a standard amortized payment", () => {
    expect(monthlyPayment(20000, 6, 60)).toBeCloseTo(386.66, 2);
  });

  it("splits evenly at 0% APR", () => {
    expect(monthlyPayment(12000, 0, 48)).toBe(250);
  });

  it("returns 0 for invalid input", () => {
    expect(monthlyPayment(0, 6, 60)).toBe(0);
    expect(monthlyPayment(20000, -1, 60)).toBe(0);
    expect(monthlyPayment(20000, 6, 0)).toBe(0);
    expect(monthlyPayment(20000, 6, 12.5)).toBe(0);
    expect(monthlyPayment(NaN, 6, 60)).toBe(0);
  });
});

describe("buildSchedule", () => {
  const schedule = buildSchedule(20000, 6, 60);

  it("has one row per month and ends at a zero balance", () => {
    expect(schedule).toHaveLength(60);
    expect(schedule[59].balance).toBe(0);
  });

  it("charges first-month interest on the full principal", () => {
    expect(schedule[0].interest).toBeCloseTo(100, 2);
    expect(schedule[0].principal).toBeCloseTo(286.66, 2);
  });

  it("repays exactly the original principal", () => {
    const repaid = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(repaid).toBeCloseTo(20000, 6);
  });

  it("returns an empty schedule for invalid input", () => {
    expect(buildSchedule(0, 6, 60)).toEqual([]);
  });
});

describe("findCrossover", () => {
  it("is month 1 when principal already exceeds interest", () => {
    expect(findCrossover(buildSchedule(20000, 6, 60))).toBe(1);
  });

  it("finds a later month on a long, high-rate loan", () => {
    // $300k at 7% over 30 years: interest dominates early on.
    expect(findCrossover(buildSchedule(300000, 7, 360))).toBe(242);
  });

  it("is month 1 at 0% APR", () => {
    expect(findCrossover(buildSchedule(12000, 0, 48))).toBe(1);
  });

  it("is null for an empty schedule", () => {
    expect(findCrossover([])).toBeNull();
  });
});

describe("balanceAfter", () => {
  const schedule = buildSchedule(20000, 6, 60);

  it("is the full loan before any payment", () => {
    expect(balanceAfter(schedule, 0)).toBeCloseTo(20000, 6);
  });

  it("drops after each payment", () => {
    expect(balanceAfter(schedule, 1)).toBeCloseTo(20000 - schedule[0].principal, 6);
    expect(balanceAfter(schedule, 30)).toBeCloseTo(schedule[29].balance, 6);
  });

  it("is 0 at or past the term", () => {
    expect(balanceAfter(schedule, 60)).toBe(0);
    expect(balanceAfter(schedule, 999)).toBe(0);
  });

  it("is 0 for an empty schedule", () => {
    expect(balanceAfter([], 5)).toBe(0);
  });
});

describe("totalInterest", () => {
  it("sums interest across the schedule", () => {
    expect(totalInterest(buildSchedule(20000, 6, 60))).toBeCloseTo(3199.36, 2);
    expect(totalInterest(buildSchedule(12000, 0, 48))).toBe(0);
  });
});
