import { useState } from "react";
import ConfirmModal from "../common/ConfirmModal";
import Modal from "../common/Modal";
import WishListItemForm from "./WishListItemForm";
import {
  COULDNT_DELETE_TEXT,
  DELETE_BUTTON_TEXT,
  EDIT_BUTTON_TEXT,
  WISHLIST_ITEM_VIEW_TEXT,
  WISHLIST_NOT_CHECKED_TEXT,
  WISHLIST_NO_PRICE_FOUND_TEXT,
  WISHLIST_PAGE_GONE_TEXT,
  WISHLIST_PRICE_CHECK_BLOCKED_TEXT,
  WISHLIST_TARGET_PRICE_LABEL,
  confirmRemoveWishListItemText,
  wishListCheckedText,
  wishListLastTriedText,
  wishListSavingsText,
} from "../../Constants";
import { useDeleteWishListItem } from "../../hooks/useWishlist";
import { formatCheckedDate, formatPrice } from "../../utils/formatters";
import { priceErrorKind } from "../../utils/priceCheckStatus";
import type { PriceErrorKind } from "../../utils/priceCheckStatus";
import type { WishListItem } from "../../types/wishlist";

const ERROR_TEXT: Record<PriceErrorKind, string> = {
  blocked: WISHLIST_PRICE_CHECK_BLOCKED_TEXT,
  gone: WISHLIST_PAGE_GONE_TEXT,
  noPrice: WISHLIST_NO_PRICE_FOUND_TEXT,
};

/** One wish list row: name, a status line (target, savings, last check), the price, a link, and a delete button. */
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const onSale = item.currentPrice !== undefined && item.currentPrice < item.price;
  const saved = onSale ? item.price - item.currentPrice! : 0;
  const percentOff = onSale ? Math.round((saved / item.price) * 100) : 0;

  const errorKind = priceErrorKind(item.priceError);
  const checkedDate = formatCheckedDate(item.lastCheckedAt);

  const deleteItem = () => {
    setConfirmingDelete(false);
    remove.mutate({ vehicleId, itemId: item.id });
  };

  return (
    <li className="wishlist-item">
      <div className="wishlist-item-info">
        <span className="wishlist-item-name">{item.name}</span>
        {errorKind ? (
          <p className="wishlist-item-meta is-error" role="alert">
            {ERROR_TEXT[errorKind]}
            {checkedDate && ` · ${wishListLastTriedText(checkedDate)}`}
          </p>
        ) : (
          <p className="wishlist-item-meta">
            {WISHLIST_TARGET_PRICE_LABEL} {formatPrice(item.price)}
            {onSale && (
              <>
                {" · "}
                <span className="is-sale">{wishListSavingsText(formatPrice(saved), percentOff)}</span>
              </>
            )}
            {" · "}
            {checkedDate ? wishListCheckedText(checkedDate) : WISHLIST_NOT_CHECKED_TEXT}
          </p>
        )}
      </div>
      <span className={`wishlist-item-price${onSale ? " is-sale" : ""}`}>
        {formatPrice(item.currentPrice ?? item.price)}
      </span>
      <a className="wishlist-item-view" href={item.link} target="_blank" rel="noopener noreferrer">
        {WISHLIST_ITEM_VIEW_TEXT}
      </a>
      <button onClick={() => setEditing(true)}>{EDIT_BUTTON_TEXT}</button>
      <button className="danger" onClick={() => setConfirmingDelete(true)} disabled={remove.isPending}>
        {DELETE_BUTTON_TEXT}
      </button>
      <Modal open={editing} onClose={() => setEditing(false)}>
        {editing && (
          <WishListItemForm uid={uid} vehicleId={vehicleId} item={item} onSaved={() => setEditing(false)} />
        )}
      </Modal>
      <ConfirmModal
        open={confirmingDelete}
        message={confirmRemoveWishListItemText(item.name)}
        confirmLabel={DELETE_BUTTON_TEXT}
        onConfirm={deleteItem}
        onCancel={() => setConfirmingDelete(false)}
      />
      {remove.isError && (
        <p className="wishlist-item-error" role="alert">
          {COULDNT_DELETE_TEXT}: {remove.error.message}
        </p>
      )}
    </li>
  );
}
