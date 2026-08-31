/**
 * Supported CTA composition families for preset-owned marketing actions.
 *
 * @typedef {'compact'|'block'|'soft'|'elongated'|'expressive'} CompositionFamily
 */

/**
 * Internal design contract for one public UI preset.
 *
 * @typedef {Object} PresetIdentity
 * @property {string} id Public manifest preset identifier.
 * @property {string} prefix Public class and token prefix.
 * @property {CompositionFamily} composition Intentional CTA composition family.
 * @property {string} specimenSuffix Existing preset-owned metric or specimen suffix.
 * @property {string} filledInlineSize Normalized CSS inline-size or the `intrinsic` sizing sentinel.
 * @property {'start'|'center'|'end'} filledAlignment Required grid alignment for the filled CTA.
 * @property {string} description Human-readable component identity.
 * @property {readonly string[]} signatureSelectors Prefix-relative selectors used by identity contracts.
 */

const compositionFamilies = new Set(['compact', 'block', 'soft', 'elongated', 'expressive']);
const alignments = new Set(['start', 'center', 'end']);
const signatureSelectors = Object.freeze([
  'button-cut',
  'button-outline-heavy',
  'card-service',
  'media-scrim',
  'callout-bar'
]);

const identityRows = [
  ['minimal-saas', 'saas', 'compact', 'metric', 'intrinsic', 'start', 'single-corner fold, fine outline, low elevation'],
  ['bento', 'bento', 'block', 'grid-feature', 'min(100%,14rem)', 'center', 'stepped tile edges and compact block composition'],
  ['maximalist', 'max', 'expressive', 'well', 'intrinsic', 'end', 'skewed poster silhouette and pronounced layered shadow'],
  ['bauhaus', 'bau', 'block', 'well', 'min(100%,12rem)', 'start', 'asymmetric hard geometry and structural blocks'],
  ['tactile', 'tactile', 'expressive', 'well', 'intrinsic', 'center', 'chamfered keycap with bevel and pressed depth'],
  ['neumorphism', 'neo', 'soft', 'well', 'intrinsic', 'center', 'soft clipping with raised and inset shadows'],
  ['retrofuturism', 'retro', 'elongated', 'well', 'min(100%,18rem)', 'center', 'elongated console geometry with metallic rim'],
  ['brutalism', 'brutal', 'block', 'well', 'min(100%,14rem)', 'start', 'blunt cut, thick border, and hard offset shadow'],
  ['cyberpunk', 'cyber', 'elongated', 'well', 'min(100%,18rem)', 'end', 'multi-notch technical polygon with neon edge'],
  ['y2k', 'y2k', 'soft', 'well', 'min(100%,14rem)', 'center', 'glossy hexagonal capsule with reflective depth'],
  ['retro-glass', 'rg', 'elongated', 'well', 'min(100%,16rem)', 'center', 'frosted angular tab with inner highlight'],
  ['editorial-luxe', 'luxe', 'compact', 'metric', 'intrinsic', 'start', 'slim bookplate with hairline framing'],
  ['organic-modern', 'organic', 'soft', 'metric', 'intrinsic', 'center', 'asymmetric pebble contour with soft depth'],
  ['industrial-utility', 'utility', 'compact', 'metric', 'intrinsic', 'start', 'octagonal equipment control with operational density'],
  ['technical-blueprint', 'blueprint', 'compact', 'metric', 'intrinsic', 'start', 'drafting-corner outline and technical rules'],
  ['art-deco', 'deco', 'soft', 'metric', 'min(100%,15rem)', 'center', 'symmetric chevrons with double-rule framing'],
  ['clay', 'clay', 'soft', 'metric', 'intrinsic', 'center', 'inflated pill with chunky soft shadow'],
  ['data-terminal', 'terminal', 'compact', 'metric', 'intrinsic', 'start', 'terminal brackets with luminous outline'],
  ['paper-editorial', 'paper', 'compact', 'metric', 'intrinsic', 'start', 'ticket notches with inked offset edge'],
  ['neo-noir', 'noir', 'elongated', 'metric', 'min(100%,16rem)', 'end', 'cinematic slant with edge lighting']
];

/** @type {readonly PresetIdentity[]} */
export const PRESET_IDENTITIES = Object.freeze(identityRows.map(([
  id,
  prefix,
  composition,
  specimenSuffix,
  filledInlineSize,
  filledAlignment,
  description
]) => Object.freeze({
  id,
  prefix,
  composition,
  specimenSuffix,
  filledInlineSize,
  filledAlignment,
  description,
  signatureSelectors
})));

/**
 * Validate the internal preset identity registry against the public manifest.
 *
 * The build calls this before any generated files are written so a manifest
 * addition, prefix change, or duplicated identity cannot drift silently.
 *
 * @param {{presets: {id: string, prefix: string}[]}} manifest Public package manifest.
 * @param {readonly PresetIdentity[]} [identities=PRESET_IDENTITIES] Registry to validate.
 * @returns {void}
 * @throws {TypeError} When the manifest or registry shape is invalid.
 * @throws {Error} When registry coverage, order, prefixes, or identity fields drift.
 */
export function validatePresetIdentities(manifest, identities = PRESET_IDENTITIES) {
  if (!Array.isArray(manifest?.presets) || manifest.presets.length === 0) {
    throw new TypeError('manifest.presets must contain at least one preset.');
  }
  if (!Array.isArray(identities)) {
    throw new TypeError('identities must be an array.');
  }

  const manifestById = new Map(manifest.presets.map((preset) => [preset.id, preset]));
  const identitiesById = new Map();

  for (const identity of identities) {
    if (!identity || typeof identity !== 'object') {
      throw new TypeError('each preset identity must be an object.');
    }
    if (typeof identity.id !== 'string' || identity.id.length === 0) {
      throw new TypeError('each preset identity must have a non-empty id.');
    }
    if (identitiesById.has(identity.id)) {
      throw new Error(`duplicate identity for ${identity.id}`);
    }
    identitiesById.set(identity.id, identity);
  }

  for (const preset of manifest.presets) {
    if (!identitiesById.has(preset.id)) {
      throw new Error(`missing identity for ${preset.id}`);
    }
  }

  for (const identity of identities) {
    const preset = manifestById.get(identity.id);
    if (!preset) throw new Error(`unknown identity for ${identity.id}`);
    if (identity.prefix !== preset.prefix) {
      throw new Error(`prefix mismatch for ${identity.id}: expected ${preset.prefix}, received ${identity.prefix}`);
    }
    if (!compositionFamilies.has(identity.composition)) {
      throw new Error(`unsupported composition for ${identity.id}: ${identity.composition}`);
    }
    if (!alignments.has(identity.filledAlignment)) {
      throw new Error(`unsupported alignment for ${identity.id}: ${identity.filledAlignment}`);
    }
    if (typeof identity.specimenSuffix !== 'string' || identity.specimenSuffix.length === 0) {
      throw new Error(`missing specimen suffix for ${identity.id}`);
    }
    if (typeof identity.filledInlineSize !== 'string' || identity.filledInlineSize.length === 0) {
      throw new Error(`missing filled CTA width for ${identity.id}`);
    }
    if (typeof identity.description !== 'string' || identity.description.length === 0) {
      throw new Error(`missing description for ${identity.id}`);
    }
    if (!Array.isArray(identity.signatureSelectors) || identity.signatureSelectors.length === 0) {
      throw new Error(`missing signature selectors for ${identity.id}`);
    }
  }

  const manifestOrder = manifest.presets.map(({ id }) => id).join(',');
  const identityOrder = identities.map(({ id }) => id).join(',');
  if (identityOrder !== manifestOrder) {
    throw new Error('preset identities must follow manifest order.');
  }
}
