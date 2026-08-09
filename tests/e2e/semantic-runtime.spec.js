import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualBundlePath = path.join(rootDir, 'dist', 'ui-style-kit.visual.css');
const buttonVariants = [null, 'primary', 'secondary', 'danger', 'ghost'];

const buttonProperties = [
  'alignItems',
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'cursor',
  'display',
  'fontFamily',
  'fontWeight',
  'justifyContent',
  'minHeight',
  'opacity',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop'
];
const cardProperties = [
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop'
];
const fieldProperties = [
  'alignItems',
  'color',
  'display',
  'flexDirection',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'gap'
];
const controlProperties = [
  'appearance',
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'cursor',
  'display',
  'fontFamily',
  'minHeight',
  'opacity',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop'
];
const indicatorProperties = [
  'backgroundColor',
  'backgroundImage',
  'blockSize',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderRadius',
  'boxShadow',
  'display',
  'inlineSize',
  'opacity',
  'transform'
];
const surfaceProperties = [
  'backgroundColor',
  'backgroundImage',
  'borderBottomColor',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'boxShadow',
  'color',
  'display',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'gap',
  'marginBottom',
  'marginTop',
  'overflow',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'textTransform'
];
const semanticSafetyContracts = [
  [
    'button',
    'button',
    [
      'boxSizing',
      'gap',
      'lineHeight',
      'maxInlineSize',
      'minInlineSize',
      'verticalAlign',
      'whiteSpace'
    ]
  ],
  [
    'icon-button',
    'button',
    [
      'boxSizing',
      'gap',
      'lineHeight',
      'maxInlineSize',
      'minInlineSize',
      'verticalAlign',
      'whiteSpace'
    ]
  ],
  ['card', 'article', ['maxInlineSize', 'minInlineSize', 'overflowWrap']],
  ['field', 'div', ['maxInlineSize', 'minInlineSize', 'overflowWrap']],
  ['badge', 'span', ['maxInlineSize', 'minInlineSize', 'whiteSpace']],
  ['alert', 'aside', ['maxInlineSize', 'minInlineSize', 'overflowWrap']],
  ['nav', 'nav', ['maxInlineSize', 'minInlineSize', 'overflowWrap']],
  ['nav-link', 'a', ['maxInlineSize', 'minInlineSize', 'whiteSpace']],
  ['table-wrap', 'div', ['maxInlineSize', 'minInlineSize', 'overflowWrap']],
  ['toolbar', 'div', ['maxInlineSize', 'minInlineSize', 'overflowWrap']]
];

function buttonMarkup(prefix, variant, kind) {
  const variantAttribute = variant ? ` data-ui-variant="${variant}"` : '';
  const prefixedVariant = variant ? ` ${prefix}-button-${variant}` : '';
  const disabled = kind === 'disabled' ? ' disabled' : '';

  return `
    <button id="semantic-${kind}" class="ui-button"${variantAttribute}${disabled}>Semantic ${kind}</button>
    <button id="prefixed-${kind}" class="${prefix}-button${prefixedVariant}"${disabled}>Prefixed ${kind}</button>`;
}

function groupOneFixture(preset) {
  const variantMarkup = buttonVariants.map((variant) => {
    const kind = variant ?? 'neutral';
    return buttonMarkup(preset.prefix, variant, kind);
  }).join('');

  return `<!doctype html>
    <html lang="en">
      <head>
        <style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>
      </head>
      <body data-ui="${preset.id}" data-theme="arctic-indigo" data-mode="light">
        <main>
          ${variantMarkup}
          ${buttonMarkup(preset.prefix, null, 'disabled')}
          <button id="semantic-icon" class="ui-icon-button" aria-label="Semantic settings">S</button>
          <button id="prefixed-icon" class="${preset.prefix}-icon-button" aria-label="Prefixed settings">P</button>
          <article id="semantic-card" class="ui-card">Semantic card</article>
          <article id="prefixed-card" class="${preset.prefix}-card">Prefixed card</article>
        </main>
      </body>
    </html>`;
}

function formFixture(preset) {
  return `<!doctype html>
    <html lang="en">
      <head>
        <style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>
      </head>
      <body data-ui="${preset.id}" data-theme="arctic-indigo" data-mode="light">
        <main>
          <div id="semantic-field" class="ui-field">
            <label id="semantic-label" class="ui-label" for="semantic-input">Semantic name</label>
            <input id="semantic-input" class="ui-input" value="Semantic input">
            <span id="semantic-help" class="ui-help-text">Semantic help</span>
          </div>
          <div id="prefixed-field" class="${preset.prefix}-field">
            <label id="prefixed-label" class="${preset.prefix}-label" for="prefixed-input">Prefixed name</label>
            <input id="prefixed-input" class="${preset.prefix}-input" value="Prefixed input">
            <span id="prefixed-help" class="${preset.prefix}-help-text">Prefixed help</span>
          </div>
          <select id="semantic-select" class="ui-select" aria-label="Semantic choice"><option>Choice</option></select>
          <select id="prefixed-select" class="${preset.prefix}-select" aria-label="Prefixed choice"><option>Choice</option></select>
          <textarea id="semantic-textarea" class="ui-textarea" aria-label="Semantic notes">Notes</textarea>
          <textarea id="prefixed-textarea" class="${preset.prefix}-textarea" aria-label="Prefixed notes">Notes</textarea>
          <input id="semantic-disabled-input" class="ui-input" aria-label="Semantic disabled input" disabled>
          <input id="prefixed-disabled-input" class="${preset.prefix}-input" aria-label="Prefixed disabled input" disabled>
          <label id="semantic-check" class="ui-check">
            <input id="semantic-checkbox" type="checkbox" checked>
            <span id="semantic-check-control" class="ui-check-control" aria-hidden="true"></span>
            Semantic checkbox
          </label>
          <label id="prefixed-check" class="${preset.prefix}-check">
            <input id="prefixed-checkbox" type="checkbox" checked>
            <span id="prefixed-check-control" class="${preset.prefix}-check-control" aria-hidden="true"></span>
            Prefixed checkbox
          </label>
          <label id="semantic-radio-label" class="ui-radio">
            <input id="semantic-radio" type="radio" name="semantic-radio" checked>
            <span id="semantic-radio-control" class="ui-radio-control" aria-hidden="true"></span>
            Semantic radio
          </label>
          <label id="prefixed-radio-label" class="${preset.prefix}-radio">
            <input id="prefixed-radio" type="radio" name="prefixed-radio" checked>
            <span id="prefixed-radio-control" class="${preset.prefix}-radio-control" aria-hidden="true"></span>
            Prefixed radio
          </label>
          <label id="semantic-switch" class="ui-switch">
            <input id="semantic-switch-input" type="checkbox" checked>
            <span id="semantic-switch-track" class="ui-switch-track" aria-hidden="true">
              <span id="semantic-switch-thumb" class="ui-switch-thumb"></span>
            </span>
            Semantic switch
          </label>
          <label id="prefixed-switch" class="${preset.prefix}-switch">
            <input id="prefixed-switch-input" type="checkbox" checked>
            <span id="prefixed-switch-track" class="${preset.prefix}-switch-track" aria-hidden="true">
              <span id="prefixed-switch-thumb" class="${preset.prefix}-switch-thumb"></span>
            </span>
            Prefixed switch
          </label>
        </main>
      </body>
    </html>`;
}

function remainingRolesFixture(preset, { disableMotion = true } = {}) {
  const badgeVariants = [null, 'primary', 'secondary', 'success', 'warning', 'danger'];
  const alertVariants = [null, 'success', 'warning', 'danger'];
  const badges = badgeVariants.map((variant) => {
    const name = variant ?? 'neutral';
    const semanticVariant = variant ? ` data-ui-variant="${variant}"` : '';
    const prefixedVariant = variant ? ` ${preset.prefix}-badge-${variant}` : '';
    return `
      <span id="semantic-badge-${name}" class="ui-badge"${semanticVariant}>Semantic ${name}</span>
      <span id="prefixed-badge-${name}" class="${preset.prefix}-badge${prefixedVariant}">Prefixed ${name}</span>`;
  }).join('');
  const alerts = alertVariants.map((variant) => {
    const name = variant ?? 'neutral';
    const semanticVariant = variant ? ` data-ui-variant="${variant}"` : '';
    const prefixedVariant = variant ? ` ${preset.prefix}-alert-${variant}` : '';
    return `
      <aside id="semantic-alert-${name}" class="ui-alert"${semanticVariant}>
        <strong id="semantic-alert-title-${name}" class="ui-alert-title">Semantic ${name}</strong>
        <span id="semantic-alert-body-${name}" class="ui-alert-body">Semantic body</span>
      </aside>
      <aside id="prefixed-alert-${name}" class="${preset.prefix}-alert${prefixedVariant}">
        <strong id="prefixed-alert-title-${name}" class="${preset.prefix}-alert-title">Prefixed ${name}</strong>
        <span id="prefixed-alert-body-${name}" class="${preset.prefix}-alert-body">Prefixed body</span>
      </aside>`;
  }).join('');

  return `<!doctype html>
    <html lang="en">
      <head>
        ${disableMotion
    ? '<style>*, *::before, *::after { animation: none !important; transition: none !important; }</style>'
    : ''}
      </head>
      <body data-ui="${preset.id}" data-theme="arctic-indigo" data-mode="light">
        <main>
          ${badges}
          ${alerts}
          <nav id="semantic-nav" class="ui-nav" aria-label="Semantic navigation">
            <a id="semantic-nav-link" class="ui-nav-link is-active" href="#semantic-table" aria-current="page">Semantic table</a>
          </nav>
          <nav id="prefixed-nav" class="${preset.prefix}-nav" aria-label="Prefixed navigation">
            <a id="prefixed-nav-link" class="${preset.prefix}-nav-link is-active" href="#prefixed-table" aria-current="page">Prefixed table</a>
          </nav>
          <div id="semantic-table-wrap" class="ui-table-wrap">
            <table id="semantic-table" class="ui-table"><tbody><tr><td id="semantic-cell">Semantic cell</td></tr></tbody></table>
          </div>
          <div id="prefixed-table-wrap" class="${preset.prefix}-table-wrap">
            <table id="prefixed-table" class="${preset.prefix}-table"><tbody><tr><td id="prefixed-cell">Prefixed cell</td></tr></tbody></table>
          </div>
          <div id="semantic-progress" class="ui-progress" role="progressbar" aria-label="Semantic progress" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
            <div id="semantic-progress-bar" class="ui-progress-bar"></div>
          </div>
          <div id="prefixed-progress" class="${preset.prefix}-progress" role="progressbar" aria-label="Prefixed progress" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
            <div id="prefixed-progress-bar" class="${preset.prefix}-progress-bar"></div>
          </div>
          <div id="semantic-toolbar" class="ui-toolbar" role="toolbar" aria-label="Semantic toolbar"></div>
          <div id="prefixed-toolbar" class="${preset.prefix}-toolbar" role="toolbar" aria-label="Prefixed toolbar"></div>
          <span id="semantic-spinner" class="ui-spinner" role="status" aria-label="Semantic loading"></span>
          <span id="prefixed-spinner" class="${preset.prefix}-spinner" role="status" aria-label="Prefixed loading"></span>
          <span id="semantic-tooltip" class="ui-tooltip">Semantic tooltip</span>
          <span id="prefixed-tooltip" class="${preset.prefix}-tooltip">Prefixed tooltip</span>
        </main>
      </body>
    </html>`;
}

async function computedSnapshot(page, selector, properties) {
  return page.locator(selector).evaluate((element, propertyNames) => {
    const styles = getComputedStyle(element);
    return Object.fromEntries(propertyNames.map((property) => [property, styles[property]]));
  }, properties);
}

function semanticSafetyFixture(preset) {
  const pairs = semanticSafetyContracts.map(([suffix, element]) => {
    const attributes = suffix === 'nav-link' ? ' href="#"' : '';
    return `
      <${element} id="semantic-safety-${suffix}" class="ui-${suffix}"${attributes}>Semantic ${suffix}</${element}>
      <${element} id="prefixed-safety-${suffix}" class="${preset.prefix}-${suffix}"${attributes}>Prefixed ${suffix}</${element}>`;
  }).join('');

  return `<!doctype html>
    <html lang="en">
      <body data-ui="${preset.id}" data-theme="arctic-indigo" data-mode="light">
        <main>${pairs}</main>
      </body>
    </html>`;
}

test('semantic aliases preserve every shared safety property across all presets', async ({ page }) => {
  for (const preset of manifest.presets) {
    await page.setContent(semanticSafetyFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });

    for (const [suffix, , properties] of semanticSafetyContracts) {
      expect(
        await computedSnapshot(page, `#semantic-safety-${suffix}`, properties),
        `${preset.id} ${suffix} shared safety declarations`
      ).toEqual(await computedSnapshot(page, `#prefixed-safety-${suffix}`, properties));
    }
  }
});

test('semantic buttons and cards match prefixed twins across every preset', async ({ page }) => {
  for (const preset of manifest.presets) {
    await page.setContent(groupOneFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });

    for (const variant of buttonVariants) {
      const kind = variant ?? 'neutral';
      const semantic = await computedSnapshot(page, `#semantic-${kind}`, buttonProperties);
      const prefixed = await computedSnapshot(page, `#prefixed-${kind}`, buttonProperties);
      expect(semantic, `${preset.id} ${kind} button`).toEqual(prefixed);
    }

    expect(
      await computedSnapshot(page, '#semantic-disabled', buttonProperties),
      `${preset.id} disabled button`
    ).toEqual(await computedSnapshot(page, '#prefixed-disabled', buttonProperties));
    expect(
      await computedSnapshot(page, '#semantic-icon', buttonProperties),
      `${preset.id} icon button`
    ).toEqual(await computedSnapshot(page, '#prefixed-icon', buttonProperties));
    expect(
      await computedSnapshot(page, '#semantic-card', cardProperties),
      `${preset.id} card`
    ).toEqual(await computedSnapshot(page, '#prefixed-card', cardProperties));

    await expect(page.locator('#semantic-neutral')).toHaveRole('button');
    await expect(page.locator('#semantic-disabled')).toBeDisabled();
    const neutralOpacity = Number.parseFloat((await computedSnapshot(
      page,
      '#semantic-neutral',
      ['opacity']
    )).opacity);
    const disabledOpacity = Number.parseFloat((await computedSnapshot(
      page,
      '#semantic-disabled',
      ['opacity']
    )).opacity);
    expect(disabledOpacity, `${preset.id} disabled opacity`).toBeLessThan(neutralOpacity);
  }
});

test('changing only data-ui restyles stable semantic button and card nodes', async ({ page }) => {
  await page.setContent(groupOneFixture(manifest.presets[0]));
  await page.addStyleTag({ path: visualBundlePath });

  const initialIdentity = await page.evaluate(() => {
    const button = document.querySelector('#semantic-primary');
    const card = document.querySelector('#semantic-card');
    button.dataset.identity = 'stable-button';
    card.dataset.identity = 'stable-card';
    return { buttonClass: button.className, cardClass: card.className };
  });
  const fingerprints = [];

  for (const preset of manifest.presets) {
    await page.evaluate(({ id, prefix }) => {
      document.body.dataset.ui = id;
      document.querySelector('#prefixed-primary').className = `${prefix}-button ${prefix}-button-primary`;
      document.querySelector('#prefixed-card').className = `${prefix}-card`;
    }, preset);

    const semanticButton = await computedSnapshot(page, '#semantic-primary', buttonProperties);
    const prefixedButton = await computedSnapshot(page, '#prefixed-primary', buttonProperties);
    const semanticCard = await computedSnapshot(page, '#semantic-card', cardProperties);
    const prefixedCard = await computedSnapshot(page, '#prefixed-card', cardProperties);
    expect(semanticButton, `${preset.id} stable primary button`).toEqual(prefixedButton);
    expect(semanticCard, `${preset.id} stable card`).toEqual(prefixedCard);
    fingerprints.push(JSON.stringify({ semanticButton, semanticCard }));

    const identity = await page.evaluate(() => ({
      buttonClass: document.querySelector('[data-identity="stable-button"]').className,
      cardClass: document.querySelector('[data-identity="stable-card"]').className
    }));
    expect(identity).toEqual(initialIdentity);
  }

  expect(new Set(fingerprints).size, 'preset switching must visibly restyle semantic nodes').toBeGreaterThan(1);
});

test('semantic buttons retain keyboard focus and forced-colors behavior', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the forced-colors emulation used by this contract.');

  for (const preset of manifest.presets) {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.setContent(groupOneFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });
    await page.locator('body').press('Tab');
    await expect(page.locator('#semantic-neutral')).toBeFocused();

    const focusStyles = await computedSnapshot(page, '#semantic-neutral', [
      'boxShadow',
      'forcedColorAdjust',
      'outlineColor',
      'outlineStyle',
      'outlineWidth'
    ]);
    expect(focusStyles.forcedColorAdjust, `${preset.id} forced-color adjustment`).toBe('auto');
    expect(focusStyles.outlineStyle, `${preset.id} focus outline`).not.toBe('none');
    expect(Number.parseFloat(focusStyles.outlineWidth), `${preset.id} focus width`).toBeGreaterThanOrEqual(2);

    // Axe evaluates authored colors accurately after leaving the emulated system-color palette.
    await page.emulateMedia({ forcedColors: 'none' });
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // The repository contrast gate owns preset palette ratios; this scan targets native semantics.
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations, `${preset.id} semantic group one axe scan`).toEqual([]);
  }
});

test('semantic form controls match proven prefixed structures across every preset', async ({ page }) => {
  const pairs = [
    ['field', fieldProperties],
    ['label', fieldProperties],
    ['help', fieldProperties],
    ['input', controlProperties],
    ['select', controlProperties],
    ['textarea', controlProperties],
    ['disabled-input', controlProperties],
    ['check', fieldProperties],
    ['check-control', indicatorProperties],
    ['radio-label', fieldProperties],
    ['radio-control', indicatorProperties],
    ['switch', fieldProperties],
    ['switch-track', indicatorProperties],
    ['switch-thumb', indicatorProperties]
  ];

  for (const preset of manifest.presets) {
    await page.setContent(formFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });

    for (const [name, properties] of pairs) {
      const semantic = await computedSnapshot(page, `#semantic-${name}`, properties);
      const prefixed = await computedSnapshot(page, `#prefixed-${name}`, properties);
      expect(semantic, `${preset.id} ${name}`).toEqual(prefixed);
    }

    await expect(page.getByLabel('Semantic name')).toHaveValue('Semantic input');
    await expect(page.getByLabel('Semantic checkbox')).toBeChecked();
    await expect(page.getByLabel('Semantic radio')).toBeChecked();
    await expect(page.getByLabel('Semantic switch')).toBeChecked();
    await expect(page.locator('#semantic-disabled-input')).toBeDisabled();
  }
});

test('form state and classes remain stable through all preset switches', async ({ page }) => {
  await page.setContent(formFixture(manifest.presets[0]));
  await page.addStyleTag({ path: visualBundlePath });
  const semanticClassSnapshot = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('[class^="ui-"]')].map((element) => [element.id, element.className])
  ));

  for (const preset of manifest.presets) {
    await page.evaluate(({ id, prefix }) => {
      document.body.dataset.ui = id;
      const suffixById = {
        'prefixed-field': 'field',
        'prefixed-label': 'label',
        'prefixed-help': 'help-text',
        'prefixed-input': 'input',
        'prefixed-select': 'select',
        'prefixed-textarea': 'textarea',
        'prefixed-disabled-input': 'input',
        'prefixed-check': 'check',
        'prefixed-check-control': 'check-control',
        'prefixed-radio-label': 'radio',
        'prefixed-radio-control': 'radio-control',
        'prefixed-switch': 'switch',
        'prefixed-switch-track': 'switch-track',
        'prefixed-switch-thumb': 'switch-thumb'
      };
      for (const [elementId, suffix] of Object.entries(suffixById)) {
        document.getElementById(elementId).className = `${prefix}-${suffix}`;
      }
    }, preset);

    expect(
      await computedSnapshot(page, '#semantic-input', controlProperties),
      `${preset.id} stable input`
    ).toEqual(await computedSnapshot(page, '#prefixed-input', controlProperties));
    expect(
      await computedSnapshot(page, '#semantic-check-control', indicatorProperties),
      `${preset.id} stable checked checkbox`
    ).toEqual(await computedSnapshot(page, '#prefixed-check-control', indicatorProperties));
    expect(
      await computedSnapshot(page, '#semantic-switch-thumb', indicatorProperties),
      `${preset.id} stable checked switch`
    ).toEqual(await computedSnapshot(page, '#prefixed-switch-thumb', indicatorProperties));
    expect(await page.evaluate(() => Object.fromEntries(
      [...document.querySelectorAll('[class^="ui-"]')].map((element) => [element.id, element.className])
    ))).toEqual(semanticClassSnapshot);
  }
});

test('semantic forms retain focus, disabled, checked, axe, and forced-colors behavior', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the forced-colors emulation used by this contract.');

  for (const preset of manifest.presets) {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.setContent(formFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });
    await page.locator('#semantic-input').focus();

    const focusStyles = await computedSnapshot(page, '#semantic-input', [
      'boxShadow',
      'forcedColorAdjust',
      'outlineStyle',
      'outlineWidth'
    ]);
    expect(focusStyles.forcedColorAdjust, `${preset.id} form forced colors`).toBe('auto');
    expect(focusStyles.outlineStyle, `${preset.id} form focus`).not.toBe('none');
    expect(Number.parseFloat(focusStyles.outlineWidth), `${preset.id} form focus width`).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#semantic-disabled-input')).toBeDisabled();
    await expect(page.locator('#semantic-checkbox')).toBeChecked();
    await expect(page.locator('#semantic-radio')).toBeChecked();
    await expect(page.locator('#semantic-switch-input')).toBeChecked();

    await page.emulateMedia({ forcedColors: 'none' });
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // Dedicated contrast verification owns palette ratios; this fixture checks native semantics.
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations, `${preset.id} semantic form axe scan`).toEqual([]);
  }
});

test('remaining semantic roles and variants match prefixed twins across every preset', async ({ page }) => {
  const badgeVariants = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger'];
  const alertVariants = ['neutral', 'success', 'warning', 'danger'];
  const pairs = [
    ['nav', surfaceProperties],
    ['nav-link', surfaceProperties],
    ['table-wrap', surfaceProperties],
    ['table', surfaceProperties],
    ['cell', surfaceProperties],
    ['progress', surfaceProperties],
    ['progress-bar', surfaceProperties],
    ['toolbar', surfaceProperties],
    ['spinner', surfaceProperties],
    ['tooltip', surfaceProperties]
  ];

  for (const preset of manifest.presets) {
    await page.setContent(remainingRolesFixture(preset));
    await page.addStyleTag({ path: visualBundlePath });

    for (const variant of badgeVariants) {
      expect(
        await computedSnapshot(page, `#semantic-badge-${variant}`, surfaceProperties),
        `${preset.id} ${variant} badge`
      ).toEqual(await computedSnapshot(page, `#prefixed-badge-${variant}`, surfaceProperties));
    }
    for (const variant of alertVariants) {
      for (const part of ['alert', 'alert-title', 'alert-body']) {
        expect(
          await computedSnapshot(page, `#semantic-${part}-${variant}`, surfaceProperties),
          `${preset.id} ${variant} ${part}`
        ).toEqual(await computedSnapshot(page, `#prefixed-${part}-${variant}`, surfaceProperties));
      }
    }
    for (const [name, properties] of pairs) {
      expect(
        await computedSnapshot(page, `#semantic-${name}`, properties),
        `${preset.id} ${name}`
      ).toEqual(await computedSnapshot(page, `#prefixed-${name}`, properties));
    }

    await expect(page.locator('#semantic-progress')).toHaveRole('progressbar');
    await expect(page.locator('#semantic-toolbar')).toHaveRole('toolbar');
    await expect(page.locator('#semantic-nav-link')).toHaveAttribute('aria-current', 'page');
  }
});

test('remaining semantic nodes and classes stay stable through all preset switches', async ({ page }) => {
  await page.setContent(remainingRolesFixture(manifest.presets[0]));
  await page.addStyleTag({ path: visualBundlePath });
  const semanticClassSnapshot = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('[class^="ui-"]')].map((element) => [element.id, element.className])
  ));
  const fingerprints = [];

  for (const preset of manifest.presets) {
    await page.evaluate(({ id, prefix }) => {
      document.body.dataset.ui = id;
      for (const element of document.querySelectorAll('[id^="prefixed-"]')) {
        const semanticId = element.id.replace('prefixed-', 'semantic-');
        const semantic = document.getElementById(semanticId);
        if (!semantic?.className.startsWith('ui-')) continue;

        const semanticBase = semantic.className.split(' ')[0].slice(3);
        const variant = semantic.dataset.uiVariant;
        element.className = `${prefix}-${semanticBase}${variant ? ` ${prefix}-${semanticBase}-${variant}` : ''}`;
        if (semantic.classList.contains('is-active')) element.classList.add('is-active');
      }
    }, preset);

    const semanticAlert = await computedSnapshot(page, '#semantic-alert-warning', surfaceProperties);
    const prefixedAlert = await computedSnapshot(page, '#prefixed-alert-warning', surfaceProperties);
    const semanticProgress = await computedSnapshot(page, '#semantic-progress-bar', surfaceProperties);
    const prefixedProgress = await computedSnapshot(page, '#prefixed-progress-bar', surfaceProperties);
    expect(semanticAlert, `${preset.id} stable warning alert`).toEqual(prefixedAlert);
    expect(semanticProgress, `${preset.id} stable progress bar`).toEqual(prefixedProgress);
    fingerprints.push(JSON.stringify({ semanticAlert, semanticProgress }));
    expect(await page.evaluate(() => Object.fromEntries(
      [...document.querySelectorAll('[class^="ui-"]')].map((element) => [element.id, element.className])
    ))).toEqual(semanticClassSnapshot);
  }

  expect(new Set(fingerprints).size, 'remaining semantic roles must restyle by preset').toBeGreaterThan(1);
});

test('remaining roles retain focus, reduced-motion, forced-colors, and axe semantics', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the media emulation used by this contract.');

  for (const preset of manifest.presets) {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.setContent(remainingRolesFixture(preset, { disableMotion: false }));
    await page.addStyleTag({ path: visualBundlePath });
    await page.locator('#semantic-nav-link').focus();

    const focusStyles = await computedSnapshot(page, '#semantic-nav-link', [
      'animationDuration',
      'forcedColorAdjust',
      'outlineStyle',
      'outlineWidth',
      'transitionDuration'
    ]);
    expect(focusStyles.forcedColorAdjust, `${preset.id} remaining forced colors`).toBe('auto');
    expect(focusStyles.outlineStyle, `${preset.id} nav focus`).not.toBe('none');
    expect(Number.parseFloat(focusStyles.outlineWidth), `${preset.id} nav focus width`).toBeGreaterThanOrEqual(2);
    expect(Number.parseFloat(focusStyles.transitionDuration), `${preset.id} reduced transition`).toBeLessThanOrEqual(0.001);
    expect(Number.parseFloat(focusStyles.animationDuration), `${preset.id} reduced animation`).toBeLessThanOrEqual(0.001);

    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      // Dedicated contrast verification owns palette ratios; this fixture checks semantics.
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations, `${preset.id} remaining semantic axe scan`).toEqual([]);
  }
});
