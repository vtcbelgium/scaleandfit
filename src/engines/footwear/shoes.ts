// src/footwear/shoes.ts
export type GenderFit = "mens" | "womens" | "unisex";

export interface ShoeBrandProfile {
  slug: string;
  name: string;
  offsetMm: number;
  fitNote: string;
}

export interface ConvertedShoeSize {
  brand: string;
  mondopointMm: number;
  us: number;
  uk: number;
  eu: number;
  fitNote: string;
}

export const SHOE_BRANDS: ShoeBrandProfile[] = [
  { slug: "nike", name: "Nike", offsetMm: 0, fitNote: "True to Brannock standard length; medium D width" },
  { slug: "adidas", name: "Adidas", offsetMm: 2, fitNote: "Runs slightly long; half UK step tighter than US" },
  { slug: "new-balance", name: "New Balance", offsetMm: 0, fitNote: "Consistent anatomical last with wide width options" },
  { slug: "hoka", name: "Hoka", offsetMm: -2, fitNote: "Snug midfoot rocker geometry; round up 0.5 size if between sizes" },
  { slug: "asics", name: "ASICS", offsetMm: -1, fitNote: "Slightly tapered toe box compared to New Balance" },
  { slug: "birkenstock", name: "Birkenstock", offsetMm: 4, fitNote: "Generous contoured cork footbed; size down for narrow fit" },
  { slug: "converse", name: "Converse", offsetMm: 5, fitNote: "Runs 0.5 size large; most buyers size down half a US size" },
  { slug: "vans", name: "Vans", offsetMm: 1, fitNote: "Classic vulcanized canvas fit; true to length" },
  { slug: "salomon", name: "Salomon", offsetMm: -2, fitNote: "Precision athletic trail wrap; snug heel lock" },
  { slug: "on-running", name: "On Running", offsetMm: -1, fitNote: "Swiss CloudTec last runs slightly compact" },
  { slug: "dr-martens", name: "Dr. Martens", offsetMm: 3, fitNote: "Structured leather boot last with generous toe room" },
  { slug: "crocs", name: "Crocs", offsetMm: 4, fitNote: "Relaxed roomy resin fit; whole sizes only" },
  { slug: "brooks", name: "Brooks", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "saucony", name: "Saucony", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "puma", name: "Puma", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "reebok", name: "Reebok", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "mizuno", name: "Mizuno", offsetMm: -1, fitNote: "Slightly narrower" },
  { slug: "merrell", name: "Merrell", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "timberland", name: "Timberland", offsetMm: 3, fitNote: "Slightly longer" },
  { slug: "clarks", name: "Clarks", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "allbirds", name: "Allbirds", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "veja", name: "Veja", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "keen", name: "Keen", offsetMm: 0, fitNote: "Standard fit" },
  { slug: "under-armour", name: "Under Armour", offsetMm: 0, fitNote: "Standard fit" }
];

export function roundHalf(val: number): number {
  return Math.round(val * 2) / 2;
}

export function usToMondopointMm(usSize: number, gender: GenderFit, brandOffsetMm = 0): number {
  if (gender === "mens" || gender === "unisex") {
    return Math.round((usSize + 18) * 10 + brandOffsetMm);
  } else if (gender === "womens") {
    return Math.round((usSize - 1.5 + 18) * 10 + brandOffsetMm);
  }
  throw new Error("Invalid gender fit");
}

export function mondopointToUs(mondopointMm: number, gender: GenderFit, brandOffsetMm = 0): number {
  if (gender === "mens" || gender === "unisex") {
    return roundHalf((mondopointMm - brandOffsetMm) / 10 - 18);
  } else if (gender === "womens") {
    return roundHalf((mondopointMm - brandOffsetMm) / 10 - 18 + 1.5);
  }
  throw new Error("Invalid gender fit");
}

export function mondopointToEu(mondopointMm: number): number {
  return Math.round(((mondopointMm + 15) / (20 / 3)) * 2) / 2;
}

export function mondopointToUk(mondopointMm: number, gender: GenderFit): number {
  return roundHalf(mondopointToUs(mondopointMm, gender, 0) - (gender === "womens" ? 2 : 1));
}

export function convertShoeBetweenBrands(fromBrandSlug: string, targetBrandSlug: string, usSize: number, gender: GenderFit): ConvertedShoeSize {
  const source = SHOE_BRANDS.find(brand => brand.slug === fromBrandSlug);
  const target = SHOE_BRANDS.find(brand => brand.slug === targetBrandSlug);
  if (!source || !target) {
    throw new Error("Unknown brand slug");
  }
  const mondopointMm = usToMondopointMm(usSize, gender, source.offsetMm);
  const us = mondopointToUs(mondopointMm, gender, target.offsetMm);
  const uk = mondopointToUk(mondopointMm, gender);
  const eu = mondopointToEu(mondopointMm);
  return {
    brand: target.name,
    mondopointMm,
    us,
    uk,
    eu,
    fitNote: target.fitNote
  };
}
