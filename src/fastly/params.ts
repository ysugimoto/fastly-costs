import dayjs from "dayjs";
import type { CostParameter, Region } from "../types.js";
import { InvalidDateRangeError } from "./errors.js";

// buildQuery() builds request query string from CostParameter.
// If params are invalid, then raise an InvalidDateRangeError
export function buildQuery(params: CostParameter, region: Region): string {
  const start = dayjs(params.start, "YYYY-MM-DD");
  const end = dayjs(params.end, "YYYY-MM-DD");
  if (!start.isValid()) {
    throw new InvalidDateRangeError(
      `Invalid start time ${params.start} provided`,
    );
  }
  if (!end.isValid()) {
    throw new InvalidDateRangeError(`Invalid end time ${params.end} provided`);
  }
  if (end.isBefore(start)) {
    throw new InvalidDateRangeError(
      `End time ${params.end} must be after from start time ${params.start}`,
    );
  }
  const query = new URLSearchParams({
    from: params.start,
    to: params.end,
    region,
    by: "hour",
  });
  return query.toString();
}
