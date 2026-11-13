// scripts/generate-llms-txt.mjs
export function buildLlmsSummary(routes, origin = "https://scaleandfit.com") {
  const suites = {
    "visual-sizer": [],
    "printable-paper": [],
    "size-converter": [],
    "passport-photo": []
  };

  routes.forEach(route => {
    const { path, suite, title, description } = route;
    suites[suite].push(`- [${title}](${origin}${path}): ${description}`);
  });

  let summary = "# ScaleAndFit\n\n";
  for (const [suite, items] of Object.entries(suites)) {
    summary += `## ${suite}\n\n`;
    summary += items.join('\n');
    summary += '\n';
  }

  return summary;
}
