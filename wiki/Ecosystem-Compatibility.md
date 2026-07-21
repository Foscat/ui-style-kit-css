# Ecosystem Compatibility

UI Style Kit CSS stays standalone while offering stable integration points for the companion libraries.

## Aligned Versions

| Library | Current aligned version | Owns |
|---|---:|---|
| `ui-style-kit-css@2.1.0` | published release | visual identity, color themes, UI paint, native HTML styling, content wrapping, and bridge tokens |
| `interactive-surface-css@1.5.0` | published release | interaction-state primitives, surface behavior, state layers, and input affordances |
| `layout-style-css@2.1.0` | staged source target | structural wrappers, grids, sections, app shells, and layout recipes |

UI Style Kit `2.1.0` and Interactive Surface `1.5.0` are released companion packages for this upgrade path. Layout Style `2.1.0` remains a staged source target until its separate release approval completes.

## Adoption Paths

### Use one

Use UI Style Kit alone for visual identity, color themes, scoped native styling, and long-text containment.

```js
import "ui-style-kit-css/minimal-saas.css";
```

### Use two

Use UI Style Kit with Interactive Surface CSS when controls need interaction-state behavior:

```js
import "ui-style-kit-css/visual/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
```

Use UI Style Kit with Layout Style CSS when a project needs structural layout primitives and UI paint:

```js
import "ui-style-kit-css/visual/minimal-saas.css";
import "layout-style-css";
```

### Use all three

Use all three when structural layout, visual styling, and interaction-state behavior should remain separate:

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

## Ownership Boundaries

- UI Style Kit CSS owns visual identity, color themes, UI paint, scoped native element styling, content wrapping, and bridge tokens.
- Interactive Surface CSS owns interaction-state primitives, state layers, input affordances, and surface behavior.
- Layout Style CSS owns structural wrappers, grids, app shells, sections, and layout recipes.

The canonical theme bridge maps shared `--usk-*` roles to `--interactive-surface-*` tokens and provides paint. It does not move interaction behavior into UI Style Kit; `state-core.css` owns those mechanics. The older `interactive-surface-bridge` and `with-bridge` exports are deprecated compatibility paths whose stateful behavior remains unchanged.
