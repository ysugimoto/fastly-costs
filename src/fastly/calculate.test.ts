import type { Rate } from "../types";
import type { StatAPISchema } from "./schema";
import { calculate, calculateBillingUnits } from "./calculate";

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

  it("function expression calulates successfully", () => {
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
      bandwidth: (v: number) => v / 10,
      requests: (v: number) => v / 10,
      computeRequests: (v: number) => v / 10,
      computeDurations: (v: number) => v / 10,
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
