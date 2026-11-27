import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import AppDialog from "../common/AppDialog";
import DeleteWithConfirm from "../common/DeleteWithConfirm";
import ErrorAlert from "../common/ErrorAlert";
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
  const [editing, setEditing] = useState(false);
  const onSale = item.currentPrice !== undefined && item.currentPrice < item.price;
  const saved = onSale ? item.price - item.currentPrice! : 0;
  const percentOff = onSale ? Math.round((saved / item.price) * 100) : 0;

  const errorKind = priceErrorKind(item.priceError);
  const checkedDate = formatCheckedDate(item.lastCheckedAt);

  return (
    <ListItem
      disablePadding
      sx={{
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
        p: "14px 18px",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="span" sx={{ fontWeight: 700, color: "text.primary", overflowWrap: "anywhere" }}>
          {item.name}
        </Typography>
        {errorKind ? (
          <Typography role="alert" sx={{ mt: "2px", fontSize: 13, color: "error.main" }}>
            {ERROR_TEXT[errorKind]}
            {checkedDate && ` · ${wishListLastTriedText(checkedDate)}`}
          </Typography>
        ) : (
          <Typography sx={{ mt: "2px", fontSize: 13, color: "text.secondary" }}>
            {WISHLIST_TARGET_PRICE_LABEL} {formatPrice(item.price)}
            {onSale && (
              <>
                {" · "}
                <Typography component="span" sx={{ fontSize: "inherit", fontWeight: 600, color: "primary.light" }}>
                  {wishListSavingsText(formatPrice(saved), percentOff)}
                </Typography>
              </>
            )}
            {" · "}
            {checkedDate ? wishListCheckedText(checkedDate) : WISHLIST_NOT_CHECKED_TEXT}
          </Typography>
        )}
      </Box>
      <Typography
        component="span"
        data-testid="wishlist-item-price"
        data-on-sale={onSale}
        sx={{ fontWeight: 700, whiteSpace: "nowrap", color: onSale ? "primary.light" : "text.primary" }}
      >
        {formatPrice(item.currentPrice ?? item.price)}
      </Typography>
      <Button
        component="a"
        variant="outlined"
        size="small"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {WISHLIST_ITEM_VIEW_TEXT}
      </Button>
      <Button variant="outlined" size="small" onClick={() => setEditing(true)}>{EDIT_BUTTON_TEXT}</Button>
      <DeleteWithConfirm
        size="small"
        label={DELETE_BUTTON_TEXT}
        pendingLabel={DELETE_BUTTON_TEXT}
        message={confirmRemoveWishListItemText(item.name)}
        isPending={remove.isPending}
        onDelete={() => remove.mutate({ vehicleId, itemId: item.id })}
      />
      <AppDialog open={editing} onClose={() => setEditing(false)}>
        {editing && (
          <WishListItemForm uid={uid} vehicleId={vehicleId} item={item} onSaved={() => setEditing(false)} />
        )}
      </AppDialog>
      <ErrorAlert prefix={COULDNT_DELETE_TEXT} error={remove.error} sx={{ flex: "0 0 100%" }} />
    </ListItem>
  );
}
