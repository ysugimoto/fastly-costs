// Declare types which we need in this library.

import type { ServiceAPISchema } from "./fastly/schema.js";

// Fastly declares billing regions, following words are all.
export const regions = [
  "usa",
  "europe",
  "anzac",
  "asia",
  "asia_india",
  "asia_southkorea",
  "africa_std",
  "southamerica_std",
] as const;
export type Region = (typeof regions)[number];

// RateExpression is actual cost calculation rate.
// rate accepts number or function:
// - number: simple multiple for billing unit
// - Array: for gradualy discount that depends on customer contract
export type GraudalyRate = {
  threshold?: number;
  price: number;
};
export type RateExpression = number | Array<GraudalyRate>;
export type Rate = {
  [key in Region]: {
    bandwidth: RateExpression;
    requests: RateExpression;
    computeRequests: RateExpression;
    computeDurations: RateExpression;
  };
};
// In Fastly, service type specifies as
// - Fastly Compute  -> "wasm"
// - Deliver Service -> "vcl"
// But we re-define the understandable type name
export type ServiceType = "compute" | "deliver";
export type CostStatistics = {
  bandwidth: number;
  requests: number;
  computeRequests: number;
  computeDurations: number;
};
// Note:
// Fields are the same as CostStatistics but explicitly declare another type
// due to cost calculation in the library.
export type BillingUnits = {
  bandwidth: number;
  requests: number;
  computeRequests: number;
  computeDurations: number;
};

export type Cost = ServiceAPISchema & {
  costs: {
    [key: string]: CostStatistics;
  };
};

// CostParameter represents a request parameter to the Fastly API.
// both fields are specified via user.
export type CostParameter = {
  start: string;
  end: string;
};
