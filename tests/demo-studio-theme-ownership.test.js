import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
import { renderExample } from '../demo/studio/examples.js';

/** Demo styles may compose layout tokens and frame state, but never repaint the showcased UI. */
test('demo CSS leaves component paint and typography entirely to UI Style Kit', () => {
  const forbidden =
    /^(?:color|background(?:-.+)?|font(?:-.+)?|line-height|letter-spacing|text-transform|text-decoration(?:-.+)?|border(?:-.+)?|box-shadow|outline(?:-.+)?|accent-color)$/;
  const violations = [];
  for (const file of ['demo/demo.css', 'demo/studio.css']) {
    postcss.parse(fs.readFileSync(file, 'utf8'), { from: file }).walkDecls((declaration) => {
      if (forbidden.test(declaration.prop))
        violations.push(
          file +
            ':' +
            declaration.source.start.line +
            ' ' +
            declaration.parent.selector +
            ' ' +
            declaration.prop,
        );
      assert.ok(
        !declaration.prop.startsWith('--') || declaration.prop.startsWith('--ly-'),
        'Only public layout tokens belong in demo CSS: ' + declaration.prop,
      );
    });
  }
  assert.deepEqual(violations, []);
  assert.doesNotMatch(
    fs.readFileSync('demo/studio/frame.js', 'utf8'),
    /style\.(?:colorScheme|color|background)\s*=/,
    'Preset attributes alone own native control paint',
  );
});

/** Working examples intentionally demonstrate meaningful filled palette roles with public classes. */
test('dashboard exposes primary secondary and accent color roles through library components', () => {
  const markup = renderExample('dashboard');
  for (const variant of ['primary', 'secondary', 'accent'])
    assert.match(markup, new RegExp('data-ui-variant="' + variant + '"'));
  assert.match(markup, /usk-metric/);
  assert.match(markup, /ly-(?:grid|switcher|stack)/);
});
/** Direct CSS consumers must load the public composition entrypoint instead of rebuilding it locally. */
test('studio loads canonical component composition alongside the visual library', () => {
  const shell = fs.readFileSync('demo/studio/shell.html', 'utf8');
  const build = fs.readFileSync('scripts/build-studio.mjs', 'utf8');
  assert.match(shell, /styles\/component-composition\.css/);
  assert.match(build, /styles\/component-composition\.css/);
});
/** Native sample flow belongs to Layout; JavaScript must not measure and assign grid spans. */
test('Bento native samples use intrinsic Layout without imperative row measurement', () => {
  assert.doesNotMatch(
    fs.readFileSync('demo/studio/authored/bento.js', 'utf8'),
    /gridRowEnd|gridAutoRows|ResizeObserver/,
  );
  assert.match(
    fs.readFileSync('demo/studio/reference.js', 'utf8'),
    /class="[^"]*demo-native-grid[^\"]*ly-grid/,
  );
});
/** Canonical choice labels include the visual subparts required by the library contract. */
test('canonical choices include library-owned checkbox radio and switch controls', async () => {
  const { renderComponent } = await import('../demo/studio/examples.js');
  assert.match(renderExample('form'), /usk-check-control/);
  const choices = renderComponent('choices');
  for (const name of [
    'usk-check-control',
    'usk-radio-control',
    'usk-switch-track',
    'usk-switch-thumb',
  ])
    assert.ok(choices.includes(name), name);
});
