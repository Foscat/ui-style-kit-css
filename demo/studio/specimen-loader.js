/**
 * @module studio/specimen-loader
 * @description One classic-script loader and registration contract for Studio and reference boards.
 */
import { loadRegisteredScript } from './script-loader.js';

/** Prepares exactly the selected shared specimen and its retained artwork registries.
 * @param {string} ui Supported preset identifier.
 * @returns {Promise<Object>} Explicit render/bind implementation.
 */
export async function prepareSpecimen(ui) {
  const entry = window.UI_STYLE_KIT_MANIFEST.specimens[ui];
  if (!entry) throw new RangeError('Unknown authored specimen.');
  await Promise.all([
    loadRegisteredScript(
      'demo-icons.js',
      () => window.UI_STYLE_KIT_ICONS,
      'The specimen icons could not load. Retry the preview.',
    ),
    loadRegisteredScript(
      entry.file,
      () =>
        typeof window.StudioAuthored?.[ui]?.render === 'function' &&
        typeof window.StudioAuthored[ui].bind === 'function',
      'Unable to load ' + entry.file + '. Retry the preview.',
    ),
    ...(ui === 'organic-modern'
      ? [
          loadRegisteredScript(
            'demo-organic-icons.js',
            () => window.ORGANIC_PHOSPHOR_ICONS,
            'The Organic icons could not load. Retry the preview.',
          ),
        ]
      : []),
  ]);
  const module = window.StudioAuthored?.[ui];
  if (!module?.render || !module.bind) throw new Error('The ' + ui + ' specimen did not register.');
  return module;
}
