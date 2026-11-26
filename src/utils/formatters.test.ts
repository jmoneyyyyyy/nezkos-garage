import { formatCheckedDate, formatCost, formatDate, formatMileage, formatPrice } from "./formatters";

describe("formatPrice", () => {
  it("formats as USD", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
  });

  it("handles whole and zero amounts", () => {
    expect(formatPrice(20)).toBe("$20.00");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("formatMileage", () => {
  it("adds separators and the unit", () => {
    expect(formatMileage(135000)).toBe("135,000 mi");
  });
});

describe("formatCost", () => {
  it("formats as a dollar amount", () => {
    expect(formatCost(150)).toContain("150");
    expect(formatCost(150)).toContain("$");
  });
});

describe("formatDate", () => {
  it("keeps the calendar day instead of shifting it by timezone", () => {
    expect(formatDate("2026-07-13")).toBe(new Date(2026, 6, 13).toLocaleDateString());
    expect(formatDate("2026-01-01")).toBe(new Date(2026, 0, 1).toLocaleDateString());
  });
});

describe("formatCheckedDate", () => {
  it("formats an ISO timestamp as a local date", () => {
    const iso = "2026-11-26T15:30:00.000Z";
    expect(formatCheckedDate(iso)).toBe(new Date(iso).toLocaleDateString());
  });

  it("returns null when missing or unreadable", () => {
    expect(formatCheckedDate(undefined)).toBeNull();
    expect(formatCheckedDate("not a date")).toBeNull();
  });
});
