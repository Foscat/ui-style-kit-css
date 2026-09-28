import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

import { semanticComponentMarkup } from '../fixtures/semantic-component-cases.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
const visualCss = fs.readFileSync(path.join(rootDir, 'dist', 'ui-style-kit.visual.css'), 'utf8');

/**
 * Convert the compatibility fixture into the requested public class namespace.
 * @param {'ui' | 'usk'} namespace Semantic class namespace under audit.
 * @returns {string} Equivalent semantic component markup.
 */
function markupFor(namespace) {
  const markup = namespace === 'ui'
    ? semanticComponentMarkup.replaceAll('usk-', 'ui-')
    : semanticComponentMarkup;
  return namespace === 'usk'
    ? markup.replace('class="usk-switch-thumb"', 'class="usk-switch-thumb usk-flush"')
    : markup;
}

/**
 * Capture the geometry that previously allowed preset-specific suffix collisions.
 * @param {import('@playwright/test').Page} page Active browser page.
 * @param {'ui' | 'usk'} namespace Semantic class namespace under audit.
 * @returns {Promise<object>} Switch and workflow-stepper layout facts.
 */
async function geometry(page, namespace) {
  return page.evaluate((activeNamespace) => {
    const rect = (element) => {
      const bounds = element.getBoundingClientRect();
      return {
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      };
    };
    const select = (suffix) => document.querySelector(`.${activeNamespace}-${suffix}`);
    const track = select('switch-track');
    const thumb = select('switch-thumb');
    const trackStyle = getComputedStyle(track);
    const thumbStyle = getComputedStyle(thumb);
    const stepper = select('stepper');
    const step = select('step');
    const label = select('step-label');
    return {
      track: rect(track),
      thumb: rect(thumb),
      trackStyle: {
        position: trackStyle.position,
        boxSizing: trackStyle.boxSizing,
        padding: trackStyle.padding,
        borderWidth: trackStyle.borderWidth
      },
      thumbStyle: {
        display: thumbStyle.display,
        position: thumbStyle.position,
        left: thumbStyle.left,
        insetInlineStart: thumbStyle.insetInlineStart,
        margin: thumbStyle.margin,
        padding: thumbStyle.padding,
        translate: thumbStyle.translate,
        transform: thumbStyle.transform
      },
      trackMetrics: {
        offsetWidth: track.offsetWidth,
        clientWidth: track.clientWidth
      },
      thumbMetrics: {
        offsetLeft: thumb.offsetLeft,
        offsetWidth: thumb.offsetWidth,
        offsetParentIsTrack: thumb.offsetParent === track
      },
      stepper: rect(stepper),
      step: rect(step),
      label: rect(label),
      labelWritingMode: getComputedStyle(label).writingMode
    };
  }, namespace);
}

test('usk and ui semantic controls keep stable internal geometry across every preset', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });

  for (const namespace of ['usk', 'ui']) {
    await page.setContent(
      `<style>${visualCss}</style><style>*{transition:none!important;animation:none!important}</style><body data-mode="light">${markupFor(namespace)}</body>`
    );

    for (const { id } of manifest.presets) {
      await page.locator('body').evaluate((body, preset) => {
        body.dataset.ui = preset;
        body.removeAttribute('data-theme');
      }, id);
      const facts = await geometry(page, namespace);

      if (facts.thumbStyle.display !== 'none') {
        expect.soft(facts.thumb.left, `${id}/${namespace}: switch thumb left`).toBeGreaterThanOrEqual(facts.track.left - 0.5);
        expect.soft(
          facts.thumb.right,
          `${id}/${namespace}: switch thumb right ${JSON.stringify(facts)}`
        ).toBeLessThanOrEqual(facts.track.right + 0.5);
        expect.soft(facts.thumb.top, `${id}/${namespace}: switch thumb top`).toBeGreaterThanOrEqual(facts.track.top - 0.5);
        expect.soft(facts.thumb.bottom, `${id}/${namespace}: switch thumb bottom`).toBeLessThanOrEqual(facts.track.bottom + 0.5);
      }
      expect.soft(facts.step.width, `${id}/${namespace}: workflow step width`).toBeGreaterThanOrEqual(facts.stepper.width * 0.5);
      expect.soft(facts.label.width, `${id}/${namespace}: workflow label width`).toBeGreaterThanOrEqual(64);
      expect.soft(facts.labelWritingMode, `${id}/${namespace}: workflow label direction`).toBe('horizontal-tb');
    }
  }
});
