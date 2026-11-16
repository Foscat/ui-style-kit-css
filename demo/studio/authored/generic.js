/**
 * @module studio/authored/generic
 * @description Shared surface-only specimens for presets without a dedicated reference board.
 */
import { renderStyleSpecificSurface } from '../surfaces.js';
/** Renders the selected public surface collection.
 * @param {Object} context Owned appearance and prefix.
 * @returns {string} Authored markup.
 */
export function render(context) {
  return renderStyleSpecificSurface(context.appearance.ui, context.prefix);
}
/** Surface-only samples require no additional event resources.
 * @returns {Function} Empty cleanup.
 */
export function bind() {
  return () => {};
}
if (typeof window !== 'undefined') {
  window.StudioAuthored ??= {};
  for (const id of [
    'minimal-saas',
    'neumorphism',
    'retrofuturism',
    'brutalism',
    'y2k',
    'data-terminal',
  ])
    window.StudioAuthored[id] = { render, bind };
}
