import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildLlmsSummary } from "./generate-llms-txt.mjs";
import {
  INFO_PAGES,
  LOCALE_CODES,
  escapeHtml,
  getBundle,
  localizeLeafRoute,
  localizePath,
  renderHreflangLinks,
  renderStaticFooterHtml,
  renderStaticGuidePreviewHtml,
} from "./i18n-seo.mjs";
import { buildSeoRouteCatalog } from "./seo-catalog.mjs";
import { renderRouteReferenceHtml } from "./seo-reference.mjs";

const ORIGIN = "https://scaleandfit.com";
const webRoot = process.cwd();
const distDir = path.resolve(webRoot, "dist");
const SUITES = ["visual-sizer", "printable-paper", "size-converter", "passport-photo"];

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

function extractViteAssets(baseHtml) {
  const styles = baseHtml.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
  const scripts = baseHtml.match(/<script[^>]+type=["']module["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  return {
    stylesHtml: styles.join("\n  "),
    scriptsHtml: scripts.join("\n  "),
  };
}

function buildHowToJsonLd(suite, lang, canonicalUrl) {
  const tr = getBundle(lang);
  const suiteMap = {
    "visual-sizer": { data: tr.sizer, prefix: "sizer" },
    "printable-paper": { data: tr.paper, prefix: "paper" },
    "size-converter": { data: tr.fit, prefix: "fit" },
    "passport-photo": { data: tr.passport, prefix: "passport" },
  };
  const cfg = suiteMap[suite];
  if (!cfg || !Array.isArray(cfg.data?.stepCards)) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: cfg.data.howTitle,
    description: cfg.data.howLead,
    url: canonicalUrl,
    step: cfg.data.stepCards.map((card, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: card.title,
      text: card.desc,
      image: `${ORIGIN}/guides/${cfg.prefix}-step-${i + 1}.svg`,
    })),
  };
}

function buildJsonLdScripts({ url, suite, lang, infoPage, h1, description, faqJsonLd, datasetJsonLd }) {
  const tr = getBundle(lang);
  const blocks = [];

  if (suite === "hub") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ScaleAndFit",
      url: localizePath("/", lang) === "/" ? `${ORIGIN}/` : `${ORIGIN}${localizePath("/", lang)}`,
      inLanguage: lang,
      potentialAction: {
        "@type": "SearchAction",
        target: `${ORIGIN}${localizePath("/", lang)}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ScaleAndFit (OTHRYS Systems)",
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/apple-touch-icon.png`,
      contactPoint: {
        "@type": "ContactPoint",
        email: "othrys.systems@gmail.com",
        contactType: "customer support",
      },
    });
  }

  if (suite === "info") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": infoPage === "about" ? "AboutPage" : infoPage === "contact" ? "ContactPage" : "WebPage",
      name: h1,
      url,
      description,
      inLanguage: lang,
    });
  } else {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: h1,
      url,
      description,
      inLanguage: lang,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and HTML5",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    });
  }

  const howTo = buildHowToJsonLd(suite, lang, url);
  if (howTo) blocks.push(howTo);

  const homeUrl = `${ORIGIN}${localizePath("/", lang)}`;
  const crumbs = [{ "@type": "ListItem", position: 1, name: "ScaleAndFit", item: homeUrl }];
  if (suite === "info" && infoPage) {
    crumbs.push({ "@type": "ListItem", position: 2, name: h1, item: url });
  } else if (suite !== "hub" && tr.suites[suite]) {
    const suiteUrl = `${ORIGIN}${localizePath(`/${suite}/`, lang)}`;
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: tr.suites[suite].name,
      item: suiteUrl,
    });
    if (url !== suiteUrl) {
      crumbs.push({ "@type": "ListItem", position: 3, name: h1, item: url });
    }
  }
  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs,
  });

  if (datasetJsonLd) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: h1,
      url,
      inLanguage: lang,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".geo-summary-text"],
      },
    });
    blocks.push(datasetJsonLd);
  }

  if (faqJsonLd) blocks.push(faqJsonLd);

  return blocks
    .map((b) => `<script type="application/ld+json">${safeJsonLd(b)}</script>`)
    .join("\n  ");
}

function renderDocument({
  canonicalEnPath,
  lang,
  suite,
  infoPage = "",
  title,
  h1,
  lead,
  description,
  preset,
  referenceHtml,
  faqJsonLd = null,
  datasetJsonLd = null,
  noIndex = false,
  assets,
}) {
  const tr = getBundle(lang);
  const localizedPath = localizePath(canonicalEnPath, lang);
  const canonicalUrl = `${ORIGIN}${localizedPath}`;
  const presetAttr = escapeHtml(JSON.stringify(preset || {}));
  const jsonLdHtml = noIndex
    ? ""
    : buildJsonLdScripts({ url: canonicalUrl, suite, lang, infoPage, h1, description, faqJsonLd, datasetJsonLd });
  const hreflangHtml = noIndex ? "" : `\n  ${renderHreflangLinks(canonicalEnPath, ORIGIN)}`;
  const robotsMeta = noIndex ? `\n  <meta name="robots" content="noindex, follow" />` : "";
  const pageAttr = infoPage ? ` data-page="${escapeHtml(infoPage)}"` : "";
  const staticGuidePreview = noIndex ? "" : renderStaticGuidePreviewHtml(suite, lang, infoPage);
  const staticFooter = renderStaticFooterHtml(lang, canonicalEnPath);

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f6f6f3" />${robotsMeta}
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />${hreflangHtml}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="search" type="application/opensearchdescription+xml" title="ScaleAndFit" href="/opensearch.xml" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="${escapeHtml(tr.meta.ogLocale)}" />
  <meta property="og:site_name" content="ScaleAndFit" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ORIGIN}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  ${assets.stylesHtml}
  ${jsonLdHtml}
</head>
<body>
  <div id="app" data-lang="${escapeHtml(lang)}" data-suite="${escapeHtml(suite)}"${pageAttr} data-preset="${presetAttr}" data-h1="${escapeHtml(h1)}" data-lead="${escapeHtml(lead)}">
    <main class="container">
      <h1>${escapeHtml(h1)}</h1>
      <p>${escapeHtml(lead)}</p>
      ${staticGuidePreview}
    </main>
  </div>
  ${referenceHtml}
  <div id="site-footer-mount">${staticFooter}</div>
  ${assets.scriptsHtml}
</body>
</html>
`;
}

function renderHubReference(routes, lang) {
  const tr = getBundle(lang);
  const suiteCards = SUITES.map((id, idx) => {
    const sMeta = tr.suites[id];
    const sample = routes.filter((r) => r.suite === id).slice(0, 6);
    return `
      <div class="card">
        <div class="panel-header">
          <h2 class="panel-title"><a href="${escapeHtml(localizePath(`/${id}/`, lang))}">${escapeHtml(sMeta.h1)}</a></h2>
          <span class="section-kicker">0${idx + 1}</span>
        </div>
        <p style="margin:0 0 12px;color:var(--muted);font-size:.88rem">${escapeHtml(sMeta.description)}</p>
        <div class="directory-grid">
          ${sample
            .map((r) => {
              const lr = localizeLeafRoute(r, lang);
              return `<a class="directory-link" href="${escapeHtml(lr.path)}"><span>${escapeHtml(lr.h1)}</span><span aria-hidden="true">&rarr;</span></a>`;
            })
            .join("")}
        </div>
      </div>
    `;
  }).join("");
  return `<section class="seo-reference container">${suiteCards}</section>`;
}

const KIND_LABELS = {
  "screen-compare": { en: "Screen & Display Comparisons", nl: "Scherm- & TV-vergelijkingen", fr: "Comparatifs Écrans & TV", de: "Bildschirm- & TV-Vergleiche", es: "Comparativas de Pantallas y TV" },
  "airline-bag": { en: "Airline Cabin Bag Rules", nl: "Handbagageregels per luchtvaartmaatschappij", fr: "Bagages Cabine par Compagnie", de: "Handgepäck-Regeln nach Airline", es: "Equipaje de Mano por Aerolínea" },
  "airline-compare": { en: "Head-to-Head Airline Comparisons", nl: "Luchtvaartmaatschappij-vergelijkingen", fr: "Comparatifs Compagnies Aériennes", de: "Airline-Direktvergleiche", es: "Comparativas entre Aerolíneas" },
  "mattress-compare": { en: "Mattress & Bed Dimensions", nl: "Matras- & bedmaten", fr: "Dimensions Matelas & Lits", de: "Matratzen- & Bettgrößen", es: "Medidas de Colchones y Camas" },
  "paper-grid": { en: "Printable Grids & Note Templates", nl: "Printbare rasters & notitiesjablonen", fr: "Grilles & Modèles Imprimables", de: "Druckbare Raster & Vorlagen", es: "Cuadrículas y Plantillas Imprimibles" },
  "holiday-calendar": { en: "Country Holiday Calendars", nl: "Feestdagenkalenders per land", fr: "Calendriers des Jours Fériés", de: "Feiertagskalender nach Land", es: "Calendarios de Festivos por País" },
  "avery-label": { en: "Avery Label Sheet Layouts", nl: "Avery etiketvellen", fr: "Planches d'Étiquettes Avery", de: "Avery Etiketten-Vorlagen", es: "Plantillas de Etiquetas Avery" },
  "shoe-pair": { en: "Brand-to-Brand Shoe Fit Guides", nl: "Merk-naar-merk schoenmaatvergelijkingen", fr: "Comparatifs Pointures entre Marques", de: "Marken-Schuhgrößen-Vergleiche", es: "Comparativas de Tallas entre Marcas" },
  "shoe-chart": { en: "Single-Brand Mondopoint Charts", nl: "Mondopoint-maattabellen per merk", fr: "Grilles Mondopoint par Marque", de: "Mondopoint-Tabellen nach Marke", es: "Tablas Mondopoint por Marca" },
  "ring-guide": { en: "Regional & Precision Ring Size Guides", nl: "Regionale & precisie-ringmaatgidsen", fr: "Guides des Tailles de Bague", de: "Ringgrößen-Ratgeber", es: "Guías de Tallas de Anillo" },
  "photo-spec": { en: "Country Biometric Specs & Store Print Sheets", nl: "Landelijke pasfotonormen & afdrukvellen", fr: "Normes Biométriques & Planches Photo", de: "Biometrische Normen & Druckbögen", es: "Normas Biométricas y Hojas de Impresión" },
};

function renderSuiteDirectoryReference(suiteId, suiteRoutes, lang) {
  const tr = getBundle(lang);
  const grouped = new Map();
  for (const r of suiteRoutes) {
    const k = r.kind || "other";
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(r);
  }
  const sectionsHtml = [...grouped.entries()]
    .map(([kind, items]) => {
      const heading = KIND_LABELS[kind]?.[lang] || KIND_LABELS[kind]?.en || kind;
      const links = items
        .map((r) => {
          const lr = localizeLeafRoute(r, lang);
          return `<a class="directory-link" href="${escapeHtml(lr.path)}"><span>${escapeHtml(lr.h1)}</span><span aria-hidden="true">&rarr;</span></a>`;
        })
        .join("");
      return `
        <div class="directory-kind-group">
          <div class="panel-header" style="margin-top:16px">
            <h3 class="panel-title">${escapeHtml(heading)}</h3>
            <span class="section-kicker">${items.length}</span>
          </div>
          <div class="directory-grid">${links}</div>
        </div>`;
    })
    .join("");
  return `
    <section class="seo-reference container">
      <div class="card">
        <div class="panel-header">
          <h2 class="panel-title">${escapeHtml(tr.seo.directoryTitle)}</h2>
          <span class="section-kicker">${suiteRoutes.length} ${escapeHtml(tr.seo.directoryUnit)}</span>
        </div>
        ${sectionsHtml}
      </div>
    </section>
  `;
}

async function writeRouteHtml(relPath, html) {
  const cleanRel = relPath === "/" ? "" : relPath.replace(/^\/+|\/+$/g, "");
  const targetDir = cleanRel ? path.join(distDir, cleanRel) : distDir;
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), html, "utf8");
}

function renderUrlsetXml(entries, today) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (u) =>
          `  <url><loc>${ORIGIN}${u.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n") +
    `\n</urlset>\n`
  );
}

async function readEngineJson(relPath) {
  const localPath = path.join(webRoot, "src/engines/_data", relPath);
  try {
    return JSON.parse(await readFile(localPath, "utf8"));
  } catch {
    return JSON.parse(await readFile(path.resolve(webRoot, "../scaleandfit-engines/data", relPath), "utf8"));
  }
}

async function extractTsJsonArray(relTsPath, exportName) {
  const src = await readFile(path.join(webRoot, "src/engines", relTsPath), "utf8");
  const marker = src.indexOf(`export const ${exportName}`);
  if (marker === -1) throw new Error(`Missing export ${exportName} in ${relTsPath}`);
  const eqIdx = src.indexOf("=", marker);
  const arrStart = eqIdx === -1 ? -1 : src.indexOf("[", eqIdx);
  const endMatch = arrStart === -1 ? null : src.slice(arrStart).match(/\r?\n\];/);
  if (arrStart === -1 || !endMatch || endMatch.index === undefined) {
    throw new Error(`Malformed JSON array for ${exportName} in ${relTsPath}`);
  }
  const arrEnd = arrStart + endMatch.index + endMatch[0].length - 1;
  return JSON.parse(src.slice(arrStart, arrEnd));
}

async function writeShardedSitemaps(urlEntries, today) {
  const sitemapsDir = path.join(distDir, "sitemaps");
  await mkdir(sitemapsDir, { recursive: true });

  const shardMap = {
    "core-and-legal.xml": urlEntries.filter((u) => u.suite === "hub" || u.suite === "info" || u.kind === "suite-hub"),
    "visual-sizer.xml": urlEntries.filter((u) => u.suite === "visual-sizer"),
    "printable-paper.xml": urlEntries.filter((u) => u.suite === "printable-paper"),
    "size-converter.xml": urlEntries.filter((u) => u.suite === "size-converter"),
    "passport-photo.xml": urlEntries.filter((u) => u.suite === "passport-photo"),
    ...Object.fromEntries(LOCALE_CODES.map((code) => [`locale-${code}.xml`, urlEntries.filter((u) => u.lang === code)])),
  };

  await Promise.all(
    Object.entries(shardMap).map(([filename, entries]) =>
      writeFile(path.join(sitemapsDir, filename), renderUrlsetXml(entries, today), "utf8")
    )
  );

  const sitemapIndexXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    Object.keys(shardMap)
      .map((filename) => `  <sitemap><loc>${ORIGIN}/sitemaps/${filename}</loc><lastmod>${today}</lastmod></sitemap>`)
      .join("\n") +
    `\n</sitemapindex>\n`;
  await writeFile(path.join(distDir, "sitemap-index.xml"), sitemapIndexXml, "utf8");
  return Object.keys(shardMap).length;
}

async function writeOpenSpecsApi(today, routeCount, localizedCount) {
  const apiDir = path.join(distDir, "api/specs");
  await mkdir(apiDir, { recursive: true });

  const [airlines, scrMat, holAvery, shoes, photos] = await Promise.all([
    readEngineJson("airlines.json"),
    readEngineJson("screens_and_mattresses.json"),
    readEngineJson("holidays_and_avery.json"),
    extractTsJsonArray("footwear/shoes.ts", "SHOE_BRANDS"),
    extractTsJsonArray("photo/specs.ts", "BIOMETRIC_PHOTO_SPECS"),
  ]);

  const toLiters = (cm) => Number(((cm[0] * cm[1] * cm[2]) / 1000).toFixed(1));
  const enrichedAirlines = airlines.map((a) => ({
    ...a,
    carryOnLiters: toLiters(a.carryOnCm),
    personalItemLiters: toLiters(a.personalItemCm),
  }));

  const indexPayload = {
    schema: "scaleandfit.open-specs.v1",
    origin: ORIGIN,
    generatedAt: today,
    license: `${ORIGIN}/terms/`,
    standards: ["ICAO Doc 9303", "ISO 9407", "ISO 8653", "ISO/IEC 7810 ID-1", "SMPTE EG-18-1"],
    counts: {
      baseRoutes: routeCount,
      localizedRoutes: localizedCount,
      locales: LOCALE_CODES,
      airlines: enrichedAirlines.length,
      displays: scrMat.screens.length,
      mattresses: scrMat.mattresses.length,
      averyTemplates: holAvery.avery.length,
      holidayCountries: Object.keys(holAvery.holidays).length,
      shoeBrands: shoes.length,
      biometricPhotoSpecs: photos.length,
    },
    endpoints: {
      airlines: `${ORIGIN}/api/specs/airlines.json`,
      displaysAndMattresses: `${ORIGIN}/api/specs/displays-and-mattresses.json`,
      paperAndLabels: `${ORIGIN}/api/specs/paper-and-labels.json`,
      footwearAndRings: `${ORIGIN}/api/specs/footwear-and-rings.json`,
      passportPhotos: `${ORIGIN}/api/specs/passport-photos.json`,
    },
  };

  await Promise.all([
    writeFile(path.join(apiDir, "index.json"), JSON.stringify(indexPayload, null, 2), "utf8"),
    writeFile(
      path.join(apiDir, "airlines.json"),
      JSON.stringify({ schema: "scaleandfit.airlines.v1", generatedAt: today, count: enrichedAirlines.length, airlines: enrichedAirlines }, null, 2),
      "utf8"
    ),
    writeFile(
      path.join(apiDir, "displays-and-mattresses.json"),
      JSON.stringify({ schema: "scaleandfit.displays-mattresses.v1", generatedAt: today, displays: scrMat.screens, mattresses: scrMat.mattresses }, null, 2),
      "utf8"
    ),
    writeFile(
      path.join(apiDir, "paper-and-labels.json"),
      JSON.stringify({ schema: "scaleandfit.paper-labels.v1", generatedAt: today, averyTemplates: holAvery.avery, holidaysByCountry: holAvery.holidays }, null, 2),
      "utf8"
    ),
    writeFile(
      path.join(apiDir, "footwear-and-rings.json"),
      JSON.stringify(
        {
          schema: "scaleandfit.footwear-rings.v1",
          generatedAt: today,
          standard: "ISO 9407 Mondopoint / ISO 8653 Ring Sizing",
          ringFormula: "circumferenceMm = diameterMm * Math.PI",
          shoeBrands: shoes,
        },
        null,
        2
      ),
      "utf8"
    ),
    writeFile(
      path.join(apiDir, "passport-photos.json"),
      JSON.stringify({ schema: "scaleandfit.passport-photos.v1", generatedAt: today, standard: "ICAO Doc 9303", count: photos.length, specs: photos }, null, 2),
      "utf8"
    ),
  ]);
}

async function main() {
  const builtIndexHtml = await readFile(path.join(distDir, "index.html"), "utf8");
  const assets = extractViteAssets(builtIndexHtml);
  const routes = buildSeoRouteCatalog(webRoot);
  const today = new Date().toISOString().slice(0, 10);
  const urlEntries = [];

  for (const lang of LOCALE_CODES) {
    const tr = getBundle(lang);

    // 1. Hubs (5 total: /, /nl/, /fr/, /de/, /es/)
    const hubPath = localizePath("/", lang);
    const hubHtml = renderDocument({
      canonicalEnPath: "/",
      lang,
      suite: "hub",
      title: tr.hub.title,
      h1: tr.hub.h1,
      lead: tr.hub.lead,
      description: tr.hub.description,
      preset: {},
      referenceHtml: renderHubReference(routes, lang),
      assets,
    });
    await writeRouteHtml(hubPath, hubHtml);
    urlEntries.push({ path: hubPath, priority: "1.0", lang, suite: "hub", kind: "hub" });

    // 2. Suite Hubs (20 total: 4 suites * 5 locales)
    for (const suiteId of SUITES) {
      const sMeta = tr.suites[suiteId];
      const suiteEnPath = `/${suiteId}/`;
      const suiteLocPath = localizePath(suiteEnPath, lang);
      const suiteRoutes = routes.filter((r) => r.suite === suiteId);
      const html = renderDocument({
        canonicalEnPath: suiteEnPath,
        lang,
        suite: suiteId,
        title: sMeta.title,
        h1: sMeta.h1,
        lead: sMeta.lead,
        description: sMeta.description,
        preset: {},
        referenceHtml: renderSuiteDirectoryReference(suiteId, suiteRoutes, lang),
        assets,
      });
      await writeRouteHtml(suiteLocPath, html);
      urlEntries.push({ path: suiteLocPath, priority: "0.9", lang, suite: suiteId, kind: "suite-hub" });
    }

    // 3. Info & Legal Pages (30 total: 6 pages * 5 locales)
    for (const pageId of INFO_PAGES) {
      const infoMeta = tr.info[pageId];
      const infoEnPath = `/${pageId}/`;
      const infoLocPath = localizePath(infoEnPath, lang);
      const html = renderDocument({
        canonicalEnPath: infoEnPath,
        lang,
        suite: "info",
        infoPage: pageId,
        title: infoMeta.title,
        h1: infoMeta.h1,
        lead: infoMeta.lead,
        description: infoMeta.description,
        preset: {},
        referenceHtml: "",
        assets,
      });
      await writeRouteHtml(infoLocPath, html);
      urlEntries.push({ path: infoLocPath, priority: pageId === "guides" ? "0.8" : "0.6", lang, suite: "info", kind: "info-page" });
    }

    // 4. Leaf Routes (batched writes of 64 for high static scale)
    const leafWriteBatch = [];
    for (const route of routes) {
      const lr = localizeLeafRoute(route, lang);
      const canonicalUrl = `${ORIGIN}${lr.path}`;
      const ref = renderRouteReferenceHtml(route, routes, lang, canonicalUrl);
      const html = renderDocument({
        canonicalEnPath: route.path,
        lang,
        suite: route.suite,
        title: lr.title,
        h1: lr.h1,
        lead: lr.description,
        description: lr.description,
        preset: route.preset,
        referenceHtml: ref.html,
        faqJsonLd: ref.faqJsonLd,
        datasetJsonLd: ref.datasetJsonLd,
        assets,
      });
      leafWriteBatch.push({ path: lr.path, html });
      urlEntries.push({ path: lr.path, priority: "0.8", lang, suite: route.suite, kind: route.kind });
    }

    for (let i = 0; i < leafWriteBatch.length; i += 64) {
      const chunk = leafWriteBatch.slice(i, i + 64);
      await Promise.all(chunk.map((item) => writeRouteHtml(item.path, item.html)));
    }

    // 5. Localized Route Search Index (route-index.json + route-index.{nl,fr,de,es}.json)
    const searchIndex = [
      ...SUITES.map((id) => ({
        path: localizePath(`/${id}/`, lang),
        suite: id,
        h1: tr.suites[id].h1,
        kind: "suite-hub",
      })),
      ...INFO_PAGES.map((pid) => ({
        path: localizePath(`/${pid}/`, lang),
        suite: "info",
        h1: tr.info[pid].h1,
        kind: "info-page",
      })),
      ...routes.map((r) => {
        const lr = localizeLeafRoute(r, lang);
        return {
          path: lr.path,
          suite: r.suite,
          h1: lr.h1,
          kind: r.kind,
        };
      }),
    ];
    const indexFilename = lang === "en" ? "route-index.json" : `route-index.${lang}.json`;
    await writeFile(path.join(distDir, indexFilename), JSON.stringify(searchIndex), "utf8");
  }

  // 6. 404 Page (noindex, follow)
  const trEn = getBundle("en");
  const notFoundHtml = renderDocument({
    canonicalEnPath: "/",
    lang: "en",
    suite: "hub",
    title: "Page Not Found | ScaleAndFit",
    h1: "404 — Page Not Found",
    lead: trEn.hub.lead,
    description: "Route not found on ScaleAndFit.com.",
    preset: {},
    referenceHtml: renderHubReference(routes, "en"),
    noIndex: true,
    assets,
  });
  await writeFile(path.join(distDir, "404.html"), notFoundHtml, "utf8");

  // 7. Flat sitemap.xml + 10 Sharded Sitemaps + sitemap-index.xml
  const renderUrlsetXml = (entries) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (u) =>
          `  <url><loc>${ORIGIN}${u.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  await writeFile(path.join(distDir, "sitemap.xml"), renderUrlsetXml(urlEntries, today), "utf8");
  const shardCount = await writeShardedSitemaps(urlEntries, today);
  await writeOpenSpecsApi(today, routes.length, urlEntries.length);

  // 8. llms-full.txt
  const llmsFull = buildLlmsSummary(routes, ORIGIN);
  await writeFile(path.join(distDir, "llms-full.txt"), llmsFull, "utf8");

  console.log(
    `[postbuild-seo] Built ${urlEntries.length} static localized routes across 5 languages, sitemap.xml, ${shardCount} sitemap shards + sitemap-index.xml, 6 open API spec JSON files, llms-full.txt, 5 route-index JSON files, and 404.html cleanly.`
  );
}

await main();
