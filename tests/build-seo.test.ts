import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildSeoRouteCatalog } from "../scripts/seo-catalog.mjs";
import { renderRouteReferenceHtml } from "../scripts/seo-reference.mjs";

describe("Programmatic SEO Catalog & Output Verification", () => {
  it("generates at least 200 unique valid routes across all 4 suites", () => {
    const root = path.resolve(process.cwd());
    const routes = buildSeoRouteCatalog(root);
    expect(routes.length).toBeGreaterThanOrEqual(200);
    const uniquePaths = new Set(routes.map((r) => r.path));
    expect(uniquePaths.size).toBe(routes.length);

    for (const r of routes) {
      expect(r.path.startsWith(`/${r.suite}/`)).toBe(true);
      expect(r.path.endsWith("/")).toBe(true);
      expect(r.title.length).toBeGreaterThan(15);
      expect(r.description.length).toBeGreaterThan(30);
    }
  });

  it("renders unique rich HTML specification tables and valid FAQ JSON-LD without banned words", () => {
    const root = path.resolve(process.cwd());
    const routes = buildSeoRouteCatalog(root);
    const samples = [
      routes.find((r) => r.kind === "screen-compare"),
      routes.find((r) => r.kind === "airline-bag"),
      routes.find((r) => r.kind === "holiday-calendar"),
      routes.find((r) => r.kind === "shoe-pair"),
      routes.find((r) => r.kind === "photo-spec"),
    ].filter(Boolean);

    expect(samples.length).toBe(5);
    for (const s of samples) {
      const ref = renderRouteReferenceHtml(s, routes);
      expect(ref.html).toContain("<table");
      expect(ref.html).not.toMatch(/zero[\s-]*ads|ad[\s-]*free|\bno[\s-]*ads\b/i);
      if (ref.faqJsonLd) {
        expect(ref.faqJsonLd["@type"]).toBe("FAQPage");
        expect(ref.faqJsonLd.mainEntity.length).toBeGreaterThan(0);
      }
    }
  });

  it("validates dist/ outputs whenever production build has run", () => {
    const distDir = path.resolve(process.cwd(), "dist");
    const sitemapPath = path.join(distDir, "sitemap.xml");
    if (!fs.existsSync(sitemapPath)) {
      return;
    }
    const xml = fs.readFileSync(sitemapPath, "utf8");
    const locs = [...xml.matchAll(/<loc>(https:\/\/scaleandfit\.com([^<]*))<\/loc>/g)];
    expect(locs.length).toBeGreaterThanOrEqual(205);
    for (const [, , rel] of locs) {
      const htmlPath = path.join(distDir, rel === "/" ? "" : rel.replace(/^\//, ""), "index.html");
      expect(fs.existsSync(htmlPath), `Missing built HTML for ${rel}`).toBe(true);
    }
    expect(fs.existsSync(path.join(distDir, "llms-full.txt"))).toBe(true);
    expect(fs.existsSync(path.join(distDir, "route-index.json"))).toBe(true);
    expect(fs.existsSync(path.join(distDir, "_headers"))).toBe(true);
  });
});
