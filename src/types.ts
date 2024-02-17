// Declare types which we need in this library.

import type { ServiceAPISchema } from "./fastly/schema.js";
import { regions } from "./regions.js";

export type Region = (typeof regions)[number];

// RateExpression is actual cost calculation rate.
// rate accepts number or function:
// - number: simple multiple for billing unit
// - function: special cost calculation for each billing unit e.g gradualy volume discount
export type RateExpression = number | ((volume: number) => number);
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
