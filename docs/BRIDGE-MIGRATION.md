# Deprecated Interactive Surface Bridge Migration

The canonical integration for new applications is `ui-style-kit-css/visual.css`, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css/state-core.css`, and `layout-style-css` in that order.

`interactive-surface-bridge` and `with-bridge` remain public v2 compatibility exports. They are deprecated because they include stateful bridge behavior that is no longer part of the canonical token-and-paint boundary. They are retained unchanged in v2 and will not be redirected to the token-only bridge.

The shared semantic path is separate from migration: a third-party token producer may load before `interactive-surface-css/standalone-preset.css`, but it does not reproduce UI Style Kit's specialized variant and level mappings. Existing bridge consumers should follow the canonical imports above when migrating.

## Retained deprecated imports

Existing integrations may continue to use either exported stateful path while scheduling their migration:

```js
import "ui-style-kit-css/interactive-surface-bridge";
import "ui-style-kit-css/interactive-surface-bridge.css";
import "ui-style-kit-css/with-bridge";
import "ui-style-kit-css/with-bridge.css";
```

Do not combine a deprecated bridge import with `interactive-surface-theme.css`; select the legacy stateful path during migration or the canonical token-only path for new integration work.

## Replace preset-prefixed runtime hooks

Preset-prefixed classes remain supported advanced entrypoints for applications
that never switch visual systems. They should not be used as application state
or queried by runtime logic. Replace markup such as:

```html
<button class="saas-button saas-button-primary variant-active">Save</button>
```

with stable semantic markup:

```html
<button class="ui-button" data-ui-variant="primary" aria-pressed="true">Save</button>
```

Keep `data-ui` and `data-mode` on the owning scope and use `data-theme` only
when selecting a shared palette. The semantic class stays unchanged when the
preset changes.

## Replace preset-private tokens

Application CSS must not depend on tokens such as `--saas-*`, `--bento-*`, or
another preset's internal material variables. Use the documented `--ui-*`
semantic handshake for portable control paint and geometry, or the public
`--usk-*` theme roles when the application intentionally integrates with UI
Style Kit. Preset-private values may change as a visual system is refined.

## Replace legacy `variant-*` state classes

UI Style Kit does not define a generic `variant-*` class API. Use
`data-ui-variant` only on the selectors and values declared in
`manifest.json#semanticComponentApi.variantAttribute`. Use native or ARIA state
for interaction state, such as `disabled`, `aria-pressed`, `aria-selected`,
`aria-current`, and `aria-busy`. When Interactive Surface is present, its
documented `data-surface-variant` and `data-surface-level` attributes own state
surface behavior; they do not replace `data-ui-variant` paint semantics.
