import {
  LOAN_CHART_CROSSOVER_MARKER,
  LOAN_CHART_INTEREST_LEGEND,
  LOAN_CHART_PAID_MARKER,
  LOAN_CHART_PRINCIPAL_LEGEND,
  LOAN_CHART_X_AXIS_LABEL,
  LOAN_CHART_Y_AXIS_LABEL,
  loanChartSummary,
} from "../../Constants";
import { linePath, monthTicks, niceTicks } from "../../utils/chartScale";
import { formatPrice } from "../../utils/formatters";
import type { ScheduleRow } from "../../utils/loan";

type AmortizationChartProps = {
  schedule: ScheduleRow[];
  crossover: number | null;
  paymentsMade: number;
};

const WIDTH = 640;
const HEIGHT = 300;
const MARGIN = { top: 20, right: 20, bottom: 44, left: 56 };

/** Interest vs. principal in each payment; the lines cross where principal takes over. */
export default function AmortizationChart({ schedule, crossover, paymentsMade }: AmortizationChartProps) {
  if (schedule.length === 0) return null;

  const term = schedule.length;
  const yTicks = niceTicks(Math.max(...schedule.map((r) => Math.max(r.interest, r.principal))), 4);
  const yMax = yTicks[yTicks.length - 1];
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;

  // A one-payment loan would put every point on one x; widen the domain so it still draws.
  const xMax = Math.max(term, 2);
  const x = (month: number) => MARGIN.left + ((month - 1) / (xMax - 1)) * plotW;
  const y = (dollars: number) => MARGIN.top + plotH - (dollars / yMax) * plotH;

  const interestPath = linePath(schedule.map((r) => ({ x: x(r.month), y: y(r.interest) })));
  const principalPath = linePath(schedule.map((r) => ({ x: x(r.month), y: y(r.principal) })));

  const showCrossover = crossover !== null && crossover > 1;
  const made = Math.min(Math.floor(paymentsMade), term);
  const showPaid = made >= 1;
  // Flip labels near the right edge so they don't run off the chart.
  const anchor = (month: number) => (x(month) > WIDTH * 0.7 ? "end" : "start");
  const labelX = (month: number) => x(month) + (anchor(month) === "end" ? -6 : 6);
  const summary = loanChartSummary(crossover, term);

  return (
    <figure className="loan-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line className="chart-grid" x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y(tick)} y2={y(tick)} />
            <text className="chart-tick" x={MARGIN.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
              {formatPrice(tick).replace(/\.00$/, "")}
            </text>
          </g>
        ))}
        {monthTicks(term, 6).map((month) => (
          <text key={month} className="chart-tick" x={x(month)} y={HEIGHT - MARGIN.bottom + 16} textAnchor="middle">
            {month}
          </text>
        ))}
        <text className="chart-axis-label" x={MARGIN.left + plotW / 2} y={HEIGHT - 6} textAnchor="middle">
          {LOAN_CHART_X_AXIS_LABEL}
        </text>
        <text className="chart-axis-label" x={MARGIN.left} y={12} textAnchor="start">
          {LOAN_CHART_Y_AXIS_LABEL}
        </text>

        {showPaid && (
          <g>
            <line className="chart-marker chart-marker-paid" x1={x(made)} x2={x(made)} y1={MARGIN.top} y2={MARGIN.top + plotH} />
            <text className="chart-marker-label" x={labelX(made)} y={MARGIN.top + 12} textAnchor={anchor(made)}>
              {LOAN_CHART_PAID_MARKER}
            </text>
          </g>
        )}
        {showCrossover && (
          <g>
            <line className="chart-marker chart-marker-crossover" x1={x(crossover)} x2={x(crossover)} y1={MARGIN.top} y2={MARGIN.top + plotH} />
            <text className="chart-marker-label" x={labelX(crossover)} y={MARGIN.top + plotH - 8} textAnchor={anchor(crossover)}>
              {LOAN_CHART_CROSSOVER_MARKER}: {crossover}
            </text>
          </g>
        )}

        <path className="chart-line chart-line-interest" d={interestPath} />
        <path className="chart-line chart-line-principal" d={principalPath} />
      </svg>
      <figcaption>
        <span className="chart-legend chart-legend-principal">{LOAN_CHART_PRINCIPAL_LEGEND}</span>
        <span className="chart-legend chart-legend-interest">{LOAN_CHART_INTEREST_LEGEND}</span>
        <p>{summary}</p>
      </figcaption>
    </figure>
  );
}
