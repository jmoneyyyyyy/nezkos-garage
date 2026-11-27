import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import ErrorAlert from "../common/ErrorAlert";
import FormTextField from "../common/FormTextField";
import { StatusText } from "../common/ListStatus";
import ReadoutList from "../common/ReadoutList";
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

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
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
    <Card
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "min(720px, calc(100% - 48px))",
        mx: "auto",
        p: "20px",
        textAlign: "left",
        borderTop: "3px solid",
        borderTopColor: "primary.main",
        borderRadius: "14px",
      }}
    >
      <Typography component="h2" variant="h2" sx={{ m: 0, fontSize: 24 }}>
        {LOAN_CALCULATOR_TITLE}
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 16px",
          "@media (max-width:520px)": { gridTemplateColumns: "1fr" },
        }}
      >
        <FormTextField label={LOAN_AMOUNT_LABEL} inputMode="decimal" value={form.amount} onChange={set("amount")} />
        <FormTextField label={LOAN_APR_LABEL} inputMode="decimal" value={form.apr} onChange={set("apr")} />
        <FormTextField label={LOAN_TERM_LABEL} inputMode="numeric" value={form.term} onChange={set("term")} />
        <FormTextField
          label={LOAN_PAYMENTS_MADE_LABEL}
          inputMode="numeric"
          value={form.paymentsMade}
          onChange={set("paymentsMade")}
        />
        <Button
          variant="outlined"
          size="small"
          sx={{ gridColumn: "1 / -1", justifySelf: "start" }}
          onClick={() => setForm(EMPTY_FORM)}
        >
          {LOAN_RESET_BUTTON_TEXT}
        </Button>
      </Box>

      {errors.map((message) => (
        <ErrorAlert key={message} error={message} />
      ))}

      {ready ? (
        <>
          <ReadoutList
            layout="grid"
            valueSize={20}
            items={[
              [LOAN_MONTHLY_PAYMENT_LABEL, formatPrice(schedule[0].payment)],
              [LOAN_BALANCE_LEFT_LABEL, formatPrice(balanceAfter(schedule, paymentsMade))],
              [LOAN_TOTAL_INTEREST_LABEL, formatPrice(totalInterest(schedule))],
            ]}
          />
          <AmortizationChart schedule={schedule} crossover={findCrossover(schedule)} paymentsMade={paymentsMade} />
        </>
      ) : (
        errors.length === 0 && <StatusText sx={{ m: 0, width: "auto" }}>{LOAN_EMPTY_TEXT}</StatusText>
      )}
    </Card>
  );
}
