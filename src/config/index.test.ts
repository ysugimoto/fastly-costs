import { gradualyDiscount } from "./index.js";

describe("Calculator tests", () => {
  it("gradualyDiscount() returns step-by-step discounted cost", () => {
    const volume = 1200;
    const gradualy = gradualyDiscount(
      [
        [500, 0.5],
        [1000, 0.4],
      ],
      0.2,
    );
    const cost = gradualy(volume);
    expect(cost).toBe(250 + 200 + 40);
  });
});
