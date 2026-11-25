import { addWishListItem, deleteWishListItem, updateWishListItem } from "../services/wishlist";
import type { NewWishListItemInput, WishListItem } from "../types/wishlist";
import { useVehicleMutation } from "./useVehicles";

export function useAddWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, input }: { vehicleId: string; input: NewWishListItemInput }) =>
    addWishListItem(vehicleId, input)
  );
}

export function useUpdateWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, item }: { vehicleId: string; item: WishListItem }) =>
    updateWishListItem(vehicleId, item)
  );
}

export function useDeleteWishListItem(uid: string) {
  return useVehicleMutation(uid, ({ vehicleId, itemId }: { vehicleId: string; itemId: string }) =>
    deleteWishListItem(vehicleId, itemId)
  );
}
