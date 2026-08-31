# Preset Identity System Refinement Design

Date: 2026-08-29
Status: Approved and implemented for the 2.3.0 release candidate
Target release: `ui-style-kit-css@2.3.0`

## Purpose

Refine all 20 UI presets so their public components and native-element fallbacks read as coherent design systems rather than a shared component library with isolated `clip-path` changes. The work corrects the demo regressions shown in the August 29 screenshots while preserving the existing public class API, theme names, modes, token roles, and companion-library compatibility.

## Problem Statement

The current 2.3.0 candidate gives many presets a distinct cut-button polygon, spinner, or card decoration, but the identity is not carried consistently across the rest of the component vocabulary.

The most visible mechanisms are:

- The demo combines `button-outline-heavy` and `button-cut` on every `View Usage` action. This makes the outlined action inherit the same polygon-first treatment as the filled service-card action.
- Most `button-outline-heavy` rules share the same transparent background, two-pixel primary border, and hover fill. Only a few presets add meaningful material or depth differences.
- Native buttons and dialogs are driven by one shared geometry recipe. Preset variables alter radius and color, but do not establish a complete preset-specific control or surface identity.
- Most metrics use one generic card recipe. Bento's six-column tile helper can become too narrow inside the demo container, causing labels to wrap into unreadable columns.
- Several service-card actions stretch across the card because grid items stretch by default. A different polygon on the same full-width bar does not create a meaningfully different component.
- The existing tests require a clipped CTA and distinct composite signatures, but do not prove that the same identity vocabulary appears across filled actions, outlined actions, surfaces, metrics, and native fallbacks.

## Goals

1. Give every preset a recognizable and internally consistent component identity.
2. Keep filled and outlined CTAs visibly related without making them identical.
3. Make CTA width and alignment intentional for each preset family.
4. Carry the identity into service cards, media scrims, metrics or tiles, feature strips, callout bars, dialogs, and native buttons.
5. Correct Bento metric wrapping and other demo containment problems without changing consumer heading scales.
6. Preserve all public classes, modes, themes, focused exports, deprecated structural helpers, bridge exports, and companion ownership order.
7. Prevent future drift with a manifest-complete identity registry and focused contracts.

## Non-Goals

- No new public class names.
- No removed or renamed classes, tokens, themes, modes, or exports.
- No color-theme redesign. Components continue to consume the active theme tokens.
- No changes to companion-library ownership or bridge activation.
- No commit, push, tag, GitHub release, or npm publication.
- No broad demo redesign outside the affected component specimens.

## Design Principles

Each preset is defined across four connected axes:

1. **Silhouette:** corner logic, contour, framing, and control proportion.
2. **Border rhythm:** weight, doubling, offset, technical marks, or restrained hairlines.
3. **Material and depth:** flat, raised, inset, frosted, glossy, printed, metallic, or luminous treatment.
4. **Composition:** content alignment, action width, density, and placement.

Color remains independent. The active color scheme supplies semantic tokens; the UI preset supplies the geometry and material treatment.

## Architecture

### Manifest-driven identity registry

Add a JavaScript identity registry keyed by the 20 `manifest.json` preset IDs. Each entry records:

- preset ID and prefix;
- human-readable identity description;
- CTA composition family;
- required component selectors;
- stable identity markers for silhouette, border, depth, and alignment;
- expected native-element treatment markers.

The registry is an internal build and test source of truth, not a new public API. JavaScript exports and helpers will use JSDoc-compatible comments.

The registry will be validated against `manifest.json` in both directions: every manifest preset must have exactly one identity entry, and no identity entry may reference a removed preset. Tests will compute a normalized identity signature from the authored CSS and reject duplicate signatures.

Authored CSS remains in `styles/`. The registry will not hide arbitrary CSS declaration strings inside JavaScript. Instead, it describes the required design vocabulary and lets focused contracts validate the explicit rules in each preset stylesheet. Generated `dist/` files continue to come only from the existing build pipeline.

### CTA role separation

The commercial demo will use:

- `button-primary button-cut` for the filled `Explore` service action;
- `button-outline-heavy` for the outlined `View Usage` callout action.

The outlined action will no longer stack `button-cut`. Each preset's `button-outline-heavy` rule will receive its own related geometry, border, material, and alignment treatment. The filled and outlined actions will share a motif, not an identical silhouette.

The public modifiers remain independently composable. Existing consumer markup that intentionally combines them will continue to work.

### CTA composition families

CTA size and placement will follow the component identity rather than default grid stretching:

- **Precise and compact:** Minimal SaaS, Editorial Luxe, Industrial Utility, Technical Blueprint, Data Terminal, and Paper Editorial use content-sized actions aligned to the reading edge.
- **Tile and block:** Bento, Bauhaus, and Brutalism use deliberate block treatments with bounded widths, hard alignment, and stronger structural weight.
- **Soft and sculpted:** Neumorphism, Organic Modern, Clay, and Y2K use compact centered actions with raised, inset, pebble, inflated, or glossy material cues.
- **Elongated and atmospheric:** Retrofuturism, Cyberpunk, Retro Glass, and Neo Noir use controlled console or cinematic proportions without defaulting to the full card width.
- **Expressive and physical:** Maximalist and Tactile use offset poster-like or keycap-like actions with deliberate depth.

Mobile layouts may stretch actions only when the available width requires it. The action height, label flow, and focus indicator must remain intact.

## Preset Identity Matrix

| Preset | Connected component identity |
| --- | --- |
| Minimal SaaS | Restrained single-corner fold, fine outline, low elevation, compact left-aligned controls. |
| Bento | Stepped tile corners, compact block proportions, nested tile borders, bounded block actions. |
| Maximalist | Skewed poster silhouette, layered fill, offset decoration, pronounced playful shadow. |
| Bauhaus | Asymmetric primary geometry, hard edges, opposing cuts, high-contrast structural blocks. |
| Tactile | Shallow chamfered keycap, bevel highlight, pressed depth, physical control spacing. |
| Neumorphism | Soft clipped surface, raised and inset paired shadows, quiet borders, centered controls. |
| Retrofuturism | Elongated console geometry, metallic rim, instrument-like framing, compact display labels. |
| Brutalism | Blunt cut, thick border, hard offset shadow, dense block alignment. |
| Cyberpunk | Multi-notch technical polygon, neon edge, console framing, luminous action emphasis. |
| Y2K | Glossy hexagonal capsule, reflective highlight, playful centered composition. |
| Retro Glass | Frosted angular tab, inner highlight, translucent framing, restrained glass depth. |
| Editorial Luxe | Slim bookplate, hairline or double framing, serif-led hierarchy, compact reading-edge action. |
| Organic Modern | Asymmetric pebble or leaf contour, soft layered depth, relaxed centered composition. |
| Industrial Utility | Octagonal hazard-control geometry, equipment border, compact operational density. |
| Technical Blueprint | Drafting-corner outline, technical ticks or inset rules, precise left alignment. |
| Art Deco | Symmetric chevron ends, double-rule framing, centered ornamental composition. |
| Clay | Inflated clipped pill, chunky soft shadow, compact centered action, sculpted surfaces. |
| Data Terminal | Terminal-bracket silhouette, luminous outline, monospace density, reading-edge command action. |
| Paper Editorial | Ticket or tab notch, inked offset edge, print rules, compact editorial action. |
| Neo Noir | Cinematic slant, high-contrast edge light, atmospheric framing, controlled elongated action. |

## Component Treatment

### Service cards and media scrims

Service cards will use the preset's silhouette, border rhythm, and depth treatment. The action will be explicitly sized and aligned. Media scrims will share the card contour and border treatment while retaining the proven high-contrast caption gradient and inherited caption foreground.

### Metrics and Bento tiles

Metrics will preserve semantic value and label elements while applying preset-specific alignment and framing. Labels must remain readable without character-by-character wrapping.

Bento keeps its large/small tile hierarchy, but the six-column layout will activate only where its container can support it. At smaller container widths it will collapse to a balanced two-column layout, then one column. Tile minimum sizes and text wrapping rules will prevent the narrow cards shown in the screenshot.

### Feature strips and callout bars

Feature strips and callout bars will use the same border and surface language as their preset's service card. The callout action remains visually subordinate to the filled service action but must still be a recognizable member of the same preset.

### Native buttons and dialogs

Preset-scoped native overrides will extend the shared native foundation rather than replace it. They will adjust safe geometry, border, depth, typography, and alignment for unclassed buttons and dialogs.

Aggressive clipping will not be applied to text inputs or to dialog containers when it could cut content or focus indicators. Native controls retain minimum target size, visible focus, contrast roles, disabled behavior, busy-spinner containment, and bridge ownership rules.

## Demo Changes

- Remove `button-cut` from the `View Usage` action.
- Add demo-only test hooks for primary and secondary commercial actions where needed.
- Preserve the two-column commercial grid at desktop and one-column layout on mobile.
- Make style-specific metric specimens container-aware.
- Keep native markup semantic and unclassed so the fallback selectors remain visible.
- Preserve the active color-scheme token artwork and media-scrim contrast fix.

## Compatibility

- Existing class names and combined modifier markup remain valid.
- Preset styles continue to live in the `ui-style-kit.presets` cascade layer and override shared native foundations through scoped selectors.
- Interactive Surface remains responsible for state-core behavior when the bridge is attached.
- Layout Style remains responsible for layout composition outside component-owned internals.
- Focused preset exports and bridge bundles are regenerated from authored styles.
- No theme token role changes are expected.

## Verification Strategy

### Focused static and unit contracts

1. Registry coverage exactly matches all 20 manifest presets and prefixes.
2. Each preset exposes a complete identity signature across:
   - `button-cut`;
   - `button-outline-heavy`;
   - service card or media surface;
   - metric or preset-specific tile;
   - callout bar;
   - native button and dialog treatment.
3. No two presets have the same normalized composite signature.
4. The demo does not stack `button-cut` on `View Usage`.
5. CTA composition declares an intentional width and alignment strategy.
6. Bento contains container-aware large/small tile fallbacks.
7. Public API, containment inventory, contrast, package, and generated-bundle contracts remain green.

### Rendered geometry and accessibility

When the approved browser surface is available, verify all 20 presets at 1440px, 1024px, and 390px:

- filled and outlined actions are visibly related but distinct;
- action labels do not become vertical or overflow;
- metrics and Bento tiles do not collapse into narrow columns;
- dialogs and native buttons remain contained;
- focus indicators remain visible around clipped or framed controls;
- light, dark, contrast, reduced-motion, disabled, busy, and keyboard states remain usable;
- no page-level horizontal overflow is introduced.

If browser access remains blocked by the active browser policy, static and build evidence will be reported separately and rendered acceptance will remain explicitly unverified.

### Final release gate

After focused checks and distribution regeneration, run the complete release gate only once at the end:

1. `npm.cmd run release:verify`
2. `git diff --check`
3. package tarball inspection
4. version-surface and generated-size synchronization checks
5. final working-tree report

## Acceptance Criteria

- All 20 presets have intentional, recognizable, and internally consistent component identities.
- The `Explore` and `View Usage` actions no longer look like the same generic clipped CTA.
- The five screenshot regressions are addressed at their underlying library or demo mechanism.
- Bento metrics remain readable at desktop, tablet, and mobile container widths.
- Native buttons and dialogs visibly inherit preset identity without losing accessibility.
- No public API is removed or renamed.
- Focused tests and the final local release gate pass, with rendered-browser limitations reported honestly.
- The final handoff remains an uncommitted local 2.3.0 release candidate.
