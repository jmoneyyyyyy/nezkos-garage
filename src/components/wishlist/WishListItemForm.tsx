import { useState, type SyntheticEvent } from "react";
import DialogHeading from "../common/DialogHeading";
import FormActions from "../common/FormActions";
import { FormFieldGrid, FormStack } from "../common/FormLayout";
import FormTextField from "../common/FormTextField";
import { useFormState } from "../../hooks/useFormState";
import { useAddWishListItem, useUpdateWishListItem } from "../../hooks/useWishlist";
import type { WishListItem } from "../../types/wishlist";
import {
  ADD_WISHLIST_ITEM_BUTTON_TEXT,
  ADD_WISHLIST_ITEM_TITLE,
  EDIT_WISHLIST_ITEM_TITLE,
  PRICE_INVALID_ERROR,
  REQUIRED_FIELD,
  SAVE_CHANGES_BUTTON_TEXT,
  WISHLIST_LINK_INVALID_ERROR,
  WISHLIST_LINK_PLACEHOLDER,
  WISHLIST_PRICE_LABEL,
  WISHLIST_PRODUCT_LINK_LABEL,
  WISHLIST_PRODUCT_NAME_LABEL,
  WISHLIST_REQUIRED_FIELDS_ERROR,
  wishListPriceBelowCurrentError,
} from "../../Constants";
import { formatPrice } from "../../utils/formatters";

type WishListItemFormProps = { uid: string; vehicleId: string; item?: WishListItem; onSaved: () => void };

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export default function WishListItemForm({ uid, vehicleId, item, onSaved }: WishListItemFormProps) {
  const [form, set] = useFormState({
    name: item?.name ?? "",
    link: item?.link ?? "",
    price: item ? String(item.price) : "",
  });
  const [error, setError] = useState<string | null>(null);
  const add = useAddWishListItem(uid);
  const update = useUpdateWishListItem(uid);
  const isPending = add.isPending || update.isPending;
  const saveError = add.error ?? update.error;

  //SyntheticEvent is used here to prevent the default form submission behavior
  //It wraps around the browser's native event and provides a consistent interface across different browsers
  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const link = form.link.trim();
    const price = form.price.trim() === "" ? NaN : Number(form.price);

    if (!name || !link || form.price.trim() === "") {
      return setError(WISHLIST_REQUIRED_FIELDS_ERROR);
    }
    if (!isHttpUrl(link)) {
      return setError(WISHLIST_LINK_INVALID_ERROR);
    }
    if (!Number.isFinite(price) || price < 0) {
      return setError(PRICE_INVALID_ERROR);
    }

    // A changed link clears the checked price, so only guard against it when the link is unchanged.
    if (item?.currentPrice !== undefined && link === item.link && price < item.currentPrice) {
      return setError(wishListPriceBelowCurrentError(formatPrice(item.currentPrice)));
    }

    setError(null);
    if (item) {
      // Only the editable fields; the service keeps or clears the checker's fields.
      update.mutate({ vehicleId, item: { id: item.id, name, link, price } }, { onSuccess: onSaved });
    } else {
      add.mutate({ vehicleId, input: { name, link, price } }, { onSuccess: onSaved });
    }
  };

  return (
    <FormStack onSubmit={submit}>
      <DialogHeading>{item ? EDIT_WISHLIST_ITEM_TITLE : ADD_WISHLIST_ITEM_TITLE}</DialogHeading>
      <FormFieldGrid>
        <FormTextField label={WISHLIST_PRODUCT_NAME_LABEL} required value={form.name} onChange={set("name")} />
        <FormTextField
          label={WISHLIST_PRODUCT_LINK_LABEL}
          placeholder={WISHLIST_LINK_PLACEHOLDER}
          required
          inputMode="url"
          value={form.link}
          onChange={set("link")}
        />
        <FormTextField
          label={WISHLIST_PRICE_LABEL}
          required
          inputMode="decimal"
          value={form.price}
          onChange={set("price")}
        />
      </FormFieldGrid>
      <FormActions
        isPending={isPending}
        label={item ? SAVE_CHANGES_BUTTON_TEXT : ADD_WISHLIST_ITEM_BUTTON_TEXT}
        note={REQUIRED_FIELD}
        notePosition="after"
        error={error}
        saveError={saveError}
      />
    </FormStack>
  );
}
