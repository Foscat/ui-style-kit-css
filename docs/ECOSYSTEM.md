# Ecosystem Compatibility

UI Style Kit CSS is the visual layer in the three-library CSS ecosystem. It can run alone, but it also has stable integration points for Interactive Surface CSS and Layout Style CSS.

`ecosystem-compatibility.json` is the authoritative source for supported ranges, validated combinations, canonical imports, and deprecated bridge metadata. UI Style Kit owns this file temporarily until a dedicated ecosystem fixture repository is introduced.

Its companion source records pin the exact repository revisions used by integration and release verification. Update those immutable pins whenever a later task changes a companion contract; Task 9/final release work replaces the interim Task 4 pins with final heads.

## Remote Validation Sequence

The pinned companion commits are local contract fixtures until they are pushed to their GitHub repositories. Before a UI branch or pull request is expected to validate, push Interactive Surface first, then Layout Style, and verify each pinned SHA is fetchable as a remote commit object. Only then push the UI branch and verify its CI. The CI and publish workflows perform the same remote-object preflight, so they intentionally fail rather than silently substituting a mutable branch or stale registry artifact when either companion revision is unavailable.

## Aligned Versions

| Library | Current aligned version | Owns |
|---|---:|---|
| `ui-style-kit-css@2.1.0` | published release | visual identity, color themes, UI paint, native HTML styling, content wrapping, and bridge tokens |
| `interactive-surface-css@1.5.0` | published release | interaction-state primitives, surface behavior, state layers, and input affordances |
| `layout-style-css@3.0.0` | published release | structural wrappers, grids, sections, app shells, and layout recipes |

UI Style Kit `2.1.0`, Interactive Surface `1.5.0`, and Layout Style `3.0.0` are released companion packages for this integration contract.

## Layout-to-visual pairing matrix

Pairings are recommendations, never dependencies. `data-ly-layout`, `data-ui`, `data-theme`, and `data-mode` remain independently selectable; `layout-style-css/personalities.json` publishes the machine-readable source.

| Layout personality | Visual guidance |
| --- | --- |
| Minimal SaaS, Bento, Maximalist, Bauhaus, Tactile, Neumorphism, Retrofuturism, Brutalism, Cyberpunk, Y2K, Retro Glass | Native UI Style Kit match with the same identifier |
| F-pattern, Z-pattern, Split Screen, Mondrian | Any UI Style Kit visual preset; these are structure-only layouts |
| Synthwave | Recommend `cyberpunk` or `retrofuturism`; Layout's rendered demo verifies each preset while keeping the synthwave layout selected |

## Shared semantic theming

UI Style Kit's complete, visual, and focused visual entrypoints produce the 12 package-neutral `--ui-*` control tokens under `[data-ui][data-theme][data-mode]`. A third-party theme may produce the same contract under its own scope; consumers do not need UI Style Kit-specific `--usk-*` values. Package-specific values remain first in consumer fallback chains, shared semantic values come second, and legacy values or literals remain last.

A third-party producer can theme Interactive Surface's complete standalone entry point without a package-specific adapter:

```js
import "third-party-theme/tokens.css";
import "interactive-surface-css/standalone-preset.css";
```

UI Style Kit can use the same portable path by loading `ui-style-kit-css/visual.css` before `interactive-surface-css/standalone-preset.css`. That composition provides the semantic control baseline. Use the canonical `interactive-surface-theme.css` plus `state-core.css` path when an application needs UI Style Kit's specialized variant, level, icon-role, and state-opacity mappings.

## Adoption Paths

### Use one

Use UI Style Kit by itself when an app needs visual identity, theme roles, native element styling, and long-text containment without layout primitives or richer interaction-state behavior.

```js
import "ui-style-kit-css/minimal-saas.css";
```

### Use two

Pair UI Style Kit with Interactive Surface CSS when controls need the sibling interaction-state primitives. Import UI paint first, its public token bridge second, and the sibling state core third.

```js
import "ui-style-kit-css/visual/minimal-saas.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
```

Pair UI Style Kit with Layout Style CSS when the app already has interaction behavior but needs structural wrappers, grids, and sections.

```js
import "ui-style-kit-css/visual/minimal-saas.css";
import "layout-style-css";
```

### Use all three

Use all three libraries when a project needs structural layout, visual styling, and interaction-state behavior in separate layers.

```js
import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";
```

## Ownership Boundaries

- UI Style Kit CSS owns visual identity, color themes, UI paint, scoped native element styling, content wrapping, and the bridge token mapping.
- Interactive Surface CSS owns interaction-state semantics, input affordances, state layers, and surface behavior.
- Layout Style CSS owns structural wrappers, layout recipes, grids, app shells, and section composition.

The canonical theme bridge does not make Interactive Surface a dependency of UI Style Kit. It only maps shared `--usk-*` roles to `--interactive-surface-*` tokens and provides paint; `state-core.css` continues to own interaction mechanics. The older `interactive-surface-bridge` and `with-bridge` exports are deprecated compatibility paths whose stateful behavior remains unchanged.
