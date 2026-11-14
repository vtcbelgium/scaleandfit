import { escapeHtml, localizePath, t, type LocaleCode } from "../i18n/index.js";

interface HubRouteItem {
  path: string;
  suite: string;
  h1: string;
}

const FALLBACK_HUB_ROUTES: HubRouteItem[] = [
  { path: "/visual-sizer/55-vs-65-inch-tv/", suite: "visual-sizer", h1: '55" vs 65" TV Size Comparison' },
  { path: "/visual-sizer/ryanair-carry-on-size/", suite: "visual-sizer", h1: "Ryanair Carry-On Bag Sizer" },
  { path: "/visual-sizer/queen-vs-king-mattress/", suite: "visual-sizer", h1: "US Queen vs King Mattress Size" },
  { path: "/printable-paper/5mm-dot-grid-a4/", suite: "printable-paper", h1: "5mm Dot Grid Paper A4 PDF" },
  { path: "/printable-paper/2026-united-states-holiday-calendar-pdf/", suite: "printable-paper", h1: "2026 United States Holiday Calendar PDF" },
  { path: "/printable-paper/avery-5160-template-pdf/", suite: "printable-paper", h1: "Avery 5160 Address Labels PDF" },
  { path: "/size-converter/nike-to-adidas-shoe-size/", suite: "size-converter", h1: "Nike to Adidas Shoe Size Converter" },
  { path: "/size-converter/credit-card-ring-sizer-online/", suite: "size-converter", h1: "Credit Card Calibrated Ring Sizer" },
  { path: "/passport-photo/us-passport-photo-2x2/", suite: "passport-photo", h1: 'United States 2×2" Passport Photo' },
  { path: "/passport-photo/schengen-visa-35x45/", suite: "passport-photo", h1: "Schengen Visa 35×45 mm Photo" },
  { path: "/passport-photo/belgium-passport-eid/", suite: "passport-photo", h1: "Belgium Passport & eID Photo" },
  { path: "/passport-photo/netherlands-pasfoto/", suite: "passport-photo", h1: "Netherlands Pasfoto 35×45 mm" },
];

const SVG_SIZER_PREVIEW = `<svg viewBox="0 0 280 86" width="260" height="80" role="img" aria-hidden="true">
  <rect x="34" y="10" width="122" height="68" fill="rgba(217,56,30,0.08)" stroke="#D9381E" stroke-width="1.5"/>
  <rect x="34" y="22" width="100" height="56" fill="rgba(15,82,186,0.10)" stroke="#0F52BA" stroke-width="1.6"/>
  <line x1="34" y1="83" x2="156" y2="83" stroke="var(--muted)" stroke-width="1"/>
  <path d="M34 80v6M156 80v6" stroke="var(--muted)" stroke-width="1"/>
  <rect x="184" y="14" width="54" height="64" fill="none" stroke="var(--border-strong)" stroke-dasharray="3 2" stroke-width="1.3"/>
  <rect x="190" y="24" width="42" height="54" rx="2" fill="rgba(15,82,186,0.12)" stroke="#0F52BA" stroke-width="1.4"/>
  <text x="84" y="53" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="8.5" font-weight="600" fill="#0F52BA">55" / 65"</text>
</svg>`;

const SVG_PAPER_PREVIEW = `<svg viewBox="0 0 280 86" width="260" height="80" role="img" aria-hidden="true">
  <rect x="46" y="8" width="52" height="70" fill="#FFFFFF" stroke="#111214" stroke-width="1.3"/>
  <rect x="52" y="14" width="40" height="58" fill="none" stroke="#CBD5E1" stroke-width="0.8"/>
  <g fill="#64748B">
    <circle cx="58" cy="22" r="0.9"/><circle cx="66" cy="22" r="0.9"/><circle cx="74" cy="22" r="0.9"/><circle cx="82" cy="22" r="0.9"/>
    <circle cx="58" cy="32" r="0.9"/><circle cx="66" cy="32" r="0.9"/><circle cx="74" cy="32" r="0.9"/><circle cx="82" cy="32" r="0.9"/>
    <circle cx="58" cy="42" r="0.9"/><circle cx="66" cy="42" r="0.9"/><circle cx="74" cy="42" r="0.9"/><circle cx="82" cy="42" r="0.9"/>
    <circle cx="58" cy="52" r="0.9"/><circle cx="66" cy="52" r="0.9"/><circle cx="74" cy="52" r="0.9"/><circle cx="82" cy="52" r="0.9"/>
    <circle cx="58" cy="62" r="0.9"/><circle cx="66" cy="62" r="0.9"/><circle cx="74" cy="62" r="0.9"/><circle cx="82" cy="62" r="0.9"/>
  </g>
  <rect x="116" y="12" width="114" height="62" fill="#FFFFFF" stroke="#111214" stroke-width="1.3"/>
  <g stroke="#0F52BA" stroke-width="0.9" fill="rgba(15,82,186,0.06)">
    <rect x="124" y="19" width="28" height="12"/><rect x="159" y="19" width="28" height="12"/><rect x="194" y="19" width="28" height="12"/>
    <rect x="124" y="37" width="28" height="12"/><rect x="159" y="37" width="28" height="12"/><rect x="194" y="37" width="28" height="12"/>
    <rect x="124" y="55" width="28" height="12"/><rect x="159" y="55" width="28" height="12"/><rect x="194" y="55" width="28" height="12"/>
  </g>
</svg>`;

const SVG_FIT_PREVIEW = `<svg viewBox="0 0 280 86" width="260" height="80" role="img" aria-hidden="true">
  <line x1="26" y1="62" x2="180" y2="62" stroke="var(--text)" stroke-width="1.4"/>
  <path d="M26 56v12M56 58v8M86 55v14M116 58v8M146 56v12M176 58v8" stroke="var(--muted)" stroke-width="1"/>
  <rect x="78" y="36" width="52" height="14" rx="2" fill="rgba(15,82,186,0.12)" stroke="#0F52BA" stroke-width="1.3"/>
  <text x="104" y="28" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="8.5" fill="#0F52BA">280 MM</text>
  <circle cx="224" cy="43" r="24" fill="rgba(217,56,30,0.08)" stroke="#D9381E" stroke-width="1.6"/>
  <line x1="200" y1="43" x2="248" y2="43" stroke="var(--muted)" stroke-dasharray="2 2" stroke-width="1"/>
  <line x1="224" y1="19" x2="224" y2="67" stroke="var(--muted)" stroke-dasharray="2 2" stroke-width="1"/>
</svg>`;

const SVG_PHOTO_PREVIEW = `<svg viewBox="0 0 280 86" width="260" height="80" role="img" aria-hidden="true">
  <rect x="52" y="10" width="54" height="66" fill="#FFFFFF" stroke="#111214" stroke-width="1.3"/>
  <ellipse cx="79" cy="40" rx="14" ry="18" fill="#E2E8F0" stroke="#0F52BA" stroke-dasharray="3 2" stroke-width="1.2"/>
  <line x1="56" y1="38" x2="102" y2="38" stroke="#15803D" stroke-width="1"/>
  <path d="M62 72c0-10 8-16 17-16s17 6 17 16" fill="#CBD5E1"/>
  <rect x="132" y="12" width="96" height="62" fill="#FFFFFF" stroke="#111214" stroke-width="1.3"/>
  <g stroke="#94A3B8" stroke-width="0.9" fill="#F1F5F9">
    <rect x="140" y="18" width="22" height="24"/><rect x="169" y="18" width="22" height="24"/><rect x="198" y="18" width="22" height="24"/>
    <rect x="140" y="45" width="22" height="24"/><rect x="169" y="45" width="22" height="24"/><rect x="198" y="45" width="22" height="24"/>
  </g>
</svg>`;

export function mountHub(container: HTMLElement, lang: LocaleCode = "en"): void {
  const tr = t(lang);
  const cards = tr.hub.cards;

  const renderCard = (
    suitePath: string,
    previewSvg: string,
    card: {
      kicker: string;
      badge: string;
      title: string;
      desc: string;
      cta: string;
      routes: Array<{ label: string; href: string; tag: string }>;
    }
  ) => `
    <article class="instrument-card">
      <div class="instrument-head">
        <span class="section-kicker">${escapeHtml(card.kicker)}</span>
        <span class="spec-tag">${escapeHtml(card.badge)}</span>
      </div>
      <div class="instrument-preview">${previewSvg}</div>
      <div class="instrument-body">
        <h2>${escapeHtml(card.title)}</h2>
        <p>${escapeHtml(card.desc)}</p>
        <div style="margin-top:auto">
          <a class="btn-primary" href="${escapeHtml(localizePath(suitePath, lang))}">${escapeHtml(card.cta)} &rarr;</a>
        </div>
        <div class="instrument-links">
          ${card.routes
            .map(
              (r) => `
            <a class="instrument-route-row" href="${escapeHtml(localizePath(r.href, lang))}">
              <span>${escapeHtml(r.label)}</span>
              <span class="section-kicker">${escapeHtml(r.tag)}</span>
            </a>
          `
            )
            .join("")}
        </div>
      </div>
    </article>
  `;

  const quickTagsHtml = tr.hub.quickTags
    .map(
      (tag) =>
        `<a class="country-chip" href="${escapeHtml(localizePath(tag.href, lang))}">${escapeHtml(tag.label)}</a>`
    )
    .join("");

  const trustHtml = tr.hub.trustItems
    .map((item) => `<div class="hub-trust-cell"><span style="color:var(--ok)">✓</span><span>${escapeHtml(item)}</span></div>`)
    .join("");

  const visualCards = [
    { href: "/visual-sizer/", img: "/images/guide-visual-sizer.jpg", alt: cards.visualSizer.imageAlt, title: cards.visualSizer.title, cta: cards.visualSizer.cta },
    { href: "/printable-paper/", img: "/images/guide-printable-paper.jpg", alt: cards.printablePaper.imageAlt, title: cards.printablePaper.title, cta: cards.printablePaper.cta },
    { href: "/size-converter/", img: "/images/guide-shoe-ring.jpg", alt: cards.sizeConverter.imageAlt, title: cards.sizeConverter.title, cta: cards.sizeConverter.cta },
    { href: "/passport-photo/", img: "/images/guide-passport-setup.jpg", alt: cards.passportPhoto.imageAlt, title: cards.passportPhoto.title, cta: cards.passportPhoto.cta },
  ];

  container.innerHTML = `
    <div class="hub-workbench">
      <section class="hub-live-search" aria-label="${escapeHtml(tr.hub.searchLabel)}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <label for="hub-live-input" class="section-kicker">${escapeHtml(tr.hub.searchLabel)}</label>
          <button class="search-trigger" type="button" id="hub-open-search">
            <span class="search-trigger-left"><span>${escapeHtml(tr.nav.searchBtn)}</span></span>
            <kbd class="kbd">Ctrl K</kbd>
          </button>
        </div>
        <div class="hub-search-row">
          <input id="hub-live-input" class="hub-live-input" type="search" placeholder="${escapeHtml(tr.hub.searchPlaceholder)}" autocomplete="off" />
        </div>
        <div id="hub-live-results" class="hub-live-results" hidden></div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
          <span style="font-size:.82rem;color:var(--muted)">${escapeHtml(tr.hub.quickPopularLabel)}</span>
          ${quickTagsHtml}
        </div>
      </section>

      <div class="hub-trust-strip" aria-label="Guarantees">
        ${trustHtml}
      </div>

      <div class="instrument-grid">
        ${renderCard("/visual-sizer/", SVG_SIZER_PREVIEW, cards.visualSizer)}
        ${renderCard("/printable-paper/", SVG_PAPER_PREVIEW, cards.printablePaper)}
        ${renderCard("/size-converter/", SVG_FIT_PREVIEW, cards.sizeConverter)}
        ${renderCard("/passport-photo/", SVG_PHOTO_PREVIEW, cards.passportPhoto)}
      </div>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">${escapeHtml(tr.hub.overviewTitle)}</h2>
            <p style="margin:4px 0 0;color:var(--muted);font-size:.9rem">${escapeHtml(tr.hub.overviewLead)}</p>
          </div>
          <a class="action-btn" href="${escapeHtml(localizePath("/guides/", lang))}">${escapeHtml(tr.nav.guides)} &rarr;</a>
        </div>
        <div class="do-dont-grid">
          ${visualCards
            .map(
              (v) => `
            <a class="guide-card" href="${escapeHtml(localizePath(v.href, lang))}" style="text-decoration:none;color:inherit">
              <div class="guide-thumb" style="padding:0">
                <img src="${escapeHtml(v.img)}" alt="${escapeHtml(v.alt)}" loading="lazy" width="440" height="260" style="aspect-ratio:880/520;object-fit:cover;border-radius:0" />
              </div>
              <div class="guide-card-body">
                <h3>${escapeHtml(v.title)}</h3>
                <p style="color:var(--accent);font-weight:600">${escapeHtml(v.cta)} &rarr;</p>
              </div>
            </a>
          `
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  container.querySelector<HTMLButtonElement>("#hub-open-search")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("scaleandfit:open-search"));
  });

  const liveInput = container.querySelector<HTMLInputElement>("#hub-live-input");
  const liveResults = container.querySelector<HTMLElement>("#hub-live-results");
  let cachedIndex: HubRouteItem[] | null = null;

  const ensureIndex = async (): Promise<HubRouteItem[]> => {
    if (cachedIndex) return cachedIndex;
    const indexUrl = lang === "en" ? "/route-index.json" : `/route-index.${lang}.json`;
    try {
      if (typeof fetch === "function") {
        let res = await fetch(indexUrl);
        if (!res.ok && lang !== "en") res = await fetch("/route-index.json");
        if (res.ok) {
          const parsed = (await res.json()) as HubRouteItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedIndex = parsed;
            return cachedIndex;
          }
        }
      }
    } catch {
      cachedIndex = null;
    }
    cachedIndex = FALLBACK_HUB_ROUTES.map((r) => ({ ...r, path: localizePath(r.path, lang) }));
    return cachedIndex;
  };

  liveInput?.addEventListener("input", async () => {
    if (!liveResults) return;
    const q = liveInput.value.trim().toLowerCase();
    if (!q) {
      liveResults.hidden = true;
      liveResults.innerHTML = "";
      return;
    }
    const items = await ensureIndex();
    const matches = items
      .filter((r) => r.h1.toLowerCase().includes(q) || r.path.toLowerCase().includes(q) || r.suite.toLowerCase().includes(q))
      .slice(0, 10);
    liveResults.hidden = false;
    liveResults.innerHTML = matches.length
      ? matches
          .map(
            (r) =>
              `<a class="palette-item" href="${escapeHtml(r.path)}"><span><strong>${escapeHtml(r.h1)}</strong><span style="display:block;font-family:var(--font-mono);font-size:.72rem;color:var(--muted)">${escapeHtml(r.path)}</span></span><span class="spec-tag">${escapeHtml(r.suite)}</span></a>`
          )
          .join("")
      : `<div style="padding:10px;color:var(--muted);font-size:.86rem">${escapeHtml(tr.nav.searchNoResults)}</div>`;
  });
}
