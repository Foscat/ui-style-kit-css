import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import { generate, parse, walk } from 'css-tree';

const expectedBrowsers = [
  'last 2 Chrome major versions',
  'last 2 Edge major versions',
  'last 2 Firefox major versions',
  'Safari >= 16',
  'iOS >= 16',
  'not dead'
];

/**
 * Report compatibility hazards that must not survive in a generated entrypoint.
 *
 * @param {string} css CSS source to inspect.
 * @param {string} label Human-readable source label.
 * @returns {Array<{code: string, file: string, message: string}>} Compatibility violations.
 */
export function collectCompatibilityViolations(css, label) {
  const ast = parse(css, { positions: true });
  const violations = [];

  /**
   * Add one normalized violation to the current audit.
   *
   * @param {string} code Stable machine-readable violation code.
   * @param {string} message Human-readable remediation message.
   * @returns {void}
   */
  function report(code, message) {
    violations.push({ code, file: label, message });
  }

  walk(ast, {
    enter(node) {
      if (node.type !== 'Declaration' || !this.block) return;

      const declarations = this.block.children.toArray();
      const declarationIndex = declarations.indexOf(node);
      if (declarationIndex === -1) return;

      const property = node.property.toLowerCase();
      const value = generate(node.value);
      const supportsPrelude = this.atrule?.name.toLowerCase() === 'supports'
        ? generate(this.atrule.prelude).toLowerCase()
        : '';

      if (property === 'backdrop-filter') {
        const prefixed = declarations
          .slice(0, declarationIndex)
          .find((candidate) => candidate.type === 'Declaration' && candidate.property.toLowerCase() === '-webkit-backdrop-filter');

        if (!prefixed || generate(prefixed.value) !== value) {
          report('backdrop-prefix', `${label}: backdrop-filter must follow an equivalent -webkit-backdrop-filter declaration.`);
        }
      }

      if (property === 'inline-size' && value.toLowerCase() === 'fit-content') {
        report('fit-content-inline-size', `${label}: remove redundant inline-size: fit-content declarations.`);
      }

      if (value.toLowerCase().includes('color-mix(') && !supportsPrelude.includes('color-mix(')) {
        report('unguarded-color-mix', `${label}: color-mix() enhancement must be guarded by @supports.`);
      }

      if (property === 'text-wrap' && !supportsPrelude.includes('text-wrap:')) {
        report('unguarded-text-wrap', `${label}: text-wrap enhancement must be guarded by @supports.`);
      }

      if (property === 'forced-color-adjust' && !supportsPrelude.includes('forced-color-adjust:')) {
        report('unguarded-forced-color-adjust', `${label}: forced-color-adjust must be guarded by @supports.`);
      }
    }
  });

  return violations;
}

/**
 * Enumerate every generated CSS entrypoint shipped by the package.
 *
 * @param {string} root Repository root directory.
 * @returns {string[]} Absolute generated stylesheet paths.
 */
function generatedEntrypoints(root) {
  const dist = path.join(root, 'dist');
  const files = [];

  for (const directory of [dist, path.join(dist, 'visual')]) {
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.css')) files.push(path.join(directory, entry.name));
    }
  }

  return files.sort();
}

/**
 * Validate the declared browser floor and every generated stylesheet.
 *
 * @returns {void}
 */
function run() {
  const root = process.cwd();
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  if (JSON.stringify(packageJson.browserslist) !== JSON.stringify(expectedBrowsers)) {
    throw new Error('package.json Browserslist policy does not match the supported browser contract.');
  }

  const resolvedBrowsers = browserslist(packageJson.browserslist);
  if (resolvedBrowsers.some((browser) => browser.toLowerCase().startsWith('samsung '))) {
    throw new Error('The release browser floor must not include legacy Samsung Internet targets.');
  }

  const entrypoints = generatedEntrypoints(root);
  if (entrypoints.length === 0) throw new Error('No generated CSS entrypoints were found. Run the build first.');

  const violations = entrypoints.flatMap((file) => collectCompatibilityViolations(
    fs.readFileSync(file, 'utf8'),
    path.relative(root, file).replaceAll('\\', '/')
  ));

  if (violations.length > 0) {
    for (const violation of violations) console.error(`[${violation.code}] ${violation.message}`);
    throw new Error(`Browser compatibility check failed with ${violations.length} violation(s).`);
  }

  console.log(`Browser compatibility check passed for ${entrypoints.length} generated entrypoints across ${resolvedBrowsers.length} resolved targets.`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) run();
