/**
 * @module studio/app
 * @description Coordinates the stable studio shell. Preview documents own rendered examples.
 */
import { enter, cancel } from '@sanderson-technology-enterprises/motion-style-css';
import {
  createState,
  appearanceLabels,
  changeAppearance,
  paletteKey,
  editToken,
  pinBaseline,
  serializeState,
  updateInteraction,
} from './state.js';
import { changesBetween } from './changes.js';
import { componentInventory } from './inventory.js';
import { escapeHtml } from './html.js';
import { hydrateIcons, iconConfiguration, iconInstallMarkup } from './icons.js';
import { isFrameMessage, targetOrigin, overrideCss, setupMarkup, copyText } from './protocol.js';

const inventory = window.UI_STYLE_KIT_MANIFEST;
const scriptUrl = new URL(document.currentScript.src);
const assetRoot = new URL('.', scriptUrl);
const origin = targetOrigin(location.href);
const byId = (id) => document.getElementById(id);
const controls = {
  ui: byId('uiSelect'),
  theme: byId('themeSelect'),
  mode: byId('modeSelect'),
  corners: byId('cornersSelect'),
};
const inspector = byId('inspector');
const frames = new Map();
const operationTimers = new Map();
let state = createState(inventory, location.search);
let revision = 0;
let tokens = [];
let resolvedPrefix = 'saas';
let renderedMarkup = '';
let renderedExportKey = '';
let tokenContext = '';
let toastTimer;
let inspectorTab = 'colors';
let iconRequest = 0;
let displayedIcons = '';
let presentationFrame = null;
let shellDirty = false;
let markupRequest = 0;
let pendingMarkup = null;
let markupDirty = true;
const compact = matchMedia('(max-width: 680px)');
const syncAppearanceDisclosure = () => {
  byId('appearance-controls').open = !compact.matches;
};
compact.addEventListener('change', syncAppearanceDisclosure);
syncAppearanceDisclosure();

/** Applies the selected shared palette and mode through public library attributes.
 * The shell keeps its Minimal SaaS component structure; isolated previews select their own preset.
 * @returns {void}
 */
function syncShellAppearance() {
  document.body.dataset.mode = state.appearance.mode;
  if (state.appearance.theme) document.body.dataset.theme = state.appearance.theme;
  else document.body.removeAttribute('data-theme');
}

/** Announces actual outcomes without replacing a focused control.
 * @param {string} message User-visible feedback.
 * @returns {void}
 */
function announce(message) {
  clearTimeout(toastTimer);
  byId('studio-announcement').textContent = message;
  toastTimer = setTimeout(() => {
    byId('studio-announcement').textContent = '';
  }, 3500);
}

/** Returns the current configuration for one owned preview.
 * @param {string} side A pinned or B editable preview.
 * @returns {Object} Serializable frame configuration.
 */
function configuration(side) {
  const appearance = side === 'a' ? state.baseline : state.appearance;
  return {
    label: side === 'a' ? 'Pinned comparison example' : 'Editable style example',
    appearance: {
      ui: appearance.ui,
      theme: appearance.theme,
      mode: appearance.mode,
      corners: appearance.corners,
      bridge: appearance.bridge,
    },
    edits: side === 'a' ? state.baseline.edits : (state.edits[paletteKey(appearance)] ?? {}),
    view: state.view === 'reference' ? 'details' : state.view,
    example: state.example,
    component: state.component,
    filter: state.filter,
    icons: state.icons,
    markup: state.markup,
    interactions: state.interactions,
  };
}

/** Sets a frame's asynchronous status without hiding its last good document.
 * @param {Object} frame Owned frame.
 * @param {string} status Loading, ready, or error.
 * @param {string} [message=''] Visible status message.
 * @returns {void}
 */
function frameStatus(frame, status, message = '') {
  const panel = byId('panel-' + frame.side);
  if (panel.dataset.status === status && !message) return;
  panel.dataset.status = status;
  panel.setAttribute('aria-busy', String(status === 'loading'));
  const statusNode = panel.querySelector('.studio-frame-status');
  statusNode.replaceChildren();
  if (message) statusNode.append(document.createTextNode(message));
  if (status === 'error') {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'usk-button';
    retry.textContent = 'Retry preview';
    retry.addEventListener(
      'click',
      () => {
        // One retry restores shared chrome and the selected preview after an artwork failure.
        void refreshHostIcons();
        sendConfiguration(frame, true);
      },
      { once: true },
    );
    statusNode.append(retry);
  }
}

/** Sends state after the frame handshake and starts a bounded readiness deadline.
 * @param {Object} frame Owned frame.
 * @param {boolean} [force=false] Re-send after a failed load.
 * @returns {void}
 */
function sendConfiguration(frame, force = false) {
  if (!frame.ready) return;
  const config = configuration(frame.side);
  const changes = changesBetween(frame.lastConfig, config);
  if (!force && !changes.changed) return;
  frame.lastConfig = config;
  frame.sentRevision = revision;
  frame.exportKey = exportKey();
  const readiness = force || changes.mount || changes.palette || changes.icons || changes.bridge;
  if (force || changes.mount || changes.icons || (changes.appearance && changes.palette))
    frameStatus(frame, 'loading', 'Preparing preview...');
  frame.element.contentWindow.postMessage(
    { version: 1, channel: frame.channel, type: 'configure', revision, force, config },
    origin,
  );
  if (readiness) {
    clearTimeout(frame.deadline);
    frame.deadline = setTimeout(
      () => frameStatus(frame, 'error', 'This preview is taking longer than expected.'),
      12000,
    );
  }
}

/** Creates an isolated preview with its own random channel and message source.
 * @param {string} side Preview slot.
 * @returns {Object} Owned frame record.
 */
function connectFrame(side) {
  if (frames.has(side)) return frames.get(side);
  const element = byId('preview-' + side);
  const channel = crypto.randomUUID();
  const frame = {
    side,
    element,
    channel,
    ready: false,
    sentRevision: -1,
    mountKey: '',
    deadline: null,
  };
  frames.set(side, frame);
  frameStatus(frame, 'loading', 'Preparing your workspace…');
  const source = new URL('preview.html', assetRoot);
  source.searchParams.set('v', inventory.studio.buildId);
  source.hash = channel;
  element.src = source.href;
  frame.deadline = setTimeout(
    () => frameStatus(frame, 'error', 'The preview could not connect. Reload to try again.'),
    12000,
  );
  return frame;
}

/** Updates bookmark state without leaking local form contents into URLs.
 * @param {boolean} [replace=false] Replace transient edits instead of adding history.
 * @returns {void}
 */
function syncUrl(replace = false) {
  const query = serializeState(state);
  const target = location.pathname + query + location.hash;
  if (location.search === query) return;
  try {
    history[replace ? 'replaceState' : 'pushState'](null, '', target);
  } catch {
    /* File browsers may reject history writes; copy links still work. */
  }
}

/** Renders the component family selector independently of the live previews.
 * @returns {void}
 */
function renderComponentList() {
  const focusedFamily = document.activeElement?.dataset.component;
  if (byId('component-list').children.length) {
    for (const button of byId('component-list').querySelectorAll('[data-component]')) {
      const pressed = String(button.dataset.component === state.component);
      if (button.getAttribute('aria-pressed') !== pressed)
        button.setAttribute('aria-pressed', pressed);
    }
    return;
  }
  const matches = componentInventory;
  byId('component-list').innerHTML =
    matches
      .map(
        ({ id, label, description }) =>
          '<button class="usk-button ly-stack ly-items-start" type="button" aria-label="' +
          escapeHtml(label) +
          '" aria-describedby="family-' +
          id +
          '-description" data-component="' +
          id +
          '" aria-pressed="' +
          (state.component === id) +
          '">' +
          label +
          '<small id="family-' +
          id +
          '-description">' +
          description +
          '</small></button>',
      )
      .join('') ||
    '<p class="studio-help usk-help-text" role="status">No matching families. Try “forms” or “status”.</p>';
  if (focusedFamily) {
    [...byId('component-list').querySelectorAll('button')]
      .find((button) => button.dataset.component === focusedFamily)
      ?.focus({ preventScroll: true });
  }
}

/** Updates decorative artwork without replacing its containing controls.
 * @returns {Promise<void>} Resolves after the current family is available or an error is shown.
 */
async function refreshHostIcons() {
  const request = ++iconRequest;
  const configuration = iconConfiguration(state.icons, state.appearance.ui);
  const key = configuration.pack + '|' + configuration.variant;
  if (key === displayedIcons) return;
  // Invalidate the settled key so reverting supersedes pending artwork and restores its status.
  displayedIcons = '';
  byId('icon-status').textContent = 'Loading icons...';
  try {
    await hydrateIcons(document, state.icons, state.appearance.ui);
    if (request !== iconRequest) return;
    displayedIcons = key;
    const label = inventory.presets.find((preset) => preset.id === configuration.pack).label;
    byId('icon-status').textContent = label + ' / ' + titleCase(configuration.variant);
  } catch (error) {
    if (request === iconRequest) byId('icon-status').textContent = error.message;
  }
}

/** Updates tool chrome without replacing controls, selection, or preview DOM.
 * @returns {void}
 */
function renderShell() {
  syncShellAppearance();
  byId('style-icons').checked = state.icons.styleSpecific;
  byId('themed-icons').checked = state.icons.themed;
  if (byId('component-search').value !== state.filter)
    byId('component-search').value = state.filter;
  void refreshHostIcons();
  for (const [name, control] of Object.entries(controls)) control.value = state.appearance[name];
  byId('markupSelect').value = state.markup;
  byId('component-group').value = state.component;
  byId('feedback-toggle').checked = state.appearance.bridge;
  for (const link of document.querySelectorAll('[data-view]')) {
    const active = link.dataset.view === (state.view === 'reference' ? 'details' : state.view);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    const query = new URLSearchParams(serializeState(state));
    query.set('view', link.dataset.view);
    link.href = '?' + query;
  }
  for (const button of document.querySelectorAll('[data-example]'))
    button.setAttribute('aria-pressed', String(button.dataset.example === state.example));
  document.querySelector('.studio-scenarios').hidden = state.view !== 'examples';
  byId('component-context').hidden = state.view !== 'components';
  byId('component-list').hidden = state.view !== 'components';
  byId('details-context').hidden = !['details', 'reference'].includes(state.view);
  byId('workspace-description').textContent =
    state.view === 'components'
      ? 'Browse components, try their variants, and copy ready-to-use element blocks.'
      : state.view === 'details' || state.view === 'reference'
        ? 'Explore the details that give each style its own character.'
        : 'Real examples. Distinct styles. Find the combination that feels right.';
  const comparing = Boolean(state.baseline) && !['details', 'reference'].includes(state.view);
  byId('previews').dataset.comparing = String(comparing);
  byId('panel-a').hidden = !comparing;
  byId('compare').disabled = ['details', 'reference'].includes(state.view);
  byId('compare').setAttribute('aria-pressed', String(Boolean(state.baseline)));
  byId('compare').textContent = state.baseline ? 'Exit comparison' : 'Compare styles';
  byId('comparison-switch').hidden = !comparing;
  byId('letter-b').textContent = comparing ? 'B' : '●';
  byId('canvas-note').textContent = comparing
    ? 'A is pinned. Style controls edit B. Example interactions stay aligned.'
    : 'The same content stays in place when you change styles.';
  for (const side of ['a', 'b']) {
    if (side === 'a' && !state.baseline) continue;
    const appearance = side === 'a' ? state.baseline : state.appearance;
    const label = inventory.presets.find(({ id }) => id === appearance.ui).label;
    byId('title-' + side).textContent = label;
    const subtitle = appearanceLabels(appearance, inventory).slice(1);
    byId('subtitle-' + side).textContent = subtitle.join(' / ');
  }
  const reference = new URL('reference.html', assetRoot);
  reference.search = serializeState(state);
  reference.searchParams.set('view', 'reference');
  byId('reference-link').href = reference.href;
  const labels = appearanceLabels(state.appearance, inventory);
  byId('appearance-summary').textContent = labels.join(' / ');
  byId('inspector-context').textContent = labels.join(' · ');
  if (state.view === 'components') renderComponentList();
  if (comparing) connectFrame('a');
  if (!state.baseline && frames.has('a')) {
    const frame = frames.get('a');
    clearTimeout(frame.deadline);
    frame.element.removeAttribute('src');
    frames.delete('a');
  }
  updateExport();
}

/** Commits one application transition, then sends the same snapshot to both previews.
 * @param {Object} next New immutable state.
 * @param {Object} [options={}] URL and loading behavior.
 * @returns {void}
 */
function commit(next, options = {}) {
  if (next === state) return;
  const previous = state;
  state = next;
  revision++;
  shellDirty ||= [
    'appearance',
    'edits',
    'baseline',
    'view',
    'example',
    'component',
    'markup',
    'icons',
  ].some((key) => previous[key] !== next[key]);
  markupDirty = true;
  if (
    ['appearance', 'edits', 'view', 'example', 'component', 'filter', 'markup', 'icons'].some(
      (key) => previous[key] !== next[key],
    )
  ) {
    renderedMarkup = '';
    pendingMarkup = null;
  }
  if (options.url !== false) syncUrl(options.replace ?? false);
  if (presentationFrame === null)
    presentationFrame = window.requestAnimationFrame(flushPresentation);
}

/** Flushes one coherent snapshot while keeping interaction-only commits outside shell rendering.
 * @returns {void}
 */
function flushPresentation() {
  presentationFrame = null;
  if (shellDirty) {
    shellDirty = false;
    renderShell();
  }
  for (const frame of frames.values()) {
    if (frame.side === 'a' && (!state.baseline || ['details', 'reference'].includes(state.view)))
      continue;
    sendConfiguration(frame);
  }
  if (inspector.open && inspectorTab === 'code') requestMarkup();
}

/** Requests a current public example only when its markup is actually consumed.
 * @param {boolean} [copyResult=false] Copy the requested result after revision validation.
 * @returns {void}
 */
function requestMarkup(copyResult = false) {
  const frame = frames.get('b');
  if (!frame?.ready || byId('panel-b').dataset.status !== 'ready' || state.view !== 'examples')
    return;
  if (!markupDirty && !copyResult) return;
  if (pendingMarkup?.revision === frame.sentRevision) {
    pendingMarkup.copyResult ||= copyResult;
    return;
  }
  const requestId = ++markupRequest;
  pendingMarkup = { requestId, revision: frame.sentRevision, copyResult };
  frame.element.contentWindow.postMessage(
    {
      version: 1,
      channel: frame.channel,
      type: 'request-markup',
      revision: frame.sentRevision,
      requestId,
    },
    origin,
  );
}

/** Converts inventory slugs to concise labels.
 * @param {string} text Inventory identifier.
 * @returns {string} Human-readable label.
 */
function titleCase(text) {
  return text
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** Converts normalized RGB channels to a native color-input value.
 * @param {string} value RGB channels.
 * @returns {string} Hex color.
 */
function hex(value) {
  return (
    '#' +
    value
      .split(' ')
      .map((channel) => Number(channel).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Reconciles token rows while retaining the field currently being edited.
 * @returns {void}
 */
function renderTokens() {
  const key = paletteKey(state.appearance) + '|' + tokens.map(({ role }) => role).join(',');
  if (key !== tokenContext) {
    byId('tokens').innerHTML = tokens
      .map(
        ({ role, value }, index) =>
          '<div class="studio-token-row ly-grid ly-items-center" data-token="' +
          role +
          '"><input type="color" aria-label="' +
          role +
          ' color" data-color="' +
          role +
          '" value="' +
          hex(value) +
          '"><label for="token-' +
          index +
          '">' +
          escapeHtml(role) +
          '</label><input id="token-' +
          index +
          '" class="usk-input" data-rgb="' +
          role +
          '" aria-label="' +
          role +
          ' RGB" value="' +
          value +
          '" spellcheck="false" inputmode="numeric"><button class="usk-button" type="button" data-reset="' +
          role +
          '" aria-label="Reset ' +
          role +
          '"><span class="usk-button__icon" aria-hidden="true" data-studio-icon="undo"></span></button></div>',
      )
      .join('');
    tokenContext = key;
    void hydrateIcons(byId('tokens'), state.icons, state.appearance.ui).catch((error) =>
      announce(error.message),
    );
  } else {
    for (const { role, value } of tokens) {
      const row = [...byId('tokens').children].find((node) => node.dataset.token === role);
      if (!row) continue;
      const rgb = row.querySelector('[data-rgb]');
      if (document.activeElement !== rgb) rgb.value = value;
      row.querySelector('[data-color]').value = hex(value);
    }
  }
}

/** Identifies the visual and markup state that must match a preview report.
 * @returns {string} Stable configuration fingerprint without private form text.
 */
function exportKey() {
  return JSON.stringify([
    state.appearance,
    state.edits[paletteKey(state.appearance)] ?? {},
    state.view,
    state.example,
    state.component,
    state.filter,
    state.icons,
    state.markup,
  ]);
}

/** Refreshes copy/download content from the committed preview report.
 * @returns {void}
 */
function updateExport() {
  const ready = renderedExportKey === exportKey() && tokens.length > 0;
  byId('download-css').disabled = !ready;
  document.querySelector('[data-copy="css-code"]').disabled = !ready;
  document.querySelector('[data-copy="markup-code"]').disabled = !ready || !renderedMarkup;
  byId('colors-panel').setAttribute('aria-busy', String(!ready));
  if (!tokens.length) byId('tokens').textContent = 'Preparing the active palette...';
  byId('setup-code').textContent = setupMarkup(state.appearance, {
    layout: state.view === 'examples',
    markup: renderedMarkup,
  });
  byId('icon-install-code').textContent = iconInstallMarkup(
    state.icons,
    state.appearance.ui,
    byId('icon-install-method').value,
  );
  byId('css-code').textContent = ready
    ? overrideCss(state.appearance, resolvedPrefix, tokens)
    : '/* Waiting for the active preview palette. */';
  byId('markup-code').textContent = !ready
    ? '<!-- Preparing the selected example. -->'
    : !renderedMarkup
      ? state.view === 'components'
        ? '<!-- Use a Copy icon in the component grid to select an element block. -->'
        : '<!-- Open Components for reusable component markup. Full authored specimens are reference compositions. -->'
      : renderedMarkup.replace(
          /\sdata-(?:action|record|search|status|settings-form|save-button|example-notice|form-message|project-empty|record-count|plan-description)(?:="[^"]*")?/g,
          '',
        );
  const share = new URL(location.href);
  share.search = serializeState(state);
  share.hash = '';
  byId('share-url').value = share.href;
}

/** Copies text or opens an explicit manual fallback without claiming success.
 * @param {string} text Requested text.
 * @param {string} message Success announcement.
 * @returns {Promise<void>} Resolves after the available copy path is presented.
 */
async function copy(text, message) {
  try {
    await copyText(text);
    announce(message);
  } catch {
    const fallback = byId('copy-fallback');
    byId('copy-value').value = text;
    fallback.showModal();
    byId('copy-value').focus();
    byId('copy-value').select();
  }
}

/** Completes shared sample operations independently of preview presentation lifetime.
 * A new terminal state or reset cancels the pending outcome for that interaction domain.
 * @param {string} scope Validated interaction domain.
 * @param {Object} patch Accepted shared-state changes.
 * @returns {void}
 */
function scheduleSampleOutcome(scope, patch) {
  if (scope !== 'form' && scope !== 'components') return;
  const form = scope === 'form';
  const field = form ? 'status' : 'notice';
  if (!Object.hasOwn(patch, field)) return;
  clearTimeout(operationTimers.get(scope));
  operationTimers.delete(scope);
  if (patch[field] !== (form ? 'saving' : 'Saving?')) return;
  const failed = form && state.interactions.form.email.toLowerCase().includes('fail');
  const outcome = form
    ? {
        status: failed ? 'error' : 'saved',
        message: failed
          ? 'Sample save failed. Change the email and try again.'
          : 'Your changes were saved in this session.',
      }
    : { notice: 'Changes saved in the sample workspace.' };
  operationTimers.set(
    scope,
    setTimeout(
      () => {
        operationTimers.delete(scope);
        receiveAction(scope, outcome);
      },
      form ? 600 : 450,
    ),
  );
}

/** Validates the small action surface exposed to owned sample frames.
 * @param {string} scope Local example or appearance.
 * @param {Object} patch Candidate local changes.
 * @returns {void}
 */
function receiveAction(scope, patch) {
  if (!patch || typeof patch !== 'object') return;
  if (scope === 'appearance') {
    commit(changeAppearance(state, patch, inventory));
    return;
  }
  const fields = {
    dashboard: { query: 'string', status: 'string', notice: 'string', created: 'boolean' },
    form: {
      name: 'string',
      email: 'string',
      notifications: 'boolean',
      status: 'string',
      message: 'string',
    },
    content: { plan: 'string', subscribed: 'boolean', notice: 'string' },
    components: {
      tab: 'string',
      checked: 'boolean',
      notice: 'string',
      input: 'string',
      page: 'number',
    },
  }[scope];
  if (!fields) return;
  const safe = Object.fromEntries(
    Object.entries(patch).filter(
      ([key, value]) =>
        Object.hasOwn(fields, key) &&
        typeof value === fields[key] &&
        (typeof value !== 'string' || value.length <= 2000),
    ),
  );
  commit(updateInteraction(state, scope, safe), { url: false });
  scheduleSampleOutcome(scope, safe);
}

addEventListener('message', (event) => {
  if (origin !== '*' && event.origin !== origin) return;
  for (const frame of frames.values()) {
    if (!isFrameMessage(event, frame.element.contentWindow, frame.channel)) continue;
    const message = event.data;
    if (message.type === 'ready') {
      frame.ready = true;
      sendConfiguration(frame);
    }
    if (message.type === 'rendered' && message.revision === frame.sentRevision) {
      clearTimeout(frame.deadline);
      frameStatus(frame, 'ready');
      if (frame.side === 'b') {
        const exportChanged = renderedExportKey !== frame.exportKey;
        renderedExportKey = frame.exportKey;
        if (message.tokens) {
          tokens = message.tokens;
          resolvedPrefix = message.prefix;
          renderTokens();
          updateExport();
        } else if (exportChanged) updateExport();
        if (inspector.open && inspectorTab === 'code') requestMarkup();
      }
    }
    if (
      message.type === 'markup' &&
      pendingMarkup &&
      message.requestId === pendingMarkup.requestId &&
      message.revision === frame.sentRevision &&
      typeof message.markup === 'string' &&
      message.markup.length <= 64000
    ) {
      const requested = pendingMarkup;
      pendingMarkup = null;
      renderedMarkup = message.markup;
      markupDirty = false;
      updateExport();
      if (requested.copyResult) void copy(renderedMarkup, 'Copied example HTML.');
    }
    if (message.type === 'error' && message.revision === frame.sentRevision) {
      clearTimeout(frame.deadline);
      frameStatus(frame, 'error', message.message);
    }
    if (
      message.type === 'copy' &&
      message.revision === frame.sentRevision &&
      typeof message.markup === 'string' &&
      message.markup.length <= 64000 &&
      typeof message.label === 'string' &&
      message.label.length <= 120
    ) {
      if (frame.side === 'b') {
        renderedMarkup = message.markup;
        updateExport();
      }
      void copy(message.markup, 'Copied ' + message.label + ' HTML.');
    }
    if (message.type === 'action') receiveAction(message.scope, message.patch);
    return;
  }
});

for (const control of [controls.ui, controls.theme, controls.mode]) control.replaceChildren();
for (const { id, label } of componentInventory) byId('component-group').add(new Option(label, id));
byId('component-group').addEventListener('change', (event) =>
  commit({ ...state, component: event.target.value }),
);

for (const { id, label } of inventory.presets) controls.ui.add(new Option(label, id));
controls.theme.add(new Option('Style defaults', ''));
for (const theme of inventory.themes) controls.theme.add(new Option(titleCase(theme), theme));
for (const mode of inventory.modes)
  controls.mode.add(new Option(mode === 'contrast' ? 'High contrast' : titleCase(mode), mode));
for (const [name, control] of Object.entries(controls))
  control.addEventListener('change', () =>
    commit(changeAppearance(state, { [name]: control.value }, inventory)),
  );

document.querySelector('.studio-nav').addEventListener('click', (event) => {
  const link = event.target.closest('[data-view]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  commit({ ...state, view: link.dataset.view });
});
document.querySelector('.studio-scenarios').addEventListener('click', (event) => {
  const button = event.target.closest('[data-example]');
  if (button) commit({ ...state, example: button.dataset.example });
});
byId('component-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-component]');
  if (button) commit({ ...state, component: button.dataset.component });
});
byId('feedback-toggle').addEventListener('change', (event) =>
  commit(changeAppearance(state, { bridge: event.target.checked }, inventory)),
);
byId('component-search').addEventListener('input', (event) =>
  commit({ ...state, filter: event.target.value.slice(0, 120) }, { url: false }),
);
for (const [id, preference] of [
  ['style-icons', 'styleSpecific'],
  ['themed-icons', 'themed'],
])
  byId(id).addEventListener('change', (event) =>
    commit({ ...state, icons: { ...state.icons, [preference]: event.target.checked } }),
  );
byId('icon-install-method').addEventListener('change', updateExport);
byId('markupSelect').addEventListener('change', (event) =>
  commit({ ...state, markup: event.target.value }),
);
byId('compare').addEventListener('click', () =>
  commit(state.baseline ? { ...state, baseline: null } : pinBaseline(state)),
);
byId('replace-baseline').addEventListener('click', () => {
  commit(pinBaseline(state));
  announce('Baseline replaced with the current configuration.');
});
byId('comparison-switch').addEventListener('click', (event) => {
  const button = event.target.closest('[data-side]');
  if (!button) return;
  byId('previews').dataset.visibleSide = button.dataset.side;
  for (const item of byId('comparison-switch').querySelectorAll('button'))
    item.setAttribute('aria-pressed', String(item === button));
});
byId('customize').addEventListener('click', () => {
  inspector.showModal();
  if (inspectorTab === 'code') {
    updateExport();
    requestMarkup();
  }
  void enter(byId('inspector-motion'), { preset: 'slide', direction: 'left', duration: 180 }).catch(
    () => {},
  );
});
byId('close-inspector').addEventListener('click', () => inspector.close());
inspector.addEventListener('close', () => {
  cancel(byId('inspector-motion'));
  byId('customize').focus();
});

/** Switches the inspector's accessible tab pair.
 * @param {string} selected Colors or code.
 * @returns {void}
 */
function selectInspectorTab(selected) {
  inspectorTab = selected;
  if (selected === 'code') {
    updateExport();
    requestMarkup();
  }
  for (const id of ['colors', 'code']) {
    const active = id === selected;
    byId(id + '-tab').setAttribute('aria-selected', String(active));
    byId(id + '-tab').tabIndex = active ? 0 : -1;
    byId(id + '-panel').hidden = !active;
  }
}
for (const id of ['colors', 'code'])
  byId(id + '-tab').addEventListener('click', () => selectInspectorTab(id));
document.querySelector('.studio-inspector-tabs').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  selectInspectorTab(
    event.key === 'Home'
      ? 'colors'
      : event.key === 'End'
        ? 'code'
        : inspectorTab === 'colors'
          ? 'code'
          : 'colors',
  );
  byId(inspectorTab + '-tab').focus();
});
byId('tokens').addEventListener('input', (event) => {
  const input = event.target;
  const role = input.dataset.rgb ?? input.dataset.color;
  if (!role) return;
  const value = input.dataset.color
    ? input.value
        .slice(1)
        .match(/../g)
        .map((part) => parseInt(part, 16))
        .join(' ')
    : input.value;
  const next = editToken(state, role, value);
  input.setAttribute('aria-invalid', String(next === state));
  if (next !== state) commit(next, { replace: true });
});
byId('tokens').addEventListener('click', (event) => {
  const button = event.target.closest('[data-reset]');
  if (button) commit(editToken(state, button.dataset.reset, null), { replace: true });
});
byId('reset-palette').addEventListener('click', () => {
  commit(
    { ...state, edits: { ...state.edits, [paletteKey(state.appearance)]: {} } },
    { replace: true },
  );
  announce('This palette’s edits were reset.');
});
byId('code-panel').addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  if (button.dataset.copy === 'markup-code' && state.view === 'examples') requestMarkup(true);
  else void copy(byId(button.dataset.copy).textContent, 'Copied to clipboard.');
});
byId('copy-link').addEventListener(
  'click',
  () => void copy(byId('share-url').value, 'Configuration link copied.'),
);
byId('download-css').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([byId('css-code').textContent], { type: 'text/css' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = state.appearance.ui + '-' + state.appearance.mode + '.css';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Palette CSS download started.');
});
addEventListener('popstate', () => {
  const restored = createState(inventory, location.search);
  const key = paletteKey(restored.appearance);
  commit(
    {
      ...restored,
      edits: { ...state.edits, ...restored.edits, [key]: restored.edits[key] ?? {} },
      interactions: state.interactions,
    },
    { url: false },
  );
});
const previewResize = new ResizeObserver(() => {
  const width = Math.round(
    Math.max(
      byId('preview-b').getBoundingClientRect().width,
      byId('preview-a').getBoundingClientRect().width,
    ),
  );
  byId('preview-width').textContent = width + ' px actual viewport';
});
previewResize.observe(byId('preview-b'));
previewResize.observe(byId('preview-a'));
byId('studio-version').textContent = inventory.studio.version;
renderShell();
connectFrame('b');
if (state.baseline && !['details', 'reference'].includes(state.view)) connectFrame('a');
syncUrl(true);

/** Releases timers on permanent navigation; browser-cache freezing retains pending shared outcomes. */
addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  for (const timer of operationTimers.values()) clearTimeout(timer);
  operationTimers.clear();
});
