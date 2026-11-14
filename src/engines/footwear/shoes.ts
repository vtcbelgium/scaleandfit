// src/footwear/shoes.ts (SHOE_BRANDS synchronized from DeepCoder-sealed data/extended_footwear_photo.json)
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
  {
    "slug": "nike",
    "name": "Nike",
    "offsetMm": 0,
    "fitNote": "True to Brannock standard length; medium D width"
  },
  {
    "slug": "adidas",
    "name": "Adidas",
    "offsetMm": 2,
    "fitNote": "Runs slightly long; half UK step tighter than US"
  },
  {
    "slug": "new-balance",
    "name": "New Balance",
    "offsetMm": 0,
    "fitNote": "Consistent anatomical last with wide width options"
  },
  {
    "slug": "hoka",
    "name": "Hoka",
    "offsetMm": -2,
    "fitNote": "Snug midfoot rocker geometry; round up 0.5 size if between sizes"
  },
  {
    "slug": "asics",
    "name": "ASICS",
    "offsetMm": -1,
    "fitNote": "Slightly tapered toe box compared to New Balance"
  },
  {
    "slug": "birkenstock",
    "name": "Birkenstock",
    "offsetMm": 4,
    "fitNote": "Generous contoured cork footbed; size down for narrow fit"
  },
  {
    "slug": "converse",
    "name": "Converse",
    "offsetMm": 5,
    "fitNote": "Runs 0.5 size large; most buyers size down half a US size"
  },
  {
    "slug": "vans",
    "name": "Vans",
    "offsetMm": 1,
    "fitNote": "Classic vulcanized canvas fit; true to length"
  },
  {
    "slug": "salomon",
    "name": "Salomon",
    "offsetMm": -2,
    "fitNote": "Precision athletic trail wrap; snug heel lock"
  },
  {
    "slug": "on-running",
    "name": "On Running",
    "offsetMm": -1,
    "fitNote": "Swiss CloudTec last runs slightly compact"
  },
  {
    "slug": "dr-martens",
    "name": "Dr. Martens",
    "offsetMm": 3,
    "fitNote": "Structured leather boot last with generous toe room"
  },
  {
    "slug": "crocs",
    "name": "Crocs",
    "offsetMm": 4,
    "fitNote": "Relaxed roomy resin fit; whole sizes only"
  },
  {
    "fitNote": "Standard fit",
    "name": "Brooks",
    "offsetMm": 0,
    "slug": "brooks"
  },
  {
    "fitNote": "Standard fit",
    "name": "Saucony",
    "offsetMm": 0,
    "slug": "saucony"
  },
  {
    "fitNote": "Standard fit",
    "name": "Puma",
    "offsetMm": 0,
    "slug": "puma"
  },
  {
    "fitNote": "Standard fit",
    "name": "Reebok",
    "offsetMm": 0,
    "slug": "reebok"
  },
  {
    "fitNote": "Slightly narrower",
    "name": "Mizuno",
    "offsetMm": -1,
    "slug": "mizuno"
  },
  {
    "fitNote": "Standard fit",
    "name": "Merrell",
    "offsetMm": 0,
    "slug": "merrell"
  },
  {
    "fitNote": "Slightly longer",
    "name": "Timberland",
    "offsetMm": 3,
    "slug": "timberland"
  },
  {
    "fitNote": "Standard fit",
    "name": "Clarks",
    "offsetMm": 0,
    "slug": "clarks"
  },
  {
    "fitNote": "Standard fit",
    "name": "Allbirds",
    "offsetMm": 0,
    "slug": "allbirds"
  },
  {
    "fitNote": "Standard fit",
    "name": "Veja",
    "offsetMm": 0,
    "slug": "veja"
  },
  {
    "fitNote": "Standard fit",
    "name": "Keen",
    "offsetMm": 0,
    "slug": "keen"
  },
  {
    "fitNote": "Standard fit",
    "name": "Under Armour",
    "offsetMm": 0,
    "slug": "under-armour"
  },
  {
    "fitNote": "Heritage low-profile Japanese trainer; slightly snug length",
    "name": "Onitsuka Tiger",
    "offsetMm": -2,
    "slug": "onitsuka-tiger"
  },
  {
    "fitNote": "FootShape wide anatomical toe box with true length",
    "name": "Altra",
    "offsetMm": 1,
    "slug": "altra"
  },
  {
    "fitNote": "Roomy forefoot with locked midfoot heel pocket",
    "name": "Topo Athletic",
    "offsetMm": 1,
    "slug": "topo-athletic"
  },
  {
    "fitNote": "Technical Italian mountain last runs half-size compact",
    "name": "La Sportiva",
    "offsetMm": -3,
    "slug": "la-sportiva"
  },
  {
    "fitNote": "Precision European approach fit; slightly firm toe rand",
    "name": "Scarpa",
    "offsetMm": -2,
    "slug": "scarpa"
  },
  {
    "fitNote": "Standard German trekking last built for hiking socks",
    "name": "Lowa",
    "offsetMm": 0,
    "slug": "lowa"
  },
  {
    "fitNote": "Generous Alpine Comfort Fit forefoot width",
    "name": "Meindl",
    "offsetMm": 1,
    "slug": "meindl"
  },
  {
    "fitNote": "Danish comfort anatomical last with extra forefoot volume",
    "name": "ECCO",
    "offsetMm": 2,
    "slug": "ecco"
  },
  {
    "fitNote": "Italian European last slightly generous in casual styles",
    "name": "Geox",
    "offsetMm": 1,
    "slug": "geox"
  },
  {
    "fitNote": "Minimalist EU sizing; round toe box accommodates medium width",
    "name": "Camper",
    "offsetMm": 1,
    "slug": "camper"
  },
  {
    "fitNote": "Heritage work boots typically sized half to one US size down",
    "name": "Red Wing",
    "offsetMm": 5,
    "slug": "red-wing"
  },
  {
    "fitNote": "Australian Chelsea boot AU sizing; half sizes add width only",
    "name": "Blundstone",
    "offsetMm": 2,
    "slug": "blundstone"
  },
  {
    "fitNote": "Shearling fleece compresses over wear; snug initial fit advised",
    "name": "UGG",
    "offsetMm": 3,
    "slug": "ugg"
  },
  {
    "fitNote": "Standard international court trainer sizing",
    "name": "FILA",
    "offsetMm": 0,
    "slug": "fila"
  },
  {
    "fitNote": "Classic Italian court and heritage running last",
    "name": "Diadora",
    "offsetMm": 1,
    "slug": "diadora"
  },
  {
    "fitNote": "Relaxed Fit casual last gives comfortable forefoot depth",
    "name": "Skechers",
    "offsetMm": 2,
    "slug": "skechers"
  },
  {
    "fitNote": "Hybrid dress-sneaker last often runs half size generous",
    "name": "Cole Haan",
    "offsetMm": 2,
    "slug": "cole-haan"
  },
  {
    "fitNote": "Classic European handball & retro sneaker proportions",
    "name": "Hummel",
    "offsetMm": 0,
    "slug": "hummel"
  },
  {
    "fitNote": "Slim tapered canvas sneaker; consider up 0.5 for wide feet",
    "name": "Keds",
    "offsetMm": -1,
    "slug": "keds"
  },
  {
    "fitNote": "Finnish heritage running shoes run slightly short; size up 0.5",
    "name": "Karhu",
    "offsetMm": -2,
    "slug": "karhu"
  },
  {
    "fitNote": "Whole-size adjustable strapping sandals; true standard length",
    "name": "Teva",
    "offsetMm": 1,
    "slug": "teva"
  }
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
  const source = SHOE_BRANDS.find((brand) => brand.slug === fromBrandSlug);
  const target = SHOE_BRANDS.find((brand) => brand.slug === targetBrandSlug);
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
    fitNote: target.fitNote,
  };
}
