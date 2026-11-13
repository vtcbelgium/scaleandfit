export function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dispMetrics(d) {
  const h = Math.hypot(d.aspectW, d.aspectH);
  const wIn = d.diagonalIn * (d.aspectW / h);
  const hIn = d.diagonalIn * (d.aspectH / h);
  const wCm = wIn * 2.54;
  const hCm = hIn * 2.54;
  const areaIn = wIn * hIn;
  const areaCm = wCm * hCm;
  return { wIn, hIn, wCm, hCm, areaIn, areaCm };
}

export function renderRouteReferenceHtml(route, allRoutes) {
  const sameSuite = allRoutes.filter((r) => r.suite === route.suite && r.slug !== route.slug);
  const offset = allRoutes.indexOf(route) % Math.max(1, sameSuite.length);
  const related = [];
  for (let i = 0; i < Math.min(8, sameSuite.length); i++) {
    related.push(sameSuite[(offset + i * 3) % sameSuite.length]);
  }
  const uniqueRelated = [...new Map(related.map((r) => [r.path, r])).values()].slice(0, 6);

  let tableHtml = "";
  let faqs = [];

  if (route.kind === "screen-compare") {
    const { a, b } = route.meta;
    const mA = dispMetrics(a);
    const mB = dispMetrics(b);
    const areaPct = (((mB.areaIn / mA.areaIn) - 1) * 100).toFixed(1);
    const wDiffCm = (mB.wCm - mA.wCm).toFixed(1);
    const hDiffCm = (mB.hCm - mA.hCm).toFixed(1);
    tableHtml = `
      <h2>Exact Dimension Comparison: ${escapeHtml(a.label)} vs ${escapeHtml(b.label)}</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Specification</th><th>${escapeHtml(a.label)} (${a.aspectW}:${a.aspectH})</th><th>${escapeHtml(b.label)} (${b.aspectW}:${b.aspectH})</th><th>Delta</th></tr></thead>
          <tbody>
            <tr><td>Visible Width</td><td>${mA.wCm.toFixed(1)} cm (${mA.wIn.toFixed(1)} in)</td><td>${mB.wCm.toFixed(1)} cm (${mB.wIn.toFixed(1)} in)</td><td>${Number(wDiffCm) >= 0 ? "+" : ""}${wDiffCm} cm</td></tr>
            <tr><td>Visible Height</td><td>${mA.hCm.toFixed(1)} cm (${mA.hIn.toFixed(1)} in)</td><td>${mB.hCm.toFixed(1)} cm (${mB.hIn.toFixed(1)} in)</td><td>${Number(hDiffCm) >= 0 ? "+" : ""}${hDiffCm} cm</td></tr>
            <tr><td>Screen Surface Area</td><td>${mA.areaCm.toFixed(0)} cm² (${mA.areaIn.toFixed(0)} in²)</td><td>${mB.areaCm.toFixed(0)} cm² (${mB.areaIn.toFixed(0)} in²)</td><td>+${areaPct}% area</td></tr>
            <tr><td>30° SMPTE Viewing Distance</td><td>${((mA.wCm / 100) * 1.866).toFixed(2)} m</td><td>${((mB.wCm / 100) * 1.866).toFixed(2)} m</td><td>Optimum mixed usage</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `How much bigger is a ${b.label} than a ${a.label}?`,
        a: `Compared diagonally, a ${b.label} measures ${mB.wCm.toFixed(1)} cm wide by ${mB.hCm.toFixed(1)} cm tall, delivering ${areaPct}% more total screen area than a ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
      },
      {
        q: `What media console width fits a ${b.label}?`,
        a: `Ensure at least ${(mB.wCm + 15).toFixed(0)} cm (${((mB.wCm + 15) / 2.54).toFixed(0)} in) of wall or stand width to allow safe bezel and side clearance for a ${b.label}.`,
      },
      {
        q: "Does ScaleAndFit compute dimensions privately?",
        a: "Yes. Every display ratio calculation and scaled SVG overlay renders 100% locally in your browser with zero tracking cookies.",
      },
    ];
  } else if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    tableHtml = `
      <h2>${escapeHtml(air.name)} (${escapeHtml(air.iata)}) Baggage Allowance Reference</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Bag Category</th><th>Metric (cm)</th><th>Imperial (in)</th><th>Max Weight / Inclusion</th></tr></thead>
          <tbody>
            <tr><td>Cabin Overhead Bag</td><td>${air.carryOnCm.join(" × ")} cm</td><td>${air.carryOnCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.carryOnWeightKg} kg · ${air.overheadFree ? "Included in standard fare" : "Requires Priority / Cabin upgrade on basic fare"}</td></tr>
            <tr><td>Personal Under-Seat Item</td><td>${air.personalItemCm.join(" × ")} cm</td><td>${air.personalItemCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.personalIncluded ? "Included under front seat" : "Check fare rules"}</td></tr>
          </tbody>
        </table>
      </div>
      <p style="color:var(--muted);font-size:.9rem;margin-top:8px">Carrier note: ${escapeHtml(air.policyNote)}</p>`;
    faqs = [
      {
        q: `What are the carry-on dimensions for ${air.name} (${air.iata})?`,
        a: `${air.name} allows overhead cabin bags up to ${air.carryOnCm.join(" × ")} cm (${air.carryOnWeightKg} kg max) and under-seat personal items up to ${air.personalItemCm.join(" × ")} cm.`,
      },
      {
        q: `Does ${air.name} include an overhead cabin bag on basic tickets?`,
        a: air.overheadFree
          ? `Yes, standard economy tickets on ${air.name} generally include an overhead cabin bag, though ultra-basic promotional fares should still be checked.`
          : `On ${air.name}'s entry basic fare, only the under-seat personal item (${air.personalItemCm.join(" × ")} cm) is free; overhead cabin rolling bags require selecting an upgraded fare.`,
      },
      {
        q: "Do bag handles and wheels count toward airline sizer limits?",
        a: "Yes. Airport metal sizer cages include protruding spinner wheels, side handles, and front pockets.",
      },
    ];
  } else if (route.kind === "mattress-compare") {
    const { a, b } = route.meta;
    const areaDelta = ((((b.widthCm * b.lengthCm) / (a.widthCm * a.lengthCm)) - 1) * 100).toFixed(1);
    tableHtml = `
      <h2>${escapeHtml(a.label)} vs ${escapeHtml(b.label)} Exact Dimensions</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Dimension</th><th>${escapeHtml(a.label)}</th><th>${escapeHtml(b.label)}</th></tr></thead>
          <tbody>
            <tr><td>Width</td><td>${a.widthCm} cm (${(a.widthCm / 2.54).toFixed(1)} in)</td><td>${b.widthCm} cm (${(b.widthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Length</td><td>${a.lengthCm} cm (${(a.lengthCm / 2.54).toFixed(1)} in)</td><td>${b.lengthCm} cm (${(b.lengthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Surface Area Delta</td><td colspan="2">${Number(areaDelta) >= 0 ? "+" : ""}${areaDelta}% sleep area difference</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `What is the width difference between ${a.label} and ${b.label}?`,
        a: `${b.label} measures ${b.widthCm} cm wide while ${a.label} measures ${a.widthCm} cm wide (${(b.widthCm - a.widthCm).toFixed(1)} cm difference).`,
      },
      {
        q: `What is the minimum bedroom size for a ${b.label}?`,
        a: `Allow at least ${(b.widthCm + 120).toFixed(0)} cm room width for 60 cm walking clearance on both sides.`,
      },
    ];
  } else if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmtW = format === "a4" ? 210 : 215.9;
    const fmtH = format === "a4" ? 297 : 279.4;
    tableHtml = `
      <h2>Vector PDF Print Sheet Specifications</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Property</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Paper Format</td><td>${format === "a4" ? "ISO A4 (210 × 297 mm)" : "US Letter (8.5 × 11 in / 215.9 × 279.4 mm)"}</td></tr>
            <tr><td>Grid / Line Spacing</td><td>${spacingMm} mm exact PostScript points (${((spacingMm * 72) / 25.4).toFixed(2)} pt)</td></tr>
            <tr><td>Default Safe Margin</td><td>12 mm (${Math.floor((fmtW - 24) / spacingMm)} cols × ${Math.floor((fmtH - 24) / spacingMm)} rows printable grid)</td></tr>
            <tr><td>Printer Scale Setting</td><td>Always select "Actual Size" / "100% Scale" when printing</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: "Are PDF dimensions true to millimeter scale when printed?",
        a: `Yes. ScaleAndFit writes exact vector geometry at 72 PostScript points per inch (${format.toUpperCase()} ${fmtW}×${fmtH} mm). Print at 100% / Actual Size rather than "Fit to Page" for true ruler accuracy.`,
      },
      {
        q: "Does the PDF include any brand stamps or signups?",
        a: "No. Your customized PDF is synthesized locally in browser memory with pdf-lib and downloaded immediately without accounts or server uploads.",
      },
    ];
  } else if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    tableHtml = `
      <h2>${year} ${escapeHtml(cname)} National Holidays Included in PDF</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>ISO Date</th><th>Holiday Name</th></tr></thead>
          <tbody>
            ${holidays.map((h) => `<tr><td>${h.date}</td><td>${escapeHtml(h.name)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `Can I print all 12 months of ${year} for ${cname} at once?`,
        a: `Yes. Keep Scope set to "Full 12-Month Pack" and click Download Holiday Calendar PDF to generate a ready-to-print 12-page landscape PDF.`,
      },
      {
        q: "Can I switch between Monday-first and Sunday-first weeks?",
        a: "Yes. Use the Week Starts dropdown above to toggle ISO Monday-first or North American Sunday-first calendar grids before downloading.",
      },
    ];
  } else if (route.kind === "avery-label") {
    const av = route.meta.avery;
    tableHtml = `
      <h2>${escapeHtml(av.name)} Die-Cut Grid Geometry</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Parameter</th><th>Specification</th></tr></thead>
          <tbody>
            <tr><td>Sheet Size</td><td>${av.paper.toUpperCase()}</td></tr>
            <tr><td>Layout Grid</td><td>${av.cols} columns × ${av.rows} rows (${av.cols * av.rows} labels/sheet)</td></tr>
            <tr><td>Single Label Size</td><td>${av.labelWidthMm} × ${av.labelHeightMm} mm</td></tr>
            <tr><td>Top / Left Margin</td><td>${av.marginTopMm} mm top · ${av.marginLeftMm} mm left</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `What if my printer feeds slightly off-center on ${av.code} sheets?`,
        a: "Test-print on plain paper first, hold it behind an Avery sheet against a window, and use our ±5 mm X/Y Nudge calibration sliders before exporting the final PDF.",
      },
    ];
  } else if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const sampleUs = [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
    const fromB = route.meta.bA || { name: "Nike", offsetMm: 0 };
    const toB = route.meta.bB || { name: "Adidas", offsetMm: 2 };
    tableHtml = `
      <h2>${escapeHtml(fromB.name)} to ${escapeHtml(toB.name)} Quick Men's Conversion Chart</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>${escapeHtml(fromB.name)} US</th><th>Foot Length (Mondopoint)</th><th>${escapeHtml(toB.name)} US</th><th>Est. EU Size</th></tr></thead>
          <tbody>
            ${sampleUs
              .map((u) => {
                const mondo = Math.round((u + 18) * 10 + fromB.offsetMm);
                const tUs = Math.round(((mondo - toB.offsetMm) / 10 - 18) * 2) / 2;
                const eu = Math.round(((mondo + 15) / (20 / 3)) * 2) / 2;
                return `<tr><td>US ${u}</td><td>${mondo} mm (${(mondo / 10).toFixed(1)} cm)</td><td>US ${tUs}</td><td>EU ${eu}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `How do I convert ${fromB.name} shoe sizes to ${toB.name} reliably?`,
        a: "Measure or check your CM / JP / Mondopoint millimeter size printed inside your current shoe tongue, then apply the target brand's last offset (for example Converse runs longer while Hoka runs more compact).",
      },
      {
        q: "Why does EU size sometimes jump between brands?",
        a: "Brands round Paris Point lasts (6.67 mm steps) differently across half-sizes. Comparing exact millimeter Mondopoint foot length prevents half-size ordering mistakes.",
      },
    ];
  } else if (route.kind === "ring-guide") {
    const diams = [15.7, 16.51, 17.35, 18.14, 18.95, 19.76, 20.57, 21.39];
    tableHtml = `
      <h2>International Ring Diameter Reference Table</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Inside Diameter</th><th>Circumference (EU)</th><th>US Size</th><th>Japan</th></tr></thead>
          <tbody>
            ${diams
              .map((d) => {
                const us = Math.round(((d - 11.63) / 0.8128) * 2) / 2;
                const eu = Math.round(Math.PI * d);
                const jp = Math.max(1, Math.round((d - 12.67) / 0.333 + 1));
                return `<tr><td>${d.toFixed(2)} mm</td><td>${(Math.PI * d).toFixed(1)} mm (${eu})</td><td>US ${us}</td><td>JP ${jp}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: "How accurate is an on-screen credit-card calibrated ring sizer?",
        a: "Because every ISO/IEC 7810 ID-1 bank card is manufactured strictly to 85.60 mm width, matching the cyan reference bar to your card locks pixels-per-millimeter accurately regardless of browser zoom or monitor DPI.",
      },
    ];
  } else if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const wPx = Math.round((sp.widthMm / 25.4) * 300);
    const hPx = Math.round((sp.heightMm / 25.4) * 300);
    tableHtml = `
      <h2>Official ${escapeHtml(sp.country)} ${escapeHtml(sp.documentType)} Biometric Requirements</h2>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Biometric Parameter</th><th>Official Requirement</th></tr></thead>
          <tbody>
            <tr><td>Physical Print Size</td><td>${sp.widthMm} × ${sp.heightMm} mm (${(sp.widthMm / 25.4).toFixed(2)} × ${(sp.heightMm / 25.4).toFixed(2)} in)</td></tr>
            <tr><td>300-DPI Digital Pixels</td><td>${wPx} × ${hPx} px</td></tr>
            <tr><td>Head Height (Crown to Chin)</td><td>${sp.minHeadMm}–${sp.maxHeadMm} mm (${Math.round((sp.minHeadMm / sp.heightMm) * 100)}–${Math.round((sp.maxHeadMm / sp.heightMm) * 100)}% of height)</td></tr>
            <tr><td>Background Color</td><td>${escapeHtml(sp.backgroundHex || "#FFFFFF")} — uniform studio white/off-white</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs = [
      {
        q: `Are my portrait photos uploaded to ScaleAndFit servers?`,
        a: "Never. Your image is decoded locally using browser Canvas memory (`ObjectURL` / `getImageData`) and zero bytes leave your computer or phone.",
      },
      {
        q: `How do I print ${sp.country} photos cheaply at a pharmacy or photo kiosk?`,
        a: `Click "Download 4×6 Print Sheet PDF" or PNG above to pack multiple ${sp.widthMm}×${sp.heightMm} mm portraits onto one standard 4×6 inch (10×15 cm) borderless sheet with scissor trim marks.`,
      },
    ];
  }

  const relatedHtml = uniqueRelated.length
    ? `<div class="card">
        <h3>Related Precision Calculators</h3>
        <div class="chip-grid">
          ${uniqueRelated.map((r) => `<a class="route-chip" href="${r.path}">${escapeHtml(r.h1)}</a>`).join("")}
        </div>
      </div>`
    : "";

  const faqHtml = faqs.length
    ? `<div class="card">
        <h3>Frequently Asked Questions</h3>
        <div class="faq-list">
          ${faqs.map((f) => `<div class="faq-item"><h4>${escapeHtml(f.q)}</h4><p>${escapeHtml(f.a)}</p></div>`).join("")}
        </div>
      </div>`
    : "";

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return {
    html: `<section class="seo-reference container">${tableHtml ? `<div class="card">${tableHtml}</div>` : ""}${faqHtml}${relatedHtml}</section>`,
    faqJsonLd,
  };
}
