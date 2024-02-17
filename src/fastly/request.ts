import { FastlyAPIError } from "./errors.js";

const fastlyApiBaseUrl = "https://api.fastly.com";

export async function sendRequest<T>(
  apiKey: string,
  endpoint: string,
): Promise<T> {
  try {
    const response = await fetch(`${fastlyApiBaseUrl}${endpoint}`, {
      headers: {
        "Fastly-Key": apiKey,
        Accept: "application/json",
      },
    });

    return response.json() as T;
  } catch (err) {
    throw new FastlyAPIError(`Fastly API reponds error: ${err}`);
  }
}
