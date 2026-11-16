/**
 * @module studio/lifetime
 * @description Explicit resource ownership for one mounted specimen, without browser API interception.
 */

/** Creates a disposable listener, observer, timer and object-URL scope.
 * @param {AbortSignal} [parent] Optional owning mount signal.
 * @returns {Object} Native-compatible resource helpers and an idempotent disposer.
 */
export function createLifetime(parent) {
  const controller = new AbortController();
  const cleanups = new Set();
  let closed = false;
  /** Releases every owned resource exactly once.
   * @returns {void}
   */
  function dispose() {
    if (closed) return;
    closed = true;
    controller.abort();
    parent?.removeEventListener('abort', dispose);
    for (const cleanup of [...cleanups].reverse()) cleanup();
    cleanups.clear();
  }
  /** Registers a native event listener inside this mount.
   * @param {EventTarget} target Event source.
   * @param {string} type Native event name.
   * @param {Function} listener Handler.
   * @param {boolean|Object} [options] Native listener options.
   * @returns {void}
   */
  function listen(target, type, listener, options) {
    if (closed) return;
    const normalized = typeof options === 'boolean' ? { capture: options } : (options ?? {});
    target.addEventListener(type, listener, {
      ...normalized,
      signal: normalized.signal ?? controller.signal,
    });
    cleanups.add(() => target.removeEventListener(type, listener, normalized));
  }
  /** Owns a native event property, restoring earlier owners in reverse assignment order.
   * @param {EventTarget} target Native control.
   * @param {string} type Event name without the on prefix.
   * @param {Function} handler Native property handler.
   * @returns {Function} Assigned handler, preserving assignment expression behavior.
   */
  function handle(target, type, handler) {
    if (closed) return handler;
    const property = 'on' + type;
    const previous = target[property];
    target[property] = handler;
    cleanups.add(() => {
      if (target[property] === handler) target[property] = previous;
    });
    return handler;
  }
  /** Constructs an observer whose connection is released on unmount.
   * @param {Function} Observer Native observer constructor.
   * @param {...*} args Constructor arguments.
   * @returns {Object} Observer instance.
   */
  function observe(Observer, ...args) {
    const observer = new Observer(...args);
    if (closed) observer.disconnect();
    else cleanups.add(() => observer.disconnect());
    return observer;
  }
  /** Schedules sample feedback only while its mount remains live.
   * @param {Function} callback Local work.
   * @param {number} delay Milliseconds.
   * @returns {*} Native timer handle, or null after disposal.
   */
  function later(callback, delay) {
    if (closed) return null;
    const cleanup = () => clearTimeout(timer);
    const timer = setTimeout(() => {
      cleanups.delete(cleanup);
      callback();
    }, delay);
    cleanups.add(cleanup);
    return timer;
  }
  /** Owns a generated download URL until the specimen unmounts.
   * @param {Blob} blob Local sample document.
   * @returns {string} Native object URL.
   */
  function objectUrl(blob) {
    const url = URL.createObjectURL(blob);
    if (closed) URL.revokeObjectURL(url);
    else cleanups.add(() => URL.revokeObjectURL(url));
    return url;
  }
  /** Registers an optional control only when that authored region exists.
   * @param {?EventTarget} target Optional event source.
   * @param {...*} args Native event registration arguments.
   * @returns {void}
   */
  function listenOptional(target, ...args) {
    if (target) listen(target, ...args);
  }
  if (parent?.aborted) dispose();
  else parent?.addEventListener('abort', dispose, { once: true });
  return {
    signal: controller.signal,
    listen,
    listenOptional,
    handle,
    observe,
    later,
    objectUrl,
    dispose,
  };
}
