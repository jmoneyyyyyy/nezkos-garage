import { arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { vehicleCollection } from "../lib/firebase";
import { newId } from "../utils/newId";
import type { NewWishListItemInput, WishListItem } from "../types/vehicle";
import { editVehicleList } from "./vehicles";

const editWishList = (vehicleId: string, edit: (items: WishListItem[]) => WishListItem[]) =>
  editVehicleList(vehicleId, "wishlist", edit);

export async function addWishListItem(vehicleId: string, input: NewWishListItemInput) {
  await updateDoc(doc(vehicleCollection, "vehicles", vehicleId), {
    wishlist: arrayUnion({ id: newId(), ...input }),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWishListItem(vehicleId: string, item: WishListItem) {
  await editWishList(vehicleId, (items) =>
    items.map((existing) => {
      if (existing.id !== item.id) return existing;

      // The link changed, so the old price no longer applies; let the next check refill it.
      if (existing.link !== item.link) return item;

      // Otherwise keep what the price checker wrote (omit undefined; Firestore rejects it).
      return {
        ...item,
        ...(existing.currentPrice !== undefined ? { currentPrice: existing.currentPrice } : {}),
        ...(existing.lastCheckedAt !== undefined ? { lastCheckedAt: existing.lastCheckedAt } : {}),
        ...(existing.priceError !== undefined ? { priceError: existing.priceError } : {}),
      };
    })
  );
}

export async function deleteWishListItem(vehicleId: string, itemId: string) {
  await editWishList(vehicleId, (items) => items.filter((existing) => existing.id !== itemId));
}
