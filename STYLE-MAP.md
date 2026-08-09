# UI Style Kit CSS Style Map

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

## Shared color file

| Purpose | Import |
|---|---|
| Shared color schemes and mode palettes | `styles/theme-colors.css` |

## Shared native layer

| Purpose | Import |
|---|---|
| Shared native HTML element fallback selectors | `styles/native-elements.css` |

Native selectors stay generic under `[data-ui][data-theme][data-mode]`. Presets only provide token mappings such as `--usk-native-surface`, `--usk-native-radius`, and `--usk-native-shadow`, which avoids repeating the same fieldset, table, dialog, details, form, and semantic-element rules in every UI file.

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

## Modes

- `light`
- `dark`
- `contrast`

## Semantic component contract

The machine-readable source of truth is `manifest.json#semanticComponentApi`. Its 29 generic selectors map only to source suffixes with 11-of-11 composed preset coverage. The contract is specified and executable-test-backed here without adding new semantic CSS declarations; `.ui-spinner` and `.ui-tooltip` are the retained generic hooks already implemented.

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
