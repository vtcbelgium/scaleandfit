import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_PATH = path.resolve(__dirname, "../src/i18n/translations.json");
const TRANSLATIONS = JSON.parse(readFileSync(TRANSLATIONS_PATH, "utf8"));

export const LOCALE_CODES = ["en", "nl", "fr", "de", "es"];
export const INFO_PAGES = ["about", "guides", "privacy", "terms", "cookies", "contact"];

export const LOCALE_NATIVE_NAMES = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getBundle(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

export function localizePath(canonicalEnPath, lang) {
  const clean = canonicalEnPath.startsWith("/") ? canonicalEnPath : `/${canonicalEnPath}`;
  if (!lang || lang === "en") return clean;
  return clean === "/" ? `/${lang}/` : `/${lang}${clean}`;
}

export function renderHreflangLinks(canonicalEnPath, origin = "https://scaleandfit.com") {
  const altLinks = LOCALE_CODES.map(
    (code) =>
      `<link rel="alternate" hreflang="${code}" href="${origin}${localizePath(canonicalEnPath, code)}" />`
  );
  altLinks.push(
    `<link rel="alternate" hreflang="x-default" href="${origin}${localizePath(canonicalEnPath, "en")}" />`
  );
  return altLinks.join("\n  ");
}

export function localizeLeafRoute(route, lang) {
  const pathLocalized = localizePath(route.path, lang);
  if (!lang || lang === "en") {
    return {
      path: pathLocalized,
      title: route.title,
      h1: route.h1,
      description: route.description,
    };
  }

  if (route.kind === "screen-compare") {
    const a = route.meta.a.label;
    const b = route.meta.b.label;
    const map = {
      nl: {
        h1: `${a} vs ${b} schermvergelijking`,
        title: `${a} vs ${b} afmetingen op ware grootte | ScaleAndFit`,
        description: `Vergelijk breedte, hoogte, schermoppervlak en kijkafstand van ${a} en ${b} direct in uw browser.`,
      },
      fr: {
        h1: `Comparaison écran ${a} vs ${b}`,
        title: `Dimensions exactes ${a} vs ${b} à l'échelle | ScaleAndFit`,
        description: `Comparez la largeur, la hauteur, la surface d'affichage et la distance de recul entre ${a} et ${b}.`,
      },
      de: {
        h1: `Bildschirmvergleich ${a} vs ${b}`,
        title: `Abmessungen im Maßstab: ${a} vs ${b} | ScaleAndFit`,
        description: `Vergleichen Sie Breite, Höhe, Bildfläche und Sitzabstand zwischen ${a} und ${b} direkt im Browser.`,
      },
      es: {
        h1: `Comparación de pantalla ${a} vs ${b}`,
        title: `Tamaño real ${a} vs ${b} a escala exacta | ScaleAndFit`,
        description: `Compare el ancho, alto, superficie y distancia de visualización entre ${a} y ${b} en su navegador.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    const dims = `${air.carryOnCm.join("×")} cm`;
    const personal = `${air.personalItemCm.join("×")} cm`;
    const map = {
      nl: {
        h1: `${air.name} (${air.iata}) handbagage & kofferchecker`,
        title: `${air.name} (${air.iata}) handbagage afmetingen ${dims} | ScaleAndFit`,
        description: `Controleer of uw koffer past bij ${air.name}: maximaal ${dims} (${air.carryOnWeightKg} kg) en onder-de-stoel tas ${personal}.`,
      },
      fr: {
        h1: `Bagage cabine ${air.name} (${air.iata}) — Vérificateur`,
        title: `Dimensions bagage cabine ${air.name} (${air.iata}) ${dims} | ScaleAndFit`,
        description: `Vérifiez si votre valise respecte ${air.name} : cabine ${dims} (${air.carryOnWeightKg} kg) et sous le siège ${personal}.`,
      },
      de: {
        h1: `${air.name} (${air.iata}) Handgepäck-Prüfer`,
        title: `${air.name} (${air.iata}) Handgepäck Maße ${dims} | ScaleAndFit`,
        description: `Prüfen Sie Ihren Koffer für ${air.name}: Kabinenmaß ${dims} (${air.carryOnWeightKg} kg) und Tasche unter dem Sitz ${personal}.`,
      },
      es: {
        h1: `Verificador de equipaje ${air.name} (${air.iata})`,
        title: `Medidas de equipaje de mano ${air.name} (${air.iata}) ${dims} | ScaleAndFit`,
        description: `Compruebe si su maleta cabe en ${air.name}: cabina ${dims} (${air.carryOnWeightKg} kg) y artículo personal ${personal}.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "mattress-compare") {
    const a = route.meta.a;
    const b = route.meta.b;
    const map = {
      nl: {
        h1: `${a.label} vs ${b.label} matras & slaapkamerruimte`,
        title: `${a.label} vs ${b.label} matrasvergelijking | ScaleAndFit`,
        description: `Vergelijk ${a.label} (${a.widthCm}×${a.lengthCm} cm) met ${b.label} (${b.widthCm}×${b.lengthCm} cm) en bekijk uw loopruimte rond het bed.`,
      },
      fr: {
        h1: `Matelas ${a.label} vs ${b.label} & espace chambre`,
        title: `Comparatif matelas ${a.label} vs ${b.label} | ScaleAndFit`,
        description: `Comparez les dimensions de ${a.label} (${a.widthCm}×${a.lengthCm} cm) et ${b.label} (${b.widthCm}×${b.lengthCm} cm) sur le plan de chambre.`,
      },
      de: {
        h1: `Matratzenvergleich ${a.label} vs ${b.label}`,
        title: `${a.label} vs ${b.label} Maße & Schlafzimmer-Plan | ScaleAndFit`,
        description: `Vergleichen Sie ${a.label} (${a.widthCm}×${a.lengthCm} cm) und ${b.label} (${b.widthCm}×${b.lengthCm} cm) inklusive Durchgangsbreite.`,
      },
      es: {
        h1: `Comparativa colchón ${a.label} vs ${b.label}`,
        title: `Medidas colchón ${a.label} vs ${b.label} | ScaleAndFit`,
        description: `Compare ${a.label} (${a.widthCm}×${a.lengthCm} cm) frente a ${b.label} (${b.widthCm}×${b.lengthCm} cm) y el espacio de paso.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmt = format.toUpperCase();
    const map = {
      nl: {
        h1: `${route.h1.replace("Paper ", "Papier ").replace("PDF", "PDF")}`,
        title: `${route.h1} — Op ware grootte printen | ScaleAndFit`,
        description: `Pas lijnkleur en raster (${spacingMm} mm) aan en download een millimeternauwkeurige ${fmt} vector-PDF zonder schaalverlies.`,
      },
      fr: {
        h1: `${route.h1} — Modèle PDF`,
        title: `${route.h1} à l'échelle exacte | ScaleAndFit`,
        description: `Réglez la couleur et l'espacement (${spacingMm} mm) puis téléchargez votre feuille ${fmt} PDF prête à imprimer à 100%.`,
      },
      de: {
        h1: `${route.h1} — Druckvorlage`,
        title: `${route.h1} maßstabsgetreu drucken | ScaleAndFit`,
        description: `Wählen Sie Farbe und Abstand (${spacingMm} mm) und laden Sie ein exakt skaliertes ${fmt}-PDF für 100%-Druck herunter.`,
      },
      es: {
        h1: `${route.h1} — Plantilla PDF`,
        title: `${route.h1} a escala real 100% | ScaleAndFit`,
        description: `Ajuste color y separación (${spacingMm} mm) y descargue su hoja vectorial ${fmt} PDF lista para imprimir.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    const map = {
      nl: {
        h1: `${year} ${cname} Feestdagenkalender PDF`,
        title: `Printbare kalender ${year} ${cname} met feestdagen PDF | ScaleAndFit`,
        description: `Download een printbare ${year} jaarkalender of maandplanner in PDF met ${holidays.length} officiële feestdagen voor ${cname}.`,
      },
      fr: {
        h1: `Calendrier ${year} ${cname} avec jours fériés PDF`,
        title: `Calendrier à imprimer ${year} ${cname} PDF | ScaleAndFit`,
        description: `Téléchargez un calendrier ${year} en PDF avec les ${holidays.length} jours fériés officiels (${cname}).`,
      },
      de: {
        h1: `Feiertagskalender ${year} ${cname} PDF`,
        title: `Druckbarer Kalender ${year} ${cname} mit Feiertagen PDF | ScaleAndFit`,
        description: `Erstellen Sie einen druckfertigen ${year}-PDF-Kalender mit ${holidays.length} gesetzlichen Feiertagen für ${cname}.`,
      },
      es: {
        h1: `Calendario ${year} ${cname} con festivos PDF`,
        title: `Calendario imprimible ${year} ${cname} PDF | ScaleAndFit`,
        description: `Descargue un calendario ${year} en PDF con ${holidays.length} días festivos oficiales de ${cname}.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "avery-label") {
    const av = route.meta.avery;
    const count = av.cols * av.rows;
    const map = {
      nl: {
        h1: `${av.name} etikettenvel PDF`,
        title: `${av.name} printbare etiketten PDF (${count}/vel) | ScaleAndFit`,
        description: `Maak en print uitgelijnde ${av.name} stickers (${av.labelWidthMm}×${av.labelHeightMm} mm, ${count} per vel) als vector-PDF.`,
      },
      fr: {
        h1: `Planche d'étiquettes ${av.name} PDF`,
        title: `Modèle ${av.name} prêt à imprimer (${count}/page) | ScaleAndFit`,
        description: `Générez un PDF vectoriel ${av.name} (${av.labelWidthMm}×${av.labelHeightMm} mm, ${count} étiquettes) aligné au millimètre.`,
      },
      de: {
        h1: `${av.name} Etiketten-Vorlage PDF`,
        title: `${av.name} PDF-Druckbogen (${count} Etiketten) | ScaleAndFit`,
        description: `Erstellen Sie passgenaue ${av.name}-Etiketten (${av.labelWidthMm}×${av.labelHeightMm} mm) mit Millimeter-Feinabgleich.`,
      },
      es: {
        h1: `Plantilla de etiquetas ${av.name} PDF`,
        title: `Etiquetas ${av.name} listas para imprimir (${count}/hoja) | ScaleAndFit`,
        description: `Genere etiquetas ${av.name} (${av.labelWidthMm}×${av.labelHeightMm} mm, ${count} por hoja) en PDF exacto sin descuadres.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const bA = route.meta.bA?.name || "US";
    const bB = route.meta.bB?.name || "EU";
    const map = {
      nl: {
        h1: `${bA} naar ${bB} schoenmaat omrekenen`,
        title: `${bA} naar ${bB} schoenmaten tabel (cm & mm) | ScaleAndFit`,
        description: `Zet ${bA} US, EU en UK schoenmaten direct om naar ${bB} via exacte voetlengte in millimeters.`,
      },
      fr: {
        h1: `Convertisseur pointure ${bA} vers ${bB}`,
        title: `Équivalence pointure ${bA} vers ${bB} (EU, US, cm) | ScaleAndFit`,
        description: `Convertissez vos pointures ${bA} vers ${bB} grâce à la longueur exacte du pied en millimètres.`,
      },
      de: {
        h1: `Schuhgröße ${bA} in ${bB} umrechnen`,
        title: `${bA} zu ${bB} Schuhgrößen-Rechner (mm/cm) | ScaleAndFit`,
        description: `Rechnen Sie ${bA} EU, US und UK Schuhgrößen exakt über die Fußlänge in Millimetern in ${bB} um.`,
      },
      es: {
        h1: `Conversor de talla ${bA} a ${bB}`,
        title: `Equivalencia de calzado ${bA} a ${bB} (EU, US, cm) | ScaleAndFit`,
        description: `Convierta su talla ${bA} a ${bB} en segundos usando la longitud real del pie en milímetros.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "ring-guide") {
    const map = {
      nl: {
        h1: `${route.meta.h1} (NL)`,
        title: `Ringmaat meten met bankpas op uw scherm | ScaleAndFit`,
        description: `Meet uw exacte ringdiameter en omtrek in mm op het scherm met elke bankpas — EU, US en UK maten.`,
      },
      fr: {
        h1: `Baguier en ligne calibré par carte bancaire`,
        title: `Mesurer sa taille de bague sans erreur (EU, FR, US) | ScaleAndFit`,
        description: `Calibrez votre écran avec une carte bancaire (85,60 mm) et mesurez le diamètre intérieur de votre bague.`,
      },
      de: {
        h1: `Ringgröße direkt am Bildschirm messen`,
        title: `Ringgrößen-Messer mit Bankkarte (EU, US, UK, mm) | ScaleAndFit`,
        description: `Kalibrieren Sie den Bildschirm per EC-Karte (85,60 mm) und lesen Sie Innendurchmesser und Ringgröße ab.`,
      },
      es: {
        h1: `Medidor de anillos online con tarjeta`,
        title: `Medir talla de anillo en pantalla (ES, EU, US, mm) | ScaleAndFit`,
        description: `Calibre la pantalla con cualquier tarjeta bancaria (85,60 mm) y obtenga diámetro y talla exacta al instante.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const size = `${sp.widthMm}×${sp.heightMm} mm`;
    const map = {
      nl: {
        h1: `${sp.country} ${sp.documentType} pasfoto (${size})`,
        title: `${sp.country} pasfoto zelf maken (${size}) + 10×15 vel | ScaleAndFit`,
        description: `Snijd uw ${sp.country} ${sp.documentType} pasfoto (${size}) bij in uw browser en download voor online upload of 10×15 cm afdruk.`,
      },
      fr: {
        h1: `Photo d'identité ${sp.country} — ${sp.documentType} (${size})`,
        title: `Photo passeport & visa ${sp.country} (${size}) + planche | ScaleAndFit`,
        description: `Recadrez votre photo ${sp.country} ${sp.documentType} (${size}) sur votre appareil et exportez en format numérique ou planche 10×15.`,
      },
      de: {
        h1: `Passfoto ${sp.country} — ${sp.documentType} (${size})`,
        title: `Biometrisches Passbild ${sp.country} (${size}) erstellen | ScaleAndFit`,
        description: `Erstellen Sie Ihr ${sp.country} ${sp.documentType} Foto (${size}) privat im Browser inklusive 10×15-cm-Druckbogen.`,
      },
      es: {
        h1: `Foto oficial ${sp.country} — ${sp.documentType} (${size})`,
        title: `Hacer foto carnet / visado ${sp.country} (${size}) | ScaleAndFit`,
        description: `Recorte su foto oficial ${sp.country} ${sp.documentType} (${size}) sin subir archivos y descargue lámina 10×15 cm.`,
      },
    };
    return { path: pathLocalized, ...map[lang] };
  }

  return {
    path: pathLocalized,
    title: route.title,
    h1: route.h1,
    description: route.description,
  };
}

export function renderStaticFooterHtml(lang, canonicalEnPath) {
  const tr = getBundle(lang);
  const f = tr.footer;
  const langLinksHtml = LOCALE_CODES.map((code) => {
    const href = localizePath(canonicalEnPath, code);
    const cls = code === lang ? ' class="active-lang"' : "";
    return `<a href="${escapeHtml(href)}" hreflang="${code}"${cls}>${escapeHtml(LOCALE_NATIVE_NAMES[code])}</a>`;
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
    </footer>
  `;
}

export function renderStaticGuidePreviewHtml(suite, lang, infoPage = "") {
  const tr = getBundle(lang);
  if (suite === "info" && infoPage) {
    if (infoPage === "privacy") {
      const p = tr.info.privacy;
      return `
        <article class="panel info-article">
          <div class="trust-callout">
            <strong>${escapeHtml(p.summaryTitle)}</strong>
            <ul>${p.summaryBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
          </div>
          ${p.sections
            .map(
              (sec) => `
            <div class="info-block">
              <h2>${escapeHtml(sec.heading)}</h2>
              ${sec.paragraphs.map((pg) => `<p>${escapeHtml(pg)}</p>`).join("")}
            </div>
          `
            )
            .join("")}
        </article>`;
    }
    if (infoPage === "about" || infoPage === "terms") {
      const page = tr.info[infoPage];
      return `
        <article class="panel info-article">
          ${page.sections
            .map(
              (sec) => `
            <div class="info-block">
              <h2>${escapeHtml(sec.heading)}</h2>
              ${(sec.paragraphs || []).map((pg) => `<p>${escapeHtml(pg)}</p>`).join("")}
              ${sec.list ? `<ul>${sec.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>` : ""}
            </div>
          `
            )
            .join("")}
        </article>`;
    }
    if (infoPage === "cookies") {
      const ck = tr.info.cookies;
      return `
        <article class="panel info-article">
          <div class="data-table-wrap">
            <table class="data-table">
              <thead><tr>${ck.tableHeaders.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
              <tbody>${ck.tableRows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
          <p style="margin-top:16px;color:var(--muted)">${escapeHtml(ck.note)}</p>
        </article>`;
    }
    if (infoPage === "contact") {
      const ct = tr.info.contact;
      return `
        <article class="panel info-article">
          <p><strong>${escapeHtml(ct.emailLabel)}</strong> <a href="mailto:${escapeHtml(ct.email)}">${escapeHtml(ct.email)}</a></p>
          <div class="info-block">
            <h2>${escapeHtml(ct.helpfulTitle)}</h2>
            <ul>${ct.helpfulList.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>
          </div>
        </article>`;
    }
    if (infoPage === "guides") {
      return `
        <div class="how-guide-grid" style="margin-top:16px">
          <div class="guide-card"><div class="guide-thumb"><img src="/guides/passport-step-1.svg" alt="${escapeHtml(tr.passport.stepCards[0].alt)}" /></div><div class="guide-card-body"><h3>${escapeHtml(tr.passport.stepCards[0].title)}</h3><p>${escapeHtml(tr.passport.stepCards[0].desc)}</p></div></div>
          <div class="guide-card"><div class="guide-thumb"><img src="/guides/sizer-step-1.svg" alt="${escapeHtml(tr.sizer.stepCards[0].alt)}" /></div><div class="guide-card-body"><h3>${escapeHtml(tr.sizer.stepCards[0].title)}</h3><p>${escapeHtml(tr.sizer.stepCards[0].desc)}</p></div></div>
          <div class="guide-card"><div class="guide-thumb"><img src="/guides/paper-step-1.svg" alt="${escapeHtml(tr.paper.stepCards[0].alt)}" /></div><div class="guide-card-body"><h3>${escapeHtml(tr.paper.stepCards[0].title)}</h3><p>${escapeHtml(tr.paper.stepCards[0].desc)}</p></div></div>
        </div>`;
    }
    return "";
  }

  const suiteGuideMap = {
    "visual-sizer": { data: tr.sizer, prefix: "sizer" },
    "printable-paper": { data: tr.paper, prefix: "paper" },
    "size-converter": { data: tr.fit, prefix: "fit" },
    "passport-photo": { data: tr.passport, prefix: "passport" },
  };
  const cfg = suiteGuideMap[suite];
  if (!cfg) return "";

  return `
    <div class="how-guide-grid" style="margin-top:16px">
      ${cfg.data.stepCards
        .map(
          (c, i) => `
        <div class="guide-card">
          <div class="guide-thumb"><img src="/guides/${cfg.prefix}-step-${i + 1}.svg" alt="${escapeHtml(c.alt)}" loading="lazy" width="320" height="220" /></div>
          <div class="guide-card-body"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.desc)}</p></div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}
