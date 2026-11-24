import { WISHLIST_ITEM_DELETE_TEXT, WISHLIST_ITEM_VIEW_TEXT, WISHLIST_ON_SALE_TEXT } from "../../Constants";
import { useDeleteWishListItem } from "../../hooks/useVehicles";
import { formatPrice } from "../../lib/format";
import type { WishListItem } from "../../types/vehicle";

/** One wish list row: name, wanted and current price, a link, a delete button, and a price drop notice. */
export default function WishListItemCard({
  uid,
  vehicleId,
  item,
}: {
  uid: string;
  vehicleId: string;
  item: WishListItem;
}) {
  const remove = useDeleteWishListItem(uid);
  const onSale = item.currentPrice !== undefined && item.currentPrice < item.price;
  const saved = onSale ? item.price - item.currentPrice! : 0;
  const percentOff = onSale ? Math.round((saved / item.price) * 100) : 0;

  const deleteItem = () => {
    if (confirm(`Remove ${item.name} from the wish list?`)) {
      remove.mutate({ vehicleId, itemId: item.id });
    }
  };

  return (
    <li className="wishlist-item">
      <span className="wishlist-item-name">{item.name}</span>
      <span className={`wishlist-item-price${onSale ? " is-sale" : ""}`}>
        Original Price: {formatPrice(item.price)}
      </span>
      {item.currentPrice !== undefined && (
        <span className={`wishlist-item-current-price${onSale ? " is-sale" : ""}`}>
          Current Price: {formatPrice(item.currentPrice)}
        </span>
      )}
      <a className="wishlist-item-view" href={item.link} target="_blank" rel="noopener noreferrer">
        {WISHLIST_ITEM_VIEW_TEXT}
      </a>
      <button className="danger" onClick={deleteItem} disabled={remove.isPending}>
        {WISHLIST_ITEM_DELETE_TEXT}
      </button>
      {remove.isError && (
        <p className="wishlist-item-error" role="alert">
          Couldn't delete: {remove.error.message}
        </p>
      )}
      {onSale && (
        <p className="wishlist-item-sale-note" role="status">
          {WISHLIST_ON_SALE_TEXT} Save {formatPrice(saved)}
          {percentOff > 0 && ` (${percentOff}% off)`}
        </p>
      )}
    </li>
  );
}
