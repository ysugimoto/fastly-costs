#!/usr/bin/env node

import { Command, OptionValues } from "commander";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { type SpanningCellConfig, table } from "table";
import dayjs from "dayjs";

import fastly from "./fastly";
import type { Rate, Cost, CostParameter } from "./types.js";
import { regions } from "./regions.js";

const pkgJsonpath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../package.json",
);
const program = new Command();

async function getConfig(config: string): Promise<Rate> {
  if (!config) {
    const cwd = process.cwd();
    try {
      await fs.stat(path.join(cwd, "rate.config.mjs"));
      // biome-ignore lint/style/noParameterAssign: To suppress tsc compiler, reassigning is needed
      config = path.join(cwd, "rate.config.mjs");
    } catch (err) {
      try {
        await fs.stat(path.join(cwd, "rate.config.js"));
        // biome-ignore lint/style/noParameterAssign: To suppress tsc compiler, reassigning is needed
        config = path.join("rate.config.js");
      } catch (err) {
        throw new Error(
          "Cannot find rate configuration file of rate.config.[m]js",
        );
      }
    }
  }
  const mod = await import(config);
  return mod.default;
}

function validateConfig(config: Rate) {
  const costTypes = [
    "requests",
    "bandwidth",
    "computeRequests",
    "computeDurations",
  ];
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

function display(params: CostParameter, costs: Array<Cost>) {
  const spanningCells: Array<SpanningCellConfig> = [];
  let row = 0;

  const tableData = [
    [
      `Fastly Billing Data / ${params.start} - ${params.end}`,
      "",
      "",
      "",
      "",
      "",
    ],
  ];
  spanningCells.push({ col: 0, row, colSpan: 6, alignment: "center" });
  tableData.push([
    "Service",
    "Region",
    "Requests",
    "Bandwidth",
    "Compute Requests",
    "Compute Durations",
  ]);
  row++;

  for (const cost of costs) {
    const keys = Object.keys(cost.costs).sort((a, b) => (a > b ? 1 : -1));
    for (let i = 0; i < keys.length; i++) {
      const region = keys[i];
      const { requests, bandwidth, computeRequests, computeDurations } =
        cost.costs[region];
      tableData.push([
        [cost.name, `(${cost.id})`].join("\n"),
        region,
        `$${requests.toFixed(6)}`,
        `$${bandwidth.toFixed(6)}`,
        `$${computeRequests.toFixed(6)}`,
        `$${computeDurations.toFixed(6)}`,
      ]);
      row++;
      if (i === 0) {
        spanningCells.push({ col: 0, row, rowSpan: 8, alignment: "center" });
      }
    }
  }
  process.stdout.write(
    table(tableData, {
      columns: [
        { alignment: "center", width: 30, verticalAlignment: "middle" },
        { alignment: "left" },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" },
      ],
      spanningCells,
    }),
  );
}

async function run(options: OptionValues) {
  const start = Date.now();
  const config = await getConfig(options.config);
  validateConfig(config);
  const client = fastly.client(process.env.FASTLY_API_TOKEN);
  const now = dayjs();
  const params = {
    start: options.start || now.subtract(2, "d").format("YYYY-MM-DD"),
    end: options.end || now.subtract(1, "d").format("YYYY-MM-DD"),
  };
  const costs = await client.costs(params, config);

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
    .version(pkgJson.version)
    .description(pkgJson.description)
    .option("-c, --config <filepath>", "Override use configration filepath")
    .option(
      "-s, --start <fromDate>",
      "Start date of billing - YYYY-MM-DD format",
    )
    .option("-e, --end <toDate>", "End date of billing - YYYY-MM-DD format")
    .option("--json", "Output cost data as JSON")
    .parse();

  run(program.opts());
})();
