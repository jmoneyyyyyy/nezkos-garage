import { extractPrice, findPrice } from "./index.mjs";

const page = (...blocks) =>
  blocks.map((b) => `<script type="application/ld+json">${b}</script>`).join("\n");

describe("findPrice", () => {
  it("reads offers.price", () => {
    expect(findPrice({ offers: { price: "19.99" } })).toBe(19.99);
  });

  it("falls back to lowPrice", () => {
    expect(findPrice({ offers: { lowPrice: 5 } })).toBe(5);
  });

  it("walks @graph and arrays", () => {
    expect(findPrice({ "@graph": [{ "@type": "Org" }, { offers: [{ price: 0 }, { price: 42 }] }] })).toBe(42);
  });

  it("ignores zero, negative, and non-numeric prices", () => {
    expect(findPrice({ offers: { price: 0 } })).toBeNull();
    expect(findPrice({ offers: { price: -3 } })).toBeNull();
    expect(findPrice({ offers: { price: "free" } })).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(findPrice(null)).toBeNull();
    expect(findPrice("text")).toBeNull();
  });
});

describe("extractPrice", () => {
  it("pulls the price out of a JSON-LD script tag", () => {
    expect(extractPrice(page('{"offers":{"price":"89.50"}}'))).toBe(89.5);
  });

  it("skips malformed blocks and uses the next one", () => {
    expect(extractPrice(page("{not json", '{"offers":{"price":10}}'))).toBe(10);
  });

  it("returns null when there is no JSON-LD or no price", () => {
    expect(extractPrice("<html></html>")).toBeNull();
    expect(extractPrice(page('{"name":"thing"}'))).toBeNull();
  });
});
