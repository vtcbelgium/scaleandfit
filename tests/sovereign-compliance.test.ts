import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ECONOMIC_VALVE_OPEN, renderPartnerSlot } from "../src/config/valve.js";

const BANNED_ANTI_AD_PATTERNS = [
  /\bzero[\s-]*ads\b/i,
  /\bad[\s-]*free\b/i,
  /\bno[\s-]*ads\b/i,
  /without[\s-]+annoying[\s-]+ads/i,
  /googlesyndication/i,
  /googletagmanager/i,
];

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkFiles(full));
    } else if (/\.(ts|tsx|mjs|js|html|css|md|txt|json)$/i.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("Sovereign Mandate & Closed-Valve Compliance", () => {
  it("keeps ECONOMIC_VALVE_OPEN strictly closed", () => {
    expect(ECONOMIC_VALVE_OPEN).toBe(false);
    expect(renderPartnerSlot("header")).toBe("");
    expect(renderPartnerSlot("footer")).toBe("");
  });

  it("contains zero banned anti-ad rhetoric or third-party ad/tracker scripts across repo source", () => {
    const root = resolve(process.cwd());
    const files = walkFiles(root).filter((f) => !f.endsWith("sovereign-compliance.test.ts") && !f.endsWith("AGENTS.md"));
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of BANNED_ANTI_AD_PATTERNS) {
        expect(content, `Banned pattern ${pattern} matched in ${file}`).not.toMatch(pattern);
      }
    }
  });
});
