/** A "nice" step (1, 2, 2.5, 5 x a power of ten) close to range / targetCount. */
export function niceStep(range: number, targetCount: number): number {
  if (!(range > 0) || targetCount < 1) return 1;
  const raw = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const fraction = raw / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Evenly spaced tick values from 0 up to (and including) the first one at or above `max`. */
export function niceTicks(max: number, targetCount: number): number[] {
  const step = niceStep(max, targetCount);
  const ticks: number[] = [];
  for (let value = 0; ; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6);
    if (value >= max) break;
  }
  return ticks;
}

/** Month ticks (step, 2*step, ...) that fit within 1..lastMonth. */
export function monthTicks(lastMonth: number, targetCount: number): number[] {
  const step = Math.max(1, Math.round(niceStep(lastMonth, targetCount)));
  const ticks: number[] = [];
  for (let month = step; month <= lastMonth; month += step) ticks.push(month);
  return ticks;
}

/** SVG path through the points ("M x y L x y ..."). */
export function linePath(points: { x: number; y: number }[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}
