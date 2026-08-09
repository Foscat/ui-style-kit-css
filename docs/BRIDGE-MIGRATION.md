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
