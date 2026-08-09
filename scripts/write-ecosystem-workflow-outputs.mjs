import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEcosystemCompatibility } from './ecosystem-manifest-schema.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = process.env.GITHUB_OUTPUT;
const contract = JSON.parse(fs.readFileSync(path.join(rootDir, 'ecosystem-compatibility.json'), 'utf8'));

validateEcosystemCompatibility(contract);
if (!outputPath) throw new Error('GITHUB_OUTPUT is required to write the ecosystem workflow contract.');

const companionNames = ['interactive-surface-css', 'layout-style-css'];
const outputs = {
  requires_companion_remote_push: 'true',
  remote_verification_order: [...companionNames, 'ui-style-kit-css'].join(','),
  layout_repository: contract.packageSources['layout-style-css'].repository,
  layout_revision: contract.packageSources['layout-style-css'].revision,
  interactive_repository: contract.packageSources['interactive-surface-css'].repository,
  interactive_revision: contract.packageSources['interactive-surface-css'].revision
};

// A UI pull request can only validate after these immutable companion commits are reachable on GitHub.
fs.appendFileSync(outputPath, `${Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join('\n')}\n`);
console.log(`Workflow contract requires remote companion commits before UI validation: ${companionNames.join(', ')}.`);
