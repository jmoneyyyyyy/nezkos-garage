import LoanCalculator from "../components/funds/LoanCalculator";
import { FUNDS_PAGE_TITLE } from "../Constants";

export default function FundsPage() {
  return (
    <main>
      <h1 className="page-title">{FUNDS_PAGE_TITLE}</h1>
      <LoanCalculator />
    </main>
  );
}
