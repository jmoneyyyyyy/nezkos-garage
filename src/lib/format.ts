export const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
