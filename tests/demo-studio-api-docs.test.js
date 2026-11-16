import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** Generated helper documentation must describe actual inputs and selected-variant readiness. */
test('studio generated docs describe the actual surface and icon contracts', () => {
  const reference = readFileSync('docs/api/studio-reference.md', 'utf8');
  assert.match(reference, /getSurfaceVariant\(element\)/);
  assert.doesNotMatch(
    reference,
    /getSurfaceVariant\(ui\)|complete reference board, only for Technical Blueprint/,
  );
  const icons = readFileSync('docs/api/studio-icons.md', 'utf8');
  assert.match(icons, /prepareIcons\(\[pack\], \[variant\]\)/);
  assert.match(icons, /selected variant is registered/);
  assert.doesNotMatch(icons, /both variants are registered/);
});
