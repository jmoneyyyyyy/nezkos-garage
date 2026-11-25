import { newId } from "./id";

describe("newId", () => {
  it("returns 24 lowercase hex characters", () => {
    expect(newId()).toMatch(/^[0-9a-f]{24}$/);
  });

  it("does not repeat", () => {
    const ids = new Set(Array.from({ length: 1000 }, newId));
    expect(ids.size).toBe(1000);
  });
});
