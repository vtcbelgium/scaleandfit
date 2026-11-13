import { PAPER_FORMATS, type PaperFormatId } from "./coords.js";

export interface AveryTemplateSpec {
  code: string;
  name: string;
  paper: PaperFormatId;
  cols: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginTopMm: number;
  marginLeftMm: number;
  gapXMm: number;
  gapYMm: number;
}

export interface LabelBoxMm {
  index: number;
  row: number;
  col: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface AverySheetPlan {
  template: AveryTemplateSpec;
  paperWidthMm: number;
  paperHeightMm: number;
  totalLabels: number;
  boxes: LabelBoxMm[];
}

export function buildAverySheetPlan(
  template: AveryTemplateSpec,
  offsetXMm = 0,
  offsetYMm = 0
): AverySheetPlan {
  const fmt = PAPER_FORMATS[template.paper];
  const boxes: LabelBoxMm[] = [];
  let idx = 0;
  for (let r = 0; r < template.rows; r++) {
    for (let c = 0; c < template.cols; c++) {
      const xMm = template.marginLeftMm + offsetXMm + c * (template.labelWidthMm + template.gapXMm);
      const yMm = template.marginTopMm + offsetYMm + r * (template.labelHeightMm + template.gapYMm);
      boxes.push({
        index: idx++,
        row: r,
        col: c,
        xMm: Number(xMm.toFixed(2)),
        yMm: Number(yMm.toFixed(2)),
        widthMm: template.labelWidthMm,
        heightMm: template.labelHeightMm,
      });
    }
  }
  return {
    template,
    paperWidthMm: fmt.widthMm,
    paperHeightMm: fmt.heightMm,
    totalLabels: boxes.length,
    boxes,
  };
}
