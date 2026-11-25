export const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const formatMileage = (miles: number) => `${miles.toLocaleString()} mi`;
