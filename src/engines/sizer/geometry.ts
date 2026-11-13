export interface DisplayInput {
  id?: string;
  label: string;
  category?: "laptop" | "monitor" | "tv";
  diagonalIn: number;
  aspectW: number;
  aspectH: number;
}

export interface DisplayDimensions {
  label: string;
  diagonalIn: number;
  aspectW: number;
  aspectH: number;
  widthIn: number;
  heightIn: number;
  widthCm: number;
  heightCm: number;
  areaSqIn: number;
  areaSqCm: number;
  smpteDistanceCm: number;
  thxDistanceCm: number;
}

export interface DisplayComparison {
  a: DisplayDimensions;
  b: DisplayDimensions;
  widthDiffCm: number;
  heightDiffCm: number;
  widthDiffIn: number;
  heightDiffIn: number;
  areaRatioBtoA: number;
  areaDeltaPercent: number;
}

export interface MattressSpec {
  id: string;
  label: string;
  region: "US" | "EU" | "UK";
  widthCm: number;
  lengthCm: number;
}

export interface MattressComparison {
  a: MattressSpec;
  b: MattressSpec;
  widthDiffCm: number;
  lengthDiffCm: number;
  areaSqM_A: number;
  areaSqM_B: number;
  areaDeltaPercent: number;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;
const CM_PER_IN = 2.54;

export function computeDisplayDimensions(spec: DisplayInput): DisplayDimensions {
  if (!(spec.diagonalIn > 0 && spec.aspectW > 0 && spec.aspectH > 0)) {
    throw new RangeError("Display diagonal and aspect ratio must be positive numbers");
  }
  const hypot = Math.hypot(spec.aspectW, spec.aspectH);
  const widthIn = spec.diagonalIn * (spec.aspectW / hypot);
  const heightIn = spec.diagonalIn * (spec.aspectH / hypot);
  const widthCm = widthIn * CM_PER_IN;
  const heightCm = heightIn * CM_PER_IN;
  const areaSqIn = widthIn * heightIn;
  const areaSqCm = widthCm * heightCm;
  // 30 deg horizontal FOV ~ 1.866x width; 40 deg THX ~ 1.374x width
  const smpteDistanceCm = widthCm / (2 * Math.tan((15 * Math.PI) / 180));
  const thxDistanceCm = widthCm / (2 * Math.tan((20 * Math.PI) / 180));

  return {
    label: spec.label,
    diagonalIn: r2(spec.diagonalIn),
    aspectW: spec.aspectW,
    aspectH: spec.aspectH,
    widthIn: r2(widthIn),
    heightIn: r2(heightIn),
    widthCm: r2(widthCm),
    heightCm: r2(heightCm),
    areaSqIn: r2(areaSqIn),
    areaSqCm: r2(areaSqCm),
    smpteDistanceCm: r2(smpteDistanceCm),
    thxDistanceCm: r2(thxDistanceCm),
  };
}

export function compareDisplays(aInput: DisplayInput, bInput: DisplayInput): DisplayComparison {
  const a = computeDisplayDimensions(aInput);
  const b = computeDisplayDimensions(bInput);
  const ratio = b.areaSqIn / a.areaSqIn;
  return {
    a,
    b,
    widthDiffCm: r2(b.widthCm - a.widthCm),
    heightDiffCm: r2(b.heightCm - a.heightCm),
    widthDiffIn: r2(b.widthIn - a.widthIn),
    heightDiffIn: r2(b.heightIn - a.heightIn),
    areaRatioBtoA: Number(ratio.toFixed(4)),
    areaDeltaPercent: r2((ratio - 1) * 100),
  };
}

export function compareMattresses(a: MattressSpec, b: MattressSpec): MattressComparison {
  const areaA = (a.widthCm * a.lengthCm) / 10000;
  const areaB = (b.widthCm * b.lengthCm) / 10000;
  return {
    a,
    b,
    widthDiffCm: r2(b.widthCm - a.widthCm),
    lengthDiffCm: r2(b.lengthCm - a.lengthCm),
    areaSqM_A: r2(areaA),
    areaSqM_B: r2(areaB),
    areaDeltaPercent: r2(((areaB - areaA) / areaA) * 100),
  };
}
