export type ScheduleRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export const MAX_AMOUNT = 1_000_000_000;
export const MAX_APR = 100;
export const MAX_TERM_MONTHS = 600;

/** The single source of truth for which loan inputs are acceptable. */
export function loanInputValidity(amount: number, apr: number, termMonths: number, paymentsMade: number) {
  const amountOk = Number.isFinite(amount) && amount > 0 && amount <= MAX_AMOUNT;
  const aprOk = Number.isFinite(apr) && apr >= 0 && apr <= MAX_APR;
  const termOk = Number.isInteger(termMonths) && termMonths >= 1 && termMonths <= MAX_TERM_MONTHS;
  const paymentsOk =
    Number.isInteger(paymentsMade) && paymentsMade >= 0 && (!termOk || paymentsMade <= termMonths);
  return { amount: amountOk, apr: aprOk, term: termOk, paymentsMade: paymentsOk };
}

const isValid = (principal: number, apr: number, termMonths: number) => {
  const v = loanInputValidity(principal, apr, termMonths, 0);
  return v.amount && v.apr && v.term;
};

/** Fixed monthly payment for a standard amortizing loan. APR is a percentage (6 = 6%). */
export function monthlyPayment(principal: number, apr: number, termMonths: number): number {
  if (!isValid(principal, apr, termMonths)) return 0;
  const r = apr / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/** One row per month. The last row pays off whatever is left so the balance ends at exactly 0. */
export function buildSchedule(principal: number, apr: number, termMonths: number): ScheduleRow[] {
  if (!isValid(principal, apr, termMonths)) return [];
  const r = apr / 100 / 12;
  const pmt = monthlyPayment(principal, apr, termMonths);
  const rows: ScheduleRow[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * r;
    const isLast = month === termMonths;
    const principalPaid = isLast ? balance : pmt - interest;
    balance = isLast ? 0 : balance - principalPaid;
    rows.push({ month, payment: principalPaid + interest, interest, principal: principalPaid, balance });
  }
  return rows;
}

/** First month where more of the payment goes to principal than interest, or null if never. */
export function findCrossover(schedule: ScheduleRow[]): number | null {
  return schedule.find((row) => row.principal > row.interest)?.month ?? null;
}

/** Remaining principal after N payments. 0 payments = the full loan; N past the term = 0. */
export function balanceAfter(schedule: ScheduleRow[], paymentsMade: number): number {
  if (schedule.length === 0) return 0;
  if (paymentsMade <= 0) return schedule[0].balance + schedule[0].principal;
  return schedule[Math.min(Math.floor(paymentsMade), schedule.length) - 1].balance;
}

export const totalInterest = (schedule: ScheduleRow[]) =>
  schedule.reduce((sum, row) => sum + row.interest, 0);
