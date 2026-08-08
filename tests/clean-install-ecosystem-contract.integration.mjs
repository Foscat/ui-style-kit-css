import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scenarios = [
  'ui-only',
  'interaction-only',
  'layout-only',
  'ui-interaction',
  'ui-layout',
  'interaction-layout',
  'all-three'
];

for (const scenario of scenarios) {
  test(`current packed consumer smoke: ${scenario}`, { timeout: 180_000 }, () => {
    // Running the real CLI proves each test crosses the npm-pack and clean-install boundary.
    const result = spawnSync(
      process.execPath,
      ['scripts/check-ecosystem-packs.mjs', '--matrix', 'current', '--scenario', scenario, '--skip-docs'],
      {
        cwd: rootDir,
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' }
      }
    );

    assert.equal(
      result.status,
      0,
      [`${scenario} clean consumer failed`, result.stdout, result.stderr].filter(Boolean).join('\n')
    );
    assert.match(result.stdout, new RegExp(`PASS browser ${scenario}`));
  });
}
