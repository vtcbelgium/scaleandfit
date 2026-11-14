import fs from "node:fs";
import path from "node:path";

/**
 * Generates the deterministic 550+ English base programmatic SEO route catalog across all 4 ScaleAndFit suites
 * directly from the verified engine datasets in src/engines/_data/*.json (falling back to ../scaleandfit-engines/data).
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
  // 1. SUITE 1: /visual-sizer/ (48 screens + 75 airlines + 25 airline vs + 16 mattresses = 164)
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
    // Wave 1 additions (+22 pairs -> 48 total)
    ["21-5-vs-24-inch-monitor", '21.5" vs 24" Monitor Comparison', "21-5-monitor-16x9", "24-monitor-16x9", "Compare compact 21.5-inch vs 24-inch office monitor width, height, and desk clearance."],
    ["24-vs-28-inch-monitor", '24" vs 28" 4K Monitor Comparison', "24-monitor-16x9", "28-4k-monitor-16x9", "See exact cm dimensions, VESA mount specs, and screen area gain from 24-inch to 28-inch 4K."],
    ["27-vs-28-inch-4k-monitor", '27" vs 28" 4K Monitor Size', "27-monitor-16x9", "28-4k-monitor-16x9", "Compare 27-inch vs 28-inch desktop displays in millimeter width and viewing distance."],
    ["27-vs-32-inch-oled-monitor", '27" vs 32" OLED Gaming Monitor', "27-monitor-16x9", "32-oled-monitor-16x9", "Visualize upgrading from a 27-inch display to a 32-inch OLED desktop panel (+40.5% area)."],
    ["32-vs-40-inch-ultrawide", '32" 16:9 vs 40" 5K2K Ultrawide', "32-oled-monitor-16x9", "40-ultrawide-21x9", "Compare vertical height and horizontal span between 32-inch 16:9 and 40-inch 21:9 ultrawide."],
    ["34-vs-40-inch-ultrawide", '34" vs 40" Ultrawide Monitor', "34-ultrawide-21x9", "40-ultrawide-21x9", "Exact desk width, height, and VESA ergonomic comparison of 34-inch vs 40-inch ultrawides."],
    ["38-vs-45-inch-oled-ultrawide", '38" vs 45" OLED Ultrawide', "38-ultrawide-21x9", "45-ultrawide-oled-21x9", "Compare 38-inch productivity panels against curved-class 45-inch OLED ultrawide footprints."],
    ["40-vs-49-inch-ultrawide", '40" Ultrawide vs 49" Super Ultrawide', "40-ultrawide-21x9", "49-super-ultrawide-32x9", "Compare 21:9 40-inch width vs extra-wide 32:9 49-inch monitor desk span and arm torque."],
    ["40-vs-43-inch-tv", '40" vs 43" TV Size Comparison', "40-tv-16x9", "43-tv-16x9", "Compare bedroom 40-inch vs 43-inch 16:9 TV width, VESA spacing, and viewing distance."],
    ["40-vs-50-inch-tv", '40" vs 50" TV Size Comparison', "40-tv-16x9", "50-tv-16x9", "Check exact +56.3% area increase and stand clearance upgrading a 40-inch to 50-inch TV."],
    ["43-vs-58-inch-tv", '43" vs 58" TV Size Comparison', "43-tv-16x9", "58-tv-16x9", "See exact width and +81.9% visual area jump from a 43-inch TV to a 58-inch screen."],
    ["48-vs-65-inch-tv", '48" OLED vs 65" TV Comparison', "48-oled-tv-16x9", "65-tv-16x9", "Visual overlay comparing a compact 48-inch OLED against a 65-inch living room TV (+83.4% area)."],
    ["50-vs-58-inch-tv", '50" vs 58" TV Size Comparison', "50-tv-16x9", "58-tv-16x9", "Compare 50-inch vs 58-inch television panel width, cabinet clearance, and seating distance."],
    ["50-vs-65-inch-tv", '50" vs 65" TV Size Comparison', "50-tv-16x9", "65-tv-16x9", "Visualize upgrading a 50-inch TV to a 65-inch centerpiece (+69.0% screen surface)."],
    ["55-vs-58-inch-tv", '55" vs 58" TV Size Comparison', "55-tv-16x9", "58-tv-16x9", "Compare subtle width (+6.6 cm) and +11.2% screen area between 55-inch and 58-inch TVs."],
    ["55-vs-70-inch-tv", '55" vs 70" TV Size Comparison', "55-tv-16x9", "70-tv-16x9", "Compare 55-inch vs 70-inch TV dimensions (+62.0% area), wall width, and SMPTE distance."],
    ["58-vs-65-inch-tv", '58" vs 65" TV Size Comparison', "58-tv-16x9", "65-tv-16x9", "Check width, VESA mount spacing, and +25.6% screen area difference from 58 to 65 inches."],
    ["65-vs-70-inch-tv", '65" vs 70" TV Size Comparison', "65-tv-16x9", "70-tv-16x9", "Compare 65-inch vs 70-inch TV cabinet width, height, and viewing cone recommendations."],
    ["70-vs-75-inch-tv", '70" vs 75" TV Size Comparison', "70-tv-16x9", "75-tv-16x9", "Exact scale difference between 70-inch and 75-inch big-screen TVs (+14.8% area)."],
    ["70-vs-85-inch-tv", '70" vs 85" TV Size Comparison', "70-tv-16x9", "85-tv-16x9", "Compare 70-inch vs 85-inch cinema walls in centimeters, VESA bracket size, and THX distance."],
    ["75-vs-98-inch-tv", '75" vs 98" Mega TV Comparison', "75-tv-16x9", "98-tv-16x9", "Visualize a 75-inch screen inside a 98-inch home-theater panel (+70.7% larger surface)."],
    ["77-vs-85-inch-tv", '77" OLED vs 85" TV Comparison', "77-oled-tv-16x9", "85-tv-16x9", "Compare flagship 77-inch OLED dimensions against an 85-inch LCD wall screen (+21.9% area)."],
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

  const airlineBySlug = new Map(airlines.map((a) => [a.slug, a]));
  const airlineComparePairs = [
    ["ryanair-vs-easyjet-cabin-bag", "ryanair-carry-on-size", "easyjet-carry-on-size"],
    ["ryanair-vs-wizz-air-baggage", "ryanair-carry-on-size", "wizz-air-carry-on-size"],
    ["vueling-vs-ryanair-carry-on", "vueling-carry-on-size", "ryanair-carry-on-size"],
    ["klm-vs-transavia-hand-luggage", "klm-carry-on-size", "transavia-carry-on-size"],
    ["lufthansa-vs-eurowings-carry-on", "lufthansa-carry-on-size", "eurowings-carry-on-size"],
    ["british-airways-vs-easyjet-cabin-bag", "british-airways-carry-on-size", "easyjet-carry-on-size"],
    ["united-vs-delta-carry-on", "united-airlines-carry-on-size", "delta-carry-on-size"],
    ["american-vs-southwest-carry-on", "american-airlines-carry-on-size", "southwest-airlines-carry-on-size"],
    ["spirit-vs-frontier-personal-item", "spirit-airlines-carry-on-size", "frontier-airlines-carry-on-size"],
    ["jet2-vs-ryanair-cabin-bag", "jet2-carry-on-size", "ryanair-carry-on-size"],
    ["air-france-vs-transavia-baggage", "air-france-carry-on-size", "transavia-carry-on-size"],
    ["airasia-vs-scoot-cabin-bag", "airasia-carry-on-size", "scoot-carry-on-size"],
    ["easyjet-vs-wizz-air-baggage", "easyjet-carry-on-size", "wizz-air-carry-on-size"],
    ["klm-vs-air-france-carry-on", "klm-carry-on-size", "air-france-carry-on-size"],
    ["lufthansa-vs-swiss-carry-on", "lufthansa-carry-on-size", "swiss-carry-on-size"],
    ["brussels-airlines-vs-ryanair-baggage", "brussels-airlines-carry-on-size", "ryanair-carry-on-size"],
    ["brussels-airlines-vs-lufthansa-baggage", "brussels-airlines-carry-on-size", "lufthansa-carry-on-size"],
    ["turkish-airlines-vs-pegasus-baggage", "turkish-airlines-carry-on-size", "pegasus-airlines-carry-on-size"],
    ["emirates-vs-qatar-carry-on", "emirates-carry-on-size", "qatar-airways-carry-on-size"],
    ["singapore-vs-cathay-pacific-carry-on", "singapore-airlines-carry-on-size", "cathay-pacific-carry-on-size"],
    ["jetblue-vs-delta-carry-on", "jetblue-carry-on-size", "delta-carry-on-size"],
    ["air-canada-vs-westjet-carry-on", "air-canada-carry-on-size", "westjet-carry-on-size"],
    ["aer-lingus-vs-ryanair-baggage", "aer-lingus-carry-on-size", "ryanair-carry-on-size"],
    ["norwegian-vs-sas-carry-on", "norwegian-carry-on-size", "sas-carry-on-size"],
    ["finnair-vs-sas-carry-on", "finnair-carry-on-size", "sas-carry-on-size"],
  ];

  for (const [slug, slugA, slugB] of airlineComparePairs) {
    const airA = airlineBySlug.get(slugA);
    const airB = airlineBySlug.get(slugB);
    if (!airA || !airB) continue;
    routes.push({
      suite: "visual-sizer",
      kind: "airline-compare",
      slug,
      path: `/visual-sizer/${slug}/`,
      title: `${airA.name} vs ${airB.name} Carry-On & Personal Item Size Comparison | ScaleAndFit`,
      h1: `${airA.name} (${airA.iata}) vs ${airB.name} (${airB.iata}) Cabin Bag Rules`,
      description: `Side-by-side comparison of ${airA.name} (${airA.carryOnCm.join("×")} cm, ${airA.carryOnWeightKg} kg) vs ${airB.name} (${airB.carryOnCm.join("×")} cm, ${airB.carryOnWeightKg} kg) cabin and under-seat sizer rules.`,
      preset: {
        mode: "airlines",
        airline: airA.slug,
        bagL: airB.carryOnCm[0],
        bagW: airB.carryOnCm[1],
        bagD: airB.carryOnCm[2],
        bagKg: airB.carryOnWeightKg,
      },
      meta: { airA, airB },
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
    // Wave 1 additions (+8 pairs -> 16 total)
    ["eu-80x200-vs-90x200-bed", "EU Narrow Single 80×200 vs Single 90×200", "eu-narrow-80x200", "eu-single-90x200"],
    ["eu-90x200-vs-140x200-bed", "EU Single 90×200 vs Double 140×200", "eu-single-90x200", "eu-double-140x200"],
    ["eu-140x190-vs-140x200-bed", "EU French 140×190 vs Standard 140×200", "eu-french-double-140x190", "eu-double-140x200"],
    ["eu-180x200-vs-200x200-bed", "EU King 180×200 vs Super King 200×200", "eu-king-180x200", "eu-super-king-200x200"],
    ["uk-king-vs-super-king-mattress", "UK King vs UK Super King Bed Size", "uk-king", "uk-super-king"],
    ["uk-super-king-vs-emperor-mattress", "UK Super King vs UK Emperor 200×200", "uk-super-king", "uk-emperor-200x200"],
    ["us-rv-short-queen-vs-queen-mattress", "US RV Short Queen vs Standard US Queen", "us-rv-short-queen", "us-queen"],
    ["eu-queen-160x200-vs-us-queen-mattress", "EU Queen 160×200 vs US Queen Mattress", "eu-queen-160x200", "us-queen"],
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
  // 2. SUITE 2: /printable-paper/ (40 grids + 40 calendars + 30 Avery/Herma = 110)
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
    // Wave 1 additions (+22 templates -> 40 total)
    ["2mm-millimeter-grid-a4", "2mm Technical Millimeter Paper A4 PDF", "a4", "graph-grid", 2],
    ["2mm-graph-paper-letter", "2mm Technical Graph Paper Letter PDF", "letter", "graph-grid", 2],
    ["1cm-graph-paper-letter", "10mm Centimeter Grid Paper Letter PDF", "letter", "graph-grid", 10],
    ["half-inch-graph-paper-letter", "Half-Inch (12.7mm) Grid Paper Letter PDF", "letter", "graph-grid", 12.7],
    ["eighth-inch-engineering-letter", "Eighth-Inch Engineering Paper Letter PDF", "letter", "graph-grid", 3.18],
    ["bullet-journal-6mm-dot-a4", "6mm Wide Dot Grid Journal A4 PDF", "a4", "dot-grid", 6],
    ["micro-dot-3mm-grid-a4", "3mm Micro Dot Grid A4 PDF", "a4", "dot-grid", 3],
    ["pcb-breadboard-2-54mm-dot-a4", "2.54mm (0.1 in) Prototyping Dot Grid A4 PDF", "a4", "dot-grid", 2.54],
    ["4mm-dot-grid-letter-pdf", "4mm Fine Dot Grid US Letter PDF", "letter", "dot-grid", 4],
    ["isometric-dots-letter-pdf", "Isometric 5mm Dot Grid US Letter PDF", "letter", "isometric-dots", 5],
    ["isometric-5mm-triangle-a4", "Isometric 5mm Triangle CAD Grid A4 PDF", "a4", "isometric-grid", 5],
    ["isometric-grid-letter-pdf", "Isometric 10mm Triangle Grid US Letter PDF", "letter", "isometric-grid", 10],
    ["cornell-notes-fine-6mm-a4", "6mm Compact Cornell Notes A4 PDF", "a4", "cornell-notes", 6],
    ["french-seyes-8mm-ruled-a4", "French 8mm Ruled Exercise Paper A4 PDF", "a4", "lined-ruled", 8],
    ["7mm-ruled-notebook-a4", "7mm Medium Ruled Writing Paper A4 PDF", "a4", "lined-ruled", 7],
    ["10mm-wide-ruled-a4", "10mm Wide Ruled Note Paper A4 PDF", "a4", "lined-ruled", 10],
    ["architect-drafting-10mm-a4", "10mm Architectural Layout Grid A4 PDF", "a4", "graph-grid", 10],
    ["cross-stitch-chart-3mm-a4", "3mm Cross-Stitch Pattern Grid A4 PDF", "a4", "graph-grid", 3],
    ["calligraphy-slant-letter-pdf", "Calligraphy 55-Degree Practice US Letter PDF", "letter", "calligraphy-slant", 6],
    ["music-staff-letter-pdf", "Blank 5-Line Sheet Music US Letter PDF", "letter", "music-staff", 5],
    ["guitar-tab-a4-pdf", "Blank Guitar Tablature A4 PDF", "a4", "guitar-tab", 5],
    ["handwriting-primary-a4-pdf", "Handwriting Practice Guide A4 PDF", "a4", "handwriting-primary", 6],
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
    US: "United States",
    GB: "United Kingdom",
    BE: "Belgium",
    NL: "Netherlands",
    DE: "Germany",
    FR: "France",
    CA: "Canada",
    AU: "Australia",
    ES: "Spain",
    IT: "Italy",
    IE: "Ireland",
    CH: "Switzerland",
    AT: "Austria",
    PT: "Portugal",
    PL: "Poland",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    JP: "Japan",
    MX: "Mexico",
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
        preset: { mode: "calendar", country: cc, year, format: cc === "US" || cc === "CA" || cc === "MX" ? "letter" : "a4", month: 0 },
        meta: { year, cc, cname, holidays: hols },
      });
    }
  }

  for (const av of holAvery.avery) {
    const codeLower = av.code.toLowerCase();
    const slug = codeLower.startsWith("herma-") ? `${codeLower}-template-pdf` : `avery-${codeLower}-template-pdf`;
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
  // 3. SUITE 3: /size-converter/ (120 shoe pairs + 25 shoe charts + 20 rings = 165)
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

  const seenShoePairKeys = new Set(popularBrandPairs.map(([a, b]) => `${a}->${b}`));
  const allBrandSlugs = baseBrands.map((b) => b.slug);
  const anchorTargets = ["nike", "adidas", "new-balance", "hoka", "asics", "salomon", "converse", "birkenstock"];

  // Deterministically expand popular brand pairs up to 120 unique cross-brand lookups
  for (const anchor of anchorTargets) {
    for (const other of allBrandSlugs) {
      if (popularBrandPairs.length >= 120) break;
      if (anchor === other) continue;
      const forward = `${other}->${anchor}`;
      if (!seenShoePairKeys.has(forward)) {
        seenShoePairKeys.add(forward);
        popularBrandPairs.push([other, anchor]);
      }
      if (popularBrandPairs.length >= 120) break;
      const reverse = `${anchor}->${other}`;
      if (!seenShoePairKeys.has(reverse)) {
        seenShoePairKeys.add(reverse);
        popularBrandPairs.push([anchor, other]);
      }
    }
    if (popularBrandPairs.length >= 120) break;
  }

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
    ["us-to-eu-shoe-size-chart", "US to EU Shoe Size Chart & mm Converter", "shoes", { mode: "shoes", fromBrand: "nike", toBrand: "adidas", usSize: 9 }, "US to EU"],
    ["eu-to-us-shoe-size-chart", "EU to US Shoe Size Chart & Mondopoint", "shoes", { mode: "shoes", fromBrand: "adidas", toBrand: "nike", usSize: 9.5 }, "EU to US"],
    ["uk-to-us-shoe-size-chart", "UK to US Shoe Size Conversion Table", "shoes", { mode: "shoes", fromBrand: "clarks", toBrand: "nike", usSize: 9 }, "UK to US"],
    ["cm-mondopoint-to-us-shoe-size", "CM / Mondopoint mm to US & EU Shoe Size", "shoes", { mode: "shoes", fromBrand: "asics", toBrand: "new-balance", usSize: 10 }, "CM / Mondopoint"],
    ["womens-to-mens-shoe-size-converter", "Women's to Men's US Shoe Size Converter", "shoes", { mode: "shoes", fromBrand: "nike", toBrand: "nike", gender: "womens", usSize: 8.5 }, "Women's to Men's US"],
    // +10 specific EU sizes -> US / UK / cm
    ...[37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map((eu) => [
      `eu-${eu}-to-us-shoe-size`,
      `EU ${eu} Shoe Size in US, UK & Centimeters`,
      "shoes",
      { mode: "shoes", fromBrand: "nike", toBrand: "adidas", usSize: Number((Math.round((((eu * (20 / 3) - 15) / 10 - 18) * 2)) / 2).toFixed(1)) },
      `EU ${eu}`,
    ]),
    // +10 specific cm foot-length lookups
    ...[23.5, 24, 24.5, 25, 25.5, 26, 26.5, 27, 27.5, 28].map((cm) => [
      `${String(cm).replace(".", "-")}-cm-foot-to-shoe-size`,
      `${cm} cm (${Math.round(cm * 10)} mm) Foot Length to US, EU & UK Shoe Size`,
      "shoes",
      { mode: "shoes", fromBrand: "nike", toBrand: "new-balance", usSize: Number((Math.round(((cm - 18) * 2)) / 2).toFixed(1)) },
      `${cm} cm (${Math.round(cm * 10)} mm)`,
    ]),
    // Ring size charts (7 existing + 13 specific sizes = 20 total)
    ["us-to-eu-ring-size-converter", "US to EU Ring Size & Millimeter Chart", "rings", { mode: "rings", ringDiameterMm: 18.14 }, "US to EU Scale"],
    ["uk-to-us-ring-size-converter", "UK Letter to US Ring Size Converter", "rings", { mode: "rings", ringDiameterMm: 17.32 }, "UK to US Scale"],
    ["mm-diameter-to-us-ring-size", "Ring Diameter mm to US / EU / UK Converter", "rings", { mode: "rings", ringDiameterMm: 18.95 }, "Diameter mm Scale"],
    ["eu-to-fr-belgium-ring-size", "EU / ISO Circumference to Belgium & France Ring Size", "rings", { mode: "rings", ringDiameterMm: 17.5 }, "EU / BE / FR Circumference"],
    ["jp-to-us-ring-size-converter", "Japan (JP) to US & EU Ring Size Converter", "rings", { mode: "rings", ringDiameterMm: 16.5 }, "Japan (JP) Ring Scale"],
    ["credit-card-ring-sizer-online", "Online On-Screen Ring Sizer (Credit Card Calibrated)", "rings", { mode: "rings", ringDiameterMm: 18.14 }, "Credit Card Calibration"],
    ["ring-circumference-mm-converter", "Ring Circumference mm Calculator", "rings", { mode: "rings", ringDiameterMm: 19.76 }, "Circumference mm Formula"],
    ...[5, 6, 7, 8, 9, 10, 11].map((us) => {
      const d = Number((11.63 + us * 0.8128).toFixed(2));
      return [
        `us-${us}-ring-size-in-mm-eu-uk`,
        `US Size ${us} Ring in mm, EU & UK Letters`,
        "rings",
        { mode: "rings", ringDiameterMm: d },
        `US Size ${us} (${d} mm)`,
      ];
    }),
    ...[15, 16, 17, 18, 19, 20].map((mm) => [
      `${mm}-mm-ring-diameter-size-chart`,
      `${mm} mm Inside Ring Diameter to US, EU, UK & JP`,
      "rings",
      { mode: "rings", ringDiameterMm: mm },
      `${mm} mm Inside Diameter`,
    ]),
  ];
  for (const [slug, h1, kindMode, preset, metricLabel] of systemAndRingSlugs) {
    routes.push({
      suite: "size-converter",
      kind: kindMode === "rings" ? "ring-guide" : "shoe-chart",
      slug,
      path: `/size-converter/${slug}/`,
      title: `${h1} | ScaleAndFit`,
      h1,
      description: `Interactive millimeter-calibrated ${h1.toLowerCase()} running locally in your browser (${metricLabel}).`,
      preset,
      meta: { slug, h1, metricLabel },
    });
  }

  // -------------------------------------------------------------------------
  // 4. SUITE 4: /passport-photo/ (90 country specs + 25 print sheets = 115)
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

  const photoBySlug = new Map();
  const seenPhotoSlugs = new Set();
  for (const sp of basePhotoSpecs) {
    if (seenPhotoSlugs.has(sp.slug)) continue;
    seenPhotoSlugs.add(sp.slug);
    photoBySlug.set(sp.slug, sp);
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

  const printSheets = [
    ["us-passport-photo-4x6-print-sheet", "US 2×2 Passport Photo 4×6 Print Sheet Generator | ScaleAndFit", "US Passport 4×6 Print Sheet Maker", "Tile US 2×2 inch passport photos onto a 300-DPI 4×6 inch sheet with hairline scissor trim marks for photo kiosk printing.", "us-passport-photo-2x2", "Standard 4×6 Kiosk Sheet (US 2×2\")"],
    ["schengen-visa-photo-4x6-print-sheet", "35×45mm EU / Schengen Passport Photo 10×15cm (4×6) Sheet | ScaleAndFit", "35×45mm 6-Photo 10×15cm Print Sheet", "Generate a 6-photo 10×15cm (4×6 inch) print sheet of 35×45mm EU biometric photos locally in your browser.", "schengen-visa-35x45", "EU Schengen 10×15 cm Print Sheet"],
    ["walgreens-passport-photo-4x6-sheet", "Walgreens 4×6 Passport Photo Print Sheet (2×2 in) | ScaleAndFit", "Walgreens 4×6 Passport Photo Sheet", "Format two 2×2 inch US passport photos onto a 300-DPI 4×6 photo kiosk print file compatible with Walgreens self-service kiosks.", "us-passport-photo-2x2", "Walgreens 4×6 Kiosk"],
    ["cvs-passport-photo-4x6-sheet", "CVS Photo 4×6 Passport Sheet Generator (US 2×2 in) | ScaleAndFit", "CVS 4×6 Passport Photo Sheet", "Create a crisp 300-DPI 4×6 inch collage of compliant 2×2 inch passport photos ready for CVS Kodak Picture Kiosk printing.", "us-passport-photo-2x2", "CVS 4×6 Photo Kiosk"],
    ["walmart-passport-photo-4x6-sheet", "Walmart 4×6 Passport Photo Template Generator | ScaleAndFit", "Walmart 4×6 Passport Photo Sheet", "Arrange compliant 2×2 inch US passport portraits on a standard 4×6 inch 300-DPI sheet for Walmart Photo printing.", "us-passport-photo-2x2", "Walmart 4×6 Photo"],
    ["target-passport-photo-4x6-sheet", "Target 4×6 Passport Photo Sheet Maker (2×2 in) | ScaleAndFit", "Target 4×6 Passport Photo Sheet", "Prepare a clean 1200×1800 px 4×6 sheet of biometric 2×2 inch portraits cleanly in browser memory.", "us-passport-photo-2x2", "Target 4×6 Print"],
    ["staples-passport-photo-4x6-sheet", "Staples 4×6 Passport Photo Print Sheet Maker | ScaleAndFit", "Staples 4×6 Passport Photo Sheet", "Generate exact millimeter-scaled 2×2 inch US passport photos on a 4×6 sheet ready for Staples photo counters.", "us-passport-photo-2x2", "Staples 4×6 Print"],
    ["ups-store-passport-photo-4x6-sheet", "UPS Store 4×6 Passport Photo Template (300 DPI) | ScaleAndFit", "UPS Store 4×6 Passport Photo Sheet", "Export a 300-DPI 4×6 print layout of official 2×2 inch passport portraits for UPS print counters.", "us-passport-photo-2x2", "UPS Store 4×6"],
    ["kruidvat-pasfoto-10x15-afdrukvel", "Kruidvat 10×15 cm Pasfoto Afdrukvel (35×45 mm) | ScaleAndFit", "Kruidvat 10×15 Pasfoto Vel", "Plaats 6 officiële Nederlandse pasfoto's (35×45 mm) op een 300 DPI 10×15 cm fotovel voor Kruidvat CEWE fotostations.", "netherlands-pasfoto", "Kruidvat 10×15 cm"],
    ["hema-pasfoto-10x15-afdrukvel", "HEMA 10×15 cm Pasfoto Vel Maken (35×45 mm) | ScaleAndFit", "HEMA 10×15 Pasfoto Afdrukvel", "Maak direct een scherp 10×15 cm fotovel met 6 Nederlandse 35×45 mm pasfoto's klaar om bij HEMA te printen.", "netherlands-pasfoto", "HEMA 10×15 cm"],
    ["etos-pasfoto-10x15-afdrukvel", "Etos 10×15 cm Pasfoto Sheet Generator (NL) | ScaleAndFit", "Etos 10×15 Pasfoto Sheet", "Genereer een 300 DPI 10×15 cm printvel met zes Nederlandse pasfoto's en knipmarkeringen in uw browser.", "netherlands-pasfoto", "Etos 10×15 cm"],
    ["primera-pasfoto-10x15-afdrukvel", "Primera 10×15 cm Pasfoto Afdrukvel Maker | ScaleAndFit", "Primera 10×15 Pasfoto Vel", "Stel thuis een officieel 35×45 mm pasfoto afdrukvel (10×15 cm) samen zonder opslag op servers.", "netherlands-pasfoto", "Primera 10×15 cm"],
    ["dm-passbild-10x15-druckbogen", "dm Paradies-Foto 10×15 cm Passbild Druckbogen | ScaleAndFit", "dm 10×15 Passbild Bogen", "Erstellen Sie einen 300-DPI 10×15 cm Druckbogen mit sechs 35×45 mm biometrischen Passfotos für den dm Foto-Drucker.", "germany-biometric-passport", "dm 10×15 cm"],
    ["rossmann-passbild-10x15-druckbogen", "Rossmann 10×15 cm Passfoto Bogen (35×45 mm) | ScaleAndFit", "Rossmann 10×15 Passbild Bogen", "Bereiten Sie bis zu 6 deutsche 35×45 mm Reisepassbilder auf einem standardisierten 10×15 cm Fotoblatt lokal vor.", "germany-biometric-passport", "Rossmann 10×15 cm"],
    ["mueller-passbild-10x15-druckbogen", "Müller 10×15 cm Passfoto Druckvorlage (DE) | ScaleAndFit", "Müller 10×15 Passfoto Vorlage", "Exportieren Sie sechs biometrische 35×45 mm Fotos als druckfertige 10×15 cm Vorlage für Müller Foto-Automaten.", "germany-biometric-passport", "Müller 10×15 cm"],
    ["photomaton-planche-identite-10x15", "Planche Photo d'Identité 10×15 cm (6 Photos 35×45 mm FR) | ScaleAndFit", "Planche Photo Identité 10×15 FR", "Générez localement une planche 10×15 cm 300 DPI contenant 6 photos d'identité françaises 35×45 mm avec traits de coupe.", "france-passport-cni", "Planche 10×15 France"],
    ["carrefour-planche-photo-identite-10x15", "Carrefour / Auchan Planche 10×15 cm Photo Passeport | ScaleAndFit", "Carrefour Borne 10×15 Photo ID", "Préparez une planche 10×15 cm à 300 DPI compatible avec les bornes d'impression rapide en magasin.", "france-passport-cni", "Carrefour Borne 10×15"],
    ["boots-uk-passport-photo-4x6-sheet", "Boots UK 4×6 Passport Photo Print Sheet (35×45 mm) | ScaleAndFit", "Boots UK 4×6 Passport Photo Sheet", "Generate a 6-photo 4×6 inch (10×15 cm) sheet of UK 35×45 mm passport portraits ready for Boots instant print kiosks.", "uk-passport-35x45", "Boots UK 4×6"],
    ["post-office-uk-passport-4x6-sheet", "UK Passport 35×45 mm 4×6 Print Sheet & HMPO Crop | ScaleAndFit", "UK 35×45 mm 4×6 Print Sheet", "Create a 300-DPI 4×6 print layout of compliant 35×45 mm UK passport photos with clean trim hairlines.", "uk-passport-35x45", "UK Standard 4×6"],
    ["shoppers-drug-mart-passport-4x6-sheet", "Shoppers Drug Mart Canada 50×70 mm 4×6 Photo Sheet | ScaleAndFit", "Canada 50×70 mm 4×6 Print Sheet", "Arrange tall 50×70 mm Canadian passport portraits neatly onto a 4×6 inch 300-DPI print layout.", "canada-passport-50x70", "Canada 50×70 mm 4×6"],
    ["officeworks-passport-photo-4x6-sheet", "Officeworks Australia 35×45 mm 4×6 Photo Sheet | ScaleAndFit", "Officeworks 4×6 Passport Sheet", "Tile Australian 35×45 mm passport photos at 300 DPI onto a standard 4×6 inch sheet for kiosk printing.", "australia-passport-35x45", "Officeworks AU 4×6"],
    ["belgium-passport-10x15-print-sheet", "Belgium eID & Passport 10×15 cm (6-Photo) Sheet | ScaleAndFit", "Belgium 35×45 mm 10×15 Print Sheet", "Download a 6-up 10×15 cm sheet of Belgian 35×45 mm biometric passport and eID photos with cutting guides.", "belgium-passport-eid", "Belgium 10×15 cm"],
    ["netherlands-pasfoto-10x15-print-sheet", "Netherlands Pasfoto 10×15 cm Print Sheet Maker | ScaleAndFit", "Netherlands 35×45 mm 10×15 Sheet", "Export six 35×45 mm Dutch Pasfoto portraits centered on a 10×15 cm 300-DPI photo sheet.", "netherlands-pasfoto", "Netherlands 10×15 cm"],
    ["germany-biometric-10x15-print-sheet", "Germany Reisepass 10×15 cm 6-Photo Print Sheet | ScaleAndFit", "Germany 35×45 mm 10×15 Sheet", "Tile six German biometric 35×45 mm portraits onto a 10×15 cm photo sheet at exact 300 DPI resolution.", "germany-biometric-passport", "Germany 10×15 cm"],
    ["india-passport-4x6-print-sheet", "India Passport 2×2 Inch 4×6 Print Sheet Generator | ScaleAndFit", "India 2×2\" Passport 4×6 Sheet", "Create a crisp 4×6 inch sheet of 51×51 mm Indian passport & OCI photos cleanly inside browser memory.", "india-passport-2x2", "India 2×2\" 4×6"],
  ];

  for (const [slug, title, h1, description, specLookup, sheetRetailer] of printSheets) {
    const sp = photoBySlug.get(specLookup) || basePhotoSpecs[0];
    routes.push({
      suite: "passport-photo",
      kind: "photo-spec",
      slug,
      path: `/passport-photo/${slug}/`,
      title,
      h1,
      description,
      preset: { specSlug: sp.slug === "us-passport-photo-2x2" ? "us-passport-2x2" : sp.slug },
      meta: { spec: sp, sheetRetailer },
    });
  }

  return routes;
}
