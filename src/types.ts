import type { ServiceAPISchema } from "./schema";
import { regions } from "./regions";

export type Region = (typeof regions)[number];
export type RateExpression = number | ((volume: number) => number);
export type Rate = {
  [key in Region]: {
    bandwidth: RateExpression;
    requests: RateExpression;
    computeRequests: RateExpression;
    computeDuration: RateExpression;
  };
}
export type ServiceType = "compute" | "deliver";
export type Granularity = "DAILY" | "WEEKLY" | "MONTHLY";
export type CostStatistics = {
  bandwidth: number;
  requests: number;
  computeRequests: number;
  computeDuration: number;
}

export type Cost = ServiceAPISchema & {
  costs: {
    [key: string]: CostStatistics;
  };
}

export type CostParameter = {
  start: string;
  end: string;
  granularity: Granularity;
}
