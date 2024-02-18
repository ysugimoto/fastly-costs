import type { StatAPISchema } from "./schema.js";
import type {
  Rate,
  Region,
  GraudalyRate,
  CostStatistics,
  BillingUnits,
} from "../types.js";

type Calculator = Rate[Region];

// Billing units for each billing types
const requestUnit = 10000; // Bills per 10K requests
const bandwidthUnit = 1000000000; // Bills per GigaBytes bandwidth
const computeRequestUnit = 1000000; // Bills per Million Requests
const computeDurationUnit = 128 / 1024; // Bills per GB-Sec

// Calculate costs for each billing type with user's rate
export function calculate(
  calc: Calculator,
  stats: Array<StatAPISchema>,
): CostStatistics {
  const { bandwidth, requests, computeRequests, computeDurations } =
    calculateBillingUnits(stats);

  return {
    bandwidth: Array.isArray(calc.bandwidth)
      ? gradualyDiscount(bandwidth, calc.bandwidth)
      : calc.bandwidth * bandwidth,
    requests: Array.isArray(calc.requests)
      ? gradualyDiscount(requests, calc.requests)
      : calc.requests * requests,
    computeRequests: Array.isArray(calc.computeRequests)
      ? gradualyDiscount(computeRequests, calc.computeRequests)
      : calc.computeRequests * computeRequests,
    computeDurations: Array.isArray(calc.computeDurations)
      ? gradualyDiscount(computeDurations, calc.computeDurations)
      : calc.computeDurations * computeDurations,
  };
}

// Normalize statistics to billing unit
export function calculateBillingUnits(
  stats: Array<StatAPISchema>,
): BillingUnits {
  let bandwidth = 0;
  let requests = 0;
  let computeRequests = 0;
  let computeDurations = 0;

  for (const stat of stats) {
    bandwidth += stat.bandwidth;
    requests += stat.requests;
    computeRequests += stat.compute_requests;
    computeDurations += stat.compute_request_time_billed_ms;
  }

  return {
    bandwidth: bandwidth / bandwidthUnit,
    requests: requests / requestUnit,
    computeRequests: computeRequests / computeRequestUnit,
    computeDurations: (computeDurations / 1000) * computeDurationUnit,
  };
}

// Utility function for user config - useful for volume discount with gradualy units
export function gradualyDiscount(
  volume: number,
  gradualy: Array<GraudalyRate>,
): number {
  let unit = volume;
  let cost = 0;
  let basis = 0;
  for (const { threshold = -1, price } of gradualy) {
    // minus threshold means over the unit threshold, calculate cost with remaining volumes
    if (threshold === -1) {
      cost += unit * price;
      break;
    }
    if (unit <= threshold - basis) {
      cost += unit * price;
      break;
    }
    cost += (threshold - basis) * price;
    unit -= threshold - basis;
    basis = threshold;
  }
  return cost;
}
