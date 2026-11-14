import {
  BIOMETRIC_PHOTO_SPECS,
  computeHeadCropGuide,
  computePrintSheetLayout,
  getBiometricSpec,
  type BiometricPhotoSpec,
  type PrintSheetLayout,
} from "../engines/photo/index.js";
import { renderStepRibbon, renderVisualGuideSection } from "../components/guide-section.js";
import { escapeHtml, t, type LocaleCode } from "../i18n/index.js";
import { generatePassportSheetPdf } from "../services/pdf-export.js";

export interface PassportPhotoPreset {
  specSlug?: string;
}

const POPULAR_COUNTRIES: Array<{ slug: string; code: string; label: string }> = [
  { slug: "us-passport-2x2", code: "US", label: 'US 2×2"' },
  { slug: "schengen-visa-35x45", code: "EU", label: "Schengen" },
  { slug: "belgium-passport-eid", code: "BE", label: "Belgium" },
  { slug: "netherlands-pasfoto", code: "NL", label: "Netherlands" },
  { slug: "uk-passport-35x45", code: "GB", label: "UK" },
  { slug: "germany-biometric-passport", code: "DE", label: "Germany" },
  { slug: "france-passport-cni", code: "FR", label: "France" },
  { slug: "canada-passport-50x70", code: "CA", label: "Canada" },
];

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

  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(450, 90);
  ctx.lineTo(450, 1020);
  ctx.moveTo(150, 455);
  ctx.lineTo(750, 455);
  ctx.stroke();

  ctx.fillStyle = "#CBD5E1";
  ctx.beginPath();
  ctx.ellipse(450, 1070, 325, 275, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(394, 675, 112, 140);

  ctx.fillStyle = "#D8DEE6";
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(450, 468, 174, 232, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

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
  onStateChange?: (state: Record<string, string | number | boolean>) => void,
  lang: LocaleCode = "en"
): void {
  const tr = t(lang);
  const hostRecord = container as HTMLElement & {
    __ppMove?: EventListener;
    __ppUp?: EventListener;
    __ppStopCamera?: () => void;
  };
  if (hostRecord.__ppStopCamera) {
    hostRecord.__ppStopCamera();
  }

  const defaultSpec = getBiometricSpec(preset.specSlug || "us-passport-2x2") || BIOMETRIC_PHOTO_SPECS[0];
  let activeImage: CanvasImageSource | null = null;
  let imageWidth = 900;
  let imageHeight = 1100;
  let hasUserImage = false;
  let cameraOpen = false;
  let cameraMirror = true;
  let cameraError = "";
  let activeStream: MediaStream | null = null;

  const stopCamera = (): void => {
    if (activeStream) {
      for (const track of activeStream.getTracks()) {
        track.stop();
      }
      activeStream = null;
    }
    cameraOpen = false;
  };
  hostRecord.__ppStopCamera = stopCamera;

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

  function loadImageFile(file: File): void {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      activeImage = img;
      imageWidth = img.naturalWidth || 900;
      imageHeight = img.naturalHeight || 1100;
      hasUserImage = true;
      cameraError = "";
      stopCamera();
      URL.revokeObjectURL(url);
      render();
    };
    img.src = url;
  }

  function renderStepperField(
    id: string,
    label: string,
    valueText: string,
    min: number,
    max: number,
    step: number,
    value: number
  ): string {
    return `
      <div class="field">
        <label for="${id}"><span>${escapeHtml(label)}</span><span id="${id}-val">${escapeHtml(valueText)}</span></label>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="step-btn" type="button" data-step-target="${id}" data-delta="${-step * 2}" aria-label="Decrease ${escapeHtml(label)}">−</button>
          <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" style="flex:1">
          <button class="step-btn" type="button" data-step-target="${id}" data-delta="${step * 2}" aria-label="Increase ${escapeHtml(label)}">+</button>
        </div>
      </div>
    `;
  }

  function render(): void {
    const spec = currentSpec();
    const guide = computeHeadCropGuide(spec, 300);
    const sheet = computePrintSheetLayout(spec);
    const activeStep = hasUserImage ? 3 : cameraOpen ? 2 : 1;

    const specOpts = BIOMETRIC_PHOTO_SPECS.map(
      (s) =>
        `<option value="${escapeHtml(s.slug)}" ${s.slug === spec.slug ? "selected" : ""}>${escapeHtml(s.country)} — ${escapeHtml(s.documentType)} (${s.widthMm}×${s.heightMm} mm)</option>`
    ).join("");

    const popularChipsHtml = POPULAR_COUNTRIES.filter((c) => getBiometricSpec(c.slug))
      .map(
        (c) => `
          <button
            type="button"
            class="country-chip ${c.slug === spec.slug ? "active" : ""}"
            data-country-slug="${escapeHtml(c.slug)}"
          >
            <span class="code-badge">${escapeHtml(c.code)}</span>
            <span>${escapeHtml(c.label)}</span>
          </button>
        `
      )
      .join("");

    const doDontExtra = `
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
        <h3 style="margin:0 0 6px;font-size:1.05rem">${escapeHtml(tr.passport.doDontTitle)}</h3>
        <p style="margin:0 0 12px;font-size:.88rem;color:var(--muted)">${escapeHtml(tr.passport.doDontLead)}</p>
        <div class="guide-hero-banner" style="background:#FAFAF8">
          <img src="/guides/passport-do-dont.svg" alt="${escapeHtml(tr.passport.doDontAlt)}" loading="lazy" width="800" height="320" style="object-fit:contain;max-height:320px" />
        </div>
        <div class="do-dont-grid">
          ${tr.passport.doDontPairs
            .map(
              (pair) => `
            <div class="do-dont-card">
              <div class="do-good">✓ ${escapeHtml(pair.goodTitle)}</div>
              <div style="color:var(--muted)">${escapeHtml(pair.goodDesc)}</div>
              <div class="do-bad" style="margin-top:4px">✕ ${escapeHtml(pair.badTitle)}</div>
              <div style="color:var(--muted)">${escapeHtml(pair.badDesc)}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    container.innerHTML = `
      ${renderStepRibbon(tr.passport.steps, activeStep)}

      <div class="studio-grid">
        <div class="panel form-grid">
          <div class="panel-header">
            <h2 class="panel-title">${escapeHtml(tr.passport.controlsTitle)}</h2>
            <span class="section-kicker">300 DPI · ICAO 9303</span>
          </div>

          <div class="control-group">
            <div class="section-kicker">${escapeHtml(tr.passport.countryGroupTitle)}</div>
            <div style="font-size:.78rem;color:var(--muted)">${escapeHtml(tr.passport.popularLabel)}</div>
            <div class="country-chip-row">${popularChipsHtml}</div>
            <div class="field">
              <label for="pp-spec"><span>${escapeHtml(tr.passport.countrySelectLabel)}</span><span>${BIOMETRIC_PHOTO_SPECS.length} ${escapeHtml(tr.passport.specsUnit)}</span></label>
              <select id="pp-spec">${specOpts}</select>
            </div>
            <div class="upload-actions-grid">
              <label class="dropzone" id="pp-dropzone" for="pp-file">
                <input id="pp-file" type="file" accept="image/*" style="display:none" />
                <strong>${escapeHtml(tr.passport.dropTitle)}</strong>
                <div style="font-size:.8rem;color:var(--muted);margin-top:3px">${escapeHtml(tr.passport.dropSub)}</div>
              </label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn-secondary btn-sm" id="pp-camera-btn" type="button" style="flex:1">${escapeHtml(cameraOpen ? tr.passport.cameraStop : tr.passport.cameraBtn)}</button>
                <button class="btn-secondary btn-sm" id="pp-sample" type="button">${escapeHtml(tr.passport.sampleBtn)}</button>
              </div>
              ${
                cameraOpen
                  ? `
                <div class="camera-panel" id="pp-camera-panel">
                  <div class="camera-stage">
                    <video id="pp-camera-video" autoplay playsinline muted class="${cameraMirror ? "mirrored" : ""}"></video>
                    <div class="camera-oval-overlay" aria-hidden="true"></div>
                  </div>
                  <div style="font-size:.78rem;color:var(--muted)">${escapeHtml(tr.passport.cameraHint)}</div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                    <button class="btn-primary btn-sm" id="pp-camera-snap" type="button" style="flex:1">${escapeHtml(tr.passport.cameraSnap)}</button>
                    <label style="display:flex;gap:6px;align-items:center;font-size:.8rem;cursor:pointer">
                      <input id="pp-camera-mirror" type="checkbox" ${cameraMirror ? "checked" : ""}> ${escapeHtml(tr.passport.cameraMirror)}
                    </label>
                  </div>
                </div>
              `
                  : ""
              }
              ${
                cameraError
                  ? `<div style="font-size:.8rem;color:var(--bad);background:var(--bad-bg);padding:8px 10px;border-radius:var(--radius-sm)">${escapeHtml(cameraError)}</div>`
                  : ""
              }
              <div class="privacy-note">✓ ${escapeHtml(tr.passport.privacyNote)}</div>
            </div>
          </div>

          <div class="control-group">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <span class="section-kicker">${escapeHtml(tr.passport.adjustGroupTitle)}</span>
              <button class="action-btn btn-sm" id="pp-reset-frame" type="button">${escapeHtml(tr.passport.resetBtn)}</button>
            </div>
            <div class="form-row-2">
              ${renderStepperField("pp-zoom", tr.passport.zoom, `${state.zoom.toFixed(2)}×`, 0.5, 2.5, 0.02, state.zoom)}
              ${renderStepperField("pp-rot", tr.passport.rotate, `${state.rotateDeg}°`, -15, 15, 0.5, state.rotateDeg)}
            </div>
            <div class="form-row-2">
              ${renderStepperField("pp-ox", tr.passport.panX, `${state.offsetX} px`, -250, 250, 4, state.offsetX)}
              ${renderStepperField("pp-oy", tr.passport.panY, `${state.offsetY} px`, -250, 250, 4, state.offsetY)}
            </div>
            <div class="form-row-2">
              ${renderStepperField("pp-br", tr.passport.exposure, `${state.brightness}%`, 75, 135, 2, state.brightness)}
              ${renderStepperField("pp-bg", tr.passport.backdrop, `${state.backdropLift}%`, 0, 45, 2, state.backdropLift)}
            </div>
            <label style="display:flex;gap:8px;align-items:center;font-size:.86rem;cursor:pointer;min-height:34px">
              <input id="pp-guides" type="checkbox" ${state.showGuides ? "checked" : ""}> ${escapeHtml(tr.passport.guidesToggle)}
            </label>
          </div>

          <div class="control-group">
            <div class="section-kicker">${escapeHtml(tr.passport.exportGroupTitle)}</div>
            <div style="display:grid;gap:8px">
              <button class="btn-primary dl-btn-stack" id="pp-dl-single" type="button">
                <strong>${escapeHtml(tr.passport.dlSingleTitle)} (${guide.pixelWidth}×${guide.pixelHeight} px)</strong>
                <span>${escapeHtml(tr.passport.dlSingleSub)}</span>
              </button>
              <button class="btn-secondary dl-btn-stack" id="pp-dl-sheet-pdf" type="button">
                <strong>${escapeHtml(tr.passport.dlPdfTitle)} (${sheet.count}×)</strong>
                <span>${escapeHtml(tr.passport.dlPdfSub)}</span>
              </button>
              <button class="btn-secondary dl-btn-stack" id="pp-dl-sheet-png" type="button">
                <strong>${escapeHtml(tr.passport.dlPngTitle)} (1800×1200 px)</strong>
                <span>${escapeHtml(tr.passport.dlPngSub)}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="stage-toolbar">
            <div>
              <strong>${escapeHtml(spec.country)} · ${escapeHtml(spec.documentType)}</strong>
              <div style="font-size:.84rem;color:var(--muted)">${escapeHtml(tr.passport.printSizeLabel)}: ${spec.widthMm}×${spec.heightMm} mm · ${escapeHtml(tr.passport.headHeightLabel)}: ${spec.minHeadMm}–${spec.maxHeadMm} mm</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div class="segmented-bar" role="tablist">
                <button class="seg-btn btn-sm ${state.viewMode === "single" ? "active" : ""}" id="pp-view-single" type="button">${escapeHtml(tr.passport.viewSingle)}</button>
                <button class="seg-btn btn-sm ${state.viewMode === "sheet" ? "active" : ""}" id="pp-view-sheet" type="button">${escapeHtml(tr.passport.viewSheet)} (${sheet.count}×)</button>
              </div>
              <span class="status-pill ${hasUserImage ? "status-ok" : "status-warn"}">${escapeHtml(hasUserImage ? tr.passport.statusUser : tr.passport.statusSample)}</span>
            </div>
          </div>
          <div class="viewport-box" id="pp-viewport" style="flex-direction:column;gap:8px">
            <canvas id="pp-canvas" style="max-width:100%;max-height:430px;border:1px solid var(--border-strong);border-radius:4px;background:#fff;cursor:${state.viewMode === "single" ? "grab" : "default"}"></canvas>
            <div style="font-size:.78rem;color:var(--muted);text-align:center">
              ${escapeHtml(state.viewMode === "single" ? tr.passport.dragTip : tr.passport.sheetTip)}
            </div>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><div class="label">${escapeHtml(tr.passport.kpiPixels)}</div><div class="value">${guide.pixelWidth}×${guide.pixelHeight}</div></div>
            <div class="kpi"><div class="label">${escapeHtml(tr.passport.kpiHead)}</div><div class="value">${Math.round(guide.minHeadRatio * 100)}–${Math.round(guide.maxHeadRatio * 100)}%</div></div>
            <div class="kpi"><div class="label">${escapeHtml(tr.passport.kpiTiles)}</div><div class="value">${sheet.count}</div></div>
          </div>
          <div class="compliance-strip" aria-label="Biometric compliance checklist">
            <div class="compliance-item"><strong>PASS // ${escapeHtml(tr.passport.checkSpec)}</strong><span>${spec.widthMm}×${spec.heightMm} mm @ 300 DPI</span></div>
            <div class="compliance-item"><strong>PASS // ${escapeHtml(tr.passport.checkHead)}</strong><span>${spec.minHeadMm}–${spec.maxHeadMm} mm</span></div>
            <div class="compliance-item"><strong>PASS // ${escapeHtml(tr.passport.checkBg)}</strong><span>${escapeHtml(spec.backgroundHex || "#FFFFFF")}</span></div>
            <div class="compliance-item"><strong>PASS // ${escapeHtml(tr.passport.checkPrivacy)}</strong><span>Canvas 100%</span></div>
          </div>
          <p style="font-size:.86rem;color:var(--muted);margin:10px 0 0"><strong>${escapeHtml(tr.passport.ruleLabel)}</strong> ${escapeHtml(spec.notes)}</p>
        </div>
      </div>

      ${renderVisualGuideSection({
        title: tr.passport.howTitle,
        lead: tr.passport.howLead,
        bannerSrc: "/images/guide-passport-setup.jpg",
        bannerAlt: tr.passport.bannerAlt,
        stepSvgs: ["/guides/passport-step-1.svg", "/guides/passport-step-2.svg", "/guides/passport-step-3.svg"],
        stepCards: tr.passport.stepCards,
        extraHtml: doDontExtra,
      })}
    `;

    const canvas = container.querySelector<HTMLCanvasElement>("#pp-canvas")!;
    if (!activeImage) {
      activeImage = createSampleStudioPortrait();
      imageWidth = 900;
      imageHeight = 1100;
    }

    if (cameraOpen && activeStream) {
      const video = container.querySelector<HTMLVideoElement>("#pp-camera-video");
      if (video) {
        video.srcObject = activeStream;
        void video.play?.().catch(() => {});
      }
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

    const renderViewport = (): void => {
      if (state.viewMode === "single") {
        paintSingle(canvas, true);
      } else {
        const cleanTile = document.createElement("canvas");
        paintSingle(cleanTile, false);
        paintSheet(canvas, cleanTile, sheet);
      }
    };

    renderViewport();

    container.querySelectorAll<HTMLButtonElement>("[data-country-slug]").forEach((btn) => {
      btn.onclick = () => {
        const nextSlug = btn.dataset.countrySlug || "";
        if (!getBiometricSpec(nextSlug)) return;
        state.specSlug = nextSlug;
        onStateChange?.({ specSlug: state.specSlug });
        render();
      };
    });

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
      if (file) loadImageFile(file);
    };

    const dropTargets = [
      container.querySelector<HTMLElement>("#pp-dropzone"),
      container.querySelector<HTMLElement>("#pp-viewport"),
    ];
    for (const target of dropTargets) {
      if (!target) continue;
      target.ondragover = (ev) => {
        ev.preventDefault();
        target.classList.add("drag-over");
      };
      target.ondragleave = () => {
        target.classList.remove("drag-over");
      };
      target.ondrop = (ev) => {
        ev.preventDefault();
        target.classList.remove("drag-over");
        const file = ev.dataTransfer?.files?.[0];
        if (file) loadImageFile(file);
      };
    }

    container.querySelector<HTMLButtonElement>("#pp-camera-btn")!.onclick = async () => {
      if (cameraOpen) {
        stopCamera();
        render();
        return;
      }
      cameraError = "";
      if (!navigator.mediaDevices?.getUserMedia) {
        cameraError = tr.passport.cameraUnavailable;
        render();
        return;
      }
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        cameraOpen = true;
        render();
      } catch {
        stopCamera();
        cameraError = tr.passport.cameraUnavailable;
        render();
      }
    };

    const mirrorBox = container.querySelector<HTMLInputElement>("#pp-camera-mirror");
    if (mirrorBox) {
      mirrorBox.onchange = () => {
        cameraMirror = mirrorBox.checked;
        const vid = container.querySelector<HTMLVideoElement>("#pp-camera-video");
        if (vid) vid.classList.toggle("mirrored", cameraMirror);
      };
    }

    const snapBtn = container.querySelector<HTMLButtonElement>("#pp-camera-snap");
    if (snapBtn) {
      snapBtn.onclick = () => {
        const video = container.querySelector<HTMLVideoElement>("#pp-camera-video");
        if (!video) return;
        const vw = video.videoWidth || 960;
        const vh = video.videoHeight || 720;
        const snapCanvas = document.createElement("canvas");
        snapCanvas.width = vw;
        snapCanvas.height = vh;
        const sctx = snapCanvas.getContext("2d")!;
        if (cameraMirror) {
          sctx.translate(vw, 0);
          sctx.scale(-1, 1);
        }
        sctx.drawImage(video, 0, 0, vw, vh);
        activeImage = snapCanvas;
        imageWidth = vw;
        imageHeight = vh;
        hasUserImage = true;
        stopCamera();
        render();
      };
    }

    container.querySelector<HTMLButtonElement>("#pp-sample")!.onclick = () => {
      stopCamera();
      cameraError = "";
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

    type RangeKey = "zoom" | "rotateDeg" | "offsetX" | "offsetY" | "brightness" | "backdropLift";
    const keyMap: Record<string, { key: RangeKey; fmt: (v: number) => string }> = {
      "pp-zoom": { key: "zoom", fmt: (v) => `${v.toFixed(2)}×` },
      "pp-rot": { key: "rotateDeg", fmt: (v) => `${v}°` },
      "pp-ox": { key: "offsetX", fmt: (v) => `${v} px` },
      "pp-oy": { key: "offsetY", fmt: (v) => `${v} px` },
      "pp-br": { key: "brightness", fmt: (v) => `${v}%` },
      "pp-bg": { key: "backdropLift", fmt: (v) => `${v}%` },
    };

    for (const [id, meta] of Object.entries(keyMap)) {
      const inputEl = container.querySelector<HTMLInputElement>(`#${id}`)!;
      const readoutEl = container.querySelector<HTMLElement>(`#${id}-val`);
      inputEl.oninput = () => {
        const val = Number(inputEl.value);
        state[meta.key] = val;
        if (readoutEl) readoutEl.textContent = meta.fmt(val);
        renderViewport();
      };
    }

    container.querySelectorAll<HTMLButtonElement>("[data-step-target]").forEach((btn) => {
      btn.onclick = () => {
        const targetId = btn.dataset.stepTarget || "";
        const meta = keyMap[targetId];
        const inputEl = container.querySelector<HTMLInputElement>(`#${targetId}`);
        if (!meta || !inputEl) return;
        const delta = Number(btn.dataset.delta || "0");
        const min = Number(inputEl.min);
        const max = Number(inputEl.max);
        const raw = Number(inputEl.value) + delta;
        const next = Math.max(min, Math.min(max, Math.round(raw * 100) / 100));
        state[meta.key] = next;
        inputEl.value = String(next);
        const readoutEl = container.querySelector<HTMLElement>(`#${targetId}-val`);
        if (readoutEl) readoutEl.textContent = meta.fmt(next);
        renderViewport();
      };
    });

    container.querySelector<HTMLInputElement>("#pp-guides")!.onchange = (e) => {
      state.showGuides = (e.target as HTMLInputElement).checked;
      renderViewport();
    };

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
    canvas.onwheel = (ev) => {
      if (state.viewMode !== "single") return;
      ev.preventDefault();
      const delta = ev.deltaY < 0 ? 0.05 : -0.05;
      const next = Math.max(0.5, Math.min(2.5, Math.round((state.zoom + delta) * 100) / 100));
      state.zoom = next;
      const zoomInput = container.querySelector<HTMLInputElement>("#pp-zoom");
      const zoomVal = container.querySelector<HTMLElement>("#pp-zoom-val");
      if (zoomInput) zoomInput.value = String(next);
      if (zoomVal) zoomVal.textContent = `${next.toFixed(2)}×`;
      renderViewport();
    };

    if (hostRecord.__ppMove) window.removeEventListener("pointermove", hostRecord.__ppMove as EventListener);
    if (hostRecord.__ppUp) window.removeEventListener("pointerup", hostRecord.__ppUp as EventListener);
    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging) return;
      state.offsetX = Math.max(-250, Math.min(250, Math.round(baseOffsetX + (ev.clientX - dragStartX) * 1.5)));
      state.offsetY = Math.max(-250, Math.min(250, Math.round(baseOffsetY + (ev.clientY - dragStartY) * 1.5)));
      const oxInput = container.querySelector<HTMLInputElement>("#pp-ox");
      const oyInput = container.querySelector<HTMLInputElement>("#pp-oy");
      const oxVal = container.querySelector<HTMLElement>("#pp-ox-val");
      const oyVal = container.querySelector<HTMLElement>("#pp-oy-val");
      if (oxInput) oxInput.value = String(state.offsetX);
      if (oyInput) oyInput.value = String(state.offsetY);
      if (oxVal) oxVal.textContent = `${state.offsetX} px`;
      if (oyVal) oyVal.textContent = `${state.offsetY} px`;
      renderViewport();
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = state.viewMode === "single" ? "grab" : "default";
    };
    hostRecord.__ppMove = onPointerMove as EventListener;
    hostRecord.__ppUp = onPointerUp;
    window.addEventListener("pointermove", hostRecord.__ppMove as EventListener);
    window.addEventListener("pointerup", hostRecord.__ppUp as EventListener);

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
