import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { auditHtmlAuthorshipAndQuality } from "../scripts/audit-seo-quality.mjs";

function makeSampleHtml(jsonLd: Record<string, unknown>, bodyExtra = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
  <title>Cabin Bag Comparison — ScaleAndFit</title>
  <meta name="description" content="Compare exact cabin baggage allowances across global airlines locally.">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>Cabin Bag Comparison</h1>
  ${bodyExtra}
</body>
</html>`;
}

describe("SEO People-First & Authorship Security Barrier (Google Who, How, Why)", () => {
  it("passes honest Organization attribution with publishingPrinciples", () => {
    const html = makeSampleHtml({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "ScaleAndFit",
          url: "https://scaleandfit.com/",
          publishingPrinciples: "https://scaleandfit.com/about/",
        },
        {
          "@type": "WebApplication",
          name: "ScaleAndFit Visual Sizer",
          url: "https://scaleandfit.com/visual-sizer/",
        },
      ],
    });
    expect(auditHtmlAuthorshipAndQuality(html, "/visual-sizer/")).toEqual([]);
  });

  it("blocks root, @graph, and nested Person author schemas", () => {
    const nested = makeSampleHtml({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Bag Rules",
      author: { "@type": "Person", name: "Alex Fictional" },
    });
    const failures = auditHtmlAuthorshipAndQuality(nested, "/bad-nested/");
    expect(failures.length).toBeGreaterThan(0);
    expect(failures.some((f) => f.includes("Person"))).toBe(true);
  });

  it("blocks synthetic AI headshot and avatar markers", () => {
    const cleanSchema = { "@context": "https://schema.org", "@type": "Organization", name: "ScaleAndFit" };
    for (const url of [
      "https://thispersondoesnotexist.com/avatar.jpg",
      "https://i.pravatar.cc/120?img=8",
      "/images/ai-headshot-reviewer.jpg",
    ]) {
      const failures = auditHtmlAuthorshipAndQuality(
        makeSampleHtml(cleanSchema, `<img src="${url}" alt="Editor">`),
        "/bad-avatar/"
      );
      expect(failures.length, `Expected block for ${url}`).toBeGreaterThan(0);
    }
  });

  it("blocks fabricated expert credentials and template placeholders", () => {
    const cleanSchema = { "@context": "https://schema.org", "@type": "Organization", name: "ScaleAndFit" };
    const credFailures = auditHtmlAuthorshipAndQuality(
      makeSampleHtml(cleanSchema, "<p>Medically reviewed by Dr. Sarah Jenkins, MD</p>"),
      "/bad-cred/"
    );
    expect(credFailures.length).toBeGreaterThan(0);

    const placeholderFailures = auditHtmlAuthorshipAndQuality(
      makeSampleHtml({
        "@context": "https://schema.org",
        "@type": "WebPage",
        headline: "{{TODO_HEADLINE}}",
      }),
      "/bad-placeholder/"
    );
    expect(placeholderFailures.length).toBeGreaterThan(0);
  });

  it("verifies scaleandfit SEO generators emit Organization + publishingPrinciples and never Person", () => {
    const root = process.cwd();
    for (const rel of ["scripts/postbuild-seo.mjs", "scripts/seo-reference.mjs"]) {
      const content = fs.readFileSync(path.join(root, rel), "utf8");
      expect(content).toContain("Organization");
      expect(content).toContain("publishingPrinciples");
      expect(content).not.toMatch(/"@type"\s*:\s*"Person"/i);
    }
  });
});
