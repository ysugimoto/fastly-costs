import { buildQuery } from "./params";

describe("buildQuery() tests", () => {
  it("builds expected query string", () => {
    const params = {
      start: "2024-01-01",
      end: "2024-01-02",
    };
    const query = buildQuery(params, "asia");
    expect(query).toBe("from=2024-01-01&to=2024-01-02&region=asia&by=hour");
  });
});
