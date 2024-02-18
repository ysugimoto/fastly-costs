import { promises as fs } from "node:fs";
import path from "node:path";
import toml from "toml";
import type { Rate } from "../types.js";
import { regions } from "../types.js";

export async function getConfig(config: string): Promise<Rate> {
  const filePath = config.startsWith("/")
    ? config
    : path.join(process.cwd(), config);
  let priceRate: Rate;
  try {
    const buffer = await fs.readFile(filePath, "utf8");
    priceRate = toml.parse(buffer) as Rate;
  } catch (err) {
    throw new Error(`Cannot find rate configuration file of ${filePath}`);
  }
  try {
    validateConfig(priceRate);
  } catch (err) {
    throw new Error(`Invalid config: ${err}`);
  }
  return priceRate;
}

export function validateConfig(config: Rate) {
  const costTypes = [
    "requests",
    "bandwidth",
    "computeRequests",
    "computeDurations",
  ] as const;
  for (const region of regions) {
    if (!(region in config)) {
      throw new Error(`${region} rate is not specified in config`);
    }
    const rate = config[region];
    for (const costType of costTypes) {
      if (!(costType in rate)) {
        throw new Error(
          `${costType} rate is not specified in config["${region}"]`,
        );
      }
    }
  }
}
