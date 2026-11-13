// Auto-generated from DeepCoder-sealed Ollama synthesis (data/airlines.json & data/screens_and_mattresses.json)
import type { AirlineBaggageSpec } from "./airlines.js";
import type { DisplayInput, MattressSpec } from "./geometry.js";

export const DISPLAY_PRESETS: Array<DisplayInput & { id: string }> = [
  {
    "aspectH": 10,
    "aspectW": 16,
    "category": "laptop",
    "diagonalIn": 13.3,
    "id": "13-3-laptop-16x10",
    "label": "13.3\" Laptop"
  },
  {
    "aspectH": 10,
    "aspectW": 16,
    "category": "laptop",
    "diagonalIn": 14,
    "id": "14-laptop-16x10",
    "label": "14\" Laptop"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "laptop",
    "diagonalIn": 15.6,
    "id": "15-6-laptop-16x9",
    "label": "15.6\" Laptop"
  },
  {
    "aspectH": 10,
    "aspectW": 16,
    "category": "laptop",
    "diagonalIn": 16,
    "id": "16-laptop-16x10",
    "label": "16\" Laptop"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "laptop",
    "diagonalIn": 17.3,
    "id": "17-3-laptop-16x9",
    "label": "17.3\" Laptop"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "monitor",
    "diagonalIn": 24,
    "id": "24-monitor-16x9",
    "label": "24\" Monitor"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "monitor",
    "diagonalIn": 27,
    "id": "27-monitor-16x9",
    "label": "27\" Monitor"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "monitor",
    "diagonalIn": 32,
    "id": "32-monitor-16x9",
    "label": "32\" Monitor"
  },
  {
    "aspectH": 9,
    "aspectW": 21,
    "category": "monitor",
    "diagonalIn": 34,
    "id": "34-ultrawide-21x9",
    "label": "34\" Ultrawide"
  },
  {
    "aspectH": 9,
    "aspectW": 21,
    "category": "monitor",
    "diagonalIn": 38,
    "id": "38-ultrawide-21x9",
    "label": "38\" Ultrawide"
  },
  {
    "aspectH": 9,
    "aspectW": 32,
    "category": "monitor",
    "diagonalIn": 49,
    "id": "49-super-ultrawide-32x9",
    "label": "49\" Super Ultrawide"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 32,
    "id": "32-tv-16x9",
    "label": "32\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 42,
    "id": "42-oled-tv-16x9",
    "label": "42\" OLED TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 43,
    "id": "43-tv-16x9",
    "label": "43\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 48,
    "id": "48-oled-tv-16x9",
    "label": "48\" OLED TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 50,
    "id": "50-tv-16x9",
    "label": "50\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 55,
    "id": "55-tv-16x9",
    "label": "55\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 65,
    "id": "65-tv-16x9",
    "label": "65\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 75,
    "id": "75-tv-16x9",
    "label": "75\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 77,
    "id": "77-oled-tv-16x9",
    "label": "77\" OLED TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 83,
    "id": "83-oled-tv-16x9",
    "label": "83\" OLED TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 85,
    "id": "85-tv-16x9",
    "label": "85\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 98,
    "id": "98-tv-16x9",
    "label": "98\" TV"
  },
  {
    "aspectH": 9,
    "aspectW": 16,
    "category": "tv",
    "diagonalIn": 100,
    "id": "100-tv-16x9",
    "label": "100\" TV"
  }
];

export const MATTRESS_PRESETS: MattressSpec[] = [
  {
    "id": "us-twin",
    "label": "US Twin",
    "lengthCm": 190.5,
    "region": "US",
    "widthCm": 96.5
  },
  {
    "id": "us-twin-xl",
    "label": "US Twin XL",
    "lengthCm": 203.2,
    "region": "US",
    "widthCm": 96.5
  },
  {
    "id": "us-full-double",
    "label": "US Full (Double)",
    "lengthCm": 190.5,
    "region": "US",
    "widthCm": 137.2
  },
  {
    "id": "us-queen",
    "label": "US Queen",
    "lengthCm": 203.2,
    "region": "US",
    "widthCm": 152.4
  },
  {
    "id": "us-king",
    "label": "US King",
    "lengthCm": 203.2,
    "region": "US",
    "widthCm": 193
  },
  {
    "id": "us-california-king",
    "label": "US California King",
    "lengthCm": 213.4,
    "region": "US",
    "widthCm": 182.9
  },
  {
    "id": "eu-single-90x200",
    "label": "EU Single 90x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 90
  },
  {
    "id": "eu-small-double-120x200",
    "label": "EU Small Double 120x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 120
  },
  {
    "id": "eu-double-140x200",
    "label": "EU Double 140x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 140
  },
  {
    "id": "eu-queen-160x200",
    "label": "EU Queen 160x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 160
  },
  {
    "id": "eu-king-180x200",
    "label": "EU King 180x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 180
  },
  {
    "id": "eu-super-king-200x200",
    "label": "EU Super King 200x200",
    "lengthCm": 200,
    "region": "EU",
    "widthCm": 200
  },
  {
    "id": "uk-single",
    "label": "UK Single",
    "lengthCm": 190,
    "region": "UK",
    "widthCm": 90
  },
  {
    "id": "uk-small-double",
    "label": "UK Small Double",
    "lengthCm": 190,
    "region": "UK",
    "widthCm": 120
  },
  {
    "id": "uk-double",
    "label": "UK Double",
    "lengthCm": 190,
    "region": "UK",
    "widthCm": 135
  },
  {
    "id": "uk-king",
    "label": "UK King",
    "lengthCm": 200,
    "region": "UK",
    "widthCm": 150
  },
  {
    "id": "uk-super-king",
    "label": "UK Super King",
    "lengthCm": 200,
    "region": "UK",
    "widthCm": 180
  }
];

export const AIRLINE_FLEET: AirlineBaggageSpec[] = [
  {
    "carryOnCm": [
      55,
      40,
      20
    ],
    "carryOnWeightKg": 10,
    "iata": "FR",
    "name": "Ryanair",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      40,
      25,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "ryanair-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      45,
      25
    ],
    "carryOnWeightKg": 15,
    "iata": "U2",
    "name": "EasyJet",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      45,
      36,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "easyjet-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 10,
    "iata": "W6",
    "name": "Wizz Air",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      40,
      30,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "wizz-air-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 8,
    "iata": "SN",
    "name": "Brussels Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      10
    ],
    "policyNote": "Overhead space included",
    "region": "EU",
    "slug": "brussels-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      35,
      25
    ],
    "carryOnWeightKg": 12,
    "iata": "KL",
    "name": "KLM",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space included",
    "region": "EU",
    "slug": "klm-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      35,
      25
    ],
    "carryOnWeightKg": 12,
    "iata": "AF",
    "name": "Air France",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space included",
    "region": "EU",
    "slug": "air-france-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 8,
    "iata": "LH",
    "name": "Lufthansa",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      10
    ],
    "policyNote": "Overhead space included",
    "region": "EU",
    "slug": "lufthansa-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      45,
      25
    ],
    "carryOnWeightKg": 23,
    "iata": "BA",
    "name": "British Airways",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space included",
    "region": "EU",
    "slug": "british-airways-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      20
    ],
    "carryOnWeightKg": 10,
    "iata": "VY",
    "name": "Vueling",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      40,
      30,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "vueling-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      35,
      25
    ],
    "carryOnWeightKg": 10,
    "iata": "HV",
    "name": "Transavia",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      40,
      30,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "transavia-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      20
    ],
    "carryOnWeightKg": 10,
    "iata": "TB",
    "name": "TUI fly",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      20
    ],
    "policyNote": "Overhead space available",
    "region": "EU",
    "slug": "tui-fly-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 10,
    "iata": "DY",
    "name": "Norwegian",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      38,
      30,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "norwegian-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 8,
    "iata": "SK",
    "name": "SAS",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space available",
    "region": "EU",
    "slug": "sas-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      24
    ],
    "carryOnWeightKg": 10,
    "iata": "EI",
    "name": "Aer Lingus",
    "overheadFree": false,
    "personalIncluded": false,
    "personalItemCm": [
      40,
      30,
      20
    ],
    "policyNote": "No overhead space",
    "region": "EU",
    "slug": "aer-lingus-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 8,
    "iata": "LX",
    "name": "Swiss",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      10
    ],
    "policyNote": "Overhead space available",
    "region": "EU",
    "slug": "swiss-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      40,
      25
    ],
    "carryOnWeightKg": 10,
    "iata": "IB",
    "name": "Iberia",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space available",
    "region": "EU",
    "slug": "iberia-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      20
    ],
    "carryOnWeightKg": 10,
    "iata": "TP",
    "name": "TAP Air Portugal",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Overhead space available",
    "region": "EU",
    "slug": "tap-air-portugal-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      35,
      23
    ],
    "carryOnWeightKg": 18,
    "iata": "DL",
    "name": "Delta",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      45,
      35,
      20
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "delta-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      35,
      22
    ],
    "carryOnWeightKg": 18,
    "iata": "UA",
    "name": "United Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      43,
      25,
      22
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "united-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      36,
      23
    ],
    "carryOnWeightKg": 18,
    "iata": "AA",
    "name": "American Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      45,
      35,
      20
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "american-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      61,
      41,
      25
    ],
    "carryOnWeightKg": 23,
    "iata": "WN",
    "name": "Southwest Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      47,
      34,
      22
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "southwest-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      46,
      25
    ],
    "carryOnWeightKg": 18,
    "iata": "NK",
    "name": "Spirit Airlines",
    "overheadFree": false,
    "personalIncluded": true,
    "personalItemCm": [
      45,
      35,
      20
    ],
    "policyNote": "Overhead space limited",
    "region": "NA",
    "slug": "spirit-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      61,
      41,
      25
    ],
    "carryOnWeightKg": 16,
    "iata": "F9",
    "name": "Frontier Airlines",
    "overheadFree": false,
    "personalIncluded": true,
    "personalItemCm": [
      45,
      35,
      20
    ],
    "policyNote": "Overhead space limited",
    "region": "NA",
    "slug": "frontier-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      35,
      23
    ],
    "carryOnWeightKg": 18,
    "iata": "B6",
    "name": "JetBlue",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      43,
      33,
      20
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "jetblue-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      35,
      23
    ],
    "carryOnWeightKg": 18,
    "iata": "AS",
    "name": "Alaska Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      43,
      33,
      20
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "alaska-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      23
    ],
    "carryOnWeightKg": 15,
    "iata": "AC",
    "name": "Air Canada",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      43,
      33,
      16
    ],
    "policyNote": "Verify fare class before departure.",
    "region": "NA",
    "slug": "air-canada-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      36,
      23
    ],
    "carryOnWeightKg": 15,
    "iata": "WS",
    "name": "WestJet",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      41,
      33,
      15
    ],
    "policyNote": "Personal item included",
    "region": "NA",
    "slug": "westjet-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      38,
      22
    ],
    "carryOnWeightKg": 7,
    "iata": "EK",
    "name": "Emirates",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Personal item included",
    "region": "ME",
    "slug": "emirates-carry-on-size"
  },
  {
    "carryOnCm": [
      50,
      37,
      25
    ],
    "carryOnWeightKg": 7,
    "iata": "QR",
    "name": "Qatar Airways",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Personal item included",
    "region": "ME",
    "slug": "qatar-airways-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      36,
      23
    ],
    "carryOnWeightKg": 7,
    "iata": "EY",
    "name": "Etihad Airways",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      39,
      30,
      19
    ],
    "policyNote": "Personal item included",
    "region": "ME",
    "slug": "etihad-airways-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      36,
      23
    ],
    "carryOnWeightKg": 7,
    "iata": "SQ",
    "name": "Singapore Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      10
    ],
    "policyNote": "Personal item included",
    "region": "APAC",
    "slug": "singapore-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      25
    ],
    "carryOnWeightKg": 10,
    "iata": "NH",
    "name": "ANA",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Personal item included",
    "region": "APAC",
    "slug": "ana-carry-on-size"
  },
  {
    "carryOnCm": [
      55,
      40,
      25
    ],
    "carryOnWeightKg": 10,
    "iata": "JL",
    "name": "Japan Airlines",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Personal item included",
    "region": "APAC",
    "slug": "japan-airlines-carry-on-size"
  },
  {
    "carryOnCm": [
      56,
      36,
      23
    ],
    "carryOnWeightKg": 7,
    "iata": "QF",
    "name": "Qantas",
    "overheadFree": true,
    "personalIncluded": true,
    "personalItemCm": [
      40,
      30,
      15
    ],
    "policyNote": "Personal item included",
    "region": "APAC",
    "slug": "qantas-carry-on-size"
  }
];
