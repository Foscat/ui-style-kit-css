# Deprecated Interactive Surface Bridge Migration

The canonical integration for new applications is `ui-style-kit-css/visual.css`, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css/state-core.css`, and `layout-style-css` in that order.

`interactive-surface-bridge` and `with-bridge` remain public v2 compatibility exports. They are deprecated because they include stateful bridge behavior that is no longer part of the canonical token-and-paint boundary. They are retained unchanged in v2 and will not be redirected to the token-only bridge.

## Retained deprecated imports

Existing integrations may continue to use either exported stateful path while scheduling their migration:

```js
import "ui-style-kit-css/interactive-surface-bridge";
```

```js
import "ui-style-kit-css/interactive-surface-bridge.css";
```

```js
import "ui-style-kit-css/with-bridge";
```

```js
import "ui-style-kit-css/with-bridge.css";
```

Do not combine a deprecated bridge import with `interactive-surface-theme.css`; select the legacy stateful path during migration or the canonical token-only path for new integration work.
