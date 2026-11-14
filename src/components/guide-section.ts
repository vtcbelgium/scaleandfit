import { escapeHtml } from "../i18n/index.js";

export interface VisualGuideStepCard {
  title: string;
  desc: string;
  alt: string;
}

export interface VisualGuideOptions {
  title: string;
  lead: string;
  bannerSrc: string;
  bannerAlt: string;
  stepSvgs: [string, string, string];
  stepCards: VisualGuideStepCard[];
  extraHtml?: string;
}

export function renderStepRibbon(steps: string[], activeStep = 0): string {
  const pills = steps
    .map((label, idx) => {
      const cls = idx === activeStep ? "step-pill active" : "step-pill";
      const match = label.match(/^(\d+)\.\s*(.+)$/);
      const num = match ? match[1] : String(idx + 1);
      const text = match ? match[2] : label;
      return `<div class="${cls}"><span class="step-num">${escapeHtml(num)}</span><span>${escapeHtml(text)}</span></div>`;
    })
    .join("");
  return `<div class="step-ribbon" aria-label="Steps">${pills}</div>`;
}

export function renderVisualGuideSection(opts: VisualGuideOptions): string {
  const cardsHtml = opts.stepCards
    .slice(0, 3)
    .map(
      (card, idx) => `
      <article class="guide-card">
        <div class="guide-thumb">
          <img src="${escapeHtml(opts.stepSvgs[idx])}" alt="${escapeHtml(card.alt)}" width="360" height="220" loading="lazy" />
        </div>
        <div class="guide-card-body">
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.desc)}</p>
        </div>
      </article>`
    )
    .join("");

  return `
    <section class="how-guide-section">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title" style="font-size:1.15rem">${escapeHtml(opts.title)}</h2>
            <p style="margin:4px 0 0;color:var(--muted);font-size:.92rem">${escapeHtml(opts.lead)}</p>
          </div>
        </div>
        <div class="guide-hero-banner">
          <img src="${escapeHtml(opts.bannerSrc)}" alt="${escapeHtml(opts.bannerAlt)}" width="880" height="520" loading="lazy" />
        </div>
        <div class="how-guide-grid">${cardsHtml}</div>
        ${opts.extraHtml || ""}
      </div>
    </section>
  `;
}
