/**
 * MOCK DATA — every number in this file is illustrative, invented for the
 * design phase. The UI labels anything rendered from here as
 * "mock data · illustrative". Real benchmark storage is an open question in
 * models/README.md; when it is settled these fixtures are replaced by real
 * evaluation output and the labels come off.
 */

export interface MockBenchmarks {
  /** Card sparkline: CRPS over the last six (fictional) evaluations. */
  spark: number[];
  /** CRPS by forecast horizon h1..h6 for this model. */
  crpsByHorizon: number[];
  /** Mean CRPS on the (fictional) dengue-brazil-monthly comparison. */
  comparisonMean: number;
  /** Per-country skill vs. baseline, 0..1. */
  countrySkill: [country: string, skill: number][];
}

/** Seasonal-naive baseline CRPS by horizon — shared across models. */
export const BASELINE_CRPS = [0.55, 0.71, 0.88, 1.02, 1.13, 1.22];

export const MOCK_BENCHMARKS: Record<string, MockBenchmarks> = {
  ewars_template: {
    spark: [0.61, 0.58, 0.54, 0.49, 0.47, 0.42],
    crpsByHorizon: [0.42, 0.51, 0.63, 0.74, 0.86, 0.95],
    comparisonMean: 0.68,
    countrySkill: [
      ["Brazil", 0.31],
      ["Vietnam", 0.24],
      ["Laos", 0.19],
      ["Colombia", 0.28],
      ["Sri Lanka", 0.12],
      ["Malaysia", 0.16],
    ],
  },
  chap_pymc: {
    spark: [0.55, 0.52, 0.5, 0.44, 0.41, 0.39],
    crpsByHorizon: [0.39, 0.47, 0.58, 0.69, 0.79, 0.88],
    comparisonMean: 0.63,
    countrySkill: [
      ["Brazil", 0.34],
      ["Vietnam", 0.27],
      ["Laos", 0.15],
      ["Colombia", 0.3],
      ["Sri Lanka", 0.18],
      ["Malaysia", 0.21],
    ],
  },
  auto_regressive_monthly_v2: {
    spark: [0.52, 0.47, 0.45, 0.4, 0.37, 0.34],
    crpsByHorizon: [0.34, 0.44, 0.61, 0.99, 1.1, 1.18],
    comparisonMean: 0.78,
    countrySkill: [
      ["Brazil", 0.38],
      ["Vietnam", 0.29],
      ["Laos", 0.11],
      ["Colombia", 0.33],
      ["Sri Lanka", 0.09],
      ["Malaysia", 0.24],
    ],
  },
  mstl_arima: {
    spark: [0.71, 0.68, 0.66, 0.63, 0.6, 0.58],
    crpsByHorizon: [0.58, 0.66, 0.75, 0.84, 0.93, 1.01],
    comparisonMean: 0.8,
    countrySkill: [
      ["Brazil", 0.14],
      ["Vietnam", 0.11],
      ["Laos", 0.16],
      ["Colombia", 0.09],
      ["Sri Lanka", 0.13],
      ["Malaysia", 0.08],
    ],
  },
  mstl_multistep_model: {
    spark: [0.63, 0.61, 0.56, 0.53, 0.5, 0.47],
    crpsByHorizon: [0.47, 0.57, 0.69, 0.81, 0.92, 1.0],
    comparisonMean: 0.74,
    countrySkill: [
      ["Brazil", 0.26],
      ["Vietnam", 0.19],
      ["Laos", 0.22],
      ["Colombia", 0.17],
      ["Sri Lanka", 0.15],
      ["Malaysia", 0.12],
    ],
  },
};

export function mockBenchmarksFor(id: string): MockBenchmarks | undefined {
  return MOCK_BENCHMARKS[id];
}
