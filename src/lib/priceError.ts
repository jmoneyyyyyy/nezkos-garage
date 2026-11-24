// Status codes sites use to refuse automated requests: unauthorized, forbidden, page gone, rate limited.
const BLOCKED_STATUS_CODES = [401, 403, 404, 410, 429];

/** The checker saves failed fetches as e.g. "HTTP 403"; returns that status code, or null for other errors. */
export function statusFromPriceError(priceError?: string): number | null {
  const match = priceError?.match(/^HTTP (\d{3})\b/);
  return match ? Number(match[1]) : null;
}

/** True when the site refused the price checker rather than the page simply failing to load. */
export function isPriceCheckBlocked(priceError?: string): boolean {
  const status = statusFromPriceError(priceError);
  return status !== null && BLOCKED_STATUS_CODES.includes(status);
}
