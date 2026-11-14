import { renderVisualGuideSection } from "../components/guide-section.js";
import { escapeHtml, localizePath, t, type InfoPageId, type LocaleCode } from "../i18n/index.js";
import { generatePaperPdf } from "../services/pdf-export.js";

function triggerPdfDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function renderSections(sections: Array<{ heading: string; paragraphs?: string[]; list?: string[] }>): string {
  return sections
    .map((sec) => {
      const pHtml = (sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      const ulHtml = sec.list
        ? `<ul>${sec.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>`
        : "";
      return `<section class="info-block"><h2>${escapeHtml(sec.heading)}</h2>${pHtml}${ulHtml}</section>`;
    })
    .join("");
}

export function mountInfoPage(container: HTMLElement, pageId: InfoPageId, lang: LocaleCode): void {
  const tr = t(lang);
  const info = tr.info;

  if (pageId === "guides") {
    const g = info.guides;
    const passportGuide = renderVisualGuideSection({
      title: tr.passport.howTitle,
      lead: tr.passport.howLead,
      bannerSrc: "/images/guide-passport-setup.jpg",
      bannerAlt: tr.passport.bannerAlt,
      stepSvgs: ["/guides/passport-step-1.svg", "/guides/passport-step-2.svg", "/guides/passport-step-3.svg"],
      stepCards: tr.passport.stepCards,
      extraHtml: `
        <div style="margin-top:16px">
          <div style="margin-bottom:10px"><strong>${escapeHtml(tr.passport.doDontTitle)}</strong> — <span style="color:var(--muted);font-size:.9rem">${escapeHtml(tr.passport.doDontLead)}</span></div>
          <div class="guide-thumb" style="margin-bottom:12px">
            <img src="/guides/passport-do-dont.svg" alt="${escapeHtml(tr.passport.doDontAlt)}" width="920" height="230" loading="lazy" />
          </div>
          <div class="cta-row">
            <a class="btn-primary" href="${escapeHtml(localizePath("/passport-photo/", lang))}">${escapeHtml(tr.hub.cards.passportPhoto.cta)} &rarr;</a>
          </div>
        </div>
      `,
    });

    const sizerGuide = renderVisualGuideSection({
      title: tr.sizer.howTitle,
      lead: tr.sizer.howLead,
      bannerSrc: "/images/guide-visual-sizer.jpg",
      bannerAlt: tr.sizer.bannerAlt,
      stepSvgs: ["/guides/sizer-step-1.svg", "/guides/sizer-step-2.svg", "/guides/sizer-step-3.svg"],
      stepCards: tr.sizer.stepCards,
      extraHtml: `<div class="cta-row" style="margin-top:14px"><a class="btn-secondary" href="${escapeHtml(localizePath("/visual-sizer/", lang))}">${escapeHtml(tr.hub.cards.visualSizer.cta)} &rarr;</a></div>`,
    });

    const paperGuide = renderVisualGuideSection({
      title: tr.paper.howTitle,
      lead: tr.paper.howLead,
      bannerSrc: "/images/guide-printable-paper.jpg",
      bannerAlt: tr.paper.bannerAlt,
      stepSvgs: ["/guides/paper-step-1.svg", "/guides/paper-step-2.svg", "/guides/paper-step-3.svg"],
      stepCards: tr.paper.stepCards,
      extraHtml: `<div class="cta-row" style="margin-top:14px"><a class="btn-secondary" href="${escapeHtml(localizePath("/printable-paper/", lang))}">${escapeHtml(tr.hub.cards.printablePaper.cta)} &rarr;</a></div>`,
    });

    const fitGuide = renderVisualGuideSection({
      title: tr.fit.howTitle,
      lead: tr.fit.howLead,
      bannerSrc: "/images/guide-shoe-ring.jpg",
      bannerAlt: tr.fit.bannerAlt,
      stepSvgs: ["/guides/fit-step-1.svg", "/guides/fit-step-2.svg", "/guides/fit-step-3.svg"],
      stepCards: tr.fit.stepCards,
      extraHtml: `<div class="cta-row" style="margin-top:14px"><a class="btn-secondary" href="${escapeHtml(localizePath("/size-converter/", lang))}">${escapeHtml(tr.hub.cards.sizeConverter.cta)} &rarr;</a></div>`,
    });

    container.innerHTML = `
      <div class="info-article">
        <div class="card" style="margin-bottom:18px">
          <div class="panel-header">
            <h2 class="panel-title" style="font-size:1.1rem">${escapeHtml(g.printTestTitle)}</h2>
            <span class="spec-tag">10 MM · 100%</span>
          </div>
          <p style="margin:0 0 14px;color:var(--muted)">${escapeHtml(g.printTestDesc)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <button class="btn-primary" id="info-cal-a4" type="button">${escapeHtml(g.printTestBtnA4)}</button>
            <button class="btn-secondary" id="info-cal-letter" type="button">${escapeHtml(g.printTestBtnLetter)}</button>
          </div>
        </div>
        ${passportGuide}
        ${sizerGuide}
        ${paperGuide}
        ${fitGuide}
      </div>
    `;

    container.querySelector<HTMLButtonElement>("#info-cal-a4")!.onclick = async () => {
      const bytes = await generatePaperPdf({
        format: "a4",
        pattern: "graph-grid",
        spacingMm: 10,
        marginMm: 12,
        inkHex: "#0F52BA",
        strokeWidthPt: 0.65,
        title: "ScaleAndFit 100% Scale Printer Check (10mm Squares - A4)",
      });
      triggerPdfDownload(bytes, "scaleandfit-10mm-calibration-a4.pdf");
    };
    container.querySelector<HTMLButtonElement>("#info-cal-letter")!.onclick = async () => {
      const bytes = await generatePaperPdf({
        format: "letter",
        pattern: "graph-grid",
        spacingMm: 10,
        marginMm: 12,
        inkHex: "#0F52BA",
        strokeWidthPt: 0.65,
        title: "ScaleAndFit 100% Scale Printer Check (10mm Squares - US Letter)",
      });
      triggerPdfDownload(bytes, "scaleandfit-10mm-calibration-letter.pdf");
    };
    return;
  }

  if (pageId === "privacy") {
    const p = info.privacy;
    container.innerHTML = `
      <article class="card info-article">
        <div class="trust-callout">
          <strong>${escapeHtml(p.summaryTitle)}</strong>
          <ul>${p.summaryBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
        </div>
        ${renderSections(p.sections)}
      </article>
    `;
    return;
  }

  if (pageId === "cookies") {
    const c = info.cookies;
    container.innerHTML = `
      <article class="card info-article">
        <div class="data-table-wrap" style="margin-top:0">
          <table class="data-table">
            <thead><tr>${c.tableHeaders.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
            <tbody>
              ${c.tableRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </div>
        <p style="margin-top:16px;color:var(--muted)">${escapeHtml(c.note)}</p>
      </article>
    `;
    return;
  }

  if (pageId === "contact") {
    const ct = info.contact;
    container.innerHTML = `
      <article class="card info-article">
        <div class="trust-callout">
          <strong>${escapeHtml(ct.emailLabel)}</strong>
          <a href="mailto:${escapeHtml(ct.email)}" style="font-size:1.08rem;font-weight:700">${escapeHtml(ct.email)}</a>
        </div>
        <section class="info-block">
          <h2>${escapeHtml(ct.helpfulTitle)}</h2>
          <ul>${ct.helpfulList.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>
        </section>
      </article>
    `;
    return;
  }

  const secPage = pageId === "about" ? info.about : info.terms;
  container.innerHTML = `
    <article class="card info-article">
      ${renderSections(secPage.sections)}
    </article>
  `;
}
