import { COMING_SOON_TEXT, WISHLIST_PAGE_TITLE } from "../Constants";

export default function WishListPage() {
  return (
    <main className="placeholder-page">
      <h1 className="page-title">{WISHLIST_PAGE_TITLE}</h1>
      <p className="list-status">{COMING_SOON_TEXT}</p>
    </main>
  );
}
