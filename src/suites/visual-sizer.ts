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
      <div class="studio-tabs" role="tablist">
        <button class="tab-btn ${state.mode === "screens" ? "active" : ""}" data-tab="screens">Screens &amp; TVs</button>
        <button class="tab-btn ${state.mode === "airlines" ? "active" : ""}" data-tab="airlines">Airline Carry-On Sizer</button>
        <button class="tab-btn ${state.mode === "mattresses" ? "active" : ""}" data-tab="mattresses">Mattress &amp; Room Fit</button>
        <button class="tab-btn" id="vs-unit-toggle" style="margin-left:auto">${unit === "metric" ? "Units: cm / kg" : "Units: in / lb"}</button>
      </div>
      <div class="studio-grid">
        <div class="card form-grid" id="vs-controls"></div>
        <div class="card" id="vs-stage"></div>
      </div>
    `;

    container.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.mode = btn.dataset.tab as typeof state.mode;
        emitState();
        render();
      };
    });
    container.querySelector<HTMLButtonElement>("#vs-unit-toggle")!.onclick = () => {
      state.unit = state.unit === "metric" ? "imperial" : "metric";
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

    const optionsA = DISPLAY_PRESETS.map(
      (d) => `<option value="${escapeAttr(d.id)}" ${d.id === aSpec.id ? "selected" : ""}>${escapeAttr(d.label)} (${d.aspectW}:${d.aspectH})</option>`
    ).join("");
    const optionsB = DISPLAY_PRESETS.map(
      (d) => `<option value="${escapeAttr(d.id)}" ${d.id === bSpec.id ? "selected" : ""}>${escapeAttr(d.label)} (${d.aspectW}:${d.aspectH})</option>`
    ).join("");

    controls.innerHTML = `
      <h3>Compare Displays</h3>
      <div class="field">
        <label for="vs-scr-a">Display A (Cyan)</label>
        <select id="vs-scr-a">${optionsA}</select>
      </div>
      <div class="field">
        <label for="vs-scr-b">Display B (Violet)</label>
        <select id="vs-scr-b">${optionsB}</select>
      </div>
      <div class="form-row-2">
        <label style="display:flex;gap:8px;align-items:center;font-size:.88rem;cursor:pointer">
          <input type="checkbox" id="vs-overlay" ${state.overlayMode ? "checked" : ""} /> Stacked overlay
        </label>
        <label style="display:flex;gap:8px;align-items:center;font-size:.88rem;cursor:pointer">
          <input type="checkbox" id="vs-human" ${state.showHumanRef ? "checked" : ""} /> 160 cm Console Ref
        </label>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Area Delta (B vs A)</div><div class="value">${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}%</div></div>
        <div class="kpi"><div class="label">Width Diff</div><div class="value">${cmp.widthDiffCm >= 0 ? "+" : ""}${fmtLen(cmp.widthDiffCm, state.unit)}</div></div>
        <div class="kpi"><div class="label">B Ideal 30° Seat</div><div class="value">${(cmp.b.smpteDistanceCm / 100).toFixed(2)} m</div></div>
        <div class="kpi"><div class="label">B Cinema 40° Seat</div><div class="value">${(cmp.b.thxDistanceCm / 100).toFixed(2)} m</div></div>
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
    controls.querySelector<HTMLInputElement>("#vs-overlay")!.onchange = (e) => {
      state.overlayMode = (e.target as HTMLInputElement).checked;
      renderScreens(controls, stage);
    };
    controls.querySelector<HTMLInputElement>("#vs-human")!.onchange = (e) => {
      state.showHumanRef = (e.target as HTMLInputElement).checked;
      renderScreens(controls, stage);
    };

    const maxW = Math.max(cmp.a.widthCm, cmp.b.widthCm, state.showHumanRef ? 160 : 10);
    const maxH = Math.max(cmp.a.heightCm, cmp.b.heightCm);
    const scale = Math.min(480 / maxW, 250 / maxH);
    const wA = cmp.a.widthCm * scale;
    const hA = cmp.a.heightCm * scale;
    const wB = cmp.b.widthCm * scale;
    const hB = cmp.b.heightCm * scale;
    const svgW = state.overlayMode ? Math.max(wA, wB) + 80 : wA + wB + 110;
    const svgH = Math.max(hA, hB) + (state.showHumanRef ? 90 : 60);
    const baseLineY = svgH - (state.showHumanRef ? 48 : 26);

    const rectB = state.overlayMode
      ? `<rect x="${((svgW - wB) / 2).toFixed(1)}" y="${(baseLineY - hB).toFixed(1)}" width="${wB.toFixed(1)}" height="${hB.toFixed(1)}" rx="3" fill="rgba(168,85,247,0.18)" stroke="#a855f7" stroke-width="2.2" />`
      : `<rect x="${(40 + wA + 30).toFixed(1)}" y="${(baseLineY - hB).toFixed(1)}" width="${wB.toFixed(1)}" height="${hB.toFixed(1)}" rx="3" fill="rgba(168,85,247,0.18)" stroke="#a855f7" stroke-width="2.2" />`;
    const rectA = state.overlayMode
      ? `<rect x="${((svgW - wA) / 2).toFixed(1)}" y="${(baseLineY - hA).toFixed(1)}" width="${wA.toFixed(1)}" height="${hA.toFixed(1)}" rx="3" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="2.4" />`
      : `<rect x="40" y="${(baseLineY - hA).toFixed(1)}" width="${wA.toFixed(1)}" height="${hA.toFixed(1)}" rx="3" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="2.4" />`;

    const consoleRef = state.showHumanRef
      ? `<rect x="${((svgW - 160 * scale) / 2).toFixed(1)}" y="${baseLineY + 6}" width="${(160 * scale).toFixed(1)}" height="24" rx="3" fill="rgba(148,163,184,0.22)" stroke="#94a3b8" stroke-dasharray="4 3" />
         <text x="${(svgW / 2).toFixed(1)}" y="${baseLineY + 22}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="monospace">160 cm (63") Media Console Reference</text>`
      : "";

    stage.innerHTML = `
      <div class="viewport-box">
        <svg viewBox="0 0 ${svgW.toFixed(0)} ${svgH.toFixed(0)}" width="100%" style="max-height:360px" role="img" aria-label="Proportional TV comparison">
          ${rectB}
          ${rectA}
          ${consoleRef}
          <text x="${(svgW / 2).toFixed(1)}" y="20" text-anchor="middle" fill="currentColor" font-size="12" font-family="monospace">
            A: ${escapeAttr(cmp.a.label)} (${fmtLen(cmp.a.widthCm, state.unit)} x ${fmtLen(cmp.a.heightCm, state.unit)}) vs B: ${escapeAttr(cmp.b.label)} (${fmtLen(cmp.b.widthCm, state.unit)} x ${fmtLen(cmp.b.heightCm, state.unit)})
          </text>
        </svg>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Metric</th><th>${escapeAttr(cmp.a.label)}</th><th>${escapeAttr(cmp.b.label)}</th><th>Difference</th></tr></thead>
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
      <h3>Your Bag Dimensions</h3>
      <div class="field">
        <label for="vs-air-focus">Spotlight Airline</label>
        <select id="vs-air-focus">${airOpts}</select>
      </div>
      <div class="form-row-3">
        <div class="field"><label for="vs-bag-l">Length (cm)</label><input id="vs-bag-l" type="number" min="15" max="90" step="0.5" value="${state.bagL}"></div>
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
        <div class="kpi"><div class="label">Cabin Overhead Fit</div><div class="value">${cabinPassCount} / ${fleetResults.length}</div></div>
        <div class="kpi"><div class="label">Under-Seat Fit</div><div class="value">${personalPassCount} / ${fleetResults.length}</div></div>
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
      ? `<span class="status-pill status-ok">FITS PERSONAL + CABIN</span>`
      : singleFit.verdict === "OVERHEAD_ONLY"
        ? `<span class="status-pill status-warn">CABIN OVERHEAD ONLY</span>`
        : `<span class="status-pill status-bad">EXCEEDS SIZER CAGE</span>`;

    // Scaled visual front projection (Height x Width) comparing Your Bag vs Airline Cabin vs Under-Seat
    const maxDimH = Math.max(selected.carryOnCm[0], state.bagL, 62);
    const maxDimW = Math.max(selected.carryOnCm[1], state.bagW, 46);
    const s = Math.min(200 / maxDimH, 240 / maxDimW);

    stage.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
        <div>
          <strong style="font-size:1.1rem">${escapeAttr(selected.name)} (${selected.iata})</strong>
          <div style="font-size:.86rem;color:var(--muted)">Cabin Max: ${selected.carryOnCm.join(" × ")} cm (${selected.carryOnWeightKg} kg) · Under-seat: ${selected.personalItemCm.join(" × ")} cm</div>
          <div style="font-size:.82rem;color:var(--muted)">${escapeAttr(selected.policyNote)}</div>
        </div>
        ${verdictBadge}
      </div>
      <div class="viewport-box" style="min-height:230px">
        <svg viewBox="0 0 420 225" width="100%" style="max-height:225px" role="img" aria-label="Airline sizer cage comparison">
          <rect x="45" y="${(210 - selected.carryOnCm[0] * s).toFixed(1)}" width="${(selected.carryOnCm[1] * s).toFixed(1)}" height="${(selected.carryOnCm[0] * s).toFixed(1)}" fill="none" stroke="#94a3b8" stroke-dasharray="5 3" stroke-width="1.8" />
          <rect x="45" y="${(210 - selected.personalItemCm[0] * s).toFixed(1)}" width="${(selected.personalItemCm[1] * s).toFixed(1)}" height="${(selected.personalItemCm[0] * s).toFixed(1)}" fill="none" stroke="#a855f7" stroke-dasharray="3 3" stroke-width="1.8" />
          <rect x="45" y="${(210 - Math.max(state.bagL, state.bagW) * s).toFixed(1)}" width="${(Math.min(Math.max(state.bagW, state.bagD), Math.max(state.bagL, state.bagW)) * s).toFixed(1)}" height="${(Math.max(state.bagL, state.bagW) * s).toFixed(1)}" rx="4" fill="${singleFit.fitsCarryOn ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}" stroke="${singleFit.fitsCarryOn ? "#22c55e" : "#ef4444"}" stroke-width="2.4" />
          <text x="245" y="48" fill="currentColor" font-size="12" font-family="monospace">Dashed Grey: Overhead Sizer</text>
          <text x="245" y="74" fill="#a855f7" font-size="12" font-family="monospace">Dashed Violet: Under-Seat</text>
          <text x="245" y="100" fill="${singleFit.fitsCarryOn ? "#22c55e" : "#ef4444"}" font-size="12" font-family="monospace">Solid Box: Your Bag</text>
          <text x="245" y="136" fill="var(--muted)" font-size="11" font-family="monospace">Cabin Margin: ${singleFit.marginCarryOnCm.map((m) => (m >= 0 ? `+${m}` : `${m}`)).join(" / ")} cm</text>
        </svg>
      </div>
      <div class="data-table-wrap" style="max-height:310px;overflow-y:auto">
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
      <h3>Mattress &amp; Bedroom Fit</h3>
      <div class="field"><label for="vs-mat-a">Mattress A (Cyan)</label><select id="vs-mat-a">${opts(mA.id)}</select></div>
      <div class="field"><label for="vs-mat-b">Mattress B (Violet)</label><select id="vs-mat-b">${opts(mB.id)}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="vs-rm-w">Room Width (cm)</label><input id="vs-rm-w" type="number" min="180" max="800" value="${state.roomW}"></div>
        <div class="field"><label for="vs-rm-l">Room Length (cm)</label><input id="vs-rm-l" type="number" min="200" max="800" value="${state.roomL}"></div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Sleep Area Delta</div><div class="value">${cmp.areaDeltaPercent >= 0 ? "+" : ""}${cmp.areaDeltaPercent}%</div></div>
        <div class="kpi"><div class="label">Side Clearance (Each)</div><div class="value">${fmtLen(clearanceSideCm, state.unit)}</div></div>
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

    const s = Math.min(360 / Math.max(state.roomW, mB.widthCm, mA.widthCm), 240 / Math.max(state.roomL, mB.lengthCm, mA.lengthCm));
    const rw = state.roomW * s;
    const rl = state.roomL * s;

    stage.innerHTML = `
      <div class="viewport-box">
        <svg viewBox="0 0 420 270" width="100%" style="max-height:290px">
          <rect x="${((420 - rw) / 2).toFixed(1)}" y="${((270 - rl) / 2).toFixed(1)}" width="${rw.toFixed(1)}" height="${rl.toFixed(1)}" fill="none" stroke="#64748b" stroke-dasharray="5 3" stroke-width="1.5" />
          <rect x="${((420 - mB.widthCm * s) / 2).toFixed(1)}" y="${((270 - rl) / 2 + 8).toFixed(1)}" width="${(mB.widthCm * s).toFixed(1)}" height="${(mB.lengthCm * s).toFixed(1)}" rx="5" fill="rgba(168,85,247,0.18)" stroke="#a855f7" stroke-width="2" />
          <rect x="${((420 - mA.widthCm * s) / 2).toFixed(1)}" y="${((270 - rl) / 2 + 8).toFixed(1)}" width="${(mA.widthCm * s).toFixed(1)}" height="${(mA.lengthCm * s).toFixed(1)}" rx="5" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="2.2" />
          <text x="210" y="18" text-anchor="middle" fill="currentColor" font-size="11" font-family="monospace">${escapeAttr(mA.label)} (${mA.widthCm}×${mA.lengthCm}) vs ${escapeAttr(mB.label)} (${mB.widthCm}×${mB.lengthCm} cm)</text>
        </svg>
      </div>
    `;
  }

  render();
}
