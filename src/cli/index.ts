#!/usr/bin/env node

import { Command, OptionValues } from "commander";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";

import fastly from "../fastly/index.js";
import { display } from "./display.js";
import { getConfig } from "./config.js";
import { Rate } from "../types.js";

const pkgJsonpath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../package.json",
);
const program = new Command();

async function run(config: string, options: OptionValues) {
  const start = Date.now();
  const prices: Rate = await getConfig(config);
  const now = dayjs();
  const params = {
    start: options.start || now.subtract(1, "d").format("YYYY-MM-DD"),
    end: options.end || now.format("YYYY-MM-DD"),
    service: options.service,
  };

  const client = fastly.client(process.env.FASTLY_API_TOKEN);
  const costs = await client.costs(params, prices);

  // Output - display table or JSON
  if (options.json) {
    console.log(JSON.stringify({ ...params, data: costs }, null, "  "));
  } else {
    display(params, costs);
    console.log(`Process took ${Date.now() - start} ms.`);
  }
}

(async () => {
  // Check Fastly Api Key is specified in environment variable
  if (!process.env.FASTLY_API_TOKEN) {
    console.error(
      "Fastly Api Key must be specified in FASTLY_API_TOKEN environment variable",
    );
    process.exit(1);
  }

  const pkgJson: { version: string; description: string } = JSON.parse(
    await fs.readFile(pkgJsonpath, "utf8"),
  );
  program
    .name("fastly-costs")
    .version(pkgJson.version)
    .description(pkgJson.description)
    .argument("[filename]", "Price configuration file", "./prices.toml")
    .option(
      "-s, --start <fromDate>",
      "Start date of billing - YYYY-MM-DD format",
    )
    .option("-e, --end <toDate>", "End date of billing - YYYY-MM-DD format")
    .option("--json", "Output cost data as JSON")
    .option("--service <filter>", "Filter service for the results")
    .action(async (config: string, options: OptionValues) => {
      await run(config, options);
    });

  program.parse();
})();
