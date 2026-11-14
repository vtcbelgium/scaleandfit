// src/apparel/index.ts
// Pure international apparel & denim sizing matrix across US, EU, UK, JP, and cm coordinates.

export type ApparelAlphaSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type ApparelGender = "mens" | "womens";

export interface ApparelSizeRow {
  alpha: ApparelAlphaSize;
  gender: ApparelGender;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  usNumeric: number;
  euNumeric: number;
  ukNumeric: number;
  jpCode: string;
}

export interface DenimWaistConversion {
  waistIn: number;
  inseamIn: number;
  waistCm: number;
  inseamCm: number;
  euSize: number;
  ukWaistIn: number;
  lengthClass: "Short" | "Regular" | "Long" | "Extra Long";
}

export const APPAREL_SIZE_MATRIX: ApparelSizeRow[] = [
  // Men's standard ISO / US / EU / UK / JP chest-waist curve
  { alpha: "XS", gender: "mens", chestCm: 88, waistCm: 73, hipCm: 88, usNumeric: 34, euNumeric: 44, ukNumeric: 34, jpCode: "SS / 160" },
  { alpha: "S", gender: "mens", chestCm: 94, waistCm: 79, hipCm: 94, usNumeric: 36, euNumeric: 46, ukNumeric: 36, jpCode: "S / 165" },
  { alpha: "M", gender: "mens", chestCm: 100, waistCm: 85, hipCm: 100, usNumeric: 38, euNumeric: 48, ukNumeric: 38, jpCode: "M / 170" },
  { alpha: "L", gender: "mens", chestCm: 106, waistCm: 91, hipCm: 106, usNumeric: 40, euNumeric: 50, ukNumeric: 40, jpCode: "L / 175" },
  { alpha: "XL", gender: "mens", chestCm: 112, waistCm: 97, hipCm: 112, usNumeric: 42, euNumeric: 52, ukNumeric: 42, jpCode: "LL / 180" },
  { alpha: "XXL", gender: "mens", chestCm: 120, waistCm: 105, hipCm: 118, usNumeric: 44, euNumeric: 54, ukNumeric: 44, jpCode: "3L / 185" },

  // Women's standard international US / EU / UK / JP curve
  { alpha: "XS", gender: "womens", chestCm: 82, waistCm: 64, hipCm: 90, usNumeric: 2, euNumeric: 34, ukNumeric: 6, jpCode: "5 / S" },
  { alpha: "S", gender: "womens", chestCm: 86, waistCm: 68, hipCm: 94, usNumeric: 4, euNumeric: 36, ukNumeric: 8, jpCode: "7 / M" },
  { alpha: "M", gender: "womens", chestCm: 92, waistCm: 74, hipCm: 100, usNumeric: 8, euNumeric: 38, ukNumeric: 12, jpCode: "9 / L" },
  { alpha: "L", gender: "womens", chestCm: 98, waistCm: 80, hipCm: 106, usNumeric: 12, euNumeric: 42, ukNumeric: 16, jpCode: "13 / LL" },
  { alpha: "XL", gender: "womens", chestCm: 106, waistCm: 88, hipCm: 114, usNumeric: 16, euNumeric: 46, ukNumeric: 20, jpCode: "15 / 3L" },
  { alpha: "XXL", gender: "womens", chestCm: 114, waistCm: 96, hipCm: 122, usNumeric: 20, euNumeric: 50, ukNumeric: 24, jpCode: "17 / 4L" },
];

/**
 * Finds the best-fitting apparel size row using combined Euclidean chest/waist fit distance,
 * favoring a non-tight fit when equidistant.
 */
export function matchApparelSizeByChestWaist(
  chestCm: number,
  waistCm: number,
  gender: ApparelGender
): ApparelSizeRow {
  if (!(chestCm >= 65 && chestCm <= 150 && waistCm >= 50 && waistCm <= 140)) {
    throw new RangeError("Chest and waist measurements must be valid human garment centimeters");
  }
  const candidates = APPAREL_SIZE_MATRIX.filter((row) => row.gender === gender);
  let best = candidates[0];
  let bestScore = Infinity;

  for (const row of candidates) {
    const chestDelta = row.chestCm - chestCm;
    const waistDelta = row.waistCm - waistCm;
    const penalty = (chestDelta < -2 ? 3 : 0) + (waistDelta < -2 ? 3 : 0);
    const dist = Math.hypot(chestDelta, waistDelta) + penalty;
    if (dist < bestScore) {
      bestScore = dist;
      best = row;
    }
  }
  return best;
}

/**
 * Converts standard W/L denim tag dimensions (inches) to metric cm and European trouser size.
 */
export function convertDenimWaistInseam(waistIn: number, inseamIn: number): DenimWaistConversion {
  if (!(waistIn >= 22 && waistIn <= 54 && inseamIn >= 24 && inseamIn <= 38)) {
    throw new RangeError("Denim waist (22-54 in) and inseam (24-38 in) must be within standard range");
  }
  const waistCm = Math.round(waistIn * 2.54 * 10) / 10;
  const inseamCm = Math.round(inseamIn * 2.54 * 10) / 10;
  const euSize = Math.round((waistIn + 16) / 2) * 2;
  const ukWaistIn = waistIn;

  let lengthClass: DenimWaistConversion["lengthClass"] = "Regular";
  if (inseamIn < 30) lengthClass = "Short";
  else if (inseamIn > 34) lengthClass = "Extra Long";
  else if (inseamIn > 32) lengthClass = "Long";

  return {
    waistIn,
    inseamIn,
    waistCm,
    inseamCm,
    euSize,
    ukWaistIn,
    lengthClass,
  };
}
