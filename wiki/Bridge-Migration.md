# Deprecated Interactive Surface Bridge Migration

The current all-three integration imports `ui-style-kit-css/visual.css`, `ui-style-kit-css/interactive-surface-theme.css`, `interactive-surface-css/state-core.css`, and `layout-style-css` in that order.

The following public v2 exports remain available only for migration of existing stateful integrations. They are deprecated and retain their current behavior:

```js
import "ui-style-kit-css/interactive-surface-bridge";
import "ui-style-kit-css/interactive-surface-bridge.css";
import "ui-style-kit-css/with-bridge";
import "ui-style-kit-css/with-bridge.css";
```

Do not combine these deprecated imports with `interactive-surface-theme.css`.
