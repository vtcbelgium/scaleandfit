export interface AirlineBaggageSpec {
  slug: string;
  iata: string;
  name: string;
  region: "EU" | "NA" | "APAC" | "ME";
  carryOnCm: [number, number, number];
  personalItemCm: [number, number, number];
  carryOnWeightKg: number;
  personalIncluded: boolean;
  overheadFree: boolean;
  policyNote: string;
}

export interface BagFitResult {
  airline: AirlineBaggageSpec;
  fitsCarryOn: boolean;
  fitsPersonalItem: boolean;
  fitsWeight: boolean;
  marginCarryOnCm: [number, number, number];
  marginPersonalCm: [number, number, number];
  linearBagCm: number;
  linearLimitCm: number;
  verdict: "PERSONAL_AND_CABIN" | "OVERHEAD_ONLY" | "TOO_LARGE";
}

export function sortDimensionsDesc(dims: [number, number, number]): [number, number, number] {
  const sorted = [...dims].map(Number).sort((a, b) => b - a);
  return [sorted[0], sorted[1], sorted[2]];
}

export function evaluateBagAgainstAirline(
  bagCm: [number, number, number],
  bagWeightKg: number,
  airline: AirlineBaggageSpec
): BagFitResult {
  const bag = sortDimensionsDesc(bagCm);
  const cabin = sortDimensionsDesc(airline.carryOnCm);
  const personal = sortDimensionsDesc(airline.personalItemCm);

  const marginCarryOnCm: [number, number, number] = [
    Number((cabin[0] - bag[0]).toFixed(1)),
    Number((cabin[1] - bag[1]).toFixed(1)),
    Number((cabin[2] - bag[2]).toFixed(1)),
  ];
  const marginPersonalCm: [number, number, number] = [
    Number((personal[0] - bag[0]).toFixed(1)),
    Number((personal[1] - bag[1]).toFixed(1)),
    Number((personal[2] - bag[2]).toFixed(1)),
  ];

  const fitsCarryOn = marginCarryOnCm.every((m) => m >= 0);
  const fitsPersonalItem = marginPersonalCm.every((m) => m >= 0);
  const fitsWeight = bagWeightKg <= airline.carryOnWeightKg;

  const linearBagCm = Number((bag[0] + bag[1] + bag[2]).toFixed(1));
  const linearLimitCm = Number((cabin[0] + cabin[1] + cabin[2]).toFixed(1));

  let verdict: BagFitResult["verdict"] = "TOO_LARGE";
  if (fitsPersonalItem && fitsWeight) {
    verdict = "PERSONAL_AND_CABIN";
  } else if (fitsCarryOn && fitsWeight) {
    verdict = "OVERHEAD_ONLY";
  }

  return {
    airline,
    fitsCarryOn,
    fitsPersonalItem,
    fitsWeight,
    marginCarryOnCm,
    marginPersonalCm,
    linearBagCm,
    linearLimitCm,
    verdict,
  };
}

export function evaluateBagFleet(
  bagCm: [number, number, number],
  bagWeightKg: number,
  fleet: AirlineBaggageSpec[]
): BagFitResult[] {
  return fleet.map((airline) => evaluateBagAgainstAirline(bagCm, bagWeightKg, airline));
}
