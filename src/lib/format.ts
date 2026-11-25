export const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const formatMileage = (miles: number) => `${miles.toLocaleString()} mi`;

/** Maintenance dates are stored as "YYYY-MM-DD"; build a local date so no timezone shifts the day. */
export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString();
}

export const formatCost = (cost: number) =>
  cost.toLocaleString(undefined, { style: "currency", currency: "USD" });
