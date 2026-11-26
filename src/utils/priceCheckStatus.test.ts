import { priceErrorKind, statusFromPriceError } from "./priceCheckStatus";

describe("statusFromPriceError", () => {
  it("reads the status code from an HTTP error", () => {
    expect(statusFromPriceError("HTTP 403")).toBe(403);
    expect(statusFromPriceError("HTTP 404")).toBe(404);
  });

  it("returns null for other errors and missing values", () => {
    expect(statusFromPriceError("no price found")).toBeNull();
    expect(statusFromPriceError("This operation was aborted")).toBeNull();
    expect(statusFromPriceError(undefined)).toBeNull();
  });
});

describe("priceErrorKind", () => {
  it.each(["HTTP 401", "HTTP 403", "HTTP 429"])("is blocked for %s", (error) => {
    expect(priceErrorKind(error)).toBe("blocked");
  });

  it.each(["HTTP 404", "HTTP 410"])("is gone for %s", (error) => {
    expect(priceErrorKind(error)).toBe("gone");
  });

  it("is noPrice when the page loaded but had no readable price", () => {
    expect(priceErrorKind("no price found")).toBe("noPrice");
  });

  it.each(["HTTP 500", "HTTP 503", "This operation was aborted", undefined])("is null for %s", (error) => {
    expect(priceErrorKind(error)).toBeNull();
  });
});
