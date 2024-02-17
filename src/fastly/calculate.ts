import type { StatAPISchema } from "./schema.js";
import type { Rate, Region, CostStatistics, BillingUnits } from "../types.js";

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
    bandwidth:
      typeof calc.bandwidth === "function"
        ? calc.bandwidth(bandwidth)
        : calc.bandwidth * bandwidth,
    requests:
      typeof calc.requests === "function"
        ? calc.requests(requests)
        : calc.requests * requests,
    computeRequests:
      typeof calc.computeRequests === "function"
        ? calc.computeRequests(computeRequests)
        : calc.computeRequests * computeRequests,
    computeDurations:
      typeof calc.computeDurations === "function"
        ? calc.computeDurations(computeDurations)
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
