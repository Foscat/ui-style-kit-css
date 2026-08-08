// Every package can add domain fields, but this policy keeps the shared header compatible.
const sharedPolicy = Object.freeze({
  compatibility: 'additive-within-major',
  breakingChange: 'increment-schemaVersion-before-removing-or-renaming-fields'
});

export function validateSharedManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('Ecosystem manifest must be an object.');
  }
  if (manifest.schemaVersion !== 1) {
    throw new TypeError('Ecosystem manifest schemaVersion must be 1.');
  }
  if (!manifest.schemaPolicy || typeof manifest.schemaPolicy !== 'object') {
    throw new TypeError('Ecosystem manifest schemaPolicy is required.');
  }
  for (const [field, value] of Object.entries(sharedPolicy)) {
    if (manifest.schemaPolicy[field] !== value) {
      throw new TypeError(`Ecosystem manifest schemaPolicy.${field} must be ${value}.`);
    }
  }
  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    throw new TypeError('Ecosystem manifest name must be a non-empty string.');
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version)) {
    throw new TypeError('Ecosystem manifest version must be a semantic version string.');
  }
}

// The cross-package contract is deliberately narrow so each package remains standalone.
export function validateEcosystemCompatibility(contract) {
  if (!contract || contract.schemaVersion !== 1) throw new TypeError('Ecosystem compatibility schemaVersion must be 1.');
  if (contract.ownership?.repository !== 'ui-style-kit-css' || contract.ownership?.status !== 'temporary') throw new TypeError('Ecosystem compatibility ownership is invalid.');
  if (!Array.isArray(contract.packages) || !contract.packageSources || !contract.supportedCombinations || !Array.isArray(contract.canonicalImports) || !Array.isArray(contract.deprecatedImports)) throw new TypeError('Ecosystem compatibility required fields are missing.');
  const requiredPackages = new Set(['ui-style-kit-css', 'interactive-surface-css', 'layout-style-css']);
  const packageNames = new Set(contract.packages.map((definition) => definition.name));
  if (packageNames.size !== requiredPackages.size || [...requiredPackages].some((name) => !packageNames.has(name))) throw new TypeError('Ecosystem compatibility package identity is invalid.');
  if (Object.keys(contract.packageSources).length !== requiredPackages.size || [...requiredPackages].some((name) => !(name in contract.packageSources))) throw new TypeError('Ecosystem compatibility source metadata is invalid.');
  if (contract.packageSources['ui-style-kit-css']?.checkout !== 'current') throw new TypeError('Ecosystem compatibility source metadata is invalid.');
  for (const [name, repository] of Object.entries({
    'interactive-surface-css': 'Foscat/Interactive-Surface-CSS',
    'layout-style-css': 'Foscat/Layout-Style-CSS'
  })) {
    const source = contract.packageSources[name];
    if (source?.repository !== repository || !/^[0-9a-f]{40}$/.test(source.revision ?? '')) throw new TypeError('Ecosystem compatibility source metadata is invalid.');
  }
  for (const definition of contract.packages) {
    if (!/^>=\d+\.\d+\.\d+ <\d+\.0\.0$/.test(definition.supportedRange)) throw new TypeError('Ecosystem compatibility supportedRange is invalid.');
    for (const combination of ['minimum', 'current']) {
      if (!/^\d+\.\d+\.\d+$/.test(contract.supportedCombinations[combination]?.[definition.name])) throw new TypeError('Ecosystem compatibility version is invalid.');
    }
  }
  for (const entry of contract.canonicalImports) if (typeof entry.specifier !== 'string' || !packageNames.has(entry.owner) || (entry.specifier !== entry.owner && !entry.specifier.startsWith(`${entry.owner}/`))) throw new TypeError('Ecosystem canonical import is invalid.');
  if (!contract.canonicalImports.some((entry) => entry.specifier === 'layout-style-css' && entry.owner === 'layout-style-css')) throw new TypeError('Ecosystem Layout canonical import is required.');
  if (!contract.canonicalImports.some((entry) => entry.specifier === 'ui-style-kit-css/visual.css') || !contract.canonicalImports.some((entry) => entry.specifier === 'ui-style-kit-css/interactive-surface-theme.css') || !contract.canonicalImports.some((entry) => entry.specifier === 'interactive-surface-css/state-core.css')) throw new TypeError('Ecosystem canonical imports are incomplete.');
  for (const entry of contract.deprecatedImports) if (entry.status !== 'deprecated' || typeof entry.replacement !== 'string') throw new TypeError('Ecosystem deprecated import is invalid.');
  const deprecatedSpecifiers = new Set(contract.deprecatedImports.map((entry) => entry.specifier));
  if (!deprecatedSpecifiers.has('ui-style-kit-css/interactive-surface-bridge.css') || !deprecatedSpecifiers.has('ui-style-kit-css/with-bridge.css')) throw new TypeError('Ecosystem deprecated imports are incomplete.');
}
