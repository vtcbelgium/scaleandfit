export function mountHub(container: HTMLElement): void {
  container.innerHTML = `
    <div class="hub-cards">
      <article class="hub-card">
        <span class="status-pill status-ok">Suite 1 · Visual Scale</span>
        <h3 style="margin:4px 0">Visual TV, Bag &amp; Mattress Sizer</h3>
        <p style="margin:0;color:var(--muted);font-size:.92rem">
          Compare TV, monitor &amp; mattress dimensions side-by-side to exact scale, or test your carry-on bag against 34 global airline cabin cages.
        </p>
        <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:8px;padding-top:10px">
          <a class="btn-primary" href="/visual-sizer/">Open Visual Sizer</a>
          <a class="route-chip" href="/visual-sizer/55-vs-65-inch-tv/">55&quot; vs 65&quot; TV</a>
          <a class="route-chip" href="/visual-sizer/ryanair-carry-on-size/">Ryanair Cage</a>
        </div>
      </article>

      <article class="hub-card">
        <span class="status-pill status-ok">Suite 2 · Vector PDF</span>
        <h3 style="margin:4px 0">Printable Paper, Calendars &amp; Avery</h3>
        <p style="margin:0;color:var(--muted);font-size:.92rem">
          Generate crisp millimeter-exact dot grid, graph, isometric, Cornell notes, sheet music, 10-country holiday calendars, and Avery label PDFs.
        </p>
        <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:8px;padding-top:10px">
          <a class="btn-primary" href="/printable-paper/">Open Paper Studio</a>
          <a class="route-chip" href="/printable-paper/5mm-dot-grid-a4/">5mm Dot Grid A4</a>
          <a class="route-chip" href="/printable-paper/avery-5160-address-label-template-pdf/">Avery 5160</a>
        </div>
      </article>

      <article class="hub-card">
        <span class="status-pill status-ok">Suite 3 · Millimeter Fit</span>
        <h3 style="margin:4px 0">Shoe Brand &amp; Screen Ring Sizer</h3>
        <p style="margin:0;color:var(--muted);font-size:.92rem">
          Translate sizes across 24 footwear brands via canonical Mondopoint mm foot length, and measure ring inner diameter on-screen using a bank card.
        </p>
        <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:8px;padding-top:10px">
          <a class="btn-primary" href="/size-converter/">Open Fit Converter</a>
          <a class="route-chip" href="/size-converter/nike-to-adidas-shoe-size/">Nike → Adidas</a>
          <a class="route-chip" href="/size-converter/us-to-eu-ring-size-converter/">Ring Sizer</a>
        </div>
      </article>

      <article class="hub-card">
        <span class="status-pill status-ok">Suite 4 · 300-DPI Canvas</span>
        <h3 style="margin:4px 0">Biometric Passport &amp; 4×6 Photo Studio</h3>
        <p style="margin:0;color:var(--muted);font-size:.92rem">
          Crop ID portraits to 36 country biometric guides locally in Canvas, brighten backdrops, and export 300-DPI single or 4×6 print sheets with trim marks.
        </p>
        <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:8px;padding-top:10px">
          <a class="btn-primary" href="/passport-photo/">Open Photo Studio</a>
          <a class="route-chip" href="/passport-photo/us-passport-photo-2x2/">US 2×2&quot; Passport</a>
          <a class="route-chip" href="/passport-photo/schengen-visa-35x45/">Schengen 35×45mm</a>
        </div>
      </article>
    </div>

    <div class="card" style="margin-top:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="margin:0 0 4px">Instant Utility Jump Search</h3>
          <p style="margin:0;color:var(--muted);font-size:.9rem">Search 200+ pre-calibrated size comparisons, printable templates, brand shoe matrices, and official ID specs.</p>
        </div>
        <button class="btn-secondary" type="button" id="hub-open-search">Search All Calculators <span class="kbd">Ctrl+K</span></button>
      </div>
    </div>
  `;

  container.querySelector<HTMLButtonElement>("#hub-open-search")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("scaleandfit:open-search"));
  });
}
