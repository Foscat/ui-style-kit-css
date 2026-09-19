# Color Themes

UI Style Kit CSS exposes 25 named color themes independently from its 20 visual
presets. Select a visual system with `data-ui`, a palette with `data-theme`, and
the display treatment with `data-mode`.

```html
<body data-ui="minimal-saas" data-theme="signal-yellow" data-mode="light">
```

The five newest themes fill color families that were previously absent or only
represented by neighboring hues. They use the same complete semantic role set
as every existing theme and support `light`, `dark`, and `contrast` modes.

## Gap-filling palettes

| Theme ID | Color territory | Light foundation | Light primary / secondary / accent | Dark foundation | Dark primary / secondary / accent |
| --- | --- | --- | --- | --- | --- |
| `signal-yellow` | True signal yellow with ink-navy support | `#fffbe8` | `#ffcc00` / `#25324e` / `#ffe45c` | `#120f03` | `#ffd83b` / `#8ec6ff` / `#ffe866` |
| `botanical-green` | Central leaf green with a restrained berry counterpoint | `#eff9f2` | `#0d7e42` / `#793058` / `#40c975` | `#041109` | `#52de8b` / `#ee94c7` / `#6bf0a4` |
| `cobalt-electric` | Clean saturated cobalt with coral signaling | `#f0f4ff` | `#0052cc` / `#b53948` / `#5279ff` | `#040919` | `#6f95ff` / `#ff8593` / `#8faaff` |
| `stone-graphite` | Chroma-light stone, graphite, silver, and semantic status color | `#f4f4f2` | `#383c3a` / `#5b615d` / `#b8beba` | `#0c0d0d` | `#d0d4d1` / `#a4aaa6` / `#e6e8e7` |
| `walnut-clay` | Cocoa walnut, mushroom earth, clay, and muted foliage | `#f8f1e9` | `#704330` / `#58624e` / `#be6f52` | `#120c09` | `#da9e7c` / `#b2c09d` / `#eba988` |

## Design intent

- **Signal Yellow** is deliberately yellow-led rather than another gold or
  amber scheme. Ink navy provides structure without dulling the signal color.
  In light mode, primary and accent text use the darker link ink on neutral
  surfaces; primary and accent fills retain their vivid yellow values.
- **Botanical Green** occupies the clean middle-green range between the
  library's moss, lime, and teal-emerald themes. Berry is used as a controlled
  complementary color.
- **Cobalt Electric** provides a vivid primary blue distinct from steel, cyan,
  navy, and subdued indigo. Coral carries urgent secondary actions.
- **Stone Graphite** is the neutral brand palette. Its interface hierarchy
  comes from value and surface separation; chroma is reserved for semantic
  success, warning, and danger roles.
- **Walnut Clay** covers the deep brown and taupe family without behaving like
  an orange theme. Clay and muted foliage keep the palette warm and grounded.

## Token contract

The source values in `styles/theme-colors.css` are space-separated RGB channels,
not complete CSS colors. For example:

```css
:where([data-ui][data-theme="cobalt-electric"][data-mode="light"]) {
  --usk-primary-rgb: 0 82 204;
  --usk-primary-text-rgb: 255 255 255;
}
```

Consume those channels through the existing semantic or preset-prefixed tokens.
Do not put `rgb(...)` or hexadecimal values inside a `--usk-*-rgb` override.
Each foreground/background role pair is validated to at least WCAG AA text
contrast by the library's manifest-driven contrast check.

Bright palettes can also set the optional `--usk-primary-ink` and
`--usk-accent-ink` tokens to complete CSS colors for text on neutral surfaces.
These text-only overrides do not change fill colors or text on filled controls.
They reset at each `data-ui` root, and presets retain their original text colors
when no ink override is set. Signal Yellow uses this distinction in light mode.
