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
  if (!Array.isArray(contract.packages) || !contract.supportedCombinations || !Array.isArray(contract.canonicalImports) || !Array.isArray(contract.deprecatedImports)) throw new TypeError('Ecosystem compatibility required fields are missing.');
  for (const definition of contract.packages) {
    if (!/^>=\d+\.\d+\.\d+ <\d+\.0\.0$/.test(definition.supportedRange)) throw new TypeError('Ecosystem compatibility supportedRange is invalid.');
    for (const combination of ['minimum', 'current']) {
      if (!/^\d+\.\d+\.\d+$/.test(contract.supportedCombinations[combination]?.[definition.name])) throw new TypeError('Ecosystem compatibility version is invalid.');
    }
  }
  for (const entry of contract.canonicalImports) if (typeof entry.specifier !== 'string' || typeof entry.owner !== 'string') throw new TypeError('Ecosystem canonical import is invalid.');
  for (const entry of contract.deprecatedImports) if (entry.status !== 'deprecated' || typeof entry.replacement !== 'string') throw new TypeError('Ecosystem deprecated import is invalid.');
}
