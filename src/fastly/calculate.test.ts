import type { Rate } from "../types";
import type { StatAPISchema } from "./schema";
import {
  calculate,
  calculateBillingUnits,
  gradualyDiscount,
} from "./calculate";

describe("calculate() test", () => {
  it("number expression calulates successfully", () => {
    const stats: Array<StatAPISchema> = [
      {
        bandwidth: 10000000000,
        requests: 100000,
        compute_requests: 10000000,
        compute_request_time_billed_ms: 1000000,
      },
      {
        bandwidth: 10000000000,
        requests: 100000,
        compute_requests: 10000000,
        compute_request_time_billed_ms: 1000000,
      },
    ];
    const c: Rate["asia"] = {
      bandwidth: 0.1,
      requests: 0.1,
      computeRequests: 0.1,
      computeDurations: 0.1,
    };
    const result = calculate(c, stats);
    expect(result).toMatchObject({
      bandwidth: 2,
      requests: 2,
      computeRequests: 2,
      computeDurations: 25,
    });
  });
});

describe("calculateBillingUnits() test", () => {
  it("returns actual unit to bill", () => {
    const stats: Array<StatAPISchema> = [
      {
        bandwidth: 10000000000,
        requests: 100000,
        compute_requests: 10000000,
        compute_request_time_billed_ms: 1000000,
      },
      {
        bandwidth: 10000000000,
        requests: 100000,
        compute_requests: 10000000,
        compute_request_time_billed_ms: 1000000,
      },
    ];

    const { bandwidth, requests, computeRequests, computeDurations } =
      calculateBillingUnits(stats);
    expect(bandwidth).toBe(20);
    expect(requests).toBe(20);
    expect(computeRequests).toBe(20);
    expect(computeDurations).toBe(250);
  });
});

describe("Calculator tests", () => {
  it("gradualyDiscount() returns step-by-step discounted cost", () => {
    const cost = gradualyDiscount(1200, [
      { threshold: 500, price: 0.5 },
      { threshold: 1000, price: 0.4 },
      { threshold: -1, price: 0.2 },
    ]);
    expect(cost).toBe(250 + 200 + 40);
  });
});
