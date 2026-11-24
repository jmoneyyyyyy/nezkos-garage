import { MAINTENANCE_LABELS, MAINTENANCE_TYPES } from "./vehicle";

describe("maintenance types", () => {
  it("has a non-empty label for every type", () => {
    for (const type of MAINTENANCE_TYPES) {
      expect(MAINTENANCE_LABELS[type]).toBeTruthy();
    }
  });

  it("has no labels for unknown types", () => {
    expect(Object.keys(MAINTENANCE_LABELS).sort()).toEqual([...MAINTENANCE_TYPES].sort());
  });
});
