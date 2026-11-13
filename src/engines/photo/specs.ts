// src/photo/specs.ts
export interface BiometricPhotoSpec {
  slug: string;
  country: string;
  documentType: string;
  widthMm: number;
  heightMm: number;
  minHeadMm: number;
  maxHeadMm: number;
  eyeLineFromBottomMinRatio: number;
  eyeLineFromBottomMaxRatio: number;
  backgroundHex: string;
  maxFileSizeKb?: number;
  notes: string;
}

const SLUG_ALIASES: Record<string, string> = {
  "us-passport-photo-2x2": "us-passport-2x2",
  "schengen-visa-photo-35x45": "schengen-visa-35x45",
};

export const BIOMETRIC_PHOTO_SPECS: BiometricPhotoSpec[] = [
  { slug: "us-passport-2x2", country: "United States", documentType: "Passport", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, eyeLineFromBottomMinRatio: 0.56, eyeLineFromBottomMaxRatio: 0.69, backgroundHex: "#FFFFFF", notes: "2x2 inch square on uniform white #FFFFFF background." },
  { slug: "us-visa-ds160", country: "United States", documentType: "DS-160 Visa", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, eyeLineFromBottomMinRatio: 0.56, eyeLineFromBottomMaxRatio: 0.69, backgroundHex: "#FFFFFF", maxFileSizeKb: 240, notes: "600x600 px digital upload under 240 KB on plain white background." },
  { slug: "schengen-visa-35x45", country: "Schengen Area", documentType: "Visa", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#F4F4F4", notes: "Standard 35x45 mm EU Schengen biometric framing with neutral expression." },
  { slug: "belgium-passport-eid", country: "Belgium", documentType: "Passport & eID", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Belgian biometric passport & eID standard on plain uniform white background." },
  { slug: "netherlands-pasfoto", country: "Netherlands", documentType: "Pasfoto Passport/ID", widthMm: 35, heightMm: 45, minHeadMm: 26, maxHeadMm: 30, eyeLineFromBottomMinRatio: 0.54, eyeLineFromBottomMaxRatio: 0.67, backgroundHex: "#F2F2F2", notes: "Strict Dutch Pasfoto ear-to-ear centered pose with neutral expression." },
  { slug: "germany-biometric-passport", country: "Germany", documentType: "Reisepass", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.56, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#F2F2F2", notes: "German Schablone biometric mask proportions." },
  { slug: "france-passport-cni", country: "France", documentType: "Passeport & CNI", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#E8EEF5", notes: "Light uniform off-white or pale grey-blue background, neutral mouth." },
  { slug: "uk-passport-35x45", country: "United Kingdom", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 29, maxHeadMm: 34, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#ECECEC", notes: "Plain light grey or cream background with zero shadows." },
  { slug: "canada-passport-50x70", country: "Canada", documentType: "Passport", widthMm: 50, heightMm: 70, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.52, eyeLineFromBottomMaxRatio: 0.64, backgroundHex: "#FFFFFF", notes: "50x70 mm tall Canadian standard frame with visible shoulders." },
  { slug: "australia-passport-35x45", country: "Australia", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Plain white/light grey background showing full chin to crown." },
  { slug: "india-passport-2x2", country: "India", documentType: "Passport", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "2x2 inch (51x51 mm) square plain white backdrop." },
  { slug: "china-visa-33x48", country: "China", documentType: "Visa", widthMm: 33, heightMm: 48, minHeadMm: 28, maxHeadMm: 33, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Strict 33x48 mm narrow frame with exposed ears on white backdrop." },
  { slug: "japan-passport-35x45", country: "Japan", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "35x45 mm borderless plain white/off-white background." },
  { slug: "turkey-biometric-50x60", country: "Turkey", documentType: "Biometric Passport", widthMm: 50, heightMm: 60, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.53, eyeLineFromBottomMaxRatio: 0.66, backgroundHex: "#FFFFFF", notes: "50x60 mm Turkish ICAO standard on pure white background." },
  { slug: "linkedin-headshot-square", country: "Global", documentType: "CV Headshot", widthMm: 100, heightMm: 100, minHeadMm: 48, maxHeadMm: 72, eyeLineFromBottomMinRatio: 0.52, eyeLineFromBottomMaxRatio: 0.66, backgroundHex: "#F8FAFC", notes: "High-resolution 300-DPI square studio headshot crop." },
  { slug: "ireland-passport", country: "Ireland", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "spain-passport", country: "Spain", documentType: "Passport", widthMm: 26, heightMm: 32, minHeadMm: 22, maxHeadMm: 26, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "italy-passport", country: "Italy", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "switzerland-passport", country: "Switzerland", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "poland-passport", country: "Poland", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "new-zealand-passport", country: "New Zealand", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "south-korea-passport", country: "South Korea", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "brazil-passport", country: "Brazil", documentType: "Passport", widthMm: 50, heightMm: 70, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "mexico-passport", country: "Mexico", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "uae-passport", country: "UAE", documentType: "Passport", widthMm: 40, heightMm: 60, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "singapore-passport", country: "Singapore", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 25, maxHeadMm: 35, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport size" },
  { slug: "hong-kong-passport", country: "Hong Kong", documentType: "Passport", widthMm: 40, heightMm: 50, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "malaysia-passport", country: "Malaysia", documentType: "Passport", widthMm: 35, heightMm: 50, minHeadMm: 25, maxHeadMm: 30, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "philippines-passport", country: "Philippines", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "south-africa-passport", country: "South Africa", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "sweden-passport", country: "Sweden", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "norway-passport", country: "Norway", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "denmark-passport", country: "Denmark", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "austria-passport", country: "Austria", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "portugal-passport", country: "Portugal", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard passport photo specifications." },
  { slug: "united-states-dv-lottery-photo", country: "United States DV Lottery", documentType: "Photo", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, eyeLineFromBottomMinRatio: 0.55, eyeLineFromBottomMaxRatio: 0.68, backgroundHex: "#FFFFFF", notes: "Standard DV lottery photo specifications." }
];

export function getBiometricSpec(slug: string): BiometricPhotoSpec | undefined {
  const canonical = SLUG_ALIASES[slug] || slug;
  return BIOMETRIC_PHOTO_SPECS.find((spec) => spec.slug === canonical);
}
