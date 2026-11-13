import fs from "node:fs";
import path from "node:path";

/**
 * Generates the deterministic 210+ programmatic SEO route catalog across all 4 ScaleAndFit suites
 * directly from the verified engine datasets in src/engines/_data/*.json (falling back to src/engines/data).
 */
export function buildSeoRouteCatalog(webRoot) {
  const dataDir = path.join(webRoot, "src/engines/_data");
  const fallbackDir = path.resolve(webRoot, "../scaleandfit-engines/data");
  const resolvedDataDir = fs.existsSync(dataDir) ? dataDir : fallbackDir;

  const airlines = JSON.parse(fs.readFileSync(path.join(resolvedDataDir, "airlines.json"), "utf8"));
  const scrMat = JSON.parse(fs.readFileSync(path.join(resolvedDataDir, "screens_and_mattresses.json"), "utf8"));
  const holAvery = JSON.parse(fs.readFileSync(path.join(resolvedDataDir, "holidays_and_avery.json"), "utf8"));
  const extended = JSON.parse(fs.readFileSync(path.join(resolvedDataDir, "extended_footwear_photo.json"), "utf8"));

  const routes = [];

  // -------------------------------------------------------------------------
  // 1. SUITE 1: /visual-sizer/ (~69 routes)
  // -------------------------------------------------------------------------
  const tvPairs = [
    ["32-vs-43-inch-tv", '32" vs 43" TV Size Comparison', "32-tv-16x9", "43-tv-16x9", "Compare 32-inch vs 43-inch TV width, height, area delta (+80.6%), and viewing distance."],
    ["42-vs-48-inch-tv", '42" vs 48" OLED TV Comparison', "42-oled-tv-16x9", "48-oled-tv-16x9", "Compare 42-inch vs 48-inch OLED TV dimensions to exact scale for desks and bedrooms."],
    ["43-vs-50-inch-tv", '43" vs 50" TV Size Comparison', "43-tv-16x9", "50-tv-16x9", "See exact width, height, and +35.2% screen area difference between a 43-inch and 50-inch TV."],
    ["48-vs-55-inch-tv", '48" vs 55" TV Size Comparison', "48-oled-tv-16x9", "55-tv-16x9", "Visual comparison of 48-inch vs 55-inch TV sizes in cm and inches."],
    ["50-vs-55-inch-tv", '50" vs 55" TV Size Comparison', "50-tv-16x9", "55-tv-16x9", "Compare 50-inch and 55-inch TV cabinet fit and +21% screen area increase."],
    ["55-vs-65-inch-tv", '55" vs 65" TV Size Comparison', "55-tv-16x9", "65-tv-16x9", "Exact scale comparison of 55-inch vs 65-inch TVs (+39.7% screen area, cm/in table, seating distance)."],
    ["55-vs-75-inch-tv", '55" vs 75" TV Size Comparison', "55-tv-16x9", "75-tv-16x9", "Visualize upgrading from a 55-inch TV to a 75-inch TV (+85.9% total screen area)."],
    ["55-vs-77-inch-oled", '55" vs 77" OLED TV Comparison', "55-tv-16x9", "77-oled-tv-16x9", "Visual scale overlay of a 55-inch TV next to a 77-inch OLED cinema panel."],
    ["65-vs-75-inch-tv", '65" vs 75" TV Size Comparison', "65-tv-16x9", "75-tv-16x9", "Compare 65-inch vs 75-inch TV wall width, height, and +33.1% screen surface increase."],
    ["65-vs-77-inch-oled", '65" vs 77" OLED TV Comparison', "65-tv-16x9", "77-oled-tv-16x9", "See the exact +40.3% visual size jump between a 65-inch and 77-inch OLED TV."],
    ["65-vs-85-inch-tv", '65" vs 85" TV Size Comparison', "65-tv-16x9", "85-tv-16x9", "Check wall clearance and +71.0% area delta for a 65-inch vs 85-inch living room TV."],
    ["75-vs-85-inch-tv", '75" vs 85" TV Size Comparison', "75-tv-16x9", "85-tv-16x9", "Compare 75-inch and 85-inch TV widths in cm and inches plus seating distance."],
    ["77-vs-83-inch-oled", '77" vs 83" OLED TV Comparison', "77-oled-tv-16x9", "83-oled-tv-16x9", "Visual dimensions and +16.2% screen area comparison for 77-inch vs 83-inch OLED TVs."],
    ["83-vs-85-inch-tv", '83" vs 85" TV Size Comparison', "83-oled-tv-16x9", "85-tv-16x9", "Compare 83-inch OLED vs 85-inch QLED width and height differences."],
    ["85-vs-98-inch-tv", '85" vs 98" XL TV Comparison', "85-tv-16x9", "98-tv-16x9", "Visualize 85-inch vs 98-inch big screen dimensions (+32.9% display area)."],
    ["98-vs-100-inch-tv", '98" vs 100" TV Comparison', "98-tv-16x9", "100-tv-16x9", "Check exact millimeter and inch differences between 98-inch and 100-inch displays."],
    ["24-vs-27-inch-monitor", '24" vs 27" Monitor Comparison', "24-monitor-16x9", "27-monitor-16x9", "Compare 24-inch vs 27-inch 16:9 desktop monitor dimensions and +26.6% workspace."],
    ["27-vs-32-inch-monitor", '27" vs 32" Monitor Comparison', "27-monitor-16x9", "32-monitor-16x9", "Compare 27-inch vs 32-inch desktop monitor width, height, and desk fit."],
    ["27-inch-vs-34-inch-ultrawide", '27" vs 34" Ultrawide Monitor', "27-monitor-16x9", "34-ultrawide-21x9", "Compare 27-inch 16:9 height parity against a 34-inch 21:9 ultrawide display."],
    ["32-inch-vs-34-inch-ultrawide", '32" 16:9 vs 34" Ultrawide', "32-monitor-16x9", "34-ultrawide-21x9", "See why a 32-inch 16:9 is taller than a 34-inch 21:9 ultrawide monitor."],
    ["34-vs-38-inch-ultrawide", '34" vs 38" Ultrawide Monitor', "34-ultrawide-21x9", "38-ultrawide-21x9", "Visual overlay comparing 34-inch vs 38-inch 21:9 ultrawide productivity monitors."],
    ["34-vs-49-inch-ultrawide", '34" vs 49" Super Ultrawide', "34-ultrawide-21x9", "49-super-ultrawide-32x9", "Compare 34-inch 21:9 against a dual-27-inch 49-inch 32:9 super ultrawide display."],
    ["13-vs-14-inch-laptop", '13.3" vs 14" Laptop Screen', "13-3-laptop-16x10", "14-laptop-16x10", "Compare 13.3-inch vs 14-inch 16:10 laptop display width and height."],
    ["14-vs-16-inch-laptop", '14" vs 16" Laptop Screen', "14-laptop-16x10", "16-laptop-16x10", "Compare 14-inch vs 16-inch MacBook/Ultrabook 16:10 screen dimensions (+30.6% area)."],
    ["15-6-vs-16-inch-laptop", '15.6" vs 16" Laptop Screen', "15-6-laptop-16x9", "16-laptop-16x10", "Compare 15.6-inch 16:9 vs modern 16-inch 16:10 laptop display height."],
    ["15-6-vs-17-3-inch-laptop", '15.6" vs 17.3" Laptop Screen', "15-6-laptop-16x9", "17-3-laptop-16x9", "Visual scale comparison between 15.6-inch and 17.3-inch workstation laptops."],
  ];

  for (const [slug, title, idA, idB, description] of tvPairs) {
    const a = scrMat.screens.find((s) => s.id === idA) || scrMat.screens[0];
    const b = scrMat.screens.find((s) => s.id === idB) || scrMat.screens[1];
    routes.push({
      suite: "visual-sizer",
      kind: "screen-compare",
      slug,
      path: `/visual-sizer/${slug}/`,
      title: `${title} — Visual Scale Calculator | ScaleAndFit`,
      h1: title,
      description,
      preset: { mode: "screens", displayA: a.id, displayB: b.id },
      meta: { a, b },
    });
  }

  for (const air of airlines) {
    routes.push({
      suite: "visual-sizer",
      kind: "airline-bag",
      slug: air.slug,
      path: `/visual-sizer/${air.slug}/`,
      title: `${air.name} (${air.iata}) Carry-On & Personal Item Size Checker | ScaleAndFit`,
      h1: `${air.name} (${air.iata}) Carry-On Bag Sizer`,
      description: `Check if your bag fits ${air.name} cabin limits (${air.carryOnCm.join("×")} cm, ${air.carryOnWeightKg} kg) and under-seat personal item cage (${air.personalItemCm.join("×")} cm).`,
      preset: { mode: "airlines", airline: air.slug, bagL: air.carryOnCm[0], bagW: air.carryOnCm[1], bagD: air.carryOnCm[2], bagKg: air.carryOnWeightKg },
      meta: { airline: air },
    });
  }

  const mattressPairs = [
    ["twin-vs-twin-xl-mattress", "US Twin vs Twin XL Mattress Size", "us-twin", "us-twin-xl"],
    ["full-vs-queen-mattress", "US Full vs Queen Mattress Size", "us-full-double", "us-queen"],
    ["queen-vs-king-mattress", "US Queen vs King Mattress Size", "us-queen", "us-king"],
    ["king-vs-california-king-mattress", "US King vs California King Bed Size", "us-king", "us-california-king"],
    ["eu-140x200-vs-160x200-bed", "EU Double 140×200 vs Queen 160×200", "eu-double-140x200", "eu-queen-160x200"],
    ["eu-160x200-vs-180x200-bed", "EU Queen 160×200 vs King 180×200", "eu-queen-160x200", "eu-king-180x200"],
    ["uk-double-vs-king-mattress", "UK Double vs UK King Bed Size", "uk-double", "uk-king"],
    ["eu-king-vs-us-king-mattress", "EU King 180×200 vs US King Mattress", "eu-king-180x200", "us-king"],
  ];
  for (const [slug, h1, idA, idB] of mattressPairs) {
    const a = scrMat.mattresses.find((m) => m.id === idA) || scrMat.mattresses[0];
    const b = scrMat.mattresses.find((m) => m.id === idB) || scrMat.mattresses[3];
    routes.push({
      suite: "visual-sizer",
      kind: "mattress-compare",
      slug,
      path: `/visual-sizer/${slug}/`,
      title: `${h1} & Bedroom Clearance | ScaleAndFit`,
      h1,
      description: `Compare ${a.label} (${a.widthCm}×${a.lengthCm} cm) vs ${b.label} (${b.widthCm}×${b.lengthCm} cm) dimensions and bedroom floor clearance.`,
      preset: { mode: "mattresses", mattressA: a.id, mattressB: b.id },
      meta: { a, b },
    });
  }

  // -------------------------------------------------------------------------
  // 2. SUITE 2: /printable-paper/ (~46 routes)
  // -------------------------------------------------------------------------
  const paperSpecs = [
    ["5mm-dot-grid-a4", "5mm Dot Grid Paper A4 PDF", "a4", "dot-grid", 5],
    ["5mm-dot-grid-letter", "5mm Dot Grid Paper US Letter PDF", "letter", "dot-grid", 5],
    ["4mm-dot-grid-paper-pdf", "4mm Fine Dot Grid A4 PDF", "a4", "dot-grid", 4],
    ["5mm-graph-paper-a4", "5mm Graph Paper A4 PDF", "a4", "graph-grid", 5],
    ["1cm-graph-paper-a4", "10mm (1cm) Graph Paper A4 PDF", "a4", "graph-grid", 10],
    ["quarter-inch-graph-paper-letter", "Quarter-Inch Graph Paper Letter PDF", "letter", "graph-grid", 6.35],
    ["engineering-grid-paper-pdf", "Engineering 5mm Grid Letter PDF", "letter", "graph-grid", 5],
    ["isometric-dot-paper-pdf", "Isometric 5mm Dot Paper A4 PDF", "a4", "isometric-dots", 5],
    ["isometric-grid-paper-pdf", "Isometric Triangle Grid 10mm PDF", "a4", "isometric-grid", 10],
    ["cornell-notes-a4-pdf", "Cornell Notes Template A4 PDF", "a4", "cornell-notes", 7],
    ["cornell-notes-letter-pdf", "Cornell Notes Template US Letter PDF", "letter", "cornell-notes", 7],
    ["college-ruled-lined-paper-pdf", "College-Ruled Lined Paper PDF", "letter", "lined-ruled", 7.1],
    ["wide-ruled-lined-paper-pdf", "Wide-Ruled Lined Paper PDF", "letter", "lined-ruled", 8.7],
    ["a4-ruled-notebook-paper-pdf", "A4 8mm Ruled Writing Paper PDF", "a4", "lined-ruled", 8],
    ["primary-handwriting-paper-pdf", "Primary Handwriting Practice Paper PDF", "letter", "handwriting-primary", 6],
    ["calligraphy-slanted-grid-pdf", "Calligraphy 55-Degree Slant Guide PDF", "a4", "calligraphy-slant", 6],
    ["blank-sheet-music-staves-pdf", "Blank Sheet Music Staves PDF", "a4", "music-staff", 5],
    ["guitar-tab-paper-pdf", "Blank Guitar Tablature Paper PDF", "letter", "guitar-tab", 5],
  ];
  for (const [slug, h1, format, pattern, spacingMm] of paperSpecs) {
    routes.push({
      suite: "printable-paper",
      kind: "paper-grid",
      slug,
      path: `/printable-paper/${slug}/`,
      title: `${h1} — Exact Vector Scale | ScaleAndFit`,
      h1,
      description: `Customize line color, spacing (${spacingMm} mm) and download an exact vector ${format.toUpperCase()} PDF of ${h1.replace(" PDF", "")} directly in your browser.`,
      preset: { mode: "paper", format, pattern, spacingMm },
      meta: { format, pattern, spacingMm },
    });
  }

  const countryNames = {
    US: "United States", GB: "United Kingdom", BE: "Belgium", NL: "Netherlands", DE: "Germany",
    FR: "France", CA: "Canada", AU: "Australia", ES: "Spain", IT: "Italy",
  };
  for (const year of [2026, 2027]) {
    for (const [cc, cname] of Object.entries(countryNames)) {
      const cslug = cname.toLowerCase().replace(/\s+/g, "-");
      const slug = `${year}-${cslug}-holiday-calendar-pdf`;
      const hols = (holAvery.holidays[cc] || []).filter((h) => h.date.startsWith(`${year}-`));
      routes.push({
        suite: "printable-paper",
        kind: "holiday-calendar",
        slug,
        path: `/printable-paper/${slug}/`,
        title: `Printable ${year} ${cname} Holiday Calendar PDF | ScaleAndFit`,
        h1: `${year} ${cname} Public Holiday Calendar PDF`,
        description: `Generate a printable 12-month or monthly ${year} vector PDF calendar pre-filled with ${hols.length} ${cname} public holidays.`,
        preset: { mode: "calendar", country: cc, year, format: cc === "US" || cc === "CA" ? "letter" : "a4", month: 0 },
        meta: { year, cc, cname, holidays: hols },
      });
    }
  }

  for (const av of holAvery.avery) {
    const slug = `avery-${av.code.toLowerCase()}-template-pdf`;
    routes.push({
      suite: "printable-paper",
      kind: "avery-label",
      slug,
      path: `/printable-paper/${slug}/`,
      title: `${av.name} Die-Cut PDF Generator | ScaleAndFit`,
      h1: `${av.name} PDF Template`,
      description: `Print ${av.cols * av.rows}-per-sheet ${av.name} (${av.labelWidthMm}×${av.labelHeightMm} mm) with millimeter X/Y alignment calibration.`,
      preset: { mode: "avery", averyCode: av.code, format: av.paper },
      meta: { avery: av },
    });
  }

  // -------------------------------------------------------------------------
  // 3. SUITE 3: /size-converter/ (~56 routes)
  // -------------------------------------------------------------------------
  const baseBrands = [
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
    ...(extended.extraShoeBrands || []),
  ];

  const popularBrandPairs = [
    ["nike", "adidas"], ["adidas", "nike"], ["nike", "new-balance"], ["new-balance", "nike"],
    ["nike", "hoka"], ["hoka", "nike"], ["nike", "asics"], ["asics", "nike"],
    ["nike", "birkenstock"], ["birkenstock", "nike"], ["nike", "converse"], ["converse", "nike"],
    ["nike", "vans"], ["vans", "converse"], ["nike", "salomon"], ["salomon", "hoka"],
    ["nike", "on-running"], ["on-running", "hoka"], ["nike", "dr-martens"], ["nike", "crocs"],
    ["adidas", "new-balance"], ["adidas", "hoka"], ["adidas", "converse"], ["adidas", "birkenstock"],
    ["adidas", "vans"], ["adidas", "on-running"], ["adidas", "salomon"], ["adidas", "puma"],
    ["new-balance", "hoka"], ["new-balance", "asics"], ["new-balance", "saucony"], ["asics", "brooks"],
    ["hoka", "brooks"], ["saucony", "brooks"], ["mizuno", "asics"], ["merrell", "salomon"],
    ["timberland", "nike"], ["clarks", "dr-martens"], ["allbirds", "nike"], ["veja", "adidas"],
    ["reebok", "nike"], ["keen", "merrell"], ["under-armour", "nike"], ["puma", "adidas"],
  ];

  const brandBySlug = new Map(baseBrands.map((b) => [b.slug, b]));
  for (const [sFrom, sTo] of popularBrandPairs) {
    const bA = brandBySlug.get(sFrom) || baseBrands[0];
    const bB = brandBySlug.get(sTo) || baseBrands[1];
    const slug = `${bA.slug}-to-${bB.slug}-shoe-size`;
    routes.push({
      suite: "size-converter",
      kind: "shoe-pair",
      slug,
      path: `/size-converter/${slug}/`,
      title: `${bA.name} to ${bB.name} Shoe Size Converter (Mondopoint mm) | ScaleAndFit`,
      h1: `${bA.name} to ${bB.name} Shoe Size Converter`,
      description: `Convert ${bA.name} US/EU/UK shoe sizes to ${bB.name} using canonical Mondopoint millimeter last offsets.`,
      preset: { mode: "shoes", fromBrand: bA.slug, toBrand: bB.slug, gender: "mens", usSize: 10 },
      meta: { bA, bB },
    });
  }

  const systemAndRingSlugs = [
    ["us-to-eu-shoe-size-chart", "US to EU Shoe Size Chart & mm Converter", "shoes", { mode: "shoes", fromBrand: "nike", toBrand: "adidas", usSize: 9 }],
    ["eu-to-us-shoe-size-chart", "EU to US Shoe Size Chart & Mondopoint", "shoes", { mode: "shoes", fromBrand: "adidas", toBrand: "nike", usSize: 9.5 }],
    ["uk-to-us-shoe-size-chart", "UK to US Shoe Size Conversion Table", "shoes", { mode: "shoes", fromBrand: "clarks", toBrand: "nike", usSize: 9 }],
    ["cm-mondopoint-to-us-shoe-size", "CM / Mondopoint mm to US & EU Shoe Size", "shoes", { mode: "shoes", fromBrand: "asics", toBrand: "new-balance", usSize: 10 }],
    ["womens-to-mens-shoe-size-converter", "Women's to Men's US Shoe Size Converter", "shoes", { mode: "shoes", fromBrand: "nike", toBrand: "nike", gender: "womens", usSize: 8.5 }],
    ["us-to-eu-ring-size-converter", "US to EU Ring Size & Millimeter Chart", "rings", { mode: "rings", ringDiameterMm: 18.14 }],
    ["uk-to-us-ring-size-converter", "UK Letter to US Ring Size Converter", "rings", { mode: "rings", ringDiameterMm: 17.32 }],
    ["mm-diameter-to-us-ring-size", "Ring Diameter mm to US / EU / UK Converter", "rings", { mode: "rings", ringDiameterMm: 18.95 }],
    ["eu-to-fr-belgium-ring-size", "EU / ISO Circumference to Belgium & France Ring Size", "rings", { mode: "rings", ringDiameterMm: 17.5 }],
    ["jp-to-us-ring-size-converter", "Japan (JP) to US & EU Ring Size Converter", "rings", { mode: "rings", ringDiameterMm: 16.5 }],
    ["credit-card-ring-sizer-online", "Online On-Screen Ring Sizer (Credit Card Calibrated)", "rings", { mode: "rings", ringDiameterMm: 18.14 }],
    ["ring-circumference-mm-converter", "Ring Circumference mm Calculator", "rings", { mode: "rings", ringDiameterMm: 19.76 }],
  ];
  for (const [slug, h1, kindMode, preset] of systemAndRingSlugs) {
    routes.push({
      suite: "size-converter",
      kind: kindMode === "rings" ? "ring-guide" : "shoe-chart",
      slug,
      path: `/size-converter/${slug}/`,
      title: `${h1} | ScaleAndFit`,
      h1,
      description: `Interactive millimeter-calibrated ${h1.toLowerCase()} running 100% locally in your browser.`,
      preset,
      meta: { slug, h1 },
    });
  }

  // -------------------------------------------------------------------------
  // 4. SUITE 4: /passport-photo/ (~38 routes)
  // -------------------------------------------------------------------------
  const basePhotoSpecs = [
    { slug: "us-passport-photo-2x2", country: "United States", documentType: "Passport", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, notes: "2x2 inch square on white #FFFFFF backdrop." },
    { slug: "us-visa-ds160", country: "United States", documentType: "DS-160 Visa", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, notes: "600x600 px digital upload under 240 KB." },
    { slug: "schengen-visa-35x45", country: "Schengen Area", documentType: "Visa", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, notes: "Standard 35x45 mm EU biometric framing." },
    { slug: "belgium-passport-eid", country: "Belgium", documentType: "Passport & eID", widthMm: 35, heightMm: 45, minHeadMm: 31, maxHeadMm: 36, notes: "Belgian biometric passport & eID standard on plain white background." },
    { slug: "netherlands-pasfoto", country: "Netherlands", documentType: "Pasfoto Passport/ID", widthMm: 35, heightMm: 45, minHeadMm: 26, maxHeadMm: 30, notes: "Strict ear-to-ear centered pose with neutral expression." },
    { slug: "germany-biometric-passport", country: "Germany", documentType: "Reisepass & Personalausweis", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, notes: "German Schablone biometric mask proportions." },
    { slug: "france-passport-cni", country: "France", documentType: "Passeport & CNI", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, notes: "Light uniform off-white or pale grey-blue background." },
    { slug: "uk-passport-35x45", country: "United Kingdom", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 29, maxHeadMm: 34, notes: "Plain cream or light grey background, zero shadows." },
    { slug: "canada-passport-50x70", country: "Canada", documentType: "Passport & PR", widthMm: 50, heightMm: 70, minHeadMm: 31, maxHeadMm: 36, notes: "50x70 mm tall Canadian standard frame." },
    { slug: "australia-passport-35x45", country: "Australia", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, notes: "Plain white/light grey background with full chin to crown." },
    { slug: "india-passport-2x2", country: "India", documentType: "Passport & OCI", widthMm: 50.8, heightMm: 50.8, minHeadMm: 25, maxHeadMm: 35, notes: "51x51 mm square plain white backdrop." },
    { slug: "china-visa-33x48", country: "China", documentType: "Visa & Passport", widthMm: 33, heightMm: 48, minHeadMm: 28, maxHeadMm: 33, notes: "Strict 33x48 mm narrow frame with exposed ears." },
    { slug: "japan-passport-35x45", country: "Japan", documentType: "Passport", widthMm: 35, heightMm: 45, minHeadMm: 32, maxHeadMm: 36, notes: "35x45 mm borderless plain white/off-white." },
    { slug: "turkey-biometric-50x60", country: "Turkey", documentType: "Biometric Kimlik/Passport", widthMm: 50, heightMm: 60, minHeadMm: 32, maxHeadMm: 36, notes: "50x60 mm Turkish ICAO standard." },
    { slug: "linkedin-headshot-square", country: "Global", documentType: "CV & LinkedIn Headshot", widthMm: 100, heightMm: 100, minHeadMm: 48, maxHeadMm: 72, notes: "1200x1200 px 300-DPI square profile crop." },
    ...(extended.extraPhotoSpecs || []),
  ];

  const seenPhotoSlugs = new Set();
  for (const sp of basePhotoSpecs) {
    if (seenPhotoSlugs.has(sp.slug)) continue;
    seenPhotoSlugs.add(sp.slug);
    routes.push({
      suite: "passport-photo",
      kind: "photo-spec",
      slug: sp.slug,
      path: `/passport-photo/${sp.slug}/`,
      title: `${sp.country} ${sp.documentType} Photo Maker (${sp.widthMm}×${sp.heightMm} mm) | ScaleAndFit`,
      h1: `${sp.country} ${sp.documentType} Photo Studio`,
      description: `Crop & download a compliant ${sp.widthMm}×${sp.heightMm} mm ${sp.country} ${sp.documentType} photo or 4×6 print sheet 100% locally in your browser.`,
      preset: { specSlug: sp.slug },
      meta: { spec: sp },
    });
  }

  routes.push({
    suite: "passport-photo",
    kind: "photo-spec",
    slug: "us-passport-photo-4x6-print-sheet",
    path: "/passport-photo/us-passport-photo-4x6-print-sheet/",
    title: "US 2×2 Passport Photo 4×6 Print Sheet Generator | ScaleAndFit",
    h1: "US Passport 4×6 Print Sheet Maker",
    description: "Tile US 2×2 inch passport photos onto a 300-DPI 4×6 inch sheet with hairline scissor trim marks for cheap photo kiosk printing.",
    preset: { specSlug: "us-passport-2x2" },
    meta: { spec: basePhotoSpecs[0] },
  });
  routes.push({
    suite: "passport-photo",
    kind: "photo-spec",
    slug: "schengen-visa-photo-4x6-print-sheet",
    path: "/passport-photo/schengen-visa-photo-4x6-print-sheet/",
    title: "35×45mm EU / Schengen Passport Photo 10×15cm (4×6) Sheet | ScaleAndFit",
    h1: "35×45mm 6-Photo 10×15cm Print Sheet",
    description: "Generate a 6-photo 10×15cm (4×6 inch) print sheet of 35×45mm EU biometric photos locally in your browser.",
    preset: { specSlug: "schengen-visa-35x45" },
    meta: { spec: basePhotoSpecs[2] },
  });

  return routes;
}
