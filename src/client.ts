import dayjs from "dayjs";
import type { ServiceAPISchema, StatAPISchema } from "./schema.js";
import type {
  Rate,
  Cost,
  CostStatistics,
  CostParameter,
  Region,
} from "./types.js";
import { regions } from "./regions.js";
import { calculate } from "./calculate.js";

const fastlyApiBaseUrl = "https://api.fastly.com";

// Declare specific errors
export class FastlyAPIError extends Error {}
export class InvalidDateRangeError extends Error {}

// Fastly API Client class
// This class implements some calling apis only we need a little
// so we don't use official client library.
export class FastlyClient {
  // apiKey will be set via environment variable of FASTLY_API_TOKEN
  private apiKey: string;

  // rate is cost calculation rate which is defined at user config.
  // This is because rate is different for each account, it depends on the contract.
  // Some customers will have a volume discount for specific region, deliver, bandwidth, etc.
  private rate: Rate;

  constructor(rate: Rate) {
    this.apiKey = process.env.FASTLY_API_TOKEN || "";
    this.rate = rate;
  }

  // Validate date range
  private validateParams(params: CostParameter) {
    const start = dayjs(params.start, "YYYY-MM-DD");
    const end = dayjs(params.end, "YYYY-MM-DD");
    if (!start.isValid()) {
      throw new InvalidDateRangeError(
        `Invalid start time ${params.start} provided`,
      );
    }
    if (!end.isValid()) {
      throw new InvalidDateRangeError(
        `Invalid end time ${params.end} provided`,
      );
    }
    if (end.isBefore(start)) {
      throw new InvalidDateRangeError(
        `End time ${params.end} must be after from start time ${params.start}`,
      );
    }
  }

  // costs() calculates billing costs between the date rage for each services in the account
  public async costs(params: CostParameter): Promise<Array<Cost>> {
    this.validateParams(params);
    const services = await this.listServices();
    const costs: Array<Cost> = [];

    for (const service of services) {
      const serviceCosts: Cost["costs"] = {};
      await Promise.all(
        regions.map(async (region: Region) => {
          serviceCosts[region] = await this.calculateCosts(
            service.id,
            region,
            params,
          );
        }),
      );
      costs.push({ ...service, costs: serviceCosts });
    }
    return costs;
  }

  // calculateCosts() calculates for each billing types
  private async calculateCosts(
    serviceId: string,
    region: Region,
    params: CostParameter,
  ): Promise<CostStatistics> {
    const query = new URLSearchParams({
      from: params.start,
      to: params.end,
      region,
      by: "hour",
    });
    const { data } = await this.request<{ data: Array<StatAPISchema> }>(
      `/stats/service/${serviceId}?${query.toString()}`,
    );
    if (data.length === 0) {
      return {
        bandwidth: 0,
        requests: 0,
        computeRequests: 0,
        computeDurations: 0,
      };
    }
    return calculate(this.rate[region], data);
  }

  // Sending request to the Fastly API
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${fastlyApiBaseUrl}${endpoint}`, {
        headers: {
          "Fastly-Key": this.apiKey,
          Accept: "application/json",
        },
      });

      return response.json() as T;
    } catch (err) {
      throw new FastlyAPIError(`Fastly API reponds error: ${err}`);
    }
  }

  // List all services in the customer account
  private async listServices(): Promise<Array<ServiceAPISchema>> {
    const response = await this.request<Array<ServiceAPISchema>>("/service");
    const services: Array<ServiceAPISchema> = [];

    for (const resp of response) {
      services.push({
        name: resp.name,
        id: resp.id,
        type: resp.type === "wasm" ? "compute" : "vcl",
      });
    }

    return services;
  }
}
