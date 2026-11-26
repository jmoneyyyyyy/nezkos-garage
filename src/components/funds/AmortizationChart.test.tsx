import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildSchedule, findCrossover } from "../../utils/loan";
import AmortizationChart from "./AmortizationChart";

function renderChart(amount: number, apr: number, term: number, made = 0) {
  const schedule = buildSchedule(amount, apr, term);
  return render(<AmortizationChart schedule={schedule} crossover={findCrossover(schedule)} paymentsMade={made} />);
}

describe("AmortizationChart", () => {
  it("marks the crossover month and describes it", () => {
    renderChart(300000, 7, 360);
    expect(screen.getByText("Crossover: 242")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(/principal passes interest at payment 242/i);
  });

  it("skips the marker when principal leads from the start", () => {
    renderChart(20000, 6, 60);
    expect(screen.queryByText(/^Crossover:/)).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(/from the very first payment/i);
  });

  it("shows the paid-so-far marker only after a payment", () => {
    const { unmount } = renderChart(300000, 7, 360, 0);
    expect(screen.queryByText("Paid so far")).not.toBeInTheDocument();
    unmount();
    renderChart(300000, 7, 360, 24);
    expect(screen.getByText("Paid so far")).toBeInTheDocument();
  });

  it("renders nothing for an empty schedule", () => {
    const { container } = render(<AmortizationChart schedule={[]} crossover={null} paymentsMade={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("draws a single-payment loan without crashing", () => {
    renderChart(1000, 5, 1);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
