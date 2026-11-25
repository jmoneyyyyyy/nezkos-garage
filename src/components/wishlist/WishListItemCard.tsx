import {
  COULDNT_DELETE_TEXT,
  DELETE_BUTTON_TEXT,
  WISHLIST_CURRENT_PRICE_LABEL,
  WISHLIST_ITEM_VIEW_TEXT,
  WISHLIST_ON_SALE_TEXT,
  WISHLIST_ORIGINAL_PRICE_LABEL,
  WISHLIST_PAGE_GONE_TEXT,
  WISHLIST_PRICE_CHECK_BLOCKED_TEXT,
  confirmRemoveWishListItemText,
  wishListSavingsText,
} from "../../Constants";
import { useDeleteWishListItem } from "../../hooks/useVehicles";
import { formatPrice } from "../../utils/format";
import { priceErrorKind } from "../../utils/priceError";
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

  const errorKind = priceErrorKind(item.priceError);

  const deleteItem = () => {
    if (confirm(confirmRemoveWishListItemText(item.name))) {
      remove.mutate({ vehicleId, itemId: item.id });
    }
  };

  return (
    <li className="wishlist-item">
      <span className="wishlist-item-name">{item.name}</span>
      <span className={`wishlist-item-price${onSale ? " is-sale" : ""}`}>
        {WISHLIST_ORIGINAL_PRICE_LABEL} {formatPrice(item.price)}
      </span>
      {item.currentPrice !== undefined && (
        <span className={`wishlist-item-current-price${onSale ? " is-sale" : ""}`}>
          {WISHLIST_CURRENT_PRICE_LABEL} {formatPrice(item.currentPrice)}
        </span>
      )}
      <a className="wishlist-item-view" href={item.link} target="_blank" rel="noopener noreferrer">
        {WISHLIST_ITEM_VIEW_TEXT}
      </a>
      <button className="danger" onClick={deleteItem} disabled={remove.isPending}>
        {DELETE_BUTTON_TEXT}
      </button>
      {remove.isError && (
        <p className="wishlist-item-error" role="alert">
          {COULDNT_DELETE_TEXT}: {remove.error.message}
        </p>
      )}
      {errorKind && (
        <p className="wishlist-item-blocked" role="alert">
          {errorKind === "gone" ? WISHLIST_PAGE_GONE_TEXT : WISHLIST_PRICE_CHECK_BLOCKED_TEXT}
        </p>
      )}
      {onSale && (
        <p className="wishlist-item-sale-note" role="status">
          {WISHLIST_ON_SALE_TEXT} {wishListSavingsText(formatPrice(saved), percentOff)}
        </p>
      )}
    </li>
  );
}
