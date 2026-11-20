/**
 * @module studio/state
 * @description Pure studio state and URL contracts. Preview documents never own configuration.
 */

/** Shared RGB roles supported by every palette. */
export const COLOR_ROLES = [
  'bg',
  'surface',
  'surface-strong',
  'surface-soft',
  'text',
  'text-muted',
  'border',
  'primary',
  'primary-hover',
  'primary-text',
  'secondary',
  'secondary-hover',
  'secondary-text',
  'accent',
  'accent-text',
  'success',
  'success-text',
  'warning',
  'warning-text',
  'danger',
  'danger-text',
  'link',
  'focus',
];
/** @typedef {{ui: string, theme: string, mode: string, corners: string, bridge: boolean}} Appearance */
/** @typedef {Object} Inventory
 * @property {Array<Object>} presets Public preset identifiers and prefixes.
 * @property {Array<string>} themes Named palette identifiers.
 * @property {Array<string>} modes Supported display modes.
 * @property {{values: string[]}} [guidedCorners] Supported corner choices.
 * @property {Object<string, Array<string>>} [paletteRoles] Public native material roles by preset.
 */
/** @typedef {Object} PinnedAppearance
 * @property {string} ui Pinned preset.
 * @property {string} theme Pinned palette or an empty native palette.
 * @property {string} mode Pinned mode.
 * @property {string} corners Pinned corner choice or an empty preset default.
 * @property {boolean} bridge Whether interaction feedback is enabled.
 * @property {Object<string, string>} edits Detached RGB overrides.
 */
/** @typedef {Object} StudioState
 * @property {Appearance} appearance Editable visual configuration.
 * @property {Record<string, Record<string, string>>} edits Edits by palette owner and mode.
 * @property {?PinnedAppearance} baseline Independent pinned configuration.
 * @property {string} view Active workspace.
 * @property {string} example Active shared example.
 * @property {string} component Active component family.
 * @property {string} markup Semantic, prefixed, or native markup.
 * @property {string} filter Local catalog search.
 * @property {{styleSpecific:boolean,themed:boolean}} icons Explicit companion artwork preferences.
 * @property {Record<string, Object>} interactions Shared local example state.
 * @property {Record<string, string[]>} paletteRoles Supported native material roles.
 */

const views = ['examples', 'components', 'details', 'reference'];
const examples = ['dashboard', 'form', 'content'];
export const COMPONENTS = [
  'all',
  'buttons',
  'fields',
  'choices',
  'feedback',
  'navigation',
  'data',
  'overlays',
  'media',
];

/** Normalizes three integer RGB channels; invalid input never reaches CSS.
 * @param {unknown} value Candidate RGB value.
 * @returns {string} Normalized channels or an empty string.
 */
export function normalizeRgb(value) {
  const text = String(value ?? '').trim();
  if (!/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(text)) return '';
  const values = text.split(/\s+/).map(Number);
  return values.every((number) => number <= 255) ? values.join(' ') : '';
}

/** Returns the palette owner, preserving named-theme portability across styles.
 * @param {Appearance} appearance Configuration.
 * @returns {string} Palette context key.
 */
export function paletteKey(appearance) {
  return (
    (appearance.theme ? 'theme:' + appearance.theme : 'preset:' + appearance.ui) +
    '|' +
    appearance.mode
  );
}

/** Describes validated visual choices consistently in compact and expanded UI context.
 * @param {Appearance} appearance Current visual configuration.
 * @param {Inventory} inventory Authoritative preset labels and corner choices.
 * @returns {string[]} Preset, palette, mode and optional corner labels.
 */
export function appearanceLabels(appearance, inventory) {
  const title = (value) =>
    value
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  const labels = [
    inventory.presets.find(({ id }) => id === appearance.ui)?.label ?? appearance.ui,
    appearance.theme ? title(appearance.theme) : 'Style defaults',
    appearance.mode === 'contrast' ? 'High contrast' : title(appearance.mode),
  ];
  if (inventory.guidedCorners?.values.includes(appearance.corners))
    labels.push(
      (appearance.corners === 'none' ? 'Square' : title(appearance.corners)) + ' corners',
    );
  return labels;
}

/** Validates appearance against the authoritative inventory.
 * @param {Object} value Candidate appearance.
 * @param {Inventory} inventory Public library inventory.
 * @returns {Appearance} Supported configuration.
 */
function appearanceFor(value, inventory) {
  return {
    ui: inventory.presets.some(({ id }) => id === value.ui) ? value.ui : 'minimal-saas',
    theme: inventory.themes.includes(value.theme) ? value.theme : '',
    mode: inventory.modes.includes(value.mode) ? value.mode : 'light',
    corners: inventory.guidedCorners?.values.includes(value.corners) ? value.corners : '',
    bridge: value.bridge === true,
  };
}

/** Drops unknown roles and malformed channel values from shared configuration.
 * @param {Object} values Candidate edits.
 * @param {string[]} roles Approved role names.
 * @returns {Record<string, string>} Safe edits.
 */
function cleanEdits(values, roles) {
  return Object.fromEntries(
    Object.entries(values ?? {}).flatMap(([role, value]) => {
      const normalized = normalizeRgb(value);
      return roles.includes(role) && normalized ? [[role, normalized]] : [];
    }),
  );
}

/** Creates a fresh workspace or restores a shareable configuration.
 * @param {Inventory} inventory Public library inventory.
 * @param {string} [search=''] URL query.
 * @returns {StudioState} Validated state without private form contents.
 */
export function createState(inventory, search = '') {
  const query = new URLSearchParams(search);
  const appearance = appearanceFor(
    {
      ui: query.get('ui') ?? query.get('personality'),
      theme: query.get('theme'),
      mode: query.get('mode'),
      corners: query.get('corners'),
      bridge: query.get('bridge') === 'on',
    },
    inventory,
  );
  const state = {
    appearance,
    edits: {},
    baseline: null,
    view: views.includes(query.get('view')) ? query.get('view') : 'examples',
    example: examples.includes(query.get('example')) ? query.get('example') : 'dashboard',
    component: COMPONENTS.includes(query.get('component')) ? query.get('component') : 'all',
    filter: '',
    icons: {
      styleSpecific: query.get('icons') === 'style',
      themed: query.get('iconColor') === 'themed',
    },
    markup: ['semantic', 'prefixed', 'native'].includes(query.get('markup'))
      ? query.get('markup')
      : 'semantic',
    interactions: {
      dashboard: { query: '', status: 'all', page: 1, notice: '' },
      form: { name: '', email: '', notifications: true, status: 'idle', message: '' },
      content: { plan: 'team', subscribed: false, notice: '' },
      components: { tab: 'overview', checked: false, notice: '', input: '', progress: 62 },
    },
    paletteRoles: inventory.paletteRoles ?? {},
  };
  try {
    const saved = JSON.parse(query.get('studio') ?? '{}');
    if (saved.version !== 1) return state;
    for (const [key, values] of Object.entries(saved.edits ?? {})) {
      const [owner, mode] = key.split('|');
      const named = owner.startsWith('theme:') && inventory.themes.includes(owner.slice(6));
      const preset = inventory.presets.find(({ id }) => owner === 'preset:' + id);
      if (!inventory.modes.includes(mode) || (!named && !preset)) continue;
      const edits = cleanEdits(values, [...COLOR_ROLES, ...(state.paletteRoles[preset?.id] ?? [])]);
      if (Object.keys(edits).length) state.edits[key] = edits;
    }
    if (saved.baseline && inventory.presets.some(({ id }) => id === saved.baseline.ui)) {
      const baseline = appearanceFor(saved.baseline, inventory);
      state.baseline = {
        ...baseline,
        edits: cleanEdits(saved.baseline.edits, [
          ...COLOR_ROLES,
          ...(state.paletteRoles[baseline.ui] ?? []),
        ]),
      };
    }
  } catch {
    // A damaged link must still open a usable workspace with validated defaults.
  }
  return state;
}

/** Applies a visual change without replacing example interaction state.
 * @param {StudioState} state Current state.
 * @param {Partial<Appearance>} patch Requested visual change.
 * @param {Inventory} inventory Public inventory.
 * @returns {StudioState} Updated state.
 */
export function changeAppearance(state, patch, inventory) {
  return { ...state, appearance: appearanceFor({ ...state.appearance, ...patch }, inventory) };
}

/** Updates one token or removes it when reset is requested.
 * @param {StudioState} state Current state.
 * @param {string} role Public color role.
 * @param {string|null} value RGB channels, or null to reset.
 * @returns {StudioState} Updated state; invalid input preserves identity.
 */
export function editToken(state, role, value) {
  const roles = [...COLOR_ROLES, ...(state.paletteRoles[state.appearance.ui] ?? [])];
  const normalized = value === null ? null : normalizeRgb(value);
  if (!roles.includes(role) || normalized === '') return state;
  const key = paletteKey(state.appearance);
  const edits = { ...(state.edits[key] ?? {}) };
  if (normalized === null) delete edits[role];
  else edits[role] = normalized;
  return { ...state, edits: { ...state.edits, [key]: edits } };
}

/** Pins a detached visual snapshot; later edits cannot mutate the baseline.
 * @param {StudioState} state Current state.
 * @returns {StudioState} State with a pinned configuration.
 */
export function pinBaseline(state) {
  return {
    ...state,
    baseline: {
      ...state.appearance,
      edits: { ...(state.edits[paletteKey(state.appearance)] ?? {}) },
    },
  };
}

/** Merges a local example action shared by both comparison frames.
 * @param {StudioState} state Current state.
 * @param {string} example Example identifier.
 * @param {Object} patch New local interaction values.
 * @returns {StudioState} Updated state.
 */
export function updateInteraction(state, example, patch) {
  if (!Object.hasOwn(state.interactions, example)) return state;
  return {
    ...state,
    interactions: {
      ...state.interactions,
      [example]: { ...state.interactions[example], ...patch },
    },
  };
}

/** Encodes visual/workspace state only; form contents never enter share links.
 * @param {StudioState} state Current state.
 * @returns {string} Query string compatible with legacy appearance links.
 */
export function serializeState(state) {
  const { ui, theme, mode, corners, bridge } = state.appearance;
  const query = new URLSearchParams({
    ui,
    theme: theme || 'None',
    mode,
    view: state.view,
    example: state.example,
    component: state.component,
    markup: state.markup,
  });
  if (corners) query.set('corners', corners);
  if (bridge) query.set('bridge', 'on');
  if (state.icons?.styleSpecific) query.set('icons', 'style');
  if (state.icons?.themed) query.set('iconColor', 'themed');
  const key = paletteKey(state.appearance);
  const edits = state.edits[key] ? { [key]: state.edits[key] } : {};
  if (Object.keys(edits).length || state.baseline)
    query.set('studio', JSON.stringify({ version: 1, edits, baseline: state.baseline }));
  return '?' + query;
}
