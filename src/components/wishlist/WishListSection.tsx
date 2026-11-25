import AddWishListItemModal from "./AddWishListItemModal";
import WishListItemCard from "./WishListItemCard";
import { NO_WISHLIST_ITEMS_TEXT } from "../../Constants";
import { formatPrice } from "../../lib/format";
import type { Vehicle } from "../../types/vehicle";
import "./wishlist.css";

/** One vehicle's wish list: its items, a count and total, and an Add item button. */
export default function WishListSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const items = vehicle.wishlist ?? [];
  // update to calculate total of items in wishlist, if currentPrice exists use that, otherwise use price
  const total = items.reduce((sum, item) => sum + (item.currentPrice ?? item.price), 0);
  const noWishListItems = items.length === 0;

  return (
    <section className="wishlist-section">
      <header className="wishlist-section-header">
        <h2>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <span className="wishlist-section-summary">
          {items.length} {items.length === 1 ? "item" : "items"}: {formatPrice(total)} total
        </span>
        <AddWishListItemModal uid={uid} vehicleId={vehicle.id} />
      </header>
      {noWishListItems ? (
        <p className="wishlist-empty">{NO_WISHLIST_ITEMS_TEXT}</p>
      ) : (
        <ul className="wishlist-items">
          {items.map((item) => (
            <WishListItemCard key={item.id} uid={uid} vehicleId={vehicle.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
