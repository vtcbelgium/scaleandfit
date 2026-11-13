const SVG_SIZER_PREVIEW = `<svg viewBox="0 0 280 86" width="260" height="80" role="img" aria-hidden="true">
  <rect x="34" y="10" width="122" height="68" fill="rgba(217,56,30,0.08)" stroke="#D9381E" stroke-width="1.5"/>
  <rect x="34" y="22" width="100" height="56" fill="rgba(15,82,186,0.10)" stroke="#0F52BA" stroke-width="1.6"/>
  <line x1="34" y1="83" x2="156" y2="83" stroke="var(--muted)" stroke-width="1"/>
  <path d="M34 80v6M156 80v6" stroke="var(--muted)" stroke-width="1"/>
  <rect x="184" y="14" width="54" height="64" fill="none" stroke="var(--border-strong)" stroke-dasharray="3 2" stroke-width="1.3"/>
  <rect x="190" y="24" width="42" height="54" rx="2" fill="rgba(15,82,186,0.12)" stroke="#0F52BA" stroke-width="1.4"/>
  <text x="166" y="75" font-family="ui-monospace,Consolas,monospace" font-size="8" fill="var(--muted)">65" / 55"</text>
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

export function mountHub(container: HTMLElement): void {
  container.innerHTML = `
    <div class="hub-workbench">
      <div class="hub-command-bar">
        <div>
          <span class="section-kicker">Workbench Index</span>
          <div style="font-size:.9rem;font-weight:600">Jump directly to any screen, airline cage, vector sheet, shoe brand pair, or passport spec.</div>
        </div>
        <button class="search-trigger" type="button" id="hub-open-search" style="min-width:240px">
          <span class="search-trigger-left">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7" r="4.8"/><path d="M10.7 10.7L14 14"/></svg>
            <span>Search 213 calibrated tools...</span>
          </span>
          <kbd class="kbd">Ctrl K</kbd>
        </button>
      </div>

      <div class="hub-stat-strip" aria-label="Calibration specifications">
        <div class="hub-stat-cell">
          <div class="hub-stat-num">34</div>
          <div class="hub-stat-label">Airlines · Overhead &amp; Under-Seat Cages</div>
        </div>
        <div class="hub-stat-cell">
          <div class="hub-stat-num">10 / 8</div>
          <div class="hub-stat-label">Vector Paper &amp; Avery Die-Cut Templates</div>
        </div>
        <div class="hub-stat-cell">
          <div class="hub-stat-num">24</div>
          <div class="hub-stat-label">Footwear Brands via Mondopoint mm</div>
        </div>
        <div class="hub-stat-cell">
          <div class="hub-stat-num">36</div>
          <div class="hub-stat-label">Country Biometric Photo Standards</div>
        </div>
      </div>

      <div class="instrument-grid">
        <article class="instrument-card">
          <div class="instrument-head">
            <span class="section-kicker">01 / Visual Sizer</span>
            <span class="spec-tag">CM · IN · DEG</span>
          </div>
          <div class="instrument-preview">${SVG_SIZER_PREVIEW}</div>
          <div class="instrument-body">
            <h2>Display, Carry-On &amp; Mattress Geometry</h2>
            <p>Orthographic corner-aligned screen overlays, dual front/side baggage sizer checks against 34 airline policies, and bedroom clearance plans.</p>
            <div style="margin-top:auto">
              <a class="btn-primary" href="/visual-sizer/">Launch Visual Sizer &rarr;</a>
            </div>
            <div class="instrument-links">
              <a class="instrument-route-row" href="/visual-sizer/55-vs-65-inch-tv/"><span>55&quot; vs 65&quot; 16:9 TV Overlay</span><span class="section-kicker">Compare</span></a>
              <a class="instrument-route-row" href="/visual-sizer/ryanair-carry-on-size/"><span>Ryanair 40×20×25 / 55×40×20 Cage</span><span class="section-kicker">Luggage</span></a>
              <a class="instrument-route-row" href="/visual-sizer/queen-vs-king-mattress/"><span>US Queen vs King Room Clearance</span><span class="section-kicker">Floor Plan</span></a>
            </div>
          </div>
        </article>

        <article class="instrument-card">
          <div class="instrument-head">
            <span class="section-kicker">02 / Paper &amp; Avery</span>
            <span class="spec-tag">72 PT/IN VECTOR</span>
          </div>
          <div class="instrument-preview">${SVG_PAPER_PREVIEW}</div>
          <div class="instrument-body">
            <h2>Printable Grids, Holiday Calendars &amp; Labels</h2>
            <p>Client-side pdf-lib synthesis for exact millimeter dot-grid, engineering graph, isometric, Cornell notes, sheet music, calendars, and Avery die-cuts.</p>
            <div style="margin-top:auto">
              <a class="btn-primary" href="/printable-paper/">Launch Paper Studio &rarr;</a>
            </div>
            <div class="instrument-links">
              <a class="instrument-route-row" href="/printable-paper/5mm-dot-grid-a4/"><span>5mm Dot Grid Paper (ISO A4 PDF)</span><span class="section-kicker">Grid</span></a>
              <a class="instrument-route-row" href="/printable-paper/2026-belgium-holiday-calendar-pdf/"><span>2026 Belgium Public Holiday Pack</span><span class="section-kicker">Calendar</span></a>
              <a class="instrument-route-row" href="/printable-paper/avery-5160-template-pdf/"><span>Avery 5160 30-Up Die-Cut Sheet</span><span class="section-kicker">Labels</span></a>
            </div>
          </div>
        </article>

        <article class="instrument-card">
          <div class="instrument-head">
            <span class="section-kicker">03 / Shoe &amp; Ring Fit</span>
            <span class="spec-tag">MONDOPOINT · ISO 8653</span>
          </div>
          <div class="instrument-preview">${SVG_FIT_PREVIEW}</div>
          <div class="instrument-body">
            <h2>Cross-Brand Shoe Matrix &amp; Ring Reticle</h2>
            <p>Translate US, UK, and EU footwear sizes across 24 brand lasts by millimeter foot length, plus 85.60 mm ISO bank-card calibrated ring sizing.</p>
            <div style="margin-top:auto">
              <a class="btn-primary" href="/size-converter/">Launch Fit Converter &rarr;</a>
            </div>
            <div class="instrument-links">
              <a class="instrument-route-row" href="/size-converter/nike-to-adidas-shoe-size/"><span>Nike to Adidas Mondopoint Matrix</span><span class="section-kicker">Footwear</span></a>
              <a class="instrument-route-row" href="/size-converter/hoka-to-new-balance-shoe-size/"><span>Hoka to New Balance Last Offset</span><span class="section-kicker">Footwear</span></a>
              <a class="instrument-route-row" href="/size-converter/credit-card-ring-sizer-online/"><span>Bank-Card Calibrated Ring Reticle</span><span class="section-kicker">ISO 8653</span></a>
            </div>
          </div>
        </article>

        <article class="instrument-card">
          <div class="instrument-head">
            <span class="section-kicker">04 / Passport Photo</span>
            <span class="spec-tag">ICAO 9303 · 300 DPI</span>
          </div>
          <div class="instrument-preview">${SVG_PHOTO_PREVIEW}</div>
          <div class="instrument-body">
            <h2>Biometric ID Cropper &amp; 4×6 Kiosk Sheet</h2>
            <p>Align portrait crowns and eye lines locally in HTML5 Canvas across 36 country requirements and export single files or tiled 4×6 PDF print sheets.</p>
            <div style="margin-top:auto">
              <a class="btn-primary" href="/passport-photo/">Launch Photo Studio &rarr;</a>
            </div>
            <div class="instrument-links">
              <a class="instrument-route-row" href="/passport-photo/us-passport-photo-2x2/"><span>United States 2×2 in (600×600 px)</span><span class="section-kicker">ICAO</span></a>
              <a class="instrument-route-row" href="/passport-photo/schengen-visa-35x45/"><span>Schengen Visa 35×45 mm Grid</span><span class="section-kicker">ICAO</span></a>
              <a class="instrument-route-row" href="/passport-photo/netherlands-pasfoto/"><span>Netherlands Pasfoto 35×45 mm</span><span class="section-kicker">ICAO</span></a>
            </div>
          </div>
        </article>
      </div>
    </div>
  `;

  container.querySelector<HTMLButtonElement>("#hub-open-search")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("scaleandfit:open-search"));
  });
}
