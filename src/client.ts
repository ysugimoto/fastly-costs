import type { ServiceAPISchema, StatAPISchema } from "./schema";
import type { Rate, Cost, CostStatistics, CostParameter, Region } from "./types";
import { regions } from "./regions";
import { calculate } from "./calculate";

const fastlyApiBaseUrl = "https://api.fastly.com";

export class FastlyClient {
  private apiKey: string;
  private rate: Rate;

  constructor(rate: Rate) {
    this.apiKey = process.env.FASTLY_API_TOKEN || "";
    this.rate = rate;
  }

  public async costs(params: CostParameter): Promise<Array<Cost>> {
    const services = await this.listServices();
    const costs: Array<Cost> = [];

    for (const service of services) {
      const serviceCosts: Cost["costs"] = {};
      await Promise.all(regions.map(async (region: Region) => {
        serviceCosts[region] = await this.calculateCosts(service.id, region, params);
      }));
      costs.push({ ...service, costs: serviceCosts });
    }
    return costs;
  }

  private async calculateCosts(serviceId: string, region: Region, params: CostParameter): Promise<CostStatistics> {
    const query = new URLSearchParams({
      from: params.start,
      to: params.end,
      region,
    });
    const { data } = await this.request<{ data: Array<StatAPISchema> }>(`/stats/service/${serviceId}?${query.toString()}`);
    if (data.length === 0) {
      return {
        bandwidth: 0,
        requests: 0,
        computeRequests: 0,
        computeDuration: 0,
      }
    }
    return calculate(this.rate[region], data[0]);
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${fastlyApiBaseUrl}${endpoint}`, {
      headers: {
        "Fastly-Key": this.apiKey,
        Accept: "application/json",
      },
    });

    return response.json() as T;
  }

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
