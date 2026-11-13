// tests/seo-assets.test.ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// @ts-ignore
import { buildLlmsSummary } from "../scripts/generate-llms-txt.mjs";

const routes = [
  { path: "/visual-sizer", suite: "visual-sizer", title: "Visual Sizer", description: "Resize images in real-time" },
  { path: "/printable-paper", suite: "printable-paper", title: "Printable Paper", description: "Create printable documents" },
  { path: "/size-converter", suite: "size-converter", title: "Size Converter", description: "Convert measurements" },
  { path: "/passport-photo", suite: "passport-photo", title: "Passport Photo", description: "Create passport photos" }
];

describe("SEO Asset Validation", () => {
  it("should validate robots.txt", async () => {
    const robotsTxt = await fs.promises.readFile(path.join(__dirname, "..", "public", "robots.txt"), "utf-8");
    expect(robotsTxt).toContain("Sitemap: https://scaleandfit.com/sitemap.xml");
  });

  it("should validate llms.txt", async () => {
    const llmsTxt = await fs.promises.readFile(path.join(__dirname, "..", "public", "llms.txt"), "utf-8");
    expect(llmsTxt).toContain("visual-sizer");
    expect(llmsTxt).toContain("printable-paper");
    expect(llmsTxt).toContain("size-converter");
    expect(llmsTxt).toContain("passport-photo");
  });

  it("should validate manifest.json", async () => {
    const manifestJson = await fs.promises.readFile(path.join(__dirname, "..", "public", "manifest.json"), "utf-8");
    const manifest = JSON.parse(manifestJson);
    expect(manifest).toHaveProperty("name");
    expect(manifest).toHaveProperty("start_url");
  });

  it("should validate opensearch.xml", async () => {
    const opensearchXml = await fs.promises.readFile(path.join(__dirname, "..", "public", "opensearch.xml"), "utf-8");
    expect(opensearchXml).toContain("OpenSearchDescription");
  });

  it("should generate llms summary markdown", () => {
    const summary = buildLlmsSummary(routes);
    expect(summary).toContain("# ScaleAndFit");
    expect(summary).toContain("## visual-sizer");
    expect(summary).toContain("## printable-paper");
    expect(summary).toContain("## size-converter");
    expect(summary).toContain("## passport-photo");
  });
});
