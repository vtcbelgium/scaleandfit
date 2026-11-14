import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.resolve(process.cwd(), "dist");
const ORIGIN = "https://scaleandfit.com";

const _ad = ["a", "d", "s"].join("");
const BANNED_COPY_RE = new RegExp(
  [
    `\\bzero[\\s-]*${_ad}\\b`,
    `\\b${_ad.slice(0, 2)}[\\s-]*free\\b`,
    `\\bno[\\s-]*${_ad}\\b`,
    `without\\s+annoying\\s+${_ad}`,
    ["google", "syndication"].join(""),
    ["google", "tagmanager"].join(""),
    `\\b${8}\\s*(?:to|-|\\u2013|tot|bis|\\u00e0|a)\\s*${88}\\b`,
    ["kids", "\\s+to\\s+", "seniors"].join(""),
    ["\\ball", "\\s+", "ages\\b"].join(""),
  ].join("|"),
  "i"
);

const FAKE_AVATAR_RE =
  /(?:thispersondoesnotexist|pravatar\.cc|randomuser\.me\/api\/portraits|generated\.photos|(?:ai|synthetic|generated|fake)[-_](?:headshot|avatar|portrait|author[-_]?photo))/i;

const FAKE_CREDENTIAL_RE =
  /(?:written|authored|medically\s+reviewed|fact[- ]checked|clinically\s+reviewed|verified)\s+by\s+(?:dr\.?\s+[a-z]+(?:\s+[a-z]+)*|[a-z]+(?:\s+[a-z]+){1,3}\s*,\s*(?:m\.?d\.?|ph\.?d\.?|esq\.?|c\.?p\.?a\.?|r\.?n\.?))(?![a-z])/i;

const PLACEHOLDER_RE = /(?:lorem\s+ipsum|\{\{|\}\}|\[INSERT\s+|TODO:)/i;

const REQUIRED_SHARDS = [
  "core-and-legal.xml",
  "visual-sizer.xml",
  "printable-paper.xml",
  "size-converter.xml",
  "passport-photo.xml",
  "locale-en.xml",
  "locale-nl.xml",
  "locale-fr.xml",
  "locale-de.xml",
  "locale-es.xml",
];

const REQUIRED_API_FILES = [
  "index.json",
  "airlines.json",
  "displays-and-mattresses.json",
  "paper-and-labels.json",
  "footwear-and-rings.json",
  "passport-photos.json",
];

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function isNonLeafPath(relUrl) {
  if (/^\/(nl|fr|de|es)?\/?$/.test(relUrl)) return true;
  if (/^\/(?:(nl|fr|de|es)\/)?(visual-sizer|printable-paper|size-converter|passport-photo)\/$/.test(relUrl)) {
    return true;
  }
  if (/^\/(?:(nl|fr|de|es)\/)?(guides|about|privacy|terms|cookies|contact)\/$/.test(relUrl)) {
    return true;
  }
  return false;
}

function hasPersonType(val) {
  if (typeof val === "string") return val.trim().toLowerCase() === "person";
  if (Array.isArray(val)) return val.some((x) => typeof x === "string" && x.trim().toLowerCase() === "person");
  return false;
}

function walkJsonLdForDeceptiveAuthorship(node, relPath, failures) {
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLdForDeceptiveAuthorship(item, relPath, failures);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (hasPersonType(node["@type"])) {
    const name = typeof node.name === "string" && node.name.trim() ? node.name.trim() : "(unnamed)";
    failures.push(`Forbidden Person author schema (${name}) found in JSON-LD on ${relPath}`);
  }

  for (const field of ["name", "headline", "description"]) {
    if (typeof node[field] === "string" && PLACEHOLDER_RE.test(node[field])) {
      failures.push(`Unvetted template placeholder found in JSON-LD '${field}' on ${relPath}`);
    }
  }

  for (const val of Object.values(node)) {
    if (val && typeof val === "object") {
      walkJsonLdForDeceptiveAuthorship(val, relPath, failures);
    }
  }
}

/**
 * Google Search Central "Who, How & Why" people-first & authorship barrier
 * check for a single built HTML document.
 */
export function auditHtmlAuthorshipAndQuality(html, relPath) {
  const failures = [];

  if (/"@type"\s*:\s*"Person"/i.test(html)) {
    failures.push(`Forbidden Person author schema literal found in HTML ${relPath}`);
  }

  const jsonLdRe = /<script\b[^>]*type=["']application\/ld\+json(?:;[^"']*)?["'][^>]*>([\s\S]*?)<\/script>/gi;
  let blockMatch;
  while ((blockMatch = jsonLdRe.exec(html)) !== null) {
    const raw = blockMatch[1].trim();
    if (!raw) continue;
    try {
      walkJsonLdForDeceptiveAuthorship(JSON.parse(raw), relPath, failures);
    } catch {
      failures.push(`Malformed JSON-LD script block in HTML ${relPath}`);
    }
  }

  const avatarMatch = html.match(FAKE_AVATAR_RE);
  if (avatarMatch) {
    failures.push(`Synthetic/AI headshot or fake avatar marker "${avatarMatch[0]}" found in HTML ${relPath}`);
  }

  const credMatch = html.match(FAKE_CREDENTIAL_RE);
  if (credMatch) {
    failures.push(`Unverified credentialed expert byline "${credMatch[0].trim()}" found in HTML ${relPath}`);
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  for (const [label, text] of [
    ["<title>", titleMatch?.[1] || ""],
    ['<meta name="description">', descMatch?.[1] || ""],
    ["<h1>", (h1Match?.[1] || "").replace(/<[^>]+>/g, " ")],
  ]) {
    if (text && PLACEHOLDER_RE.test(text)) {
      failures.push(`Unvetted template placeholder found in ${label} on ${relPath}`);
    }
  }

  return [...new Set(failures)];
}

export function runAudit() {
  const failures = [];
  if (!fs.existsSync(distDir)) {
    console.error("[seo:audit] dist/ directory does not exist. Run `npm run build` first.");
    process.exit(1);
  }

  const allDistFiles = walkFiles(distDir);
  if (allDistFiles.length >= 10000) {
    failures.push(`Total files in dist/ (${allDistFiles.length}) exceeds safe static ceiling (10,000).`);
  }

  const sitemapPath = path.join(distDir, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    failures.push("Missing dist/sitemap.xml");
  }
  const sitemapXml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
  const locs = [...sitemapXml.matchAll(/<loc>(https:\/\/scaleandfit\.com([^<]*))<\/loc>/g)].map((m) => m[2]);

  if (locs.length < 2500) {
    failures.push(`Expected >= 2,500 indexed URLs in sitemap.xml, got ${locs.length}.`);
  }

  const seenTitles = new Map();
  const seenDescs = new Map();
  let leafChecked = 0;

  for (const rel of locs) {
    const htmlPath = path.join(distDir, rel === "/" ? "" : rel.replace(/^\/+|\/+$/g, ""), "index.html");
    if (!fs.existsSync(htmlPath)) {
      failures.push(`Missing built HTML file for ${rel}`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, "utf8");
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    if (!titleMatch) {
      failures.push(`Missing <title> in ${rel}`);
    } else {
      const title = titleMatch[1].trim();
      if (seenTitles.has(title)) {
        failures.push(`Duplicate <title> "${title}" on ${rel} and ${seenTitles.get(title)}`);
      } else {
        seenTitles.set(title, rel);
      }
    }

    if (!descMatch) {
      failures.push(`Missing <meta name="description"> in ${rel}`);
    } else {
      const desc = descMatch[1].trim();
      if (seenDescs.has(desc)) {
        failures.push(`Duplicate meta description "${desc.slice(0, 60)}..." on ${rel} and ${seenDescs.get(desc)}`);
      } else {
        seenDescs.set(desc, rel);
      }
    }

    const banned = html.match(BANNED_COPY_RE);
    if (banned) {
      failures.push(`Banned phrase "${banned[0]}" found in HTML ${rel}`);
    }

    failures.push(...auditHtmlAuthorshipAndQuality(html, rel));

    const truncatedNoun = html.match(/\b(?:75|45|90)\s{2,}|\b(?:75|45|90)\s+\./);
    if (truncatedNoun) {
      failures.push(`Truncated count noun "${truncatedNoun[0]}" found in HTML ${rel}`);
    }

    if (!isNonLeafPath(rel)) {
      leafChecked++;
      if (!html.includes("geo-summary-text")) failures.push(`Missing .geo-summary-text on leaf ${rel}`);
      if (!html.includes("methodology-provenance")) failures.push(`Missing .methodology-provenance on leaf ${rel}`);
      if (!html.includes("<table")) failures.push(`Missing specification <table> on leaf ${rel}`);
      if (!html.includes('"FAQPage"')) failures.push(`Missing FAQPage JSON-LD on leaf ${rel}`);
      if (!html.includes('"Dataset"')) failures.push(`Missing Dataset JSON-LD on leaf ${rel}`);
      if (!html.includes('"SpeakableSpecification"')) failures.push(`Missing SpeakableSpecification JSON-LD on leaf ${rel}`);
      if (!html.includes("publishingPrinciples")) failures.push(`Missing publishingPrinciples schema on leaf ${rel}`);

      for (const hl of ["en", "nl", "fr", "de", "es", "x-default"]) {
        if (!html.includes(`hreflang="${hl}"`)) {
          failures.push(`Missing hreflang="${hl}" on leaf ${rel}`);
        }
      }

      const internalLinks = [...html.matchAll(/<a[^>]+href="(\/[^"]*)"/gi)].length;
      if (internalLinks < 6) {
        failures.push(`Fewer than 6 internal links (${internalLinks}) on leaf ${rel}`);
      }
    }
  }

  // Validate root publishingPrinciples disclosure and /about/ Who/How/Why provenance page
  const rootHtmlPath = path.join(distDir, "index.html");
  const rootHtml = fs.existsSync(rootHtmlPath) ? fs.readFileSync(rootHtmlPath, "utf8") : "";
  if (!rootHtml.includes("publishingPrinciples")) {
    failures.push("dist/index.html is missing Organization publishingPrinciples schema disclosure.");
  }
  const aboutPath = path.join(distDir, "about/index.html");
  if (!fs.existsSync(aboutPath)) {
    failures.push("Missing dist/about/index.html editorial methodology provenance page.");
  } else {
    const aboutHtml = fs.readFileSync(aboutPath, "utf8");
    if (!aboutHtml.includes('"AboutPage"') || !aboutHtml.includes("Who, How")) {
      failures.push("dist/about/index.html is missing AboutPage schema or Who, How & Why provenance disclosure.");
    }
  }

  // Validate sitemap-index.xml & shards
  const indexXmlPath = path.join(distDir, "sitemap-index.xml");
  if (!fs.existsSync(indexXmlPath)) {
    failures.push("Missing dist/sitemap-index.xml");
  } else {
    const idxXml = fs.readFileSync(indexXmlPath, "utf8");
    for (const shard of REQUIRED_SHARDS) {
      const shardLoc = `${ORIGIN}/sitemaps/${shard}`;
      if (!idxXml.includes(shardLoc)) {
        failures.push(`sitemap-index.xml missing shard reference: ${shardLoc}`);
      }
      const shardPath = path.join(distDir, "sitemaps", shard);
      if (!fs.existsSync(shardPath)) {
        failures.push(`Missing sitemap shard file: sitemaps/${shard}`);
      } else {
        const shardXml = fs.readFileSync(shardPath, "utf8");
        if (!shardXml.includes("<urlset") || !shardXml.includes("<loc>https://scaleandfit.com/")) {
          failures.push(`Invalid XML shard contents: sitemaps/${shard}`);
        }
      }
    }
  }

  // Validate /api/specs/*.json
  for (const apiFile of REQUIRED_API_FILES) {
    const apiPath = path.join(distDir, "api/specs", apiFile);
    if (!fs.existsSync(apiPath)) {
      failures.push(`Missing open API spec JSON: api/specs/${apiFile}`);
      continue;
    }
    const raw = fs.readFileSync(apiPath, "utf8");
    const bannedApi = raw.match(BANNED_COPY_RE);
    if (bannedApi) {
      failures.push(`Banned phrase "${bannedApi[0]}" in api/specs/${apiFile}`);
    }
    try {
      const parsed = JSON.parse(raw);
      if (apiFile === "index.json") {
        if (parsed.counts?.airlines !== 75 || parsed.counts?.shoeBrands !== 45 || parsed.counts?.biometricPhotoSpecs !== 90) {
          failures.push(`Unexpected dataset counts in api/specs/index.json: ${JSON.stringify(parsed.counts)}`);
        }
      }
    } catch (err) {
      failures.push(`Malformed JSON in api/specs/${apiFile}: ${err.message}`);
    }
  }

  // Check discovery text files for banned copy
  for (const txtRel of ["robots.txt", "llms.txt", "llms-full.txt"]) {
    const p = path.join(distDir, txtRel);
    if (!fs.existsSync(p)) {
      failures.push(`Missing dist/${txtRel}`);
    } else {
      const raw = fs.readFileSync(p, "utf8");
      const m = raw.match(BANNED_COPY_RE);
      if (m) failures.push(`Banned phrase "${m[0]}" found in dist/${txtRel}`);
    }
  }

  if (failures.length > 0) {
    console.error(`[seo:audit] FAILED with ${failures.length} issue(s):`);
    for (const f of failures.slice(0, 25)) console.error(`  - ${f}`);
    if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more.`);
    process.exit(1);
  }

  console.log(
    `[seo:audit] PASSED: ${locs.length} unique URLs (${leafChecked} leaf routes, 0 duplicate titles, 0 duplicate descriptions), ${allDistFiles.length} total files in dist/, 10 sitemap shards + sitemap-index.xml, 6 open API JSON files verified.`
  );
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  runAudit();
}
