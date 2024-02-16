import type { StatAPISchema } from "./schema";
import type { Rate, Region, CostStatistics } from "./types";

type Calculator = Rate[Region];

// Billing units
const requestUnit = 10000; // 10K
const bandwidthUnit = 1000000000; // GigaByte
const computeRequestUnit = 1000000; // Million Requests
const computeDurationUnit = 128 / 1024; // GB-Sec

export function calculate(calc: Calculator, stat: StatAPISchema): CostStatistics {
  const bandwidth = stat.bandwidth / bandwidthUnit;
  const requests = stat.requests / requestUnit;
  const computeRequest = stat.compute_requests / computeRequestUnit;
  const computeDuration = (stat.compute_request_time_billed_ms / 1000) * computeDurationUnit;

  return {
    bandwidth: (typeof calc.bandwidth === "function") ? calc.bandwidth(bandwidth) : calc.bandwidth * bandwidth,
    requests: (typeof calc.requests === "function") ? calc.requests(requests) : calc.requests * requests,
    computeRequests: (typeof calc.computeRequests === "function") ? calc.computeRequests(computeRequest) : calc.computeRequests * computeRequest,
    computeDuration: (typeof calc.computeDuration === "function") ? calc.computeDuration(computeDuration) : calc.computeDuration * computeDuration,
  };
}
