import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'dist/ui-style-kit.visual.css'), 'utf8');
const probes =
  '<div class="ui-card" data-corner-probe>Card</div><div class="ui-alert" data-corner-probe>Alert</div><button class="ui-button" data-corner-probe>Button</button><input class="ui-input" data-corner-probe value="Fixture"><select class="ui-select" data-corner-probe><option>Choice</option></select><section class="bento-sheet"><details data-corner-probe><summary>More</summary></details><table data-corner-probe><tbody><tr><td>Cell</td></tr></tbody></table><article data-corner-probe>Article</article><aside data-corner-probe>Aside</aside></section><span class="ui-avatar" data-avatar-probe="span">AB</span><button class="ui-avatar" data-avatar-probe="button">AB</button><button class="deco-button ui-avatar" data-avatar-probe="deco">AB</button><button class="ui-button&#9;ui-avatar" data-avatar-probe="tab">Tab</button><button class="usk-button&#10;usk-avatar" data-avatar-probe="newline">Newline</button><button class="__PRESET__-button&#9;__PRESET__-avatar" data-avatar-probe="prefix">Prefix</button><aside class="__PRESET__-avatar" data-avatar-probe="aside">Aside avatar</aside>';

/** Prove rendered opt-in geometry, authored defaults and every avatar probe in one browser snapshot. */
for (const mode of ['light', 'dark', 'contrast']) {
  test(`guided corners override every preset without changing defaults or circular decoration (${mode})`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    // Install the full shipped bundle once. Fresh document roots isolate each preset without
    // parsing the same multi-preset stylesheet twenty times or reducing the tested surface.
    await page.addStyleTag({ content: css });
    const read = () =>
      page.evaluate(() => ({
        radii: [...document.querySelectorAll('[data-corner-probe]')].map(
          (node) => getComputedStyle(node).borderRadius,
        ),
        avatars: Object.fromEntries(
          [...document.querySelectorAll('[data-avatar-probe]')].map((node) => [
            node.dataset.avatarProbe,
            getComputedStyle(node).borderRadius,
          ]),
        ),
      }));
    for (const { id, prefix } of manifest.presets) {
      await test.step(id, async () => {
        await page.evaluate(
          ({ preset, mode, markup }) => {
            const previousRoot = document.documentElement;
            const root = document.createElement('html');
            root.dataset.ui = preset;
            root.dataset.mode = mode;
            root.dataset.theme = 'forest-moss';
            root.style.fontSize = '16px';
            // Retain the parsed stylesheet, but never reuse inherited native-control styles
            // from another preset. Each case starts from the same isolated root contract.
            root.append(document.head, document.createElement('body'));
            previousRoot.replaceWith(root);
            document.body.innerHTML = markup;
          },
          { preset: id, mode, markup: probes.replaceAll('__PRESET__', prefix) },
        );
        // Reduced motion still permits 1ms transitions, and WebKit can defer a native
        // select's used geometry until layout. Require a resting baseline across frames
        // instead of recording that transient zero-radius initialization as a default.
        await page.evaluate(async () => {
          await document.fonts.ready;
          const nodes = [...document.querySelectorAll('[data-corner-probe], [data-avatar-probe]')];
          let previous;
          let stableFrames = 0;
          for (let frame = 0; frame < 60; frame++) {
            await new Promise(requestAnimationFrame);
            const radii = nodes.map((node) => {
              node.getBoundingClientRect();
              return getComputedStyle(node).borderRadius;
            });
            const finite = document
              .getAnimations()
              .filter(
                (animation) =>
                  Number.isFinite(animation.effect.getComputedTiming().endTime) &&
                  animation.playState !== 'finished',
              );
            for (const animation of finite) animation.finish();
            const snapshot = JSON.stringify(radii);
            stableFrames = !finite.length && snapshot === previous ? stableFrames + 1 : 0;
            if (stableFrames === 3) return;
            previous = snapshot;
          }
          throw new Error('Authored geometry did not settle within sixty rendered frames');
        });
        const original = await read();
        if (id === 'art-deco') expect(original.avatars.deco).toBe('0px');
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
            .poll(read, {
              intervals: [16, 32, 64, 128],
              message: `${id} honors ${corners} and preserves every avatar token`,
            })
            .toEqual({ radii: Array(9).fill(expected), avatars: original.avatars });
        }
        await page.evaluate(() => {
          delete document.documentElement.dataset.uskCorners;
        });
        await expect
          .poll(read, {
            intervals: [16, 32, 64, 128],
            message: `${id} omission restores all authored geometry`,
          })
          .toEqual(original);
      });
    }
  });
}
