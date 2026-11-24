import { useAuth } from "../../hooks/useAuth";
import { WISHLIST_PAGE_TITLE } from "../../Constants";
import WishList from "./WishList";

export default function WishListPage() {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth guarantees a user; this narrows the type

  return (
    <main className="wishlist-page">
      <h1 className="page-title">{WISHLIST_PAGE_TITLE}</h1>
      <WishList uid={user.uid} />
    </main>
  );
}
