export const ENGINES_VERSION = "1.0.0" as const;

export const SCALEANDFIT_SUITES = [
  "visual-sizer",
  "printable-paper",
  "size-converter",
  "passport-photo",
] as const;

export type ScaleAndFitSuiteId = (typeof SCALEANDFIT_SUITES)[number];

export * from "./sizer/index.js";
export * from "./paper/index.js";
export * from "./footwear/index.js";
export * from "./photo/index.js";
