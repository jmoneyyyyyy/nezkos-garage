import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats as USD", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
  });

  it("handles whole and zero amounts", () => {
    expect(formatPrice(20)).toBe("$20.00");
    expect(formatPrice(0)).toBe("$0.00");
  });
});
