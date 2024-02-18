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
