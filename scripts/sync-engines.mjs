import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const ENGINES_SRC = path.resolve(WEB_ROOT, "../scaleandfit-engines/src");
const ENGINES_DATA = path.resolve(WEB_ROOT, "../scaleandfit-engines/data");
const TARGET_DIR = path.join(WEB_ROOT, "src/engines");
const TARGET_DATA_DIR = path.join(WEB_ROOT, "src/engines/_data");

if (!fs.existsSync(ENGINES_SRC)) {
  console.error("Missing engines source at:", ENGINES_SRC);
  process.exit(1);
}

function copyTree(srcDir, destDir, extFilter) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(s, d, extFilter);
    } else if (entry.name.endsWith(extFilter)) {
      fs.copyFileSync(s, d);
    }
  }
}

fs.rmSync(TARGET_DIR, { recursive: true, force: true });
copyTree(ENGINES_SRC, TARGET_DIR, ".ts");
if (fs.existsSync(ENGINES_DATA)) {
  copyTree(ENGINES_DATA, TARGET_DATA_DIR, ".json");
}
console.log("Synced @scaleandfit/engines src & sealed datasets -> src/engines cleanly.");
