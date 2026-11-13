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
  { path: "/printable-paper/avery-5160-address-label-template-pdf/", suite: "printable-paper", h1: "Avery 5160 Address Label PDF" },
  { path: "/size-converter/", suite: "size-converter", h1: "Shoe Brand & Credit-Card Ring Sizer" },
  { path: "/size-converter/nike-to-adidas-shoe-size/", suite: "size-converter", h1: "Nike to Adidas Shoe Size Converter" },
  { path: "/size-converter/us-to-eu-ring-size-converter/", suite: "size-converter", h1: "US to EU Ring Size Chart" },
  { path: "/passport-photo/", suite: "passport-photo", h1: "Biometric Passport & 4x6 Print Sheet Studio" },
  { path: "/passport-photo/us-passport-photo-2x2/", suite: "passport-photo", h1: "US 2x2 Passport Photo Studio" },
  { path: "/passport-photo/schengen-visa-35x45/", suite: "passport-photo", h1: "Schengen 35x45mm Visa Photo Studio" },
];

const NAV_ITEMS: Array<{ id: SuiteId; label: string; href: string }> = [
  { id: "hub", label: "Studio Hub", href: "/" },
  { id: "visual-sizer", label: "Visual Sizer", href: "/visual-sizer/" },
  { id: "printable-paper", label: "Paper & Avery", href: "/printable-paper/" },
  { id: "size-converter", label: "Shoe & Ring Fit", href: "/size-converter/" },
  { id: "passport-photo", label: "Passport Photo", href: "/passport-photo/" },
];

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
    return window.localStorage.getItem("sf-theme") || "";
  } catch {
    return "";
  }
}

function saveTheme(theme: string): void {
  try {
    if (theme) {
      window.localStorage.setItem("sf-theme", theme);
    } else {
      window.localStorage.removeItem("sf-theme");
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function applyTheme(theme: string): void {
  if (theme === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    delete document.documentElement.dataset.theme;
  }
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
    return `<a class="nav-pill${active}" href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join("");

  appRoot.innerHTML = `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/">
          <span class="brand-mark">SF</span>
          <span>ScaleAndFit</span>
        </a>
        <nav class="nav-links" aria-label="Studio modules">
          ${navHtml}
        </nav>
        <div class="header-actions">
          <button class="search-trigger" id="chrome-search-btn" type="button">
            Search <span class="kbd">Ctrl+K</span>
          </button>
          <button class="icon-btn" id="chrome-share-btn" type="button">Share Link</button>
          <button class="icon-btn" id="chrome-theme-btn" type="button" aria-label="Toggle color theme">Theme</button>
        </div>
      </div>
      ${headerPartner}
    </header>
    <main class="container">
      <div class="trust-strip" aria-label="Studio guarantees">
        <span class="trust-badge">100% Local Browser Execution</span>
        <span class="trust-badge">300-DPI Vector &amp; Canvas</span>
        <span class="trust-badge">Millimeter-Calibrated</span>
      </div>
      <section class="hero">
        <h1>${escapeHtml(options.h1)}</h1>
        <p>${escapeHtml(options.lead)}</p>
      </section>
      <div id="studio-mount"></div>
    </main>
  `;

  let footerHost = document.getElementById("site-footer-mount");
  if (!footerHost) {
    footerHost = document.createElement("div");
    footerHost.id = "site-footer-mount";
    document.body.appendChild(footerHost);
  }
  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>ScaleAndFit.com</strong> — Client-side visual scale, vector PDF engineering paper, Mondopoint footwear &amp; ring fit, and 300-DPI biometric photo processing.
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px">
          <a href="/visual-sizer/">Visual Sizer</a>
          <a href="/printable-paper/">Paper Studio</a>
          <a href="/size-converter/">Size Converter</a>
          <a href="/passport-photo/">Passport Photo</a>
          <a href="/sitemap.xml">Sitemap</a>
          <a href="/llms.txt">llms.txt</a>
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
        <strong>Jump to Calculator, Spec or Template</strong>
        <button class="icon-btn" id="sf-palette-close" type="button">Esc</button>
      </div>
      <div class="field">
        <label for="sf-palette-input" style="position:absolute;left:-9999px">Search routes</label>
        <input id="sf-palette-input" type="search" placeholder="Search TVs, Ryanair, Avery 5160, Nike, Belgium passport..." autocomplete="off" />
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
              `<a class="palette-item" href="${escapeHtml(r.path)}"><span>${escapeHtml(r.h1)}</span><span class="status-pill">${escapeHtml(r.suite)}</span></a>`
          )
          .join("")
      : `<div style="padding:10px;color:var(--muted)">No matching routes found.</div>`;
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

  appRoot.querySelector<HTMLButtonElement>("#chrome-theme-btn")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "" : "light";
    applyTheme(next);
    saveTheme(next);
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
    const oldLabel = shareBtn.textContent || "Share Link";
    shareBtn.textContent = "Copied Link!";
    window.setTimeout(() => {
      shareBtn.textContent = oldLabel;
    }, 1800);
  });

  return appRoot.querySelector<HTMLElement>("#studio-mount")!;
}
