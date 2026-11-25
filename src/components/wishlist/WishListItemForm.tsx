import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useAddWishListItem } from "../../hooks/useVehicles";
import {
  ADD_WISHLIST_ITEM_BUTTON_TEXT,
  ADD_WISHLIST_ITEM_TITLE,
  COULDNT_SAVE_TEXT,
  PRICE_INVALID_ERROR,
  REQUIRED_FIELD,
  SAVING_TEXT,
  WISHLIST_LINK_INVALID_ERROR,
  WISHLIST_LINK_PLACEHOLDER,
  WISHLIST_PRICE_LABEL,
  WISHLIST_PRODUCT_LINK_LABEL,
  WISHLIST_PRODUCT_NAME_LABEL,
  WISHLIST_REQUIRED_FIELDS_ERROR,
} from "../../Constants";

type WishListItemFormProps = { uid: string; vehicleId: string; onSaved: () => void };

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export default function WishListItemForm({ uid, vehicleId, onSaved }: WishListItemFormProps) {
  const [form, setForm] = useState({ name: "", link: "", price: "" });
  const [error, setError] = useState<string | null>(null);
  const add = useAddWishListItem(uid);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

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

    setError(null);
    add.mutate({ vehicleId, input: { name, link, price } }, { onSuccess: onSaved });
  };

  return (
    <form onSubmit={submit}>
      <h2>{ADD_WISHLIST_ITEM_TITLE}</h2>
      <div className="form-fields">
        <label>
          {WISHLIST_PRODUCT_NAME_LABEL}
          <input aria-required value={form.name} onChange={set("name")} />
        </label>
        <label>
          {WISHLIST_PRODUCT_LINK_LABEL}
          <input placeholder={WISHLIST_LINK_PLACEHOLDER} aria-required inputMode="url" value={form.link} onChange={set("link")} />
        </label>
        <label>
          {WISHLIST_PRICE_LABEL}
          <input aria-required inputMode="decimal" value={form.price} onChange={set("price")} />
        </label>
      </div>
      <button type="submit" disabled={add.isPending}>
        {add.isPending ? SAVING_TEXT : ADD_WISHLIST_ITEM_BUTTON_TEXT}
      </button>
      <p className="muted">{REQUIRED_FIELD}</p>
      {error && <p role="alert">{error}</p>}
      {add.error && <p role="alert">{COULDNT_SAVE_TEXT}: {add.error.message}</p>}
    </form>
  );
}
