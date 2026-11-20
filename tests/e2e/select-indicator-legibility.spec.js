import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const css = readFileSync('dist/ui-style-kit.visual.css', 'utf8');

/** Exercise actual native controls in every public namespace with one preset per document. */
test('every preset select renders exactly one dropdown indicator with legible shared geometry', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addStyleTag({ content: css });
  for (const { id, prefix } of manifest.presets) {
    await page.evaluate(
      ({ id, prefix }) => {
        document.body.dataset.ui = id;
        document.body.innerHTML =
          ['', 'usk-select', 'ui-select', prefix + '-select']
            .map(
              (name, index) =>
                '<label>Choice ' +
                index +
                '<select id="choice-' +
                index +
                '" class="' +
                name +
                '"><option value="a">First</option><option value="b">Second</option></select></label>',
            )
            .join('') +
          '<select multiple size="3" class="' +
          prefix +
          '-select"><option>First</option><option>Second</option></select><select size="3" class="usk-select"><option>First</option><option>Second</option></select>';
      },
      { id, prefix },
    );
    for (const mode of manifest.modes) {
      await page.locator('body').evaluate((body, mode) => {
        body.dataset.mode = mode;
      }, mode);
      const controls = await page.locator('select').evaluateAll((nodes) =>
        nodes.map((node) => {
          const s = getComputedStyle(node);
          return {
            image: s.backgroundImage,
            size: s.backgroundSize,
            appearance: s.appearance,
            padding: parseFloat(s.paddingInlineEnd),
          };
        }),
      );
      for (const [index, actual] of controls.slice(0, 4).entries()) {
        const context = id + '/' + mode + '/' + index;
        if (id === 'neo-noir') {
          expect(actual.appearance, context).toBe('auto');
          expect(actual.image, context).toBe('none');
        } else {
          expect(actual.appearance, context).toBe('none');
          expect((actual.image.match(/linear-gradient\(/g) ?? []).length, context).toBe(2);
          // Engines may retain unused material-layer sizes; only the two painted arrows own geometry.
          expect(
            actual.size
              .split(',')
              .slice(0, 2)
              .map((value) => value.trim())
              .join(', '),
            context,
          ).toBe('4.8px 4.8px, 4.8px 4.8px');
        }
        expect(actual.padding, context).toBeGreaterThanOrEqual(24);
      }
      for (const actual of controls.slice(4))
        expect(actual.image, id + '/' + mode + ' listbox has no arrow').toBe('none');
    }
    await page.locator('body').evaluate((body) => {
      body.dir = 'rtl';
    });
    if (id !== 'neo-noir') {
      await expect
        .poll(
          () =>
            page.locator('#choice-1').evaluate((node) =>
              getComputedStyle(node)
                .backgroundPosition.split(',')
                .slice(0, 2)
                .map((value) => value.trim())
                .join(', '),
            ),
          { message: id + ' settled RTL placement' },
        )
        .toBe('11.2px 50%, 16px 50%');
    }
    await page.locator('body').evaluate((body) => {
      body.dir = 'ltr';
    });
    await page.locator('#choice-1').focus();
    await page.locator('#choice-1').press('End');
    await expect(page.locator('#choice-1')).toHaveValue('b');
    await page.locator('#choice-1').press('Home');
    await expect(page.locator('#choice-1')).toHaveValue('a');
  }
});

/** Native chrome must remain visible when high-contrast mode removes custom gradients. */
test('every preset select renders exactly one dropdown indicator in forced colors', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.setContent(
    '<!doctype html><html><body data-mode="light"><label>Choice<select class="usk-select"><option>First</option><option>Second</option></select></label></body></html>',
  );
  await page.addStyleTag({ content: css });
  for (const { id } of manifest.presets) {
    await page.locator('body').evaluate((body, id) => {
      body.dataset.ui = id;
    }, id);
    await expect(page.getByRole('combobox', { name: 'Choice', exact: true })).toHaveCSS(
      'appearance',
      'auto',
    );
    await expect(page.getByRole('combobox', { name: 'Choice', exact: true })).toHaveCSS(
      'background-image',
      'none',
    );
  }
});
