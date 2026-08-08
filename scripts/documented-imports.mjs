const ecosystemPackagePattern = /^(?:ui-style-kit-css|interactive-surface-css|layout-style-css)(?:\/.*)?$/;

export function extractPackageImports(markdown) {
  const imports = [];
  const seen = new Set();

  for (const block of markdown.matchAll(/^(?:```|~~~)[^\r\n]*\r?\n([\s\S]*?)^(?:```|~~~)\s*$/gm)) {
    const code = block[1];
    const importPatterns = [
      /\bimport\s+(?:[^"'\n;]+?\s+from\s+)?(["'])([^"']+)\1/g,
      /@import\s+(?:url\(\s*)?(["'])([^"']+)\1/g
    ];

    for (const importPattern of importPatterns) {
      for (const match of code.matchAll(importPattern)) {
        const specifier = match[2];
        if (ecosystemPackagePattern.test(specifier) && !seen.has(specifier)) {
          seen.add(specifier);
          imports.push(specifier);
        }
      }
    }
  }

  return imports;
}
