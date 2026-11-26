import WishListSection from "./WishListSection";
import { useVehicles } from "../../hooks/useVehicles";
import {
  COULDNT_LOAD_VEHICLES_TEXT,
  LOADING_VEHICLES_TEXT,
  NO_WISHLIST_ITEMS_TEXT,
  WISHLIST_CHECK_FREQUENCY_TEXT,
} from "../../Constants";

/** A wish list section for every vehicle in the garage. */
export default function WishList({ uid }: { uid: string }) {
  const { data, isLoading, isError } = useVehicles(uid);

  if (isLoading) return <p className="list-status">{LOADING_VEHICLES_TEXT}</p>;
  if (isError) return <p role="alert" className="list-status">{COULDNT_LOAD_VEHICLES_TEXT}</p>;
  if (!data?.length) return <p className="list-status">{NO_WISHLIST_ITEMS_TEXT}</p>;

  return (
    <div className="wishlist-list">
      <p className="wishlist-note">{WISHLIST_CHECK_FREQUENCY_TEXT}</p>
      {data.map((v) => (
        <WishListSection key={v.id} uid={uid} vehicle={v} />
      ))}
    </div>
  );
}
