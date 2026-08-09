# Changelog

All notable changes to **UI Style Kit CSS** will be documented here.

## [Unreleased]

### Added

- Added the public 12-token shared semantic producer contract and its machine-readable manifest inventory for companion and third-party consumers.
- Implemented the manifest-backed semantic component API with 29 exact `.ui-*` selectors, context-constrained `data-ui-variant` values, and unchanged-markup runtime switching across all 11 presets.
- Added a persistent semantic component demo whose DOM nodes and classes remain stable through every preset switch.
- Documented native `<dialog>` as the neutral modal/dialog fallback without inventing `.ui-modal` or `.ui-dialog` selectors.

### Changed

- Clarified that generated default, visual, with-bridge, and focused entrypoints provide semantic aliases, while raw preset sources, partial extras, and deprecated structural aliases remain prefixed compatibility or advanced APIs.
- Preserved `.ui-spinner` and `.ui-tooltip` as retained hooks while generating the other 27 selectors from existing preset declarations.

## [2.1.0] - 2026-07-20

### Added

- Added visual-only full, minified, and focused preset entrypoints for applications that own their structural layout.
- Added `manifest.json` with preset entrypoints, themes, modes, composed class capabilities, deprecated structural suffixes, and native-part ownership classifications.
- Added a canonical `interactive-surface-theme.css` bridge that supplies public tokens and paint while leaving interaction mechanics to `interactive-surface-css/state-core.css`.
- Added CSS Tree AST contract coverage for generated class retention, export targets, cascade layers, and bridge ownership boundaries.
- Added exact `@axe-core/playwright` representative scans and a sharded 990-combination UI matrix across presets, themes, modes, and browser engines.
- Added manifest-backed demo control data and real `showModal()` dialog coverage for themed native backdrop behavior.

### Changed

- Rebuilt combined output around the ordered `theme_colors`, `native_elements`, `components`, `presets`, and `compat_layout` layers.
- Moved shared component foundations into `components` and isolated retained prefixed structural helpers in `compat_layout`.
- Formatted generated CSS through Lightning CSS and pinned `css-tree` exactly for deterministic AST partitioning.
- Increased native and custom checkbox/radio targets to the WCAG 2.2 24px minimum and tightened demo accessibility semantics.

### Deprecated

- Deprecated the `page`, `container`, `section`, `grid`, `stack`, `cluster`, and `split` prefixed structural suffixes for removal in v3.
- Deprecated the stateful `interactive-surface-bridge` and `with-bridge` integration paths while preserving their existing behavior.

## [2.0.4] - 2026-07-20

### Added

- Restored the exported `content-overflow.css` shared layer for standalone style imports.
- Added rendered regression coverage for long text containment and responsive orientation checks across mobile, tablet, desktop, portrait, and landscape viewports.

### Changed

- Replaced the regex minifier with exactly pinned Lightning CSS parsing while preserving generated bundle banners and entry points.
- Aligned package metadata, generated bundle banners, demo structured data, and release documentation to `2.0.4`.
- Reconnected every standalone UI preset to the shared content-overflow layer so long words, URLs, and token strings stay inside layout wrappers.

### Fixed

- Preserved descendant combinators and required whitespace around binary operators in generated `calc()` values.
- Moved `::file-selector-button` and `::backdrop` outside `:where()` arguments so Chromium accepts and applies the native rules.
- Routed Brutalism, Cyberpunk, Y2K, and Retro Glass status foregrounds through their documented `on-success`, `on-warning`, and `on-danger` tokens.

## [2.0.3] - 2026-07-11

### Added

- Added an active theme and mode token workbench to the demo for editing concrete `--usk-*-rgb` values live and copying drop-in theme override CSS.
- Added copy buttons with clipboard icons and tooltips to demo code blocks.
- Added README Mermaid diagrams for the three-library ecosystem and the shared token flow.
- Added demo resource links for GitHub, GitHub Wiki, npm, Interactive Surface CSS, and Layout Style CSS.
- Added search, social sharing, web manifest, sitemap, and structured-data metadata for the published demo.

### Changed

- Aligned package metadata for `2.0.3` after the manual `2.0.2` npm release.
- Split duplicated demo CSS and JavaScript into shared `demo/demo.css` and `demo/demo.js` entrypoint assets.
- Expanded stylelint coverage to include extracted demo CSS.
- Updated the demo HTML with static fallback content so crawlers and no-JavaScript users can read the core library description before JavaScript renders the interactive showcase.

### Removed

- Removed unused tracked image assets and stale local release/test artifacts from the repo.

## [2.0.2] - 2026-07-08

### Added

- Added the demo favicon pack, root Pages manifest wiring, and package-demo manifest wiring so release demos have consistent browser icons.

### Changed

- Clarified the UI systems wiki with the full style matrix, core class suffixes, utility tiers, generic loading and tooltip hooks, and Interactive Surface bridge hooks.
- Polished README release guidance, CDN pinning, and token-model wording for the `2.0.2` maintenance release.
- Refreshed development tooling for style linting and Playwright verification without changing the public CSS API.

### Security

- Added dependency maintenance coverage for the transitive development-only `js-yaml` advisory path used by stylelint configuration loading.

## [2.0.1] - 2026-06-22

### Added

- Added visible tooltip utilities for every UI preset through `<prefix>-tooltip`, `<prefix>-tooltip-arrow`, `.ui-tooltip`, `[role="tooltip"]`, and `[data-tooltip]`.
- Added demo coverage for tooltips, switch-style Interactive Surface bridge controls, padded table showcases, combined controls/loading/progress displays, and more useful utility samples.
- Added the exported `native-elements.css` shared fallback layer for standalone style imports.

### Changed

- Aligned package metadata, generated dist banners, and release documentation to publish from the `v2.0.1` tag after the previous release tag was retired.
- Moved concrete color scheme values into the shared `styles/theme-colors.css` layer.
- Updated all UI systems to alias shared `--usk-*` RGB roles back to their public style prefixes.
- Reduced generated bundle size by removing duplicated per-UI color scheme blocks from `dist`.
- Kept prefixed functional tokens such as `--saas-primary`, `--neo-card-bg`, and `--rg-on-primary` for component styling.
- Refactored the Interactive Surface bridge to inherit shared `--usk-*` roles, expose visible hover/active/focus state layers, and support `data-surface-level="1"`, `"2"`, and `"3"` surface depth hooks.
- Moved the bridge attach switch into the demo bridge section so the opt-in behavior is documented where it is exercised.
- Refactored native HTML fallback rules into one shared `styles/native-elements.css` layer while each preset now supplies only visual token mappings through `--usk-native-*`.
- Polished the demo component layout at desktop, tablet, and square viewports with denser controls, richer badge examples, padded native controls, and balanced showcase rows.
- Moved the demo Usage section to match the primary navigation order and tightened the mobile controls showcase into a readable single-column flow.
- Updated the Interactive Surface bridge docs to keep the bridge opt-in while `interactive-surface-css` is revised separately.

### Breaking

- Concrete scheme overrides should now target shared `--usk-*-rgb` roles instead of redefining one copy per UI prefix.
- Standalone style imports rely on `styles/theme-colors.css` and `styles/native-elements.css`; import those shared layers first if your CSS pipeline does not resolve `@import`.

## [1.2.2] - 2026-06-05

### Added

- Added package exports for the optional `interactive-surface-bridge` stylesheet.
- Added unit, lint, e2e, and dry-run pack scripts expected by CI and release workflows.

### Changed

- Added generated `with-bridge` dist CSS for consumers that want the Interactive Surface bridge in the same import.
- Aligned release metadata, package checks, and documentation for the `1.2.2` release.

## 0.2.0

### Changed

- Added cascade layer wrapping to all UI style systems so consumer CSS can override the library more predictably.
- Fixed light-mode primary button contrast for `midnight-gold` and `cyber-lime` across all UI systems.
- Added native HTML and CSS accessibility coverage to `brutalism`, `cyberpunk`, `y2k`, and `retro-glass` for parity with the newer UI systems.
- Added build, package, and contrast-check scripts.
- Expanded package exports to include both extensionless and `.css` import paths.
- Removed runtime dependencies; this is a CSS-only consumer package.

## 0.1.0

- Initial library package with 11 UI style systems, 10 shared color themes, and light/dark/contrast modes.
