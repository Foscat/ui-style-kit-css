import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/** Measure semantic breadcrumb geometry without applying product-owned CSS overrides. */
test('Semantic breadcrumb links retain accessible targets and own their list spacing', async ({
  page
}) => {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  await page.setContent(
    '<html data-ui="minimal-saas" data-mode="light"><body>' +
      ['usk', 'ui']
        .map(
          (namespace) =>
            `<nav class="${namespace}-breadcrumb" aria-label="${namespace} breadcrumb"><ol class="${namespace}-breadcrumb-list"><li class="${namespace}-breadcrumb-item"><a href="#destination" class="${namespace}-breadcrumb-link">Prairie Star Auto Salvage</a><span aria-hidden="true">/</span></li><li class="${namespace}-breadcrumb-item"><span class="${namespace}-breadcrumb-link" aria-current="page">Pull queue</span></li></ol></nav>`
        )
        .join('') +
      '<ol id="ordinary-list"><li>Ordinary prose retains native spacing</li></ol></body></html>'
  );
  await page.addStyleTag({ path: path.resolve('dist/ui-style-kit.visual.css') });
  await page.addStyleTag({ path: path.resolve('styles/component-composition.css') });
  const measurements = await page.evaluate(
    ({ presets }) => {
      const failures = [];
      let states = 0;
      for (const preset of presets) {
        document.documentElement.dataset.ui = preset.id;
        for (const nav of document.querySelectorAll('nav')) {
          const list = nav.querySelector('ol');
          const item = list.firstElementChild;
          const link = item.querySelector('a');
          const rect = link.getBoundingClientRect();
          const listStyle = getComputedStyle(list);
          const itemStyle = getComputedStyle(item);
          const actual = {
            height: rect.height,
            width: rect.width,
            margin: listStyle.margin,
            padding: listStyle.padding,
            itemMargin: itemStyle.margin
          };
          if (
            rect.height < 44 ||
            rect.width < 44 ||
            listStyle.margin !== '0px' ||
            listStyle.padding !== '0px' ||
            itemStyle.margin !== '0px'
          ) {
            failures.push({ preset: preset.id, namespace: nav.className, ...actual });
          }
          states += 1;
        }
      }
      return {
        failures,
        states,
        ordinaryMargin: getComputedStyle(document.querySelector('#ordinary-list')).marginBottom
      };
    },
    { presets: manifest.presets }
  );
  expect(measurements.states).toBe(manifest.presets.length * 2);
  expect(measurements.failures.slice(0, 6)).toEqual([]);
  expect(Number.parseFloat(measurements.ordinaryMargin)).toBeGreaterThan(0);
});

/** Forest Moss focus uses visible ink against each neutral surface in its light palette. */
test('Forest Moss light keyboard focus contrasts with neutral surfaces', async ({ page }) => {
  await page.setContent(
    '<html data-ui="minimal-saas" data-theme="forest-moss" data-mode="light"><body><a href="#destination" class="usk-breadcrumb-link">Prairie Star Auto Salvage</a></body></html>'
  );
  await page.addStyleTag({ path: path.resolve('dist/ui-style-kit.visual.css') });
  await page.addStyleTag({ path: path.resolve('styles/component-composition.css') });
  await page.keyboard.press('Tab');
  const focus = await page.locator('a').evaluate((element) => {
    const style = getComputedStyle(element);
    const root = getComputedStyle(document.documentElement);
    const rgb = (text) =>
      text
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const luminance = (channels) =>
      channels
        .map((value) => {
          const scaled = value / 255;
          return scaled <= 0.04045 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(rgb(style.outlineColor));
    return {
      focused: document.activeElement === element,
      width: Number.parseFloat(style.outlineWidth),
      ratios: ['bg', 'surface', 'surface-strong', 'surface-soft'].map((role) => {
        const background = luminance(rgb(root.getPropertyValue(`--usk-${role}-rgb`)));
        return {
          role,
          ratio:
            (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
        };
      })
    };
  });
  expect(focus.focused).toBe(true);
  expect(focus.width).toBeGreaterThanOrEqual(2);
  expect(focus.ratios.filter(({ ratio }) => ratio < 3)).toEqual([]);
});
