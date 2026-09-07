# Library-wide Theme Fallback and Fidelity Design

## Status

Approved on 2026-09-04. The user selected the shared semantic resolver with preset-owned no-theme fallback palettes.

## Objective

Make all 20 public UI presets satisfy one predictable color contract while preserving their reference-specific visual identities:

- An explicit `data-theme` owns every visible paint role.
- Without `data-theme`, each preset supplies an accessible light, dark, or contrast fallback palette derived from its retained design reference.
- Typography, geometry, density, texture, elevation, and interaction behavior remain preset-owned in every color scheme.
- Shared native-element, semantic-component, overflow, accessibility, reduced-motion, high-contrast, and forced-colors behavior works with or without `data-theme`.

## Public Contract

The supported root states are:

```html
<body data-ui="minimal-saas" data-mode="light">
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
<body data-ui="minimal-saas" data-mode="dark">
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="dark">
<body data-ui="minimal-saas" data-mode="contrast">
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="contrast">
```

`data-ui` and `data-mode` remain required. `data-theme` becomes optional.

## Color Ownership

Each preset resolves its public RGB roles through the same fallback-aware expression:

```css
--<prefix>-primary-rgb: var(--usk-primary-rgb, var(--<prefix>-fallback-primary-rgb));
```

The shared theme registry defines `--usk-*` only for explicit theme/mode combinations. Therefore:

1. An explicit theme always wins.
2. A missing theme activates the preset fallback.
3. Preset component rules consume only resolved prefixed roles or material recipes derived from those roles.
4. Direct compatibility aliases remain available where the build and contrast tooling require literal `var(--usk-*-rgb)` declarations.

Opaque surfaces, highlights, shadows, grids, ornaments, glass, enamel, paper, clay, metal, terminal cells, and other material paint must derive from resolved semantic channels. Fixed neutral overlays are permitted only for optical lighting or forced-colors interoperability and must not prevent a theme change from visibly recoloring the element.

## Reference Fidelity

The retained artifact-template references are authoritative for no-theme fallback identity and for non-color visual construction.

| Preset | Reference identity to preserve |
| --- | --- |
| Minimal SaaS | restrained indigo actions, thin cool borders, compact radii, calm low-shadow panels |
| Bento UI | soft mosaic tiles, rounded modular cards, friendly blue actions, pastel feedback |
| Maximalist | loud collage geometry, heavy display type, layered cut-paper controls, multi-accent feedback |
| Bauhaus | rigid workshop grid, black rules, primary geometric accents, condensed typography |
| Tactile | warm paper, dark sidebar, copper action, olive gauges, shallow bevels and recessed tracks |
| Neumorphism | soft continuous canvas, paired raised/inset shadows, blue controls, rounded molded geometry |
| Retrofuturism | enamel shells, metallic double keylines, coral actions, teal bays, ringed controls |
| Brutalism | hard black rules, square controls, blue/yellow/red utility accents, dense condensed type |
| Cyberpunk | clipped technical frames, cyan/magenta signals, black or pale command surfaces |
| Y2K | dense window chrome, classic blue selection, square native controls, pixel-era hierarchy |
| Retro Glass | brushed application chrome, glossy navigation, inset glass panes, striped gauges, dark dock |
| Editorial Luxe | double rules, Didone display type, forest actions, antique gold, oxblood danger |
| Organic Modern | warm natural surfaces, olive hairlines, rust alerts, restrained rounded geometry |
| Industrial Utility | squared metal panels, recessed instruments, amber controls, calibrated safety states |
| Technical Blueprint | graph-paper grid, cyan or technical-blue linework, square measured controls |
| Art Deco | symmetrical stepped frames, metallic keylines, teal/gold/oxblood jewel controls |
| Clay | continuous sculpted slab, shallow seams, mineral pigments, hand-pressed components |
| Data Terminal | one-pixel cells, monospaced type, strict semantic command colors, bracketed actions |
| Paper Editorial | physical manual sheet, ruled print grid, cream or ink stock, limited spot colors |
| Neo Noir | cinematic rules, skewed trapezoids, amber/teal/red/violet signals, film-grain material |

For templates containing both light and dark reference panels, both panels define the paired fallback modes. For single-mode references, the dark or light counterpart must preserve the same geometry and semantic hierarchy while using an accessible inverse material treatment. Contrast mode intensifies the same identity rather than becoming a third unrelated design.

## Shared Accessibility Behavior

The shared selectors in `native-elements.css`, generated components, and content-overflow coverage must target `[data-ui][data-mode]`, not require `[data-theme]`.

Every supported state must retain:

- visible `:focus-visible` indicators;
- readable disabled, read-only, valid, invalid, loading, selected, and indeterminate states;
- reduced-motion behavior;
- `prefers-contrast: more` reinforcement;
- `forced-colors: active` interoperability;
- native controls that inherit the active preset geometry and resolved semantic paint;
- semantic `.ui-*` components that match their prefixed counterparts.

WCAG contrast gates remain at the repository's existing thresholds. The contrast matrix must cover explicit themes and every no-theme fallback state.

## Implementation Boundaries

- Preserve all public preset IDs, prefixes, class names, entrypoints, manifest schema, and cascade layer order.
- Preserve unrelated dirty working-tree changes.
- Do not introduce a new runtime dependency or JavaScript theming requirement.
- Do not create new artwork; retained references and existing real assets remain the visual source.
- Generated distribution files are updated only through `npm.cmd run build`.
- No deployment, publication, push, or branch rewrite is part of this work.

## Verification Evidence

Completion requires fresh evidence for:

1. Static fallback/theme ownership contracts for all 20 presets and 23 semantic color roles.
2. Shared native and semantic coverage with and without `data-theme`.
3. WCAG contrast for 1,200 explicit theme states plus 60 fallback states.
4. Focus, reduced-motion, `prefers-contrast`, and forced-colors behavior.
5. Per-preset computed-style theme switching across representative prefixed, semantic, and native elements.
6. Reference-fidelity traits across typography, density, geometry, material, feedback, and data surfaces.
7. Regenerated default, visual-only, focused visual, and compatibility bundles.
8. Final lint, unit, contrast, compatibility, ownership, package, focused browser, axe, and visual checks.
