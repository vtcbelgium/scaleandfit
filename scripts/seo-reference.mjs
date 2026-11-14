import { escapeHtml, getBundle, localizeLeafRoute } from "./i18n-seo.mjs";

export { escapeHtml };

function dispMetrics(d) {
  const h = Math.hypot(d.aspectW, d.aspectH);
  const wIn = d.diagonalIn * (d.aspectW / h);
  const hIn = d.diagonalIn * (d.aspectH / h);
  const wCm = wIn * 2.54;
  const hCm = hIn * 2.54;
  const areaIn = wIn * hIn;
  const areaCm = wCm * hCm;
  const smpteM = (wCm / 100) * 1.866;
  const cinemaM = (wCm / 100) * 1.374;
  let vesa = "600×400 mm";
  if (d.category === "laptop" || d.diagonalIn < 24) vesa = "75×75 mm";
  else if (d.diagonalIn <= 38) vesa = "100×100 mm";
  else if (d.diagonalIn < 55) vesa = "200×200 mm";
  else if (d.diagonalIn < 65) vesa = "300×300 mm";
  else if (d.diagonalIn < 85) vesa = "400×400 mm";
  return { wIn, hIn, wCm, hCm, areaIn, areaCm, smpteM, cinemaM, vesa };
}

function dimsLiters(cmTuple) {
  return ((cmTuple[0] * cmTuple[1] * cmTuple[2]) / 1000).toFixed(1);
}

function localizedGeoTitle(lang) {
  return (
    {
      en: "Direct Quantitative Summary",
      nl: "Direct Antwoord & Kernmaten",
      fr: "Synthèse Chiffrée Directe",
      de: "Kompakte Maß-Zusammenfassung",
      es: "Resumen Cuantitativo Directo",
    }[lang] || "Direct Quantitative Summary"
  );
}

function pickSemanticRelated(route, allRoutes, maxCount = 8) {
  const sameSuite = allRoutes.filter((r) => r.suite === route.suite && r.path !== route.path);
  const sameKind = sameSuite.filter((r) => r.kind === route.kind);
  const otherKind = sameSuite.filter((r) => r.kind !== route.kind);

  const scored = sameKind.map((candidate, idx) => {
    let score = 0;
    if (route.kind === "shoe-pair") {
      const aSlug = route.meta?.bA?.slug;
      const bSlug = route.meta?.bB?.slug;
      if (candidate.meta?.bA?.slug === aSlug || candidate.meta?.bB?.slug === bSlug) score += 3;
      if (candidate.meta?.bA?.slug === bSlug || candidate.meta?.bB?.slug === aSlug) score += 2;
    } else if (route.kind === "photo-spec") {
      if (candidate.meta?.spec?.country === route.meta?.spec?.country) score += 4;
      if (candidate.meta?.spec?.widthMm === route.meta?.spec?.widthMm) score += 1;
    } else if (route.kind === "airline-bag") {
      if (candidate.meta?.airline?.region === route.meta?.airline?.region) score += 3;
    } else if (route.kind === "airline-compare") {
      const a = route.meta?.airA?.slug;
      const b = route.meta?.airB?.slug;
      if (candidate.meta?.airA?.slug === a || candidate.meta?.airB?.slug === b) score += 3;
    } else if (route.kind === "screen-compare") {
      const a = route.meta?.a?.id;
      const b = route.meta?.b?.id;
      if (candidate.meta?.a?.id === a || candidate.meta?.b?.id === b || candidate.meta?.a?.id === b) score += 3;
    } else if (route.kind === "holiday-calendar") {
      if (candidate.meta?.cc === route.meta?.cc || candidate.meta?.year === route.meta?.year) score += 3;
    } else if (route.kind === "avery-label") {
      if (candidate.meta?.avery?.paper === route.meta?.avery?.paper) score += 3;
    }
    const dist = Math.abs(idx - Math.max(0, sameKind.indexOf(route)));
    return { candidate, score, dist };
  });

  scored.sort((x, y) => y.score - x.score || x.dist - y.dist);
  const primary = scored.slice(0, 6).map((s) => s.candidate);
  const crossStep = Math.max(1, Math.floor(otherKind.length / 2));
  const secondary = [
    otherKind[allRoutes.indexOf(route) % Math.max(1, otherKind.length)],
    otherKind[(allRoutes.indexOf(route) + crossStep) % Math.max(1, otherKind.length)],
  ].filter(Boolean);

  return [...new Map([...primary, ...secondary].map((r) => [r.path, r])).values()].slice(0, maxCount);
}

function buildLocalizedFaqs(route, lang, calc) {
  if (route.kind === "screen-compare") {
    const { a, b } = route.meta;
    const { mA, mB, areaPct, standWidthCm } = calc;
    const map = {
      en: [
        {
          q: `How much bigger is a ${b.label} than a ${a.label}?`,
          a: `Measured diagonally, a ${b.label} spans ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm, giving ${areaPct}% more viewing area than a ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
        },
        {
          q: `What stand width and VESA mount fit a ${b.label}?`,
          a: `Allow at least ${standWidthCm} cm horizontal wall or console width, a ${mB.vesa} VESA pattern, and roughly ${mB.smpteM.toFixed(2)} m for SMPTE 30° seating distance.`,
        },
        {
          q: "Does ScaleAndFit render overlays accurately on any screen?",
          a: "Yes. Proportions are calculated directly in browser memory in centimeters and inches with zero server uploads.",
        },
      ],
      nl: [
        {
          q: `Hoeveel groter is een ${b.label} vergeleken met een ${a.label}?`,
          a: `Een ${b.label} meet ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm en biedt ${areaPct}% meer schermoppervlak dan een ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
        },
        {
          q: `Welke kijkafstand en VESA-maat hoort bij een ${b.label}?`,
          a: `Reken op circa ${mB.smpteM.toFixed(2)} m (SMPTE 30°) kijkafstand, ${standWidthCm} cm meubelbreedte en een ${mB.vesa} VESA-beugel.`,
        },
      ],
      fr: [
        {
          q: `Quelle est la différence réelle entre un écran ${a.label} et ${b.label} ?`,
          a: `Un ${b.label} mesure ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm et offre ${areaPct}% de surface d'image supplémentaire face à un ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
        },
        {
          q: `Quel recul et support VESA prévoir pour un ${b.label} ?`,
          a: `Prévoyez un recul optimal de ${mB.smpteM.toFixed(2)} m (norme SMPTE 30°), une largeur libre de ${standWidthCm} cm et une fixation VESA ${mB.vesa}.`,
        },
      ],
      de: [
        {
          q: `Wie viel größer ist ein ${b.label} als ein ${a.label}?`,
          a: `Ein ${b.label} misst ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm und liefert ${areaPct}% mehr Bildfläche als ein ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
        },
        {
          q: `Welcher Sitzabstand und VESA-Standard passt zum ${b.label}?`,
          a: `Optimal sind ${mB.smpteM.toFixed(2)} m Abstand (SMPTE 30°), ${standWidthCm} cm Stellbreite und eine ${mB.vesa} VESA-Halterung.`,
        },
      ],
      es: [
        {
          q: `¿Cuánto más grande es una pantalla ${b.label} que una ${a.label}?`,
          a: `Una ${b.label} mide ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm, ofreciendo un ${areaPct}% más de área visual que una ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm).`,
        },
        {
          q: `¿Qué distancia y soporte VESA necesita una ${b.label}?`,
          a: `Se recomiendan ${mB.smpteM.toFixed(2)} m de distancia (SMPTE 30°), ${standWidthCm} cm de espacio libre y anclaje VESA ${mB.vesa}.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    const cStr = air.carryOnCm.join(" × ");
    const pStr = air.personalItemCm.join(" × ");
    const map = {
      en: [
        {
          q: `What are the carry-on dimensions for ${air.name} (${air.iata})?`,
          a: `${air.name} permits overhead cabin luggage up to ${cStr} cm (${dimsLiters(air.carryOnCm)} L, max ${air.carryOnWeightKg} kg) and an under-seat bag of ${pStr} cm.`,
        },
        {
          q: `Does ${air.name} include an overhead cabin bag on entry tickets?`,
          a: air.overheadFree
            ? `Standard economy fares on ${air.name} generally include an overhead carry-on bag up to ${cStr} cm; confirm promo basic tiers at checkout.`
            : `${air.name} basic fares cover only the ${pStr} cm under-seat item for free; larger ${cStr} cm cabin rollers require a paid priority or cabin upgrade.`,
        },
      ],
      nl: [
        {
          q: `Wat zijn de maximale handbagagematen bij ${air.name} (${air.iata})?`,
          a: `${air.name} staat cabinebagage tot ${cStr} cm (${dimsLiters(air.carryOnCm)} L, max ${air.carryOnWeightKg} kg) toe plus een tas van ${pStr} cm onder de stoel.`,
        },
        {
          q: `Is een rolkoffer inbegrepen bij het goedkoopste ticket van ${air.name}?`,
          a: air.overheadFree
            ? `Standaard economy tickets bij ${air.name} bieden meestal een hoofdbagage van ${cStr} cm inbegrepen.`
            : `Bij een basistarief van ${air.name} is alleen een kleine tas van ${pStr} cm onder de stoel inbegrepen.`,
        },
      ],
      fr: [
        {
          q: `Quelles sont les dimensions bagage cabine de ${air.name} (${air.iata}) ?`,
          a: `${air.name} accepte en cabine jusqu'à ${cStr} cm (${dimsLiters(air.carryOnCm)} L, ${air.carryOnWeightKg} kg max) et un petit sac sous le siège de ${pStr} cm.`,
        },
        {
          q: `Le bagage cabine supérieur est-il gratuit chez ${air.name} ?`,
          a: air.overheadFree
            ? `Les billets classiques ${air.name} incluent généralement le bagage de ${cStr} cm en soute ou compartiment supérieur.`
            : `En tarif d'appel ${air.name}, seul le sac sous le siège (${pStr} cm) est gratuit ; la valise ${cStr} cm est en option payante.`,
        },
      ],
      de: [
        {
          q: `Welche Handgepäckmaße gelten bei ${air.name} (${air.iata})?`,
          a: `${air.name} erlaubt Kabinengepäck bis ${cStr} cm (${dimsLiters(air.carryOnCm)} L, max. ${air.carryOnWeightKg} kg) sowie eine Tasche unter dem Vordersitz von ${pStr} cm.`,
        },
        {
          q: `Ist ein Kabinentrolley im Basistarif von ${air.name} enthalten?`,
          a: air.overheadFree
            ? `Reguläre Economy-Tarife von ${air.name} enthalten meist ein Gepäckstück bis ${cStr} cm.`
            : `Im Basistarif von ${air.name} ist nur das persönliche Stück (${pStr} cm) kostenfrei.`,
        },
      ],
      es: [
        {
          q: `¿Qué medidas de equipaje de mano permite ${air.name} (${air.iata})?`,
          a: `${air.name} permite maletas de cabina de hasta ${cStr} cm (${dimsLiters(air.carryOnCm)} L, ${air.carryOnWeightKg} kg máx.) y un bolso bajo el asiento de ${pStr} cm.`,
        },
        {
          q: `¿La tarifa básica de ${air.name} incluye maleta en compartimento superior?`,
          a: air.overheadFree
            ? `Por lo general la tarifa estándar de ${air.name} incluye equipaje en cabina de ${cStr} cm.`
            : `Con la tarifa básica de ${air.name} solo viaja gratis el artículo personal de ${pStr} cm.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "airline-compare") {
    const { airA, airB } = route.meta;
    const cA = airA.carryOnCm.join(" × ");
    const cB = airB.carryOnCm.join(" × ");
    const pA = airA.personalItemCm.join(" × ");
    const pB = airB.personalItemCm.join(" × ");
    const map = {
      en: [
        {
          q: `Will a ${airA.name} bag fit on ${airB.name}?`,
          a: `${airA.name} allows ${cA} cm (${airA.carryOnWeightKg} kg) while ${airB.name} caps overhead bags at ${cB} cm (${airB.carryOnWeightKg} kg). Match the smaller dimension across all three axes before flying both carriers.`,
        },
        {
          q: `How do ${airA.name} and ${airB.name} under-seat personal bags compare?`,
          a: `${airA.name} personal sizer measures ${pA} cm (${dimsLiters(airA.personalItemCm)} L) compared to ${airB.name} at ${pB} cm (${dimsLiters(airB.personalItemCm)} L).`,
        },
      ],
      nl: [
        {
          q: `Past mijn ${airA.name}-koffer ook bij ${airB.name}?`,
          a: `${airA.name} hanteert ${cA} cm (${airA.carryOnWeightKg} kg) tegenover ${airB.name} met ${cB} cm (${airB.carryOnWeightKg} kg). Gebruik altijd de strengste maat van beide maatschappijen.`,
        },
      ],
      fr: [
        {
          q: `Une valise ${airA.name} est-elle acceptée par ${airB.name} ?`,
          a: `${airA.name} autorise ${cA} cm (${airA.carryOnWeightKg} kg) alors que ${airB.name} limite à ${cB} cm (${airB.carryOnWeightKg} kg). Vérifiez la plus petite cote sur chaque axe.`,
        },
      ],
      de: [
        {
          q: `Passt ein ${airA.name}-Handgepäckstück auch bei ${airB.name}?`,
          a: `${airA.name} erlaubt ${cA} cm (${airA.carryOnWeightKg} kg), während ${airB.name} ${cB} cm (${airB.carryOnWeightKg} kg) vorgibt. Entscheidend ist jeweils das kleinere Maß je Achse.`,
        },
      ],
      es: [
        {
          q: `¿Sirve una maleta de ${airA.name} para volar con ${airB.name}?`,
          a: `${airA.name} acepta ${cA} cm (${airA.carryOnWeightKg} kg) frente a ${cB} cm (${airB.carryOnWeightKg} kg) en ${airB.name}. Conviene ajustarse al límite más estricto en los tres ejes.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "mattress-compare") {
    const { a, b } = route.meta;
    const minRoomW = Math.round(b.widthCm + 120);
    const map = {
      en: [
        {
          q: `What is the exact size difference between ${a.label} and ${b.label}?`,
          a: `${b.label} measures ${b.widthCm} × ${b.lengthCm} cm compared to ${a.label} (${a.widthCm} × ${a.lengthCm} cm), a ${(b.widthCm - a.widthCm).toFixed(1)} cm width delta.`,
        },
        {
          q: `What bedroom width fits a ${b.label} comfortably?`,
          a: `Leave 60 cm walking clearance on both sides, requiring at least ${minRoomW} cm total room width.`,
        },
      ],
      nl: [
        {
          q: `Hoeveel breder is ${b.label} dan ${a.label}?`,
          a: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) verschilt ${(b.widthCm - a.widthCm).toFixed(1)} cm in breedte van ${a.label} (${a.widthCm} × ${a.lengthCm} cm). Voorzie minstens ${minRoomW} cm kamerbreedte voor 60 cm looppaden.`,
        },
      ],
      fr: [
        {
          q: `Quelle différence de largeur entre ${a.label} et ${b.label} ?`,
          a: `Un matelas ${b.label} (${b.widthCm} × ${b.lengthCm} cm) varie de ${(b.widthCm - a.widthCm).toFixed(1)} cm par rapport au ${a.label} (${a.widthCm} × ${a.lengthCm} cm), avec ${minRoomW} cm de largeur de pièce recommandée.`,
        },
      ],
      de: [
        {
          q: `Wie groß ist der Breitenunterschied zwischen ${a.label} und ${b.label}?`,
          a: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) bietet ${(b.widthCm - a.widthCm).toFixed(1)} cm Differenz gegenüber ${a.label} (${a.widthCm} × ${a.lengthCm} cm) bei empfohlenen ${minRoomW} cm Raumbreite.`,
        },
      ],
      es: [
        {
          q: `¿Cuánta diferencia hay entre ${a.label} y ${b.label}?`,
          a: `El colchón ${b.label} (${b.widthCm} × ${b.lengthCm} cm) tiene ${(b.widthCm - a.widthCm).toFixed(1)} cm de diferencia frente a ${a.label} (${a.widthCm} × ${a.lengthCm} cm); reserve al menos ${minRoomW} cm de ancho en el dormitorio.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmtW = format === "a4" ? 210 : 215.9;
    const fmtH = format === "a4" ? 297 : 279.4;
    const map = {
      en: [
        {
          q: "Are exported PDF grids true to millimeter scale when printed?",
          a: `Yes. Vectors are drawn at 72 PostScript points per inch on ${format.toUpperCase()} (${fmtW} × ${fmtH} mm) with ${spacingMm} mm spacing. Set printer scaling to 100% / Actual Size.`,
        },
      ],
      nl: [
        {
          q: `Klopt de ${spacingMm} mm schaal na het printen op ${format.toUpperCase()}?`,
          a: `Ja. De vector-PDF (${fmtW} × ${fmtH} mm) print exact op 100% Ware Grootte zonder browser-marges of kwaliteitsverlies.`,
        },
      ],
      fr: [
        {
          q: `La grille de ${spacingMm} mm reste-t-elle exacte à l'impression ${format.toUpperCase()} ?`,
          a: `Oui, le tracé vectoriel (${fmtW} × ${fmtH} mm) conserve sa cote exacte en choisissant 100% Taille Réelle dans votre imprimante.`,
        },
      ],
      de: [
        {
          q: `Bleibt das ${spacingMm}-mm-Raster beim Druck auf ${format.toUpperCase()} maßhaltig?`,
          a: `Ja. Die Vektordatei (${fmtW} × ${fmtH} mm) druckt exakt maßstabsgetreu bei 100 % Originalgröße im Druckermenü.`,
        },
      ],
      es: [
        {
          q: `¿La cuadrícula de ${spacingMm} mm conserva la escala exacta en ${format.toUpperCase()}?`,
          a: `Sí. Al imprimir a Escala 100% / Tamaño Real sobre formato ${format.toUpperCase()} (${fmtW} × ${fmtH} mm), cada trazo vectorial mide exactamente ${spacingMm} mm.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    const map = {
      en: [
        {
          q: `How many ${year} public holidays are included for ${cname}?`,
          a: `This printable calendar pre-fills all ${holidays.length} listed ${year} ${cname} public holidays across a clean 12-month pack or single-month vector PDF.`,
        },
      ],
      nl: [
        {
          q: `Welke feestdagen staan op de ${year} kalender van ${cname}?`,
          a: `Alle ${holidays.length} officiële feestdagen voor ${cname} in ${year} worden direct als scherp 12-maanden of maandoverzicht in PDF gegenereerd.`,
        },
      ],
      fr: [
        {
          q: `Combien de jours fériés ${year} figurent sur le calendrier ${cname} ?`,
          a: `Le fichier PDF intègre directement les ${holidays.length} jours fériés ${year} de ${cname} en version annuelle ou mensuelle.`,
        },
      ],
      de: [
        {
          q: `Wie viele Feiertage sind im Kalender ${year} für ${cname} markiert?`,
          a: `Alle ${holidays.length} gesetzlichen Feiertage (${cname}, ${year}) lassen sich als 12-Monats-Paket oder Monatsblatt im PDF-Format ausdrucken.`,
        },
      ],
      es: [
        {
          q: `¿Cuántos festivos oficiales de ${cname} incluye el calendario ${year}?`,
          a: `Contiene los ${holidays.length} días festivos de ${cname} en ${year} listos para descargar en PDF anual o mensual con semana Lunes o Domingo.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "avery-label") {
    const av = route.meta.avery;
    const count = av.cols * av.rows;
    const map = {
      en: [
        {
          q: `How do I align ${av.name} (${av.labelWidthMm} × ${av.labelHeightMm} mm) without printer drift?`,
          a: `Print one test sheet on plain ${av.paper.toUpperCase()} paper, hold it behind your ${av.code} label sheet (${count}/sheet) against daylight, and dial in exact millimeter X/Y shift offsets.`,
        },
      ],
      nl: [
        {
          q: `Hoe voorkom ik schuivende marges bij ${av.code} (${count} etiketten)?`,
          a: `Print eerst een proefvel (${av.labelWidthMm} × ${av.labelHeightMm} mm) op gewoon ${av.paper.toUpperCase()}-papier en corrigeer de X/Y-millimeterschuif voordat u op uw echte stickervellen drukt.`,
        },
      ],
      fr: [
        {
          q: `Comment éviter un décalage d'impression sur ${av.code} (${av.labelWidthMm} × ${av.labelHeightMm} mm) ?`,
          a: `Faites un tirage test sur feuille blanche ${av.paper.toUpperCase()}, vérifiez par transparence et ajustez le décalage X/Y au millimètre pour les ${count} étiquettes.`,
        },
      ],
      de: [
        {
          q: `Wie kalibriere ich ${av.code}-Etiketten (${av.labelWidthMm} × ${av.labelHeightMm} mm) ohne Versatz?`,
          a: `Drucken Sie eine Testseite (${count} Etiketten auf ${av.paper.toUpperCase()}), halten Sie diese gegen Licht auf Ihren Bogen und justieren Sie den X/Y-Versatz in Millimetern.`,
        },
      ],
      es: [
        {
          q: `¿Cómo evito que la impresora descuadre las ${count} etiquetas ${av.code}?`,
          a: `Imprima una prueba en hoja ${av.paper.toUpperCase()} (${av.labelWidthMm} × ${av.labelHeightMm} mm), compruébela al trasluz y ajuste el desplazamiento X/Y exacto en milímetros.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const fromB = route.meta.bA || { name: "Nike", offsetMm: 0 };
    const toB = route.meta.bB || { name: "Adidas", offsetMm: 2 };
    const focus = route.meta.metricLabel || `${fromB.name} to ${toB.name}`;
    const map = {
      en: [
        {
          q: `How do I convert ${focus} using Mondopoint millimeters?`,
          a: `Check your exact foot length in centimeters/millimeters (ISO 9407 Mondopoint) and apply ${fromB.name} (${fromB.offsetMm >= 0 ? "+" : ""}${fromB.offsetMm} mm) vs ${toB.name} (${toB.offsetMm >= 0 ? "+" : ""}${toB.offsetMm} mm) last offsets.`,
        },
      ],
      nl: [
        {
          q: `Hoe reken ik ${focus} foutloos om met voetlengte in mm?`,
          a: `Meet uw voetlengte van hiel tot teen in millimeters (ISO 9407) of lees CM/JP op het maatlabel; pas daarna de pasvormcorrectie toe tussen ${fromB.name} (${fromB.offsetMm} mm) en ${toB.name} (${toB.offsetMm} mm).`,
        },
      ],
      fr: [
        {
          q: `Comment convertir ${focus} sans erreur de pointure ?`,
          a: `Appuyez-vous sur la longueur réelle du pied en millimètres (ISO 9407) ainsi que sur l'écart de chaussant entre ${fromB.name} (${fromB.offsetMm} mm) et ${toB.name} (${toB.offsetMm} mm).`,
        },
      ],
      de: [
        {
          q: `Wie rechne ich ${focus} präzise über Millimeter-Mondopoint um?`,
          a: `Nutzen Sie Ihre gemessene Fußlänge (ISO 9407) und berücksichtigen Sie die Leisten-Abweichung von ${fromB.name} (${fromB.offsetMm} mm) zu ${toB.name} (${toB.offsetMm} mm).`,
        },
      ],
      es: [
        {
          q: `¿Cómo calcular exactamente ${focus} por longitud del pie en mm?`,
          a: `Mida su pie en milímetros (norma ISO 9407 Mondopoint) y compense la horma entre ${fromB.name} (${fromB.offsetMm} mm) y ${toB.name} (${toB.offsetMm} mm).`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "ring-guide") {
    const diam = Number(route.preset?.ringDiameterMm || 18.14);
    const circ = (Math.PI * diam).toFixed(1);
    const eu = Math.round(Math.PI * diam);
    const map = {
      en: [
        {
          q: `What EU and US size corresponds to ${diam} mm inside ring diameter?`,
          a: `An inside diameter of ${diam} mm equals ${circ} mm inner circumference (ISO 8653 / EU size ${eu}), calibrated accurately on screen using any 85.60 mm payment card.`,
        },
      ],
      nl: [
        {
          q: `Welke Europese ringmaat hoort bij ${diam} mm binnendiameter?`,
          a: `${diam} mm diameter komt overeen met ${circ} mm binnenomtrek (EU/ISO 8653 maat ${eu}), direct op uw scherm te kalibreren met een bankpas van 85,60 mm.`,
        },
      ],
      fr: [
        {
          q: `Quelle taille de bague correspond à un diamètre de ${diam} mm ?`,
          a: `Un diamètre intérieur de ${diam} mm donne ${circ} mm de circonférence (taille ISO/EU ${eu}), vérifiable sur écran avec n'importe quelle carte de 85,60 mm.`,
        },
      ],
      de: [
        {
          q: `Welche Ringgröße entspricht einem Innendurchmesser von ${diam} mm?`,
          a: `${diam} mm Durchmesser entsprechen ${circ} mm Ringumfang (ISO 8653 / EU-Größe ${eu}), per 85,60-mm-Bankkarte exakt auf dem Display geeicht.`,
        },
      ],
      es: [
        {
          q: `¿Qué talla europea equivale a un diámetro interior de ${diam} mm?`,
          a: `Un diámetro interno de ${diam} mm equivale a ${circ} mm de circunferencia (talla ISO/EU ${eu}), calibrado en pantalla con cualquier tarjeta de 85,60 mm.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const wPx = Math.round((sp.widthMm / 25.4) * 300);
    const hPx = Math.round((sp.heightMm / 25.4) * 300);
    const retailer = route.meta.sheetRetailer;
    const map = {
      en: [
        {
          q: retailer
            ? `How many ${sp.widthMm}×${sp.heightMm} mm portraits fit on a ${retailer} 4×6 / 10×15 sheet?`
            : `What are the pixel and head-height rules for ${sp.country} ${sp.documentType}?`,
          a: `${sp.country} ${sp.documentType} requires ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px at 300 DPI) with ${sp.minHeadMm}–${sp.maxHeadMm} mm head height and zero server uploads.`,
        },
        {
          q: "Are portrait photos ever sent to an external server?",
          a: "Never. Cropping, brightness, background boost, and 300-DPI 4×6 print sheets execute strictly inside browser Canvas memory.",
        },
      ],
      nl: [
        {
          q: `Welke pixels en hoofdhoogte gelden voor ${sp.country} (${sp.widthMm}×${sp.heightMm} mm)?`,
          a: `Formaat: ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px op 300 DPI), gezichtshoogte ${sp.minHeadMm}–${sp.maxHeadMm} mm. Alles draait privé op uw eigen apparaat.`,
        },
      ],
      fr: [
        {
          q: `Quelles dimensions exactes pour ${sp.country} (${sp.documentType}) ?`,
          a: `Gabarit officiel de ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px à 300 DPI), hauteur de tête entre ${sp.minHeadMm} et ${sp.maxHeadMm} mm, traité 100 % localement.`,
        },
      ],
      de: [
        {
          q: `Welche Pixel- und Kopfgrößen gelten für ${sp.country} (${sp.documentType})?`,
          a: `Vorgabe: ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px bei 300 DPI) und ${sp.minHeadMm}–${sp.maxHeadMm} mm Kopfhöhe – Verarbeitung komplett lokal im Browser.`,
        },
      ],
      es: [
        {
          q: `¿Qué medidas en píxeles y cabeza exige ${sp.country} (${sp.documentType})?`,
          a: `Tamaño oficial de ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px a 300 DPI) con altura de cabeza de ${sp.minHeadMm}–${sp.maxHeadMm} mm, procesado sin salir de su dispositivo.`,
        },
      ],
    };
    return map[lang] || map.en;
  }

  return [];
}

function buildGeoCapsule(route, lang, calc) {
  if (route.kind === "screen-compare") {
    const { a, b } = route.meta;
    const { mA, mB, areaPct } = calc;
    return (
      {
        en: `A ${b.label} measures ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm (${mB.wIn.toFixed(1)} × ${mB.hIn.toFixed(1)} in), offering +${areaPct}% more screen surface than a ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm). Recommended SMPTE 30° seating distance for ${b.label} is ${mB.smpteM.toFixed(2)} m using a ${mB.vesa} VESA mount.`,
        nl: `Een ${b.label} meet ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm en biedt ${areaPct}% meer beeldoppervlak dan een ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm). Aanbevolen SMPTE 30°-kijkafstand is ${mB.smpteM.toFixed(2)} m met ${mB.vesa} VESA-bevestiging.`,
        fr: `Un écran ${b.label} mesure ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm, soit ${areaPct}% de surface en plus qu'un ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm). Distance recommandée SMPTE 30° : ${mB.smpteM.toFixed(2)} m (VESA ${mB.vesa}).`,
        de: `Ein ${b.label} misst ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm und bietet ${areaPct}% mehr Bildfläche als ein ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm). Empfohlener SMPTE-30°-Abstand: ${mB.smpteM.toFixed(2)} m (VESA ${mB.vesa}).`,
        es: `Una pantalla ${b.label} mide ${mB.wCm.toFixed(1)} × ${mB.hCm.toFixed(1)} cm, sumando un ${areaPct}% más de superficie que una ${a.label} (${mA.wCm.toFixed(1)} × ${mA.hCm.toFixed(1)} cm). Distancia SMPTE 30° recomendada: ${mB.smpteM.toFixed(2)} m (VESA ${mB.vesa}).`,
      }[lang] || ""
    );
  }
  if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    const c = air.carryOnCm.join(" × ");
    const p = air.personalItemCm.join(" × ");
    return (
      {
        en: `${air.name} (${air.iata}) limits overhead carry-on bags to ${c} cm (${dimsLiters(air.carryOnCm)} L, max ${air.carryOnWeightKg} kg) and free under-seat personal items to ${p} cm (${dimsLiters(air.personalItemCm)} L). Policy note: ${air.policyNote}.`,
        nl: `${air.name} (${air.iata}) hanteert een maximale cabinebagagemaat van ${c} cm (${dimsLiters(air.carryOnCm)} L, max ${air.carryOnWeightKg} kg) en ${p} cm voor onder de stoel.`,
        fr: `${air.name} (${air.iata}) limite les bagages cabine à ${c} cm (${dimsLiters(air.carryOnCm)} L, max ${air.carryOnWeightKg} kg) et les sacs sous le siège à ${p} cm.`,
        de: `${air.name} (${air.iata}) erlaubt maximal ${c} cm Kabinengepäck (${dimsLiters(air.carryOnCm)} L, ${air.carryOnWeightKg} kg) sowie ${p} cm unter dem Vordersitz.`,
        es: `${air.name} (${air.iata}) fija el equipaje en cabina superior en ${c} cm (${dimsLiters(air.carryOnCm)} L, ${air.carryOnWeightKg} kg) y el bolso bajo el asiento en ${p} cm.`,
      }[lang] || ""
    );
  }
  if (route.kind === "airline-compare") {
    const { airA, airB } = route.meta;
    const tightL = Math.min(airA.carryOnCm[0], airB.carryOnCm[0]);
    const tightW = Math.min(airA.carryOnCm[1], airB.carryOnCm[1]);
    const tightD = Math.min(airA.carryOnCm[2], airB.carryOnCm[2]);
    const tightKg = Math.min(airA.carryOnWeightKg, airB.carryOnWeightKg);
    return (
      {
        en: `Comparing ${airA.name} (${airA.carryOnCm.join("×")} cm, ${airA.carryOnWeightKg} kg) vs ${airB.name} (${airB.carryOnCm.join("×")} cm, ${airB.carryOnWeightKg} kg): the safe suitcase size that clears both sizer cages is ${tightL} × ${tightW} × ${tightD} cm at ${tightKg} kg.`,
        nl: `${airA.name} (${airA.carryOnCm.join("×")} cm, ${airA.carryOnWeightKg} kg) vs ${airB.name} (${airB.carryOnCm.join("×")} cm, ${airB.carryOnWeightKg} kg): het veilige gezamenlijke kofferformaat is ${tightL} × ${tightW} × ${tightD} cm (max ${tightKg} kg).`,
        fr: `${airA.name} (${airA.carryOnCm.join("×")} cm) contre ${airB.name} (${airB.carryOnCm.join("×")} cm) : un bagage de ${tightL} × ${tightW} × ${tightD} cm (${tightKg} kg max) respecte les deux compagnies.`,
        de: `${airA.name} (${airA.carryOnCm.join("×")} cm) vs. ${airB.name} (${airB.carryOnCm.join("×")} cm): Das gemeinsame sichere Koffermaß beträgt ${tightL} × ${tightW} × ${tightD} cm bei maximal ${tightKg} kg.`,
        es: `${airA.name} (${airA.carryOnCm.join("×")} cm) frente a ${airB.name} (${airB.carryOnCm.join("×")} cm): la maleta compatible con ambas aerolíneas mide máximo ${tightL} × ${tightW} × ${tightD} cm y ${tightKg} kg.`,
      }[lang] || ""
    );
  }
  if (route.kind === "mattress-compare") {
    const { a, b } = route.meta;
    return (
      {
        en: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) compares to ${a.label} (${a.widthCm} × ${a.lengthCm} cm) with a width difference of ${(b.widthCm - a.widthCm).toFixed(1)} cm. Plan at least ${(b.widthCm + 120).toFixed(0)} cm room width for dual 60 cm walkways.`,
        nl: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) tegenover ${a.label} (${a.widthCm} × ${a.lengthCm} cm) scheelt ${(b.widthCm - a.widthCm).toFixed(1)} cm in breedte.`,
        fr: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) par rapport à ${a.label} (${a.widthCm} × ${a.lengthCm} cm) offre ${(b.widthCm - a.widthCm).toFixed(1)} cm d'écart en largeur.`,
        de: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) gegenüber ${a.label} (${a.widthCm} × ${a.lengthCm} cm) unterscheidet sich um ${(b.widthCm - a.widthCm).toFixed(1)} cm Breite.`,
        es: `${b.label} (${b.widthCm} × ${b.lengthCm} cm) frente a ${a.label} (${a.widthCm} × ${a.lengthCm} cm) presenta ${(b.widthCm - a.widthCm).toFixed(1)} cm de diferencia en ancho.`,
      }[lang] || ""
    );
  }
  if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmtW = format === "a4" ? 210 : 215.9;
    const fmtH = format === "a4" ? 297 : 279.4;
    return `ISO/ANSI vector PDF (${format.toUpperCase()} ${fmtW} × ${fmtH} mm) at exact ${spacingMm} mm (${((spacingMm * 72) / 25.4).toFixed(2)} pt) spacing — print at 100% scale.`;
  }
  if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    return `${year} ${cname} printable vector PDF calendar pre-loaded with ${holidays.length} official national holidays and toggleable Monday/Sunday week starts.`;
  }
  if (route.kind === "avery-label") {
    const av = route.meta.avery;
    return `${av.name}: ${av.cols} × ${av.rows} (${av.cols * av.rows} labels/sheet), ${av.labelWidthMm} × ${av.labelHeightMm} mm cut size on ${av.paper.toUpperCase()}, calibrated with ${av.marginTopMm} mm top / ${av.marginLeftMm} mm left margins.`;
  }
  if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const fromB = route.meta.bA || { name: "Nike", offsetMm: 0 };
    const toB = route.meta.bB || { name: "Adidas", offsetMm: 2 };
    return `ISO 9407 Mondopoint foot-length conversion linking ${fromB.name} (${fromB.offsetMm >= 0 ? "+" : ""}${fromB.offsetMm} mm) and ${toB.name} (${toB.offsetMm >= 0 ? "+" : ""}${toB.offsetMm} mm) in exact millimeter steps.`;
  }
  if (route.kind === "ring-guide") {
    const diam = Number(route.preset?.ringDiameterMm || 18.14);
    const circ = (Math.PI * diam).toFixed(1);
    const eu = Math.round(Math.PI * diam);
    return `ISO 8653 ring scale reference for ${diam.toFixed(2)} mm inner diameter = ${circ} mm circumference (EU ${eu}), calibrated cleanly against any 85.60 mm ID-1 bank card.`;
  }
  if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const wPx = Math.round((sp.widthMm / 25.4) * 300);
    const hPx = Math.round((sp.heightMm / 25.4) * 300);
    return `${sp.country} ${sp.documentType}: ${sp.widthMm} × ${sp.heightMm} mm (${wPx} × ${hPx} px at 300 DPI), target head height ${sp.minHeadMm}–${sp.maxHeadMm} mm, backdrop ${sp.backgroundHex || "#FFFFFF"}, generated 100% locally in Canvas memory.`;
  }
  return "";
}

export function renderRouteReferenceHtml(route, allRoutes, lang = "en", canonicalUrl = "") {
  const tr = getBundle(lang);
  const seoLabels = tr.seo || {
    relatedTitle: "More Helpful Comparisons & Presets",
    relatedUnit: "Related",
    faqTitle: "Common Questions",
    faqUnit: "Answers",
    specLabel: "Quick Reference Table",
  };

  const uniqueRelated = pickSemanticRelated(route, allRoutes, 8);
  let tableTitle = "Specification Reference";
  let tableHtml = "";
  let calc = {};

  if (route.kind === "screen-compare") {
    const { a, b } = route.meta;
    const mA = dispMetrics(a);
    const mB = dispMetrics(b);
    const areaPct = (((mB.areaIn / mA.areaIn) - 1) * 100).toFixed(1);
    const wDiffCm = (mB.wCm - mA.wCm).toFixed(1);
    const hDiffCm = (mB.hCm - mA.hCm).toFixed(1);
    const standWidthCm = (mB.wCm + 15).toFixed(0);
    calc = { mA, mB, areaPct, standWidthCm };
    tableTitle = `${a.label} vs ${b.label} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Metric</th><th>${escapeHtml(a.label)} (${a.aspectW}:${a.aspectH})</th><th>${escapeHtml(b.label)} (${b.aspectW}:${b.aspectH})</th><th>Delta</th></tr></thead>
          <tbody>
            <tr><td>Visible Width</td><td>${mA.wCm.toFixed(1)} cm (${mA.wIn.toFixed(1)} in)</td><td>${mB.wCm.toFixed(1)} cm (${mB.wIn.toFixed(1)} in)</td><td>${Number(wDiffCm) >= 0 ? "+" : ""}${wDiffCm} cm</td></tr>
            <tr><td>Visible Height</td><td>${mA.hCm.toFixed(1)} cm (${mA.hIn.toFixed(1)} in)</td><td>${mB.hCm.toFixed(1)} cm (${mB.hIn.toFixed(1)} in)</td><td>${Number(hDiffCm) >= 0 ? "+" : ""}${hDiffCm} cm</td></tr>
            <tr><td>Screen Area</td><td>${mA.areaCm.toFixed(0)} cm² (${mA.areaIn.toFixed(0)} in²)</td><td>${mB.areaCm.toFixed(0)} cm² (${mB.areaIn.toFixed(0)} in²)</td><td>+${areaPct}% area</td></tr>
            <tr><td>SMPTE 30° Distance</td><td>${mA.smpteM.toFixed(2)} m</td><td>${mB.smpteM.toFixed(2)} m</td><td>Cinema 40°: ${mB.cinemaM.toFixed(2)} m</td></tr>
            <tr><td>Recommended VESA</td><td>${mA.vesa}</td><td>${mB.vesa}</td><td>Min Console: ${standWidthCm} cm</td></tr>
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "airline-bag") {
    const air = route.meta.airline;
    tableTitle = `${air.name} (${air.iata}) — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Category</th><th>Metric (cm & Vol)</th><th>Imperial (in)</th><th>Max kg / Rule</th></tr></thead>
          <tbody>
            <tr><td>Cabin Overhead Bag</td><td>${air.carryOnCm.join(" × ")} cm (${dimsLiters(air.carryOnCm)} L)</td><td>${air.carryOnCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.carryOnWeightKg} kg · ${air.overheadFree ? "Standard Fare" : "Paid/Priority"}</td></tr>
            <tr><td>Personal Under-Seat Item</td><td>${air.personalItemCm.join(" × ")} cm (${dimsLiters(air.personalItemCm)} L)</td><td>${air.personalItemCm.map((n) => (n / 2.54).toFixed(1)).join(" × ")} in</td><td>${air.personalIncluded ? "Included Free" : "Check Fare Tier"}</td></tr>
          </tbody>
        </table>
      </div>
      <p style="color:var(--muted);font-size:.86rem;margin:10px 0 0">${escapeHtml(air.policyNote)}</p>`;
  } else if (route.kind === "airline-compare") {
    const { airA, airB } = route.meta;
    const commonCm = [
      Math.min(airA.carryOnCm[0], airB.carryOnCm[0]),
      Math.min(airA.carryOnCm[1], airB.carryOnCm[1]),
      Math.min(airA.carryOnCm[2], airB.carryOnCm[2]),
    ];
    tableTitle = `${airA.name} vs ${airB.name} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Allowance</th><th>${escapeHtml(airA.name)} (${airA.iata})</th><th>${escapeHtml(airB.name)} (${airB.iata})</th><th>Common Fit</th></tr></thead>
          <tbody>
            <tr><td>Cabin Overhead Max</td><td>${airA.carryOnCm.join(" × ")} cm (${dimsLiters(airA.carryOnCm)} L)</td><td>${airB.carryOnCm.join(" × ")} cm (${dimsLiters(airB.carryOnCm)} L)</td><td>${commonCm.join(" × ")} cm</td></tr>
            <tr><td>Under-Seat Personal Item</td><td>${airA.personalItemCm.join(" × ")} cm</td><td>${airB.personalItemCm.join(" × ")} cm</td><td>${Math.min(airA.personalItemCm[0], airB.personalItemCm[0])} × ${Math.min(airA.personalItemCm[1], airB.personalItemCm[1])} × ${Math.min(airA.personalItemCm[2], airB.personalItemCm[2])} cm</td></tr>
            <tr><td>Weight Limit</td><td>${airA.carryOnWeightKg} kg</td><td>${airB.carryOnWeightKg} kg</td><td>${Math.min(airA.carryOnWeightKg, airB.carryOnWeightKg)} kg max</td></tr>
            <tr><td>Basic Fare Overhead</td><td>${airA.overheadFree ? "Included" : "Upgrade Required"}</td><td>${airB.overheadFree ? "Included" : "Upgrade Required"}</td><td>Verify Ticket Tier</td></tr>
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "mattress-compare") {
    const { a, b } = route.meta;
    const areaDelta = ((((b.widthCm * b.lengthCm) / (a.widthCm * a.lengthCm)) - 1) * 100).toFixed(1);
    tableTitle = `${a.label} vs ${b.label} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Dimension</th><th>${escapeHtml(a.label)}</th><th>${escapeHtml(b.label)}</th></tr></thead>
          <tbody>
            <tr><td>Width</td><td>${a.widthCm} cm (${(a.widthCm / 2.54).toFixed(1)} in)</td><td>${b.widthCm} cm (${(b.widthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Length</td><td>${a.lengthCm} cm (${(a.lengthCm / 2.54).toFixed(1)} in)</td><td>${b.lengthCm} cm (${(b.lengthCm / 2.54).toFixed(1)} in)</td></tr>
            <tr><td>Surface Area Delta</td><td colspan="2">${Number(areaDelta) >= 0 ? "+" : ""}${areaDelta}%</td></tr>
            <tr><td>Min Bedroom Width (60 cm sides)</td><td>${(a.widthCm + 120).toFixed(0)} cm</td><td>${(b.widthCm + 120).toFixed(0)} cm</td></tr>
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "paper-grid") {
    const { format, spacingMm } = route.meta;
    const fmtW = format === "a4" ? 210 : 215.9;
    const fmtH = format === "a4" ? 297 : 279.4;
    tableTitle = seoLabels.specLabel;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Property</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Paper Format</td><td>${format === "a4" ? "ISO A4 (210 × 297 mm)" : "US Letter (8.5 × 11 in)"}</td></tr>
            <tr><td>Grid Spacing</td><td>${spacingMm} mm (${((spacingMm * 72) / 25.4).toFixed(2)} pt)</td></tr>
            <tr><td>Safe Margin</td><td>12 mm (${Math.floor((fmtW - 24) / spacingMm)} cols × ${Math.floor((fmtH - 24) / spacingMm)} rows)</td></tr>
            <tr><td>Printer Scale</td><td>100% Actual Size</td></tr>
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "holiday-calendar") {
    const { year, cname, holidays } = route.meta;
    tableTitle = `${year} ${cname} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Holiday</th></tr></thead>
          <tbody>
            ${holidays.map((h) => `<tr><td>${h.date}</td><td>${escapeHtml(h.name)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "avery-label") {
    const av = route.meta.avery;
    tableTitle = `${av.name} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Parameter</th><th>Specification</th></tr></thead>
          <tbody>
            <tr><td>Sheet Size</td><td>${av.paper.toUpperCase()}</td></tr>
            <tr><td>Layout Grid</td><td>${av.cols} cols × ${av.rows} rows (${av.cols * av.rows} labels)</td></tr>
            <tr><td>Label Size</td><td>${av.labelWidthMm} × ${av.labelHeightMm} mm</td></tr>
            <tr><td>Margins</td><td>${av.marginTopMm} mm top · ${av.marginLeftMm} mm left</td></tr>
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "shoe-pair" || route.kind === "shoe-chart") {
    const sampleUs = [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
    const fromB = route.meta.bA || { name: "Nike", offsetMm: 0 };
    const toB = route.meta.bB || { name: "Adidas", offsetMm: 2 };
    tableTitle = `${fromB.name} → ${toB.name} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>${escapeHtml(fromB.name)} US</th><th>Foot Length (mm / cm)</th><th>${escapeHtml(toB.name)} US</th><th>EU Size</th></tr></thead>
          <tbody>
            ${sampleUs
              .map((u) => {
                const mondo = Math.round((u + 18) * 10 + fromB.offsetMm);
                const tUs = Math.round(((mondo - toB.offsetMm) / 10 - 18) * 2) / 2;
                const eu = Math.round(((mondo + 15) / (20 / 3)) * 2) / 2;
                return `<tr><td>US ${u}</td><td>${mondo} mm (${(mondo / 10).toFixed(1)} cm)</td><td>US ${tUs}</td><td>EU ${eu}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "ring-guide") {
    const diams = [15.7, 16.51, 17.35, 18.14, 18.95, 19.76, 20.57, 21.39];
    tableTitle = seoLabels.specLabel;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Inside Diameter</th><th>Circumference (EU)</th><th>US</th><th>JP</th></tr></thead>
          <tbody>
            ${diams
              .map((d) => {
                const us = Math.round(((d - 11.63) / 0.8128) * 2) / 2;
                const eu = Math.round(Math.PI * d);
                const jp = Math.max(1, Math.round((d - 12.67) / 0.333 + 1));
                return `<tr><td>${d.toFixed(2)} mm</td><td>${(Math.PI * d).toFixed(1)} mm (${eu})</td><td>US ${us}</td><td>JP ${jp}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
  } else if (route.kind === "photo-spec") {
    const sp = route.meta.spec;
    const wPx = Math.round((sp.widthMm / 25.4) * 300);
    const hPx = Math.round((sp.heightMm / 25.4) * 300);
    tableTitle = `${sp.country} ${sp.documentType} — ${seoLabels.specLabel}`;
    tableHtml = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Parameter</th><th>Requirement</th></tr></thead>
          <tbody>
            <tr><td>Print Size</td><td>${sp.widthMm} × ${sp.heightMm} mm (${(sp.widthMm / 25.4).toFixed(2)} × ${(sp.heightMm / 25.4).toFixed(2)} in)</td></tr>
            <tr><td>300 DPI Pixels</td><td>${wPx} × ${hPx} px</td></tr>
            <tr><td>Head Height</td><td>${sp.minHeadMm}–${sp.maxHeadMm} mm (${Math.round((sp.minHeadMm / sp.heightMm) * 100)}–${Math.round((sp.maxHeadMm / sp.heightMm) * 100)}%)</td></tr>
            <tr><td>Backdrop</td><td>${escapeHtml(sp.backgroundHex || "#FFFFFF")}</td></tr>
          </tbody>
        </table>
      </div>`;
  }

  const faqs = buildLocalizedFaqs(route, lang, calc);
  const geoCapsule = buildGeoCapsule(route, lang, calc);

  const geoCardHtml = geoCapsule
    ? `<div class="card geo-answer-card">
        <div class="panel-header">
          <h2 class="panel-title">${escapeHtml(localizedGeoTitle(lang))}</h2>
          <span class="section-kicker">GEO · ISO / ICAO</span>
        </div>
        <p class="geo-summary-text">${escapeHtml(geoCapsule)}</p>
      </div>`
    : "";

  const relatedHtml = uniqueRelated.length
    ? `<div class="card">
        <div class="panel-header">
          <h3 class="panel-title">${escapeHtml(seoLabels.relatedTitle)}</h3>
          <span class="section-kicker">${escapeHtml(seoLabels.relatedUnit)}</span>
        </div>
        <div class="directory-grid">
          ${uniqueRelated
            .map((r) => {
              const locR = localizeLeafRoute(r, lang);
              return `<a class="directory-link" href="${escapeHtml(locR.path)}"><span>${escapeHtml(locR.h1)}</span><span aria-hidden="true">&rarr;</span></a>`;
            })
            .join("")}
        </div>
      </div>`
    : "";

  const faqHtml = faqs.length
    ? `<div class="card">
        <div class="panel-header">
          <h3 class="panel-title">${escapeHtml(seoLabels.faqTitle)}</h3>
          <span class="section-kicker">${faqs.length} ${escapeHtml(seoLabels.faqUnit)}</span>
        </div>
        <div class="faq-list">
          ${faqs.map((f) => `<div class="faq-item"><h4>${escapeHtml(f.q)}</h4><p>${escapeHtml(f.a)}</p></div>`).join("")}
        </div>
      </div>`
    : "";

  const tableCardHtml = tableHtml
    ? `<div class="card">
        <div class="panel-header">
          <h2 class="panel-title">${escapeHtml(tableTitle)}</h2>
          <span class="section-kicker">${escapeHtml(seoLabels.specLabel)}</span>
        </div>
        ${tableHtml}
      </div>`
    : "";

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const locRoute = localizeLeafRoute(route, lang);
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: locRoute.h1,
    description: geoCapsule || locRoute.description,
    url: canonicalUrl || `https://scaleandfit.com${locRoute.path}`,
    inLanguage: lang,
    license: "https://scaleandfit.com/terms/",
    creator: {
      "@type": "Organization",
      name: "ScaleAndFit (OTHRYS Systems)",
    },
  };

  return {
    html: `<section class="seo-reference container">${geoCardHtml}${tableCardHtml}${faqHtml}${relatedHtml}</section>`,
    faqJsonLd,
    datasetJsonLd,
  };
}
