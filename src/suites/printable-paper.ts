import {
  AVERY_TEMPLATES,
  HOLIDAY_COUNTRIES,
  PUBLIC_HOLIDAYS_2026_2027,
  buildAverySheetPlan,
  buildMonthCalendarGrid,
  buildPaperGeometry,
  type PaperFormatId,
  type PaperPatternKind,
} from "../engines/paper/index.js";
import {
  generateAveryPdf,
  generateHolidayCalendarPdf,
  generatePaperPdf,
} from "../services/pdf-export.js";

export interface PrintablePaperPreset {
  mode?: "paper" | "calendar" | "avery";
  format?: PaperFormatId;
  pattern?: PaperPatternKind;
  spacingMm?: number;
  country?: string;
  year?: number;
  month?: number;
  averyCode?: string;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function triggerPdfDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const PATTERN_LABELS: Record<PaperPatternKind, string> = {
  "dot-grid": "Dot Grid (Bullet Journal)",
  "graph-grid": "Graph / Engineering Grid",
  "isometric-dots": "Isometric Dots (30 deg)",
  "isometric-grid": "Isometric Triangle Grid",
  "cornell-notes": "Cornell Note-Taking",
  "lined-ruled": "Ruled Writing Sheet",
  "handwriting-primary": "Primary Handwriting Sheet",
  "music-staff": "Blank Sheet Music (5-Line Staves)",
  "guitar-tab": "Guitar Tablature (6-String)",
  "calligraphy-slant": "Copperplate / Calligraphy 55°",
};

const QUICK_PRESETS: Array<{ label: string; pattern: PaperPatternKind; spacingMm: number }> = [
  { label: "5mm Dot", pattern: "dot-grid", spacingMm: 5 },
  { label: "5mm Graph", pattern: "graph-grid", spacingMm: 5 },
  { label: "Isometric", pattern: "isometric-grid", spacingMm: 5 },
  { label: "Cornell", pattern: "cornell-notes", spacingMm: 7 },
  { label: "Music Staff", pattern: "music-staff", spacingMm: 2 },
];

export function mountPrintablePaper(
  container: HTMLElement,
  preset: PrintablePaperPreset,
  onStateChange?: (state: Record<string, string | number | boolean>) => void
): void {
  const state = {
    mode: preset.mode || "paper",
    format: (preset.format || "a4") as PaperFormatId,
    pattern: (preset.pattern || "dot-grid") as PaperPatternKind,
    spacingMm: preset.spacingMm ?? 5,
    marginMm: 12,
    inkHex: "#475569",
    strokeWidthPt: 0.6,
    title: "",
    country: preset.country || "BE",
    year: preset.year ?? 2026,
    month: preset.month ?? 0,
    weekStartsMonday: true,
    averyCode: preset.averyCode || "5160",
    averyLines: "ScaleAndFit Studio\nBrussels, Belgium\nscaleandfit.com",
    averyShowOutlines: true,
    offsetXMm: 0,
    offsetYMm: 0,
  };

  function emit(): void {
    onStateChange?.({
      mode: state.mode,
      format: state.format,
      pattern: state.pattern,
      spacingMm: state.spacingMm,
      country: state.country,
      year: state.year,
      averyCode: state.averyCode,
    });
  }

  function render(): void {
    container.innerHTML = `
      <div class="studio-controls-bar">
        <div class="segmented-bar" role="tablist">
          <button class="seg-btn ${state.mode === "paper" ? "active" : ""}" data-tab="paper" type="button">Grids, Notes &amp; Music Paper</button>
          <button class="seg-btn ${state.mode === "calendar" ? "active" : ""}" data-tab="calendar" type="button">2026–2027 Holiday Calendars</button>
          <button class="seg-btn ${state.mode === "avery" ? "active" : ""}" data-tab="avery" type="button">Avery Die-Cut Labels</button>
        </div>
      </div>
      <div class="studio-grid">
        <div class="panel form-grid" id="pp-controls"></div>
        <div class="panel" id="pp-stage"></div>
      </div>
    `;
    container.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.mode = btn.dataset.tab as typeof state.mode;
        emit();
        render();
      };
    });

    const controls = container.querySelector<HTMLElement>("#pp-controls")!;
    const stage = container.querySelector<HTMLElement>("#pp-stage")!;

    if (state.mode === "paper") renderPaper(controls, stage);
    else if (state.mode === "calendar") renderCalendar(controls, stage);
    else renderAvery(controls, stage);
  }

  function renderPaper(controls: HTMLElement, stage: HTMLElement): void {
    const plan = buildPaperGeometry(state.format, state.pattern, state.spacingMm, state.marginMm);
    const patOpts = (Object.keys(PATTERN_LABELS) as PaperPatternKind[])
      .map((k) => `<option value="${k}" ${k === state.pattern ? "selected" : ""}>${PATTERN_LABELS[k]}</option>`)
      .join("");
    const presetChips = QUICK_PRESETS.map(
      (p) =>
        `<button class="preset-chip ${state.pattern === p.pattern ? "active" : ""}" data-qpat="${p.pattern}" data-qspc="${p.spacingMm}" type="button">${p.label}</button>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Vector Sheet Parameters</h2>
        <span class="section-kicker">01 // 72 PT/IN</span>
      </div>
      <div class="preset-strip">${presetChips}</div>
      <div class="field"><label for="pp-pat">Template Geometry</label><select id="pp-pat">${patOpts}</select></div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-fmt">Paper Standard</label>
          <select id="pp-fmt">
            <option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 (210 × 297 mm)</option>
            <option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter (8.5 × 11 in)</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-spc">Pitch / Scale (mm)</label>
          <input id="pp-spc" type="number" min="2" max="20" step="0.5" value="${state.spacingMm}">
        </div>
      </div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-ink">Ink Tone</label>
          <select id="pp-ink">
            <option value="#475569" ${state.inkHex === "#475569" ? "selected" : ""}>Drafting Slate</option>
            <option value="#0F52BA" ${state.inkHex === "#0F52BA" ? "selected" : ""}>Blueprint Cobalt</option>
            <option value="#111214" ${state.inkHex === "#111214" ? "selected" : ""}>Carbon Ink</option>
            <option value="#94A3B8" ${state.inkHex === "#94A3B8" ? "selected" : ""}>Faint Grid</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-w">Stroke Weight (pt)</label>
          <input id="pp-w" type="number" min="0.25" max="1.5" step="0.05" value="${state.strokeWidthPt}">
        </div>
      </div>
      <div class="field"><label for="pp-title">Optional Header Title</label><input id="pp-title" type="text" placeholder="e.g. Lab Notebook / Sheet 01" value="${escapeXml(state.title)}"></div>
      <button class="btn-primary" id="pp-download" type="button">Download Vector PDF (${state.format.toUpperCase()})</button>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Physical Sheet</div><div class="value">${plan.format.widthMm}×${plan.format.heightMm}</div></div>
        <div class="kpi"><div class="label">Vector Nodes</div><div class="value">${plan.dots.length + plan.lines.length}</div></div>
      </div>
    `;

    controls.querySelectorAll<HTMLButtonElement>("[data-qpat]").forEach((b) => {
      b.onclick = () => {
        state.pattern = b.dataset.qpat as PaperPatternKind;
        state.spacingMm = Number(b.dataset.qspc || 5);
        emit();
        renderPaper(controls, stage);
      };
    });
    controls.querySelector<HTMLSelectElement>("#pp-pat")!.onchange = (e) => {
      state.pattern = (e.target as HTMLSelectElement).value as PaperPatternKind;
      emit();
      renderPaper(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#pp-fmt")!.onchange = (e) => {
      state.format = (e.target as HTMLSelectElement).value as PaperFormatId;
      emit();
      renderPaper(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#pp-spc")!.oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (v >= 2 && v <= 25) { state.spacingMm = v; emit(); renderPaper(controls, stage); }
    };
    controls.querySelector<HTMLSelectElement>("#pp-ink")!.onchange = (e) => {
      state.inkHex = (e.target as HTMLSelectElement).value;
      renderPaper(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#pp-w")!.oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (v >= 0.2 && v <= 2) state.strokeWidthPt = v;
    };
    controls.querySelector<HTMLInputElement>("#pp-title")!.oninput = (e) => {
      state.title = (e.target as HTMLInputElement).value;
    };
    controls.querySelector<HTMLButtonElement>("#pp-download")!.onclick = async () => {
      const pdfBytes = await generatePaperPdf({
        format: state.format,
        pattern: state.pattern,
        spacingMm: state.spacingMm,
        marginMm: state.marginMm,
        inkHex: state.inkHex,
        strokeWidthPt: state.strokeWidthPt,
        title: state.title || undefined,
      });
      triggerPdfDownload(pdfBytes, `${state.pattern}-${state.format}-scaleandfit.pdf`);
    };

    const dotStep = plan.dots.length > 900 ? 2 : 1;
    const svgDots = plan.dots
      .filter((_, i) => i % dotStep === 0)
      .map((d) => `<circle cx="${d.xMm}" cy="${d.yMm}" r="${Math.max(0.45, state.strokeWidthPt * 0.6)}" fill="${state.inkHex}" />`)
      .join("");
    const svgLines = plan.lines
      .slice(0, 320)
      .map(
        (l) => `<line x1="${l.x1Mm}" y1="${l.y1Mm}" x2="${l.x2Mm}" y2="${l.y2Mm}" stroke="${state.inkHex}" stroke-width="${l.emphasis === "major" ? 0.55 : 0.28}" ${l.emphasis === "dashed" ? 'stroke-dasharray="1.5 1.5"' : ""} />`
      )
      .join("");

    const fw = plan.format.widthMm;
    const fh = plan.format.heightMm;
    const m = state.marginMm;
    const cropTicks = `
      <g stroke="#CBD5E1" stroke-width="0.35" fill="none">
        <path d="M${m - 3} ${m}h3v-3M${fw - m + 3} ${m}h-3v-3M${m - 3} ${fh - m}h3v3M${fw - m + 3} ${fh - m}h-3v3" />
      </g>
    `;

    stage.innerHTML = `
      <div class="stage-toolbar">
        <span style="font-weight:600;font-size:.9rem">${PATTERN_LABELS[state.pattern]}</span>
        <span class="spec-tag">${state.format.toUpperCase()} · ${state.spacingMm} MM PITCH</span>
      </div>
      <div class="paper-mat">
        <svg viewBox="0 0 ${fw} ${fh}" style="max-height:430px;background:#ffffff;box-shadow:0 3px 14px rgba(17,18,20,0.14),0 0 0 1px rgba(17,18,20,0.12)" role="img" aria-label="Vector drafting sheet preview">
          ${cropTicks}
          ${svgLines}
          ${svgDots}
        </svg>
        <div class="paper-caption">${state.format === "a4" ? "ISO A4 · 210 × 297 MM" : "US LETTER · 215.9 × 279.4 MM"} · PRINT AT 100% ACTUAL SIZE</div>
      </div>
    `;
  }

  function renderCalendar(controls: HTMLElement, stage: HTMLElement): void {
    const countryOpts = Object.entries(HOLIDAY_COUNTRIES)
      .map(([code, name]) => `<option value="${code}" ${code === state.country ? "selected" : ""}>${name} (${code})</option>`)
      .join("");
    const monthNames = ["Full 12-Month Pack (Jan–Dec)", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthOpts = monthNames.map((n, i) => `<option value="${i}" ${i === state.month ? "selected" : ""}>${n}</option>`).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Holiday Calendar PDF</h2>
        <span class="section-kicker">02 // Planner</span>
      </div>
      <div class="field"><label for="pp-cc">Country Public Holidays</label><select id="pp-cc">${countryOpts}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-yr">Year</label>
          <select id="pp-yr"><option value="2026" ${state.year === 2026 ? "selected" : ""}>2026</option><option value="2027" ${state.year === 2027 ? "selected" : ""}>2027</option></select>
        </div>
        <div class="field"><label for="pp-mo">Scope</label><select id="pp-mo">${monthOpts}</select></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label for="pp-cfmt">Sheet Format</label>
          <select id="pp-cfmt"><option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 Landscape</option><option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter Landscape</option></select>
        </div>
        <div class="field"><label for="pp-wk">Week Starts</label>
          <select id="pp-wk"><option value="mon" ${state.weekStartsMonday ? "selected" : ""}>Monday (ISO)</option><option value="sun" ${!state.weekStartsMonday ? "selected" : ""}>Sunday (US)</option></select>
        </div>
      </div>
      <button class="btn-primary" id="pp-cal-dl" type="button">Download Holiday Calendar PDF</button>
    `;

    controls.querySelector<HTMLSelectElement>("#pp-cc")!.onchange = (e) => {
      state.country = (e.target as HTMLSelectElement).value;
      emit();
      renderCalendar(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#pp-yr")!.onchange = (e) => {
      state.year = Number((e.target as HTMLSelectElement).value);
      emit();
      renderCalendar(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#pp-mo")!.onchange = (e) => {
      state.month = Number((e.target as HTMLSelectElement).value);
      renderCalendar(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#pp-cfmt")!.onchange = (e) => {
      state.format = (e.target as HTMLSelectElement).value as PaperFormatId;
    };
    controls.querySelector<HTMLSelectElement>("#pp-wk")!.onchange = (e) => {
      state.weekStartsMonday = (e.target as HTMLSelectElement).value === "mon";
      renderCalendar(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#pp-cal-dl")!.onclick = async () => {
      const pdfBytes = await generateHolidayCalendarPdf({
        year: state.year,
        month: state.month,
        countryCode: state.country,
        countryName: HOLIDAY_COUNTRIES[state.country] || state.country,
        format: state.format,
        weekStartsMonday: state.weekStartsMonday,
        holidays: PUBLIC_HOLIDAYS_2026_2027[state.country] || [],
      });
      triggerPdfDownload(pdfBytes, `${state.year}-${state.country.toLowerCase()}-calendar-scaleandfit.pdf`);
    };

    const previewMonth = state.month === 0 ? 1 : state.month;
    const holidays = PUBLIC_HOLIDAYS_2026_2027[state.country] || [];
    const grid = buildMonthCalendarGrid(state.year, previewMonth, state.weekStartsMonday, holidays);
    const yearHolidays = holidays.filter((h) => h.date.startsWith(`${state.year}-`));

    stage.innerHTML = `
      <div class="stage-toolbar">
        <strong>${grid.monthName} ${grid.year} — ${HOLIDAY_COUNTRIES[state.country]}</strong>
        <span class="spec-tag">${yearHolidays.length} National Holidays</span>
      </div>
      <div class="data-table-wrap" style="margin-top:0">
        <table class="data-table">
          <thead><tr>${grid.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${grid.weeks
              .map(
                (w) => `<tr>${w
                  .map(
                    (c) => `<td style="vertical-align:top;height:58px;${c.holidayNames.length ? "border-top:2px solid var(--accent-b);background:var(--accent-b-soft);" : ""}${!c.inMonth ? "opacity:.35;" : ""}"><strong>${c.day}</strong>${c.holidayNames.length ? `<div style="font-size:.7rem;color:var(--accent-b);font-weight:600;margin-top:2px">${c.holidayNames[0]}</div>` : ""}</td>`
                  )
                  .join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;font-size:.8rem;color:var(--muted)">
        ${yearHolidays.map((h) => `<div><span style="font-family:var(--font-mono);color:var(--text)">${h.date}</span> · ${escapeXml(h.name)}</div>`).join("")}
      </div>
    `;
  }

  function renderAvery(controls: HTMLElement, stage: HTMLElement): void {
    const tpl = AVERY_TEMPLATES.find((a) => a.code === state.averyCode) || AVERY_TEMPLATES[0];
    const plan = buildAverySheetPlan(tpl, state.offsetXMm, state.offsetYMm);
    const tplOpts = AVERY_TEMPLATES.map(
      (a) => `<option value="${a.code}" ${a.code === tpl.code ? "selected" : ""}>${a.name}</option>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Avery Die-Cut Matrix</h2>
        <span class="section-kicker">03 // Calibration</span>
      </div>
      <div class="field"><label for="pp-av">Template Standard</label><select id="pp-av">${tplOpts}</select></div>
      <div class="field"><label for="pp-av-txt">Label Copy (3 lines)</label><textarea id="pp-av-txt" rows="3">${escapeXml(state.averyLines)}</textarea></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-ox">X Nudge (${state.offsetXMm} mm)</label><input id="pp-ox" type="range" min="-5" max="5" step="0.5" value="${state.offsetXMm}"></div>
        <div class="field"><label for="pp-oy">Y Nudge (${state.offsetYMm} mm)</label><input id="pp-oy" type="range" min="-5" max="5" step="0.5" value="${state.offsetYMm}"></div>
      </div>
      <button class="btn-primary" id="pp-av-dl" type="button">Download Die-Cut Sheet PDF (${plan.totalLabels} labels)</button>
    `;

    controls.querySelector<HTMLSelectElement>("#pp-av")!.onchange = (e) => {
      state.averyCode = (e.target as HTMLSelectElement).value;
      emit();
      renderAvery(controls, stage);
    };
    controls.querySelector<HTMLTextAreaElement>("#pp-av-txt")!.oninput = (e) => {
      state.averyLines = (e.target as HTMLTextAreaElement).value;
      renderAveryStage(stage, tpl);
    };
    controls.querySelector<HTMLInputElement>("#pp-ox")!.oninput = (e) => {
      state.offsetXMm = Number((e.target as HTMLInputElement).value);
      renderAvery(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#pp-oy")!.oninput = (e) => {
      state.offsetYMm = Number((e.target as HTMLInputElement).value);
      renderAvery(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#pp-av-dl")!.onclick = async () => {
      const pdfBytes = await generateAveryPdf(
        tpl,
        state.averyLines.split(/\r?\n/),
        state.averyShowOutlines,
        state.offsetXMm,
        state.offsetYMm
      );
      triggerPdfDownload(pdfBytes, `avery-${tpl.code.toLowerCase()}-scaleandfit.pdf`);
    };

    renderAveryStage(stage, tpl);
  }

  function renderAveryStage(stage: HTMLElement, tpl: (typeof AVERY_TEMPLATES)[number]): void {
    const plan = buildAverySheetPlan(tpl, state.offsetXMm, state.offsetYMm);
    const lines = state.averyLines.split(/\r?\n/).slice(0, 3);
    const boxesSvg = plan.boxes
      .map((b) => {
        const lineSvg = lines
          .map(
            (ln, idx) =>
              `<text x="${(b.xMm + 2.5).toFixed(2)}" y="${(b.yMm + 5.2 + idx * 3.6).toFixed(2)}" font-family="sans-serif" font-size="2.7" fill="#111214">${escapeXml(ln.slice(0, 26))}</text>`
          )
          .join("");
        return `<rect x="${b.xMm}" y="${b.yMm}" width="${b.widthMm}" height="${b.heightMm}" rx="1.2" fill="rgba(15,82,186,0.035)" stroke="#0F52BA" stroke-width="0.35" />${lineSvg}`;
      })
      .join("");

    stage.innerHTML = `
      <div class="stage-toolbar">
        <strong>${tpl.name} (${tpl.cols} × ${tpl.rows})</strong>
        <span class="spec-tag">${tpl.labelWidthMm} × ${tpl.labelHeightMm} MM PER LABEL</span>
      </div>
      <div class="paper-mat">
        <svg viewBox="0 0 ${plan.paperWidthMm} ${plan.paperHeightMm}" style="max-height:430px;background:#ffffff;box-shadow:0 3px 14px rgba(17,18,20,0.14),0 0 0 1px rgba(17,18,20,0.12)" role="img" aria-label="Avery die-cut label layout preview">
          ${boxesSvg}
        </svg>
        <div class="paper-caption">${tpl.paper.toUpperCase()} SHEET · CALIBRATION OFFSET (${state.offsetXMm >= 0 ? "+" : ""}${state.offsetXMm}, ${state.offsetYMm >= 0 ? "+" : ""}${state.offsetYMm}) MM</div>
      </div>
    `;
  }

  render();
}
