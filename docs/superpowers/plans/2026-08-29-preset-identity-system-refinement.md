# Preset Identity System Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 20 UI presets visibly distinct and internally coherent across CTAs, marketing surfaces, metrics, dialogs, and native controls while preserving the 2.3.0 public API.

**Architecture:** Add a manifest-complete internal identity registry that describes each preset's visual vocabulary and acts as a build-time contract. Keep the actual component treatments explicit in the authored preset CSS, separate the filled and outlined CTA roles in the demo, and extend focused tests so uniqueness is proven across a composite component signature instead of one `clip-path`.

**Tech Stack:** CSS cascade layers, CSS custom properties, CSS Grid, container queries, Node.js ES modules, `node:test`, `css-tree`, Lightning CSS, Stylelint, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-29-preset-identity-system-refinement-design.md`

## Global Constraints

- Keep `ui-style-kit-css@2.3.0`, `layout-style-css@3.1.0`, and `interactive-surface-css@1.6.0` unchanged.
- Preserve all existing public classes, class suffixes, color schemes, modes, focused exports, deprecated structural helpers, and bridge exports.
- Add no public class names and remove none.
- Consume only the active theme tokens for color; do not introduce fixed component colors.
- Keep UI visual CSS before UI interaction theme, Interactive Surface state core, Layout CSS, and application overrides.
- Do not stage, commit, push, tag, publish, create a GitHub release, or deploy.
- Preserve `desktop.ini`, ignored browser artifacts, and unrelated user changes.
- Use professional JSDoc-compatible comments for every changed JavaScript helper.
- Run focused checks at task checkpoints. Run the complete release gate only once in Task 7.
- Execute inline in the current workspace because repository instructions prohibit subagents and worktrees unless explicitly requested.

---

## File Map

- Create `scripts/preset-identities.mjs`: internal registry, JSDoc types, and manifest validation.
- Create `tests/preset-identities.test.js`: registry completeness, malformed-registry, and composite-signature contracts.
- Modify `scripts/build.mjs`: validate the registry before generating distributions.
- Modify `demo/demo.js`: separate filled and outlined CTA roles and add stable demo test hooks.
- Modify `demo/demo.css`: contain style-specific specimens without imposing visual identity.
- Modify all `styles/<preset>.css` files listed by `manifest.json`: explicit CTA, surface, metric/tile, and native fallback identity rules.
- Modify `tests/marketing-components.test.js`: CTA role, sizing, relationship, and surface vocabulary contracts.
- Modify `tests/native-elements-contract.test.js`: preset-scoped native button and dialog identity coverage.
- Modify `tests/e2e/demo.spec.js` and `tests/matrix/ui-matrix.spec.js`: rendered geometry and state assertions for all 20 presets.
- Modify `README.md`, `CHANGELOG.md`, `docs/STYLE-GUIDE.md`, and `wiki/UI-Systems.md`: document coherent preset identities and CTA composition.
- Regenerate `styles/components.css`, `styles/content-overflow.css`, `demo/demo-manifest.js`, `dist/*.css`, and `dist/visual/*.css` through `npm.cmd run build`.

---

### Task 1: Add the Manifest-complete Identity Registry

**Files:**
- Create: `scripts/preset-identities.mjs`
- Create: `tests/preset-identities.test.js`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: `PRESET_IDENTITIES: readonly PresetIdentity[]`
- Produces: `validatePresetIdentities(manifest, identities = PRESET_IDENTITIES): void`
- Consumes: `manifest.presets` entries with `{id: string, prefix: string}`.
- Later tasks consume each entry's `composition`, `specimenSuffix`, `filledInlineSize`, `filledAlignment`, `description`, and `signatureSelectors`.

- [ ] **Step 1: Write the registry completeness and error-path tests**

Create `tests/preset-identities.test.js` with direct tests for exact manifest coverage and malformed input:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESET_IDENTITIES, validatePresetIdentities } from '../scripts/preset-identities.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('identity registry exactly matches the public preset manifest', () => {
  assert.doesNotThrow(() => validatePresetIdentities(manifest));
  assert.deepEqual(
    PRESET_IDENTITIES.map(({ id, prefix }) => [id, prefix]),
    manifest.presets.map(({ id, prefix }) => [id, prefix])
  );
});

test('identity validation rejects omissions and duplicate identities', () => {
  assert.throws(
    () => validatePresetIdentities(manifest, PRESET_IDENTITIES.slice(1)),
    /missing identity for minimal-saas/
  );
  assert.throws(
    () => validatePresetIdentities(manifest, [...PRESET_IDENTITIES, PRESET_IDENTITIES[0]]),
    /duplicate identity for minimal-saas/
  );
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/preset-identities.test.js`

Expected: FAIL because `scripts/preset-identities.mjs` does not exist.

- [ ] **Step 3: Implement the typed identity registry**

Create `scripts/preset-identities.mjs` with this JSDoc contract and the exact manifest-ordered entries:

```js
/**
 * @typedef {'compact'|'block'|'soft'|'elongated'|'expressive'} CompositionFamily
 */

/**
 * @typedef {Object} PresetIdentity
 * @property {string} id Public manifest preset identifier.
 * @property {string} prefix Public class and token prefix.
 * @property {CompositionFamily} composition Intentional CTA width and alignment family.
 * @property {string} specimenSuffix Existing preset-owned metric or specimen suffix.
 * @property {string} filledInlineSize Required computed inline-size declaration for the filled CTA.
 * @property {'start'|'center'|'end'} filledAlignment Required grid alignment for the filled CTA.
 * @property {string} description Human-readable component identity.
 * @property {readonly string[]} signatureSelectors Prefix-relative selectors used by contracts.
 */

const signatureSelectors = Object.freeze([
  'button-cut',
  'button-outline-heavy',
  'card-service',
  'media-scrim',
  'callout-bar'
]);

const identityRows = [
  ['minimal-saas', 'saas', 'compact', 'metric', 'fit-content', 'start', 'single-corner fold, fine outline, low elevation'],
  ['bento', 'bento', 'block', 'grid-feature', 'min(100%,14rem)', 'center', 'stepped tile edges and compact block composition'],
  ['maximalist', 'max', 'expressive', 'well', 'fit-content', 'end', 'skewed poster silhouette and pronounced layered shadow'],
  ['bauhaus', 'bau', 'block', 'well', 'min(100%,12rem)', 'start', 'asymmetric hard geometry and structural blocks'],
  ['tactile', 'tactile', 'expressive', 'well', 'fit-content', 'center', 'chamfered keycap with bevel and pressed depth'],
  ['neumorphism', 'neo', 'soft', 'well', 'fit-content', 'center', 'soft clipping with raised and inset shadows'],
  ['retrofuturism', 'retro', 'elongated', 'well', 'min(100%,18rem)', 'center', 'elongated console geometry with metallic rim'],
  ['brutalism', 'brutal', 'block', 'well', 'min(100%,14rem)', 'start', 'blunt cut, thick border, and hard offset shadow'],
  ['cyberpunk', 'cyber', 'elongated', 'well', 'min(100%,18rem)', 'end', 'multi-notch technical polygon with neon edge'],
  ['y2k', 'y2k', 'soft', 'well', 'min(100%,14rem)', 'center', 'glossy hexagonal capsule with reflective depth'],
  ['retro-glass', 'rg', 'elongated', 'well', 'min(100%,16rem)', 'center', 'frosted angular tab with inner highlight'],
  ['editorial-luxe', 'luxe', 'compact', 'metric', 'fit-content', 'start', 'slim bookplate with hairline framing'],
  ['organic-modern', 'organic', 'soft', 'metric', 'fit-content', 'center', 'asymmetric pebble contour with soft depth'],
  ['industrial-utility', 'utility', 'compact', 'metric', 'fit-content', 'start', 'octagonal equipment control with operational density'],
  ['technical-blueprint', 'blueprint', 'compact', 'metric', 'fit-content', 'start', 'drafting-corner outline and technical rules'],
  ['art-deco', 'deco', 'soft', 'metric', 'min(100%,15rem)', 'center', 'symmetric chevrons with double-rule framing'],
  ['clay', 'clay', 'soft', 'metric', 'fit-content', 'center', 'inflated pill with chunky soft shadow'],
  ['data-terminal', 'terminal', 'compact', 'metric', 'fit-content', 'start', 'terminal brackets with luminous outline'],
  ['paper-editorial', 'paper', 'compact', 'metric', 'fit-content', 'start', 'ticket notches with inked offset edge'],
  ['neo-noir', 'noir', 'elongated', 'metric', 'min(100%,16rem)', 'end', 'cinematic slant with edge lighting']
];

/** @type {readonly PresetIdentity[]} */
export const PRESET_IDENTITIES = Object.freeze(identityRows.map(
  ([id, prefix, composition, specimenSuffix, filledInlineSize, filledAlignment, description]) => Object.freeze({
    id,
    prefix,
    composition,
    specimenSuffix,
    filledInlineSize,
    filledAlignment,
    description,
    signatureSelectors
  })
));
```

Implement `validatePresetIdentities` by checking arrays, duplicate IDs, missing IDs, unknown IDs, prefix equality, supported composition families, and a non-empty `signatureSelectors` list. Throw `TypeError` for malformed arguments and `Error` for contract mismatches.

- [ ] **Step 4: Wire validation into the build before any generated writes**

Modify `scripts/build.mjs`:

```js
import { validatePresetIdentities } from './preset-identities.mjs';

// Place immediately after package/manifest version equality validation.
validatePresetIdentities(publicManifest);
```

- [ ] **Step 5: Prove the registry and build guard**

Run: `node --test tests/preset-identities.test.js`

Expected: 2 tests pass.

Run: `node scripts/build.mjs`

Expected: exit 0 with all current bundles regenerated.

Inspect: `git diff -- scripts/preset-identities.mjs tests/preset-identities.test.js scripts/build.mjs`

---

### Task 2: Separate CTA Roles and Establish Intentional Composition

**Files:**
- Modify: `demo/demo.js`
- Modify: `tests/marketing-components.test.js`
- Modify: all 20 `styles/<preset>.css` files from `manifest.json`

**Interfaces:**
- Consumes: `PRESET_IDENTITIES` from Task 1.
- Produces: demo hooks `marketing-primary-cta` and `marketing-secondary-cta`.
- Preserves: independent public `button-cut` and `button-outline-heavy` modifiers.

- [ ] **Step 1: Add failing CTA composition contracts**

Extend `tests/marketing-components.test.js` to import `PRESET_IDENTITIES`, parse effective declarations with `css-tree`, and assert:

```js
test('commercial CTAs use separate filled and outlined roles', () => {
  const demo = read('demo/demo.js');
  assert.match(demo, /data-testid="marketing-primary-cta"[^>]*button-cut/);
  assert.match(demo, /data-testid="marketing-secondary-cta"[^>]*button-outline-heavy/);
  assert.doesNotMatch(demo, /data-testid="marketing-secondary-cta"[^>]*button-cut/);
});

test('every preset declares intentional CTA sizing and independent outline geometry', () => {
  for (const { id, prefix, filledInlineSize, filledAlignment } of PRESET_IDENTITIES) {
    const css = read(`styles/${id}.css`);
    const filled = effectiveDeclarations(css, (selector) => selector.includes(`.${prefix}-button-cut`));
    const outline = effectiveDeclarations(css, (selector) => selector.includes(`.${prefix}-button-outline-heavy`));

    assert.equal(filled.get('inline-size'), filledInlineSize, `${id} filled CTA width`);
    assert.equal(filled.get('justify-self'), filledAlignment, `${id} filled CTA alignment`);
    assert.ok(outline.has('clip-path') || outline.has('border-radius'), `${id} outline CTA needs owned geometry`);
  }
});
```

- [ ] **Step 2: Confirm the focused test fails on stacked modifiers and missing composition**

Run: `node --test tests/marketing-components.test.js`

Expected: FAIL because `View Usage` stacks `button-cut` and the 20 CTAs do not yet match the registry sizing/alignment contracts.

- [ ] **Step 3: Separate the demo roles**

Modify the two anchors in `demo/demo.js`:

```html
<a data-testid="marketing-primary-cta" class="${p}-button ${p}-button-primary ${p}-button-cut" href="#components">Explore</a>
<a data-testid="marketing-secondary-cta" class="${p}-button ${p}-button-outline-heavy" href="#usage">View Usage</a>
```

- [ ] **Step 4: Author the exact CTA composition matrix**

In each preset stylesheet, consolidate the final effective CTA rules so later declarations implement this matrix:

| Preset | Filled action width/alignment | Filled silhouette | Outline relationship |
| --- | --- | --- | --- |
| Minimal SaaS | `fit-content` / start | one trailing fold | same fold, fine primary outline, low shadow |
| Bento | `min(100%, 14rem)` / center | stepped trailing tile | stepped frame, compact block border |
| Maximalist | `fit-content` / end | long poster skew | opposing skew, offset shadow |
| Bauhaus | `min(100%, 12rem)` / start | opposing hard cuts | two-pixel asymmetric frame |
| Tactile | `fit-content` / center | eight-point chamfer | chamfered bevel with inset highlight |
| Neumorphism | `fit-content` / center | softly clipped rounded inset | raised outline with paired light/dark shadows |
| Retrofuturism | `min(100%, 18rem)` / center | elongated console hexagon | double metallic rim |
| Brutalism | `min(100%, 14rem)` / start | blunt opposing cuts | three-pixel border and hard offset shadow |
| Cyberpunk | `min(100%, 18rem)` / end | asymmetric multi-notch | notched neon edge and glow |
| Y2K | `min(100%, 14rem)` / center | hexagonal capsule | glossy capsule frame and highlight |
| Retro Glass | `min(100%, 16rem)` / center | angular tab | translucent frame with inner highlight |
| Editorial Luxe | `fit-content` / start | slim bookplate | hairline/double bookplate frame |
| Organic Modern | `fit-content` / center | asymmetric pebble | related leaf contour and soft shadow |
| Industrial Utility | `fit-content` / start | octagonal control | equipment outline with inset rule |
| Technical Blueprint | `fit-content` / start | drafting-corner polygon | technical outline with inset drafting rule |
| Art Deco | `min(100%, 15rem)` / center | symmetric chevrons | double-rule chevron frame |
| Clay | `fit-content` / center | inflated clipped pill | inflated outline with chunky soft shadow |
| Data Terminal | `fit-content` / start | command bracket | bracket outline with restrained glow |
| Paper Editorial | `fit-content` / start | paired ticket notches | ticket outline and ink-offset shadow |
| Neo Noir | `min(100%, 16rem)` / end | cinematic slant | opposing slant with edge light |

Every final `button-cut` rule must set `inline-size`, `max-inline-size: 100%`, and `justify-self`. Every final `button-outline-heavy` rule must set its own silhouette, border treatment, and material/depth treatment. Preserve the existing `outline-offset: -3px` focus rule for clipped controls.

- [ ] **Step 5: Prove CTA roles and inspect the cross-preset slice**

Run: `node --test tests/marketing-components.test.js tests/preset-identities.test.js`

Expected: all focused tests pass.

Run: `npx stylelint "styles/*.css"`

Expected: exit 0.

Inspect: `git diff -- demo/demo.js styles tests/marketing-components.test.js`

---

### Task 3: Connect Surfaces, Metrics, and Native Fallbacks to Each Identity

**Files:**
- Modify: all 20 `styles/<preset>.css` files
- Modify: `tests/preset-identities.test.js`
- Modify: `tests/native-elements-contract.test.js`

**Interfaces:**
- Consumes: `signatureSelectors` and `specimenSuffix` from Task 1.
- Produces: unique composite identity signatures for all 20 presets.
- Preserves: shared native semantics and bridge detachment behavior.

- [ ] **Step 1: Add failing composite and native identity tests**

In `tests/preset-identities.test.js`, add `effectiveDeclarations` and `normalizedSignature` helpers using `css-tree`. The signature must include effective values for `background`, `border`, `border-radius`, `box-shadow`, `clip-path`, `inline-size`, `justify-self`, and `font-family`, with the active prefix replaced by `preset`.

```js
test('all presets expose distinct composite component identities', () => {
  const signatures = new Map();

  for (const identity of PRESET_IDENTITIES) {
    const css = fs.readFileSync(path.join(root, 'styles', `${identity.id}.css`), 'utf8');
    const selectors = [
      ...identity.signatureSelectors,
      identity.specimenSuffix
    ];
    const signature = selectors.map((suffix) =>
      normalizedSignature(css, `.${identity.prefix}-${suffix}`, identity.prefix)
    ).join('|');

    assert.equal(signatures.has(signature), false, `${identity.id} duplicates ${signatures.get(signature)}`);
    signatures.set(signature, identity.id);
  }
});
```

In `tests/native-elements-contract.test.js`, assert every stylesheet contains preset-scoped rules for unclassed action inputs/buttons and dialogs, and that the action and dialog blocks each declare at least two of `border`, `border-radius`, `box-shadow`, or `background`.

- [ ] **Step 2: Confirm the focused contracts fail for generic metrics and native treatments**

Run: `node --test tests/preset-identities.test.js tests/native-elements-contract.test.js`

Expected: FAIL because most native identity blocks are absent and several composite signatures remain generic.

- [ ] **Step 3: Apply the surface/material matrix**

For each preset, add one consolidated identity block covering `card-service`, `media-scrim`, `feature-strip`, `callout-bar`, and the registry metric or style-specimen suffix:

| Preset | Surface/material treatment |
| --- | --- |
| Minimal SaaS | fine border, small leading accent rule, low neutral elevation |
| Bento | stepped/tiled corners, nested borders, compact gaps, no generic pill |
| Maximalist | two-pixel border, layered theme-token fill, pronounced offset shadow |
| Bauhaus | zero radius, two-pixel hard border, asymmetric primary edge |
| Tactile | bevel gradient, inset top highlight, physical drop depth |
| Neumorphism | soft radius, raised outer shadows, inset metric shadow, quiet border |
| Retrofuturism | elongated panel proportion, double rim, metallic inset highlight |
| Brutalism | three-pixel border, zero radius, hard text-token offset shadow |
| Cyberpunk | notched or hard surface corners, primary edge, token-driven neon glow |
| Y2K | large capsule radius, glossy token gradient, reflective inset highlight |
| Retro Glass | translucent token surface, angular corners, backdrop blur, inner highlight |
| Editorial Luxe | compact bookplate proportions, hairline/double rules, no heavy shadow |
| Organic Modern | asymmetric radii, soft layered theme-token shadow, relaxed spacing |
| Industrial Utility | small radius, two-pixel equipment border, inset status rail |
| Technical Blueprint | zero radius, drafting border, token-driven grid/technical rule |
| Art Deco | symmetric geometry, double border, restrained centered ornament |
| Clay | extra-large radius, inflated token fill, chunky soft shadow |
| Data Terminal | zero radius, one-pixel luminous primary edge, monospace compact density |
| Paper Editorial | zero radius, heavy top rule, ink-like offset edge |
| Neo Noir | restrained radius, high-contrast primary edge, cinematic shadow/glow |

Do not clip dialog surfaces or content-bearing cards in a way that can cut focus rings or text. Use border, radius, edge, and shadow language for those surfaces when clipping would be unsafe.

- [ ] **Step 4: Add safe preset-scoped native identity blocks**

In each preset stylesheet, add scoped rules after the shared native layer:

```css
[data-ui="PRESET_ID"][data-theme][data-mode] :where(
  button:not([class]),
  input[type="button"]:not([class]),
  input[type="submit"]:not([class]),
  input[type="reset"]:not([class])
) {
  /* Preset-specific border, radius, shadow, typography, and safe silhouette. */
}

[data-ui="PRESET_ID"][data-theme][data-mode] :where(dialog) {
  /* Matching surface border, radius, background, and depth without clipping content. */
}
```

Use the same matrix language as the preset's CTA and surface. Keep `min-block-size`, padding, foreground/background contrast roles, focus rules, busy pseudo-elements, disabled styling, and bridge state ownership unchanged.

- [ ] **Step 5: Prove composite uniqueness and native coverage**

Run: `node --test tests/preset-identities.test.js tests/native-elements-contract.test.js tests/marketing-components.test.js`

Expected: all focused tests pass and all 20 composite signatures are unique.

Run: `npm.cmd run check:contrast`

Expected: all 1,200 semantic theme/mode/preset states pass.

Inspect: `git diff -- styles tests/preset-identities.test.js tests/native-elements-contract.test.js`

---

### Task 4: Repair Bento Metrics and Dense Demo Specimens

**Files:**
- Modify: `styles/bento.css`
- Modify: `demo/demo.css`
- Modify: `tests/marketing-components.test.js`
- Modify: `tests/e2e/demo.spec.js`

**Interfaces:**
- Preserves: `.bento-grid-feature`, `.bento-tile`, `.bento-tile-lg`, and `.bento-tile-sm` public classes.
- Produces: intrinsic one/two-column behavior with container-aware tile spans.

- [ ] **Step 1: Add failing Bento containment contracts**

Add static assertions:

```js
test('Bento feature metrics use intrinsic columns and container-aware spans', () => {
  const css = read('styles/bento.css');
  assert.match(css, /\.bento-grid-feature\s*\{[^}]*container-type:\s*inline-size/s);
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*14rem\),\s*1fr\)\)/);
  assert.match(css, /@container\s*\(min-width:\s*34rem\)[\s\S]*\.bento-tile-lg\s*\{[^}]*grid-column:\s*span 2/);
  assert.match(css, /\.bento-stat-label[^}]*overflow-wrap:\s*normal/);
});
```

Extend the existing Playwright geometry block to collect both Bento tile widths, label line boxes, and container width. Assert every tile is at least 12rem when the container is that wide and no label has more than two line boxes.

- [ ] **Step 2: Confirm the static test fails on the six-column layout**

Run: `node --test tests/marketing-components.test.js`

Expected: FAIL because `.bento-grid-feature` still uses `repeat(6, 1fr)`.

- [ ] **Step 3: Implement intrinsic grid sizing and child container queries**

Replace the current Bento helper with:

```css
.bento-grid-feature {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  grid-auto-rows: minmax(9rem, auto);
  gap: var(--bento-space-5);
}

.bento-tile,
.bento-tile-lg,
.bento-tile-md,
.bento-tile-sm {
  min-inline-size: 0;
  grid-column: auto;
  grid-row: auto;
}

.bento-stat-label {
  overflow-wrap: normal;
  word-break: normal;
}

@container (min-width: 34rem) {
  .bento-tile-lg {
    grid-column: span 2;
    grid-row: span 2;
  }
}
```

Keep the existing tile fill, border, radius, and shadow declarations in the consolidated Bento identity block from Task 3.

- [ ] **Step 4: Keep the demo host neutral and containable**

In `demo/demo.css`, ensure `.demo-token-sample` and its direct style-specific child have `min-inline-size: 0` and `max-inline-size: 100%`. Do not add preset-specific colors, radii, or shadows to demo CSS.

- [ ] **Step 5: Prove the focused containment slice**

Run: `node --test tests/marketing-components.test.js`

Expected: all tests pass.

Run: `npx stylelint "styles/bento.css" "demo/demo.css"`

Expected: exit 0.

The Playwright assertion is authored but not run if the active browser policy remains blocked.

---

### Task 5: Expand Rendered Contracts and Release Documentation

**Files:**
- Modify: `tests/e2e/demo.spec.js`
- Modify: `tests/matrix/ui-matrix.spec.js`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/STYLE-GUIDE.md`
- Modify: `wiki/UI-Systems.md`

**Interfaces:**
- Consumes: demo hooks from Task 2 and registry entries from Task 1.
- Produces: 20-preset geometry/state coverage at 1440px, 1024px, and 390px.

- [ ] **Step 1: Add rendered CTA relationship and containment assertions**

For each preset and viewport, collect computed style and geometry for both commercial CTA hooks, service card, callout bar, metric/tile specimen, native action buttons, and inline dialog. Assert:

```js
expect(primary.width).toBeGreaterThanOrEqual(96);
expect(primary.right).toBeLessThanOrEqual(service.right + 1);
expect(secondary.width).toBeGreaterThanOrEqual(96);
expect(secondary.right).toBeLessThanOrEqual(callout.right + 1);
expect(primary.signature).not.toBe(secondary.signature);
expect(nativeButtons.every(({ contrast }) => contrast >= 4.5)).toBe(true);
expect(dialog.left).toBeGreaterThanOrEqual(nativePanel.left - 1);
expect(dialog.right).toBeLessThanOrEqual(nativePanel.right + 1);
expect(documentOverflow).toBeLessThanOrEqual(1);
```

Build each signature from computed `clipPath`, `borderRadius`, `borderWidth`, `boxShadow`, `inlineSize`, and `justifySelf`.

- [ ] **Step 2: Add matrix assertions for light, dark, contrast, focus, busy, and reduced motion**

Extend `tests/matrix/ui-matrix.spec.js` so each preset validates:

- visible focus outline for filled, outlined, native, and dialog actions;
- spinner containment in busy controls;
- readable media-scrim caption;
- no CTA label overflow or vertical character stacking;
- disabled/native foreground uses the shared readable muted role;
- reduced motion makes CTA and loader animation duration effectively zero or one millisecond.

- [ ] **Step 3: Update release-facing documentation**

Add a 2.3.0 refinement bullet to `CHANGELOG.md` describing coherent preset-specific CTA, surface, metric, and native treatments. In `README.md`, `docs/STYLE-GUIDE.md`, and `wiki/UI-Systems.md`, document:

- filled service action: `button-primary button-cut`;
- framed callout action: `button-outline-heavy`;
- modifiers remain independently composable;
- UI presets control geometry/material while color schemes control semantic color;
- no `button-cta` class exists or is required.

- [ ] **Step 4: Run documentation and static contracts only**

Run: `node --test tests/class-api.test.js tests/public-api.test.js tests/preset-identities.test.js tests/marketing-components.test.js`

Expected: all focused tests pass.

Run: `git diff --check -- README.md CHANGELOG.md docs/STYLE-GUIDE.md wiki/UI-Systems.md tests/e2e/demo.spec.js tests/matrix/ui-matrix.spec.js`

Expected: exit 0.

---

### Task 6: Regenerate Distributions and Run Focused Release Checks

**Files:**
- Generated: `styles/components.css`
- Generated: `styles/content-overflow.css`
- Generated: `demo/demo-manifest.js`
- Generated: `dist/ui-style-kit*.css`
- Generated: `dist/visual/*.css`
- Generated if sizes change: `README.md`

**Interfaces:**
- Consumes: all authored changes from Tasks 1-5.
- Produces: synchronized full, minified, visual, focused, and bridge bundles.

- [ ] **Step 1: Regenerate through the canonical build**

Run: `npm.cmd run build`

Expected: generated foundations, demo manifest, distributions, and README sizes synchronize without Lightning CSS warnings.

- [ ] **Step 2: Run focused unit contracts**

Run: `node --test tests/preset-identities.test.js tests/marketing-components.test.js tests/native-elements-contract.test.js tests/control-refinements.test.js tests/readme-size-sync.test.js tests/package-integrity.test.js`

Expected: all focused tests pass.

- [ ] **Step 3: Run style and contrast checks**

Run: `npm.cmd run lint`

Expected: exit 0.

Run: `npm.cmd run check:contrast`

Expected: all 1,200 semantic states and media-scrim contracts pass.

- [ ] **Step 4: Run package integrity and dry-run inspection**

Run: `npm.cmd run check:package`

Expected: exit 0.

Run: `npm.cmd run pack:dry-run`

Expected: package contains only intended styles, distributions, documentation, manifests, and metadata; no browser artifacts or `desktop.ini`.

- [ ] **Step 5: Review authored and generated scope**

Run: `git status --short`

Run: `git diff --stat`

Run: `git diff --check`

Expected: no whitespace errors, no staged changes, and no unrelated files modified by this task.

---

### Task 7: Run the Complete Local 2.3.0 Release Gate Once

**Files:**
- Verify only; fix failures in the smallest responsible authored subsystem, regenerate, and rerun only the failed focused command before restarting this final gate.

**Interfaces:**
- Consumes: complete integrated working tree.
- Produces: final local release-candidate evidence without external publication.

- [ ] **Step 1: Run the CI-equivalent release command**

Run: `npm.cmd run release:verify`

Expected: build, Stylelint, unit contracts, contrast, package validation, E2E, Axe, visual, matrix, ecosystem pack proof, audit, and dry-run packaging all pass.

If browser execution is blocked by the active browser policy, stop the browser portion without substituting another browser surface. Record the exact blocked commands and preserve the passing non-browser evidence.

- [ ] **Step 2: Recheck whitespace and version surfaces**

Run: `git diff --check`

Run: `rg -n '2\.1\.0|layout-style-css@2\.|interactive-surface-css@(?!1\.6\.0)' README.md CHANGELOG.md package.json manifest.json docs wiki scripts tests -g '*.md' -g '*.json' -g '*.mjs' -g '*.js'`

Expected: no stale release or companion-version statements except explicitly labeled historical changelog entries.

- [ ] **Step 3: Inspect the tarball and working tree**

Run: `npm.cmd run pack:dry-run`

Run: `git status --short --branch`

Expected: branch `2.3.0`, no staged files, no temporary package/browser artifacts, and only the intended dirty release-candidate files plus preserved user files.

- [ ] **Step 4: Prepare the final handoff**

Report:

- implemented component identity behavior;
- changed authored and generated file groups;
- focused and final verification commands with results;
- browser checks that passed or remained policy-blocked;
- package contents and version consistency;
- explicit confirmation that no commit, push, tag, release, or publication occurred.
