import type { ChangeEvent } from "react";
import {
  LOAN_AMOUNT_INVALID_ERROR,
  LOAN_AMOUNT_LABEL,
  LOAN_APR_INVALID_ERROR,
  LOAN_APR_LABEL,
  LOAN_BALANCE_LEFT_LABEL,
  LOAN_CALCULATOR_TITLE,
  LOAN_EMPTY_TEXT,
  LOAN_MONTHLY_PAYMENT_LABEL,
  LOAN_PAYMENTS_INVALID_ERROR,
  LOAN_PAYMENTS_MADE_LABEL,
  LOAN_RESET_BUTTON_TEXT,
  LOAN_TERM_INVALID_ERROR,
  LOAN_TERM_LABEL,
  LOAN_TOTAL_INTEREST_LABEL,
} from "../../Constants";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import { formatPrice } from "../../utils/formatters";
import {
  balanceAfter,
  buildSchedule,
  findCrossover,
  loanInputValidity,
  totalInterest,
} from "../../utils/loan";
import AmortizationChart from "./AmortizationChart";
import "./funds.css";

const STORAGE_KEY = "nezkos-garage:loan-calculator";
const EMPTY_FORM = { amount: "", apr: "", term: "", paymentsMade: "0" };
type LoanForm = typeof EMPTY_FORM;

const isLoanForm = (value: unknown): value is LoanForm =>
  typeof value === "object" &&
  value !== null &&
  Object.keys(EMPTY_FORM).every((k) => typeof (value as Record<string, unknown>)[k] === "string");

// Commas, spaces and a $ are ignored so "20,000" and "$20000" work.
const parse = (value: string) => {
  const cleaned = value.replace(/[,$\s]/g, "");
  return cleaned === "" ? NaN : Number(cleaned);
};

export default function LoanCalculator() {
  const [form, setForm] = useLocalStorageState(STORAGE_KEY, EMPTY_FORM, isLoanForm);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const amount = parse(form.amount);
  const apr = parse(form.apr);
  const term = parse(form.term);
  // A blank payments-made field means none made yet.
  const paymentsMade = form.paymentsMade.trim() === "" ? 0 : parse(form.paymentsMade);

  const valid = loanInputValidity(amount, apr, term, paymentsMade);

  // Only complain about a field once something has been typed in it.
  const touched = (value: string) => value.trim() !== "";
  const errors: string[] = [];
  if (touched(form.amount) && !valid.amount) errors.push(LOAN_AMOUNT_INVALID_ERROR);
  if (touched(form.apr) && !valid.apr) errors.push(LOAN_APR_INVALID_ERROR);
  if (touched(form.term) && !valid.term) errors.push(LOAN_TERM_INVALID_ERROR);
  if (!valid.paymentsMade) errors.push(LOAN_PAYMENTS_INVALID_ERROR);

  const ready = valid.amount && valid.apr && valid.term && valid.paymentsMade;
  const schedule = ready ? buildSchedule(amount, apr, term) : [];

  return (
    <section className="loan-calculator">
      <h2>{LOAN_CALCULATOR_TITLE}</h2>
      <form className="loan-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {LOAN_AMOUNT_LABEL}
          <input inputMode="decimal" value={form.amount} onChange={set("amount")} />
        </label>
        <label>
          {LOAN_APR_LABEL}
          <input inputMode="decimal" value={form.apr} onChange={set("apr")} />
        </label>
        <label>
          {LOAN_TERM_LABEL}
          <input inputMode="numeric" value={form.term} onChange={set("term")} />
        </label>
        <label>
          {LOAN_PAYMENTS_MADE_LABEL}
          <input inputMode="numeric" value={form.paymentsMade} onChange={set("paymentsMade")} />
        </label>
        <button type="button" className="loan-reset" onClick={() => setForm(EMPTY_FORM)}>
          {LOAN_RESET_BUTTON_TEXT}
        </button>
      </form>

      {errors.map((message) => (
        <p key={message} role="alert">
          {message}
        </p>
      ))}

      {ready ? (
        <>
          <dl className="loan-results">
            <div>
              <dt>{LOAN_MONTHLY_PAYMENT_LABEL}</dt>
              <dd>{formatPrice(schedule[0].payment)}</dd>
            </div>
            <div>
              <dt>{LOAN_BALANCE_LEFT_LABEL}</dt>
              <dd>{formatPrice(balanceAfter(schedule, paymentsMade))}</dd>
            </div>
            <div>
              <dt>{LOAN_TOTAL_INTEREST_LABEL}</dt>
              <dd>{formatPrice(totalInterest(schedule))}</dd>
            </div>
          </dl>
          <AmortizationChart schedule={schedule} crossover={findCrossover(schedule)} paymentsMade={paymentsMade} />
        </>
      ) : (
        errors.length === 0 && <p className="list-status">{LOAN_EMPTY_TEXT}</p>
      )}
    </section>
  );
}
