import { Command } from "commander";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { FastlyClient } from "./client";
import type { Rate } from "./types";

const pkgJsonpath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../package.json");
const program = new Command();

async function getConfig(config: string): Promise<Rate> {
  if (!config) {
    try {
      await fs.stat("./rate.config.mjs");
      config = "./rate.config.mjs";
    } catch (err) {
      try {
        await fs.stat("./rate.config.js");
        config = "./rate.config.js";
      } catch (err) {
        throw new Error("Cannot find rate configuration file of rate.config.[m]js");
      }
    }
  }
  const mod = await import(config);
  return mod as Rate;
}

(async () => {
  const pkgJson: { version: string, description: string } = JSON.parse(await fs.readFile(pkgJsonpath, "utf8"));
  program
    .version(pkgJson.version)
    .description(pkgJson.description)
    .option("-c, --config <filepath>", "Override use configration filepath")
    .parse();

  const options = program.opts();
  const config = await getConfig(options.config);
  console.log(config);
})();

