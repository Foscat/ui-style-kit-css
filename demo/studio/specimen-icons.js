/**
 * @module studio/specimen-icons
 * @description Shared authored icon wrappers; the companion library supplies the SVG artwork.
 */
/** Wraps a companion icon in the original Retro Glass layout.
 * @param {string} name Canonical compatibility name.
 * @param {Object<string,string>} icons Companion artwork registry.
 * @returns {string} Decorative markup.
 */
export function retroGlassIcon(name, icons) {
  return `<span class="demo-rg-icon ly-cluster" aria-hidden="true">${icons[name]}</span>`;
}
