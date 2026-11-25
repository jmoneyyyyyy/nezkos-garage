export interface WishListItem {
  id: string;
  name: string;
  link: string;
  price: number;
  currentPrice?: number;
  lastCheckedAt?: string;
  priceError?: string;
}

export type NewWishListItemInput = Omit<WishListItem, "id" | "currentPrice" | "lastCheckedAt" | "priceError">;
