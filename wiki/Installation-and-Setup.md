# Installation and Setup

## Install

```bash
npm install ui-style-kit-css
```

## Import a single style file

Recommended for production apps that use one visual system:

```js
import "ui-style-kit-css/minimal-saas.css";
```

In `v2.0.1`, standalone style files import `theme-colors.css` and `native-elements.css` internally. If your CSS pipeline does not follow `@import`, import the shared layers first:

```js
import "ui-style-kit-css/theme-colors.css";
import "ui-style-kit-css/native-elements.css";
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

## Integration with interactive-surface-css

Import Interactive Surface itself, then either add the bridge separately:

```js
import "interactive-surface-css/interactive-surface.css";
import "ui-style-kit-css/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-bridge";
```

Or use the opt-in full bundle with bridge:

```js
import "interactive-surface-css/interactive-surface.css";
import "ui-style-kit-css/with-bridge.css";
```

The bridge remains opt-in for `v2.0.1`. Use `.interactive-surface` on interactable elements with `data-surface-variant` and `data-surface-level="1"`, `"2"`, or `"3"` when the bridge is attached.

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
