/**
 * @module studio/assets
 * @description Stages focused stylesheets and retains the active paint until a replacement transaction succeeds.
 */
const root = new URL('.', document.currentScript.src);
const loads = new Map();
let active;

/** Releases an inactive stylesheet once no pending renderer still owns it.
 * @param {Object} entry Shared stylesheet entry.
 * @returns {void}
 */
function releaseEntry(entry) {
  if (!entry || entry === active || entry.users) return;
  entry.link.remove();
  if (loads.get(entry.ui) === entry) loads.delete(entry.ui);
}

/** Stages one library stylesheet without repainting the visible document.
 * Call activate only for the selected render generation, then finish or roll back its transaction.
 * Always release the lease, including when another generation supersedes preparation.
 * @param {string} ui Validated preset identifier.
 * @returns {Promise<Object>} Lease with activate and release methods; activation exposes finish and rollback.
 */
export async function preparePresetStylesheet(ui) {
  const inventory = window.UI_STYLE_KIT_MANIFEST;
  if (!inventory.presets.some((preset) => preset.id === ui))
    throw new RangeError('Unknown UI preset.');
  if (!loads.has(ui)) {
    const link = document.createElement('link');
    const href = new URL('../dist/visual/' + ui + '.css', root);
    href.searchParams.set('v', inventory.studio.styles[ui]);
    link.rel = 'stylesheet';
    link.media = 'not all';
    link.href = href.href;
    link.dataset.studioPreset = ui;
    const entry = { ui, link, users: 0 };
    entry.ready = new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = () => {
        loads.delete(ui);
        link.remove();
        reject(new Error('The ' + ui + ' stylesheet could not load. Retry the preview.'));
      };
    });
    loads.set(ui, entry);
    // Preserve visual paint before composition, Layout, interaction, and application CSS.
    document.head.insertBefore(link, document.head.querySelector('link[rel="stylesheet"]'));
  }
  const entry = loads.get(ui);
  entry.users++;
  try {
    await entry.ready;
  } catch (error) {
    entry.users--;
    releaseEntry(entry);
    throw error;
  }
  let released = false;
  return {
    activate() {
      const previous = active;
      let finished = false;
      entry.link.media = 'all';
      active = entry;
      if (previous && previous !== entry) previous.link.media = 'not all';
      return {
        finish() {
          if (finished) return;
          finished = true;
          releaseEntry(previous);
        },
        rollback() {
          if (finished) return;
          finished = true;
          if (active === entry && previous !== entry) {
            active = previous;
            entry.link.media = 'not all';
            if (previous) previous.link.media = 'all';
          }
          releaseEntry(entry);
        },
      };
    },
    release() {
      if (released) return;
      released = true;
      entry.users--;
      releaseEntry(entry);
    },
  };
}
