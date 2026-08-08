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
