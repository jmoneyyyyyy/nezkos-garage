import { COMING_SOON_TEXT, FUNDS_PAGE_TITLE } from "../../Constants";

export default function FundsPage() {
  return (
    <main className="placeholder-page">
      <h1 className="page-title">{FUNDS_PAGE_TITLE}</h1>
      <p className="list-status">{COMING_SOON_TEXT}</p>
    </main>
  );
}
