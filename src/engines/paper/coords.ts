export type PaperFormatId = "a4" | "letter";

export interface PaperDimensionsMm {
  id: PaperFormatId;
  name: string;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
}

export const MM_TO_PT = 72 / 25.4;

export const PAPER_FORMATS: Record<PaperFormatId, PaperDimensionsMm> = {
  a4: {
    id: "a4",
    name: "A4 (210 x 297 mm)",
    widthMm: 210,
    heightMm: 297,
    widthPt: Number((210 * MM_TO_PT).toFixed(2)),
    heightPt: Number((297 * MM_TO_PT).toFixed(2)),
  },
  letter: {
    id: "letter",
    name: "US Letter (8.5 x 11 in)",
    widthMm: 215.9,
    heightMm: 279.4,
    widthPt: 612,
    heightPt: 792,
  },
};

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export type PaperPatternKind =
  | "dot-grid"
  | "graph-grid"
  | "isometric-dots"
  | "isometric-grid"
  | "cornell-notes"
  | "lined-ruled"
  | "handwriting-primary"
  | "music-staff"
  | "guitar-tab"
  | "calligraphy-slant";

export interface DotPointMm {
  xMm: number;
  yMm: number;
}

export interface LineSegmentMm {
  x1Mm: number;
  y1Mm: number;
  x2Mm: number;
  y2Mm: number;
  emphasis?: "major" | "minor" | "dashed";
}

export interface PaperGeometryPlan {
  format: PaperDimensionsMm;
  pattern: PaperPatternKind;
  marginMm: number;
  spacingMm: number;
  dots: DotPointMm[];
  lines: LineSegmentMm[];
  colsCount: number;
  rowsCount: number;
}

export function buildPaperGeometry(
  formatId: PaperFormatId,
  pattern: PaperPatternKind,
  spacingMm = 5,
  marginMm = 12
): PaperGeometryPlan {
  if (!(spacingMm >= 2 && spacingMm <= 30)) {
    throw new RangeError("Spacing must be between 2mm and 30mm");
  }
  const format = PAPER_FORMATS[formatId];
  if (!format) throw new Error(`Unknown paper format: ${formatId}`);
  const usableW = format.widthMm - 2 * marginMm;
  const usableH = format.heightMm - 2 * marginMm;
  if (usableW <= 10 || usableH <= 10) {
    throw new RangeError("Margin too large for selected paper size");
  }

  const dots: DotPointMm[] = [];
  const lines: LineSegmentMm[] = [];
  let colsCount = 0;
  let rowsCount = 0;

  if (pattern === "dot-grid") {
    colsCount = Math.floor(usableW / spacingMm) + 1;
    rowsCount = Math.floor(usableH / spacingMm) + 1;
    const offsetX = (format.widthMm - (colsCount - 1) * spacingMm) / 2;
    const offsetY = (format.heightMm - (rowsCount - 1) * spacingMm) / 2;
    for (let r = 0; r < rowsCount; r++) {
      for (let c = 0; c < colsCount; c++) {
        dots.push({
          xMm: Number((offsetX + c * spacingMm).toFixed(3)),
          yMm: Number((offsetY + r * spacingMm).toFixed(3)),
        });
      }
    }
  } else if (pattern === "graph-grid") {
    colsCount = Math.floor(usableW / spacingMm);
    rowsCount = Math.floor(usableH / spacingMm);
    const gridW = colsCount * spacingMm;
    const gridH = rowsCount * spacingMm;
    const left = (format.widthMm - gridW) / 2;
    const top = (format.heightMm - gridH) / 2;
    for (let c = 0; c <= colsCount; c++) {
      const x = Number((left + c * spacingMm).toFixed(3));
      lines.push({
        x1Mm: x,
        y1Mm: top,
        x2Mm: x,
        y2Mm: top + gridH,
        emphasis: c % 5 === 0 ? "major" : "minor",
      });
    }
    for (let r = 0; r <= rowsCount; r++) {
      const y = Number((top + r * spacingMm).toFixed(3));
      lines.push({
        x1Mm: left,
        y1Mm: y,
        x2Mm: left + gridW,
        y2Mm: y,
        emphasis: r % 5 === 0 ? "major" : "minor",
      });
    }
  } else if (pattern === "isometric-dots" || pattern === "isometric-grid") {
    const stepY = spacingMm;
    const stepX = spacingMm * Math.sqrt(3) / 2;
    colsCount = Math.floor(usableW / stepX) + 1;
    rowsCount = Math.floor(usableH / stepY) + 1;
    const left = (format.widthMm - (colsCount - 1) * stepX) / 2;
    const top = (format.heightMm - (rowsCount - 1) * stepY) / 2;

    if (pattern === "isometric-dots") {
      for (let c = 0; c < colsCount; c++) {
        const yOffset = c % 2 === 1 ? stepY / 2 : 0;
        for (let r = 0; r < rowsCount; r++) {
          const y = top + r * stepY + yOffset;
          if (y <= format.heightMm - marginMm + 0.01) {
            dots.push({ xMm: Number((left + c * stepX).toFixed(3)), yMm: Number(y.toFixed(3)) });
          }
        }
      }
    } else {
      const right = left + (colsCount - 1) * stepX;
      const bottom = top + (rowsCount - 1) * stepY;
      for (let c = 0; c < colsCount; c++) {
        const x = Number((left + c * stepX).toFixed(3));
        lines.push({ x1Mm: x, y1Mm: top, x2Mm: x, y2Mm: bottom, emphasis: "minor" });
      }
      // 30 degree diagonals inside box
      const tan30 = Math.tan(Math.PI / 6);
      for (let y = top - usableW * tan30; y <= bottom + usableW * tan30; y += stepY) {
        lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(3)), x2Mm: right, y2Mm: Number((y + (right - left) * tan30).toFixed(3)), emphasis: "minor" });
        lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(3)), x2Mm: right, y2Mm: Number((y - (right - left) * tan30).toFixed(3)), emphasis: "minor" });
      }
    }
  } else if (pattern === "cornell-notes") {
    const left = marginMm;
    const right = format.widthMm - marginMm;
    const top = marginMm + 16;
    const summaryTop = format.heightMm - marginMm - 42;
    const cueX = left + Math.round(usableW * 0.30);
    // Frame lines
    lines.push({ x1Mm: left, y1Mm: top, x2Mm: right, y2Mm: top, emphasis: "major" });
    lines.push({ x1Mm: cueX, y1Mm: top, x2Mm: cueX, y2Mm: summaryTop, emphasis: "major" });
    lines.push({ x1Mm: left, y1Mm: summaryTop, x2Mm: right, y2Mm: summaryTop, emphasis: "major" });
    lines.push({ x1Mm: left, y1Mm: format.heightMm - marginMm, x2Mm: right, y2Mm: format.heightMm - marginMm, emphasis: "major" });
    const ruleGap = Math.max(6, spacingMm);
    for (let y = top + ruleGap; y < summaryTop - 2; y += ruleGap) {
      lines.push({ x1Mm: cueX + 2, y1Mm: Number(y.toFixed(2)), x2Mm: right, y2Mm: Number(y.toFixed(2)), emphasis: "minor" });
      rowsCount++;
    }
    colsCount = 2;
  } else if (pattern === "lined-ruled") {
    const ruleGap = Math.max(5, spacingMm);
    const left = marginMm;
    const right = format.widthMm - marginMm;
    const headerY = marginMm + 14;
    const marginRuleX = left + 22;
    lines.push({ x1Mm: marginRuleX, y1Mm: marginMm, x2Mm: marginRuleX, y2Mm: format.heightMm - marginMm, emphasis: "major" });
    for (let y = headerY; y <= format.heightMm - marginMm; y += ruleGap) {
      lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(2)), x2Mm: right, y2Mm: Number(y.toFixed(2)), emphasis: "minor" });
      rowsCount++;
    }
    colsCount = 1;
  } else if (pattern === "handwriting-primary") {
    const lineHeight = Math.max(12, spacingMm * 3);
    const gapBetween = 6;
    const left = marginMm;
    const right = format.widthMm - marginMm;
    for (let y = marginMm; y + lineHeight <= format.heightMm - marginMm; y += lineHeight + gapBetween) {
      lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(2)), x2Mm: right, y2Mm: Number(y.toFixed(2)), emphasis: "major" });
      lines.push({ x1Mm: left, y1Mm: Number((y + lineHeight / 2).toFixed(2)), x2Mm: right, y2Mm: Number((y + lineHeight / 2).toFixed(2)), emphasis: "dashed" });
      lines.push({ x1Mm: left, y1Mm: Number((y + lineHeight).toFixed(2)), x2Mm: right, y2Mm: Number((y + lineHeight).toFixed(2)), emphasis: "major" });
      rowsCount++;
    }
    colsCount = 1;
  } else if (pattern === "music-staff" || pattern === "guitar-tab") {
    const staffLines = pattern === "guitar-tab" ? 6 : 5;
    const lineGap = pattern === "guitar-tab" ? 2.8 : 2.1;
    const staffGap = pattern === "guitar-tab" ? 13 : 11;
    const left = marginMm;
    const right = format.widthMm - marginMm;
    const staffHeight = (staffLines - 1) * lineGap;
    for (let y = marginMm + 10; y + staffHeight <= format.heightMm - marginMm; y += staffHeight + staffGap) {
      for (let i = 0; i < staffLines; i++) {
        const sy = Number((y + i * lineGap).toFixed(2));
        lines.push({ x1Mm: left, y1Mm: sy, x2Mm: right, y2Mm: sy, emphasis: "minor" });
      }
      // Left and right bar lines
      lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(2)), x2Mm: left, y2Mm: Number((y + staffHeight).toFixed(2)), emphasis: "major" });
      lines.push({ x1Mm: right, y1Mm: Number(y.toFixed(2)), x2Mm: right, y2Mm: Number((y + staffHeight).toFixed(2)), emphasis: "major" });
      rowsCount++;
    }
    colsCount = 1;
  } else if (pattern === "calligraphy-slant") {
    const xHeight = Math.max(4, spacingMm);
    const ascender = xHeight * 1.5;
    const descender = xHeight * 1.5;
    const blockH = ascender + xHeight + descender + 5;
    const left = marginMm;
    const right = format.widthMm - marginMm;
    for (let y = marginMm; y + blockH - 5 <= format.heightMm - marginMm; y += blockH) {
      lines.push({ x1Mm: left, y1Mm: Number(y.toFixed(2)), x2Mm: right, y2Mm: Number(y.toFixed(2)), emphasis: "dashed" });
      lines.push({ x1Mm: left, y1Mm: Number((y + ascender).toFixed(2)), x2Mm: right, y2Mm: Number((y + ascender).toFixed(2)), emphasis: "major" });
      lines.push({ x1Mm: left, y1Mm: Number((y + ascender + xHeight).toFixed(2)), x2Mm: right, y2Mm: Number((y + ascender + xHeight).toFixed(2)), emphasis: "major" });
      lines.push({ x1Mm: left, y1Mm: Number((y + ascender + xHeight + descender).toFixed(2)), x2Mm: right, y2Mm: Number((y + ascender + xHeight + descender).toFixed(2)), emphasis: "dashed" });
      rowsCount++;
    }
    // 55 degree slant guides across the page
    const tan55 = Math.tan((55 * Math.PI) / 180);
    const stepSlant = 14;
    const bottom = format.heightMm - marginMm;
    const heightSpan = bottom - marginMm;
    const dx = heightSpan / tan55;
    for (let x = left - dx; x <= right + dx; x += stepSlant) {
      lines.push({ x1Mm: Number(x.toFixed(2)), y1Mm: bottom, x2Mm: Number((x + dx).toFixed(2)), y2Mm: marginMm, emphasis: "dashed" });
    }
    colsCount = 1;
  }

  return { format, pattern, marginMm, spacingMm, dots, lines, colsCount, rowsCount };
}
