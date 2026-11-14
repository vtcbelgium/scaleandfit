import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "../config/valve.js";
import {
  LOCALES,
  escapeHtml,
  localizePath,
  saveLang,
  stripLocalePrefix,
  t,
  type InfoPageId,
  type LocaleCode,
} from "../i18n/index.js";
import { buildShareUrl, type StudioStateMap } from "../utils/url-state.js";

export type SuiteId =
  | "hub"
  | "visual-sizer"
  | "printable-paper"
  | "size-converter"
  | "passport-photo"
  | "info";

export interface ChromeMountOptions {
  suite: SuiteId;
  lang: LocaleCode;
  infoPage?: InfoPageId;
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

const ICON_BRAND = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 13.5V2.5h11"/><path d="M5.5 2.5v2.2M8.5 2.5v1.6M11.5 2.5v2.2M2.5 5.5h2.2M2.5 8.5h1.6M2.5 11.5h2.2"/><rect x="6.5" y="6.5" width="7" height="5.5" stroke="#0F52BA" stroke-width="1.5"/></svg>`;
const ICON_SEARCH = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.7 10.7L14 14"/></svg>`;
const ICON_LINK = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6.5 9.5l3-3"/><path d="M8.5 11.5l-1.3 1.3a2.8 2.8 0 0 1-4-4L4.5 7.5"/><path d="M7.5 4.5l1.3-1.3a2.8 2.8 0 0 1 4 4L11.5 8.5"/></svg>`;
const ICON_MOON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13.2 9.9A5.5 5.5 0 0 1 6.1 2.8a5.6 5.6 0 1 0 7.1 7.1z"/></svg>`;
const ICON_SUN = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"/></svg>`;

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

function updateThemeButton(btn: HTMLButtonElement | null, lang: LocaleCode): void {
  if (!btn) return;
  const tr = t(lang);
  const isDark = document.documentElement.dataset.theme === "dark";
  btn.innerHTML = isDark
    ? `${ICON_SUN}<span>${escapeHtml(tr.nav.themeDaylight)}</span>`
    : `${ICON_MOON}<span>${escapeHtml(tr.nav.themeCarbon)}</span>`;
  btn.setAttribute("aria-pressed", isDark ? "true" : "false");
}

export function renderFooterHtml(lang: LocaleCode, currentEnPath: string, footerPartner = ""): string {
  const tr = t(lang);
  const f = tr.footer;
  const langLinksHtml = LOCALES.map((loc) => {
    const href = localizePath(currentEnPath, loc.code);
    const cls = loc.code === lang ? ' class="active-lang"' : "";
    return `<a href="${escapeHtml(href)}" hreflang="${loc.code}"${cls}>${escapeHtml(loc.nativeName)}</a>`;
  }).join("");

  return `
    <footer class="site-footer">
      <div class="footer-grid-4">
        <div>
          <p class="footer-col-title">ScaleAndFit.com</p>
          <p style="margin:0 0 10px;max-width:44ch">${escapeHtml(f.tagline)}</p>
          <span class="spec-tag">${escapeHtml(f.trustBadge)}</span>
        </div>
        <div>
          <p class="footer-col-title">${escapeHtml(f.colTools)}</p>
          <div class="footer-links">
            <a href="${escapeHtml(localizePath("/visual-sizer/", lang))}">${escapeHtml(tr.nav.visualSizer)}</a>
            <a href="${escapeHtml(localizePath("/printable-paper/", lang))}">${escapeHtml(tr.nav.printablePaper)}</a>
            <a href="${escapeHtml(localizePath("/size-converter/", lang))}">${escapeHtml(tr.nav.sizeConverter)}</a>
            <a href="${escapeHtml(localizePath("/passport-photo/", lang))}">${escapeHtml(tr.nav.passportPhoto)}</a>
          </div>
        </div>
        <div>
          <p class="footer-col-title">${escapeHtml(f.colGuides)}</p>
          <div class="footer-links">
            <a href="${escapeHtml(localizePath("/guides/", lang))}">${escapeHtml(f.links.guides)}</a>
            <a href="${escapeHtml(localizePath("/about/", lang))}">${escapeHtml(f.links.about)}</a>
            <a href="/sitemap.xml">${escapeHtml(f.links.sitemap)}</a>
            <a href="/llms.txt">${escapeHtml(f.links.llms)}</a>
          </div>
        </div>
        <div>
          <p class="footer-col-title">${escapeHtml(f.colLegal)}</p>
          <div class="footer-links">
            <a href="${escapeHtml(localizePath("/privacy/", lang))}">${escapeHtml(f.links.privacy)}</a>
            <a href="${escapeHtml(localizePath("/terms/", lang))}">${escapeHtml(f.links.terms)}</a>
            <a href="${escapeHtml(localizePath("/cookies/", lang))}">${escapeHtml(f.links.cookies)}</a>
            <a href="${escapeHtml(localizePath("/contact/", lang))}">${escapeHtml(f.links.contact)}</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>${escapeHtml(f.copyright)}</span>
        <div class="footer-lang-links" aria-label="${escapeHtml(f.languageLabel)}">
          <span class="section-kicker">${escapeHtml(f.languageLabel)}:</span>
          ${langLinksHtml}
        </div>
      </div>
      ${footerPartner}
    </footer>
  `;
}

export function mountStudioChrome(appRoot: HTMLElement, options: ChromeMountOptions): HTMLElement {
  const headerPartner = renderPartnerSlot("header");
  const footerPartner = renderPartnerSlot("footer");
  if ((headerPartner || footerPartner) && !ECONOMIC_VALVE_OPEN) {
    throw new Error("Closed-valve invariant violated");
  }

  const lang = options.lang;
  const tr = t(lang);
  applyTheme(readSavedTheme());
  document.documentElement.lang = lang;

  const navItems: Array<{ id: string; label: string; href: string }> = [
    { id: "hub", label: tr.nav.overview, href: localizePath("/", lang) },
    { id: "visual-sizer", label: tr.nav.visualSizer, href: localizePath("/visual-sizer/", lang) },
    { id: "printable-paper", label: tr.nav.printablePaper, href: localizePath("/printable-paper/", lang) },
    { id: "size-converter", label: tr.nav.sizeConverter, href: localizePath("/size-converter/", lang) },
    { id: "passport-photo", label: tr.nav.passportPhoto, href: localizePath("/passport-photo/", lang) },
    { id: "guides", label: tr.nav.guides, href: localizePath("/guides/", lang) },
  ];

  const navHtml = navItems
    .map((item) => {
      const isGuidesActive = options.suite === "info" && options.infoPage === "guides" && item.id === "guides";
      const isSuiteActive = item.id === options.suite;
      const active = isGuidesActive || isSuiteActive ? " active" : "";
      return `<a class="nav-link${active}" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  let specLabel = "SCALEANDFIT · LOCAL STUDIO";
  let crumbTrail = `<a href="${escapeHtml(localizePath("/", lang))}">ScaleAndFit</a>`;
  if (options.suite === "info" && options.infoPage) {
    const infoLabel = tr.info[options.infoPage].h1;
    crumbTrail += ` <span>/</span> <span>${escapeHtml(infoLabel)}</span>`;
    specLabel = tr.footer.links[options.infoPage].toUpperCase();
  } else if (options.suite !== "hub" && options.suite !== "info") {
    const sMeta = tr.suites[options.suite];
    crumbTrail += ` <span>/</span> <a href="${escapeHtml(localizePath(`/${options.suite}/`, lang))}">${escapeHtml(sMeta.name)}</a>`;
    specLabel = sMeta.spec;
  } else {
    crumbTrail += ` <span>/</span> <span>${escapeHtml(tr.nav.overview)}</span>`;
    specLabel = "EN · NL · FR · DE · ES";
  }

  const langOptions = LOCALES.map(
    (loc) =>
      `<option value="${loc.code}" ${loc.code === lang ? "selected" : ""}>${escapeHtml(loc.nativeName)} (${loc.code.toUpperCase()})</option>`
  ).join("");

  const rawPathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const currentEnPath = stripLocalePrefix(rawPathname);

  appRoot.innerHTML = `
    <a class="skip-link" href="#studio-mount">${escapeHtml(tr.nav.skipToMain)}</a>
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="${escapeHtml(localizePath("/", lang))}">
          <span class="brand-mark">${ICON_BRAND}</span>
          <span>ScaleAndFit</span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          ${navHtml}
        </nav>
        <div class="header-actions">
          <button class="search-trigger" id="chrome-search-btn" type="button" aria-label="${escapeHtml(tr.nav.searchBtn)}">
            <span class="search-trigger-left">${ICON_SEARCH}<span>${escapeHtml(tr.nav.searchBtn)}</span></span>
            <kbd class="kbd">Ctrl K</kbd>
          </button>
          <select class="lang-select" id="chrome-lang-select" aria-label="${escapeHtml(tr.nav.langLabel)}">${langOptions}</select>
          <button class="action-btn" id="chrome-share-btn" type="button">${ICON_LINK}<span>${escapeHtml(tr.nav.shareBtn)}</span></button>
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
        <div class="masthead-spec">${escapeHtml(specLabel)}</div>
      </header>
      <div id="studio-mount" tabindex="-1"></div>
    </main>
  `;

  updateThemeButton(appRoot.querySelector<HTMLButtonElement>("#chrome-theme-btn"), lang);

  let footerHost = document.getElementById("site-footer-mount");
  if (!footerHost) {
    footerHost = document.createElement("div");
    footerHost.id = "site-footer-mount";
    document.body.appendChild(footerHost);
  }
  footerHost.innerHTML = renderFooterHtml(lang, currentEnPath, footerPartner);

  const langSelect = appRoot.querySelector<HTMLSelectElement>("#chrome-lang-select");
  langSelect?.addEventListener("change", () => {
    const nextLang = langSelect.value as LocaleCode;
    saveLang(nextLang);
    const targetUrl =
      localizePath(currentEnPath, nextLang) +
      (typeof window !== "undefined" ? window.location.search + window.location.hash : "");
    window.location.assign(targetUrl);
  });

  let palette = document.getElementById("sf-palette") as HTMLDialogElement | null;
  if (!palette) {
    palette = document.createElement("dialog");
    palette.id = "sf-palette";
    palette.className = "palette-modal";
    document.body.appendChild(palette);
  }
  palette.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
      <span class="section-kicker">${escapeHtml(tr.nav.searchModalTitle)}</span>
      <button class="action-btn btn-sm" id="sf-palette-close" type="button">${escapeHtml(tr.nav.closeEsc)}</button>
    </div>
    <div class="field">
      <label for="sf-palette-input" style="position:absolute;left:-9999px">${escapeHtml(tr.nav.searchBtn)}</label>
      <input id="sf-palette-input" type="search" placeholder="${escapeHtml(tr.nav.searchModalInput)}" autocomplete="off" />
    </div>
    <div class="palette-results" id="sf-palette-results"></div>
  `;

  let cachedRoutes: RouteIndexItem[] | null = null;
  const input = palette.querySelector<HTMLInputElement>("#sf-palette-input")!;
  const resultsEl = palette.querySelector<HTMLElement>("#sf-palette-results")!;

  const renderPaletteResults = (query: string) => {
    const items =
      cachedRoutes ||
      FALLBACK_ROUTES.map((r) => ({ ...r, path: localizePath(r.path, lang) }));
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
      : `<div style="padding:12px;color:var(--muted);font-size:.88rem">${escapeHtml(tr.nav.searchNoResults)}</div>`;
  };

  const openPalette = async () => {
    if (!cachedRoutes) {
      const indexUrl = lang === "en" ? "/route-index.json" : `/route-index.${lang}.json`;
      try {
        let res = await fetch(indexUrl);
        if (!res.ok && lang !== "en") res = await fetch("/route-index.json");
        if (res.ok) {
          const parsed = (await res.json()) as RouteIndexItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedRoutes = parsed;
          }
        }
      } catch {
        cachedRoutes = null;
      }
      if (!cachedRoutes) {
        cachedRoutes = FALLBACK_ROUTES.map((r) => ({ ...r, path: localizePath(r.path, lang) }));
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
    updateThemeButton(themeBtn, lang);
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
    shareBtn.innerHTML = `${ICON_LINK}<span>${escapeHtml(tr.nav.shareCopied)}</span>`;
    window.setTimeout(() => {
      shareBtn.innerHTML = `${ICON_LINK}<span>${escapeHtml(tr.nav.shareBtn)}</span>`;
    }, 1800);
  });

  return appRoot.querySelector<HTMLElement>("#studio-mount")!;
}
