import { sendRequest } from "./request.js";
import type { ServiceAPISchema } from "./schema.js";

// List all services in the customer account
export async function listServices(
  apiKey: string,
): Promise<Array<ServiceAPISchema>> {
  const response = await sendRequest<Array<ServiceAPISchema>>(
    apiKey,
    "/service",
  );
  const services: Array<ServiceAPISchema> = [];

  for (const resp of response) {
    services.push({
      name: resp.name,
      id: resp.id,
      // Fix service type as understandable
      type: resp.type === "wasm" ? "compute" : "vcl",
    });
  }

  return services;
}
