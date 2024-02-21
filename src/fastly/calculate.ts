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
  units: BillingUnits,
): CostStatistics {
  const { bandwidth, requests, computeRequests, computeDurations } = units;

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

// Calculate sum of statistics
export function calculateStatistics(
  stats: Array<StatAPISchema>,
): StatAPISchema {
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
    bandwidth,
    requests,
    compute_requests: computeRequests,
    compute_request_time_billed_ms: computeDurations,
  };
}

// Calculate statistics to billing unit
export function calculateBillingUnits(stat: StatAPISchema): BillingUnits {
  // Avoid zero division
  // Note that on Compute request, the requests field always set to 0.
  // But actually Fastly bills for the request (means Edge POP request),
  // we need to treat requests as the same as compute_requests.
  const requests =
    stat.compute_requests > 0 ? stat.compute_requests : stat.requests;

  return {
    bandwidth: stat.bandwidth > 0 ? stat.bandwidth / bandwidthUnit : 0,
    requests: requests > 0 ? requests / requestUnit : 0,
    computeRequests:
      stat.compute_requests > 0
        ? stat.compute_requests / computeRequestUnit
        : 0,
    computeDurations:
      stat.compute_request_time_billed_ms > 0
        ? (stat.compute_request_time_billed_ms / 1000) * computeDurationUnit
        : 0,
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
