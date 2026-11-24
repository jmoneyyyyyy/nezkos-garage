import AddWishListItemModal from "./AddWishListItemModal";
import { NO_WISHLIST_ITEMS_TEXT, WISHLIST_ITEM_VIEW_TEXT } from "../../Constants";
import type { Vehicle } from "../../types/vehicle";
import "./wishlist.css";

const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/** One vehicle's wish list: its items, a count and total, and an Add item button. */
export default function WishListSection({ uid, vehicle }: { uid: string; vehicle: Vehicle }) {
  const items = vehicle.wishlist ?? [];
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="wishlist-section">
      <header className="wishlist-section-header">
        <h2>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <span className="wishlist-section-summary">
          {items.length} {items.length === 1 ? "item" : "items"}, {formatPrice(total)} total
        </span>
        <AddWishListItemModal uid={uid} vehicleId={vehicle.id} />
      </header>
      {items.length === 0 ? (
        <p className="wishlist-empty">{NO_WISHLIST_ITEMS_TEXT}</p>
      ) : (
        <ul className="wishlist-items">
          {items.map((item) => (
            <li key={item.id} className="wishlist-item">
              <span className="wishlist-item-name">{item.name}</span>
              <span className="wishlist-item-price">{formatPrice(item.price)}</span>
              <a className="wishlist-item-view" href={item.link} target="_blank" rel="noopener noreferrer">
                {WISHLIST_ITEM_VIEW_TEXT}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
