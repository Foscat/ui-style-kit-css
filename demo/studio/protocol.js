/**
 * @module studio/protocol
 * @description Versioned frame messages and copyable public CSS configuration.
 */

/** Recognizes only messages from an owned preview window and channel.
 * @param {MessageEvent|Object} event Incoming message.
 * @param {Window|Object} source Expected source window.
 * @param {string} channel Per-frame random channel.
 * @returns {boolean} Whether the message belongs to the studio protocol.
 */
export function isFrameMessage(event, source, channel) {
  return (
    event.source === source &&
    event.data?.version === 1 &&
    event.data.channel === channel &&
    [
      'ready',
      'configure',
      'rendered',
      'action',
      'copy',
      'error',
      'request-markup',
      'markup',
    ].includes(event.data.type)
  );
}

/** Resolves exact HTTP origins while supporting opaque local-file documents.
 * @param {string} href Target URL.
 * @returns {string} Explicit target origin or the required local-file wildcard.
 */
export function targetOrigin(href) {
  const url = new URL(href);
  return url.protocol === 'file:' ? '*' : url.origin;
}

/** Formats resolved palette channels using their owning public token namespace.
 * @param {Appearance} appearance Visual configuration.
 * @param {string} prefix Public preset prefix.
 * @param {Array<{role:string,value:string}>} tokens Resolved public colors.
 * @returns {string} Reusable CSS.
 */
export function overrideCss(appearance, prefix, tokens) {
  const selector = appearance.theme
    ? ':where([data-ui][data-theme="' +
      appearance.theme +
      '"][data-mode="' +
      appearance.mode +
      '"])'
    : ':where([data-ui="' +
      appearance.ui +
      '"]:not([data-theme])[data-mode="' +
      appearance.mode +
      '"])';
  const owner = appearance.theme ? 'usk' : prefix;
  return (
    selector +
    ' {\n' +
    tokens
      .map(({ role, value }) => '  --' + owner + '-' + role + '-rgb: ' + value + ';')
      .join('\n') +
    '\n}\n'
  );
}

/** Produces a minimal CSS-only setup rather than a demo runtime dependency.
 * @param {Appearance} appearance Visual configuration.
 * @returns {string} Copyable installation and HTML example.
 */
export function setupMarkup(appearance) {
  const theme = appearance.theme ? ' data-theme="' + appearance.theme + '"' : '';
  return (
    '<!-- Install: npm install ui-style-kit-css -->\n<!-- Save this HTML at the project root and serve that folder. -->\n<!-- Bundlers can import ui-style-kit-css/visual.css instead of this link. -->\n<link rel="stylesheet" href="./node_modules/ui-style-kit-css/dist/ui-style-kit.visual.css">\n<link rel="stylesheet" href="./node_modules/ui-style-kit-css/styles/component-composition.css">\n\n<body data-ui="' +
    appearance.ui +
    '"' +
    theme +
    ' data-mode="' +
    appearance.mode +
    '">\n  <button class="usk-button" data-ui-variant="primary">Get started</button>\n</body>\n' +
    (appearance.bridge
      ? '\n<!-- Interaction feedback: also compose ui-style-kit-css/interactive-surface-theme.css\n     and interactive-surface-css/state-core.css, then apply .interactive-surface hooks. -->\n'
      : '')
  );
}

/** Copies text, letting the caller provide a visible manual fallback.
 * @param {string} text Text to copy.
 * @returns {Promise<void>} Resolves when the clipboard accepts the text.
 */
export async function copyText(text) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
}
