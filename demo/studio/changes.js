/**
 * @module studio/changes
 * @description Classifies frame snapshots by the work their consumers actually own.
 */

/** Compares flat public records without serializing unrelated state.
 * @param {Object} [left={}] Previous values.
 * @param {Object} [right={}] Next values.
 * @returns {boolean} Whether the records carry equal primitive fields.
 */
function same(left = {}, right = {}) {
  if (left === right) return true;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => left[key] === right[key]);
}

/** Computes independent visual and interaction invalidation domains.
 * Missing previous state intentionally requests a complete initial render.
 * @param {?Object} previous Last accepted frame snapshot.
 * @param {Object} next Requested frame snapshot.
 * @returns {Object} Mount, appearance, palette, icon, filter, bridge and interaction changes.
 */
export function changesBetween(previous, next) {
  const before = previous?.appearance ?? {};
  const after = next.appearance;
  const appearance = !previous || ['ui', 'theme', 'mode'].some((key) => before[key] !== after[key]);
  const mount =
    !previous ||
    ['view', 'example', 'markup'].some((key) => previous[key] !== next[key]) ||
    (next.view === 'details' && (before.ui !== after.ui || before.mode !== after.mode));
  const palette = appearance || !same(previous?.edits, next.edits);
  const icons =
    !previous ||
    !same(previous.icons, next.icons) ||
    (next.icons.styleSpecific && before.ui !== after.ui);
  const filter =
    !previous || previous.component !== next.component || previous.filter !== next.filter;
  const bridge = !previous || before.bridge !== after.bridge;
  const scopes = Object.keys(next.interactions).filter(
    (scope) => !same(previous?.interactions?.[scope], next.interactions[scope]),
  );
  return {
    mount,
    appearance,
    palette,
    icons,
    filter,
    bridge,
    scopes,
    changed: Boolean(mount || appearance || palette || icons || filter || bridge || scopes.length),
  };
}
