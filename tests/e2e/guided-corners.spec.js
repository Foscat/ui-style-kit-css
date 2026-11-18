import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'dist/ui-style-kit.visual.css'), 'utf8');

/** Prove rendered opt-in geometry, unchanged defaults, and untouched circular decoration. */
for (const mode of ['light', 'dark', 'contrast']) {
  test(`guided corners override every preset without changing defaults or circular decoration (${mode})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const read = () =>
      page
        .locator('[data-corner-probe]')
        .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).borderRadius));
    for (const { id } of manifest.presets) {
      // A fresh document has no transition inherited from the previous preset.
      await page.setContent(
        '<html data-ui="minimal-saas" data-mode="light" data-theme="forest-moss"><body><div class="ui-card" data-corner-probe>Card</div><div class="ui-alert" data-corner-probe>Alert</div><button class="ui-button" data-corner-probe>Button</button><input class="ui-input" data-corner-probe value="Fixture"><select class="ui-select" data-corner-probe><option>Choice</option></select><section class="bento-sheet"><details data-corner-probe><summary>More</summary></details><table data-corner-probe><tbody><tr><td>Cell</td></tr></tbody></table><article data-corner-probe>Article</article><aside data-corner-probe>Aside</aside></section><span class="ui-avatar">AB</span><button class="ui-avatar" data-button-avatar-probe>AB</button><button class="deco-button ui-avatar" data-deco-avatar-probe>AB</button></body></html>',
      );
      await page.evaluate(
        ({ preset, mode }) => {
          document.documentElement.dataset.ui = preset;
          document.documentElement.dataset.mode = mode;
          document.documentElement.style.fontSize = '16px';
        },
        { preset: id, mode },
      );
      await page.addStyleTag({ content: css });
      await page.evaluate((preset) => {
        document.documentElement.dataset.ui = preset;
        delete document.documentElement.dataset.uskCorners;
      }, id);
      // Complete the first paint before sampling reduced-motion entry transitions.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const original = await read();
      const avatar = await page
        .locator('span.ui-avatar')
        .evaluate((node) => getComputedStyle(node).borderRadius);
      const buttonAvatar = await page
        .locator('[data-button-avatar-probe]')
        .evaluate((node) => getComputedStyle(node).borderRadius);
      const decoAvatar = await page
        .locator('[data-deco-avatar-probe]')
        .evaluate((node) => getComputedStyle(node).borderRadius);
      if (id === 'art-deco') expect(decoAvatar).toBe('0px');
      for (const [corners, expected] of [
        ['none', '0px'],
        ['small', '4px'],
        ['medium', '10.4px'],
        ['large', '16px'],
      ]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.uskCorners = value;
        }, corners);
        await expect
          .poll(read, { message: `${id} must honor explicit ${corners} corners` })
          .toEqual(Array(9).fill(expected));
        expect(
          await page
            .locator('span.ui-avatar')
            .evaluate((node) => getComputedStyle(node).borderRadius),
          `${id} avatar stays independent`,
        ).toBe(avatar);
        expect(
          await page
            .locator('[data-button-avatar-probe]')
            .evaluate((node) => getComputedStyle(node).borderRadius),
          `${id} button avatar stays independent`,
        ).toBe(buttonAvatar);
        if (id === 'art-deco')
          expect(
            await page
              .locator('[data-deco-avatar-probe]')
              .evaluate((node) => getComputedStyle(node).borderRadius),
            'Art Deco keeps the authored radius on combined action/avatar classes',
          ).toBe(decoAvatar);
      }
      await page.evaluate(() => {
        delete document.documentElement.dataset.uskCorners;
      });
      await expect
        .poll(read, { message: `${id} omission restores the exact authored defaults` })
        .toEqual(original);
    }
  });
}
