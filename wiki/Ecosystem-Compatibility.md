# Ecosystem Compatibility

UI Style Kit CSS stays standalone while offering stable integration points for the companion libraries.

## Aligned Versions

| Library | Current aligned version | Owns |
|---|---:|---|
| `ui-style-kit-css@2.2.0` | current package version | visual identity, color themes, UI paint, native HTML styling, content wrapping, and bridge tokens |
| `interactive-surface-css@1.6.0` | published release | interaction-state primitives, surface behavior, state layers, and input affordances |
| `layout-style-css@3.0.1` | published release | structural wrappers, grids, sections, app shells, and layout recipes |

The current combination is `ui-style-kit-css@2.2.0`, `interactive-surface-css@1.6.0`, and `layout-style-css@3.0.1`. UI Style Kit `2.2.0` is the current package version, and the release pipeline treats it as the active candidate only while that exact npm version is absent. Interactive Surface `1.6.0` and Layout Style `3.0.1` are published releases. The validated minimum remains `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`.

## Layout-to-visual pairing matrix

The pairings in `layout-style-css/personalities.json` are recommendations, never dependencies. `data-ly-layout`, `data-ui`, `data-theme`, and `data-mode` remain independently selectable.

| Layout personality | Visual guidance |
| --- | --- |
| Minimal SaaS, Bento, Maximalist, Bauhaus, Tactile, Neumorphism, Retrofuturism, Brutalism, Cyberpunk, Y2K, Retro Glass | Native UI Style Kit match with the same identifier |
| F-pattern, Z-pattern, Split Screen, Mondrian | Any UI Style Kit visual preset; these are structure-only layouts |
| Synthwave | Recommend `cyberpunk` or `retrofuturism`; rendered computed-style verification preserves the independent synthwave layout selector |

## Shared semantic theming

UI Style Kit's complete, visual, and focused visual entrypoints produce the 12 package-neutral `--ui-*` control tokens under `[data-ui][data-theme][data-mode]`. A third-party theme may publish the same contract under its own scope. Consumer precedence remains package-specific first, shared semantic second, and legacy fallback or literal last.

```js
import "third-party-theme/tokens.css";
import "interactive-surface-css/standalone-preset.css";
```

This portable path supplies a complete semantic control baseline. UI Style Kit integrations should keep `interactive-surface-theme.css` with `state-core.css` when they need specialized variant, level, icon-role, and state-opacity mappings.

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
