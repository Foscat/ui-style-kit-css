import fs from "node:fs";

const ecosystemPackagePattern =
  /^(?:ui-style-kit-css|interactive-surface-css|layout-style-css)(?:\/[A-Za-z0-9._-]*[A-Za-z0-9_-])*$/;
const packageNames =
  "(?:ui-style-kit-css|interactive-surface-css|layout-style-css)";
const plainPackagePathPattern = new RegExp(
  `(?<![A-Za-z0-9_./@-])(${packageNames}(?:\\/[A-Za-z0-9._-]*[A-Za-z0-9_-])+)(?![A-Za-z0-9_/@-])`,
  "g",
);

export function extractPackageImports(markdown) {
  const candidates = [];
  const seen = new Set();

  for (const block of markdown.matchAll(
    /^(?:```|~~~)[^\r\n]*\r?\n([\s\S]*?)^(?:```|~~~)\s*$/gm,
  )) {
    const code = block[1];
    const importPatterns = [
      /\bimport\s+(?:[^"'\n;]+?\s+from\s+)?(["'])([^"']+)\1/g,
      /@import\s+(?:url\(\s*)?(["'])([^"']+)\1/g,
    ];

    for (const importPattern of importPatterns) {
      for (const match of code.matchAll(importPattern)) {
        const specifier = match[2];
        if (ecosystemPackagePattern.test(specifier)) {
          candidates.push({
            index: block.index + block[0].indexOf(code) + match.index,
            specifier,
          });
        }
      }
    }
  }

  // Inline code may intentionally name a bare package entry point, while prose
  // scanning is limited to subpaths so ordinary package/version discussion does
  // not become an accidental current-export contract.
  for (const inlineCode of markdown.matchAll(/(?<!`)`([^`\r\n]+)`(?!`)/g)) {
    const specifier = inlineCode[1].trim();
    if (ecosystemPackagePattern.test(specifier)) {
      candidates.push({ index: inlineCode.index, specifier });
    }
  }

  for (const match of markdown.matchAll(plainPackagePathPattern)) {
    candidates.push({ index: match.index, specifier: match[1] });
  }

  return candidates
    .sort((left, right) => left.index - right.index)
    .filter(({ specifier }) => {
      if (seen.has(specifier)) return false;
      seen.add(specifier);
      return true;
    })
    .map(({ specifier }) => specifier);
}

export function assertPackageImportsResolve(
  markdown,
  resolver,
  label = "Maintained documentation",
) {
  const failures = [];
  const specifiers = extractPackageImports(markdown);
  for (const specifier of specifiers) {
    try {
      const resolved = resolver.resolve(specifier);
      const stat = fs.statSync(resolved);
      if (!stat.isFile() || stat.size === 0) {
        failures.push(
          `${label}: ${specifier} did not resolve to a nonempty file`,
        );
      }
    } catch (error) {
      failures.push(
        `${label}: ${specifier} did not resolve (${error.code ?? error.message})`,
      );
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `Documented package import validation failed:\n${failures.join("\n")}`,
    );
  }
  return specifiers;
}
