# Interactive Surface CSS README Block

Paste this block in Interactive-Surface-CSS README.md right after the Token Contract paragraph, before the Accessibility section.

## Integration with UI Style Kit CSS

`interactive-surface-css` works directly with `ui-style-kit-css`.

If you use the combined UI Style Kit build, no extra bridge import is needed:

```js
import "ui-style-kit-css/dist/ui-style-kit.css";
import "interactive-surface-css/interactive-surface.css";
```

If you use per-style UI Style Kit imports, also include the bridge:

```js
import "ui-style-kit-css/styles/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-bridge";
import "interactive-surface-css/interactive-surface.css";
```

The bridge maps active `data-ui`, `data-theme`, and `data-mode` tokens to Interactive Surface tokens, including variant and icon-role hooks.
