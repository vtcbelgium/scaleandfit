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
      <div class="studio-tabs" role="tablist">
        <button class="tab-btn ${state.mode === "shoes" ? "active" : ""}" data-tab="shoes">Cross-Brand Shoe Matrix (Mondopoint)</button>
        <button class="tab-btn ${state.mode === "rings" ? "active" : ""}" data-tab="rings">On-Screen Calibrated Ring Sizer</button>
      </div>
      <div class="studio-grid">
        <div class="card form-grid" id="sc-controls"></div>
        <div class="card" id="sc-stage"></div>
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
      <h3>Your Current Shoe Fit</h3>
      <div class="field"><label for="sc-from">Current Brand</label><select id="sc-from">${brandOpts(fromProfile.slug)}</select></div>
      <div class="form-row-2">
        <div class="field"><label for="sc-gender">Category</label>
          <select id="sc-gender">
            <option value="mens" ${state.gender === "mens" ? "selected" : ""}>Men's US</option>
            <option value="womens" ${state.gender === "womens" ? "selected" : ""}>Women's US</option>
            <option value="unisex" ${state.gender === "unisex" ? "selected" : ""}>Unisex</option>
          </select>
        </div>
        <div class="field"><label for="sc-us">Your Size</label><select id="sc-us">${sizeOpts}</select></div>
      </div>
      <div class="field"><label for="sc-to">Target Brand</label><select id="sc-to">${brandOpts(toProfile.slug)}</select></div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Foot Length</div><div class="value">${direct.mondopointMm} mm</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} US</div><div class="value">${direct.us}</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} EU</div><div class="value">${direct.eu}</div></div>
        <div class="kpi"><div class="label">${escapeAttr(toProfile.name)} UK</div><div class="value">${direct.uk}</div></div>
      </div>
      <p style="font-size:.86rem;color:var(--muted);margin:4px 0 0"><strong>Last Note:</strong> ${escapeAttr(direct.fitNote)}</p>
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

    stage.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <h3 style="margin:0">${escapeAttr(fromProfile.name)} US ${state.usSize} (${state.gender}) → ${escapeAttr(toProfile.name)} US ${direct.us}</h3>
        <span class="status-pill status-ok">Mondopoint ${mondo} mm / ${(mondo / 10).toFixed(1)} cm</span>
      </div>
      <div class="data-table-wrap" style="max-height:430px;overflow-y:auto">
        <table class="data-table">
          <thead><tr><th>Brand</th><th>US</th><th>EU</th><th>UK</th><th>Fit Profile</th></tr></thead>
          <tbody>
            ${allBrands
              .map(
                (row) => `<tr style="${row.profile.slug === toProfile.slug ? "background:var(--ok-bg);" : ""}">
                  <td><strong>${escapeAttr(row.profile.name)}</strong></td>
                  <td>${row.us}</td>
                  <td>${row.eu}</td>
                  <td>${row.uk}</td>
                  <td style="font-size:.82rem;color:var(--muted)">${escapeAttr(row.profile.fitNote)}</td>
                </tr>`
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
    const conv = convertRingFromDiameterMm(state.ringDiameterMm);

    controls.innerHTML = `
      <h3>Step 1: Calibrate Screen to Bank Card</h3>
      <p style="font-size:.86rem;color:var(--muted);margin:0">
        Hold a standard credit/ID card (${CREDIT_CARD_WIDTH_MM} mm wide) against the cyan box below and adjust until they match width exactly.
      </p>
      <div class="field">
        <label for="sc-card-px">Card Width Calibration (${state.cardWidthPx} px · ${pxPerMm.toFixed(2)} px/mm)</label>
        <input id="sc-card-px" type="range" min="180" max="540" step="1" value="${state.cardWidthPx}">
      </div>
      <h3>Step 2: Match Ring Inside Diameter</h3>
      <div class="field">
        <label for="sc-ring-mm">Inner Diameter (${state.ringDiameterMm.toFixed(2)} mm · Circ. ${conv.circumferenceMm} mm)</label>
        <input id="sc-ring-mm" type="range" min="13.5" max="24.0" step="0.05" value="${state.ringDiameterMm}">
      </div>
      <div class="kpi-grid">
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
    controls.querySelector<HTMLInputElement>("#sc-ring-mm")!.oninput = (e) => {
      state.ringDiameterMm = Number((e.target as HTMLInputElement).value);
      emit();
      renderRings(controls, stage);
    };

    stage.innerHTML = `
      <div style="display:grid;gap:22px;justify-items:center;padding:12px 0">
        <div>
          <div style="font-size:.82rem;color:var(--muted);margin-bottom:6px;text-align:center">Reference ID Card Width (${CREDIT_CARD_WIDTH_MM} mm)</div>
          <div style="width:${state.cardWidthPx}px;height:44px;border:2px solid var(--accent);background:rgba(56,189,248,0.14);border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.82rem">
            ← ${CREDIT_CARD_WIDTH_MM} mm →
          </div>
        </div>
        <div style="display:grid;justify-items:center;gap:8px">
          <div style="font-size:.82rem;color:var(--muted)">Place ring on circle (match inner edge to ring's inside wall)</div>
          <div style="width:${ringPx}px;height:${ringPx}px;border-radius:50%;border:3px solid #a855f7;background:rgba(168,85,247,0.12);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.8rem">
            ${conv.diameterMm.toFixed(1)}mm
          </div>
          <div style="font-family:var(--font-mono);font-size:.9rem">
            US <strong>${conv.us}</strong> · EU <strong>${conv.eu}</strong> · UK <strong>${conv.uk}</strong> · JP <strong>${conv.jp}</strong>
          </div>
        </div>
      </div>
    `;
  }

  render();
}
