# Library-wide Theme Fallback and Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 20 presets use design-reference fallback colors only when no color theme is selected while preserving theme ownership, accessibility, and reference-specific light, dark, and contrast identities.

**Architecture:** Each preset publishes mode-specific fallback RGB channels and resolves its public color roles with `var(--usk-*-rgb, var(--<prefix>-fallback-*-rgb))`. Shared native, semantic, and overflow layers activate for `[data-ui][data-mode]`; explicit themes continue to define the `--usk-*` producer channels and therefore override every preset fallback without changing preset geometry or material recipes.

**Tech Stack:** CSS custom properties and cascade layers, Node.js test runner, css-tree, Stylelint, Lightning CSS, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-09-04-library-wide-theme-fallback-and-fidelity-design.md`

## Global Constraints

- Preserve all public preset IDs, prefixes, class names, entrypoints, manifest schema, and cascade layer order.
- Preserve unrelated dirty working-tree changes.
- `data-ui` and `data-mode` remain required; `data-theme` becomes optional.
- Explicit themes own every visible paint role; no-theme fallbacks match the retained design references.
- Run focused tests during implementation and the full verification chain only after all implementation tasks are complete.
- Write production JavaScript comments as professional JSDoc parseable by jsdoc2md.
- Update generated CSS only with `npm.cmd run build`.
- Do not deploy, publish, push, or rewrite the branch.

---

### Task 1: Lock the optional-theme semantic contract

**Files:**
- Create: `tests/theme-fallbacks.test.js`
- Modify: `tests/theme-colors.test.js`
- Modify: `scripts/check-contrast.mjs`

**Interfaces:**
- Consumes: `manifest.presets`, `manifest.modes`, and the existing 23-role semantic color list.
- Produces: static assertions for fallback resolution and exported `validateFallbackContrast(cssByPreset)` coverage used by the contrast CLI.

- [ ] **Step 1: Write the failing static contract test**

Create a manifest-driven test that requires every preset/mode to expose all 23 `--<prefix>-fallback-*-rgb` channels, requires each resolved public role to use the corresponding `--usk-*` channel with the preset fallback as the second argument, and requires themed direct aliases to remain present for build-time extraction.

```js
test('every preset resolves explicit themes before its mode fallback palette', () => {
  for (const { id, prefix } of manifest.presets) {
    const css = read(`styles/${id}.css`);
    for (const mode of manifest.modes) {
      const block = exactBlock(css, `[data-ui="${id}"][data-mode="${mode}"]`);
      for (const role of colorRoles) {
        assert.match(block, new RegExp(`--${prefix}-fallback-${role}-rgb:\\s*\\d+ \\d+ \\d+;`));
      }
    }
    const resolver = exactBlock(css, `[data-ui="${id}"][data-mode]`);
    for (const role of colorRoles) {
      assert.match(
        resolver,
        new RegExp(`--${prefix}-${role}-rgb:\\s*var\\(--usk-${role}-rgb,\\s*var\\(--${prefix}-fallback-${role}-rgb\\)\\);`)
      );
    }
  }
});
```

- [ ] **Step 2: Run only the new test and verify RED**

Run: `node --test tests/theme-fallbacks.test.js`

Expected: FAIL because most presets do not expose fallback role blocks or a fallback-aware resolver.

- [ ] **Step 3: Extend the contrast checker test seam**

Add a failing unit assertion in `tests/contrast-contract.test.js` for an exported fallback validator that rejects a no-theme palette whose text/background ratio is below the existing threshold.

- [ ] **Step 4: Run the single contrast contract test and verify RED**

Run: `node --test tests/contrast-contract.test.js`

Expected: FAIL because `validateFallbackContrast` is not exported.

- [ ] **Step 5: Implement the minimal fallback contrast validator**

Reuse the existing RGB parser and contrast functions. Validate the same text/surface, action/foreground, status/foreground, border, and control-edge pairs for the 60 preset/mode fallback states. Document the exported function with JSDoc.

- [ ] **Step 6: Run the contrast contract test and verify GREEN**

Run: `node --test tests/contrast-contract.test.js`

Expected: PASS.

### Task 2: Make shared accessibility layers independent of `data-theme`

**Files:**
- Modify: `styles/native-elements.css`
- Modify: `styles/components.css`
- Modify: `styles/content-overflow.css`
- Modify: `tests/native-elements-contract.test.js`
- Modify: `tests/semantic-component-contract.test.js`

**Interfaces:**
- Consumes: resolved `--usk-native-*` and preset-prefixed roles from Task 1.
- Produces: shared native and semantic behavior under `[data-ui][data-mode]` for themed and no-theme roots.

- [ ] **Step 1: Write the failing shared-selector test**

Require native foundations, focus-visible rules, reduced-motion rules, contrast reinforcement, forced-colors rules, component containment, and overflow guards to activate through `[data-ui][data-mode]` without a `data-theme` dependency.

- [ ] **Step 2: Run the native contract test and verify RED**

Run: `node --test tests/native-elements-contract.test.js`

Expected: FAIL on the current `[data-ui][data-theme][data-mode]` selectors.

- [ ] **Step 3: Broaden only shared activation selectors**

Replace theme-required shared roots with `[data-ui][data-mode]`. Keep theme producer selectors in `styles/theme-colors.css` unchanged so no fallback leaks into explicit schemes.

- [ ] **Step 4: Run the native contract test and verify GREEN**

Run: `node --test tests/native-elements-contract.test.js`

Expected: PASS.

- [ ] **Step 5: Run the semantic component contract test once**

Run: `node --test tests/semantic-component-contract.test.js`

Expected: PASS after selector fingerprints are regenerated at the final build; if the only failure is the known generated artifact fingerprint, defer that fingerprint update to Task 6.

### Task 3: Add reference-derived fallbacks and resolvers to the first ten presets

**Files:**
- Modify: `styles/minimal-saas.css`
- Modify: `styles/bento.css`
- Modify: `styles/maximalist.css`
- Modify: `styles/bauhaus.css`
- Modify: `styles/tactile.css`
- Modify: `styles/neumorphism.css`
- Modify: `styles/retrofuturism.css`
- Modify: `styles/brutalism.css`
- Modify: `styles/cyberpunk.css`
- Modify: `styles/y2k.css`

**Interfaces:**
- Consumes: the Task 1 resolver contract and the retained template references.
- Produces: complete light/dark/contrast fallback palettes and theme-derived material paint for presets 1–10.

- [ ] **Step 1: Add one failing preset assertion at a time**

For each preset, add its three fallback blocks to the shared test fixture expectations before editing production CSS. Each role must use explicit RGB integers and include paired foreground roles.

- [ ] **Step 2: Run only that preset's test case and verify RED**

Run these exact commands in order, stopping at the first failure:

```powershell
node --test --test-name-pattern="minimal-saas" tests/theme-fallbacks.test.js
node --test --test-name-pattern="bento" tests/theme-fallbacks.test.js
node --test --test-name-pattern="maximalist" tests/theme-fallbacks.test.js
node --test --test-name-pattern="bauhaus" tests/theme-fallbacks.test.js
node --test --test-name-pattern="tactile" tests/theme-fallbacks.test.js
node --test --test-name-pattern="neumorphism" tests/theme-fallbacks.test.js
node --test --test-name-pattern="retrofuturism" tests/theme-fallbacks.test.js
node --test --test-name-pattern="brutalism" tests/theme-fallbacks.test.js
node --test --test-name-pattern="cyberpunk" tests/theme-fallbacks.test.js
node --test --test-name-pattern="y2k" tests/theme-fallbacks.test.js
```

Expected: FAIL because the selected preset is missing the new contract.

- [ ] **Step 3: Implement that preset's fallback and resolver**

Add mode-specific fallback channels, move runtime aliases/native mappings to `[data-ui="<preset>"][data-mode]`, retain a small direct themed alias seam, and derive material paint from resolved prefixed roles.

- [ ] **Step 4: Run only that preset's test case and verify GREEN**

Rerun only the exact preset command from Step 2.

Expected: PASS.

- [ ] **Step 5: Repeat Steps 1–4 sequentially for all ten listed presets**

Do not rerun a green preset case unless a later shared resolver refactor can affect it.

### Task 4: Add reference-derived fallbacks and resolvers to the remaining ten presets

**Files:**
- Modify: `styles/retro-glass.css`
- Modify: `styles/editorial-luxe.css`
- Modify: `styles/organic-modern.css`
- Modify: `styles/industrial-utility.css`
- Modify: `styles/technical-blueprint.css`
- Modify: `styles/art-deco.css`
- Modify: `styles/clay.css`
- Modify: `styles/data-terminal.css`
- Modify: `styles/paper-editorial.css`
- Modify: `styles/neo-noir.css`

**Interfaces:**
- Consumes: the Task 1 resolver contract and the retained paired or combined template references.
- Produces: complete light/dark/contrast fallback palettes and theme-derived material paint for presets 11–20.

- [ ] **Step 1: Add one failing preset assertion at a time**

Use the same executable contract as Task 3. Preserve existing in-progress fidelity work in these dirty files and add only the missing fallback/theme boundary.

- [ ] **Step 2: Run only that preset's test case and verify RED**

Run these exact commands in order, stopping at the first failure:

```powershell
node --test --test-name-pattern="retro-glass" tests/theme-fallbacks.test.js
node --test --test-name-pattern="editorial-luxe" tests/theme-fallbacks.test.js
node --test --test-name-pattern="organic-modern" tests/theme-fallbacks.test.js
node --test --test-name-pattern="industrial-utility" tests/theme-fallbacks.test.js
node --test --test-name-pattern="technical-blueprint" tests/theme-fallbacks.test.js
node --test --test-name-pattern="art-deco" tests/theme-fallbacks.test.js
node --test --test-name-pattern="clay" tests/theme-fallbacks.test.js
node --test --test-name-pattern="data-terminal" tests/theme-fallbacks.test.js
node --test --test-name-pattern="paper-editorial" tests/theme-fallbacks.test.js
node --test --test-name-pattern="neo-noir" tests/theme-fallbacks.test.js
```

Expected: FAIL on the missing or incomplete fallback resolver.

- [ ] **Step 3: Implement that preset's fallback and resolver**

Where Technical Blueprint or Data Terminal already contain no-theme work, reconcile it into the shared contract without deleting reference-fidelity declarations or weakening direct alias extraction.

- [ ] **Step 4: Run only that preset's test case and verify GREEN**

Rerun only the exact preset command from Step 2.

Expected: PASS.

- [ ] **Step 5: Repeat Steps 1–4 sequentially for all ten listed presets**

Do not rerun green cases unnecessarily.

### Task 5: Prove runtime theme ownership and accessibility states

**Files:**
- Modify: `tests/e2e/demo.spec.js`
- Modify: `tests/e2e/accessibility.spec.js`
- Modify: `tests/demo-visual.spec.mjs`
- Modify: `scripts/preset-identities.mjs`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: all 20 fallback-aware preset styles and the existing component/native demo specimens.
- Produces: computed-style and visual evidence for themed, fallback, light, dark, contrast, focus, disabled, reduced-motion, and forced-colors states.

- [ ] **Step 1: Write a failing computed-style matrix case**

For each preset and mode, capture representative prefixed card/button/input/range/progress paint, semantic `.ui-*` paint, and native element paint without `data-theme`; then apply two materially different themes and assert that semantic paint changes while geometry remains stable.

- [ ] **Step 2: Run only the new Chromium matrix case and verify RED**

Run: `npm.cmd exec playwright test -- --config playwright.config.js tests/e2e/demo.spec.js --project=chromium --grep "fallback and explicit theme ownership"`

Expected: FAIL for presets whose shared or authored selectors still require `data-theme` or whose material paint is fixed.

- [ ] **Step 3: Repair only reported cascade leaks**

Change fixed visible paint to resolved semantic channels, preserve neutral optical overlays, and add later preset-specific native overrides only where shared selector order wins unexpectedly.

- [ ] **Step 4: Rerun the single Chromium matrix case and verify GREEN**

Run the exact command from Step 2.

Expected: PASS.

- [ ] **Step 5: Add and run the focused accessibility case**

Verify focus visibility, labels, disabled states, and axe results for one fallback and one explicit theme in each mode. Run only the new named accessibility case until it passes.

- [ ] **Step 6: Update executable identity traits and the QA ledger**

Record each template's typography, density, geometry, material, feedback, and data evidence. Keep paint traits semantic so theme switching cannot erase identity.

### Task 6: Regenerate artifacts and run the final verification chain

**Files:**
- Generated: `dist/ui-style-kit.css`
- Generated: `dist/ui-style-kit.min.css`
- Generated: `dist/ui-style-kit.visual.css`
- Generated: `dist/ui-style-kit.visual.min.css`
- Generated: `dist/ui-style-kit.with-bridge.css`
- Generated: `dist/ui-style-kit.with-bridge.min.css`
- Generated: `dist/visual/*.css`
- Modify if generated fingerprint changes: `tests/semantic-component-contract.test.js`
- Modify if bundle sizes change: `README.md`

**Interfaces:**
- Consumes: all authored source and tests from Tasks 1–5.
- Produces: publishable generated bundles and final local verification evidence.

- [ ] **Step 1: Build once**

Run: `npm.cmd run build`

Expected: all default, visual-only, focused visual, and compatibility entrypoints regenerate successfully.

- [ ] **Step 2: Update generated artifact fingerprints if required**

Use the build output as the only source of truth. Update the exact declaration count and SHA-256 expectations, then run only `tests/semantic-component-contract.test.js`.

- [ ] **Step 3: Run the final static chain sequentially**

Run, in order, stopping at the first failure:

```powershell
npm.cmd run lint
npm.cmd run test:unit
npm.cmd run check:contrast
npm.cmd run check:compat
npm.cmd run check:ownership
npm.cmd run check:package
git diff --check
```

- [ ] **Step 4: Run focused browser and accessibility verification**

Run the new theme-ownership case, reference-fidelity cases, and axe case. Do not claim cross-browser success for an engine that was not freshly exercised.

- [ ] **Step 5: Run the visual suite once at the end**

Run: `npm.cmd run test:visual`

Expected: approved snapshots pass or are updated only after direct reference/prototype comparison confirms the intended differences.

- [ ] **Step 6: Review the integrated diff**

Confirm that only approved source, tests, documentation, generated bundles, and reviewed snapshots changed. Report unrelated pre-existing dirty files separately and do not stage, revert, or overwrite them.
