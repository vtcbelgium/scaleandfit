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
import { renderStepRibbon, renderVisualGuideSection } from "../components/guide-section.js";
import { escapeHtml, t, type LocaleCode } from "../i18n/index.js";
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
  onStateChange?: (state: Record<string, string | number | boolean>) => void,
  lang: LocaleCode = "en"
): void {
  const tr = t(lang);
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
      ${renderStepRibbon(tr.paper.steps, 2)}

      <div class="studio-controls-bar">
        <div class="segmented-bar" role="tablist">
          <button class="seg-btn ${state.mode === "paper" ? "active" : ""}" data-tab="paper" type="button">${escapeHtml(tr.paper.tabPaper)}</button>
          <button class="seg-btn ${state.mode === "calendar" ? "active" : ""}" data-tab="calendar" type="button">${escapeHtml(tr.paper.tabCalendar)}</button>
          <button class="seg-btn ${state.mode === "avery" ? "active" : ""}" data-tab="avery" type="button">${escapeHtml(tr.paper.tabAvery)}</button>
        </div>
      </div>
      <div class="studio-grid">
        <div class="panel form-grid" id="pp-controls"></div>
        <div class="panel" id="pp-stage"></div>
      </div>

      ${renderVisualGuideSection({
        title: tr.paper.howTitle,
        lead: tr.paper.howLead,
        bannerSrc: "/images/guide-printable-paper.jpg",
        bannerAlt: tr.paper.bannerAlt,
        stepSvgs: ["/guides/paper-step-1.svg", "/guides/paper-step-2.svg", "/guides/paper-step-3.svg"],
        stepCards: tr.paper.stepCards,
      })}
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
      .map((k) => `<option value="${k}" ${k === state.pattern ? "selected" : ""}>${escapeHtml(PATTERN_LABELS[k])}</option>`)
      .join("");
    const presetChips = QUICK_PRESETS.map(
      (p) =>
        `<button class="country-chip ${state.pattern === p.pattern ? "active" : ""}" data-qpat="${p.pattern}" data-qspc="${p.spacingMm}" type="button">${escapeHtml(p.label)}</button>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">${escapeHtml(tr.paper.paperTitle)}</h2>
        <span class="section-kicker">VECTOR PDF</span>
      </div>
      <div style="font-size:.78rem;color:var(--muted)">${escapeHtml(tr.paper.presetLabel)}</div>
      <div class="country-chip-row">${presetChips}</div>
      <div class="field"><label for="pp-pat">${escapeHtml(tr.paper.patternLabel)}</label><select id="pp-pat">${patOpts}</select></div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-fmt">${escapeHtml(tr.paper.formatLabel)}</label>
          <select id="pp-fmt">
            <option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 (210 × 297 mm)</option>
            <option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter (8.5 × 11 in)</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-spc">${escapeHtml(tr.paper.spacingLabel)}</label>
          <input id="pp-spc" type="number" min="2" max="20" step="0.5" value="${state.spacingMm}">
        </div>
      </div>
      <div class="form-row-2">
        <div class="field">
          <label for="pp-ink">${escapeHtml(tr.paper.inkLabel)}</label>
          <select id="pp-ink">
            <option value="#475569" ${state.inkHex === "#475569" ? "selected" : ""}>Slate Grey</option>
            <option value="#0F52BA" ${state.inkHex === "#0F52BA" ? "selected" : ""}>Blueprint Cobalt</option>
            <option value="#111214" ${state.inkHex === "#111214" ? "selected" : ""}>Black Ink</option>
            <option value="#94A3B8" ${state.inkHex === "#94A3B8" ? "selected" : ""}>Faint Silver</option>
          </select>
        </div>
        <div class="field">
          <label for="pp-w">${escapeHtml(tr.paper.weightLabel)}</label>
          <input id="pp-w" type="number" min="0.25" max="1.5" step="0.05" value="${state.strokeWidthPt}">
        </div>
      </div>
      <div class="field"><label for="pp-title">${escapeHtml(tr.paper.titleLabel)}</label><input id="pp-title" type="text" placeholder="${escapeHtml(tr.paper.titlePlaceholder)}" value="${escapeHtml(state.title)}"></div>
      <button class="btn-primary" id="pp-download" type="button">${escapeHtml(tr.paper.dlPaper)} (${state.format.toUpperCase()})</button>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">${escapeHtml(tr.paper.kpiSize)}</div><div class="value">${plan.format.widthMm}×${plan.format.heightMm}</div></div>
        <div class="kpi"><div class="label">${escapeHtml(tr.paper.kpiPitch)}</div><div class="value">${state.spacingMm} mm</div></div>
        <div class="kpi"><div class="label">${escapeHtml(tr.paper.kpiPrintScale)}</div><div class="value">100%</div></div>
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
        <span style="font-weight:600;font-size:.95rem">${escapeHtml(PATTERN_LABELS[state.pattern])}</span>
        <span class="spec-tag">${state.format.toUpperCase()} · ${state.spacingMm} MM</span>
      </div>
      <div class="paper-mat">
        <svg viewBox="0 0 ${fw} ${fh}" style="max-height:430px;background:#ffffff;box-shadow:0 3px 14px rgba(17,18,20,0.14),0 0 0 1px rgba(17,18,20,0.12)" role="img" aria-label="Vector drafting sheet preview">
          ${cropTicks}
          ${svgLines}
          ${svgDots}
        </svg>
        <div class="paper-caption">${escapeHtml(tr.paper.captionPrintAt100)}</div>
      </div>
    `;
  }

  function renderCalendar(controls: HTMLElement, stage: HTMLElement): void {
    const countryOpts = Object.entries(HOLIDAY_COUNTRIES)
      .map(([code, name]) => `<option value="${code}" ${code === state.country ? "selected" : ""}>${escapeHtml(name)} (${code})</option>`)
      .join("");
    const monthNames = ["Full 12-Month Pack (Jan–Dec)", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthOpts = monthNames.map((n, i) => `<option value="${i}" ${i === state.month ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">${escapeHtml(tr.paper.calTitle)}</h2>
        <span class="section-kicker">2026 · 2027</span>
      </div>
      <div class="field"><label for="pp-cc">${escapeHtml(tr.paper.calCountry)}</label><select id="pp-cc">${countryOpts}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-yr">${escapeHtml(tr.paper.calYear)}</label>
          <select id="pp-yr"><option value="2026" ${state.year === 2026 ? "selected" : ""}>2026</option><option value="2027" ${state.year === 2027 ? "selected" : ""}>2027</option></select>
        </div>
        <div class="field"><label for="pp-mo">${escapeHtml(tr.paper.calScope)}</label><select id="pp-mo">${monthOpts}</select></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label for="pp-cfmt">${escapeHtml(tr.paper.calFormat)}</label>
          <select id="pp-cfmt"><option value="a4" ${state.format === "a4" ? "selected" : ""}>A4 Landscape</option><option value="letter" ${state.format === "letter" ? "selected" : ""}>US Letter Landscape</option></select>
        </div>
        <div class="field"><label for="pp-wk">${escapeHtml(tr.paper.calWeek)}</label>
          <select id="pp-wk"><option value="mon" ${state.weekStartsMonday ? "selected" : ""}>${escapeHtml(tr.paper.weekMon)}</option><option value="sun" ${!state.weekStartsMonday ? "selected" : ""}>${escapeHtml(tr.paper.weekSun)}</option></select>
        </div>
      </div>
      <button class="btn-primary" id="pp-cal-dl" type="button">${escapeHtml(tr.paper.dlCal)}</button>
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
        <strong>${grid.monthName} ${grid.year} — ${escapeHtml(HOLIDAY_COUNTRIES[state.country] || state.country)}</strong>
        <span class="spec-tag">${yearHolidays.length} ${escapeHtml(tr.paper.calHolidaysBadge)}</span>
      </div>
      <div class="data-table-wrap" style="margin-top:0">
        <table class="data-table">
          <thead><tr>${grid.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${grid.weeks
              .map(
                (w) => `<tr>${w
                  .map(
                    (c) => `<td style="vertical-align:top;height:58px;${c.holidayNames.length ? "border-top:2px solid var(--accent-b);background:var(--accent-b-soft);" : ""}${!c.inMonth ? "opacity:.35;" : ""}"><strong>${c.day}</strong>${c.holidayNames.length ? `<div style="font-size:.7rem;color:var(--accent-b);font-weight:600;margin-top:2px">${escapeHtml(c.holidayNames[0])}</div>` : ""}</td>`
                  )
                  .join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;font-size:.82rem;color:var(--muted)">
        ${yearHolidays.map((h) => `<div><span style="font-family:var(--font-mono);color:var(--text)">${h.date}</span> · ${escapeHtml(h.name)}</div>`).join("")}
      </div>
    `;
  }

  function renderAvery(controls: HTMLElement, stage: HTMLElement): void {
    const tpl = AVERY_TEMPLATES.find((a) => a.code === state.averyCode) || AVERY_TEMPLATES[0];
    const plan = buildAverySheetPlan(tpl, state.offsetXMm, state.offsetYMm);
    const tplOpts = AVERY_TEMPLATES.map(
      (a) => `<option value="${a.code}" ${a.code === tpl.code ? "selected" : ""}>${escapeHtml(a.name)}</option>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">${escapeHtml(tr.paper.averyTitle)}</h2>
        <span class="section-kicker">${tpl.cols}×${tpl.rows}</span>
      </div>
      <div class="field"><label for="pp-av">${escapeHtml(tr.paper.averyTemplate)}</label><select id="pp-av">${tplOpts}</select></div>
      <div class="field"><label for="pp-av-txt">${escapeHtml(tr.paper.averyCopy)}</label><textarea id="pp-av-txt" rows="3">${escapeHtml(state.averyLines)}</textarea></div>
      <div class="form-row-2">
        <div class="field"><label for="pp-ox">${escapeHtml(tr.paper.averyXNudge)} (${state.offsetXMm} mm)</label><input id="pp-ox" type="range" min="-5" max="5" step="0.5" value="${state.offsetXMm}"></div>
        <div class="field"><label for="pp-oy">${escapeHtml(tr.paper.averyYNudge)} (${state.offsetYMm} mm)</label><input id="pp-oy" type="range" min="-5" max="5" step="0.5" value="${state.offsetYMm}"></div>
      </div>
      <button class="btn-primary" id="pp-av-dl" type="button">${escapeHtml(tr.paper.dlAvery)} (${plan.totalLabels} ${escapeHtml(tr.paper.labelsUnit)})</button>
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
              `<text x="${(b.xMm + 2.5).toFixed(2)}" y="${(b.yMm + 5.2 + idx * 3.6).toFixed(2)}" font-family="sans-serif" font-size="2.7" fill="#111214">${escapeHtml(ln.slice(0, 26))}</text>`
          )
          .join("");
        return `<rect x="${b.xMm}" y="${b.yMm}" width="${b.widthMm}" height="${b.heightMm}" rx="1.2" fill="rgba(15,82,186,0.035)" stroke="#0F52BA" stroke-width="0.35" />${lineSvg}`;
      })
      .join("");

    stage.innerHTML = `
      <div class="stage-toolbar">
        <strong>${escapeHtml(tpl.name)} (${tpl.cols} × ${tpl.rows})</strong>
        <span class="spec-tag">${tpl.labelWidthMm} × ${tpl.labelHeightMm} MM</span>
      </div>
      <div class="paper-mat">
        <svg viewBox="0 0 ${plan.paperWidthMm} ${plan.paperHeightMm}" style="max-height:430px;background:#ffffff;box-shadow:0 3px 14px rgba(17,18,20,0.14),0 0 0 1px rgba(17,18,20,0.12)" role="img" aria-label="Avery die-cut label layout preview">
          ${boxesSvg}
        </svg>
        <div class="paper-caption">${escapeHtml(tr.paper.captionPrintAt100)} (${state.offsetXMm >= 0 ? "+" : ""}${state.offsetXMm}, ${state.offsetYMm >= 0 ? "+" : ""}${state.offsetYMm} mm)</div>
      </div>
    `;
  }

  render();
}
