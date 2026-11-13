import {
  BIOMETRIC_PHOTO_SPECS,
  computeHeadCropGuide,
  computePrintSheetLayout,
  getBiometricSpec,
  type BiometricPhotoSpec,
} from "../engines/photo/index.js";
import { generatePassportSheetPdf } from "../services/pdf-export.js";

export interface PassportPhotoPreset {
  specSlug?: string;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function triggerBytesDownload(bytes: Uint8Array | Blob, filename: string, mime = "image/png"): void {
  const blob = bytes instanceof Blob ? bytes : new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function createSampleStudioPortrait(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 1100;
  const ctx = c.getContext("2d")!;
  // Soft off-white studio backdrop
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, c.width, c.height);
  // Shoulders
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(450, 1080, 340, 290, 0, Math.PI, 0);
  ctx.fill();
  // Neck
  ctx.fillStyle = "#d9a987";
  ctx.fillRect(390, 680, 120, 140);
  // Head oval (natural proportions for aligning into crown-to-chin guide)
  ctx.fillStyle = "#e8bc9c";
  ctx.beginPath();
  ctx.ellipse(450, 470, 175, 235, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair crown
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.ellipse(450, 310, 182, 120, 0, Math.PI, 0);
  ctx.fill();
  // Subtle facial alignment landmarks (eyes & mouth) for testing overlay alignment
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(385, 455, 13, 0, Math.PI * 2);
  ctx.arc(515, 455, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#9a6b52";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(410, 585);
  ctx.lineTo(490, 585);
  ctx.stroke();
  return c;
}

export function mountPassportPhoto(
  container: HTMLElement,
  preset: PassportPhotoPreset,
  onStateChange?: (state: Record<string, string | number | boolean>) => void
): void {
  const defaultSpec = getBiometricSpec(preset.specSlug || "us-passport-2x2") || BIOMETRIC_PHOTO_SPECS[0];
  let activeImage: CanvasImageSource | null = null;
  let imageWidth = 900;
  let imageHeight = 1100;
  let hasUserImage = false;

  const state = {
    specSlug: defaultSpec.slug,
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotateDeg: 0,
    brightness: 100,
    backdropLift: 0,
    showGuides: true,
  };

  function currentSpec(): BiometricPhotoSpec {
    return getBiometricSpec(state.specSlug) || BIOMETRIC_PHOTO_SPECS[0];
  }

  function render(): void {
    const spec = currentSpec();
    const guide = computeHeadCropGuide(spec, 300);
    const sheet = computePrintSheetLayout(spec);

    const specOpts = BIOMETRIC_PHOTO_SPECS.map(
      (s) => `<option value="${escapeAttr(s.slug)}" ${s.slug === spec.slug ? "selected" : ""}>${escapeAttr(s.country)} — ${escapeAttr(s.documentType)} (${s.widthMm}×${s.heightMm} mm)</option>`
    ).join("");

    container.innerHTML = `
      <div class="studio-grid">
        <div class="card form-grid">
          <h3>Biometric Photo Studio (100% Local)</h3>
          <div class="field">
            <label for="pp-spec">Country &amp; Document Standard (${BIOMETRIC_PHOTO_SPECS.length} specs)</label>
            <select id="pp-spec">${specOpts}</select>
          </div>
          <label class="dropzone" for="pp-file">
            <input id="pp-file" type="file" accept="image/*" style="display:none" />
            <strong>Choose Portrait Photo</strong> or drag &amp; drop
            <div style="font-size:.8rem;color:var(--muted);margin-top:4px">Processed solely in browser memory · Zero cloud upload</div>
          </label>
          <button class="btn-secondary" id="pp-sample" type="button">Load Test Portrait Silhouette</button>
          <div class="form-row-2">
            <div class="field"><label for="pp-zoom">Zoom (${state.zoom.toFixed(2)}×)</label><input id="pp-zoom" type="range" min="0.5" max="2.5" step="0.02" value="${state.zoom}"></div>
            <div class="field"><label for="pp-rot">Straighten (${state.rotateDeg}°)</label><input id="pp-rot" type="range" min="-15" max="15" step="0.5" value="${state.rotateDeg}"></div>
          </div>
          <div class="form-row-2">
            <div class="field"><label for="pp-ox">Pan X (${state.offsetX} px)</label><input id="pp-ox" type="range" min="-250" max="250" step="2" value="${state.offsetX}"></div>
            <div class="field"><label for="pp-oy">Pan Y (${state.offsetY} px)</label><input id="pp-oy" type="range" min="-250" max="250" step="2" value="${state.offsetY}"></div>
          </div>
          <div class="form-row-2">
            <div class="field"><label for="pp-br">Brightness (${state.brightness}%)</label><input id="pp-br" type="range" min="75" max="135" step="1" value="${state.brightness}"></div>
            <div class="field"><label for="pp-bg">White Backdrop Lift (${state.backdropLift}%)</label><input id="pp-bg" type="range" min="0" max="45" step="1" value="${state.backdropLift}"></div>
          </div>
          <label style="display:flex;gap:8px;align-items:center;font-size:.86rem;cursor:pointer">
            <input id="pp-guides" type="checkbox" ${state.showGuides ? "checked" : ""}> Show biometric head oval &amp; eye-line guides
          </label>
          <div style="display:grid;gap:8px">
            <button class="btn-primary" id="pp-dl-single" type="button">Download Single 300-DPI Photo (${guide.pixelWidth}×${guide.pixelHeight} px)</button>
            <button class="btn-secondary" id="pp-dl-sheet-pdf" type="button">Download 4×6 Print Sheet PDF (${sheet.count} photos + cut marks)</button>
            <button class="btn-secondary" id="pp-dl-sheet-png" type="button">Download 4×6 Print Sheet PNG (1800×1200 px)</button>
          </div>
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <div>
              <strong>${escapeAttr(spec.country)} · ${escapeAttr(spec.documentType)}</strong>
              <div style="font-size:.84rem;color:var(--muted)">Print Size: ${spec.widthMm}×${spec.heightMm} mm · Head Height: ${spec.minHeadMm}–${spec.maxHeadMm} mm</div>
            </div>
            <span class="status-pill ${hasUserImage ? "status-ok" : "status-warn"}">${hasUserImage ? "LOCAL PHOTO READY" : "SAMPLE PREVIEW"}</span>
          </div>
          <div class="viewport-box">
            <canvas id="pp-canvas" style="max-width:100%;max-height:420px;border:1px solid var(--border);border-radius:4px;background:#fff"></canvas>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><div class="label">Output Resolution</div><div class="value">${guide.pixelWidth}×${guide.pixelHeight}</div></div>
            <div class="kpi"><div class="label">Head Ratio Target</div><div class="value">${Math.round(guide.minHeadRatio * 100)}–${Math.round(guide.maxHeadRatio * 100)}%</div></div>
            <div class="kpi"><div class="label">4×6 Sheet Capacity</div><div class="value">${sheet.count} Photos</div></div>
          </div>
          <p style="font-size:.86rem;color:var(--muted);margin-top:12px"><strong>Official Rule:</strong> ${escapeAttr(spec.notes)}</p>
        </div>
      </div>
    `;

    const canvas = container.querySelector<HTMLCanvasElement>("#pp-canvas")!;
    if (!activeImage) {
      activeImage = createSampleStudioPortrait();
      imageWidth = 900;
      imageHeight = 1100;
    }

    const paintCanvas = (targetCanvas: HTMLCanvasElement, includeOverlay: boolean): void => {
      const w = guide.pixelWidth;
      const h = guide.pixelHeight;
      targetCanvas.width = w;
      targetCanvas.height = h;
      const ctx = targetCanvas.getContext("2d")!;
      ctx.fillStyle = spec.backgroundHex || "#ffffff";
      ctx.fillRect(0, 0, w, h);

      if (activeImage) {
        ctx.save();
        ctx.translate(w / 2 + state.offsetX, h / 2 + state.offsetY);
        ctx.rotate((state.rotateDeg * Math.PI) / 180);
        const baseScale = Math.max(w / imageWidth, h / imageHeight) * state.zoom;
        const dw = imageWidth * baseScale;
        const dh = imageHeight * baseScale;
        ctx.filter = `brightness(${state.brightness}%)`;
        ctx.drawImage(activeImage, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      if (state.backdropLift > 0) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const threshold = 235 - state.backdropLift * 1.4;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (lum >= threshold) {
            const blend = Math.min(1, (lum - threshold) / 28);
            d[i] = Math.round(d[i] + (255 - d[i]) * blend);
            d[i + 1] = Math.round(d[i + 1] + (255 - d[i + 1]) * blend);
            d[i + 2] = Math.round(d[i + 2] + (255 - d[i + 2]) * blend);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      if (includeOverlay && state.showGuides) {
        const idealH = h * guide.idealHeadRatio;
        const eyeY = h * guide.eyeLineYRatioFromTop;
        const headCenterY = eyeY + idealH * 0.04;
        ctx.save();
        ctx.strokeStyle = "rgba(2, 132, 199, 0.85)";
        ctx.lineWidth = Math.max(2, w / 220);
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(w / 2, headCenterY, idealH * 0.35, idealH * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(34, 197, 94, 0.85)";
        ctx.beginPath();
        ctx.moveTo(w * 0.12, eyeY);
        ctx.lineTo(w * 0.88, eyeY);
        ctx.stroke();
        ctx.restore();
      }
    };

    paintCanvas(canvas, true);

    container.querySelector<HTMLSelectElement>("#pp-spec")!.onchange = (e) => {
      state.specSlug = (e.target as HTMLSelectElement).value;
      onStateChange?.({ specSlug: state.specSlug });
      render();
    };
    container.querySelector<HTMLInputElement>("#pp-file")!.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        activeImage = img;
        imageWidth = img.naturalWidth || 900;
        imageHeight = img.naturalHeight || 1100;
        hasUserImage = true;
        URL.revokeObjectURL(url);
        render();
      };
      img.src = url;
    };
    container.querySelector<HTMLButtonElement>("#pp-sample")!.onclick = () => {
      activeImage = createSampleStudioPortrait();
      imageWidth = 900;
      imageHeight = 1100;
      hasUserImage = false;
      state.zoom = 1;
      state.offsetX = 0;
      state.offsetY = 0;
      state.rotateDeg = 0;
      render();
    };

    const bindRange = (id: string, key: "zoom" | "rotateDeg" | "offsetX" | "offsetY" | "brightness" | "backdropLift") => {
      container.querySelector<HTMLInputElement>(id)!.oninput = (e) => {
        state[key] = Number((e.target as HTMLInputElement).value);
        paintCanvas(canvas, true);
      };
    };
    bindRange("#pp-zoom", "zoom");
    bindRange("#pp-rot", "rotateDeg");
    bindRange("#pp-ox", "offsetX");
    bindRange("#pp-oy", "offsetY");
    bindRange("#pp-br", "brightness");
    bindRange("#pp-bg", "backdropLift");

    container.querySelector<HTMLInputElement>("#pp-guides")!.onchange = (e) => {
      state.showGuides = (e.target as HTMLInputElement).checked;
      paintCanvas(canvas, true);
    };

    const exportCleanCanvasBlob = (): Promise<Blob> => {
      const clean = document.createElement("canvas");
      paintCanvas(clean, false);
      return new Promise((resolve, reject) =>
        clean.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png")
      );
    };

    container.querySelector<HTMLButtonElement>("#pp-dl-single")!.onclick = async () => {
      const blob = await exportCleanCanvasBlob();
      triggerBytesDownload(blob, `${spec.slug}-300dpi-scaleandfit.png`, "image/png");
    };

    container.querySelector<HTMLButtonElement>("#pp-dl-sheet-pdf")!.onclick = async () => {
      const blob = await exportCleanCanvasBlob();
      const pngBytes = new Uint8Array(await blob.arrayBuffer());
      const pdfBytes = await generatePassportSheetPdf(pngBytes, sheet, `${spec.country} ${spec.documentType}`);
      triggerBytesDownload(pdfBytes, `${spec.slug}-4x6-print-sheet-scaleandfit.pdf`, "application/pdf");
    };

    container.querySelector<HTMLButtonElement>("#pp-dl-sheet-png")!.onclick = async () => {
      const clean = document.createElement("canvas");
      paintCanvas(clean, false);
      const sheetCanvas = document.createElement("canvas");
      sheetCanvas.width = sheet.sheetPixelWidth;
      sheetCanvas.height = sheet.sheetPixelHeight;
      const sctx = sheetCanvas.getContext("2d")!;
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

      const pxPerMm = 300 / 25.4;
      for (const p of sheet.placements) {
        const x = Math.round(p.xMm * pxPerMm);
        const y = Math.round(p.yMm * pxPerMm);
        const w = Math.round(p.widthMm * pxPerMm);
        const h = Math.round(p.heightMm * pxPerMm);
        sctx.save();
        if (p.rotated) {
          sctx.translate(x + w, y);
          sctx.rotate(Math.PI / 2);
          sctx.drawImage(clean, 0, 0, h, w);
        } else {
          sctx.drawImage(clean, x, y, w, h);
        }
        sctx.restore();
        sctx.strokeStyle = "#cbd5e1";
        sctx.lineWidth = 2;
        sctx.strokeRect(x, y, w, h);
      }

      sheetCanvas.toBlob((blob) => {
        if (blob) triggerBytesDownload(blob, `${spec.slug}-4x6-sheet-300dpi-scaleandfit.png`, "image/png");
      }, "image/png");
    };
  }

  render();
}
