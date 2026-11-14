// src/sizer/ergonomics.ts
// Pure ergonomic viewing-distance, VESA mount, arm-torque, and desk geometry solver.

export type VesaPattern = "75x75" | "100x100" | "200x200" | "300x300" | "400x400" | "600x400";

export interface ErgonomicSetupSpec {
  diagonalIn: number;
  widthCm: number;
  heightCm: number;
  minViewingDistanceCm: number;
  idealViewingDistanceCm: number;
  cinemaViewingDistanceCm: number;
  recommendedVesa: VesaPattern;
  estimatedPanelWeightKg: number;
  minArmTorqueNm: number;
  eyeTopOffsetCm: number;
}

export interface StandingDeskErgonomics {
  userHeightCm: number;
  seatedChairHeightCm: number;
  seatedDeskHeightCm: number;
  seatedMonitorTopCm: number;
  standingDeskHeightCm: number;
  standingMonitorTopCm: number;
  eyeLevelSeatedCm: number;
  eyeLevelStandingCm: number;
}

const r1 = (n: number): number => Math.round(n * 10) / 10;
const r2 = (n: number): number => Math.round(n * 100) / 100;

export function selectVesaPattern(
  diagonalIn: number,
  category: "laptop" | "monitor" | "tv" = "tv"
): VesaPattern {
  if (category === "laptop" || diagonalIn < 24) return "75x75";
  if (diagonalIn <= 38) return "100x100";
  if (diagonalIn < 55) return "200x200";
  if (diagonalIn < 65) return "300x300";
  if (diagonalIn < 85) return "400x400";
  return "600x400";
}

/**
 * Computes physical screen dimensions, SMPTE/THX viewing distances, VESA mount standard,
 * estimated panel weight, and minimum articulating arm torque for a given display.
 */
export function computeDisplayErgonomics(
  diagonalIn: number,
  aspectW = 16,
  aspectH = 9,
  category: "laptop" | "monitor" | "tv" = "tv"
): ErgonomicSetupSpec {
  if (!(diagonalIn > 0 && aspectW > 0 && aspectH > 0)) {
    throw new RangeError("Display diagonal and aspect ratio must be positive numbers");
  }
  const hypot = Math.hypot(aspectW, aspectH);
  const widthCm = diagonalIn * (aspectW / hypot) * 2.54;
  const heightCm = diagonalIn * (aspectH / hypot) * 2.54;

  const minViewingDistanceCm = widthCm * 1.2;
  const idealViewingDistanceCm = widthCm * 1.866;
  const cinemaViewingDistanceCm = widthCm * 1.374;
  const recommendedVesa = selectVesaPattern(diagonalIn, category);

  const estimatedPanelWeightKg =
    category === "laptop"
      ? Math.max(1.0, diagonalIn * 0.11)
      : category === "monitor"
        ? Math.max(2.6, diagonalIn * 0.24 - 1.5)
        : Math.max(4.0, diagonalIn * 0.36 - 3.2);

  // Articulating gas-spring arm cantilever lever (~0.28 m CG offset * 1.25 safety factor)
  const minArmTorqueNm = estimatedPanelWeightKg * 9.81 * 0.28 * 1.25;
  const eyeTopOffsetCm = heightCm * 0.15;

  return {
    diagonalIn: r2(diagonalIn),
    widthCm: r2(widthCm),
    heightCm: r2(heightCm),
    minViewingDistanceCm: r1(minViewingDistanceCm),
    idealViewingDistanceCm: r1(idealViewingDistanceCm),
    cinemaViewingDistanceCm: r1(cinemaViewingDistanceCm),
    recommendedVesa,
    estimatedPanelWeightKg: r1(estimatedPanelWeightKg),
    minArmTorqueNm: r2(minArmTorqueNm),
    eyeTopOffsetCm: r1(eyeTopOffsetCm),
  };
}

/**
 * Computes anthropometric chair, desk, and monitor-top ergonomics for seated and standing setups.
 */
export function computeDeskErgonomics(userHeightCm: number): StandingDeskErgonomics {
  if (!(userHeightCm >= 120 && userHeightCm <= 230)) {
    throw new RangeError("User height must be between 120 cm and 230 cm");
  }
  const seatedChairHeightCm = r1(userHeightCm * 0.258);
  const seatedDeskHeightCm = r1(userHeightCm * 0.415);
  const eyeLevelSeatedCm = r1(userHeightCm * 0.68);
  const seatedMonitorTopCm = r1(eyeLevelSeatedCm + 2);
  const standingDeskHeightCm = r1(userHeightCm * 0.62);
  const eyeLevelStandingCm = r1(userHeightCm * 0.936);
  const standingMonitorTopCm = r1(eyeLevelStandingCm + 2);

  return {
    userHeightCm: r1(userHeightCm),
    seatedChairHeightCm,
    seatedDeskHeightCm,
    seatedMonitorTopCm,
    standingDeskHeightCm,
    standingMonitorTopCm,
    eyeLevelSeatedCm,
    eyeLevelStandingCm,
  };
}
