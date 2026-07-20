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
