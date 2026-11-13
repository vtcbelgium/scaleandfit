import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "../config/valve.js";
import { buildShareUrl, type StudioStateMap } from "../utils/url-state.js";

export type SuiteId =
  | "hub"
  | "visual-sizer"
  | "printable-paper"
  | "size-converter"
  | "passport-photo";

export interface ChromeMountOptions {
  suite: SuiteId;
  h1: string;
  lead: string;
  getShareState?: () => StudioStateMap;
}

interface RouteIndexItem {
  path: string;
  suite: string;
  h1: string;
  title?: string;
}

const FALLBACK_ROUTES: RouteIndexItem[] = [
  { path: "/visual-sizer/", suite: "visual-sizer", h1: "Visual TV, Bag & Mattress Sizer" },
  { path: "/visual-sizer/55-vs-65-inch-tv/", suite: "visual-sizer", h1: '55" vs 65" TV Size Comparison' },
  { path: "/visual-sizer/ryanair-carry-on-size/", suite: "visual-sizer", h1: "Ryanair Carry-On Bag Sizer" },
  { path: "/printable-paper/", suite: "printable-paper", h1: "Printable Vector Paper, Calendars & Avery Studio" },
  { path: "/printable-paper/5mm-dot-grid-a4/", suite: "printable-paper", h1: "5mm Dot Grid Paper (A4)" },
  { path: "/printable-paper/avery-5160-template-pdf/", suite: "printable-paper", h1: "Avery 5160 Address Label PDF" },
  { path: "/size-converter/", suite: "size-converter", h1: "Shoe Brand & Credit-Card Ring Sizer" },
  { path: "/size-converter/nike-to-adidas-shoe-size/", suite: "size-converter", h1: "Nike to Adidas Shoe Size Converter" },
  { path: "/size-converter/us-to-eu-ring-size-converter/", suite: "size-converter", h1: "US to EU Ring Size Chart" },
  { path: "/passport-photo/", suite: "passport-photo", h1: "Biometric Passport & 4x6 Print Sheet Studio" },
  { path: "/passport-photo/us-passport-photo-2x2/", suite: "passport-photo", h1: "US 2x2 Passport Photo Studio" },
  { path: "/passport-photo/schengen-visa-35x45/", suite: "passport-photo", h1: "Schengen 35x45mm Visa Photo Studio" },
];

const NAV_ITEMS: Array<{ id: SuiteId; label: string; href: string }> = [
  { id: "hub", label: "Overview", href: "/" },
  { id: "visual-sizer", label: "Visual Sizer", href: "/visual-sizer/" },
  { id: "printable-paper", label: "Paper & Avery", href: "/printable-paper/" },
  { id: "size-converter", label: "Shoe & Ring Fit", href: "/size-converter/" },
  { id: "passport-photo", label: "Passport Photo", href: "/passport-photo/" },
];

const SUITE_SPECS: Record<SuiteId, { crumb: string; spec: string }> = {
  hub: { crumb: "Workspace", spec: "213 CALIBRATED ROUTES · LOCAL ENGINE" },
  "visual-sizer": { crumb: "01 · Visual Sizer", spec: "TRUE-TO-SCALE SVG · 34 AIRLINES" },
  "printable-paper": { crumb: "02 · Paper & Avery", spec: "72 PT/IN VECTOR PDF · ISO / US" },
  "size-converter": { crumb: "03 · Shoe & Ring Fit", spec: "MONDOPOINT MM · ISO 7810 ID-1" },
  "passport-photo": { crumb: "04 · Passport Photo", spec: "ICAO 9303 · 300 DPI CANVAS" },
};

const ICON_BRAND = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 13.5V2.5h11"/><path d="M5.5 2.5v2.2M8.5 2.5v1.6M11.5 2.5v2.2M2.5 5.5h2.2M2.5 8.5h1.6M2.5 11.5h2.2"/><rect x="6.5" y="6.5" width="7" height="5.5" stroke="#0F52BA" stroke-width="1.5"/></svg>`;
const ICON_SEARCH = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.7 10.7L14 14"/></svg>`;
const ICON_LINK = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6.5 9.5l3-3"/><path d="M8.5 11.5l-1.3 1.3a2.8 2.8 0 0 1-4-4L4.5 7.5"/><path d="M7.5 4.5l1.3-1.3a2.8 2.8 0 0 1 4 4L11.5 8.5"/></svg>`;
const ICON_MOON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13.2 9.9A5.5 5.5 0 0 1 6.1 2.8a5.6 5.6 0 1 0 7.1 7.1z"/></svg>`;
const ICON_SUN = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg>`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readSavedTheme(): string {
  try {
    return window.localStorage.getItem("sf-theme") === "dark" ? "dark" : "";
  } catch {
    return "";
  }
}

function saveTheme(theme: string): void {
  try {
    if (theme === "dark") {
      window.localStorage.setItem("sf-theme", "dark");
    } else {
      window.localStorage.removeItem("sf-theme");
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function applyTheme(theme: string): void {
  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function updateThemeButton(btn: HTMLButtonElement | null): void {
  if (!btn) return;
  const isDark = document.documentElement.dataset.theme === "dark";
  btn.innerHTML = isDark ? `${ICON_SUN}<span>Daylight</span>` : `${ICON_MOON}<span>Carbon</span>`;
  btn.setAttribute("aria-pressed", isDark ? "true" : "false");
}

export function mountStudioChrome(
  appRoot: HTMLElement,
  options: ChromeMountOptions
): HTMLElement {
  const headerPartner = renderPartnerSlot("header");
  const footerPartner = renderPartnerSlot("footer");
  if ((headerPartner || footerPartner) && !ECONOMIC_VALVE_OPEN) {
    throw new Error("Closed-valve invariant violated");
  }

  applyTheme(readSavedTheme());

  const navHtml = NAV_ITEMS.map((item) => {
    const active = item.id === options.suite ? " active" : "";
    return `<a class="nav-link${active}" href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join("");

  const suiteMeta = SUITE_SPECS[options.suite] || SUITE_SPECS.hub;
  const crumbTrail =
    options.suite === "hub"
      ? `<a href="/">ScaleAndFit</a> <span>/</span> <span>${escapeHtml(suiteMeta.crumb)}</span>`
      : `<a href="/">ScaleAndFit</a> <span>/</span> <a href="/${options.suite}/">${escapeHtml(suiteMeta.crumb)}</a>`;

  appRoot.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/">
          <span class="brand-mark">${ICON_BRAND}</span>
          <span>ScaleAndFit</span>
          <span class="brand-meta">Precision</span>
        </a>
        <nav class="nav-links" aria-label="Studio modules">
          ${navHtml}
        </nav>
        <div class="header-actions">
          <button class="search-trigger" id="chrome-search-btn" type="button">
            <span class="search-trigger-left">${ICON_SEARCH}<span>Quick Jump</span></span>
            <kbd class="kbd">Ctrl K</kbd>
          </button>
          <button class="action-btn" id="chrome-share-btn" type="button">${ICON_LINK}<span>Share</span></button>
          <button class="action-btn" id="chrome-theme-btn" type="button" aria-label="Toggle color theme"></button>
        </div>
      </div>
      ${headerPartner}
    </header>
    <main class="container">
      <header class="masthead">
        <div class="masthead-main">
          <nav class="breadcrumb" aria-label="Breadcrumb">${crumbTrail}</nav>
          <h1>${escapeHtml(options.h1)}</h1>
          <p class="masthead-lead">${escapeHtml(options.lead)}</p>
        </div>
        <div class="masthead-spec">${escapeHtml(suiteMeta.spec)}</div>
      </header>
      <div id="studio-mount"></div>
    </main>
  `;

  updateThemeButton(appRoot.querySelector<HTMLButtonElement>("#chrome-theme-btn"));

  let footerHost = document.getElementById("site-footer-mount");
  if (!footerHost) {
    footerHost = document.createElement("div");
    footerHost.id = "site-footer-mount";
    document.body.appendChild(footerHost);
  }
  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <p class="footer-col-title">ScaleAndFit.com // Metrology</p>
          <p style="margin:0 0 8px;max-width:46ch">
            Client-side precision workbench for proportional display &amp; luggage geometry, 72 pt/in vector PDF sheets, Mondopoint shoe &amp; ring sizing, and 300-DPI ICAO portrait framing.
          </p>
          <span class="spec-tag">Local Browser Execution · Zero Telemetry</span>
        </div>
        <div>
          <p class="footer-col-title">Instruments</p>
          <div class="footer-links">
            <a href="/visual-sizer/">01 · Visual Sizer (Screens, Bags, Beds)</a>
            <a href="/printable-paper/">02 · Printable Paper, Calendars &amp; Avery</a>
            <a href="/size-converter/">03 · Mondopoint Shoe &amp; Ring Sizer</a>
            <a href="/passport-photo/">04 · Biometric Passport &amp; 4×6 Sheet</a>
          </div>
        </div>
        <div>
          <p class="footer-col-title">Indexes &amp; Machine Spec</p>
          <div class="footer-links">
            <a href="/sitemap.xml">XML Sitemap (213 URLs)</a>
            <a href="/llms.txt">llms.txt Summary</a>
            <a href="/llms-full.txt">llms-full.txt Complete Catalog</a>
            <a href="/route-index.json">route-index.json</a>
          </div>
        </div>
      </div>
      ${footerPartner}
    </footer>
  `;

  let palette = document.getElementById("sf-palette") as HTMLDialogElement | null;
  if (!palette) {
    palette = document.createElement("dialog");
    palette.id = "sf-palette";
    palette.className = "palette-modal";
    palette.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
        <span class="section-kicker">Quick Jump // 213 Calibrated Routes</span>
        <button class="action-btn btn-sm" id="sf-palette-close" type="button">Esc</button>
      </div>
      <div class="field">
        <label for="sf-palette-input" style="position:absolute;left:-9999px">Search routes</label>
        <input id="sf-palette-input" type="search" placeholder="Filter TVs, Ryanair, Avery 5160, Nike, Belgium passport..." autocomplete="off" />
      </div>
      <div class="palette-results" id="sf-palette-results"></div>
    `;
    document.body.appendChild(palette);
  }

  let cachedRoutes: RouteIndexItem[] | null = null;
  const input = palette.querySelector<HTMLInputElement>("#sf-palette-input")!;
  const resultsEl = palette.querySelector<HTMLElement>("#sf-palette-results")!;

  const renderPaletteResults = (query: string) => {
    const items = cachedRoutes || FALLBACK_ROUTES;
    const q = query.trim().toLowerCase();
    const filtered = (
      q
        ? items.filter(
            (r) =>
              r.h1.toLowerCase().includes(q) ||
              r.path.toLowerCase().includes(q) ||
              r.suite.toLowerCase().includes(q)
          )
        : items
    ).slice(0, 24);
    resultsEl.innerHTML = filtered.length
      ? filtered
          .map(
            (r) =>
              `<a class="palette-item" href="${escapeHtml(r.path)}"><span><strong>${escapeHtml(r.h1)}</strong><span style="display:block;font-family:var(--font-mono);font-size:.72rem;color:var(--muted)">${escapeHtml(r.path)}</span></span><span class="spec-tag">${escapeHtml(r.suite)}</span></a>`
          )
          .join("")
      : `<div style="padding:12px;color:var(--muted);font-size:.86rem">No matching routes found.</div>`;
  };

  const openPalette = async () => {
    if (!cachedRoutes) {
      try {
        const res = await fetch("/route-index.json");
        if (res.ok) {
          const parsed = (await res.json()) as RouteIndexItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedRoutes = parsed;
          }
        }
      } catch {
        cachedRoutes = FALLBACK_ROUTES;
      }
      if (!cachedRoutes) {
        cachedRoutes = FALLBACK_ROUTES;
      }
    }
    renderPaletteResults(input.value);
    if (typeof palette!.showModal === "function") {
      try {
        if (!palette!.open) palette!.showModal();
      } catch {
        palette!.setAttribute("open", "true");
      }
    } else {
      palette!.setAttribute("open", "true");
    }
    input.focus();
  };

  const closePalette = () => {
    if (typeof palette!.close === "function") {
      try {
        if (palette!.open) palette!.close();
      } catch {
        palette!.removeAttribute("open");
      }
    } else {
      palette!.removeAttribute("open");
    }
  };

  input.oninput = () => renderPaletteResults(input.value);
  palette.querySelector<HTMLButtonElement>("#sf-palette-close")?.addEventListener("click", closePalette);
  palette.addEventListener("click", (ev) => {
    if (ev.target === palette) closePalette();
  });

  appRoot.querySelector<HTMLButtonElement>("#chrome-search-btn")?.addEventListener("click", () => {
    void openPalette();
  });

  const onOpenSearch = () => {
    void openPalette();
  };
  const onKeyDown = (ev: KeyboardEvent) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      void openPalette();
    } else if (ev.key === "Escape") {
      closePalette();
    }
  };
  const prevOpenHandler = (window as unknown as Record<string, unknown>).__sfOpenSearch as
    | EventListener
    | undefined;
  const prevKeyHandler = (window as unknown as Record<string, unknown>).__sfKeyHandler as
    | EventListener
    | undefined;
  if (prevOpenHandler) window.removeEventListener("scaleandfit:open-search", prevOpenHandler);
  if (prevKeyHandler) window.removeEventListener("keydown", prevKeyHandler);
  (window as unknown as Record<string, unknown>).__sfOpenSearch = onOpenSearch;
  (window as unknown as Record<string, unknown>).__sfKeyHandler = onKeyDown as EventListener;
  window.addEventListener("scaleandfit:open-search", onOpenSearch);
  window.addEventListener("keydown", onKeyDown);

  const themeBtn = appRoot.querySelector<HTMLButtonElement>("#chrome-theme-btn");
  themeBtn?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "" : "dark";
    applyTheme(next);
    saveTheme(next);
    updateThemeButton(themeBtn);
  });

  const shareBtn = appRoot.querySelector<HTMLButtonElement>("#chrome-share-btn");
  shareBtn?.addEventListener("click", async () => {
    const originPath = window.location.origin + window.location.pathname;
    const shareState = options.getShareState ? options.getShareState() : {};
    const url = buildShareUrl(originPath, shareState);
    try {
      window.history.replaceState(null, "", url);
    } catch {
      // Ignore history restrictions in synthetic origins
    }
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Ignore clipboard permissions errors
    }
    shareBtn.innerHTML = `${ICON_LINK}<span>Copied</span>`;
    window.setTimeout(() => {
      shareBtn.innerHTML = `${ICON_LINK}<span>Share</span>`;
    }, 1800);
  });

  return appRoot.querySelector<HTMLElement>("#studio-mount")!;
}
