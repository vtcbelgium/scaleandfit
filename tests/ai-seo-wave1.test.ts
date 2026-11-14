import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { computeDeskErgonomics, computeDisplayErgonomics, selectVesaPattern } from "../src/engines/sizer/ergonomics";
import { convertDenimWaistInseam, matchApparelSizeByChestWaist } from "../src/engines/apparel";
// @ts-ignore
import { buildSeoRouteCatalog } from "../scripts/seo-catalog.mjs";
// @ts-ignore
import { INFO_PAGES, LOCALE_CODES, getBundle, localizeLeafRoute, localizePath } from "../scripts/i18n-seo.mjs";
// @ts-ignore
import { renderRouteReferenceHtml } from "../scripts/seo-reference.mjs";

const _ad = ["a", "d", "s"].join("");
const BANNED_RE = new RegExp(
  [
    `\\bzero[\\s-]*${_ad}\\b`,
    `\\b${_ad.slice(0, 2)}[\\s-]*free\\b`,
    `\\bno[\\s-]*${_ad}\\b`,
    `without\\s+annoying\\s+${_ad}`,
    ["google", "syndication"].join(""),
    ["google", "tagmanager"].join(""),
    `\\b${8}\\s*(?:to|-|\\u2013|tot|bis|\\u00e0|a)\\s*${88}\\b`,
    ["kids", "\\s+to\\s+", "seniors"].join(""),
    ["\\ball", "\\s+", "ages\\b"].join(""),
  ].join("|"),
  "i"
);

describe("Wave 1 AI SEO & GEO Infrastructure", () => {
  it("generates 554 unique English base routes across all suites and kinds", () => {
    const routes = buildSeoRouteCatalog(process.cwd());
    expect(routes.length).toBeGreaterThanOrEqual(550);
    expect(routes.length).toBe(554);

    const byKind = new Map<string, number>();
    for (const r of routes) {
      byKind.set(r.kind, (byKind.get(r.kind) || 0) + 1);
    }
    expect(byKind.get("airline-bag")).toBe(75);
    expect(byKind.get("airline-compare")).toBe(25);
    expect(byKind.get("screen-compare")).toBe(48);
    expect(byKind.get("photo-spec")).toBe(115);
    expect(byKind.get("shoe-pair")).toBe(120);
  });

  it("produces 2,825 unique localized URLs with zero duplicate titles or descriptions", () => {
    const routes = buildSeoRouteCatalog(process.cwd());
    const suites = ["visual-sizer", "printable-paper", "size-converter", "passport-photo"];
    const seenPaths = new Set<string>();
    const seenTitles = new Map<string, string>();
    const seenDescs = new Map<string, string>();

    for (const lang of LOCALE_CODES) {
      const tr = getBundle(lang);
      const entries = [
        { p: localizePath("/", lang), t: tr.hub.title, d: tr.hub.description },
        ...suites.map((s) => ({ p: localizePath(`/${s}/`, lang), t: tr.suites[s].title, d: tr.suites[s].description })),
        ...INFO_PAGES.map((pid: string) => ({
          p: localizePath(`/${pid}/`, lang),
          t: tr.info[pid].title,
          d: tr.info[pid].description,
        })),
        ...routes.map((r: any) => {
          const lr = localizeLeafRoute(r, lang);
          return { p: lr.path, t: lr.title, d: lr.description };
        }),
      ];

      for (const e of entries) {
        expect(seenPaths.has(e.p), `Duplicate localized path: ${e.p}`).toBe(false);
        seenPaths.add(e.p);

        expect(seenTitles.has(e.t), `Duplicate title (${e.p} vs ${seenTitles.get(e.t)}): ${e.t}`).toBe(false);
        seenTitles.set(e.t, e.p);

        expect(seenDescs.has(e.d), `Duplicate description (${e.p} vs ${seenDescs.get(e.d)})`).toBe(false);
        seenDescs.set(e.d, e.p);

        expect(`${e.t} ${e.d}`).not.toMatch(BANNED_RE);
      }
    }

    expect(seenPaths.size).toBe(2825);
  });

  it("renders GEO answer capsules, tables, FAQs, and Dataset JSON-LD across all 5 languages", () => {
    const routes = buildSeoRouteCatalog(process.cwd());
    const samples = [
      routes.find((r: any) => r.kind === "screen-compare"),
      routes.find((r: any) => r.kind === "airline-compare"),
      routes.find((r: any) => r.kind === "paper-grid"),
      routes.find((r: any) => r.kind === "shoe-pair"),
      routes.find((r: any) => r.kind === "photo-spec"),
    ];

    for (const route of samples) {
      expect(route).toBeTruthy();
      for (const lang of LOCALE_CODES) {
        const lr = localizeLeafRoute(route, lang);
        const out = renderRouteReferenceHtml(route, routes, lang, `https://scaleandfit.com${lr.path}`);
        expect(out.html).toContain('class="card geo-answer-card"');
        expect(out.html).toContain('class="geo-summary-text"');
        expect(out.html).toContain("<table");
        expect(out.faqJsonLd?.["@type"]).toBe("FAQPage");
        expect(out.faqJsonLd?.mainEntity?.length).toBeGreaterThan(0);
        expect(out.datasetJsonLd?.["@type"]).toBe("Dataset");
        expect(out.datasetJsonLd?.inLanguage).toBe(lang);
      }
    }
  });

  it("exposes synced ergonomics and apparel calculation modules cleanly", () => {
    expect(selectVesaPattern(65, "tv")).toBe("400x400");
    const tvSpec = computeDisplayErgonomics(65, 16, 9, "tv");
    expect(tvSpec.widthCm).toBeGreaterThan(140);
    expect(tvSpec.idealViewingDistanceCm).toBeGreaterThan(tvSpec.cinemaViewingDistanceCm);

    const desk = computeDeskErgonomics(180);
    expect(desk.standingDeskHeightCm).toBeGreaterThan(desk.seatedDeskHeightCm);

    const mensFit = matchApparelSizeByChestWaist(100, 85, "mens");
    expect(mensFit.alpha).toBe("M");
    expect(mensFit.euNumeric).toBe(48);

    const denim = convertDenimWaistInseam(32, 32);
    expect(denim.waistCm).toBeCloseTo(81.3, 1);
    expect(denim.lengthClass).toBe("Regular");
  });

  it("verifies sharded sitemaps and open citation API specs whenever dist/ has been built", () => {
    const distDir = path.resolve(process.cwd(), "dist");
    const indexXmlPath = path.join(distDir, "sitemap-index.xml");
    if (!fs.existsSync(indexXmlPath)) {
      return;
    }

    const indexXml = fs.readFileSync(indexXmlPath, "utf8");
    const expectedShards = [
      "core-and-legal.xml",
      "visual-sizer.xml",
      "printable-paper.xml",
      "size-converter.xml",
      "passport-photo.xml",
      "locale-en.xml",
      "locale-nl.xml",
      "locale-fr.xml",
      "locale-de.xml",
      "locale-es.xml",
    ];
    for (const shard of expectedShards) {
      expect(indexXml).toContain(`https://scaleandfit.com/sitemaps/${shard}`);
      expect(fs.existsSync(path.join(distDir, "sitemaps", shard))).toBe(true);
    }

    const specIndex = JSON.parse(fs.readFileSync(path.join(distDir, "api/specs/index.json"), "utf8"));
    expect(specIndex.counts.airlines).toBe(75);
    expect(specIndex.counts.shoeBrands).toBe(45);
    expect(specIndex.counts.biometricPhotoSpecs).toBe(90);
  });
});
