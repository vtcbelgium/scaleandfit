import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");
const baseHtml = await readFile(resolve(distDir, "index.html"), "utf8");

for (const suite of ["visual-sizer", "printable-paper", "size-converter", "passport-photo"]) {
  const targetDir = resolve(distDir, suite);
  await mkdir(targetDir, { recursive: true });
  const html = baseHtml.replace('data-suite="hub"', `data-suite="${suite}"`);
  await writeFile(resolve(targetDir, "index.html"), html, "utf8");
}

const notFoundHtml = baseHtml.replace(
  "<title>ScaleAndFit",
  "<meta name=\"robots\" content=\"noindex\" />\n  <title>Page Not Found — ScaleAndFit"
);
await writeFile(resolve(distDir, "404.html"), notFoundHtml, "utf8");
console.log("postbuild-seo bootstrap complete.");
