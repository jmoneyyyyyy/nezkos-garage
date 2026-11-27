import { describe, expect, it } from "vitest";
import { parseUpcoming } from "./upcomingMaintenance";

const expected = [
  { type: "Oil change", due: "due at ~30,000 mi (about 3,400 mi from now)" },
  { type: "Brake fluid", due: "due by ~3 years from purchase (every 3 years, no mileage trigger)" },
  { type: "Tire rotation", due: "due at ~30,000 mi (about 3,400 mi from now)" },
];

describe("parseUpcoming", () => {
  it("parses a run-on single-line reply", () => {
    const reply =
      "- **Oil change:** due at ~30,000 mi (about 3,400 mi from now) - **Brake fluid:** due by ~3 years from purchase (every 3 years, no mileage trigger) - **Tire rotation:** due at ~30,000 mi (about 3,400 mi from now)";
    expect(parseUpcoming(reply)).toEqual(expected);
  });

  it("parses a multi-line bullet list", () => {
    const reply = expected.map((i) => `- **${i.type}:** ${i.due}`).join("\n");
    expect(parseUpcoming(reply)).toEqual(expected);
  });

  it("handles the colon outside the bold markers", () => {
    expect(parseUpcoming("- **Oil change**: due soon")).toEqual([{ type: "Oil change", due: "due soon" }]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(parseUpcoming("")).toEqual([]);
    expect(parseUpcoming("Nothing is due.")).toEqual([]);
  });
});
