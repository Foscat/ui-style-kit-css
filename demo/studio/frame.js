/**
 * @module studio/frame
 * @description Owns one isolated preview document and its local, disposable interaction wiring.
 */
import { COLOR_ROLES, normalizeRgb } from './state.js';
import { loadRegisteredScript } from './script-loader.js';
import { renderExample } from './examples.js';
import { preparePresetStylesheet } from './assets.js';
import { changesBetween } from './changes.js';
import { renderCatalog, componentOptions } from './catalog.js';
import { hydrateIcons, iconConfiguration, prepareIcons } from './icons.js';
import { isFrameMessage, targetOrigin } from './protocol.js';

const channel = location.hash.slice(1);
const origin = targetOrigin(location.href);
const root = document.getElementById('preview-root');
const inventory = window.UI_STYLE_KIT_MANIFEST;
let current;
let revision = -1;
let mounted = false;
let mountedIdentity = '';
let renderGeneration = 0;
let rendering = false;
let renderError = '';
let catalogCards = [];
const catalogSearch = new Map(
  componentOptions.map((option) => [
    option.id,
    {
      family: option.family,
      text: (option.label + ' ' + option.family + ' ' + option.html).toLowerCase(),
    },
  ]),
);
let prefix = '';
let cleanup = () => {};
let controller = new AbortController();
const tokenNames = new Set();

/** Sends a bounded event through this frame's private protocol channel.
 * @param {string} type Protocol event name.
 * @param {Object} [payload={}] Event data.
 * @returns {void}
 */
function send(type, payload = {}) {
  parent.postMessage({ version: 1, channel, type, revision, ...payload }, origin);
}

/** Forwards a local interaction to the one shared state owner.
 * @param {string} scope Example identifier.
 * @param {Object} patch Changed local values.
 * @returns {void}
 */
function action(scope, patch) {
  send('action', { scope, patch });
}

/** Resolves palette roles from the actual selected preview, including material colors.
 * @returns {Array<{role:string,value:string}>} Editable resolved colors.
 */
function tokens() {
  const computed = getComputedStyle(document.body);
  const roles = new Set(COLOR_ROLES);
  if (!current.appearance.theme)
    for (const role of inventory.paletteRoles[current.appearance.ui] ?? []) roles.add(role);
  return [...roles].flatMap((role) => {
    const name = '--' + (current.appearance.theme ? 'usk' : prefix) + '-' + role + '-rgb';
    const value =
      normalizeRgb(computed.getPropertyValue(name)) ||
      normalizeRgb(computed.getPropertyValue('--' + prefix + '-' + role + '-rgb'));
    return value ? [{ role, value }] : [];
  });
}

/** Applies public geometry without invalidating palette reads or the mounted example.
 * @returns {void}
 */
function applyCorners() {
  const corners = current.appearance.corners;
  if (corners) document.body.dataset.uskCorners = corners;
  else document.body.removeAttribute('data-usk-corners');
}

/** Applies only visual attributes and public tokens, retaining the live example DOM.
 * @param {boolean} [retag=true] Whether retained prefixed components need their classes updated.
 * @returns {void}
 */
function applyAppearance(retag = true) {
  const appearance = current.appearance;
  const oldPrefix = prefix;
  prefix = inventory.presets.find(({ id }) => id === appearance.ui).prefix;
  document.body.dataset.ui = appearance.ui;
  document.body.dataset.mode = appearance.mode;
  if (appearance.theme) document.body.dataset.theme = appearance.theme;
  else document.body.removeAttribute('data-theme');
  applyCorners();
  for (const name of tokenNames) document.body.style.removeProperty(name);
  tokenNames.clear();
  for (const [role, value] of Object.entries(current.edits)) {
    if (!/^[a-z][a-z0-9-]*$/.test(role) || !normalizeRgb(value)) continue;
    const name = '--' + (appearance.theme ? 'usk' : prefix) + '-' + role + '-rgb';
    document.body.style.setProperty(name, value);
    tokenNames.add(name);
  }
  if (retag && oldPrefix && oldPrefix !== prefix && current.markup === 'prefixed') {
    for (const node of root.querySelectorAll('[class]')) {
      for (const name of [...node.classList]) {
        if (name.startsWith(oldPrefix + '-'))
          node.classList.replace(name, prefix + name.slice(oldPrefix.length));
      }
    }
  }
}

/** Synchronizes real values without resetting focus or an input's caret.
 * @param {string[]} [scopes] Changed interaction domains.
 * @param {boolean} [surfaces=false] Whether every interaction hook needs initial synchronization.
 * @returns {void}
 */
function syncInteractions(
  scopes = ['dashboard', 'form', 'components', 'content'],
  surfaces = false,
) {
  const { dashboard, form, content, components } = current.interactions;
  const setValue = (selector, value) => {
    for (const field of root.querySelectorAll(selector))
      if (field.value !== String(value)) field.value = value;
  };
  if (scopes.includes('dashboard')) {
    setValue('[data-action="project-search"]', dashboard.query);
    setValue('[data-action="project-status"]', dashboard.status);
    if (dashboard.created && !root.querySelector('[data-created-record]')) {
      const body = root.querySelector('tbody');
      if (body && root.querySelector('[data-record]')) {
        const row = document.createElement('tr');
        row.dataset.record = '';
        row.dataset.createdRecord = '';
        row.dataset.search = 'untitled project alex morgan';
        row.dataset.status = 'Active';
        row.innerHTML =
          '<th scope="row">Untitled project</th><td>Alex Morgan</td><td>Active</td><td>Not scheduled</td>';
        body.prepend(row);
      }
    }
    let visible = 0;
    for (const row of root.querySelectorAll('[data-record]')) {
      row.hidden =
        !row.dataset.search.includes(String(dashboard.query).trim().toLowerCase()) ||
        (dashboard.status !== 'all' && row.dataset.status !== dashboard.status);
      visible += Number(!row.hidden);
    }
    const count = root.querySelector('[data-record-count]');
    if (count) count.textContent = visible + (visible === 1 ? ' project' : ' projects');
    const empty = root.querySelector('[data-project-empty]');
    if (empty) empty.hidden = visible > 0;
  }
  if (scopes.includes('form')) {
    setValue('[data-action="profile-name"]', form.name);
    setValue('[data-action="profile-email"]', form.email);
    const notifications = root.querySelector('[data-action="profile-notifications"]');
    if (notifications) notifications.checked = form.notifications;
    const save = root.querySelector('[data-save-button]');
    if (save) {
      save.disabled = form.status === 'saving';
      save.setAttribute('aria-busy', String(form.status === 'saving'));
      save.textContent = form.status === 'saving' ? 'Saving…' : 'Save changes';
      save.dataset.surfaceFeedback =
        form.status === 'saved' ? 'success' : form.status === 'error' ? 'error' : '';
    }
    const feedback = root.querySelector('[data-form-message]');
    if (feedback) {
      feedback.textContent = form.message;
      feedback.dataset.status = form.status;
      feedback.hidden = !form.message;
      feedback.classList.toggle('usk-alert', Boolean(form.message));
      feedback.classList.remove('usk-help-text');
      if (form.status === 'error') feedback.dataset.uiVariant = 'danger';
      else if (form.status === 'saved') feedback.dataset.uiVariant = 'success';
      else delete feedback.dataset.uiVariant;
    }
  }
  if (scopes.includes('components')) {
    setValue('[data-action="component-input"]', components.input);
    const check = root.querySelector('[data-action="component-check"]');
    if (check) check.checked = components.checked;
    const panel = root.querySelector('#tab-panel');
    if (panel) {
      panel.textContent =
        components.tab === 'activity'
          ? 'Three projects were updated today.'
          : 'Overview of the workspace.';
      panel.setAttribute('aria-labelledby', 'tab-' + components.tab);
      for (const tab of root.querySelectorAll('[role="tab"]')) {
        const active = tab.dataset.action === 'tab-' + components.tab;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      }
    }
    for (const button of root.querySelectorAll('[data-action^="page-"]')) {
      if (button.dataset.action === 'page-' + (components.page === 2 ? 'two' : 'one'))
        button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  }
  if (scopes.includes('content')) {
    for (const button of root.querySelectorAll('[data-action^="plan-"]')) {
      button.setAttribute('aria-pressed', String(button.dataset.action === 'plan-' + content.plan));
    }
    const description = root.querySelector('[data-plan-description]');
    if (description)
      description.textContent =
        content.plan === 'solo'
          ? 'A focused workspace for your own projects.'
          : 'Shared projects and a little more room to grow.';
  }
  const scope =
    current.view === 'components' && current.component !== 'data'
      ? components
      : current.example === 'content'
        ? content
        : dashboard;
  const activeScope =
    current.view === 'components' && current.component !== 'data'
      ? 'components'
      : current.example === 'content'
        ? 'content'
        : 'dashboard';
  if (scopes.includes(activeScope))
    for (const notice of root.querySelectorAll('[data-example-notice]')) {
      notice.textContent = scope.notice;
      notice.hidden = !scope.notice;
      notice.classList.toggle('usk-alert', Boolean(scope.notice));
      notice.classList.remove('usk-help-text');
    }
  if (
    !surfaces &&
    current.appearance.bridge &&
    scopes.some((scope) => ['components', 'content'].includes(scope))
  ) {
    for (const control of root.querySelectorAll('[data-action^="page-"], [data-action^="plan-"]'))
      control.dataset.surfaceLevel = control.matches('[aria-pressed="true"], [aria-current="page"]')
        ? '3'
        : '2';
  }
  if (surfaces)
    for (const control of root.querySelectorAll(
      'button, a[href], input, select, textarea, summary',
    )) {
      control.classList.toggle('interactive-surface', current.appearance.bridge);
      if (current.appearance.bridge) {
        control.dataset.surfaceLevel = control.matches(
          '[aria-pressed="true"], [aria-current="page"]',
        )
          ? '3'
          : control.matches('button')
            ? '2'
            : '1';
        control.dataset.surfaceVariant = control.dataset.uiVariant || 'subtle';
      } else {
        delete control.dataset.surfaceLevel;
        delete control.dataset.surfaceVariant;
      }
    }
}

/** Serializes public rendered markup, including hydrated icons, without studio instrumentation.
 * @param {Element} source Container whose children form the reusable block.
 * @returns {string} Standalone component markup; application behavior remains consumer-owned.
 */
function publicMarkup(source) {
  const fragment = source.cloneNode(true);
  for (const node of fragment.querySelectorAll('*')) {
    if (node.dataset.studioLabel) node.setAttribute('aria-label', node.dataset.studioLabel);
    for (const name of [...node.classList])
      if (/^(?:example-|studio-|component-)/.test(name) || name === 'visually-hidden')
        node.classList.remove(name);
    if (node.hasAttribute('class') && !node.className) node.removeAttribute('class');
    for (const attribute of [...node.attributes])
      if (
        /^data-(?:action|studio-|library-icon|icon-pack|icon-variant|catalog-|record|search|status|settings-form|save-button|example-notice|form-message|project-empty|record-count|plan-description|created-record)/.test(
          attribute.name,
        )
      )
        node.removeAttribute(attribute.name);
  }
  return fragment.innerHTML.trim();
}

/** Copies the selected rendered block while excluding studio-only behavior hooks.
 * @param {string} id Registered catalog option.
 * @returns {void}
 */
function copyComponent(id) {
  const card = [...root.querySelectorAll('[data-component-option]')].find(
    (node) => node.dataset.componentOption === id,
  );
  const preview = card?.querySelector('[data-component-preview]');
  if (!preview) return;
  send('copy', {
    markup: publicMarkup(preview),
    label: card.querySelector('[data-option-label]').textContent,
  });
}

/** Binds the shared example once per mount using an abortable listener scope.
 * @returns {void}
 */
function bind() {
  const options = { signal: controller.signal };
  root.addEventListener(
    'input',
    (event) => {
      const control = event.target;
      const name = control.dataset.action;
      if (name === 'project-search') action('dashboard', { query: control.value });
      if (name === 'profile-name') action('form', { name: control.value });
      if (name === 'profile-email') action('form', { email: control.value });
      if (name === 'component-input') action('components', { input: control.value });
    },
    options,
  );
  root.addEventListener(
    'change',
    (event) => {
      const control = event.target;
      if (control.dataset.action === 'project-status')
        action('dashboard', { status: control.value });
      if (control.dataset.action === 'profile-notifications')
        action('form', { notifications: control.checked });
      if (control.dataset.action === 'component-check')
        action('components', { checked: control.checked });
    },
    options,
  );
  root.addEventListener(
    'click',
    (event) => {
      const copied = event.target.closest('[data-copy-option]');
      if (copied) {
        copyComponent(copied.dataset.copyOption);
        return;
      }
      const segment = event.target.closest('[data-catalog-segment]');
      if (segment)
        for (const item of segment.parentElement.querySelectorAll('[data-catalog-segment]'))
          item.setAttribute('aria-pressed', String(item === segment));
      const control = event.target.closest('[data-action]');
      if (!control) return;
      const name = control.dataset.action;
      if (name === 'new-project')
        action('dashboard', {
          created: true,
          notice: 'A new project was added to this sample workspace.',
        });
      if (name === 'profile-reset')
        action('form', { name: '', email: '', notifications: true, status: 'idle', message: '' });
      if (name.startsWith('plan-')) action('content', { plan: name.slice(5) });
      if (name === 'content-request')
        action('content', {
          subscribed: true,
          notice: 'Sample request received. No signup was submitted.',
        });
      if (name === 'content-start')
        root.querySelector('#plans')?.scrollIntoView({ block: 'center', behavior: 'instant' });
      if (name.startsWith('tab-')) action('components', { tab: name.slice(4) });
      if (name.startsWith('page-'))
        action('components', {
          page: name === 'page-two' ? 2 : 1,
          notice: name === 'page-two' ? 'Page 2 selected.' : 'Page 1 selected.',
        });
      if (name === 'component-save') {
        action('components', { notice: 'Saving…' });
      }
      if (name === 'open-dialog') root.querySelector('#sample-dialog').showModal();
    },
    options,
  );
  root.addEventListener(
    'keydown',
    (event) => {
      if (
        !event.target.matches('[role="tab"]') ||
        !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
      )
        return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 'overview'
          : event.key === 'End'
            ? 'activity'
            : current.interactions.components.tab === 'overview'
              ? 'activity'
              : 'overview';
      action('components', { tab: next });
      root.querySelector('#tab-' + next).focus();
    },
    options,
  );
  root.querySelector('[data-settings-form]')?.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      action('form', { status: 'saving', message: 'Saving your sample changes…' });
    },
    options,
  );
  const dialog = root.querySelector('#sample-dialog');
  dialog?.addEventListener(
    'close',
    () => {
      action('components', {
        notice:
          dialog.returnValue === 'confirm' ? 'Sample project archived.' : 'Archiving cancelled.',
      });
      root.querySelector('[data-action="open-dialog"]').focus();
    },
    options,
  );
}

/** Lazily loads the explicit authored-specimen registry only for Style details.
 * @returns {Promise<Object>} Registry.
 */
function loadSpecimens() {
  return loadRegisteredScript(
    'studio-specimens.js',
    () =>
      typeof window.StudioSpecimens?.prepare === 'function' &&
      typeof window.StudioSpecimens.mount === 'function',
    'The style specimen could not be loaded. Retry the preview.',
  ).then(() => window.StudioSpecimens);
}

/** Reconciles one host configuration; stale asynchronous mounts cannot commit.
 * @param {Object} next Validated host configuration.
 * @param {number} nextRevision Monotonic host revision.
 * @param {boolean} [force=false] Whether retrying must refresh visual prerequisites.
 * @returns {Promise<void>} Resolves when this configuration is visible.
 */
async function configure(next, nextRevision, force = false) {
  if (!Number.isInteger(nextRevision) || nextRevision < revision) return;
  const changes = changesBetween(current, next);
  current = next;
  revision = nextRevision;
  const visual =
    force || !mounted || changes.mount || changes.palette || changes.icons || changes.bridge;
  if (!visual) {
    if (rendering) return;
    if (changes.geometry) applyCorners();
    if (changes.filter && current.view === 'components') filterCatalog();
    if (changes.scopes.length) syncInteractions(changes.scopes);
    if (renderError) send('error', { message: renderError });
    else send('rendered');
    return;
  }
  const generation = ++renderGeneration;
  rendering = true;
  renderError = '';
  let stylesheet;
  let restoreMount;
  try {
    const identity = [
      current.view,
      current.example,
      current.markup,
      current.view === 'details' ? current.appearance.ui + '|' + current.appearance.mode : '',
    ].join('|');
    const needsMount = !mounted || changes.mount || identity !== mountedIdentity;
    if (needsMount || changes.icons || force) {
      const icons = iconConfiguration(current.icons, current.appearance.ui);
      await prepareIcons(icons.pack, icons.variant);
    }
    if (generation !== renderGeneration) return;
    let registry;
    if (needsMount && current.view === 'details') {
      registry = await loadSpecimens();
      await registry.prepare(current.appearance);
    }
    if (generation !== renderGeneration) return;
    // Commit paint only after every replacement prerequisite is ready.
    stylesheet = await preparePresetStylesheet(current.appearance.ui);
    if (generation !== renderGeneration) return;
    const previous = {
      nodes: [...root.childNodes],
      cleanup,
      controller,
      prefix,
      mounted,
      identity: mountedIdentity,
      cards: catalogCards,
      tokens: [...tokenNames],
      label: root.getAttribute('aria-label'),
      focus: root.contains(document.activeElement) ? document.activeElement : null,
      attributes: ['data-ui', 'data-mode', 'data-theme', 'data-usk-corners', 'style'].map(
        (name) => [name, document.body.getAttribute(name)],
      ),
    };
    const activation = stylesheet.activate();
    restoreMount = () => {
      if (needsMount) {
        if (cleanup !== previous.cleanup) cleanup();
        if (controller !== previous.controller) controller.abort();
        root.replaceChildren(...previous.nodes);
      } else if (prefix !== previous.prefix && current.markup === 'prefixed') {
        for (const node of root.querySelectorAll('[class]'))
          for (const name of [...node.classList])
            if (name.startsWith(prefix + '-'))
              node.classList.replace(name, previous.prefix + name.slice(prefix.length));
      }
      cleanup = previous.cleanup;
      controller = previous.controller;
      prefix = previous.prefix;
      mounted = previous.mounted;
      mountedIdentity = previous.identity;
      catalogCards = previous.cards;
      tokenNames.clear();
      for (const name of previous.tokens) tokenNames.add(name);
      for (const [name, value] of previous.attributes)
        if (value === null) document.body.removeAttribute(name);
        else document.body.setAttribute(name, value);
      if (previous.label === null) root.removeAttribute('aria-label');
      else root.setAttribute('aria-label', previous.label);
      activation.rollback();
      previous.focus?.focus();
    };
    if (changes.palette || !mounted || force) applyAppearance(!needsMount);
    // Geometry may change while this mount awaits prerequisites; commit its latest accepted value.
    else applyCorners();
    if (needsMount) {
      cleanup = () => {};
      controller = new AbortController();
      root.setAttribute('aria-label', current.label);
      if (current.view === 'details')
        cleanup = registry.mount(root, current.appearance, (patch) =>
          send('action', { scope: 'appearance', patch }),
        );
      else {
        root.innerHTML =
          current.view === 'components'
            ? '<div data-ui-structure="neutral" class="component-example ly-wrapper ly-wrapper--content ly-stack ly-section ly-section--compact">' +
              renderCatalog('all', '', current.markup, prefix) +
              '</div>'
            : renderExample(current.example);
        cleanup = () => {};
        bind();
      }
      for (const landmark of root.querySelectorAll(
        'nav[aria-label], [role="region"][aria-label]',
      )) {
        landmark.dataset.studioLabel = landmark.getAttribute('aria-label');
        landmark.setAttribute('aria-label', current.label + ': ' + landmark.dataset.studioLabel);
      }
      mounted = true;
      mountedIdentity = identity;
      catalogCards = [...root.querySelectorAll('[data-component-option]')];
    }
    if (needsMount || changes.icons || force)
      await hydrateIcons(root, current.icons, current.appearance.ui);
    if (generation !== renderGeneration) return;
    if (current.view === 'components') filterCatalog();
    syncInteractions(undefined, true);
    activation.finish();
    restoreMount = null;
    if (needsMount) {
      previous.controller.abort();
      previous.cleanup();
    }
    rendering = false;
    document.title =
      inventory.presets.find((preset) => preset.id === current.appearance.ui).label + ' preview';
    send('rendered', changes.palette || needsMount || force ? { tokens: tokens(), prefix } : {});
  } catch (error) {
    restoreMount?.();
    if (generation === renderGeneration) {
      rendering = false;
      renderError = error.message;
      send('error', { message: renderError });
    }
  } finally {
    stylesheet?.release();
  }
}

/** Filters mounted options without discarding controls, artwork or local interaction state.
 * @returns {void}
 */
function filterCatalog() {
  const query = current.filter.trim().toLowerCase();
  let count = 0;
  for (const card of catalogCards) {
    const option = catalogSearch.get(card.dataset.componentOption);
    const hidden =
      (current.component !== 'all' && option.family !== current.component) ||
      !option.text.includes(query);
    if (card.hidden !== hidden) card.hidden = hidden;
    count += Number(!hidden);
  }
  const badge = root.querySelector('[data-catalog-count]');
  if (badge && badge.textContent !== count + ' options') badge.textContent = count + ' options';
  const empty = root.querySelector('[data-catalog-empty]');
  if (empty) empty.hidden = count > 0;
}

/** Authored specimens may append controls locally; refresh only their newly inserted artwork. */
const iconObserver = new window.MutationObserver((records) => {
  if (!current) return;
  const additions = new Set(
    records
      .flatMap((record) => [...record.addedNodes])
      .filter(
        (node) =>
          node.nodeType === 1 &&
          node.isConnected &&
          root.contains(node) &&
          (node.matches('[data-studio-icon]') || node.querySelector('[data-studio-icon]')),
      ),
  );
  const request = renderGeneration;
  for (const node of additions)
    void hydrateIcons(node, current.icons, current.appearance.ui).catch((error) => {
      if (request === renderGeneration) send('error', { message: error.message });
    });
});
iconObserver.observe(root, { childList: true, subtree: true });

addEventListener('message', (event) => {
  if (!isFrameMessage(event, parent, channel)) return;
  if (event.data.type === 'request-markup') {
    if (
      !rendering &&
      mounted &&
      event.data.revision === revision &&
      Number.isInteger(event.data.requestId)
    )
      send('markup', {
        requestId: event.data.requestId,
        markup: current.view === 'examples' ? publicMarkup(root) : '',
      });
    return;
  }
  if (event.data.type !== 'configure') return;
  if (origin !== '*' && event.origin !== origin) return;
  const requestedRevision = event.data.revision;
  configure(event.data.config, requestedRevision, event.data.force).catch((error) => {
    if (requestedRevision === revision) send('error', { message: error.message });
  });
});
/** Cached documents resume their existing DOM, observers and interaction listeners. */
addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  iconObserver.disconnect();
  cleanup();
  controller.abort();
});
root.innerHTML = '<p class="preview-loading" role="status">Preparing the preview…</p>';
send('ready');
