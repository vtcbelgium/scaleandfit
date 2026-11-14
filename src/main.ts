import { mountStudioChrome, type SuiteId } from "./components/chrome.js";
import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "./config/valve.js";
import {
  detectLocale,
  isInfoPageId,
  stripLocalePrefix,
  t,
  type InfoPageId,
  type LocaleCode,
} from "./i18n/index.js";
import { mountHub } from "./suites/hub.js";
import { mountInfoPage } from "./suites/info-page.js";
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
  "info",
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

function resolveInfoPage(root: HTMLElement, strippedPath: string): InfoPageId | undefined {
  const fromDataset = root.dataset.page;
  if (isInfoPageId(fromDataset)) return fromDataset;
  const seg = strippedPath.replace(/^\/+|\/+$/g, "").split("/")[0];
  return isInfoPageId(seg) ? seg : undefined;
}

function resolveSuite(root: HTMLElement): { suite: SuiteId; infoPage?: InfoPageId } {
  const rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const strippedPath = stripLocalePrefix(rawPath);
  const detectedPage = resolveInfoPage(root, strippedPath);

  const fromDataset = root.dataset.suite as SuiteId | undefined;
  if (fromDataset && VALID_SUITES.has(fromDataset) && fromDataset !== "hub") {
    return { suite: fromDataset, infoPage: detectedPage };
  }

  if (detectedPage) return { suite: "info", infoPage: detectedPage };
  if (strippedPath.startsWith("/visual-sizer")) return { suite: "visual-sizer" };
  if (strippedPath.startsWith("/printable-paper")) return { suite: "printable-paper" };
  if (strippedPath.startsWith("/size-converter")) return { suite: "size-converter" };
  if (strippedPath.startsWith("/passport-photo")) return { suite: "passport-photo" };

  return {
    suite: fromDataset && VALID_SUITES.has(fromDataset) ? fromDataset : "hub",
  };
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

function defaultHeading(
  suite: SuiteId,
  lang: LocaleCode,
  infoPage?: InfoPageId
): { h1: string; lead: string } {
  const tr = t(lang);
  if (suite === "info" && infoPage) {
    return { h1: tr.info[infoPage].h1, lead: tr.info[infoPage].lead };
  }
  if (suite !== "hub" && suite !== "info") {
    return { h1: tr.suites[suite].h1, lead: tr.suites[suite].lead };
  }
  return { h1: tr.hub.h1, lead: tr.hub.lead };
}

export function bootApp(): void {
  const root = document.getElementById("app");
  if (!root) return;

  const partnerHtml = renderPartnerSlot("header");
  if (partnerHtml && !ECONOMIC_VALVE_OPEN) {
    throw new Error("Closed-valve invariant violated");
  }

  const lang = detectLocale(root);
  const { suite, infoPage } = resolveSuite(root);
  const preset = parsePreset(root);
  const defaults = defaultHeading(suite, lang, infoPage);
  const h1 = root.dataset.h1 || defaults.h1;
  const lead = root.dataset.lead || defaults.lead;

  let shareState: StudioStateMap = {};
  for (const [k, v] of Object.entries(preset)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      shareState[k] = v;
    }
  }

  const studioMount = mountStudioChrome(root, {
    suite,
    lang,
    infoPage,
    h1,
    lead,
    getShareState: () => shareState,
  });

  const handleStateChange = (nextState: StudioStateMap) => {
    shareState = nextState;
  };

  if (suite === "info" && infoPage) {
    mountInfoPage(studioMount, infoPage, lang);
  } else if (suite === "visual-sizer") {
    mountVisualSizer(studioMount, preset as unknown as VisualSizerPreset, handleStateChange, lang);
  } else if (suite === "printable-paper") {
    mountPrintablePaper(studioMount, preset as unknown as PrintablePaperPreset, handleStateChange, lang);
  } else if (suite === "size-converter") {
    mountSizeConverter(studioMount, preset as unknown as SizeConverterPreset, handleStateChange, lang);
  } else if (suite === "passport-photo") {
    mountPassportPhoto(studioMount, preset as unknown as PassportPhotoPreset, handleStateChange, lang);
  } else {
    mountHub(studioMount, lang);
  }

  root.dataset.ready = "true";
}

if (typeof document !== "undefined" && document.getElementById("app")) {
  bootApp();
}
