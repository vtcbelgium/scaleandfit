import { escapeHtml, getBundle, localizeLeafRoute, localizePath } from "./i18n-seo.mjs";

export { escapeHtml };

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

function localizedCommonFaqs(lang, kind) {
  if (lang === "nl") {
    return [
      {
        q: "Worden mijn bestanden of foto's geüpload naar een server?",
        a: "Nee. Alle berekeningen, PDF-exporten en fotobewerkingen draaien volledig lokaal in het geheugen van uw eigen browser.",
      },
      {
        q: "Werkt dit hulpmiddel op telefoon, tablet en desktop zonder account?",
        a: `Ja, alle ${kind === "photo-spec" ? "pasfoto" : "meet- en print"}functies van ScaleAndFit zijn direct bruikbaar zonder registratie.`,
      },
    ];
  }
  if (lang === "fr") {
    return [
      {
        q: "Mes photos ou mesures sont-elles envoyées vers un serveur ?",
        a: "Jamais. Tous les calculs, exportations PDF et recadrages photo sont exécutés localement dans la mémoire de votre navigateur.",
      },
      {
        q: "Puis-je utiliser cet outil sur mobile ou ordinateur sans compte ?",
        a: "Oui. Tous les outils ScaleAndFit fonctionnent immédiatement sans inscription ni cookie publicitaire.",
      },
    ];
  }
  if (lang === "de") {
    return [
      {
        q: "Werden meine Fotos oder Eingaben auf einen Server hochgeladen?",
        a: "Nein. Alle Berechnungen, PDF-Downloads und Passbild-Zuschnitte erfolgen direkt im lokalen Speicher Ihres Browsers.",
      },
      {
        q: "Funktioniert das Werkzeug ohne Registrierung am Smartphone und PC?",
        a: "Ja, sämtliche ScaleAndFit-Studios laufen sofort im Browser ohne Konto oder App-Installation.",
      },
    ];
  }
  if (lang === "es") {
    return [
      {
        q: "¿Se suben mis fotos o medidas a algún servidor?",
        a: "Nunca. Todos los cálculos, PDF vectoriales y recortes de foto ocurren íntegramente en la memoria local de su navegador.",
      },
      {
        q: "¿Puedo usarlo gratis en el móvil u ordenador sin crear cuenta?",
        a: "Sí. Todas las herramientas de ScaleAndFit funcionan al instante sin registro ni seguimiento entre sitios.",
      },
    ];
  }
  return [];
}

export function renderRouteReferenceHtml(route, allRoutes, lang = "en") {
  const tr = getBundle(lang);
  const seoLabels = tr.seo || {
    relatedTitle: "More Helpful Comparisons & Presets",
    relatedUnit: "Related",
    faqTitle: "Common Questions",
    faqUnit: "Answers",
    specLabel: "Quick Reference Table",
  };

  const sameSuite = allRoutes.filter((r) => r.suite === route.suite && r.slug !== route.slug);
  const offset = allRoutes.indexOf(route) % Math.max(1, sameSuite.length);
  const related = [];
  for (let i = 0; i < Math.min(8, sameSuite.length); i++) {
    related.push(sameSuite[(offset + i * 3) % sameSuite.length]);
  }
  const uniqueRelated = [...new Map(related.map((r) => [r.path, r])).values()].slice(0, 6);

  let tableTitle = "Specification Reference";
  let tableHtml = "";
  let faqs = [];

  if (route.kind === "screen-compare") {
    const { a, b } = route.meta;
    const mA = dispMetrics(a);
    const mB = dispMetrics(b);
    const areaPct = (((mB.areaIn / mA.areaIn) - 1) * 100).toFixed(1);
    const wDiffCm = (mB.wCm - mA.wCm).toFixed(1);
    const hDiffCm = (mB.hCm - mA.hCm).toFixed(1);
    tableTitle = `${a.label} vs ${b.label} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Metric</th><th>${escapeHtml(a.label)} (${a.aspectW}:${a.aspectH})</th><th>${escapeHtml(b.label)} (${b.aspectW}:${b.aspectH})</th><th>Delta</th></tr></thead>
          <tbody>
            <tr><td>Visible Width</td><td>${mA.wCm.toFixed(1)} cm (${mA.wIn.toFixed(1)} in)</td><td>${mB.wCm.toFixed(1)} cm (${mB.wIn.toFixed(1)} in)</td><td>${Number(wDiffCm) >= 0 ? "+" : ""}${wDiffCm} cm</td></tr>
            <tr><td>Visible Height</td><td>${mA.hCm.toFixed(1)} cm (${mA.hIn.toFixed(1)} in)</td><td>${mB.hCm.toFixed(1)} cm (${mB.hIn.toFixed(1)} in)</td><td>${Number(hDiffCm) >= 0 ? "+" : ""}${hDiffCm} cm</td></tr>
            <tr><td>Screen Area</td><td>${mA.areaCm.toFixed(0)} cm² (${mA.areaIn.toFixed(0)} in²)</td><td>${mB.areaCm.toFixed(0)} cm² (${mB.areaIn.toFixed(0)} in²)</td><td>+${areaPct}% area</td></tr>
            <tr><td>30° Viewing Distance</td><td>${((mA.wCm / 100) * 1.866).toFixed(2)} m</td><td>${((mB.wCm / 100) * 1.866).toFixed(2)} m</td><td>Mixed seating</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: `How much bigger is a ${b.label} than a ${a.label}?`,
              a: `Compared diagonally, a ${b.label} measures ${mB.wCm.toFixed(1)} cm wide by ${mB.hCm.toFixed(1)} cm tall, delivering ${areaPct}% more total screen area than a ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
            },
            {
              q: `What TV stand width fits a ${b.label}?`,
              a: `Ensure at least ${(mB.wCm + 15).toFixed(0)} cm (${((mB.wCm + 15) / 2.54).toFixed(0)} in) of wall or stand width to allow safe bezel clearance for a ${b.label}.`,
            },
            {
              q: "Does ScaleAndFit compute dimensions locally?",
              a: "Yes. Every display ratio calculation and scaled SVG overlay renders 100% locally in your browser with zero tracking cookies.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    tableTitle = `${air.name} (${air.iata}) — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Category</th><th>Metric (cm)</th><th>Imperial (in)</th><th>Max kg</th></tr></thead>
          <tbody>
            <tr><td>Cabin Overhead Bag</td><td>${air.carryOnCm.join(" × ")} cm</td><td>${air.carryOnCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.carryOnWeightKg} kg</td></tr>
            <tr><td>Personal Under-Seat Item</td><td>${air.personalItemCm.join(" × ")} cm</td><td>${air.personalItemCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.personalIncluded ? "Included" : "Check fare"}</td></tr>
          </tbody>
        </table>
      </div>
      <p style="color:var(--muted);font-size:.86rem;margin:10px 0 0">${escapeHtml(air.policyNote)}</p>`;
    faqs =
      lang === "en"
        ? [
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
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "mattress-compare") {
    const { a, b } = route.meta;
    const areaDelta = ((((b.widthCm * b.lengthCm) / (a.widthCm * a.lengthCm)) - 1) * 100).toFixed(1);
    tableTitle = `${a.label} vs ${b.label} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Dimension</th><th>${escapeHtml(a.label)}</th><th>${escapeHtml(b.label)}</th></tr></thead>
          <tbody>
            <tr><td>Width</td><td>${a.widthCm} cm (${(a.widthCm / 2.54).toFixed(1)} in)</td><td>${b.widthCm} cm (${(b.widthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Length</td><td>${a.lengthCm} cm (${(a.lengthCm / 2.54).toFixed(1)} in)</td><td>${b.lengthCm} cm (${(b.lengthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Surface Area Delta</td><td colspan="2">${Number(areaDelta) >= 0 ? "+" : ""}${areaDelta}%</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: `What is the width difference between ${a.label} and ${b.label}?`,
              a: `${b.label} measures ${b.widthCm} cm wide while ${a.label} measures ${a.widthCm} cm wide (${(b.widthCm - a.widthCm).toFixed(1)} cm difference).`,
            },
            {
              q: `What is the minimum bedroom size for a ${b.label}?`,
              a: `Allow at least ${(b.widthCm + 120).toFixed(0)} cm room width for 60 cm walking clearance on both sides.`,
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmtW = format === "a4" ? 210 : 215.9;
    const fmtH = format === "a4" ? 297 : 279.4;
    tableTitle = seoLabels.specLabel;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Property</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Paper Format</td><td>${format === "a4" ? "ISO A4 (210 × 297 mm)" : "US Letter (8.5 × 11 in)"}</td></tr>
            <tr><td>Grid Spacing</td><td>${spacingMm} mm (${((spacingMm * 72) / 25.4).toFixed(2)} pt)</td></tr>
            <tr><td>Safe Margin</td><td>12 mm (${Math.floor((fmtW - 24) / spacingMm)} cols × ${Math.floor((fmtH - 24) / spacingMm)} rows)</td></tr>
            <tr><td>Printer Scale</td><td>100% Actual Size</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: "Are PDF dimensions true to millimeter scale when printed?",
              a: `Yes. ScaleAndFit writes exact vector geometry at 72 PostScript points per inch (${format.toUpperCase()} ${fmtW}×${fmtH} mm). Print at 100% / Actual Size rather than "Fit to Page" for true ruler accuracy.`,
            },
            {
              q: "Does the PDF include any watermarks or accounts?",
              a: "No. Your customized PDF is synthesized locally in browser memory with pdf-lib and downloaded immediately without accounts or server uploads.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    tableTitle = `${year} ${cname} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Holiday</th></tr></thead>
          <tbody>
            ${holidays.map((h) => `<tr><td>${h.date}</td><td>${escapeHtml(h.name)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: `Can I print all 12 months of ${year} for ${cname} at once?`,
              a: `Yes. Keep Scope set to "Full 12-Month Pack" and click Download Calendar PDF to generate a ready-to-print 12-page landscape PDF.`,
            },
            {
              q: "Can I switch between Monday-first and Sunday-first weeks?",
              a: "Yes. Use the Week Starts On selector above to toggle Monday-first or Sunday-first calendar grids before downloading.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "avery-label") {
    const av = route.meta.avery;
    tableTitle = `${av.name} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Parameter</th><th>Specification</th></tr></thead>
          <tbody>
            <tr><td>Sheet Size</td><td>${av.paper.toUpperCase()}</td></tr>
            <tr><td>Layout Grid</td><td>${av.cols} cols × ${av.rows} rows (${av.cols * av.rows} labels)</td></tr>
            <tr><td>Label Size</td><td>${av.labelWidthMm} × ${av.labelHeightMm} mm</td></tr>
            <tr><td>Margins</td><td>${av.marginTopMm} mm top · ${av.marginLeftMm} mm left</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: `What if my printer feeds slightly off-center on ${av.code} sheets?`,
              a: "Test-print on plain paper first, hold it behind an Avery sheet against a window, and adjust Shift Left/Right and Up/Down calibration before exporting the final PDF.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const sampleUs = [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
    const fromB = route.meta.bA || { name: "Nike", offsetMm: 0 };
    const toB = route.meta.bB || { name: "Adidas", offsetMm: 2 };
    tableTitle = `${fromB.name} → ${toB.name} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>${escapeHtml(fromB.name)} US</th><th>Foot Length (mm / cm)</th><th>${escapeHtml(toB.name)} US</th><th>EU Size</th></tr></thead>
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
    faqs =
      lang === "en"
        ? [
            {
              q: `How do I convert ${fromB.name} shoe sizes to ${toB.name} reliably?`,
              a: "Check your CM / JP / Mondopoint millimeter size printed inside your current shoe tongue or measure your foot from heel to wall, then apply the target brand's fit offset.",
            },
            {
              q: "Why does EU size sometimes jump between brands?",
              a: "Brands round EU lasts (6.67 mm steps) differently across half-sizes. Comparing exact millimeter foot length prevents half-size ordering mistakes.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "ring-guide") {
    const diams = [15.7, 16.51, 17.35, 18.14, 18.95, 19.76, 20.57, 21.39];
    tableTitle = seoLabels.specLabel;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Inside Diameter</th><th>Circumference (EU)</th><th>US</th><th>JP</th></tr></thead>
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
    faqs =
      lang === "en"
        ? [
            {
              q: "How accurate is an on-screen credit-card calibrated ring sizer?",
              a: "Every standard payment card is manufactured strictly to 85.60 mm width worldwide. Matching the blue box to your card locks pixel scale accurately regardless of monitor or phone DPI.",
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  } else if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const wPx = Math.round((sp.widthMm / 25.4) * 300);
    const hPx = Math.round((sp.heightMm / 25.4) * 300);
    tableTitle = `${sp.country} ${sp.documentType} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Parameter</th><th>Requirement</th></tr></thead>
          <tbody>
            <tr><td>Print Size</td><td>${sp.widthMm} × ${sp.heightMm} mm (${(sp.widthMm / 25.4).toFixed(2)} × ${(sp.heightMm / 25.4).toFixed(2)} in)</td></tr>
            <tr><td>300 DPI Pixels</td><td>${wPx} × ${hPx} px</td></tr>
            <tr><td>Head Height</td><td>${sp.minHeadMm}–${sp.maxHeadMm} mm (${Math.round((sp.minHeadMm / sp.heightMm) * 100)}–${Math.round((sp.maxHeadMm / sp.heightMm) * 100)}%)</td></tr>
            <tr><td>Backdrop</td><td>${escapeHtml(sp.backgroundHex || "#FFFFFF")}</td></tr>
          </tbody>
        </table>
      </div>`;
    faqs =
      lang === "en"
        ? [
            {
              q: "Are my portrait photos uploaded to ScaleAndFit servers?",
              a: "Never. Your image is decoded locally inside browser Canvas memory and zero bytes leave your computer or phone.",
            },
            {
              q: `How do I print ${sp.country} photos cheaply at a photo kiosk?`,
              a: `Download the 4×6" print sheet PDF or PNG to arrange multiple ${sp.widthMm}×${sp.heightMm} mm portraits onto one standard 4×6 inch (10×15 cm) sheet with trim marks.`,
            },
          ]
        : localizedCommonFaqs(lang, route.kind);
  }

  const relatedHtml = uniqueRelated.length
    ? `<div class="card">
        <div class="panel-header">
          <h3 class="panel-title">${escapeHtml(seoLabels.relatedTitle)}</h3>
          <span class="section-kicker">${escapeHtml(seoLabels.relatedUnit)}</span>
        </div>
        <div class="directory-grid">
          ${uniqueRelated
            .map((r) => {
              const locR = localizeLeafRoute(r, lang);
              return `<a class="directory-link" href="${escapeHtml(locR.path)}"><span>${escapeHtml(locR.h1)}</span><span aria-hidden="true">&rarr;</span></a>`;
            })
            .join("")}
        </div>
      </div>`
    : "";

  const faqHtml = faqs.length
    ? `<div class="card">
        <div class="panel-header">
          <h3 class="panel-title">${escapeHtml(seoLabels.faqTitle)}</h3>
          <span class="section-kicker">${faqs.length} ${escapeHtml(seoLabels.faqUnit)}</span>
        </div>
        <div class="faq-list">
          ${faqs.map((f) => `<div class="faq-item"><h4>${escapeHtml(f.q)}</h4><p>${escapeHtml(f.a)}</p></div>`).join("")}
        </div>
      </div>`
    : "";

  const tableCardHtml = tableHtml
    ? `<div class="card">
        <div class="panel-header">
          <h2 class="panel-title">${escapeHtml(tableTitle)}</h2>
          <span class="section-kicker">${escapeHtml(seoLabels.specLabel)}</span>
        </div>
        ${tableHtml}
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
    html: `<section class="seo-reference container">${tableCardHtml}${faqHtml}${relatedHtml}</section>`,
    faqJsonLd,
  };
}
