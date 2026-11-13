// src/photo/layout.ts
import type { BiometricPhotoSpec } from "./specs.js";

export interface HeadCropGuide {
  minHeadRatio: number;
  maxHeadRatio: number;
  idealHeadRatio: number;
  eyeLineYRatioFromTop: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface TilePlacement {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotated: boolean;
}

export interface PrintSheetLayout {
  sheetWidthMm: number;
  sheetHeightMm: number;
  sheetPixelWidth: number;
  sheetPixelHeight: number;
  cols: number;
  rows: number;
  count: number;
  placements: TilePlacement[];
}

export function mmToPixelsAtDpi(mm: number, dpi = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

export function computeHeadCropGuide(spec: BiometricPhotoSpec, dpi = 300): HeadCropGuide {
  const minHeadRatio = spec.minHeadMm / spec.heightMm;
  const maxHeadRatio = spec.maxHeadMm / spec.heightMm;
  const idealHeadRatio = (spec.minHeadMm + spec.maxHeadMm) / 2 / spec.heightMm;
  const eyeLineYRatioFromTop = 1 - (spec.eyeLineFromBottomMinRatio + spec.eyeLineFromBottomMaxRatio) / 2;
  const pixelWidth = mmToPixelsAtDpi(spec.widthMm, dpi);
  const pixelHeight = mmToPixelsAtDpi(spec.heightMm, dpi);
  return { minHeadRatio, maxHeadRatio, idealHeadRatio, eyeLineYRatioFromTop, pixelWidth, pixelHeight };
}

export function computePrintSheetLayout(spec: BiometricPhotoSpec, sheetWidthMm = 152.4, sheetHeightMm = 101.6, marginMm = 4, gapMm = 2, dpi = 300): PrintSheetLayout {
  const availW = sheetWidthMm - 2 * marginMm;
  const availH = sheetHeightMm - 2 * marginMm;
  const tileW = spec.widthMm;
  const tileH = spec.heightMm;
  const colsUpright = Math.floor((availW + gapMm) / (tileW + gapMm));
  const rowsUpright = Math.floor((availH + gapMm) / (tileH + gapMm));
  const countUpright = colsUpright * rowsUpright;
  const tileWRotated = spec.heightMm;
  const tileHRotated = spec.widthMm;
  const colsRotated = Math.floor((availW + gapMm) / (tileWRotated + gapMm));
  const rowsRotated = Math.floor((availH + gapMm) / (tileHRotated + gapMm));
  const countRotated = colsRotated * rowsRotated;
  const useRotated = countRotated > countUpright;
  const cols = useRotated ? colsRotated : colsUpright;
  const rows = useRotated ? rowsRotated : rowsUpright;
  const finalTileW = useRotated ? tileWRotated : tileW;
  const finalTileH = useRotated ? tileHRotated : tileH;
  const count = cols * rows;
  const startX = (sheetWidthMm - (cols * finalTileW + (cols - 1) * gapMm)) / 2;
  const startY = (sheetHeightMm - (rows * finalTileH + (rows - 1) * gapMm)) / 2;
  const placements: TilePlacement[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xMm = startX + col * (finalTileW + gapMm);
      const yMm = startY + row * (finalTileH + gapMm);
      placements.push({ xMm, yMm, widthMm: finalTileW, heightMm: finalTileH, rotated: useRotated });
    }
  }
  return {
    sheetWidthMm,
    sheetHeightMm,
    sheetPixelWidth: mmToPixelsAtDpi(sheetWidthMm, dpi),
    sheetPixelHeight: mmToPixelsAtDpi(sheetHeightMm, dpi),
    cols,
    rows,
    count,
    placements
  };
}
