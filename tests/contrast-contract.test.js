import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('bridge paint validation rejects incomplete foreground and background pairs', async () => {
  const contrastModule = await import('../scripts/check-contrast.mjs');

  assert.equal(typeof contrastModule.validateBridgePaint, 'function');

  const incompleteBridge = `
    :where([data-ui][data-theme][data-mode]) .interactive-surface {
      background-color: var(--interactive-surface-bg);
      color: var(--interactive-surface-fg);
    }
    :where([data-ui][data-theme][data-mode]) .interactive-surface[data-surface-variant="primary"] {
      --interactive-surface-bg: rgb(var(--usk-primary-rgb));
    }
  `;
  const failures = contrastModule.validateBridgePaint(incompleteBridge, 'fixture');

  assert.ok(failures.some((failure) => failure.includes('primary foreground')));
});

test('canonical and deprecated bridges expose complete semantic paint pairs', async () => {
  const { validateBridgePaint } = await import('../scripts/check-contrast.mjs');

  for (const relativeFile of ['styles/interactive-surface-theme.css', 'styles/interactive-surface-bridge.css']) {
    const css = fs.readFileSync(path.join(rootDir, relativeFile), 'utf8');
    assert.deepEqual(validateBridgePaint(css, relativeFile), []);
  }
});

test('deprecated bridge swaps foreground and background paint atomically', () => {
  const bridgeCss = fs.readFileSync(path.join(rootDir, 'styles/interactive-surface-bridge.css'), 'utf8');
  const transition = bridgeCss.match(/transition:\s*([\s\S]*?);/)?.[1] ?? '';

  assert.doesNotMatch(transition, /^\s*(?:background-color|color)\b/m);
});

test('fallback contrast validation rejects an unreadable preset palette', async () => {
  const { validateFallbackContrast } = await import('../scripts/check-contrast.mjs');
  const roles = [
    'bg', 'surface', 'surface-strong', 'surface-soft', 'text', 'text-muted', 'border',
    'primary', 'primary-hover', 'primary-text', 'secondary', 'secondary-hover',
    'secondary-text', 'accent', 'accent-text', 'success', 'success-text', 'warning',
    'warning-text', 'danger', 'danger-text', 'link', 'focus'
  ];
  const unreadable = Object.fromEntries(roles.map((role) => [role, '120 120 120']));
  const css = `[data-ui="fixture"][data-mode="light"] {\n${roles
    .map((role) => `  --fixture-fallback-${role}-rgb: ${unreadable[role]};`)
    .join('\n')}\n}`;

  assert.equal(typeof validateFallbackContrast, 'function');
  const failures = validateFallbackContrast(
    new Map([['fixture', css]]),
    [{ id: 'fixture', prefix: 'fixture' }],
    ['light']
  );

  assert.ok(failures.some((failure) => failure.includes('text on background')));
});
