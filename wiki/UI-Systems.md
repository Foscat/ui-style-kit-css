# UI Systems

This library ships 11 style systems with a shared theme/mode model.

All UI systems use the same color scheme layer: `styles/theme-colors.css`. Individual UI files define structure, texture, typography, component treatment, and prefixed aliases for the shared `--usk-*` roles.

In `v2.0.1`, all UI systems also share `styles/native-elements.css` for native HTML selectors. Each preset controls the final treatment through `--usk-native-*` token mappings instead of repeating the same selector coverage.

## Coverage Tiers

- Full utility tier: denser utility and a11y helper set.
- Lean tier: core component API with fewer utility classes.

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

## Shared Themes and Modes

All 11 styles implement:

- 10 themes (`midnight-gold`, `ocean-steel`, `forest-moss`, `sunset-ember`, `royal-plum`, `graphite-cyan`, `desert-sage`, `rose-quartz`, `cyber-lime`, `arctic-indigo`)
- 3 modes (`light`, `dark`, `contrast`)

## File Locations

- `styles/theme-colors.css`
- `styles/native-elements.css`
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
- `styles/interactive-surface-bridge.css`
