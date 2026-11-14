import translations from "./translations.json";

export type LocaleCode = "en" | "nl" | "fr" | "de" | "es";
export type InfoPageId = "about" | "guides" | "privacy" | "terms" | "cookies" | "contact";
export type TranslationBundle = typeof translations.en;

export const VALID_LOCALES: readonly LocaleCode[] = ["en", "nl", "fr", "de", "es"] as const;
export const NON_DEFAULT_LOCALES: readonly LocaleCode[] = ["nl", "fr", "de", "es"] as const;
export const INFO_PAGE_IDS: readonly InfoPageId[] = [
  "about",
  "guides",
  "privacy",
  "terms",
  "cookies",
  "contact",
] as const;

export const LOCALES: Array<{ code: LocaleCode; nativeName: string; ogLocale: string }> = [
  { code: "en", nativeName: translations.en.meta.nativeName, ogLocale: translations.en.meta.ogLocale },
  { code: "nl", nativeName: translations.nl.meta.nativeName, ogLocale: translations.nl.meta.ogLocale },
  { code: "fr", nativeName: translations.fr.meta.nativeName, ogLocale: translations.fr.meta.ogLocale },
  { code: "de", nativeName: translations.de.meta.nativeName, ogLocale: translations.de.meta.ogLocale },
  { code: "es", nativeName: translations.es.meta.nativeName, ogLocale: translations.es.meta.ogLocale },
];

export function isValidLocale(val: string | undefined | null): val is LocaleCode {
  return val === "en" || val === "nl" || val === "fr" || val === "de" || val === "es";
}

export function isInfoPageId(val: string | undefined | null): val is InfoPageId {
  return (
    val === "about" ||
    val === "guides" ||
    val === "privacy" ||
    val === "terms" ||
    val === "cookies" ||
    val === "contact"
  );
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  for (const loc of NON_DEFAULT_LOCALES) {
    if (normalized === `/${loc}` || normalized === `/${loc}/`) {
      return "/";
    }
    if (normalized.startsWith(`/${loc}/`)) {
      return normalized.slice(loc.length + 1);
    }
  }
  return normalized || "/";
}

export function detectLocale(root?: HTMLElement | null): LocaleCode {
  const fromRoot = root?.dataset.lang;
  if (isValidLocale(fromRoot)) return fromRoot;
  const fromHtml = typeof document !== "undefined" ? document.documentElement.lang : undefined;
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  for (const loc of NON_DEFAULT_LOCALES) {
    if (pathname === `/${loc}` || pathname === `/${loc}/` || pathname.startsWith(`/${loc}/`)) {
      return loc;
    }
  }
  if (isValidLocale(fromHtml)) return fromHtml;
  return "en";
}

export function localizePath(canonicalEnPath: string, lang: LocaleCode): string {
  const cleanEn = stripLocalePrefix(canonicalEnPath);
  const withSlash = cleanEn.startsWith("/") ? cleanEn : `/${cleanEn}`;
  if (lang === "en") return withSlash;
  return withSlash === "/" ? `/${lang}/` : `/${lang}${withSlash}`;
}

export function t(lang: LocaleCode): TranslationBundle {
  return (translations[lang] || translations.en) as TranslationBundle;
}

export function saveLang(lang: LocaleCode): void {
  try {
    window.localStorage.setItem("sf-lang", lang);
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
