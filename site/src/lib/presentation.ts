/**
 * Editorial, site-side metadata the registry YAML does not carry (yet).
 * Facts about the model repositories — framework, how the model uses
 * covariates — that may migrate into the YAML in a schema_version bump.
 * Nothing here is fabricated data; benchmark mocks live in
 * mock-benchmarks.ts and are labeled as such in the UI.
 */

export type CovariateMode = "climate" | "none" | "both";

export interface Presentation {
  /** e.g. "R · INLA" — what the model is implemented with. */
  framework: string;
  /** How the model relates to climate covariates. */
  covMode: CovariateMode;
  /** Short name for tight chart labels. */
  shortName: string;
  /** Very short name for bar-chart tick labels. */
  abbrev: string;
}

export const COV_LABEL: Record<CovariateMode, string> = {
  climate: "climate-driven",
  none: "no covariates",
  both: "climate or history",
};

export const PRESENTATION: Record<string, Presentation> = {
  ewars_template: {
    framework: "R · INLA",
    covMode: "climate",
    shortName: "EWARS",
    abbrev: "EWARS",
  },
  chap_pymc: {
    framework: "Python · PyMC",
    covMode: "climate",
    shortName: "CHAP PyMC",
    abbrev: "PyMC",
  },
  auto_regressive_monthly_v2: {
    framework: "PyTorch · GRU",
    covMode: "climate",
    shortName: "AR Monthly v2",
    abbrev: "AR v2",
  },
  mstl_arima: {
    framework: "Python · statsforecast",
    covMode: "none",
    shortName: "MSTL + ARIMA",
    abbrev: "MSTL+A",
  },
  mstl_multistep_model: {
    framework: "Python · statsforecast + sklearn",
    covMode: "both",
    shortName: "MSTL Multistep",
    abbrev: "MSTL-M",
  },
};

export function presentationFor(id: string): Presentation {
  return (
    PRESENTATION[id] ?? {
      framework: "—",
      covMode: "both",
      shortName: id,
      abbrev: id.slice(0, 6),
    }
  );
}
