/**
 * @module studio/specimens
 * @description Mounts the same explicit authored modules used by the retained reference fixture.
 */
import { createSpecimenContext } from './specimen-context.js';
import { prepareSpecimen } from './specimen-loader.js';

/** Prepares one selected board through the shared loader.
 * @param {Object} appearance Selected preset.
 * @returns {Promise<Object>} Registered authored module.
 */
async function prepare(appearance) {
  return prepareSpecimen(appearance.ui);
}

/** Mounts a board with explicit signal propagation and complete resource cleanup.
 * @param {HTMLElement} root Owned content region.
 * @param {Object} appearance Current appearance.
 * @param {Function} onAppearance Explicit sample palette/mode callback.
 * @returns {Function} Idempotent disposer.
 */
function mount(root, appearance, onAppearance) {
  const module = window.StudioAuthored[appearance.ui];
  const context = createSpecimenContext(
    root,
    appearance,
    window.UI_STYLE_KIT_MANIFEST,
    onAppearance,
  );
  const abort = new AbortController();
  root.innerHTML = module.render(context);
  const ownedNodes = [...root.childNodes];
  let cleanup;
  try {
    cleanup = module.bind(root, context, abort.signal);
  } catch (error) {
    abort.abort();
    throw error;
  }
  for (const link of root.querySelectorAll('a[href^="#"]')) {
    if (context.byId(link.hash.slice(1))) continue;
    link.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        const status = root.querySelector('[role="status"]');
        if (status)
          status.textContent = 'This navigation item belongs to the complete reference board.';
      },
      { signal: abort.signal },
    );
  }
  return () => {
    abort.abort();
    cleanup?.();
    for (const node of ownedNodes) if (node.parentNode === root) node.remove();
  };
}
window.StudioSpecimens = { prepare, mount };
