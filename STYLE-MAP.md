# UI Style Kit CSS Style Map

## Recommended runtime API

Lead with stable semantic classes when an interface can switch visual presets:

```html
<article class="ui-card">
  <button class="ui-button" data-ui-variant="primary">Continue</button>
  <span class="ui-badge" data-ui-variant="success">Ready</span>
</article>
```

Changing only the ancestor `data-ui` value restyles that markup across all 11 presets in the generated default, visual, and with-bridge bundles. A generated `visual/<preset>.css` focused entrypoint supplies the same semantic aliases for its selected preset only. Raw `styles/*` and standalone preset exports remain advanced prefixed APIs and do not promise multi-preset semantic switching.

## UI systems

Color schemes are defined once in `styles/theme-colors.css`. Native HTML fallback selectors are defined once in `styles/native-elements.css`. Long-text containment rules are defined once in `styles/content-overflow.css`. Each UI system file imports all shared layers, aliases `--usk-*` RGB roles back to its prefix, and maps `--usk-native-*` tokens into the preset's visual identity.

| UI style | `data-ui` | Prefix | File |
|---|---:|---:|---|
| Minimal SaaS | `minimal-saas` | `saas` | `styles/minimal-saas.css` |
| Bento UI | `bento` | `bento` | `styles/bento.css` |
| Maximalist / Playful | `maximalist` | `max` | `styles/maximalist.css` |
| Bauhaus / Swiss Modern | `bauhaus` | `bau` | `styles/bauhaus.css` |
| Skeuomorphic / Tactile | `tactile` | `tactile` | `styles/tactile.css` |
| Neumorphism | `neumorphism` | `neo` | `styles/neumorphism.css` |
| Retrofuturism | `retrofuturism` | `retro` | `styles/retrofuturism.css` |
| Brutalism | `brutalism` | `brutal` | `styles/brutalism.css` |
| Cyberpunk | `cyberpunk` | `cyber` | `styles/cyberpunk.css` |
| Y2K | `y2k` | `y2k` | `styles/y2k.css` |
| Retro Glass | `retro-glass` | `rg` | `styles/retro-glass.css` |
| Editorial Luxe | `editorial-luxe` | `luxe` | `styles/editorial-luxe.css` |
| Organic Modern | `organic-modern` | `organic` | `styles/organic-modern.css` |
| Industrial Utility | `industrial-utility` | `utility` | `styles/industrial-utility.css` |
| Technical Blueprint | `technical-blueprint` | `blueprint` | `styles/technical-blueprint.css` |
| Art Deco | `art-deco` | `deco` | `styles/art-deco.css` |
| Clay | `clay` | `clay` | `styles/clay.css` |
| Data Terminal | `data-terminal` | `terminal` | `styles/data-terminal.css` |
| Paper Editorial | `paper-editorial` | `paper` | `styles/paper-editorial.css` |
| Neo-Noir | `neo-noir` | `noir` | `styles/neo-noir.css` |

## Shared color file

| Purpose | Import |
|---|---|
| Shared color schemes and mode palettes | `styles/theme-colors.css` |

## Shared native layer

| Purpose | Import |
|---|---|
| Shared native HTML element fallback selectors | `styles/native-elements.css` |

Native selectors stay generic under `[data-ui][data-theme][data-mode]`. Every preset maps the complete choice, select, range, progress, meter, file, color, indicator, and scrollbar identity token set while retaining theme-owned color channels. This avoids repeating browser pseudo-element rules in every UI file and keeps vendor selectors safely separated.

## Shared overflow layer

| Purpose | Import |
|---|---|
| Shared long-text containment for UI wrappers and controls | `styles/content-overflow.css` |

The overflow layer keeps headings, paragraphs, links, table cells, controls, badges, nav links, and common layout wrappers from widening the page when content includes long tokens or URLs.

## Bridge bundle

| Purpose | Import |
|---|---|
| Interactive Surface bridge tokens and state levels | `styles/interactive-surface-bridge.css` |

The bridge inherits from shared `--usk-*` color roles, then applies `.interactive-surface`, `data-surface-variant`, and `data-surface-level` hooks without duplicating theme or UI preset maps.

## Themes

- `midnight-gold`
- `ocean-steel`
- `forest-moss`
- `sunset-ember`
- `royal-plum`
- `graphite-cyan`
- `desert-sage`
- `rose-quartz`
- `cyber-lime`
- `arctic-indigo`
- `chrome-navy`
- `recycled-emerald`
- `industrial-orange`
- `performance-red`
- `heritage-brass`
- `service-blue-red`
- `newsprint-crimson`
- `foundry-amber`
- `soft-orchid`
- `electric-noir`

## Modes

- `light`
- `dark`
- `contrast`

## Semantic component contract

The machine-readable source of truth is `manifest.json#semanticComponentApi`. Its 29 implemented generic selectors map only to source suffixes with 11-of-11 composed preset coverage. The `implementationStatus` section records `.ui-spinner` and `.ui-tooltip` as retained hooks, the other 27 selectors as generated aliases, and no pending selectors.

| Role | Generic selector -> current source suffix |
|---|---|
| Button | `.ui-button` -> `button`; `.ui-icon-button` -> `icon-button` |
| Card | `.ui-card` -> `card` |
| Form | `.ui-field` -> `field`; `.ui-label` -> `label`; `.ui-help-text` -> `help-text`; `.ui-input` -> `input`; `.ui-select` -> `select`; `.ui-textarea` -> `textarea` |
| Choice control | `.ui-check` -> `check`; `.ui-check-control` -> `check-control`; `.ui-radio` -> `radio`; `.ui-radio-control` -> `radio-control`; `.ui-switch` -> `switch`; `.ui-switch-track` -> `switch-track`; `.ui-switch-thumb` -> `switch-thumb` |
| Badge | `.ui-badge` -> `badge` |
| Alert | `.ui-alert` -> `alert`; `.ui-alert-title` -> `alert-title`; `.ui-alert-body` -> `alert-body` |
| Navigation | `.ui-nav` -> `nav`; `.ui-nav-link` -> `nav-link` |
| Table | `.ui-table` -> `table`; `.ui-table-wrap` -> `table-wrap` |
| Progress | `.ui-progress` -> `progress`; `.ui-progress-bar` -> `progress-bar` |
| Toolbar | `.ui-toolbar` -> `toolbar` |
| Loading | `.ui-spinner` -> `spinner` |
| Tooltip | `.ui-tooltip` -> `tooltip` |

`data-ui-variant` is the only new attribute. Omission means neutral. `.ui-button` accepts `primary`, `secondary`, `danger`, and `ghost`; `.ui-badge` accepts `primary`, `secondary`, `success`, `warning`, and `danger`; `.ui-alert` accepts `success`, `warning`, and `danger`.

Modal and dialog roles retain native `<dialog>` as their one neutral fallback; `.ui-modal` and `.ui-dialog` are not defined. Preset-prefixed classes remain supported for compatibility and advanced use. Partial preset extras and the seven deprecated structural suffixes stay out of the semantic contract.
