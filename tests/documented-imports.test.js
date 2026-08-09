import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertPackageImportsResolve,
  extractPackageImports,
} from "../scripts/documented-imports.mjs";

test("extracts maintained ecosystem specifiers from imports, inline code, tables, and plain package paths", () => {
  const markdown = `
Current inline entry: \`ui-style-kit-css/removed.css\`.

| Package entry |
| --- |
| layout-style-css/recipes.css |

The focused state entry is interactive-surface-css/state-core.css.

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
    "ui-style-kit-css/removed.css",
    "layout-style-css/recipes.css",
    "interactive-surface-css/state-core.css",
    "ui-style-kit-css/visual.css",
    "layout-style-css",
    "interactive-surface-css",
    "ui-style-kit-css/interactive-surface-theme.css",
  ]);
});

test("ignores historical URLs, version mentions, and non-ecosystem imports", () => {
  const markdown = `
Historical registry URL: https://cdn.example/ui-style-kit-css/with-bridge.css.
Version record: ui-style-kit-css@1.0.0.

\`\`\`js
import "react";
import "./local.css";
\`\`\`
`;

  assert.deepEqual(extractPackageImports(markdown), []);
});

test("rejects a removed inline or plain export against the installed candidate tarball", () => {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "documented-import-contract-"),
  );
  const packageRoot = path.join(
    fixtureRoot,
    "node_modules",
    "ui-style-kit-css",
  );
  fs.mkdirSync(path.join(packageRoot, "dist"), { recursive: true });
  fs.writeFileSync(
    path.join(fixtureRoot, "package.json"),
    '{"name":"docs-consumer","private":true}\n',
  );
  fs.writeFileSync(
    path.join(packageRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "ui-style-kit-css",
        version: "2.1.0",
        exports: {
          ".": "./dist/index.css",
          "./package.json": "./package.json",
        },
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(packageRoot, "dist", "index.css"),
    ".candidate { display: block; }\n",
  );

  try {
    const resolver = createRequire(path.join(fixtureRoot, "package.json"));
    assert.throws(
      () =>
        assertPackageImportsResolve(
          "Use \`ui-style-kit-css/removed.css\` or ui-style-kit-css/removed.css.",
          resolver,
          "maintained-current.md",
        ),
      /maintained-current\.md: ui-style-kit-css\/removed\.css did not resolve/,
    );
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
