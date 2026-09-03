# Installation and Setup

These instructions target UI Style Kit CSS `v2.4.0` and its backward-compatible v2 entrypoints.

## Install

```bash
npm install ui-style-kit-css
```

## Import a single style file

Recommended for production apps that use one visual system:

```js
import "ui-style-kit-css/minimal-saas.css";
```

In `v2.1.0`, compatible standalone style files import `theme-colors.css`, `native-elements.css`, and `content-overflow.css` internally. If your CSS pipeline does not follow `@import`, import the shared layers first:

```js
import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/native-elements.css";
import "ui-style-kit-css/content-overflow.css";
import "ui-style-kit-css/minimal-saas.css";
```

The explicit `styles/*` path is also available:

```js
import "ui-style-kit-css/styles/minimal-saas.css";
```

## Import the combined CSS

Use the combined build for runtime UI-system switchers and demos:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
```

The default combined build does not include the Interactive Surface bridge.

Applications that own layout should use the visual-only full or focused entrypoints. These omit the deprecated prefixed structural helpers:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/visual/minimal-saas.css";
```

## Integration with interactive-surface-css

Use the canonical all-three integration when the application needs UI paint, interaction mechanics, and Layout structure:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

The older stateful bridge and combined bundle remain public, deprecated compatibility paths. Follow the [bridge migration guide](Bridge-Migration) for their retained v2 imports.

All bridges remain opt-in for `v2.1.0`. Use `.interactive-surface` on interactable elements with `data-surface-variant` and `data-surface-level="1"`, `"2"`, or `"3"` when a bridge is attached.

## Browser / CDN Usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ui-style-kit-css@latest/dist/ui-style-kit.min.css" />
```

Local build:

```html
<link rel="stylesheet" href="dist/ui-style-kit.css" />
```

## Package Maintenance Scripts

```bash
npm run build
npm run lint
npm test
npm run check:contrast
npm run check:package
npm run test:axe
npm run test:visual
npm run test:matrix
```

Playwright E2E:

```bash
npm run test:e2e:install:ci
npm run test:e2e
```

## Minimal Markup Contract

1. Apply all three attributes on your root container (usually `<body>`): `data-ui`, `data-theme`, `data-mode`.
2. Use classes that match the selected style prefix.
3. Keep prefix usage consistent in a component tree.
4. Override color schemes through shared `--usk-*` roles when changing palette values.

Example:

```html
<body data-ui="bento" data-theme="ocean-steel" data-mode="dark">
  <section class="bento-page">
    <div class="bento-container bento-stack">
      <article class="bento-card">
        <h1 class="bento-title">Dashboard</h1>
        <p class="bento-subtitle">Ready</p>
      </article>
    </div>
  </section>
</body>
```

## Dynamic Runtime Switching

```js
document.body.dataset.ui = "cyberpunk";
document.body.dataset.theme = "midnight-gold";
document.body.dataset.mode = "dark";
```
