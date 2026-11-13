import {
  BIOMETRIC_PHOTO_SPECS,
  computeHeadCropGuide,
  computePrintSheetLayout,
  getBiometricSpec,
  type BiometricPhotoSpec,
  type PrintSheetLayout,
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

/**
 * Renders a clinical architectural calibration silhouette using standard Canvas 2D primitives
 * supported cleanly by both live browsers and the Vitest JSDOM Canvas stub.
 */
function createSampleStudioPortrait(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 1100;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F4F5F7";
  ctx.fillRect(0, 0, c.width, c.height);

  // Subtle registration grid
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(450, 90);
  ctx.lineTo(450, 1020);
  ctx.moveTo(150, 455);
  ctx.lineTo(750, 455);
  ctx.stroke();

  // Shoulders & neck architectural bust silhouette
  ctx.fillStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.ellipse(450, 1070, 325, 275, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(394, 675, 112, 140);

  // Neutral calibration head silhouette
  ctx.fillStyle = "#D8DEE6";
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(450, 468, 174, 232, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Subtle horizontal eye-level & chin alignment ticks
  ctx.strokeStyle = "#64748B";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(355, 455);
  ctx.lineTo(420, 455);
  ctx.moveTo(480, 455);
  ctx.lineTo(545, 455);
  ctx.moveTo(425, 635);
  ctx.lineTo(475, 635);
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
    viewMode: "single" as "single" | "sheet",
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
        <div class="panel form-grid">
          <div class="panel-header">
            <h2 class="panel-title">Biometric Controls</h2>
            <span class="section-kicker">ICAO 9303</span>
          </div>

          <div class="control-group">
            <div class="section-kicker">01 · Country Standard &amp; Portrait</div>
            <div class="field">
              <label for="pp-spec"><span>Jurisdiction</span><span>${BIOMETRIC_PHOTO_SPECS.length} specs</span></label>
              <select id="pp-spec">${specOpts}</select>
            </div>
            <label class="dropzone" for="pp-file">
              <input id="pp-file" type="file" accept="image/*" style="display:none" />
              <strong>Upload Portrait Image</strong> or drop file here
              <div style="font-size:.76rem;color:var(--muted);margin-top:3px">100% browser memory · zero upload</div>
            </label>
            <button class="btn-secondary btn-sm" id="pp-sample" type="button">Load Calibration Silhouette</button>
          </div>

          <div class="control-group">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="section-kicker">02 · Framing &amp; Lighting</span>
              <button class="action-btn btn-sm" id="pp-reset-frame" type="button">Reset Framing</button>
            </div>
            <div class="form-row-2">
              <div class="field"><label for="pp-zoom"><span>Zoom</span><span>${state.zoom.toFixed(2)}×</span></label><input id="pp-zoom" type="range" min="0.5" max="2.5" step="0.02" value="${state.zoom}"></div>
              <div class="field"><label for="pp-rot"><span>Straighten</span><span>${state.rotateDeg}°</span></label><input id="pp-rot" type="range" min="-15" max="15" step="0.5" value="${state.rotateDeg}"></div>
            </div>
            <div class="form-row-2">
              <div class="field"><label for="pp-ox"><span>Pan X</span><span>${state.offsetX} px</span></label><input id="pp-ox" type="range" min="-250" max="250" step="2" value="${state.offsetX}"></div>
              <div class="field"><label for="pp-oy"><span>Pan Y</span><span>${state.offsetY} px</span></label><input id="pp-oy" type="range" min="-250" max="250" step="2" value="${state.offsetY}"></div>
            </div>
            <div class="form-row-2">
              <div class="field"><label for="pp-br"><span>Exposure</span><span>${state.brightness}%</span></label><input id="pp-br" type="range" min="75" max="135" step="1" value="${state.brightness}"></div>
              <div class="field"><label for="pp-bg"><span>Backdrop Lift</span><span>${state.backdropLift}%</span></label><input id="pp-bg" type="range" min="0" max="45" step="1" value="${state.backdropLift}"></div>
            </div>
            <label style="display:flex;gap:8px;align-items:center;font-size:.82rem;cursor:pointer">
              <input id="pp-guides" type="checkbox" ${state.showGuides ? "checked" : ""}> Show biometric crown oval &amp; eye-level reticle
            </label>
          </div>

          <div class="control-group">
            <div class="section-kicker">03 · 300-DPI Export</div>
            <div style="display:grid;gap:7px">
              <button class="btn-primary" id="pp-dl-single" type="button">Download Single 300-DPI PNG (${guide.pixelWidth}×${guide.pixelHeight} px)</button>
              <button class="btn-secondary" id="pp-dl-sheet-pdf" type="button">Download 4×6 Sheet PDF (${sheet.count} photos + cut marks)</button>
              <button class="btn-secondary" id="pp-dl-sheet-png" type="button">Download 4×6 Sheet PNG (1800×1200 px)</button>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="stage-toolbar">
            <div>
              <strong>${escapeAttr(spec.country)} · ${escapeAttr(spec.documentType)}</strong>
              <div style="font-size:.8rem;color:var(--muted)">Print Size: ${spec.widthMm}×${spec.heightMm} mm · Head Height: ${spec.minHeadMm}–${spec.maxHeadMm} mm</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div class="segmented-bar" role="tablist">
                <button class="seg-btn btn-sm ${state.viewMode === "single" ? "active" : ""}" id="pp-view-single" type="button">Biometric Crop</button>
                <button class="seg-btn btn-sm ${state.viewMode === "sheet" ? "active" : ""}" id="pp-view-sheet" type="button">4×6&quot; Sheet (${sheet.count}×)</button>
              </div>
              <span class="status-pill ${hasUserImage ? "status-ok" : "status-warn"}">${hasUserImage ? "Portrait Loaded" : "Calibration Silhouette"}</span>
            </div>
          </div>
          <div class="viewport-box" style="flex-direction:column;gap:8px">
            <canvas id="pp-canvas" style="max-width:100%;max-height:420px;border:1px solid var(--border-strong);border-radius:3px;background:#fff;cursor:${state.viewMode === "single" ? "grab" : "default"}"></canvas>
            <div style="font-family:var(--font-mono);font-size:.72rem;color:var(--muted)">
              ${state.viewMode === "single" ? "DRAG DIRECTLY ON CANVAS TO PAN · DASHED OVAL MARKS TARGET CROWN-TO-CHIN ENVELOPE" : "1800 × 1200 PX (4×6 IN / 101.6 × 152.4 MM) PRINT SHEET WITH TRIM GUIDES"}
            </div>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><div class="label">Digital Pixels</div><div class="value">${guide.pixelWidth}×${guide.pixelHeight}</div></div>
            <div class="kpi"><div class="label">Head Share Target</div><div class="value">${Math.round(guide.minHeadRatio * 100)}–${Math.round(guide.maxHeadRatio * 100)}%</div></div>
            <div class="kpi"><div class="label">4×6 Sheet Tiles</div><div class="value">${sheet.count} Photos</div></div>
          </div>
          <div class="compliance-strip" aria-label="Biometric compliance checklist">
            <div class="compliance-item"><strong>PASS // SPEC</strong><span>${spec.widthMm}×${spec.heightMm} mm @ 300 DPI</span></div>
            <div class="compliance-item"><strong>PASS // HEAD BAND</strong><span>${spec.minHeadMm}–${spec.maxHeadMm} mm vertical</span></div>
            <div class="compliance-item"><strong>PASS // BACKDROP</strong><span>${escapeAttr(spec.backgroundHex || "#FFFFFF")} studio tone</span></div>
            <div class="compliance-item"><strong>PASS // PRIVACY</strong><span>Client Canvas memory</span></div>
          </div>
          <p style="font-size:.82rem;color:var(--muted);margin:10px 0 0"><strong>Official Rule:</strong> ${escapeAttr(spec.notes)}</p>
        </div>
      </div>
    `;

    const canvas = container.querySelector<HTMLCanvasElement>("#pp-canvas")!;
    if (!activeImage) {
      activeImage = createSampleStudioPortrait();
      imageWidth = 900;
      imageHeight = 1100;
    }

    const paintSingle = (targetCanvas: HTMLCanvasElement, includeOverlay: boolean): void => {
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
        const crownY = headCenterY - idealH * 0.5;
        const chinY = headCenterY + idealH * 0.5;
        ctx.save();
        ctx.strokeStyle = "rgba(15, 82, 186, 0.85)";
        ctx.lineWidth = Math.max(2, w / 220);
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(w / 2, headCenterY, idealH * 0.35, idealH * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Horizontal crown, eye-level, and chin calibration ticks
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(15, 82, 186, 0.55)";
        ctx.beginPath();
        ctx.moveTo(w * 0.36, crownY);
        ctx.lineTo(w * 0.64, crownY);
        ctx.moveTo(w * 0.36, chinY);
        ctx.lineTo(w * 0.64, chinY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(21, 128, 61, 0.85)";
        ctx.beginPath();
        ctx.moveTo(w * 0.12, eyeY);
        ctx.lineTo(w * 0.88, eyeY);
        ctx.stroke();
        ctx.restore();
      }
    };

    const paintSheet = (targetCanvas: HTMLCanvasElement, sourceCanvas: HTMLCanvasElement, activeSheet: PrintSheetLayout): void => {
      targetCanvas.width = activeSheet.sheetPixelWidth;
      targetCanvas.height = activeSheet.sheetPixelHeight;
      const sctx = targetCanvas.getContext("2d")!;
      sctx.fillStyle = "#ffffff";
      sctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

      const pxPerMm = 300 / 25.4;
      for (const p of activeSheet.placements) {
        const x = Math.round(p.xMm * pxPerMm);
        const y = Math.round(p.yMm * pxPerMm);
        const w = Math.round(p.widthMm * pxPerMm);
        const h = Math.round(p.heightMm * pxPerMm);
        sctx.save();
        if (p.rotated) {
          sctx.translate(x + w, y);
          sctx.rotate(Math.PI / 2);
          sctx.drawImage(sourceCanvas, 0, 0, h, w);
        } else {
          sctx.drawImage(sourceCanvas, x, y, w, h);
        }
        sctx.restore();
        sctx.strokeStyle = "#CBD5E1";
        sctx.lineWidth = 2;
        sctx.strokeRect(x, y, w, h);
      }
    };

    const renderViewport = () => {
      if (state.viewMode === "single") {
        paintSingle(canvas, true);
      } else {
        const cleanTile = document.createElement("canvas");
        paintSingle(cleanTile, false);
        paintSheet(canvas, cleanTile, sheet);
      }
    };

    renderViewport();

    container.querySelector<HTMLSelectElement>("#pp-spec")!.onchange = (e) => {
      state.specSlug = (e.target as HTMLSelectElement).value;
      onStateChange?.({ specSlug: state.specSlug });
      render();
    };
    container.querySelector<HTMLButtonElement>("#pp-view-single")!.onclick = () => {
      state.viewMode = "single";
      render();
    };
    container.querySelector<HTMLButtonElement>("#pp-view-sheet")!.onclick = () => {
      state.viewMode = "sheet";
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
    container.querySelector<HTMLButtonElement>("#pp-reset-frame")!.onclick = () => {
      state.zoom = 1;
      state.offsetX = 0;
      state.offsetY = 0;
      state.rotateDeg = 0;
      state.brightness = 100;
      state.backdropLift = 0;
      render();
    };

    const bindRange = (id: string, key: "zoom" | "rotateDeg" | "offsetX" | "offsetY" | "brightness" | "backdropLift") => {
      container.querySelector<HTMLInputElement>(id)!.oninput = (e) => {
        state[key] = Number((e.target as HTMLInputElement).value);
        renderViewport();
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
      renderViewport();
    };

    // Pointer drag-to-pan directly on canvas in Biometric Crop mode
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let baseOffsetX = 0;
    let baseOffsetY = 0;
    canvas.onpointerdown = (ev) => {
      if (state.viewMode !== "single") return;
      dragging = true;
      dragStartX = ev.clientX;
      dragStartY = ev.clientY;
      baseOffsetX = state.offsetX;
      baseOffsetY = state.offsetY;
      canvas.style.cursor = "grabbing";
    };
    const hostRecord = container as unknown as Record<string, EventListener | undefined>;
    if (hostRecord.__ppMove) window.removeEventListener("pointermove", hostRecord.__ppMove);
    if (hostRecord.__ppUp) window.removeEventListener("pointerup", hostRecord.__ppUp);
    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging) return;
      state.offsetX = Math.max(-250, Math.min(250, Math.round(baseOffsetX + (ev.clientX - dragStartX) * 1.5)));
      state.offsetY = Math.max(-250, Math.min(250, Math.round(baseOffsetY + (ev.clientY - dragStartY) * 1.5)));
      const oxInput = container.querySelector<HTMLInputElement>("#pp-ox");
      const oyInput = container.querySelector<HTMLInputElement>("#pp-oy");
      if (oxInput) oxInput.value = String(state.offsetX);
      if (oyInput) oyInput.value = String(state.offsetY);
      renderViewport();
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = state.viewMode === "single" ? "grab" : "default";
    };
    hostRecord.__ppMove = onPointerMove as EventListener;
    hostRecord.__ppUp = onPointerUp;
    window.addEventListener("pointermove", hostRecord.__ppMove);
    window.addEventListener("pointerup", hostRecord.__ppUp);

    const exportCleanCanvasBlob = (): Promise<Blob> => {
      const clean = document.createElement("canvas");
      paintSingle(clean, false);
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
      paintSingle(clean, false);
      const sheetCanvas = document.createElement("canvas");
      paintSheet(sheetCanvas, clean, sheet);
      sheetCanvas.toBlob((blob) => {
        if (blob) triggerBytesDownload(blob, `${spec.slug}-4x6-sheet-300dpi-scaleandfit.png`, "image/png");
      }, "image/png");
    };
  }

  render();
}
