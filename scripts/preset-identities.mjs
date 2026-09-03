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
 * @property {Readonly<Record<'typography'|'density'|'geometry'|'material'|'feedback'|'data', string>>} templateSignature Template-derived requirements for each visible identity axis.
 * @property {Readonly<Record<'typography'|'density'|'geometry'|'material'|'feedback'|'data', readonly ReferenceTrait[]>>} referenceTraits Executable CSS evidence for each visible identity axis.
 * @property {Readonly<{control: string, select: string, range: string, progress: string}>} nativeIdentity Human-readable native-control intent.
 */

/**
 * One executable, prefix-relative CSS expectation derived from a retained reference.
 *
 * @typedef {Object} ReferenceTrait
 * @property {string} selector Prefix-relative public class fragment.
 * @property {string} property CSS property that carries the visual trait.
 * @property {string} includes Required substring in the final authored declaration.
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
const nativeIdentityKeys = Object.freeze(['control', 'select', 'range', 'progress']);
const templateSignatureKeys = Object.freeze(['typography', 'density', 'geometry', 'material', 'feedback', 'data']);

/**
 * Convert a compact six-axis profile into a deeply frozen executable contract.
 *
 * @param {readonly [string, string, string, string, string, string]} profile Expected value fragment for each visible axis.
 * @returns {PresetIdentity['referenceTraits']} Frozen executable reference traits.
 */
function createReferenceTraits(profile) {
  const selectors = ['title', 'button', 'button', 'panel', 'progress', 'table th'];
  const properties = ['font-family', 'min-height', 'border-radius', 'box-shadow', 'background', 'background'];

  return Object.freeze(Object.fromEntries(templateSignatureKeys.map((axis, index) => [
    axis,
    Object.freeze([Object.freeze({
      selector: selectors[index],
      property: properties[index],
      includes: profile[index]
    })])
  ])));
}

/**
 * Reference-backed declaration fragments for every public preset. These are
 * intentionally concrete so visual fidelity cannot pass through prose or token
 * churn alone.
 *
 * @type {Readonly<Record<string, PresetIdentity['referenceTraits']>>}
 */
const referenceTraits = Object.freeze(Object.fromEntries([
  ['minimal-saas', ['--saas-font-heading', '2.375rem', '.375rem', 'none', '--saas-primary', '--saas-surface-soft-rgb']],
  ['bento', ['--bento-font-heading', '2.75rem', '.75rem', '--bento-tile-shadow', 'linear-gradient', '--bento-primary-rgb']],
  ['maximalist', ['--max-font-heading', '3rem', '.12rem', '--max-ink', '--max-warning', '--max-primary']],
  ['bauhaus', ['--bau-font-heading', '3.125rem', '0', 'none', 'repeating-linear-gradient', '--bau-border']],
  ['tactile', ['--tactile-font-display', '3.05rem', '0', '--tactile-panel-shadow', '--tactile-progress-fill', '--tactile-sidebar-bg']],
  ['neumorphism', ['--neo-font-heading', '3.25rem', '1.55rem', '--neo-raised-shadow', '--neo-control-bg', '--neo-control-bg']],
  ['retrofuturism', ['--retro-font-display', '2.75rem', '--retro-radius-pill', '--retro-text', '--retro-progress-fill', '--retro-instrument-bg']],
  ['brutalism', ['--brutal-font-heading', '2.7rem', '.08rem', '--brutal-primary', 'repeating-linear-gradient', '--brutal-text']],
  ['cyberpunk', ['--cyber-font-heading', '2.85rem', '.04rem', '--cyber-accent-rgb', 'repeating-linear-gradient', '--cyber-primary-rgb']],
  ['y2k', ['Impact', '2.08rem', '1px', '--y2k-surface-strong', 'repeating-linear-gradient', '--y2k-primary']],
  ['retro-glass', ['Segoe UI', '2.5rem', '.42rem', '--rg-surface-strong-rgb', 'repeating-linear-gradient', '--rg-primary-hover']],
  ['editorial-luxe', ['--luxe-font-display', '2.5rem', '.02rem', '--luxe-surface-strong', '--luxe-success', 'transparent']],
  ['organic-modern', ['--organic-font-display', '2.65rem', '.55rem', '--organic-quiet-shadow', '--organic-primary', '--organic-primary-rgb']],
  ['industrial-utility', ['--utility-font-heading', '2.72rem', '.12rem', '--utility-surface-strong-rgb', '--utility-primary-hover', '--utility-surface-strong']],
  ['technical-blueprint', ['--blueprint-font-display', '2.42rem', '0', '--blueprint-primary-rgb', '--blueprint-focus', 'repeating-linear-gradient']],
  ['art-deco', ['--deco-font-display', '2.85rem', '.08rem', '--deco-surface-strong', '--deco-success', '--deco-primary']],
  ['clay', ['--clay-font-heading', '2.85rem', '.72rem', '--clay-slab-shadow', '--clay-surface-strong-rgb', '--clay-raised-bg']],
  ['data-terminal', ['--terminal-font-mono', '2.2rem', '0', 'none', 'repeating-linear-gradient', '--terminal-control-bg']],
  ['paper-editorial', ['--paper-font-display', '2.35rem', '0', '--paper-text-rgb', 'repeating-linear-gradient', '--paper-primary-rgb']],
  ['neo-noir', ['--noir-font-heading', '2.65rem', '.18rem', '--noir-focus-rgb', 'repeating-linear-gradient', '--noir-warning-rgb']]
].map(([id, profile]) => [id, createReferenceTraits(profile)])));

/**
 * Template-derived design requirements that prevent a preset from becoming unique
 * through arbitrary token drift rather than a coherent visual system.
 *
 * @type {Readonly<Record<string, Readonly<Record<string, string>>>>}
 */
const templateSignatures = Object.freeze({
  'minimal-saas': Object.freeze({
    typography: 'restrained product sans with compact labels and quiet hierarchy',
    density: 'compact controls and tightly padded operational modules',
    geometry: 'small radii and orderly rectangular modules divided by cool rules',
    material: 'flat neutral solid surfaces with negligible elevation',
    feedback: 'small badges, slim progress, and calm bordered alerts',
    data: 'fine-rule tables with compact rows and restrained headers'
  }),
  bento: Object.freeze({
    typography: 'friendly product sans with relaxed hierarchy and generous spacing',
    density: 'spacious controls and breathable mosaic tiles',
    geometry: 'large rounded tiles with nested rounded controls',
    material: 'theme-tinted washes, inset highlights, and soft elevation',
    feedback: 'pill badges, elevated alerts, and rounded product progress',
    data: 'softly elevated table tiles with spacious rows'
  }),
  maximalist: Object.freeze({
    typography: 'expressive condensed poster type with loud uppercase labels',
    density: 'busy layered composition with intentionally uneven spacing',
    geometry: 'sticker offsets, torn-label angles, and bold asymmetric blocks',
    material: 'collaged paper surfaces with hard ink strokes and offset shadows',
    feedback: 'poster stickers, segmented launch strips, and high-impact alerts',
    data: 'inked grid tables with loud headers and offset status labels'
  }),
  bauhaus: Object.freeze({
    typography: 'condensed uppercase workshop typography with disciplined hierarchy',
    density: 'structured grid density with deliberate open fields',
    geometry: 'strict rectangles, circles, primary geometry, and heavy rules',
    material: 'flat constructed surfaces without decorative elevation',
    feedback: 'primary-shape badges, rule-bound alerts, and segmented progress',
    data: 'architectural tables with heavy header bands and grid lines'
  }),
  tactile: Object.freeze({
    typography: 'serif identity headings with compact uppercase instrument labels',
    density: 'dense physical workstation controls with deliberate grouping',
    geometry: 'shallow chamfers, keycaps, squared thumbs, and visible keylines',
    material: 'paper plates, raised bevels, recessed troughs, and mechanical depth',
    feedback: 'instrument badges, segmented gauges, and keyed alerts',
    data: 'paper ledger tables with physical header plates and ruled rows'
  }),
  neumorphism: Object.freeze({
    typography: 'quiet modern sans with generous scale and low visual noise',
    density: 'spacious controls separated by sculpted same-surface gaps',
    geometry: 'large soft radii and continuous rounded shells',
    material: 'borderless extrusion shadows with concave fields and pressed states',
    feedback: 'soft capsules, inset progress wells, and restrained semantic accents',
    data: 'floating same-surface tables with separated softly raised rows'
  }),
  retrofuturism: Object.freeze({
    typography: 'tall condensed atomic display type with humanist body copy',
    density: 'instrument-panel grouping with compact calibrated controls',
    geometry: 'oval actions, rounded appliance frames, dials, and lozenges',
    material: 'layered enamel shells, metallic rims, and recessed instrument bays',
    feedback: 'jewel-light indicators and segmented lamp gauges',
    data: 'enamel instrument tables with rimmed headers and calibrated rows'
  }),
  brutalism: Object.freeze({
    typography: 'blunt condensed uppercase display paired with utilitarian mono data',
    density: 'dense full-bleed modules with minimal internal whitespace',
    geometry: 'square grids, numbered blocks, and uncompromising rectangles',
    material: 'heavy ink rules, flat fills, and hard offset construction',
    feedback: 'block status labels, warning slabs, and hard segmented meters',
    data: 'full-grid tables with black rules and compact monospaced cells'
  }),
  cyberpunk: Object.freeze({
    typography: 'technical condensed HUD type with coded uppercase labels',
    density: 'dense command interface with narrow control bands',
    geometry: 'chamfered panels, clipped controls, and signal-edge notches',
    material: 'dark or pale HUD plates with restrained luminous edge treatment',
    feedback: 'signal-color chips, clipped alerts, and calibrated warning tracks',
    data: 'dense HUD tables with clipped headers and coded status cells'
  }),
  y2k: Object.freeze({
    typography: 'system interface typography with dense portal-era labeling',
    density: 'compact portal panels and toolbar-like control clusters',
    geometry: 'small bevels, title bars, capsules, and segmented indicators',
    material: 'one-pixel bevels, glossy title bars, and molded plastic depth',
    feedback: 'candy status pills, segmented indicators, and beveled alerts',
    data: 'portal data grids with title bars and compact system rows'
  }),
  'retro-glass': Object.freeze({
    typography: 'desktop application system type with chrome title hierarchy',
    density: 'information-dense application panes and toolbars',
    geometry: 'beveled buttons, glossy tabs, glass panes, and dock controls',
    material: 'brushed chrome, translucent glass, inset bevels, and dark dock depth',
    feedback: 'glossy lamps, glass alerts, and striped application progress',
    data: 'desktop list views with beveled headers and selected-row glass'
  }),
  'editorial-luxe': Object.freeze({
    typography: 'Didone-led couture hierarchy with refined small capitals',
    density: 'measured editorial whitespace and tightly ruled details',
    geometry: 'rigid columns, fine rectangles, and double-rule framing',
    material: 'quiet paper-like couture surfaces with restrained depth',
    feedback: 'fine-rule badges, editorial notices, and needle-thin progress',
    data: 'publication tables with elegant headers and hairline row rules'
  }),
  'organic-modern': Object.freeze({
    typography: 'warm serif identity type paired with a calm humanist sans',
    density: 'relaxed clusters with intentional asymmetric breathing room',
    geometry: 'pebble curves, asymmetric corners, and leaf-tipped details',
    material: 'warm semantic surfaces with subtle grain-like layering and hairlines',
    feedback: 'botanical pills, softly edged alerts, and organic progress forms',
    data: 'warm ledger surfaces with softly separated rows and serif accents'
  }),
  'industrial-utility': Object.freeze({
    typography: 'condensed technical labels with numeric instrument readouts',
    density: 'operator-console density with compact mechanical controls',
    geometry: 'metal-framed rectangles, recessed instruments, and switchgear',
    material: 'machine plates, inset bays, hard bevels, and safety-control depth',
    feedback: 'safety badges, alarm plates, gauges, and mechanical progress',
    data: 'operations tables with metal headers and dense equipment rows'
  }),
  'technical-blueprint': Object.freeze({
    typography: 'drafting lettering with monospaced annotations and measured labels',
    density: 'calibrated technical spacing aligned to a drafting grid',
    geometry: 'square measured controls, crosshairs, corner marks, and linework',
    material: 'flat blueprint sheets with layered grid and construction lines',
    feedback: 'annotation labels, outlined alerts, and ticked progress tracks',
    data: 'measured tables with drafting rules and coordinate-like headers'
  }),
  'art-deco': Object.freeze({
    typography: 'elegant tall display lettering with metropolitan small capitals',
    density: 'formal symmetric spacing with compact ornamental controls',
    geometry: 'stepped symmetry, fanbursts, facets, and double keylines',
    material: 'polished semantic metallic linework with restrained jewel depth',
    feedback: 'jewel badges, framed notices, and symmetrical stepped gauges',
    data: 'formal framed tables with double keylines and geometric headers'
  }),
  clay: Object.freeze({
    typography: 'soft friendly sans hierarchy integrated into a sculpted slab',
    density: 'comfortable rounded controls embedded in continuous surfaces',
    geometry: 'inflated corners, raised pills, and smoothly carved seams',
    material: 'soft mineral slabs with broad extrusion and inset carving',
    feedback: 'chunky badges, molded alerts, and raised capsule progress',
    data: 'sculpted table regions with pill headers and softly carved rows'
  }),
  'data-terminal': Object.freeze({
    typography: 'strict monospaced command typography and terse uppercase labels',
    density: 'maximum information density in a one-pixel command grid',
    geometry: 'square cells, brackets, cursor blocks, and rigid alignment',
    material: 'flat terminal planes with luminous one-pixel semantic rules',
    feedback: 'strict signal chips, bracketed alerts, and cursor-like progress',
    data: 'command-grid tables with monospaced cells and signal-state columns'
  }),
  'paper-editorial': Object.freeze({
    typography: 'field-manual condensed headings paired with monospaced notes',
    density: 'print-efficient manual layout with indexed content bands',
    geometry: 'binder holes, index tabs, ticket notches, and ruled rectangles',
    material: 'physical paper sheets with ink rules and subtle print texture',
    feedback: 'stamped badges, margin notices, and inked rule progress',
    data: 'manual tables with ruled columns, index labels, and mono entries'
  }),
  'neo-noir': Object.freeze({
    typography: 'cinematic condensed display type with timecode-like mono data',
    density: 'tight production-console groups balanced by dramatic negative space',
    geometry: 'trapezoid controls, slanted panels, and diagonal corner cuts',
    material: 'shadowed cinematic plates with subtle grain and edge lighting',
    feedback: 'amber teal and red semantic signals in slanted frames',
    data: 'production tables with angled headers, timecode data, and edge-lit rows'
  })
});

const identityRows = [
  ['minimal-saas', 'saas', 'compact', 'metric', 'intrinsic', 'start', 'flat neutral modules, fine rules, tight radii, compact product density, and negligible elevation', 'precise compact control with a quiet outline', 'fine minimal chevron', 'slim track and small circular thumb', 'restrained hairline progress'],
  ['bento', 'bento', 'block', 'grid-feature', 'min(100%,14rem)', 'center', 'rounded theme-washed mosaic tiles, friendly product typography, nested highlights, and soft elevation', 'spacious rounded tile control with theme-tinted depth', 'rounded mosaic indicator', 'soft square thumb on a raised pill track', 'elevated rounded product progress'],
  ['maximalist', 'max', 'expressive', 'well', 'intrinsic', 'end', 'punk-collage paper panels, hard ink strokes, and loud condensed type', 'sharp poster-label control with offset sticker shadow', 'inked sticker indicator', 'smiley-scale thumb on a neon campaign slider', 'segmented launch-progress strip'],
  ['bauhaus', 'bau', 'block', 'well', 'min(100%,12rem)', 'start', 'strict workshop grid, heavy rulework, primary-shape blocks, and condensed uppercase typography', 'square workshop-field control with heavy bottom rule', 'architectural black chevron mark', 'circular primary thumb on an exposed structural rule', 'segmented primary-shape progress'],
  ['tactile', 'tactile', 'expressive', 'well', 'intrinsic', 'center', 'physical paper-and-instrument UI with serif headings, compact uppercase labels, visible keylines, shallow chamfers, and mechanical depth', 'raised chamfered paper keycap control', 'stacked mechanical selector with a hard keyline', 'squared lever thumb in a dark recessed trough', 'segmented inset instrument gauge'],
  ['neumorphism', 'neo', 'soft', 'well', 'intrinsic', 'center', 'borderless same-surface UI with quiet modern type, generous radii, opposing extrusion shadows, and deeply concave controls', 'sculpted same-surface action with a pressed inset state', 'concave selector with a restrained semantic indicator', 'floating circular thumb on a deeply inset track', 'concave rounded progress with a restrained semantic fill'],
  ['retrofuturism', 'retro', 'elongated', 'well', 'min(100%,18rem)', 'center', 'atomic-age enamel shells, nested metallic rims, recessed instrument bays, oval actions, and condensed display typography', 'ringed oval appliance control with mechanical pressed depth', 'compact instrument chevron in a recessed selector', 'metallic dial thumb on a calibrated multicolor channel', 'segmented jewel-lamp progress gauge'],
  ['brutalism', 'brutal', 'block', 'well', 'min(100%,14rem)', 'start', 'blunt cut, thick border, and hard offset shadow', 'heavy blunt control', 'block arrow selector', 'rectangular thumb on thick track', 'hard-edged progress'],
  ['cyberpunk', 'cyber', 'elongated', 'well', 'min(100%,18rem)', 'end', 'multi-notch technical polygon with neon edge', 'clipped neon technical control', 'angular neon chevron', 'notched thumb and track', 'segmented neon progress'],
  ['y2k', 'y2k', 'compact', 'metric', 'min(100%,14rem)', 'start', 'dense portal frame with one-pixel operating-system bevels', 'compact beveled system control', 'pixel arrow selector', 'square thumb on segmented channel', 'segmented portal progress'],
  ['retro-glass', 'rg', 'elongated', 'well', 'min(100%,16rem)', 'center', 'frosted angular tab with inner highlight', 'frosted glass control', 'glass directional indicator', 'lens thumb in translucent channel', 'frosted progress fill'],
  ['editorial-luxe', 'luxe', 'compact', 'metric', 'intrinsic', 'start', 'slim bookplate with hairline framing', 'fine-rule editorial control', 'understated editorial chevron', 'needle thumb on ruled track', 'elegant ruled progress'],
  ['organic-modern', 'organic', 'soft', 'metric', 'intrinsic', 'center', 'asymmetric pebble contour with soft depth', 'soft pebble control', 'leaf-like indicator', 'pebble thumb on organic track', 'organic rounded progress'],
  ['industrial-utility', 'utility', 'compact', 'metric', 'intrinsic', 'start', 'octagonal equipment control with operational density', 'dense equipment plate', 'machine-control indicator', 'switchgear thumb on equipment track', 'operational status progress'],
  ['technical-blueprint', 'blueprint', 'compact', 'metric', 'intrinsic', 'start', 'drafting-corner outline and technical rules', 'measured drafting control', 'calibrated directional indicator', 'crosshair thumb on ticked track', 'ticked technical progress'],
  ['art-deco', 'deco', 'soft', 'metric', 'min(100%,15rem)', 'center', 'symmetric chevrons with double-rule framing', 'symmetric double-rule control', 'faceted selector mark', 'jewel thumb on stepped track', 'symmetric ruled progress'],
  ['clay', 'clay', 'soft', 'metric', 'intrinsic', 'center', 'inflated pill with chunky soft shadow', 'inflated soft control', 'pill selector indicator', 'rounded knob on raised channel', 'chunky soft progress'],
  ['data-terminal', 'terminal', 'compact', 'metric', 'intrinsic', 'start', 'terminal brackets with luminous outline', 'dense terminal control', 'caret bracket indicator', 'cursor thumb on segmented channel', 'luminous terminal progress'],
  ['paper-editorial', 'paper', 'compact', 'metric', 'intrinsic', 'start', 'ticket notches with inked offset edge', 'printed paper control', 'inked directional mark', 'stamp thumb on printed rule', 'ink-offset progress'],
  ['neo-noir', 'noir', 'elongated', 'metric', 'min(100%,16rem)', 'end', 'cinematic slant with edge lighting', 'slanted cinematic control', 'slash indicator', 'metallic thumb in shadow channel', 'edge-lit progress']
];

/** @type {readonly PresetIdentity[]} */
export const PRESET_IDENTITIES = Object.freeze(identityRows.map(([
  id,
  prefix,
  composition,
  specimenSuffix,
  filledInlineSize,
  filledAlignment,
  description,
  nativeControl,
  nativeSelect,
  nativeRange,
  nativeProgress
]) => Object.freeze({
  id,
  prefix,
  composition,
  specimenSuffix,
  filledInlineSize,
  filledAlignment,
  description,
  signatureSelectors,
  templateSignature: templateSignatures[id],
  referenceTraits: referenceTraits[id],
  nativeIdentity: Object.freeze({
    control: nativeControl,
    select: nativeSelect,
    range: nativeRange,
    progress: nativeProgress
  })
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
    for (const key of templateSignatureKeys) {
      if (typeof identity.templateSignature?.[key] !== 'string' || identity.templateSignature[key].trim().length === 0) {
        throw new Error(`missing template signature ${key} for ${identity.id}`);
      }
    }
    if (Object.keys(identity.templateSignature).join(',') !== templateSignatureKeys.join(',')) {
      throw new Error(`template signature keys must remain stable for ${identity.id}`);
    }
    for (const key of templateSignatureKeys) {
      const traits = identity.referenceTraits?.[key];
      if (!Array.isArray(traits) || traits.length === 0) {
        throw new Error(`missing executable reference traits ${key} for ${identity.id}`);
      }
      for (const trait of traits) {
        if (
          typeof trait?.selector !== 'string' || trait.selector.trim().length === 0 ||
          typeof trait?.property !== 'string' || trait.property.trim().length === 0 ||
          typeof trait?.includes !== 'string' || trait.includes.trim().length === 0
        ) {
          throw new Error(`invalid executable reference trait ${key} for ${identity.id}`);
        }
      }
    }
    if (Object.keys(identity.referenceTraits).join(',') !== templateSignatureKeys.join(',')) {
      throw new Error(`reference trait keys must remain stable for ${identity.id}`);
    }
    for (const key of nativeIdentityKeys) {
      if (typeof identity.nativeIdentity?.[key] !== 'string' || identity.nativeIdentity[key].trim().length === 0) {
        throw new Error(`missing native identity ${key} for ${identity.id}`);
      }
    }
    if (Object.keys(identity.nativeIdentity).join(',') !== nativeIdentityKeys.join(',')) {
      throw new Error(`native identity keys must remain stable for ${identity.id}`);
    }
  }

  const manifestOrder = manifest.presets.map(({ id }) => id).join(',');
  const identityOrder = identities.map(({ id }) => id).join(',');
  if (identityOrder !== manifestOrder) {
    throw new Error('preset identities must follow manifest order.');
  }
}
