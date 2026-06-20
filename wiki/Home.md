# UI Style Kit CSS Wiki

UI Style Kit CSS is a CSS-only visual style library with 11 UI systems, 10 shared color themes, and 3 display modes.

Version 2.0.0 defines color schemes once in `styles/theme-colors.css` as shared `--usk-*` roles. UI systems consume those shared roles through their prefixed functional tokens.

Use this wiki as the canonical reference for setup, theming, class naming, and style coverage.

## Quick Start

```html
<link rel="stylesheet" href="dist/ui-style-kit.css" />
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
  <main class="saas-page">
    <section class="saas-container saas-stack">
      <article class="saas-card">
        <h1 class="saas-title">Hello</h1>
      </article>
    </section>
  </main>
</body>
```

## Wiki Pages

- [Installation and Setup](Installation-and-Setup.md)
- [Theming Model](Theming-Model.md)
- [Class API](Class-API.md)
- [UI Systems](UI-Systems.md)
- [Accessibility](Accessibility.md)

## Companion Integration

- Opt-in bridge for `interactive-surface-css` in `with-bridge` build output.
- Standalone bridge file: `styles/interactive-surface-bridge.css`
- Export alias: `ui-style-kit-css/interactive-surface-bridge`
- The bridge is isolated so `interactive-surface-css` can be revised independently.

## Canonical Data Attributes

- `data-ui`: selected UI system
- `data-theme`: selected color scheme
- `data-mode`: selected mode (`light`, `dark`, `contrast`)
- `--usk-*`: shared color-scheme RGB roles provided by the active `data-theme` and `data-mode`

## UI Systems

| Style | `data-ui` | Prefix | File |
| --- | --- | --- | --- |
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

## Color Themes

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
