# Choosing a UI Style

| UI style | Best for |
|---|---|
| Minimal SaaS | Dense dashboards, admin tools, and focused SaaS workflows |
| Bento UI | Friendly product surfaces, feature mosaics, and showcase dashboards |
| Maximalist / Playful | Creators, entertainment, bold client sites |
| Bauhaus / Swiss Modern | Agencies, editorial layouts, design-forward brands |
| Skeuomorphic / Tactile | Physical workspace configuration, control panels and instrument-like product UI |
| Neumorphism | Sculpted same-surface dashboards and quiet configuration workflows |
| Retrofuturism | Atomic-age dashboards, instrument panels, and configuration workspaces |
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
| Minimal SaaS | Flat neutral modules, fine rules, tight radii, compact controls and negligible elevation |
| Bento UI | Large rounded tiles, theme-tinted mosaic washes, nested highlights, friendly typography and soft elevation |
| Maximalist / Playful | Punk-collage paper panels, hard ink strokes and loud condensed type |
| Bauhaus / Swiss Modern | Strict grids, heavy rules, primary geometry, flat construction and condensed uppercase type |
| Skeuomorphic / Tactile | Paper plates, serif headings, compact uppercase labels, dark instrument navigation, hard keylines, chamfered keycaps, squared lever thumbs and segmented gauges |
| Neumorphism | Borderless same-surface shells, generous radii, quiet modern type, opposing light/dark extrusion, deeply concave fields and tracks, and visibly pressed actions |
| Retrofuturism | Rounded enamel shells, nested metallic rims, recessed instrument bays, oval actions, jewel-light feedback, condensed display type, calibrated ranges and segmented progress gauges |
| Brutalism | Square full-bleed grids, heavy rules, numbered modules, blunt controls and segmented meters |
| Cyberpunk | Chamfered HUD panels, clipped controls, technical condensed type and signal-colored edges |
| Y2K | Dense portal panels, 1px bevels, title bars, system typography and segmented indicators |
| Retro Glass | Brushed application chrome, glossy navigation, beveled controls, glass panes and dark dock treatment |
| Editorial Luxe | Didone hierarchy, double rules, rigid editorial geometry and restrained couture material |
| Organic Modern | Warm material surfaces, serif identity type, fine hairlines, asymmetry and leaf-tipped details |
| Industrial Utility | Metal-framed panels, recessed instruments, mechanical actions, safety gauges and technical type |
| Technical Blueprint | Drafting grids, technical linework, square measured controls, annotations and calibrated geometry |
| Art Deco | Stepped symmetry, metallic double keylines, fanburst geometry, elegant display type and jewel controls |
| Clay | A continuous sculpted slab with soft mineral surfaces, raised rounded controls and carved seams |
| Data Terminal | A dense 1px command grid with mono typography, bracketed actions and strict semantic signals |
| Paper Editorial | A physical field-manual sheet with binder details, index tabs, print rules, condensed headings and monospaced data |
| Neo-Noir | Cinematic slants, trapezoid controls, diagonal cuts, subtle grain and amber, teal and red semantic signaling |

For filled service actions, compose `<prefix>-button`, `<prefix>-button-primary`, and `<prefix>-button-cut`. For framed callout actions, compose `<prefix>-button` and `<prefix>-button-outline-heavy`. These modifiers are independent; the library does not expose a `button-cta` class. Carry the same preset identity into service cards, media scrims, feature strips, callout bars, native actions, and dialogs rather than treating each specimen as isolated artwork.

Minimal SaaS and Bento deliberately share semantic roles but not presentation. Minimal SaaS keeps controls near `2.375rem`, uses narrow spacing and flat bordered modules, and reserves theme color for action and state emphasis. Bento uses `2.75rem` controls and `1.5rem` tiles, applies theme-derived primary, accent and secondary washes, and reinforces the mosaic hierarchy with inset highlights and soft shadows. This distinction must remain visible in every theme and mode.

Neumorphism and Tactile also share component roles without sharing material. Neumorphism removes visible keylines and sculpts cards and actions outward from one theme-derived surface while fields, tracks, table cells, and pressed states sink inward through paired light and dark shadows. Tactile keeps a denser paper-workspace rhythm: serif headings sit above compact uppercase labels, framed plates use visible rules and shallow chamfers, actions behave like raised keycaps, and dark troughs hold squared thumbs and segmented progress gauges. Theme channels may recolor both systems, but those geometry, typography, elevation, inset-depth, feedback, and table contracts remain stable.

Retrofuturism uses a mid-century atomic appliance language rather than cyberpunk scanlines or generic neon glass. Light mode reads as bright enamel with softly recessed instrument wells; dark mode reads as deep enamel with stronger recess depth. Both retain nested metallic keylines, rounded equipment housings, condensed display typography, compact uppercase labels, oval mechanical actions, dial-like range thumbs, and segmented jewel-lamp progress. Theme channels recolor the enamel, instruments, actions, and status lamps without changing that material or geometry contract.

Every preset must carry its contract through the same complete role set: buttons, fields, choices, navigation, cards, panels, tables, badges, alerts, tooltips, dialogs, ranges, progress, meters, service cards, feature strips, callouts, loading, disabled, focus and pressed states. The registry and regression suite compare typography, density, geometry, material, feedback and data presentation pairwise; theme changes are expected to alter paint while those structural identity axes remain stable.

The registry also exposes executable reference traits for all six identity axes. Each trait identifies an authored selector, property, and required value fragment, so the tests verify real CSS rather than descriptive metadata. Browser identity checks are split by preset, viewport, mode, and pair to support exact reruns without replaying unrelated passing cases.

Preset-specific grids must size from their own container. Bento feature tiles, for example, use intrinsic columns and only introduce a feature span when their container can support it, preventing metric labels from collapsing into vertical text.

## Visual regression baseline

The repository includes optional Playwright visual smoke checks:

```bash
npm install
npm run test:visual
```

Run visual tests before major releases or after large CSS refactors.
