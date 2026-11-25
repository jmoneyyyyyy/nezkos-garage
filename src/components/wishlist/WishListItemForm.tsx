import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useAddWishListItem } from "../../hooks/useVehicles";
import { REQUIRED_FIELD } from "../../Constants";

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
      return setError("Product name, product link, and price are required.");
    }
    if (!isHttpUrl(link)) {
      return setError("Product link must be a valid web address starting with http:// or https://.");
    }
    if (!Number.isFinite(price) || price < 0) {
      return setError("Price must be 0 or more.");
    }

    setError(null);
    add.mutate({ vehicleId, input: { name, link, price } }, { onSuccess: onSaved });
  };

  return (
    <form onSubmit={submit}>
      <h2>Add wish list item</h2>
      <div className="form-fields">
        <label>
          Product name *
          <input aria-required value={form.name} onChange={set("name")} />
        </label>
        <label>
          Product link *
          <input placeholder="https://..." aria-required inputMode="url" value={form.link} onChange={set("link")} />
        </label>
        <label>
          Price *
          <input aria-required inputMode="decimal" value={form.price} onChange={set("price")} />
        </label>
      </div>
      <button type="submit" disabled={add.isPending}>
        {add.isPending ? "Saving..." : "Add item"}
      </button>
      <p className="muted">{REQUIRED_FIELD}</p>
      {error && <p role="alert">{error}</p>}
      {add.error && <p role="alert">Couldn't save: {add.error.message}</p>}
    </form>
  );
}
