import {
  CREDIT_CARD_WIDTH_MM,
  SHOE_BRANDS,
  convertRingFromDiameterMm,
  convertShoeBetweenBrands,
  mondopointToEu,
  mondopointToUk,
  mondopointToUs,
  pixelsPerMmFromCardWidth,
  usToMondopointMm,
  type GenderFit,
} from "../engines/footwear/index.js";

export interface SizeConverterPreset {
  mode?: "shoes" | "rings";
  fromBrand?: string;
  toBrand?: string;
  gender?: GenderFit;
  usSize?: number;
  ringDiameterMm?: number;
}

const US_SIZE_STEPS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];
const ID1_ASPECT = 85.6 / 53.98;

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mountSizeConverter(
  container: HTMLElement,
  preset: SizeConverterPreset,
  onStateChange?: (state: Record<string, string | number | boolean>) => void
): void {
  const state = {
    mode: preset.mode || "shoes",
    fromBrand: preset.fromBrand || SHOE_BRANDS[0]?.slug || "nike",
    toBrand: preset.toBrand || SHOE_BRANDS.find((b) => b.slug === "adidas")?.slug || SHOE_BRANDS[1]?.slug || "adidas",
    gender: (preset.gender || "mens") as GenderFit,
    usSize: preset.usSize ?? 10,
    cardWidthPx: 325,
    ringDiameterMm: preset.ringDiameterMm ?? 18.95,
  };

  function emit(): void {
    onStateChange?.({
      mode: state.mode,
      fromBrand: state.fromBrand,
      toBrand: state.toBrand,
      gender: state.gender,
      usSize: state.usSize,
      ringDiameterMm: state.ringDiameterMm,
    });
  }

  function render(): void {
    container.innerHTML = `
      <div class="studio-controls-bar">
        <div class="segmented-bar" role="tablist">
          <button class="seg-btn ${state.mode === "shoes" ? "active" : ""}" data-tab="shoes" type="button">Cross-Brand Shoe Matrix (Mondopoint)</button>
          <button class="seg-btn ${state.mode === "rings" ? "active" : ""}" data-tab="rings" type="button">Calibrated Card &amp; Ring Sizer</button>
        </div>
      </div>
      <div class="studio-grid">
        <div class="panel form-grid" id="sc-controls"></div>
        <div class="panel" id="sc-stage"></div>
      </div>
    `;
    container.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((btn) => {
      btn.onclick = () => {
        state.mode = btn.dataset.tab as typeof state.mode;
        emit();
        render();
      };
    });

    const controls = container.querySelector<HTMLElement>("#sc-controls")!;
    const stage = container.querySelector<HTMLElement>("#sc-stage")!;

    if (state.mode === "shoes") renderShoes(controls, stage);
    else renderRings(controls, stage);
  }

  function renderShoes(controls: HTMLElement, stage: HTMLElement): void {
    const fromProfile = SHOE_BRANDS.find((b) => b.slug === state.fromBrand) || SHOE_BRANDS[0];
    const toProfile = SHOE_BRANDS.find((b) => b.slug === state.toBrand) || SHOE_BRANDS[1] || SHOE_BRANDS[0];
    const direct = convertShoeBetweenBrands(fromProfile.slug, toProfile.slug, state.usSize, state.gender);

    const brandOpts = (selected: string) =>
      SHOE_BRANDS.map((b) => `<option value="${escapeAttr(b.slug)}" ${b.slug === selected ? "selected" : ""}>${escapeAttr(b.name)}</option>`).join("");
    const sizeOpts = US_SIZE_STEPS.map(
      (sz) => `<option value="${sz}" ${sz === state.usSize ? "selected" : ""}>US ${sz}</option>`
    ).join("");

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Shoe Last Translation</h2>
        <span class="section-kicker">01 // Mondopoint</span>
      </div>
      <div class="swap-row">
        <div class="field"><label for="sc-from">Source Brand</label><select id="sc-from">${brandOpts(fromProfile.slug)}</select></div>
        <button class="swap-btn" id="sc-swap" type="button" title="Swap source and target brands">&#8646;</button>
        <div class="field"><label for="sc-to">Target Brand</label><select id="sc-to">${brandOpts(toProfile.slug)}</select></div>
      </div>
      <div class="form-row-2">
        <div class="field"><label for="sc-gender">Size System</label>
          <select id="sc-gender">
            <option value="mens" ${state.gender === "mens" ? "selected" : ""}>Men's US</option>
            <option value="womens" ${state.gender === "womens" ? "selected" : ""}>Women's US</option>
            <option value="unisex" ${state.gender === "unisex" ? "selected" : ""}>Unisex</option>
          </select>
        </div>
        <div class="field"><label for="sc-us">Reference Size</label><select id="sc-us">${sizeOpts}</select></div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Foot Length</div><div class="value">${direct.mondopointMm} mm</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} US</div><div class="value">${direct.us}</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} EU</div><div class="value">${direct.eu}</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} UK</div><div class="value">${direct.uk}</div></div>
      </div>
      <p style="font-size:.82rem;color:var(--muted);margin:4px 0 0"><strong>Last Geometry:</strong> ${escapeAttr(direct.fitNote)}</p>
    `;

    controls.querySelector<HTMLSelectElement>("#sc-from")!.onchange = (e) => {
      state.fromBrand = (e.target as HTMLSelectElement).value;
      emit();
      renderShoes(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#sc-to")!.onchange = (e) => {
      state.toBrand = (e.target as HTMLSelectElement).value;
      emit();
      renderShoes(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#sc-swap")!.onclick = () => {
      const prev = state.fromBrand;
      state.fromBrand = state.toBrand;
      state.toBrand = prev;
      emit();
      renderShoes(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#sc-gender")!.onchange = (e) => {
      state.gender = (e.target as HTMLSelectElement).value as GenderFit;
      emit();
      renderShoes(controls, stage);
    };
    controls.querySelector<HTMLSelectElement>("#sc-us")!.onchange = (e) => {
      state.usSize = Number((e.target as HTMLSelectElement).value);
      emit();
      renderShoes(controls, stage);
    };

    const mondo = usToMondopointMm(state.usSize, state.gender, fromProfile.offsetMm);
    const allBrands = SHOE_BRANDS.map((target) => ({
      profile: target,
      us: mondopointToUs(mondo, state.gender, target.offsetMm),
      eu: mondopointToEu(mondo),
      uk: mondopointToUk(mondo, state.gender),
    }));

    // Calibrated ruler graphic mapping Mondopoint [220mm..320mm]
    const clampedMondo = Math.min(320, Math.max(220, mondo));
    const markerX = 32 + ((clampedMondo - 220) / 100) * 396;
    const ticks: string[] = [];
    for (let mm = 220; mm <= 320; mm += 10) {
      const tx = 32 + ((mm - 220) / 100) * 396;
      ticks.push(`<line x1="${tx.toFixed(1)}" y1="28" x2="${tx.toFixed(1)}" y2="38" stroke="var(--muted)" stroke-width="1" />`);
      if (mm % 20 === 0) {
        ticks.push(`<text x="${tx.toFixed(1)}" y="50" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="ui-monospace,Consolas,monospace">${mm}</text>`);
      }
    }

    stage.innerHTML = `
      <div class="stage-toolbar">
        <div>
          <strong style="font-size:1rem">${escapeAttr(fromProfile.name)} US ${state.usSize} &rarr; ${escapeAttr(toProfile.name)} US ${direct.us}</strong>
          <div style="font-size:.82rem;color:var(--muted)">Target Offset: ${toProfile.offsetMm >= 0 ? "+" : ""}${toProfile.offsetMm} mm relative to Brannock baseline</div>
        </div>
        <span class="spec-tag">MONDOPOINT ${mondo} MM (${(mondo / 10).toFixed(1)} CM)</span>
      </div>
      <div style="margin-bottom:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--stage-bg);padding:8px 12px">
        <svg viewBox="0 0 460 58" width="100%" style="max-height:66px" role="img" aria-label="Mondopoint foot length gauge">
          <line x1="32" y1="32" x2="428" y2="32" stroke="var(--border-strong)" stroke-width="1.5" />
          ${ticks.join("")}
          <rect x="32" y="21" width="${(markerX - 32).toFixed(1)}" height="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.2" />
          <line x1="${markerX.toFixed(1)}" y1="12" x2="${markerX.toFixed(1)}" y2="38" stroke="var(--accent-b)" stroke-width="2" />
          <text x="${markerX.toFixed(1)}" y="10" text-anchor="middle" fill="var(--accent-b)" font-size="9.5" font-weight="700" font-family="ui-monospace,Consolas,monospace">${mondo} mm</text>
        </svg>
      </div>
      <div class="data-table-wrap" style="max-height:400px;overflow-y:auto;margin-top:0">
        <table class="data-table">
          <thead><tr><th>Brand</th><th>US</th><th>EU</th><th>UK</th><th>Fit Note</th></tr></thead>
          <tbody>
            ${allBrands
              .map(
                (row) => {
                  const isTarget = row.profile.slug === toProfile.slug;
                  const isSource = row.profile.slug === fromProfile.slug;
                  const rowStyle = isTarget
                    ? "background:var(--accent-soft);box-shadow:inset 3px 0 0 var(--accent);"
                    : isSource
                      ? "box-shadow:inset 3px 0 0 var(--accent-b);"
                      : "";
                  return `<tr style="${rowStyle}">
                  <td><strong>${escapeAttr(row.profile.name)}</strong>${isTarget ? ' <span class="spec-tag">Target</span>' : ""}${isSource ? ' <span class="spec-tag">Source</span>' : ""}</td>
                  <td>${row.us}</td>
                  <td>${row.eu}</td>
                  <td>${row.uk}</td>
                  <td style="font-size:.8rem;color:var(--muted)">${escapeAttr(row.profile.fitNote)}</td>
                </tr>`;
                }
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRings(controls: HTMLElement, stage: HTMLElement): void {
    const pxPerMm = pixelsPerMmFromCardWidth(state.cardWidthPx);
    const ringPx = Number((state.ringDiameterMm * pxPerMm).toFixed(1));
    const cardHeightPx = Math.round(state.cardWidthPx / ID1_ASPECT);
    const conv = convertRingFromDiameterMm(state.ringDiameterMm);

    controls.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">ISO 7810 &amp; ISO 8653 Sizer</h2>
        <span class="section-kicker">02 // Ring Caliper</span>
      </div>
      <div class="control-group">
        <div class="section-kicker">Step 1 · Bank Card Scale (${pxPerMm.toFixed(2)} px/mm)</div>
        <p style="font-size:.82rem;color:var(--muted);margin:0">
          Place an ISO/IEC 7810 ID-1 payment card (${CREDIT_CARD_WIDTH_MM} mm wide) over the frame until edges align.
        </p>
        <div class="field">
          <label for="sc-card-px"><span>Card Width</span><span>${state.cardWidthPx} px</span></label>
          <div class="step-input-row">
            <button class="action-btn btn-sm" id="sc-card-dec" type="button">-1</button>
            <input id="sc-card-px" type="range" min="180" max="540" step="1" value="${state.cardWidthPx}">
            <button class="action-btn btn-sm" id="sc-card-inc" type="button">+1</button>
          </div>
        </div>
      </div>
      <div class="control-group">
        <div class="section-kicker">Step 2 · Inner Ring Diameter</div>
        <div class="field">
          <label for="sc-ring-mm"><span>Diameter · Circ. ${conv.circumferenceMm} mm</span><span>${state.ringDiameterMm.toFixed(2)} mm</span></label>
          <div class="step-input-row">
            <button class="action-btn btn-sm" id="sc-ring-dec" type="button">-0.05</button>
            <input id="sc-ring-mm" type="range" min="13.5" max="24.0" step="0.05" value="${state.ringDiameterMm}">
            <button class="action-btn btn-sm" id="sc-ring-inc" type="button">+0.05</button>
          </div>
        </div>
      </div>
      <div class="kpi-grid" style="margin-top:0">
        <div class="kpi"><div class="label">US / CA Size</div><div class="value">${conv.us}</div></div>
        <div class="kpi"><div class="label">UK / AU</div><div class="value">${conv.uk}</div></div>
        <div class="kpi"><div class="label">EU / ISO</div><div class="value">${conv.eu}</div></div>
        <div class="kpi"><div class="label">Japan</div><div class="value">${conv.jp}</div></div>
      </div>
    `;

    controls.querySelector<HTMLInputElement>("#sc-card-px")!.oninput = (e) => {
      state.cardWidthPx = Number((e.target as HTMLInputElement).value);
      renderRings(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#sc-card-dec")!.onclick = () => {
      state.cardWidthPx = Math.max(180, state.cardWidthPx - 1);
      renderRings(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#sc-card-inc")!.onclick = () => {
      state.cardWidthPx = Math.min(540, state.cardWidthPx + 1);
      renderRings(controls, stage);
    };

    controls.querySelector<HTMLInputElement>("#sc-ring-mm")!.oninput = (e) => {
      state.ringDiameterMm = Number((e.target as HTMLInputElement).value);
      emit();
      renderRings(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#sc-ring-dec")!.onclick = () => {
      state.ringDiameterMm = Math.max(13.5, Number((state.ringDiameterMm - 0.05).toFixed(2)));
      emit();
      renderRings(controls, stage);
    };
    controls.querySelector<HTMLButtonElement>("#sc-ring-inc")!.onclick = () => {
      state.ringDiameterMm = Math.min(24.0, Number((state.ringDiameterMm + 0.05).toFixed(2)));
      emit();
      renderRings(controls, stage);
    };

    stage.innerHTML = `
      <div class="stage-toolbar">
        <strong>1:1 Optical Ring Reticle &amp; Card Caliper</strong>
        <span class="spec-tag">${pxPerMm.toFixed(2)} PX/MM LOCKED</span>
      </div>
      <div class="viewport-box" style="flex-direction:column;gap:24px;padding:24px 16px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <div style="font-family:var(--font-mono);font-size:.74rem;color:var(--muted)">ISO/IEC 7810 ID-1 CARD SPECIMEN (${CREDIT_CARD_WIDTH_MM} × 53.98 MM)</div>
          <div style="position:relative;width:${state.cardWidthPx}px;height:${Math.min(cardHeightPx, 175)}px;border:2px solid var(--accent);border-left-width:3px;border-right-width:3px;background:var(--accent-soft);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.82rem;box-sizing:border-box">
            <div style="position:absolute;left:12%;top:34%;width:36px;height:26px;border:1.2px solid var(--border-strong);border-radius:4px;background:var(--surface)"></div>
            <span>&#8592; ${CREDIT_CARD_WIDTH_MM} mm &#8594;</span>
          </div>
        </div>

        <div style="display:grid;justify-items:center;gap:10px">
          <div style="font-family:var(--font-mono);font-size:.74rem;color:var(--muted)">MATCH RING INSIDE WALL TO CIRCLE OUTLINE</div>
          <div style="position:relative;width:${ringPx}px;height:${ringPx}px;border-radius:50%;border:2.5px solid var(--accent-b);background:var(--accent-b-soft);display:flex;align-items:center;justify-content:center;box-sizing:border-box">
            <div style="position:absolute;left:0;right:0;top:50%;height:1px;background:var(--border-strong)"></div>
            <div style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--border-strong)"></div>
            <span style="position:relative;background:var(--surface);padding:1px 4px;border-radius:2px;font-family:var(--font-mono);font-size:.74rem;font-weight:700">${conv.diameterMm.toFixed(1)}</span>
          </div>
          <div class="spec-tag" style="font-size:.8rem;padding:5px 10px">
            US ${conv.us} · EU ${conv.eu} · UK ${conv.uk} · JP ${conv.jp}
          </div>
        </div>
      </div>
    `;
  }

  render();
}
