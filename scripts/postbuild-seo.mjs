import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildLlmsSummary } from "./generate-llms-txt.mjs";
import { buildSeoRouteCatalog } from "./seo-catalog.mjs";
import { escapeHtml, renderRouteReferenceHtml } from "./seo-reference.mjs";

const ORIGIN = "https://scaleandfit.com";
const webRoot = process.cwd();
const distDir = path.resolve(webRoot, "dist");

const SUITE_META = {
  "visual-sizer": {
    name: "Visual Sizer",
    h1: "Visual TV, Monitor, Bag & Mattress Sizer",
    title: "Visual TV, Monitor, Carry-On Bag & Mattress Scale Sizer | ScaleAndFit",
    description:
      "Compare TVs, monitors, and mattresses side-by-side to exact scale and check bag sizes against 34 global airline carry-on limits in your browser.",
    lead: "Side-by-side SVG scale overlays for TVs, ultrawide monitors, mattresses, and 34 airline cabin sizer cages.",
  },
  "printable-paper": {
    name: "Paper & Avery",
    h1: "Printable Vector Paper, Holiday Calendars & Avery Labels",
    title: "Printable Vector Grid Paper, 2026–2027 Holiday Calendars & Avery PDFs | ScaleAndFit",
    description:
      "Generate millimeter-exact A4 & US Letter dot grid, graph, isometric, Cornell, sheet music, holiday calendar, and Avery die-cut label PDFs offline.",
    lead: "Vector pdf-lib generator for A4 and Letter dot/graph/music templates, 10-country holiday planners, and calibrated Avery label sheets.",
  },
  "size-converter": {
    name: "Shoe & Ring Fit",
    h1: "Cross-Brand Shoe Size Matrix & Credit-Card Ring Sizer",
    title: "Cross-Brand Mondopoint Shoe Size & Credit-Card Ring Sizer | ScaleAndFit",
    description:
      "Convert US, UK, EU, and Mondopoint millimeter shoe sizes across 24 footwear brands and calibrate ring sizes on-screen with an 85.60 mm payment card.",
    lead: "Canonical millimeter Mondopoint footwear translation across 24 brands plus bank-card-calibrated ring inner diameter sizing.",
  },
  "passport-photo": {
    name: "Passport Photo",
    h1: "Biometric Passport, Visa & 4×6 Print Sheet Studio",
    title: "Biometric Passport & Visa Photo Cropper + 4×6 300-DPI Sheet Maker | ScaleAndFit",
    description:
      "Crop biometric passport and visa photos across 36 official country templates in local Canvas and download 300-DPI single or 4×6 print sheets.",
    lead: "100% local HTML5 Canvas biometric oval framing, backdrop brightness adjustment, and 300-DPI 4×6 kiosk sheet export.",
  },
};

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

function buildJsonLdScripts({ url, suite, h1, description, faqJsonLd }) {
  const blocks = [];

  blocks.push({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: h1,
    url,
    description,
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

  const crumbs = [{ "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` }];
  if (suite !== "hub" && SUITE_META[suite]) {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: SUITE_META[suite].name,
      item: `${ORIGIN}/${suite}/`,
    });
    if (url !== `${ORIGIN}/${suite}/`) {
      crumbs.push({
        "@type": "ListItem",
        position: 3,
        name: h1,
        item: url,
      });
    }
  }
  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs,
  });

  if (faqJsonLd) {
    blocks.push(faqJsonLd);
  }

  return blocks
    .map((b) => `<script type="application/ld+json">${safeJsonLd(b)}</script>`)
    .join("\n  ");
}

function renderDocument({
  canonicalPath,
  suite,
  title,
  h1,
  lead,
  description,
  preset,
  referenceHtml,
  faqJsonLd = null,
  noIndex = false,
  assets,
}) {
  const canonicalUrl = `${ORIGIN}${canonicalPath}`;
  const presetAttr = escapeHtml(JSON.stringify(preset || {}));
  const jsonLdHtml = noIndex
    ? ""
    : buildJsonLdScripts({ url: canonicalUrl, suite, h1, description, faqJsonLd });
  const robotsMeta = noIndex ? `\n  <meta name="robots" content="noindex, follow" />` : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d1321" />${robotsMeta}
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="search" type="application/opensearchdescription+xml" title="ScaleAndFit" href="/opensearch.xml" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ScaleAndFit" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${ORIGIN}/og-image.svg" />
  <meta name="twitter:card" content="summary_large_image" />
  ${assets.stylesHtml}
  ${jsonLdHtml}
</head>
<body>
  <div id="app" data-suite="${escapeHtml(suite)}" data-preset="${presetAttr}" data-h1="${escapeHtml(h1)}" data-lead="${escapeHtml(lead)}">
    <main class="container">
      <h1>${escapeHtml(h1)}</h1>
      <p>${escapeHtml(lead)}</p>
    </main>
  </div>
  ${referenceHtml}
  <div id="site-footer-mount"></div>
  ${assets.scriptsHtml}
</body>
</html>
`;
}

function renderHubReference(routes) {
  const suiteCards = Object.entries(SUITE_META)
    .map(([id, meta]) => {
      const sample = routes.filter((r) => r.suite === id).slice(0, 6);
      return `
        <div class="card">
          <h2><a href="/${id}/">${escapeHtml(meta.h1)}</a></h2>
          <p style="color:var(--muted)">${escapeHtml(meta.description)}</p>
          <div class="chip-grid">
            ${sample.map((r) => `<a class="route-chip" href="${r.path}">${escapeHtml(r.h1)}</a>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");
  return `<section class="seo-reference container">${suiteCards}</section>`;
}

function renderSuiteDirectoryReference(suiteId, suiteRoutes) {
  const chips = suiteRoutes
    .map((r) => `<a class="route-chip" href="${r.path}">${escapeHtml(r.h1)}</a>`)
    .join("");
  return `
    <section class="seo-reference container">
      <div class="card">
        <h2>All Pre-Calibrated ${escapeHtml(SUITE_META[suiteId].name)} Calculators (${suiteRoutes.length})</h2>
        <div class="chip-grid">${chips}</div>
      </div>
    </section>
  `;
}

async function writeRouteHtml(relPath, html) {
  const cleanRel = relPath === "/" ? "" : relPath.replace(/^\/+/, "");
  const targetDir = cleanRel ? path.join(distDir, cleanRel) : distDir;
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), html, "utf8");
}

async function main() {
  const builtIndexHtml = await readFile(path.join(distDir, "index.html"), "utf8");
  const assets = extractViteAssets(builtIndexHtml);
  const routes = buildSeoRouteCatalog(webRoot);
  const today = new Date().toISOString().slice(0, 10);

  // 1. Root Hub Page (/)
  const hubHtml = renderDocument({
    canonicalPath: "/",
    suite: "hub",
    title: "ScaleAndFit — Visual TV/Bag Sizer, Printable PDF Paper, Shoe/Ring Matrix & Passport Photo Studio",
    h1: "ScaleAndFit — 4-in-1 Sizing, Print & Fit Studio",
    lead: "Compare screen and luggage dimensions to exact scale, generate vector PDF paper and holiday planners, convert shoe and ring sizes in millimeters, and crop 300-DPI biometric ID photos locally in your browser.",
    description:
      "ScaleAndFit.com runs 100% locally in your browser: compare TVs and carry-on bags to scale, generate vector A4/Letter PDF paper & holiday calendars, convert shoe & ring sizes by millimeter, and crop biometric passport photos.",
    preset: {},
    referenceHtml: renderHubReference(routes),
    assets,
  });
  await writeRouteHtml("/", hubHtml);

  // 2. Four Suite Hub Pages (/visual-sizer/, /printable-paper/, /size-converter/, /passport-photo/)
  const suiteUrls = [];
  for (const [suiteId, meta] of Object.entries(SUITE_META)) {
    const suiteRoutes = routes.filter((r) => r.suite === suiteId);
    const html = renderDocument({
      canonicalPath: `/${suiteId}/`,
      suite: suiteId,
      title: meta.title,
      h1: meta.h1,
      lead: meta.lead,
      description: meta.description,
      preset: {},
      referenceHtml: renderSuiteDirectoryReference(suiteId, suiteRoutes),
      assets,
    });
    await writeRouteHtml(`/${suiteId}/`, html);
    suiteUrls.push({ path: `/${suiteId}/`, priority: "0.9" });
  }

  // 3. 200+ Pre-Rendered Programmatic Leaf Routes
  for (const route of routes) {
    const ref = renderRouteReferenceHtml(route, routes);
    const html = renderDocument({
      canonicalPath: route.path,
      suite: route.suite,
      title: route.title,
      h1: route.h1,
      lead: route.description,
      description: route.description,
      preset: route.preset,
      referenceHtml: ref.html,
      faqJsonLd: ref.faqJsonLd,
      assets,
    });
    await writeRouteHtml(route.path, html);
  }

  // 4. 404 Page
  const notFoundHtml = renderDocument({
    canonicalPath: "/",
    suite: "hub",
    title: "Page Not Found | ScaleAndFit",
    h1: "404 — Utility Route Not Found",
    lead: "Choose one of the 4 client-side sizing, vector print, shoe/ring conversion, or biometric passport studios below.",
    description: "Route not found on ScaleAndFit.com.",
    preset: {},
    referenceHtml: renderHubReference(routes),
    noIndex: true,
    assets,
  });
  await writeFile(path.join(distDir, "404.html"), notFoundHtml, "utf8");

  // 5. sitemap.xml (Root + 4 Suite Hubs + 200+ Routes)
  const urlEntries = [
    { path: "/", priority: "1.0" },
    ...suiteUrls,
    ...routes.map((r) => ({ path: r.path, priority: "0.8" })),
  ];
  const sitemapXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urlEntries
      .map(
        (u) =>
          `  <url><loc>${ORIGIN}${u.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n") +
    `\n</urlset>\n`;
  await writeFile(path.join(distDir, "sitemap.xml"), sitemapXml, "utf8");

  // 6. llms-full.txt
  const llmsFull = buildLlmsSummary(routes, ORIGIN);
  await writeFile(path.join(distDir, "llms-full.txt"), llmsFull, "utf8");

  // 7. route-index.json (Ctrl+K quick search modal index)
  const searchIndex = [
    ...Object.entries(SUITE_META).map(([id, m]) => ({
      path: `/${id}/`,
      suite: id,
      h1: m.h1,
      kind: "suite-hub",
    })),
    ...routes.map((r) => ({
      path: r.path,
      suite: r.suite,
      h1: r.h1,
      kind: r.kind,
    })),
  ];
  await writeFile(path.join(distDir, "route-index.json"), JSON.stringify(searchIndex), "utf8");

  console.log(
    `[postbuild-seo] Built ${urlEntries.length} static routes, sitemap.xml, llms-full.txt, route-index.json, and 404.html cleanly.`
  );
}

await main();
