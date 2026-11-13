// @vitest-environment jsdom
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

describe("ScaleAndFit Studio DOM Hydration, Theme Toggle & SEO Preservation", () => {
  beforeEach(() => {
    installCanvasStub();
    window.localStorage.removeItem("sf-theme");
    delete document.documentElement.dataset.theme;
  });

  const suites = [
    { suite: "hub", preset: "{}" },
    { suite: "visual-sizer", preset: JSON.stringify({ mode: "screens", displayA: "55-tv-16x9", displayB: "65-tv-16x9" }) },
    { suite: "printable-paper", preset: JSON.stringify({ mode: "paper", format: "a4", pattern: "dot-grid", spacingMm: 5 }) },
    { suite: "size-converter", preset: JSON.stringify({ mode: "shoes", fromBrand: "nike", toBrand: "adidas", usSize: 10 }) },
    { suite: "passport-photo", preset: JSON.stringify({ specSlug: "us-passport-2x2" }) },
  ];

  for (const tc of suites) {
    it(`mounts '${tc.suite}' suite and preserves external static <section class="seo-reference">`, () => {
      document.body.innerHTML = `
        <div id="app" data-suite="${tc.suite}" data-preset='${tc.preset}' data-h1="Test ${tc.suite}" data-lead="Precision lead"></div>
        <section class="seo-reference container"><h2>Reference Table</h2></section>
        <div id="site-footer-mount"></div>
      `;

      bootApp();

      const app = document.getElementById("app");
      expect(app?.dataset.ready).toBe("true");
      expect(document.querySelector("#studio-mount")?.innerHTML.length).toBeGreaterThan(50);

      const seoSection = document.querySelector("section.seo-reference");
      expect(seoSection).not.toBeNull();
      expect(seoSection?.textContent).toContain("Reference Table");
    });
  }

  it("defaults to Daylight architectural theme and toggles cleanly to Carbon Dark mode", () => {
    document.body.innerHTML = `
      <div id="app" data-suite="hub" data-preset="{}" data-h1="Hub" data-lead="Lead"></div>
      <div id="site-footer-mount"></div>
    `;

    bootApp();
    expect(document.documentElement.dataset.theme).toBeUndefined();

    const themeBtn = document.getElementById("chrome-theme-btn") as HTMLButtonElement | null;
    expect(themeBtn).not.toBeNull();
    themeBtn!.click();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("sf-theme")).toBe("dark");

    themeBtn!.click();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem("sf-theme")).toBeNull();
  });
});
