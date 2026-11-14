// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bootApp } from "../src/main.js";

function installCanvasStub(): void {
  const ctxMock = {
    fillStyle: "#ffffff",
    strokeStyle: "#000000",
    lineWidth: 1,
    font: "12px sans-serif",
    filter: "none",
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    putImageData: vi.fn(),
  };

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: vi.fn(() => ctxMock),
  });
}

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      out.push(...walkSourceFiles(full));
    } else if (/\.(ts|mjs|js|html|css|txt|json)$/i.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("ScaleAndFit UX, Multilingual i18n, Visual Guides & Legal Pages", () => {
  beforeEach(() => {
    installCanvasStub();
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  const studioGuideCases = [
    { suite: "visual-sizer", prefix: "sizer", preset: "{}" },
    { suite: "printable-paper", prefix: "paper", preset: "{}" },
    { suite: "size-converter", prefix: "fit", preset: "{}" },
    { suite: "passport-photo", prefix: "passport", preset: "{}" },
  ];

  for (const tc of studioGuideCases) {
    it(`renders step ribbon and /guides/${tc.prefix}-step-*.svg illustrations on ${tc.suite}`, () => {
      document.body.innerHTML = `
        <div id="app" data-lang="en" data-suite="${tc.suite}" data-preset='${tc.preset}' data-h1="Studio" data-lead="Lead"></div>
        <div id="site-footer-mount"></div>
      `;
      bootApp();

      const imgs = [...document.querySelectorAll<HTMLImageElement>("img")].map((i) => i.getAttribute("src") || "");
      expect(imgs.some((s) => s.includes(`/guides/${tc.prefix}-step-1.svg`))).toBe(true);
      expect(imgs.some((s) => s.includes(`/guides/${tc.prefix}-step-2.svg`))).toBe(true);
      expect(imgs.some((s) => s.includes(`/guides/${tc.prefix}-step-3.svg`))).toBe(true);
      expect(document.querySelector(".step-ribbon")).not.toBeNull();

      if (tc.suite === "passport-photo") {
        expect(imgs.some((s) => s.includes("/guides/passport-do-dont.svg"))).toBe(true);
        expect(document.querySelectorAll(".country-chip").length).toBeGreaterThanOrEqual(6);
      }
    });
  }

  const localeExpectations = [
    { lang: "en", expectedFooterPrivacy: "/privacy/", navVisual: "Screen & Bag Sizer" },
    { lang: "nl", expectedFooterPrivacy: "/nl/privacy/", navVisual: "Scherm & Koffer" },
    { lang: "fr", expectedFooterPrivacy: "/fr/privacy/", navVisual: "Écran & Bagage" },
    { lang: "de", expectedFooterPrivacy: "/de/privacy/", navVisual: "TV & Handgepäck" },
    { lang: "es", expectedFooterPrivacy: "/es/privacy/", navVisual: "Pantallas y Equipaje" },
  ];

  for (const loc of localeExpectations) {
    it(`hydrates localized header, legal footer & hreflang links for ${loc.lang}`, () => {
      document.body.innerHTML = `
        <div id="app" data-lang="${loc.lang}" data-suite="hub" data-preset="{}" data-h1="Hub" data-lead="Lead"></div>
        <div id="site-footer-mount"></div>
      `;
      bootApp();

      expect(document.documentElement.lang).toBe(loc.lang);
      expect(document.body.textContent).toContain(loc.navVisual);

      const footer = document.querySelector("#site-footer-mount");
      const hrefs = [...(footer?.querySelectorAll<HTMLAnchorElement>("a") || [])].map((a) => a.getAttribute("href") || "");
      expect(hrefs).toContain(loc.expectedFooterPrivacy);

      const prefix = loc.lang === "en" ? "" : `/${loc.lang}`;
      for (const page of ["about", "guides", "privacy", "terms", "cookies", "contact"]) {
        expect(hrefs).toContain(`${prefix}/${page}/`);
      }

      const langHrefs = [...(footer?.querySelectorAll<HTMLAnchorElement>(".footer-lang-links a[hreflang]") || [])].map((a) =>
        a.getAttribute("hreflang")
      );
      expect(langHrefs).toEqual(["en", "nl", "fr", "de", "es"]);
    });
  }

  it("mounts legal & visual guide info pages cleanly", () => {
    for (const page of ["privacy", "guides", "cookies", "contact"]) {
      document.body.innerHTML = `
        <div id="app" data-lang="nl" data-suite="info" data-page="${page}" data-preset="{}" data-h1="Info" data-lead="Lead"></div>
        <div id="site-footer-mount"></div>
      `;
      bootApp();
      expect(document.getElementById("app")?.dataset.ready).toBe("true");
      expect(document.querySelector(".info-article, #guide-pdf-a4")).not.toBeNull();
    }
  });

  it("supports US, EU, UK and CM input conversion via #sc-sys in size-converter", () => {
    document.body.innerHTML = `
      <div id="app" data-lang="en" data-suite="size-converter" data-preset='{"mode":"shoes","fromBrand":"nike","toBrand":"adidas","usSize":10}' data-h1="Shoes" data-lead="Lead"></div>
      <div id="site-footer-mount"></div>
    `;
    bootApp();

    const sysSelect = document.getElementById("sc-sys") as HTMLSelectElement;
    expect(sysSelect).not.toBeNull();

    for (const unit of ["eu", "uk", "cm", "us"] as const) {
      const sel = document.getElementById("sc-sys") as HTMLSelectElement;
      sel.value = unit;
      sel.dispatchEvent(new Event("change"));
      const valSel = document.getElementById("sc-us") as HTMLSelectElement;
      expect(valSel.options.length).toBeGreaterThan(10);
      expect(document.querySelector(".result-banner")?.textContent).toContain("Adidas");
    }
  });

  it("contains zero disallowed age-range phrases across source, scripts and public files", () => {
    const root = path.resolve(process.cwd());
    const ageRangePattern = new RegExp("8\\s*(to|-|\\u2013|tot|bis|à|a)\\s*88", "i");
    for (const dir of ["src", "scripts", "public"]) {
      for (const file of walkSourceFiles(path.join(root, dir))) {
        const text = fs.readFileSync(file, "utf8");
        expect(text, `Disallowed age phrase matched in ${file}`).not.toMatch(ageRangePattern);
      }
    }
  });

  it("validates 5-language dist/ outputs, social PNGs, and hreflang clusters when built", () => {
    const distDir = path.resolve(process.cwd(), "dist");
    if (!fs.existsSync(path.join(distDir, "sitemap.xml"))) {
      return;
    }

    const expectedPaths = [
      "nl/index.html",
      "fr/passport-photo/index.html",
      "de/privacy/index.html",
      "es/guides/index.html",
      "og-image.png",
      "apple-touch-icon.png",
      "route-index.nl.json",
      "route-index.fr.json",
      "route-index.de.json",
      "route-index.es.json",
    ];
    for (const rel of expectedPaths) {
      expect(fs.existsSync(path.join(distDir, rel)), `Missing dist/${rel}`).toBe(true);
    }

    const frPassport = fs.readFileSync(path.join(distDir, "fr/passport-photo/index.html"), "utf8");
    expect(frPassport).toContain('lang="fr"');
    expect(frPassport).toContain('hreflang="x-default"');
    expect(frPassport).toContain('og-image.png');
    expect(frPassport).toContain('/guides/passport-step-1.svg');
  });
});
