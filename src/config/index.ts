// Utility function for user config - useful for volume discount with gradualy units
export function gradualyDiscount(
  gradualy: Array<[number, number]>,
  overRate: number,
): (volume: number) => number {
  return (volume: number) => {
    let unit = volume;
    let cost = 0;
    let basis = 0;
    for (const [threshold, rate] of gradualy) {
      if (unit <= threshold - basis) {
        cost += unit * rate;
        return cost;
      }
      cost += (threshold - basis) * rate;
      unit -= threshold - basis;
      basis = threshold;
    }
    cost += unit * overRate;
    return cost;
  };
}
