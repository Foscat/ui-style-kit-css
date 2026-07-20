# Ecosystem Compatibility

UI Style Kit CSS is the visual layer in the three-library CSS ecosystem. It can run alone, but it also has stable integration points for Interactive Surface CSS and Layout Style CSS.

## Aligned Versions

| Library | Current aligned version | Owns |
|---|---:|---|
| `ui-style-kit-css@2.0.4` | source release target | visual identity, color themes, UI paint, native HTML styling, content wrapping, and bridge tokens |
| `interactive-surface-css@1.3.0` | latest published sibling | interaction-state primitives, surface behavior, state layers, and input affordances |
| `layout-style-css@1.1.2` | latest published sibling | structural wrappers, grids, sections, app shells, and layout recipes |

`ui-style-kit-css@2.0.4` is prepared in source. Until it is published, production CDN examples should stay pinned to the latest published patch.

## Adoption Paths

### Use one

Use UI Style Kit by itself when an app needs visual identity, theme roles, native element styling, and long-text containment without layout primitives or richer interaction-state behavior.

```js
import "ui-style-kit-css/minimal-saas.css";
```

### Use two

Pair UI Style Kit with Interactive Surface CSS when controls need the sibling interaction-state primitives. Import Interactive Surface first, then the visual style and the optional bridge.

```js
import "interactive-surface-css/interactive-surface.css";
import "ui-style-kit-css/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-bridge";
```

Pair UI Style Kit with Layout Style CSS when the app already has interaction behavior but needs structural wrappers, grids, and sections.

```js
import "layout-style-css";
import "ui-style-kit-css/minimal-saas.css";
```

### Use all three

Use all three libraries when a project needs structural layout, visual styling, and interaction-state behavior in separate layers.

```js
import "layout-style-css";
import "interactive-surface-css/interactive-surface.css";
import "ui-style-kit-css/with-bridge.css";
```

## Ownership Boundaries

- UI Style Kit CSS owns visual identity, color themes, UI paint, scoped native element styling, content wrapping, and the bridge token mapping.
- Interactive Surface CSS owns interaction-state semantics, input affordances, state layers, and surface behavior.
- Layout Style CSS owns structural wrappers, layout recipes, grids, app shells, and section composition.

The bridge does not make Interactive Surface a dependency of UI Style Kit. It only maps shared `--usk-*` roles to `--interactive-surface-*` tokens when consumers opt into the bridge import.
