import {
  AIRLINE_FLEET,
  DISPLAY_PRESETS,
  MATTRESS_PRESETS,
  compareDisplays,
  compareMattresses,
  evaluateBagAgainstAirline,
  evaluateBagFleet,
  type AirlineBaggageSpec,
} from "../engines/sizer/index.js";

export interface VisualSizerPreset {
  mode?: "screens" | "airlines" | "mattresses";
  displayA?: string;
  displayB?: string;
  airline?: string;
  mattressA?: string;
  mattressB?: string;
  bagL?: number;
  bagW?: number;
  bagD?: number;
  bagKg?: number;
  unit?: "metric" | "imperial";
}

function fmtLen(cm: number, unit: "metric" | "imperial"): string {
  return unit === "imperial" ? `${(cm / 2.54).toFixed(1)} in` : `${cm.toFixed(1)} cm`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cadDimH(x1: number, x2: number, y: number, label: string, color = "var(--muted)"): string {
  return `
    <g stroke="${color}" stroke-width="1">
      <line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" />
      <line x1="${x1.toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${x1.toFixed(1)}" y2="${(y + 4).toFixed(1)}" />
      <line x1="${x2.toFixed(1)}" y1="${(y - 4).toFixed(1)}" x2="${x2.toFixed(1)}" y2="${(y + 4).toFixed(1)}" />
    </g>
    <text x="${((x1 + x2) / 2).toFixed(1)}" y="${(y + 13).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="10.5" font-family="ui-monospace,Consolas,monospace">${escapeAttr(label)}</text>
  `;
}

function cadDimV(x: number, y1: number, y2: number, label: string, color = "var(--muted)", side: "left" | "right" = "right"): string {
  const anchor = side === "right" ? "start" : "end";
  const tx = side === "right" ? x + 7 : x - 7;
  return `
    <g stroke="${color}" stroke-width="1">
      <line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}" />
      <line x1="${(x - 4).toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x + 4).toFixed(1)}" y2="${y1.toFixed(1)}" />
      <line x1="${(x - 4).toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(x + 4).toFixed(1)}" y2="${y2.toFixed(1)}" />
    </g>
    <text x="${tx.toFixed(1)}" y="${((y1 + y2) / 2 + 3.5).toFixed(1)}" text-anchor="${anchor}" fill="${color}" font-size="10.5" font-family="ui-monospace,Consolas,monospace">${escapeAttr(label)}</text>
  `;
}

export function mountVisualSizer(
  container: HTMLElement,
  preset: VisualSizerPreset,
  onStateChange?: (state: Record<string, string | number | boolean>) => void
): void {
  const state = {
    mode: preset.mode || "screens",
    displayA: preset.displayA || DISPLAY_PRESETS.find((d) => d.diagonalIn === 55)?.id || DISPLAY_PRESETS[0].id,
    displayB: preset.displayB || DISPLAY_PRESETS.find((d) => d.diagonalIn === 65)?.id || DISPLAY_PRESETS[1].id,
    airline: preset.airline || AIRLINE_FLEET[0]?.slug || "ryanair-carry-on-size",
    regionFilter: "ALL",
    mattressA: preset.mattressA || MATTRESS_PRESETS.find((m) => m.id === "us-queen")?.id || MATTRESS_PRESETS[0].id,
    mattressB: preset.mattressB || MATTRESS_PRESETS.find((m) => m.id === "us-king")?.id || MATTRESS_PRESETS[1].id,
    bagL: preset.bagL ?? 55,
    bagW: preset.bagW ?? 40,
    bagD: preset.bagD ?? 20,
    bagKg: preset.bagKg ?? 8,
    roomW: 360,
    roomL: 420,
    overlayMode: true,
    showHumanRef: false,
    unit: (preset.unit || "metric") as "metric" | "imperial",
  };

  function emitState(): void {
    onStateChange?.({
      mode: state.mode,
      displayA: state.displayA,
      displayB: state.displayB,
      airline: state.airline,
      mattressA: state.mattressA,
      mattressB: state.mattressB,
      bagL: state.bagL,
      bagW: state.bagW,
      bagD: state.bagD,
      bagKg: state.bagKg,
      unit: state.unit,
    });
  }

  function render(): void {
    const unit = state.unit;
    container.innerHTML = `
      <div class="studio-controls-bar">
        <div class="segmented-bar" role="tablist">
          <button class="seg-btn ${state.mode === "screens" ? "active" : ""}" data-tab="screens" type="button">Screens &amp; TVs</button>
          <button class="seg-btn ${state.mode === "airlines" ? "active" : ""}" data-tab="airlines" type="button">Airline Carry-On Sizer</button>
          <button class="seg-btn ${state.mode === "mattresses" ? "active" : ""}" data-tab="mattresses" type="button">Mattress &amp; Bedroom Plan</button>
        </div>
        <div class="segmented-bar" role="group" aria-label="Measurement units">
          <button class="seg-btn ${unit === "metric" ? "active" : ""}" id="vs-unit-metric" type="button">cm / kg</button>
          <button class="seg-btn ${unit === "imperial" ? "active" : ""}" id="vs-unit-imperial" type="button">in / lb</button>
        </div>
      </div>
      <div class="studio-grid">
        <div class="panel form-grid" id="vs-controls"></div>
        <div class="panel" id="vs-stage"></div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.mode = btn.dataset.tab as typeof state.mode;
        emitState();
        render();
      };
    });
    container.querySelector<HTMLButtonElement>("#vs-unit-metric")!.onclick = () => {
      state.unit = "metric";
      emitState();
      render();
    };
    container.querySelector<HTMLButtonElement>("#vs-unit-imperial")!.onclick = () => {
      state.unit = "imperial";
      emitState();
      render();
    };

    const controls = container.querySelector<HTMLElement>("#vs-controls")!;
    const stage = container.querySelector<HTMLElement>("#vs-stage")!;

    if (state.mode === "screens") {
      renderScreens(controls, stage);
    } else if (state.mode === "airlines") {
      renderAirlines(controls, stage);
    } else {
      renderMattresses(controls, stage);
    }
  }

  function renderScreens(controls: HTMLElement, stage: HTMLElement): void {
    const aSpec = DISPLAY_PRESETS.find((d) => d.id === state.displayA) || DISPLAY_PRESETS[0];
    const bSpec = DISPLAY_PRESETS.find((d) => d.id === state.displayB) || DISPLAY_PRESETS[1];
    const cmp = compareDisplays(aSpec, bSpec);

    const buildOpts = (selectedId: string) =>
      DISPLAY_PRESETS.map(
        (d) => `<option value="${escapeAttr(d.id)}" ${d.id === selectedId ? "selected" : ""}>${escapeAttr(d.label)} (${d.aspectW}:${d.aspectH})</option>`
      ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Display Geometry</h2>
        <span class="section-kicker">01 // Specimens</span>
      </div>
      <div class="field">
        <label for="vs-scr-a"><span>Specimen A (Cobalt)</span><span>${aSpec.aspectW}:${aSpec.aspectH}</span></label>
        <select id="vs-scr-a">${buildOpts(aSpec.id)}</select>
      </div>
      <div style="display:flex;justify-content:center">
        <button class="action-btn btn-sm" id="vs-scr-swap" type="button" title="Swap Display A and B">&#8645; Swap Specimens</button>
      </div>
      <div class="field">
        <label for="vs-scr-b"><span>Specimen B (Vermilion)</span><span>${bSpec.aspectW}:${bSpec.aspectH}</span></label>
        <select id="vs-scr-b">${buildOpts(bSpec.id)}</select>
      </div>
      <div class="control-group" style="padding-top:6px">
        <label style="display:flex;gap:8px;align-items:center;font-size:.84rem;cursor:pointer">
          <input type="checkbox" id="vs-overlay" ${state.overlayMode ? "checked" : ""} /> Corner-aligned overlay comparison
        </label>
        <label style="display:flex;gap:8px;align-items:center;font-size:.84rem;cursor:pointer">
          <input type="checkbox" id="vs-human" ${state.showHumanRef ? "checked" : ""} /> 160 cm Media Console reference bench
        </label>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Area Delta (B vs A)</div><div class="value">${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}%</div></div>
        <div class="kpi"><div class="label">Width Diff</div><div class="value">${cmp.widthDiffCm >= 0 ? "+" : ""}${fmtLen(cmp.widthDiffCm, state.unit)}</div></div>
        <div class="kpi"><div class="label">B 30° SMPTE</div><div class="value">${(cmp.b.smpteDistanceCm / 100).toFixed(2)} m</div></div>
        <div class="kpi"><div class="label">B 40° THX</div><div class="value">${(cmp.b.thxDistanceCm / 100).toFixed(2)} m</div></div>
      </div>
    `;

    controls.querySelector<HTMLSelectElement>("#vs-scr-a")!.onchange = (e) => {
      state.displayA = (e.target as HTMLSelectElement).value;
      emitState();
      renderScreens(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#vs-scr-b")!.onchange = (e) => {
      state.displayB = (e.target as HTMLSelectElement).value;
      emitState();
      renderScreens(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#vs-scr-swap")!.onclick = () => {
      const prevA = state.displayA;
      state.displayA = state.displayB;
      state.displayB = prevA;
      emitState();
      renderScreens(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#vs-overlay")!.onchange = (e) => {
      state.overlayMode = (e.target as HTMLInputElement).checked;
      renderScreens(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#vs-human")!.onchange = (e) => {
      state.showHumanRef = (e.target as HTMLInputElement).checked;
      renderScreens(controls, stage);
    };

    const totalW = state.overlayMode
      ? Math.max(cmp.a.widthCm, cmp.b.widthCm, state.showHumanRef ? 160 : 10)
      : cmp.a.widthCm + cmp.b.widthCm + 18;
    const maxH = Math.max(cmp.a.heightCm, cmp.b.heightCm);
    const scale = Math.min(390 / totalW, 195 / maxH);
    const wA = cmp.a.widthCm * scale;
    const hA = cmp.a.heightCm * scale;
    const wB = cmp.b.widthCm * scale;
    const hB = cmp.b.heightCm * scale;

    const padLeft = 82;
    const padRight = 96;
    const padTop = 26;
    const baseLineY = padTop + Math.max(hA, hB);
    const svgW = padLeft + (state.overlayMode ? Math.max(wA, wB, state.showHumanRef ? 160 * scale : 0) : wA + wB + 18 * scale) + padRight;
    const svgH = baseLineY + (state.showHumanRef ? 82 : 44);

    let shapesHtml = "";
    let dimHtml = "";

    if (state.overlayMode) {
      const originX = padLeft;
      const aY = baseLineY - hA;
      const bY = baseLineY - hB;
      shapesHtml = `
        <rect x="${originX.toFixed(1)}" y="${bY.toFixed(1)}" width="${wB.toFixed(1)}" height="${hB.toFixed(1)}" fill="var(--accent-b-soft)" stroke="var(--accent-b)" stroke-width="2" />
        <line x1="${originX.toFixed(1)}" y1="${baseLineY.toFixed(1)}" x2="${(originX + wB).toFixed(1)}" y2="${bY.toFixed(1)}" stroke="var(--accent-b)" stroke-width="1" stroke-dasharray="4 3" opacity="0.5" />
        <rect x="${originX.toFixed(1)}" y="${aY.toFixed(1)}" width="${wA.toFixed(1)}" height="${hA.toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
        <text x="${(originX + 8).toFixed(1)}" y="${(bY + 15).toFixed(1)}" fill="var(--accent-b)" font-size="11" font-weight="700" font-family="ui-monospace,Consolas,monospace">${escapeAttr(cmp.b.label)}</text>
        <text x="${(originX + 8).toFixed(1)}" y="${(baseLineY - 8).toFixed(1)}" fill="var(--accent)" font-size="11" font-weight="700" font-family="ui-monospace,Consolas,monospace">${escapeAttr(cmp.a.label)}</text>
      `;
      const maxX = originX + Math.max(wA, wB);
      dimHtml = `
        ${cadDimV(originX - 14, aY, baseLineY, fmtLen(cmp.a.heightCm, state.unit), "var(--accent)", "left")}
        ${cadDimV(maxX + 14, bY, baseLineY, fmtLen(cmp.b.heightCm, state.unit), "var(--accent-b)", "right")}
        ${cadDimH(originX, originX + Math.max(wA, wB), baseLineY + (state.showHumanRef ? 52 : 16), `${wB >= wA ? "B" : "A"} Width ${fmtLen(Math.max(cmp.a.widthCm, cmp.b.widthCm), state.unit)}`, "var(--text)")}
      `;
    } else {
      const ax = padLeft;
      const bx = padLeft + wA + 18 * scale;
      const aY = baseLineY - hA;
      const bY = baseLineY - hB;
      shapesHtml = `
        <rect x="${ax.toFixed(1)}" y="${aY.toFixed(1)}" width="${wA.toFixed(1)}" height="${hA.toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
        <rect x="${bx.toFixed(1)}" y="${bY.toFixed(1)}" width="${wB.toFixed(1)}" height="${hB.toFixed(1)}" fill="var(--accent-b-soft)" stroke="var(--accent-b)" stroke-width="2" />
        <text x="${(ax + wA / 2).toFixed(1)}" y="${(aY + hA / 2 + 4).toFixed(1)}" text-anchor="middle" fill="var(--accent)" font-size="11.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">${escapeAttr(cmp.a.label)}</text>
        <text x="${(bx + wB / 2).toFixed(1)}" y="${(bY + hB / 2 + 4).toFixed(1)}" text-anchor="middle" fill="var(--accent-b)" font-size="11.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">${escapeAttr(cmp.b.label)}</text>
      `;
      dimHtml = `
        ${cadDimV(ax - 14, aY, baseLineY, fmtLen(cmp.a.heightCm, state.unit), "var(--accent)", "left")}
        ${cadDimV(bx + wB + 14, bY, baseLineY, fmtLen(cmp.b.heightCm, state.unit), "var(--accent-b)", "right")}
        ${cadDimH(ax, ax + wA, baseLineY + 14, fmtLen(cmp.a.widthCm, state.unit), "var(--accent)")}
        ${cadDimH(bx, bx + wB, baseLineY + 14, fmtLen(cmp.b.widthCm, state.unit), "var(--accent-b)")}
      `;
    }

    const consoleW = 160 * scale;
    const consoleX = state.overlayMode ? padLeft : (padLeft + svgW - padRight - consoleW) / 2;
    const consoleRef = state.showHumanRef
      ? `<g>
          <rect x="${consoleX.toFixed(1)}" y="${(baseLineY + 8).toFixed(1)}" width="${consoleW.toFixed(1)}" height="24" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.3" />
          <line x1="${(consoleX + 10).toFixed(1)}" y1="${(baseLineY + 32).toFixed(1)}" x2="${(consoleX + 10).toFixed(1)}" y2="${(baseLineY + 38).toFixed(1)}" stroke="var(--border-strong)" stroke-width="2" />
          <line x1="${(consoleX + consoleW - 10).toFixed(1)}" y1="${(baseLineY + 32).toFixed(1)}" x2="${(consoleX + consoleW - 10).toFixed(1)}" y2="${(baseLineY + 38).toFixed(1)}" stroke="var(--border-strong)" stroke-width="2" />
          <text x="${(consoleX + consoleW / 2).toFixed(1)}" y="${(baseLineY + 24).toFixed(1)}" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="ui-monospace,Consolas,monospace">160 cm Console</text>
        </g>`
      : "";

    stage.innerHTML = `
      <div class="stage-toolbar">
        <div class="legend-strip">
          <span class="legend-item"><span class="swatch swatch-a"></span><strong>${escapeAttr(cmp.a.label)}</strong> · ${fmtLen(cmp.a.widthCm, state.unit)} × ${fmtLen(cmp.a.heightCm, state.unit)}</span>
          <span class="legend-item"><span class="swatch swatch-b"></span><strong>${escapeAttr(cmp.b.label)}</strong> · ${fmtLen(cmp.b.widthCm, state.unit)} × ${fmtLen(cmp.b.heightCm, state.unit)}</span>
        </div>
        <span class="spec-tag">${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}% AREA</span>
      </div>
      <div class="viewport-box">
        <svg viewBox="0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}" width="100%" style="max-height:360px" role="img" aria-label="Proportional TV comparison">
          ${shapesHtml}
          ${dimHtml}
          ${consoleRef}
        </svg>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Metric</th><th>${escapeAttr(cmp.a.label)}</th><th>${escapeAttr(cmp.b.label)}</th><th>Delta</th></tr></thead>
          <tbody>
            <tr><td>Visible Width</td><td>${cmp.a.widthCm} cm (${cmp.a.widthIn} in)</td><td>${cmp.b.widthCm} cm (${cmp.b.widthIn} in)</td><td>${cmp.widthDiffCm >= 0 ? "+" : ""}${cmp.widthDiffCm} cm</td></tr>
            <tr><td>Visible Height</td><td>${cmp.a.heightCm} cm (${cmp.a.heightIn} in)</td><td>${cmp.b.heightCm} cm (${cmp.b.heightIn} in)</td><td>${cmp.heightDiffCm >= 0 ? "+" : ""}${cmp.heightDiffCm} cm</td></tr>
            <tr><td>Screen Area</td><td>${cmp.a.areaSqCm} cm² (${cmp.a.areaSqIn} in²)</td><td>${cmp.b.areaSqCm} cm² (${cmp.b.areaSqIn} in²)</td><td>${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}%</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAirlines(controls: HTMLElement, stage: HTMLElement): void {
    const selected = AIRLINE_FLEET.find((a) => a.slug === state.airline) || AIRLINE_FLEET[0];
    const filteredFleet: AirlineBaggageSpec[] = state.regionFilter === "ALL"
      ? AIRLINE_FLEET
      : AIRLINE_FLEET.filter((a) => a.region === state.regionFilter);
    const bagCm: [number, number, number] = [state.bagL, state.bagW, state.bagD];
    const singleFit = evaluateBagAgainstAirline(bagCm, state.bagKg, selected);
    const fleetResults = evaluateBagFleet(bagCm, state.bagKg, filteredFleet);
    const cabinPassCount = fleetResults.filter((r) => r.fitsCarryOn && r.fitsWeight).length;
    const personalPassCount = fleetResults.filter((r) => r.fitsPersonalItem && r.fitsWeight).length;

    const airOpts = AIRLINE_FLEET.map(
      (a) => `<option value="${escapeAttr(a.slug)}" ${a.slug === selected.slug ? "selected" : ""}>${escapeAttr(a.name)} (${a.iata}) — ${a.carryOnCm.join("x")} cm</option>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Baggage Dimensions</h2>
        <span class="section-kicker">01 // Cage Check</span>
      </div>
      <div class="field">
        <label for="vs-air-focus">Spotlight Airline</label>
        <select id="vs-air-focus">${airOpts}</select>
      </div>
      <div class="form-row-3">
        <div class="field"><label for="vs-bag-l">Height (cm)</label><input id="vs-bag-l" type="number" min="15" max="90" step="0.5" value="${state.bagL}"></div>
        <div class="field"><label for="vs-bag-w">Width (cm)</label><input id="vs-bag-w" type="number" min="10" max="70" step="0.5" value="${state.bagW}"></div>
        <div class="field"><label for="vs-bag-d">Depth (cm)</label><input id="vs-bag-d" type="number" min="5" max="45" step="0.5" value="${state.bagD}"></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label for="vs-bag-kg">Weight (kg)</label><input id="vs-bag-kg" type="number" min="1" max="32" step="0.5" value="${state.bagKg}"></div>
        <div class="field"><label for="vs-region">Fleet Filter</label>
          <select id="vs-region">
            <option value="ALL" ${state.regionFilter === "ALL" ? "selected" : ""}>All Regions (${AIRLINE_FLEET.length})</option>
            <option value="EU" ${state.regionFilter === "EU" ? "selected" : ""}>Europe (EU)</option>
            <option value="NA" ${state.regionFilter === "NA" ? "selected" : ""}>North America</option>
            <option value="APAC" ${state.regionFilter === "APAC" ? "selected" : ""}>Asia-Pacific</option>
            <option value="ME" ${state.regionFilter === "ME" ? "selected" : ""}>Middle East</option>
          </select>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Cabin Overhead Pass</div><div class="value">${cabinPassCount} / ${fleetResults.length}</div></div>
        <div class="kpi"><div class="label">Under-Seat Pass</div><div class="value">${personalPassCount} / ${fleetResults.length}</div></div>
      </div>
    `;

    controls.querySelector<HTMLSelectElement>("#vs-air-focus")!.onchange = (e) => {
      state.airline = (e.target as HTMLSelectElement).value;
      emitState();
      renderAirlines(controls, stage);
    };
    const bindNum = (id: string, key: "bagL" | "bagW" | "bagD" | "bagKg") => {
      controls.querySelector<HTMLInputElement>(id)!.oninput = (e) => {
        const val = Number((e.target as HTMLInputElement).value);
        if (val > 0) {
          state[key] = val;
          emitState();
          renderAirlines(controls, stage);
        }
      };
    };
    bindNum("#vs-bag-l", "bagL");
    bindNum("#vs-bag-w", "bagW");
    bindNum("#vs-bag-d", "bagD");
    bindNum("#vs-bag-kg", "bagKg");
    controls.querySelector<HTMLSelectElement>("#vs-region")!.onchange = (e) => {
      state.regionFilter = (e.target as HTMLSelectElement).value;
      renderAirlines(controls, stage);
    };

    const verdictBadge = singleFit.verdict === "PERSONAL_AND_CABIN"
      ? `<span class="status-pill status-ok">Fits Under-Seat + Overhead</span>`
      : singleFit.verdict === "OVERHEAD_ONLY"
        ? `<span class="status-pill status-warn">Fits Overhead Cage Only</span>`
        : `<span class="status-pill status-bad">Exceeds Sizer Cage</span>`;

    const sortedBag = [...bagCm].sort((x, y) => y - x);
    const bagH = sortedBag[0];
    const bagW = sortedBag[1];
    const bagD = sortedBag[2];

    const maxH = Math.max(selected.carryOnCm[0], bagH, 60);
    const s = 175 / maxH;
    const baseY = 205;
    const frontX = 74;
    const sideX = 290;

    const cabH = selected.carryOnCm[0] * s;
    const cabW = selected.carryOnCm[1] * s;
    const cabD = selected.carryOnCm[2] * s;
    const perH = selected.personalItemCm[0] * s;
    const perW = selected.personalItemCm[1] * s;
    const perD = selected.personalItemCm[2] * s;
    const bH = bagH * s;
    const bW = bagW * s;
    const bD = bagD * s;

    const bagColor = singleFit.fitsCarryOn ? "var(--ok)" : "var(--bad)";
    const bagFill = singleFit.fitsCarryOn ? "var(--ok-bg)" : "var(--bad-bg)";

    stage.innerHTML = `
      <div class="stage-toolbar">
        <div>
          <strong style="font-size:1rem">${escapeAttr(selected.name)} (${selected.iata})</strong>
          <div style="font-size:.82rem;color:var(--muted)">Cabin Max: ${selected.carryOnCm.join(" × ")} cm (${selected.carryOnWeightKg} kg) · Under-seat: ${selected.personalItemCm.join(" × ")} cm</div>
        </div>
        ${verdictBadge}
      </div>
      <div class="legend-strip" style="margin-bottom:10px">
        <span class="legend-item"><span class="swatch swatch-neutral"></span>Overhead Cage Limit</span>
        <span class="legend-item"><span class="swatch swatch-b"></span>Under-Seat Limit</span>
        <span class="legend-item"><span class="swatch" style="background:${bagColor}"></span>Your Bag (${sortedBag.join("×")} cm · ${state.bagKg} kg)</span>
        <span class="spec-tag" style="margin-left:auto">Margins: ${singleFit.marginCarryOnCm.map((m) => (m >= 0 ? `+${m}` : `${m}`)).join(" / ")} cm</span>
      </div>
      <div class="viewport-box" style="min-height:245px">
        <svg viewBox="0 0 460 236" width="100%" style="max-height:245px" role="img" aria-label="Dual front and side airline sizer cage comparison">
          <!-- Front Elevation: Height x Width -->
          <text x="${(frontX + cabW / 2).toFixed(1)}" y="18" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="ui-monospace,Consolas,monospace">FRONT ELEVATION (H × W)</text>
          <rect x="${frontX}" y="${(baseY - cabH).toFixed(1)}" width="${cabW.toFixed(1)}" height="${cabH.toFixed(1)}" fill="none" stroke="var(--muted)" stroke-dasharray="5 3" stroke-width="1.5" />
          <rect x="${frontX}" y="${(baseY - perH).toFixed(1)}" width="${perW.toFixed(1)}" height="${perH.toFixed(1)}" fill="none" stroke="var(--accent-b)" stroke-dasharray="2.5 2.5" stroke-width="1.4" />
          <rect x="${frontX}" y="${(baseY - bH).toFixed(1)}" width="${bW.toFixed(1)}" height="${bH.toFixed(1)}" rx="3" fill="${bagFill}" stroke="${bagColor}" stroke-width="2" />
          <rect x="${(frontX + bW * 0.3).toFixed(1)}" y="${(baseY - bH - 6).toFixed(1)}" width="${(bW * 0.4).toFixed(1)}" height="6" rx="1.5" fill="none" stroke="${bagColor}" stroke-width="1.4" />
          ${cadDimH(frontX, frontX + Math.max(cabW, bW), baseY + 12, `${fmtLen(bagW, state.unit)} / ${fmtLen(selected.carryOnCm[1], state.unit)}`, "var(--muted)")}
          ${cadDimV(frontX - 12, baseY - cabH, baseY, fmtLen(selected.carryOnCm[0], state.unit), "var(--muted)", "left")}

          <!-- Side Elevation: Height x Depth -->
          <text x="${(sideX + cabD / 2).toFixed(1)}" y="18" text-anchor="middle" fill="var(--muted)" font-size="9.5" font-family="ui-monospace,Consolas,monospace">SIDE PROFILE (H × D)</text>
          <rect x="${sideX}" y="${(baseY - cabH).toFixed(1)}" width="${cabD.toFixed(1)}" height="${cabH.toFixed(1)}" fill="none" stroke="var(--muted)" stroke-dasharray="5 3" stroke-width="1.5" />
          <rect x="${sideX}" y="${(baseY - perH).toFixed(1)}" width="${perD.toFixed(1)}" height="${perH.toFixed(1)}" fill="none" stroke="var(--accent-b)" stroke-dasharray="2.5 2.5" stroke-width="1.4" />
          <rect x="${sideX}" y="${(baseY - bH).toFixed(1)}" width="${bD.toFixed(1)}" height="${bH.toFixed(1)}" rx="3" fill="${bagFill}" stroke="${bagColor}" stroke-width="2" />
          ${cadDimH(sideX, sideX + Math.max(cabD, bD), baseY + 12, `${fmtLen(bagD, state.unit)} / ${fmtLen(selected.carryOnCm[2], state.unit)}`, "var(--muted)")}
          ${cadDimV(sideX + Math.max(cabD, bD) + 12, baseY - bH, baseY, fmtLen(bagH, state.unit), bagColor, "right")}
        </svg>
      </div>
      <div style="font-size:.81rem;color:var(--muted);margin-top:10px">${escapeAttr(selected.policyNote)}</div>
      <div class="data-table-wrap" style="max-height:300px;overflow-y:auto">
        <table class="data-table">
          <thead><tr><th>Airline</th><th>Cabin Limit</th><th>Under-Seat</th><th>Max kg</th><th>Verdict</th></tr></thead>
          <tbody>
            ${fleetResults
              .map((r) => {
                const badge = r.verdict === "PERSONAL_AND_CABIN"
                  ? `<span class="status-pill status-ok">UNDER-SEAT OK</span>`
                  : r.verdict === "OVERHEAD_ONLY"
                    ? `<span class="status-pill status-warn">${r.airline.overheadFree ? "OVERHEAD OK" : "PAID OVERHEAD"}</span>`
                    : `<span class="status-pill status-bad">TOO BIG</span>`;
                return `<tr><td><strong>${escapeAttr(r.airline.name)}</strong> (${r.airline.iata})</td><td>${r.airline.carryOnCm.join("×")} cm</td><td>${r.airline.personalItemCm.join("×")} cm</td><td>${r.airline.carryOnWeightKg} kg</td><td>${badge}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderMattresses(controls: HTMLElement, stage: HTMLElement): void {
    const mA = MATTRESS_PRESETS.find((m) => m.id === state.mattressA) || MATTRESS_PRESETS[0];
    const mB = MATTRESS_PRESETS.find((m) => m.id === state.mattressB) || MATTRESS_PRESETS[3];
    const cmp = compareMattresses(mA, mB);
    const clearanceSideCm = Math.max(0, (state.roomW - mB.widthCm) / 2);
    const clearanceFootCm = Math.max(0, state.roomL - mB.lengthCm);

    const opts = (selId: string) =>
      MATTRESS_PRESETS.map(
        (m) => `<option value="${escapeAttr(m.id)}" ${m.id === selId ? "selected" : ""}>${escapeAttr(m.label)} (${m.widthCm}×${m.lengthCm} cm)</option>`
      ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Mattress &amp; Room Fit</h2>
        <span class="section-kicker">01 // Architectural Plan</span>
      </div>
      <div class="field"><label for="vs-mat-a">Mattress A (Cobalt)</label><select id="vs-mat-a">${opts(mA.id)}</select></div>
      <div class="field"><label for="vs-mat-b">Mattress B (Vermilion)</label><select id="vs-mat-b">${opts(mB.id)}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="vs-rm-w">Room Width (cm)</label><input id="vs-rm-w" type="number" min="180" max="800" value="${state.roomW}"></div>
        <div class="field"><label for="vs-rm-l">Room Length (cm)</label><input id="vs-rm-l" type="number" min="200" max="800" value="${state.roomL}"></div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Sleep Area Delta</div><div class="value">${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}%</div></div>
        <div class="kpi"><div class="label">Side Aisle (Each)</div><div class="value">${fmtLen(clearanceSideCm, state.unit)}</div></div>
        <div class="kpi"><div class="label">Foot Clearance</div><div class="value">${fmtLen(clearanceFootCm, state.unit)}</div></div>
      </div>
    `;

    controls.querySelector<HTMLSelectElement>("#vs-mat-a")!.onchange = (e) => {
      state.mattressA = (e.target as HTMLSelectElement).value;
      emitState();
      renderMattresses(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#vs-mat-b")!.onchange = (e) => {
      state.mattressB = (e.target as HTMLSelectElement).value;
      emitState();
      renderMattresses(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#vs-rm-w")!.oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (v >= 150) { state.roomW = v; renderMattresses(controls, stage); }
    };
    controls.querySelector<HTMLInputElement>("#vs-rm-l")!.oninput = (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (v >= 180) { state.roomL = v; renderMattresses(controls, stage); }
    };

    const s = Math.min(280 / Math.max(state.roomW, mB.widthCm, mA.widthCm), 195 / Math.max(state.roomL, mB.lengthCm, mA.lengthCm));
    const rw = state.roomW * s;
    const rl = state.roomL * s;
    const rx = (460 - rw) / 2;
    const ry = 26;
    const wB = mB.widthCm * s;
    const lB = mB.lengthCm * s;
    const wA = mA.widthCm * s;
    const lA = mA.lengthCm * s;
    const bX = 230 - wB / 2;
    const aX = 230 - wA / 2;
    const bedY = ry + 6;

    stage.innerHTML = `
      <div class="stage-toolbar">
        <div class="legend-strip">
          <span class="legend-item"><span class="swatch swatch-a"></span><strong>${escapeAttr(mA.label)}</strong> · ${mA.widthCm}×${mA.lengthCm} cm</span>
          <span class="legend-item"><span class="swatch swatch-b"></span><strong>${escapeAttr(mB.label)}</strong> · ${mB.widthCm}×${mB.lengthCm} cm</span>
        </div>
        <span class="spec-tag">Room ${state.roomW} × ${state.roomL} cm</span>
      </div>
      <div class="viewport-box">
        <svg viewBox="0 0 460 272" width="100%" style="max-height:300px" role="img" aria-label="Bedroom top-down scale plan">
          <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rl.toFixed(1)}" fill="var(--surface)" stroke="var(--text)" stroke-width="2.4" />
          <!-- Headboard against top wall -->
          <rect x="${Math.min(aX, bX).toFixed(1)}" y="${ry.toFixed(1)}" width="${Math.max(wA, wB).toFixed(1)}" height="6" fill="var(--text)" />
          <!-- Mattress B & A anchored to headboard -->
          <rect x="${bX.toFixed(1)}" y="${bedY.toFixed(1)}" width="${wB.toFixed(1)}" height="${lB.toFixed(1)}" fill="var(--accent-b-soft)" stroke="var(--accent-b)" stroke-width="2" />
          <rect x="${aX.toFixed(1)}" y="${bedY.toFixed(1)}" width="${wA.toFixed(1)}" height="${lA.toFixed(1)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
          <!-- Architectural pillows -->
          <rect x="${(bX + wB * 0.1).toFixed(1)}" y="${(bedY + 5).toFixed(1)}" width="${(wB * 0.35).toFixed(1)}" height="${(12 * s + 6).toFixed(1)}" rx="2" fill="none" stroke="var(--muted)" stroke-width="1" />
          <rect x="${(bX + wB * 0.55).toFixed(1)}" y="${(bedY + 5).toFixed(1)}" width="${(wB * 0.35).toFixed(1)}" height="${(12 * s + 6).toFixed(1)}" rx="2" fill="none" stroke="var(--muted)" stroke-width="1" />
          <!-- Side & foot walkway callouts -->
          <line x1="${rx.toFixed(1)}" y1="${(bedY + lB * 0.5).toFixed(1)}" x2="${bX.toFixed(1)}" y2="${(bedY + lB * 0.5).toFixed(1)}" stroke="var(--muted)" stroke-width="1" />
          <text x="${(rx - 6).toFixed(1)}" y="${(bedY + lB * 0.5 + 3).toFixed(1)}" text-anchor="end" fill="var(--muted)" font-size="9.5" font-family="ui-monospace,Consolas,monospace">Aisle ${fmtLen(clearanceSideCm, state.unit)}</text>
          ${cadDimV(230, bedY + lB, ry + rl, `Foot ${fmtLen(clearanceFootCm, state.unit)}`, "var(--muted)", "right")}
          ${cadDimH(rx, rx + rw, ry + rl + 14, `Room Width ${fmtLen(state.roomW, state.unit)}`, "var(--text)")}
        </svg>
      </div>
    `;
  }

  render();
}
