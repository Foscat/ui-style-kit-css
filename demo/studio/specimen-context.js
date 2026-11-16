/**
 * @module studio/specimen-context
 * @description Explicit appearance, asset and callback input shared by both demo consumers.
 */

/** Resolves one specimen context from actual host state rather than simulated controls.
 * @param {HTMLElement} root Owned content container.
 * @param {Object} appearance Selected preset, palette and mode.
 * @param {Object} inventory Generated public and specimen inventory.
 * @param {Function} onAppearance Explicit palette/mode callback.
 * @param {boolean} [referencePalette=!appearance.theme] Whether the original board palette is active.
 * @returns {Object} Stable input for an authored renderer and its binder.
 */
export function createSpecimenContext(
  root,
  appearance,
  inventory,
  onAppearance,
  referencePalette = !appearance.theme,
) {
  return {
    root,
    appearance,
    inventory,
    onAppearance,
    referencePalette,
    prefix: inventory.presets.find((preset) => preset.id === appearance.ui).prefix,
    document: root.ownerDocument,
    icons: window.UI_STYLE_KIT_ICONS ?? {},
    organicIcons: window.ORGANIC_PHOSPHOR_ICONS ?? {},
    scriptUrl: new URL(inventory.specimens[appearance.ui].file, new URL('.', location.href)).href,
    byId(id) {
      if (!id) return null;
      return root.id === id ? root : root.querySelector('#' + globalThis.CSS.escape(id));
    },
  };
}
