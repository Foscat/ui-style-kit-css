/**
 * @module studio/html
 * @description Shared text escaping for trusted authored HTML templates.
 */

/** Escapes user-facing values before inserting them into trusted templates.
 * @param {unknown} value Text value.
 * @returns {string} Safe HTML text.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
