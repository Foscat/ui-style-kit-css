# UI Systems

UI Style Kit CSS `v2.3.0` ships 20 style systems with a shared theme and mode model.

All UI systems use the same color scheme layer: `styles/theme-colors.css`. Individual UI files define structure, texture, typography, component treatment, and prefixed aliases for the shared `--usk-*` roles.

In `v2.1.0`, the combined builds use five ordered layers: `theme_colors`, `native_elements`, `components`, `presets`, and `compat_layout`. Visual-only entrypoints omit the deprecated prefixed structural helpers in `compat_layout`, while compatible entrypoints retain them.

`manifest.json` describes each preset's prefix and entrypoints, the supported themes and modes, composed visual capabilities, preset extras, deprecated structural suffixes, and native-part ownership classifications.

## Coverage Tiers

- Full utility tier: the core component API plus denser utility and a11y helper coverage.
- Lean tier: the same core component API with fewer optional utility classes for the more opinionated presets.

## Style Matrix

| Style | `data-ui` | Prefix | Tier | Notes |
| --- | --- | --- | --- | --- |
| Minimal SaaS | `minimal-saas` | `saas` | Full utility | Includes `empty-state`, `metric*` helpers |
| Bento UI | `bento` | `bento` | Full utility | Includes `tile*`, `stat*`, `grid-feature` |
| Maximalist / Playful | `maximalist` | `max` | Full utility | Includes `callout`, `sticker`, `wiggle` |
| Bauhaus / Swiss Modern | `bauhaus` | `bau` | Full utility | Includes `block`, `composition`, `rail` |
| Skeuomorphic / Tactile | `tactile` | `tactile` | Full utility | Includes `bevel`, `knob`, `pressed` |
| Neumorphism | `neumorphism` | `neo` | Full utility | Balanced utility coverage |
| Retrofuturism | `retrofuturism` | `retro` | Full utility | Balanced utility coverage |
| Brutalism | `brutalism` | `brutal` | Lean | Includes `pressed`; no ghost/switch/radio utility bundle |
| Cyberpunk | `cyberpunk` | `cyber` | Lean | Includes `console`; no ghost/switch/radio utility bundle |
| Y2K | `y2k` | `y2k` | Lean | Includes `bubble`; no ghost/switch/radio utility bundle |
| Retro Glass | `retro-glass` | `rg` | Lean | Includes `console`; no ghost/switch/radio utility bundle |
| Editorial Luxe | `editorial-luxe` | `luxe` | Full utility | Serif-led editorial hierarchy, hairline framing and restrained premium surfaces |
| Organic Modern | `organic-modern` | `organic` | Full utility | Biomorphic radii, pill controls and soft natural layering |
| Industrial Utility | `industrial-utility` | `utility` | Full utility | Dense framed operations panels, condensed labels and status-first treatment |
| Technical Blueprint | `technical-blueprint` | `blueprint` | Full utility | Drafting grid, technical framing and diagram-like precision |
| Art Deco | `art-deco` | `deco` | Full utility | Symmetrical double borders, stepped geometry and ornamental framing |
| Clay | `clay` | `clay` | Full utility | Sculpted rounded elevation and friendly dimensional controls |
| Data Terminal | `data-terminal` | `terminal` | Full utility | Monospace telemetry, dense readouts and operator-console geometry |
| Paper Editorial | `paper-editorial` | `paper` | Full utility | Print-inspired serif hierarchy, paper cues and stamped editorial details |
| Neo-Noir | `neo-noir` | `noir` | Full utility | Cinematic media framing, sharp contrast and restrained glow |

## Core Class Contract

Every style owns the same core suffixes through its prefix. For example, Minimal SaaS exposes `saas-card`, Cyberpunk exposes `cyber-card`, and Retro Glass exposes `rg-card`.

```txt
<prefix>-page
<prefix>-container
<prefix>-section
<prefix>-grid
<prefix>-stack
<prefix>-cluster
<prefix>-panel
<prefix>-well
<prefix>-inset
<prefix>-card
<prefix>-toolbar
<prefix>-nav
<prefix>-nav-link
<prefix>-table-wrap
<prefix>-table
<prefix>-title
<prefix>-subtitle
<prefix>-kicker
<prefix>-heading
<prefix>-copy
<prefix>-label
<prefix>-help-text
<prefix>-text-primary
<prefix>-text-secondary
<prefix>-text-muted
<prefix>-text-success
<prefix>-text-warning
<prefix>-text-danger
<prefix>-text-accent
<prefix>-field
<prefix>-input
<prefix>-textarea
<prefix>-select
<prefix>-button
<prefix>-button-primary
<prefix>-button-secondary
<prefix>-button-danger
<prefix>-icon-button
<prefix>-badge
<prefix>-badge-primary
<prefix>-badge-secondary
<prefix>-badge-success
<prefix>-badge-warning
<prefix>-badge-danger
<prefix>-alert
<prefix>-alert-success
<prefix>-alert-warning
<prefix>-alert-danger
<prefix>-alert-title
<prefix>-alert-body
<prefix>-progress
<prefix>-progress-bar
<prefix>-hover-lift
<prefix>-spinner
<prefix>-loading-spinner
<prefix>-spinner-sm
<prefix>-spinner-lg
```

Full utility tier styles also expose the denser helper suffixes:

```txt
<prefix>-bg-primary
<prefix>-bg-secondary
<prefix>-disabled
<prefix>-surface
<prefix>-surface-sm
<prefix>-surface-lg
<prefix>-border
<prefix>-button-ghost
<prefix>-check
<prefix>-check-control
<prefix>-radio
<prefix>-radio-control
<prefix>-switch
<prefix>-switch-track
<prefix>-switch-thumb
<prefix>-divider
<prefix>-pill
<prefix>-rounded
<prefix>-rounded-lg
<prefix>-rounded-xl
<prefix>-split
<prefix>-sr-only
<prefix>-visually-hidden
<prefix>-skip-link
```

## Commercial Component Contract

All presets expose the same marketing suffixes: `card-media`, `card-service`, `card-feature`, `card-accent-edge`, `icon-medallion`, `button-cut`, `button-outline-heavy`, `badge-seal`, `feature-strip`, `feature-item`, `callout-bar`, `eyebrow`, and `media-scrim`.

Compose a filled service action from `<prefix>-button`, `<prefix>-button-primary`, and `<prefix>-button-cut`. Compose a framed callout action from `<prefix>-button` and `<prefix>-button-outline-heavy`. The two modifiers own independent geometry; there is no `button-cta` class. Service cards, scrims, strips, callouts, native actions, and dialogs repeat the active preset's geometry and material while inheriting color from the shared theme roles.

The shared containment layer keeps these components shrinkable inside consumer grids. Preset-owned feature helpers must also respond to their own container; Bento's intrinsic tiles are the reference pattern for avoiding narrow metric columns.

## Shared Themes and Modes

All 20 styles implement:

- 20 themes (`midnight-gold`, `ocean-steel`, `forest-moss`, `sunset-ember`, `royal-plum`, `graphite-cyan`, `desert-sage`, `rose-quartz`, `cyber-lime`, `arctic-indigo`, `chrome-navy`, `recycled-emerald`, `industrial-orange`, `performance-red`, `heritage-brass`, `service-blue-red`, `newsprint-crimson`, `foundry-amber`, `soft-orchid`, `electric-noir`)
- 3 modes (`light`, `dark`, `contrast`)

## Generic Hooks

Generic hooks inherit from the active `[data-ui][data-theme][data-mode]` scope and are available when consumers do not want prefix-specific markup:

- Loading indicators: `.ui-spinner`, `.loading-spinner`, `[data-loading-spinner]`
- Tooltip surfaces: `.ui-tooltip`, `[role="tooltip"]`, `[data-tooltip]`

## Interactive Surface Theme Bridge

The canonical theme bridge remains opt-in. Load `styles/interactive-surface-theme.css` with `interactive-surface-css/state-core.css`, attach `.interactive-surface` to interactive elements, and select paint with these attributes:

```txt
data-surface-variant="primary|secondary|accent|subtle|warning|danger"
data-surface-level="1|2|3"
```

The theme bridge inherits shared `--usk-*` color roles so it follows the selected UI style, theme, and mode without duplicating per-style token maps. It supplies tokens and paint only; Interactive Surface owns hover, active, focus, disabled, transform, opacity, and reduced-motion mechanics.

The older `styles/interactive-surface-bridge.css` and `with-bridge` bundles are deprecated compatibility paths whose stateful behavior remains unchanged.

## File Locations

- `styles/theme-colors.css`
- `styles/native-elements.css`
- `styles/components.css`
- `styles/compat-layout.css`
- `styles/content-overflow.css`
- `styles/minimal-saas.css`
- `styles/bento.css`
- `styles/maximalist.css`
- `styles/bauhaus.css`
- `styles/tactile.css`
- `styles/neumorphism.css`
- `styles/retrofuturism.css`
- `styles/brutalism.css`
- `styles/cyberpunk.css`
- `styles/y2k.css`
- `styles/retro-glass.css`
- `styles/editorial-luxe.css`
- `styles/organic-modern.css`
- `styles/industrial-utility.css`
- `styles/technical-blueprint.css`
- `styles/art-deco.css`
- `styles/clay.css`
- `styles/data-terminal.css`
- `styles/paper-editorial.css`
- `styles/neo-noir.css`
- `styles/interactive-surface-theme.css`
- `styles/interactive-surface-bridge.css` (deprecated)
