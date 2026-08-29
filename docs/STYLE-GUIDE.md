# Choosing a UI Style

| UI style | Best for |
|---|---|
| Minimal SaaS | Dashboards, admin tools, SaaS apps |
| Bento UI | Landing pages, feature sections, showcases |
| Maximalist / Playful | Creators, entertainment, bold client sites |
| Bauhaus / Swiss Modern | Agencies, editorial layouts, design-forward brands |
| Skeuomorphic / Tactile | Premium tactile interfaces, control panels |
| Neumorphism | Soft dashboards, experimental UI |
| Retrofuturism | Futuristic portfolios and product pages |
| Brutalism | Bold creative websites |
| Cyberpunk | Security, gaming, encryption, tech demos |
| Y2K | Nostalgic, playful, fashion/music/event sites |
| Retro Glass | Futuristic glass dashboards and hero sections |
| Editorial Luxe | Luxury brands, architecture, hospitality, premium editorial sites |
| Organic Modern | Wellness, sustainability, hospitality, natural product brands |
| Industrial Utility | Operations software, manufacturing, logistics, fleet and equipment systems |
| Technical Blueprint | Engineering, architecture, technical documentation, scientific tools |
| Art Deco | Luxury, hospitality, heritage brands, events and distinctive showcases |
| Clay | Friendly SaaS, collaborative tools, education and approachable product sites |
| Data Terminal | Operator consoles, telemetry, infrastructure, monitoring and developer tools |
| Paper Editorial | News, magazines, journals, cultural sites and story-led publishing |
| Neo-Noir | Cinematic portfolios, nightlife, premium creative studios and dramatic product sites |

All styles share the same 20 color schemes through `styles/theme-colors.css`, so changing `data-theme` affects the active color scheme independently from the selected UI treatment.

Use `data-mode="contrast"` for high-contrast variants and pair it with semantic HTML for best accessibility outcomes.

## Preset identity and component roles

UI presets own geometry, material, spacing, depth, and typographic character. Color schemes own semantic color roles. A preset should therefore remain recognizable when its `data-theme` changes, while every component continues to consume the active theme tokens instead of fixed artwork colors.

| UI style | Repeated component identity |
|---|---|
| Minimal SaaS | Restrained single-corner folds and low-elevation outlines |
| Bento UI | Stepped tile edges and compact block composition |
| Maximalist / Playful | Skewed silhouettes, layered fills and pronounced shadows |
| Bauhaus / Swiss Modern | Asymmetric primary geometry and hard-edged composition |
| Skeuomorphic / Tactile | Chamfered physical keys, bevels and pressed depth |
| Neumorphism | Softly clipped surfaces with raised and inset shadows |
| Retrofuturism | Elongated console geometry and metallic rims |
| Brutalism | Blunt cuts, thick borders and offset shadows |
| Cyberpunk | Multi-notch technical polygons and luminous edges |
| Y2K | Glossy capsule geometry and playful depth |
| Retro Glass | Frosted angular tabs with inner highlights |
| Editorial Luxe | Slim bookplates, hairlines and restrained framing |
| Organic Modern | Asymmetric pebble and leaf contours with soft depth |
| Industrial Utility | Octagonal hazard-control geometry and dense framing |
| Technical Blueprint | Drafting-corner outlines and technical markings |
| Art Deco | Symmetric chevrons and double-rule framing |
| Clay | Inflated clipped pills and chunky soft shadows |
| Data Terminal | Terminal brackets and luminous operator outlines |
| Paper Editorial | Ticket or tab notches with inked offset edges |
| Neo-Noir | Cinematic slants and high-contrast edge lighting |

For filled service actions, compose `<prefix>-button`, `<prefix>-button-primary`, and `<prefix>-button-cut`. For framed callout actions, compose `<prefix>-button` and `<prefix>-button-outline-heavy`. These modifiers are independent; the library does not expose a `button-cta` class. Carry the same preset identity into service cards, media scrims, feature strips, callout bars, native actions, and dialogs rather than treating each specimen as isolated artwork.

Preset-specific grids must size from their own container. Bento feature tiles, for example, use intrinsic columns and only introduce a feature span when their container can support it, preventing metric labels from collapsing into vertical text.

## Visual regression baseline

The repository includes optional Playwright visual smoke checks:

```bash
npm install
npm run test:visual
```

Run visual tests before major releases or after large CSS refactors.
