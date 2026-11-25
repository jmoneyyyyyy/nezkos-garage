// Status codes sites use to refuse automated requests: unauthorized, forbidden, rate limited.
const BLOCKED_STATUS_CODES = [401, 403, 429];
// Status codes meaning the page itself is gone: not found, gone.
const GONE_STATUS_CODES = [404, 410];

export type PriceErrorKind = "blocked" | "gone";

/** The checker saves failed fetches as e.g. "HTTP 403"; returns that status code, or null for other errors. */
export function statusFromPriceError(priceError?: string): number | null {
  const match = priceError?.match(/^HTTP (\d{3})\b/);
  return match ? Number(match[1]) : null;
}

/** Why a check failed, if the status code says so: the site refused the checker, or the page is gone. */
export function priceErrorKind(priceError?: string): PriceErrorKind | null {
  const status = statusFromPriceError(priceError);
  if (status === null) return null;
  if (BLOCKED_STATUS_CODES.includes(status)) return "blocked";
  if (GONE_STATUS_CODES.includes(status)) return "gone";
  return null;
}
