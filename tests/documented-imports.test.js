import assert from 'node:assert/strict';
import test from 'node:test';

import { extractPackageImports } from '../scripts/documented-imports.mjs';

test('extracts ecosystem package specifiers from maintained documentation code blocks', () => {
  const markdown = `
Current prose can name \`layout-style-css/legacy.css\` without making it setup guidance.

\`\`\`js
import "ui-style-kit-css/visual.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
import surface from "interactive-surface-css";
\`\`\`

\`\`\`css
@import "ui-style-kit-css/interactive-surface-theme.css";
\`\`\`
`;

  assert.deepEqual(extractPackageImports(markdown), [
    'ui-style-kit-css/visual.css',
    'interactive-surface-css/state-core.css',
    'layout-style-css',
    'interactive-surface-css',
    'ui-style-kit-css/interactive-surface-theme.css'
  ]);
});

test('ignores non-code prose and non-ecosystem imports', () => {
  const markdown = `
Historical prose: ui-style-kit-css/with-bridge.css.

\`\`\`js
import "react";
import "./local.css";
\`\`\`
`;

  assert.deepEqual(extractPackageImports(markdown), []);
});
