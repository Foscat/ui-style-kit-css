/**
 * @module studio/script-loader
 * @description Shares versioned classic-script loading with exact registration validation and retryable failures.
 */
const loads = new Map();
const assetRoot = typeof document === 'undefined' ? null : new URL('.', document.currentScript.src);

/** Loads and validates one registry before retaining its successful readiness promise.
 * @param {string} filename Demo-relative generated asset.
 * @param {Function} registered Predicate for the exact requested module or artwork variant.
 * @param {string} message Useful transport or registration failure feedback.
 * @returns {Promise<void>} Resolves after execution and registration validation.
 */
export function loadRegisteredScript(filename, registered, message) {
  if (registered()) return Promise.resolve();
  const url = new URL(filename, assetRoot);
  url.searchParams.set('v', window.UI_STYLE_KIT_MANIFEST.studio.buildId);
  const key = url.href;
  if (!loads.has(key)) {
    loads.set(
      key,
      new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = key;
        const fail = () => {
          loads.delete(key);
          script.remove();
          reject(new Error(message));
        };
        script.onload = () => {
          try {
            if (registered()) resolve();
            else fail();
          } catch {
            fail();
          }
        };
        script.onerror = fail;
        document.head.append(script);
      }),
    );
  }
  return loads.get(key);
}
