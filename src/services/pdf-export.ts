import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import {
  buildPaperGeometry,
  mmToPt,
  type PaperFormatId,
  type PaperPatternKind,
} from "../engines/paper/coords.js";
import {
  buildMonthCalendarGrid,
  type HolidayEntry,
} from "../engines/paper/calendars.js";
import {
  buildAverySheetPlan,
  type AveryTemplateSpec,
} from "../engines/paper/avery.js";
import type { PrintSheetLayout } from "../engines/photo/layout.js";

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [
    Number.isFinite(r) ? r : 0.25,
    Number.isFinite(g) ? g : 0.35,
    Number.isFinite(b) ? b : 0.45,
  ];
}

export interface PaperPdfOptions {
  format: PaperFormatId;
  pattern: PaperPatternKind;
  spacingMm: number;
  marginMm: number;
  inkHex: string;
  strokeWidthPt: number;
  title?: string;
}

export async function generatePaperPdf(opts: PaperPdfOptions): Promise<Uint8Array> {
  const plan = buildPaperGeometry(opts.format, opts.pattern, opts.spacingMm, opts.marginMm);
  const doc = await PDFDocument.create();
  doc.setTitle(opts.title || `ScaleAndFit ${opts.pattern} ${opts.format.toUpperCase()}`);
  doc.setCreator("ScaleAndFit Studio (scaleandfit.com)");

  const page = doc.addPage([plan.format.widthPt, plan.format.heightPt]);
  const [r, g, b] = hexToRgbTuple(opts.inkHex);
  const ink = rgb(r, g, b);
  const faintInk = rgb(Math.min(1, r + 0.25), Math.min(1, g + 0.25), Math.min(1, b + 0.25));

  const H = plan.format.heightPt;
  const yFromTop = (yMm: number) => H - mmToPt(yMm);

  for (const pt of plan.dots) {
    page.drawCircle({
      x: mmToPt(pt.xMm),
      y: yFromTop(pt.yMm),
      size: Math.max(0.45, opts.strokeWidthPt * 0.9),
      color: ink,
    });
  }

  for (const seg of plan.lines) {
    const isMajor = seg.emphasis === "major";
    const isDashed = seg.emphasis === "dashed";
    page.drawLine({
      start: { x: mmToPt(seg.x1Mm), y: yFromTop(seg.y1Mm) },
      end: { x: mmToPt(seg.x2Mm), y: yFromTop(seg.y2Mm) },
      thickness: isMajor ? Math.max(0.9, opts.strokeWidthPt * 1.45) : opts.strokeWidthPt,
      color: isMajor ? ink : faintInk,
      ...(isDashed ? { dashArray: [3, 3] } : {}),
    });
  }

  if (opts.title) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText(opts.title, {
      x: mmToPt(opts.marginMm),
      y: H - mmToPt(opts.marginMm - 4),
      size: 9,
      font,
      color: faintInk,
    });
  }

  return doc.save();
}

export interface HolidayCalendarPdfOptions {
  year: number;
  month: number; // 0 = full 12-month bundle, 1..12 = single month
  countryCode: string;
  countryName: string;
  format: PaperFormatId;
  weekStartsMonday: boolean;
  holidays: HolidayEntry[];
}

export async function generateHolidayCalendarPdf(opts: HolidayCalendarPdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${opts.year} ${opts.countryName} Holiday Calendar — ScaleAndFit`);
  doc.setCreator("ScaleAndFit Studio (scaleandfit.com)");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const months = opts.month === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [opts.month];
  const isA4 = opts.format === "a4";
  // Landscape calendar layout
  const widthMm = isA4 ? 297 : 279.4;
  const heightMm = isA4 ? 210 : 215.9;
  const widthPt = mmToPt(widthMm);
  const heightPt = mmToPt(heightMm);
  const marginMm = 14;

  for (const m of months) {
    const grid = buildMonthCalendarGrid(opts.year, m, opts.weekStartsMonday, opts.holidays);
    const page = doc.addPage([widthPt, heightPt]);
    const yFromTop = (ym: number) => heightPt - mmToPt(ym);

    page.drawText(`${grid.monthName} ${grid.year} — ${opts.countryName} (${opts.countryCode})`, {
      x: mmToPt(marginMm),
      y: yFromTop(marginMm + 2),
      size: 18,
      font: bold,
      color: rgb(0.08, 0.14, 0.25),
    });

    const tableTopMm = marginMm + 14;
    const headerRowMm = 8;
    const gridW = widthMm - 2 * marginMm;
    const gridH = heightMm - tableTopMm - marginMm;
    const cellW = gridW / 7;
    const rows = grid.weeks.length;
    const cellH = (gridH - headerRowMm) / rows;

    // Header row
    for (let c = 0; c < 7; c++) {
      const x = marginMm + c * cellW;
      page.drawRectangle({
        x: mmToPt(x),
        y: yFromTop(tableTopMm + headerRowMm),
        width: mmToPt(cellW),
        height: mmToPt(headerRowMm),
        color: rgb(0.93, 0.96, 0.99),
        borderColor: rgb(0.75, 0.82, 0.9),
        borderWidth: 0.7,
      });
      page.drawText(grid.headers[c], {
        x: mmToPt(x + 3),
        y: yFromTop(tableTopMm + 5.5),
        size: 9.5,
        font: bold,
        color: rgb(0.15, 0.25, 0.4),
      });
    }

    // Day cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 7; c++) {
        const cell = grid.weeks[r][c];
        const x = marginMm + c * cellW;
        const yTop = tableTopMm + headerRowMm + r * cellH;
        const hasHoliday = cell.holidayNames.length > 0;
        page.drawRectangle({
          x: mmToPt(x),
          y: yFromTop(yTop + cellH),
          width: mmToPt(cellW),
          height: mmToPt(cellH),
          color: hasHoliday
            ? rgb(0.92, 0.97, 1)
            : cell.inMonth
              ? rgb(1, 1, 1)
              : rgb(0.97, 0.98, 0.99),
          borderColor: rgb(0.8, 0.85, 0.91),
          borderWidth: 0.6,
        });
        page.drawText(String(cell.day), {
          x: mmToPt(x + 2.5),
          y: yFromTop(yTop + 5.5),
          size: 10,
          font: cell.inMonth ? bold : font,
          color: cell.inMonth ? rgb(0.08, 0.14, 0.24) : rgb(0.62, 0.67, 0.74),
        });
        if (hasHoliday) {
          const label = cell.holidayNames.join(" / ").slice(0, 26);
          page.drawText(label, {
            x: mmToPt(x + 2.5),
            y: yFromTop(yTop + 11.5),
            size: 6.8,
            font: bold,
            color: rgb(0.01, 0.42, 0.68),
          });
        }
      }
    }
  }

  return doc.save();
}

export async function generateAveryPdf(
  template: AveryTemplateSpec,
  linesOfText: string[],
  showOutlines = true,
  offsetXMm = 0,
  offsetYMm = 0
): Promise<Uint8Array> {
  const plan = buildAverySheetPlan(template, offsetXMm, offsetYMm);
  const doc = await PDFDocument.create();
  doc.setTitle(`${template.name} — ScaleAndFit`);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const widthPt = mmToPt(plan.paperWidthMm);
  const heightPt = mmToPt(plan.paperHeightMm);
  const page = doc.addPage([widthPt, heightPt]);
  const yFromTop = (ym: number) => heightPt - mmToPt(ym);

  const nonEmpty = linesOfText.map((l) => l.trim()).filter(Boolean);

  for (const box of plan.boxes) {
    if (showOutlines) {
      page.drawRectangle({
        x: mmToPt(box.xMm),
        y: yFromTop(box.yMm + box.heightMm),
        width: mmToPt(box.widthMm),
        height: mmToPt(box.heightMm),
        borderColor: rgb(0.76, 0.82, 0.9),
        borderWidth: 0.5,
      });
    }
    const fontSize = Math.max(7.5, Math.min(10.5, box.heightMm / (nonEmpty.length + 2.2)));
    nonEmpty.forEach((line, idx) => {
      page.drawText(line.slice(0, 44), {
        x: mmToPt(box.xMm + 3),
        y: yFromTop(box.yMm + 5.5 + idx * (fontSize * 0.45 + 1.2)),
        size: fontSize,
        font: idx === 0 ? bold : font,
        color: rgb(0.08, 0.12, 0.2),
      });
    });
  }

  return doc.save();
}

export async function generatePassportSheetPdf(
  photoPngBytes: Uint8Array,
  layout: PrintSheetLayout,
  title: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${title} 4x6 Print Sheet — ScaleAndFit`);
  const widthPt = mmToPt(layout.sheetWidthMm);
  const heightPt = mmToPt(layout.sheetHeightMm);
  const page = doc.addPage([widthPt, heightPt]);
  const yFromTop = (ym: number) => heightPt - mmToPt(ym);

  const img = await doc.embedPng(photoPngBytes);
  // White sheet background
  page.drawRectangle({ x: 0, y: 0, width: widthPt, height: heightPt, color: rgb(1, 1, 1) });

  for (const tile of layout.placements) {
    const xPt = mmToPt(tile.xMm);
    const yBottomPt = yFromTop(tile.yMm + tile.heightMm);
    const wPt = mmToPt(tile.widthMm);
    const hPt = mmToPt(tile.heightMm);

    if (tile.rotated) {
      page.drawImage(img, {
        x: xPt + wPt,
        y: yBottomPt,
        width: hPt,
        height: wPt,
        rotate: degrees(90),
      });
    } else {
      page.drawImage(img, {
        x: xPt,
        y: yBottomPt,
        width: wPt,
        height: hPt,
      });
    }
    // Hairline trim mark border
    page.drawRectangle({
      x: xPt,
      y: yBottomPt,
      width: wPt,
      height: hPt,
      borderColor: rgb(0.75, 0.78, 0.84),
      borderWidth: 0.4,
    });
  }

  return doc.save();
}
