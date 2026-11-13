import { mountStudioChrome, type SuiteId } from "./components/chrome.js";
import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "./config/valve.js";
import { mountHub } from "./suites/hub.js";
import { mountPassportPhoto, type PassportPhotoPreset } from "./suites/passport-photo.js";
import { mountPrintablePaper, type PrintablePaperPreset } from "./suites/printable-paper.js";
import { mountSizeConverter, type SizeConverterPreset } from "./suites/size-converter.js";
import { mountVisualSizer, type VisualSizerPreset } from "./suites/visual-sizer.js";
import { decodeStudioState, type StudioStateMap } from "./utils/url-state.js";

const VALID_SUITES = new Set<SuiteId>([
  "hub",
  "visual-sizer",
  "printable-paper",
  "size-converter",
  "passport-photo",
]);

const NUMERIC_KEYS = new Set([
  "bagL",
  "bagW",
  "bagD",
  "bagKg",
  "spacingMm",
  "year",
  "month",
  "usSize",
  "ringDiameterMm",
]);

function resolveSuite(root: HTMLElement): SuiteId {
  const fromDataset = root.dataset.suite as SuiteId | undefined;
  if (fromDataset && VALID_SUITES.has(fromDataset) && fromDataset !== "hub") {
    return fromDataset;
  }
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (path.startsWith("/visual-sizer")) return "visual-sizer";
  if (path.startsWith("/printable-paper")) return "printable-paper";
  if (path.startsWith("/size-converter")) return "size-converter";
  if (path.startsWith("/passport-photo")) return "passport-photo";
  return fromDataset && VALID_SUITES.has(fromDataset) ? fromDataset : "hub";
}

function parsePreset(root: HTMLElement): Record<string, string | number | boolean> {
  const raw = root.dataset.preset;
  let base: Record<string, string | number | boolean> = {};
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        base = { ...(parsed as Record<string, string | number | boolean>) };
      }
    } catch {
      base = {};
    }
  }
  if (typeof window !== "undefined") {
    const queryOverlay = decodeStudioState(window.location.search, window.location.hash);
    for (const [key, val] of Object.entries(queryOverlay)) {
      if (NUMERIC_KEYS.has(key)) {
        const num = Number(val);
        if (val !== "" && Number.isFinite(num)) {
          base[key] = num;
        }
      } else {
        base[key] = val;
      }
    }
  }
  return base;
}

export function bootApp(): void {
  const root = document.getElementById("app");
  if (!root) return;

  const partnerHtml = renderPartnerSlot("header");
  if (partnerHtml && !ECONOMIC_VALVE_OPEN) {
    throw new Error("Closed-valve invariant violated");
  }

  const suite = resolveSuite(root);
  const preset = parsePreset(root);
  const h1 = root.dataset.h1 || "ScaleAndFit — 4-in-1 Sizing, Print & Fit Studio";
  const lead =
    root.dataset.lead ||
    "Precision client-side workspace for visual scaling, vector PDF sheets, millimeter shoe & ring sizing, and biometric 300-DPI photo prep.";

  let shareState: StudioStateMap = {};
  for (const [k, v] of Object.entries(preset)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      shareState[k] = v;
    }
  }

  const studioMount = mountStudioChrome(root, {
    suite,
    h1,
    lead,
    getShareState: () => shareState,
  });

  const handleStateChange = (nextState: StudioStateMap) => {
    shareState = nextState;
  };

  if (suite === "visual-sizer") {
    mountVisualSizer(studioMount, preset as unknown as VisualSizerPreset, handleStateChange);
  } else if (suite === "printable-paper") {
    mountPrintablePaper(studioMount, preset as unknown as PrintablePaperPreset, handleStateChange);
  } else if (suite === "size-converter") {
    mountSizeConverter(studioMount, preset as unknown as SizeConverterPreset, handleStateChange);
  } else if (suite === "passport-photo") {
    mountPassportPhoto(studioMount, preset as unknown as PassportPhotoPreset, handleStateChange);
  } else {
    mountHub(studioMount);
  }

  root.dataset.ready = "true";
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  bootApp();
}
