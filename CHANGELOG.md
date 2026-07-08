# Changelog

All notable changes to **UI Style Kit CSS** will be documented here.

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
