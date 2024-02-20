import type { CostParameter, Cost } from "../types.js";
import { type SpanningCellConfig, table } from "table";

export function display(params: CostParameter, costs: Array<Cost>) {
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
    "Requests (10K unit)",
    "Bandwidth (1GB unit)",
    "Compute Requests (1M unit)",
    "Compute Durations (1GB-Sec unit)",
  ]);
  row++;

  for (const cost of costs) {
    const keys = Object.keys(cost.costs).sort((a, b) => (a > b ? 1 : -1));
    for (let i = 0; i < keys.length; i++) {
      const region = keys[i];
      const { costs: regionCost, units } = cost.costs[region];
      tableData.push([
        [cost.name, `(${cost.id})`].join("\n"),
        region,
        `${units.requests.toFixed(4)} / $${regionCost.requests.toFixed(6)}`,
        `${units.bandwidth.toFixed(4)} / $${regionCost.bandwidth.toFixed(6)}`,
        `${units.computeDurations.toFixed(
          4,
        )}  / $${regionCost.computeRequests.toFixed(6)}`,
        `${units.computeDurations.toFixed(
          4,
        )} / $${regionCost.computeDurations.toFixed(6)}`,
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
