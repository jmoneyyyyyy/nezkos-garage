import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import LoanCalculator from "./LoanCalculator";

async function fill(amount: string, apr: string, term: string, made?: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/loan amount/i), amount);
  await user.type(screen.getByLabelText(/interest rate/i), apr);
  await user.type(screen.getByLabelText(/term/i), term);
  if (made !== undefined) {
    const field = screen.getByLabelText(/payments made/i);
    await user.clear(field);
    await user.type(field, made);
  }
}

const readout = (label: RegExp) => screen.getByText(label).nextElementSibling;

describe("LoanCalculator", () => {
  beforeEach(() => localStorage.clear());

  it("prompts for input before anything is entered", () => {
    render(<LoanCalculator />);
    expect(screen.getByText(/enter a loan amount/i)).toBeInTheDocument();
    expect(screen.queryByText(/monthly payment/i)).not.toBeInTheDocument();
  });

  it("shows the payment and full balance with no payments made", async () => {
    render(<LoanCalculator />);
    await fill("20000", "6", "60");
    expect(readout(/monthly payment/i)).toHaveTextContent("$386.66");
    expect(readout(/principal left/i)).toHaveTextContent("$20,000.00");
    expect(readout(/total interest/i)).toHaveTextContent("$3,199.36");
  });

  it("lowers the balance as payments made goes up", async () => {
    render(<LoanCalculator />);
    await fill("20000", "6", "60", "60");
    expect(readout(/principal left/i)).toHaveTextContent("$0.00");
  });

  it("shows an error and hides results for invalid input", async () => {
    render(<LoanCalculator />);
    await fill("20000", "6", "12.5");
    expect(screen.getByRole("alert")).toHaveTextContent(/whole number of months/i);
    expect(screen.queryByText(/monthly payment/i)).not.toBeInTheDocument();
  });

  it("rejects payments made beyond the term", async () => {
    render(<LoanCalculator />);
    await fill("20000", "6", "60", "61");
    expect(screen.getByRole("alert")).toHaveTextContent(/payments made/i);
  });

  it("draws the crossover chart once the inputs are valid", async () => {
    render(<LoanCalculator />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    await fill("300000", "7", "360");
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("remembers the inputs after leaving and coming back", async () => {
    const first = render(<LoanCalculator />);
    await fill("20000", "6", "60", "12");
    first.unmount();

    render(<LoanCalculator />);
    expect(screen.getByLabelText(/loan amount/i)).toHaveValue("20000");
    expect(screen.getByLabelText(/payments made/i)).toHaveValue("12");
    expect(readout(/monthly payment/i)).toHaveTextContent("$386.66");
  });

  it("ignores unreadable saved data", () => {
    localStorage.setItem("nezkos-garage:loan-calculator", "{not json");
    render(<LoanCalculator />);
    expect(screen.getByLabelText(/loan amount/i)).toHaveValue("");
  });

  it("clears the inputs and the saved copy when Reset is clicked", async () => {
    const first = render(<LoanCalculator />);
    await fill("20000", "6", "60");
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByLabelText(/loan amount/i)).toHaveValue("");
    expect(screen.getByLabelText(/payments made/i)).toHaveValue("0");
    first.unmount();

    render(<LoanCalculator />);
    expect(screen.getByLabelText(/loan amount/i)).toHaveValue("");
  });

  it("accepts commas and a dollar sign in the amount", async () => {
    render(<LoanCalculator />);
    await fill("$20,000", "6", "60");
    expect(readout(/monthly payment/i)).toHaveTextContent("$386.66");
  });

  it("rejects an absurd amount or rate", async () => {
    render(<LoanCalculator />);
    await fill("5000000000", "150", "60");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.queryByText(/monthly payment/i)).not.toBeInTheDocument();
  });

  it("handles 0% APR and a 600-month term", async () => {
    render(<LoanCalculator />);
    await fill("12000", "0", "600");
    expect(readout(/monthly payment/i)).toHaveTextContent("$20.00");
    expect(readout(/total interest/i)).toHaveTextContent("$0.00");
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("treats a blank payments made as 0", async () => {
    render(<LoanCalculator />);
    await fill("20000", "6", "60");
    await userEvent.clear(screen.getByLabelText(/payments made/i));
    expect(readout(/principal left/i)).toHaveTextContent("$20,000.00");
  });
});
