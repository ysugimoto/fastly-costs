import type { StatAPISchema } from "./schema.js";
import type {
  Rate,
  Cost,
  CostStatistics,
  CostParameter,
  Region,
} from "../types.js";
import { regions } from "../types.js";
import { calculate } from "./calculate.js";
import { sendRequest } from "./request.js";
import { listServices } from "./services.js";
import { buildQuery } from "./params.js";

const defaultCost: () => CostStatistics = () => ({
  bandwidth: 0,
  requests: 0,
  computeRequests: 0,
  computeDurations: 0,
});

export function client(apiKey?: string): FastlyClient {
  return new FastlyClient(apiKey || process.env.FASTLY_API_TOKEN || "");
}

// Fastly API Client class
// This class implements some calling apis only we need a little
// so we don't use official client library.
class FastlyClient {
  // apiKey will be set via environment variable of FASTLY_API_TOKEN
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // costs() calculates billing costs between the date rage for each services in the account.
  // rate - the second argument - is cost calculation rate which is defined at user config.
  // This is because rate is different for each account, it depends on the contract.
  // Some customers will have a volume discount for specific region, deliver, bandwidth, etc.
  public async costs(params: CostParameter, rate: Rate): Promise<Array<Cost>> {
    const services = await listServices(this.apiKey);
    const costs: Array<Cost> = [];

    for (const service of services) {
      // If service filter is provided, check equivalent to listed service id
      if (params.service && params.service !== service.id) {
        continue;
      }
      const serviceCosts: Cost["costs"] = {};
      await Promise.all(
        regions.map(async (region: Region) => {
          const qs = buildQuery(params, region);
          const { data } = await sendRequest<{ data: Array<StatAPISchema> }>(
            this.apiKey,
            `/stats/service/${service.id}?${qs}`,
          );
          serviceCosts[region] =
            data.length > 0 ? calculate(rate[region], data) : defaultCost();
        }),
      );
      costs.push({ ...service, costs: serviceCosts });
    }
    return costs;
  }
}
