/**
 * @module studio/icons
 * @description UI Style Kit Icons artwork, lazy family loading, and optional consumer setup.
 */
import { inlineSvg } from 'ui-style-kit-icons/inline-svg';
import { loadRegisteredScript } from './script-loader.js';

/** Icon artwork preferences shared by the host and both preview documents.
 * @typedef {Object} IconPreferences
 * @property {boolean} [styleSpecific=false] Match the selected UI preset family.
 * @property {boolean} [themed=false] Use themed artwork instead of monochrome.
 */

/** Exactly pinned companion artifact used by the studio build and setup examples. */
export const ICON_VERSION = '2.0.0';
/** Compatibility names in the retained authored specimens, mapped to actual companion assets. */
export const ICON_ALIASES = {
  'chart-no-axes-column': 'chart-bar',
  'circle-check': 'success',
  'circle-x': 'error',
  diamond: 'tile',
  ellipsis: 'more-horizontal',
  'flask-conical': 'paint-brush',
  house: 'home',
  'layout-grid': 'grid',
  'lock-keyhole': 'lock',
  'messages-square': 'message',
  paperclip: 'attachment',
  pencil: 'edit',
  'trash-2': 'trash',
  'triangle-alert': 'warning',
  x: 'close',
  'caret-down': 'chevron-down',
  'caret-left': 'chevron-left',
  'caret-right': 'chevron-right',
  'check-circle': 'success',
  leaf: 'heart',
  'magnifying-glass': 'search',
  'upload-simple': 'upload',
};
/** Canonical icons used by studio controls in addition to the retained specimens. */
export const STUDIO_ICON_NAMES = [
  'copy',
  'check',
  'close',
  'settings',
  'folder',
  'plus',
  'download',
  'link',
  'external-link',
  'search',
  'filter',
  'grid',
  'info',
  'undo',
  'code',
  'palette',
  'replace',
  'arrow-right',
];

const requests = new WeakMap();
const painted = new WeakSet();
let sequence = 0;

/** Chooses artwork only; all icon and control paint remains library-owned.
 * @param {IconPreferences} preferences Global icon preferences.
 * @param {string} ui Validated preview style.
 * @returns {{pack:string,variant:string}} Explicit family and color treatment.
 */
export function iconConfiguration(preferences = {}, ui = 'minimal-saas') {
  return {
    pack: preferences.styleSpecific ? ui : 'minimal-saas',
    variant: preferences.themed ? 'themed' : 'monochrome',
  };
}

/** Loads exactly one artwork variant and verifies the required studio inventory.
 * @param {string} [pack='minimal-saas'] Canonical icon family.
 * @param {string} [variant='monochrome'] Requested artwork treatment.
 * @returns {Promise<void>} Resolves when the selected variant is registered; failures remain retryable.
 */
export function prepareIcons(pack = 'minimal-saas', variant = 'monochrome') {
  if (!/^[a-z][a-z0-9-]*$/.test(pack) || !['monochrome', 'themed'].includes(variant))
    return Promise.reject(new RangeError('Unknown icon family.'));
  return loadRegisteredScript(
    'icon-packs/' + pack + '/' + variant + '.js',
    () => {
      const assets = window.UI_STYLE_KIT_ICON_ASSETS?.[pack]?.[variant];
      return (
        assets &&
        [...STUDIO_ICON_NAMES, ...Object.values(ICON_ALIASES)].every(
          (name) => typeof assets[name] === 'string',
        )
      );
    },
    'The ' + pack + ' icon artwork could not load. Retry the preview.',
  );
}

/** Normalizes licensed SVG copies through the companion API and scopes fragment IDs.
 * @param {string} source Exact package SVG.
 * @param {string} name Canonical icon name.
 * @param {{pack:string,variant:string}} configuration Artwork configuration.
 * @param {boolean} [marker=false] Whether legacy markup needs a refresh marker.
 * @returns {string} Decorative, independently scoped inline SVG.
 */
export function decorateIcon(source, name, configuration, marker = false) {
  let svg = inlineSvg(source);
  const namespace = 'studio-icon-' + ++sequence + '-';
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of ids)
    svg = svg
      .replaceAll('id="' + id + '"', 'id="' + namespace + id + '"')
      .replaceAll('url(#' + id + ')', 'url(#' + namespace + id + ')')
      .replaceAll('href="#' + id + '"', 'href="#' + namespace + id + '"');
  const key = configuration.pack + '|' + configuration.variant + '|' + name;
  return svg.replace(
    /<svg\b([^>]*)>/,
    (_, attributes) =>
      '<svg' +
      attributes.replace(
        /\s(?:aria-label|aria-labelledby|aria-hidden|role|focusable)="[^"]*"/g,
        '',
      ) +
      ' aria-hidden="true" focusable="false" data-library-icon="' +
      name +
      '" data-icon-pack="' +
      configuration.pack +
      '" data-icon-variant="' +
      configuration.variant +
      '"' +
      (marker ? ' data-studio-icon="' + name + '" data-studio-icon-key="' + key + '"' : '') +
      '>',
  );
}

/** Reconciles artwork under the document's latest selection without replacing control state or focus.
 * @param {Document|Element} scope Owned document or preview root.
 * @param {IconPreferences} preferences Global icon preferences.
 * @param {string} ui Style selected by this preview.
 * @returns {Promise<Object>} Applied artwork configuration.
 */
export async function hydrateIcons(scope, preferences, ui) {
  const configuration = iconConfiguration(preferences, ui);
  const request = configuration.pack + '|' + configuration.variant;
  // Document ownership also supersedes older requests from overlapping subtrees.
  const owner = scope.ownerDocument || scope;
  if (requests.get(owner)?.key !== request) requests.set(owner, { key: request });
  const generation = requests.get(owner);
  await prepareIcons(configuration.pack, configuration.variant);
  if (requests.get(owner) !== generation) return configuration;
  const assets = window.UI_STYLE_KIT_ICON_ASSETS[configuration.pack][configuration.variant];
  for (const node of [
    ...(scope.matches?.('[data-studio-icon]') ? [scope] : []),
    ...scope.querySelectorAll('[data-studio-icon]'),
  ]) {
    const name = ICON_ALIASES[node.dataset.studioIcon] ?? node.dataset.studioIcon;
    const key = request + '|' + name;
    if (node.dataset.studioIconKey === key && painted.has(node)) continue;
    if (!assets[name]) throw new RangeError('Icon is not in the studio asset inventory: ' + name);
    const standalone = node.namespaceURI === 'http://www.w3.org/2000/svg';
    const artwork = decorateIcon(assets[name], name, configuration, standalone);
    if (standalone) {
      const template = document.createElement('template');
      template.innerHTML = artwork;
      const replacement = template.content.firstElementChild;
      node.replaceWith(replacement);
      painted.add(replacement);
    } else {
      painted.add(node);
      node.innerHTML = artwork;
      node.dataset.studioIconKey = key;
      node.classList.toggle(
        'usk-icons-mono',
        Boolean(
          node.closest(
            'button[data-ui-variant="primary"],button[data-ui-variant="warning"],button[data-ui-variant="danger"]',
          ),
        ),
      );
    }
  }
  return configuration;
}

/** Gives copyable, optional NPM/self-hosted or pinned-CDN icon setup instructions.
 * @param {IconPreferences} preferences Current icon options.
 * @param {string} ui Selected UI style.
 * @param {string} [method='npm'] NPM or CDN.
 * @returns {string} Consumer-owned installation and accessible markup.
 */
export function iconInstallMarkup(preferences, ui, method = 'npm') {
  const { pack, variant } = iconConfiguration(preferences, ui);
  const cdn = 'https://cdn.jsdelivr.net/npm/ui-style-kit-icons@' + ICON_VERSION + '/';
  const element =
    '<button class="usk-icon-button" type="button" aria-label="Copy">\n  <usk-icon name="copy" pack="' +
    pack +
    '" variant="' +
    variant +
    '"></usk-icon>\n</button>';
  if (method === 'cdn')
    return (
      '<link rel="stylesheet" href="' +
      cdn +
      'dist/ui-style-kit-icons.css">\n<script type="module" src="' +
      cdn +
      'dist/ui-style-kit-icons.js"></script>\n\n' +
      element
    );
  return (
    'npm install ui-style-kit-icons@' +
    ICON_VERSION +
    '\n\n' +
    '// Copy these package directories into your public web root:\n// node_modules/ui-style-kit-icons/svg        -> public/icons/svg\n// node_modules/ui-style-kit-icons/monochrome -> public/icons/monochrome\n\n' +
    'import "ui-style-kit-icons/element";\nimport "ui-style-kit-icons/css.css";\nimport { setAssetBaseUrl, setDefaultPack } from "ui-style-kit-icons";\n\nsetDefaultPack("' +
    pack +
    '");\nsetAssetBaseUrl(new URL("/icons/", location.origin));\n\n' +
    element
  );
}
