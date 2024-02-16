import { gradualyDiscount } from "fastly-costs";

export default {
  asia: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  usa: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  europe: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  anzac: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  asia_india: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  asia_southkorea: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  africa_std: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
  southamerica_std: {
    requests: (volume) => volume * 0.14,
    computeRequests: 0.05,
    computeDurations: 0.006,
    bandwidth: gradualyDiscount([
      [500, 0.5],
      [1000, 0.4],
    ], 0.2),
  },
}
