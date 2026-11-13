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
    averyLines: "ScaleAndFit Studio\nBrussels, Belgium\nhello@scaleandfit.com",
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
      <div class="studio-tabs" role="tablist">
        <button class="tab-btn ${state.mode === "paper" ? "active" : ""}" data-tab="paper">Grids, Notes &amp; Music Paper</button>
        <button class="tab-btn ${state.mode === "calendar" ? "active" : ""}" data-tab="calendar">2026–2027 Holiday Calendars</button>
        <button class="tab-btn ${state.mode === "avery" ? "active" : ""}" data-tab="avery">Avery Label Templates</button>
      </div>
      <div class="studio-grid">
        <div class="card form-grid" id="pp-controls"></div>
        <div class="card" id="pp-stage"></div>
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

    controls.innerHTML = `
      <h3>Vector PDF Paper Studio</h3>
      <div class="field"><label for="pp-pat">Template</label><select id="pp-pat">${patOpts}</select></div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-fmt">Paper Size</label>
          <select id="pp-fmt">
            <option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 (210 × 297 mm)</option>
            <option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter (8.5 × 11 in)</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-spc">Spacing / Scale (mm)</label>
          <input id="pp-spc" type="number" min="2" max="20" step="0.5" value="${state.spacingMm}">
        </div>
      </div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-ink">Ink Color</label>
          <select id="pp-ink">
            <option value="#475569" ${state.inkHex === "#475569" ? "selected" : ""}>Neutral Slate</option>
            <option value="#0284c7" ${state.inkHex === "#0284c7" ? "selected" : ""}>Blueprint Cyan</option>
            <option value="#1e293b" ${state.inkHex === "#1e293b" ? "selected" : ""}>Classic Black</option>
            <option value="#94a3b8" ${state.inkHex === "#94a3b8" ? "selected" : ""}>Faint Drafting Grey</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-w">Line Weight (pt)</label>
          <input id="pp-w" type="number" min="0.25" max="1.5" step="0.05" value="${state.strokeWidthPt}">
        </div>
      </div>
      <div class="field"><label for="pp-title">Optional Header Title</label><input id="pp-title" type="text" placeholder="e.g. Lab Notebook / Project Alpha" value="${state.title}"></div>
      <button class="btn-primary" id="pp-download">Download Exact-Scale Vector PDF</button>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Exact Format</div><div class="value">${plan.format.id.toUpperCase()}</div></div>
        <div class="kpi"><div class="label">Vector Elements</div><div class="value">${plan.dots.length + plan.lines.length}</div></div>
      </div>
    `;

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

    // Light crisp SVG vector preview (subsampling dense dot grids to keep DOM snappy while PDF gets every point)
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

    stage.innerHTML = `
      <div class="viewport-box" style="background:#ffffff">
        <svg viewBox="0 0 ${plan.format.widthMm} ${plan.format.heightMm}" style="max-height:420px;box-shadow:0 4px 18px rgba(0,0,0,0.18);background:#fff">
          ${svgLines}
          ${svgDots}
        </svg>
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
      <h3>Holiday Calendar PDF Builder</h3>
      <div class="field"><label for="pp-cc">Country Holidays</label><select id="pp-cc">${countryOpts}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-yr">Year</label>
          <select id="pp-yr"><option value="2026" ${state.year === 2026 ? "selected" : ""}>2026</option><option value="2027" ${state.year === 2027 ? "selected" : ""}>2027</option></select>
        </div>
        <div class="field"><label for="pp-mo">Scope</label><select id="pp-mo">${monthOpts}</select></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label for="pp-cfmt">Paper</label>
          <select id="pp-cfmt"><option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 Landscape</option><option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter Landscape</option></select>
        </div>
        <div class="field"><label for="pp-wk">Week Starts</label>
          <select id="pp-wk"><option value="mon" ${state.weekStartsMonday ? "selected" : ""}>Monday (ISO)</option><option value="sun" ${!state.weekStartsMonday ? "selected" : ""}>Sunday (US)</option></select>
        </div>
      </div>
      <button class="btn-primary" id="pp-cal-dl">Download Holiday Calendar PDF</button>
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
      <h3 style="margin-bottom:8px">${grid.monthName} ${grid.year} — ${HOLIDAY_COUNTRIES[state.country]}</h3>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>${grid.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${grid.weeks
              .map(
                (w) => `<tr>${w
                  .map(
                    (c) => `<td style="${c.holidayNames.length ? "background:var(--ok-bg);" : ""}${!c.inMonth ? "opacity:.4;" : ""}"><strong>${c.day}</strong>${c.holidayNames.length ? `<div style="font-size:.7rem;color:var(--ok)">${c.holidayNames[0]}</div>` : ""}</td>`
                  )
                  .join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p style="font-size:.86rem;color:var(--muted);margin-top:12px">
        ${state.year} ${HOLIDAY_COUNTRIES[state.country]} holidays included: ${yearHolidays.map((h) => `${h.date} (${h.name})`).join(" · ")}
      </p>
    `;
  }

  function renderAvery(controls: HTMLElement, stage: HTMLElement): void {
    const tpl = AVERY_TEMPLATES.find((a) => a.code === state.averyCode) || AVERY_TEMPLATES[0];
    const plan = buildAverySheetPlan(tpl, state.offsetXMm, state.offsetYMm);
    const tplOpts = AVERY_TEMPLATES.map(
      (a) => `<option value="${a.code}" ${a.code === tpl.code ? "selected" : ""}>${a.name}</option>`
    ).join("");

    controls.innerHTML = `
      <h3>Avery Label &amp; Card Studio</h3>
      <div class="field"><label for="pp-av">Template Code</label><select id="pp-av">${tplOpts}</select></div>
      <div class="field"><label for="pp-av-txt">Label Text Lines</label><textarea id="pp-av-txt" rows="3" style="padding:8px;border-radius:8px;background:var(--surface-2);border:1px solid var(--border)">${state.averyLines}</textarea></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-ox">X Nudge (${state.offsetXMm} mm)</label><input id="pp-ox" type="range" min="-5" max="5" step="0.5" value="${state.offsetXMm}"></div>
        <div class="field"><label for="pp-oy">Y Nudge (${state.offsetYMm} mm)</label><input id="pp-oy" type="range" min="-5" max="5" step="0.5" value="${state.offsetYMm}"></div>
      </div>
      <button class="btn-primary" id="pp-av-dl">Download Die-Cut Sheet PDF (${plan.totalLabels} labels)</button>
    `;

    controls.querySelector<HTMLSelectElement>("#pp-av")!.onchange = (e) => {
      state.averyCode = (e.target as HTMLSelectElement).value;
      emit();
      renderAvery(controls, stage);
    };
    controls.querySelector<HTMLTextAreaElement>("#pp-av-txt")!.oninput = (e) => {
      state.averyLines = (e.target as HTMLTextAreaElement).value;
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

    stage.innerHTML = `
      <div class="viewport-box" style="background:#ffffff">
        <svg viewBox="0 0 ${plan.paperWidthMm} ${plan.paperHeightMm}" style="max-height:420px;box-shadow:0 4px 18px rgba(0,0,0,0.18);background:#fff">
          ${plan.boxes
            .map(
              (b) => `<rect x="${b.xMm}" y="${b.yMm}" width="${b.widthMm}" height="${b.heightMm}" fill="rgba(56,189,248,0.06)" stroke="#0284c7" stroke-width="0.45" />`
            )
            .join("")}
        </svg>
      </div>
    `;
  }

  render();
}
