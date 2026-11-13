import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  generateAveryPdf,
  generateHolidayCalendarPdf,
  generatePaperPdf,
  generatePassportSheetPdf,
} from "../src/services/pdf-export.js";
import { AVERY_TEMPLATES, PUBLIC_HOLIDAYS_2026_2027 } from "../src/engines/paper/index.js";
import { computePrintSheetLayout, getBiometricSpec } from "../src/engines/photo/index.js";

// Valid 1x1 transparent PNG bytes
const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

describe("Client-Side Vector PDF Export Service", () => {
  it("exports A4 and US Letter vector paper PDFs with exact page geometry", async () => {
    const bytes = await generatePaperPdf({
      format: "a4",
      pattern: "dot-grid",
      spacingMm: 5,
      marginMm: 12,
      inkHex: "#38bdf8",
      strokeWidthPt: 0.6,
      title: "5mm Dot Grid A4",
    });
    expect(bytes.byteLength).toBeGreaterThan(1500);
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(1);
    const { width, height } = parsed.getPage(0).getSize();
    expect(width).toBeCloseTo(595.28, 0);
    expect(height).toBeCloseTo(841.89, 0);
  });

  it("exports 12-month country holiday calendar PDF", async () => {
    const bytes = await generateHolidayCalendarPdf({
      year: 2026,
      month: 0,
      countryCode: "BE",
      countryName: "Belgium",
      format: "a4",
      weekStartsMonday: true,
      holidays: PUBLIC_HOLIDAYS_2026_2027.BE,
    });
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(12);
  });

  it("exports Avery 5160 die-cut label PDF", async () => {
    const a5160 = AVERY_TEMPLATES.find((t) => t.code === "5160")!;
    const bytes = await generateAveryPdf(a5160, ["ScaleAndFit Studio", "Brussels, BE"], true, 0, 0);
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(1);
    const { width, height } = parsed.getPage(0).getSize();
    expect(width).toBeCloseTo(612, 0);
    expect(height).toBeCloseTo(792, 0);
  });

  it("exports 4x6 biometric passport sheet PDF with rotated and upright placements", async () => {
    const spec = getBiometricSpec("schengen-visa-35x45")!;
    const layout = computePrintSheetLayout(spec);
    const pngBytes = Uint8Array.from(Buffer.from(SAMPLE_PNG_BASE64, "base64"));
    const bytes = await generatePassportSheetPdf(pngBytes, layout, spec.country);
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(1);
    const { width, height } = parsed.getPage(0).getSize();
    expect(width).toBeCloseTo(432, 0);
    expect(height).toBeCloseTo(288, 0);
  });
});
