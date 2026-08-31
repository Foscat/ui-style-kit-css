# UI Style Kit CSS Wiki

UI Style Kit CSS is a CSS-only visual style library with 20 UI systems, 20 shared color themes, and 3 display modes.

Version `v2.3.0` expands the library to 20 UI systems and 20 shared color themes, adds universal commercial component modifiers and a modern-browser support contract, and preserves the existing v2 entrypoint and bridge contracts.

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

- [Installation and Setup](Installation-and-Setup)
- [Theming Model](Theming-Model)
- [Class API](Class-API)
- [UI Systems](UI-Systems)
- [Ecosystem Compatibility](Ecosystem-Compatibility)
- [Accessibility](Accessibility)

## Companion Integration

- Canonical theme bridge: `ui-style-kit-css/interactive-surface-theme.css`
- Interaction mechanics: `interactive-surface-css/state-core.css`
- Consumer-owned layout entrypoints: `ui-style-kit-css/visual.css` and `ui-style-kit-css/visual/<preset>.css`
- Capability discovery: `ui-style-kit-css/manifest.json`
- The default and visual-only bundles remain bridge-free.
- The older `interactive-surface-bridge` and `with-bridge` exports are deprecated compatibility paths whose behavior remains unchanged.

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
| Editorial Luxe | `editorial-luxe` | `luxe` | `styles/editorial-luxe.css` |
| Organic Modern | `organic-modern` | `organic` | `styles/organic-modern.css` |
| Industrial Utility | `industrial-utility` | `utility` | `styles/industrial-utility.css` |
| Technical Blueprint | `technical-blueprint` | `blueprint` | `styles/technical-blueprint.css` |
| Art Deco | `art-deco` | `deco` | `styles/art-deco.css` |
| Clay | `clay` | `clay` | `styles/clay.css` |
| Data Terminal | `data-terminal` | `terminal` | `styles/data-terminal.css` |
| Paper Editorial | `paper-editorial` | `paper` | `styles/paper-editorial.css` |
| Neo-Noir | `neo-noir` | `noir` | `styles/neo-noir.css` |

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
