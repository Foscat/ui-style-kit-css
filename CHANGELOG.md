# Changelog

All notable changes to **UI Style Kit CSS** will be documented here.

## [1.2.2] - 2026-06-05

### Added

- Added package exports for the optional `interactive-surface-bridge` stylesheet.
- Added unit, lint, e2e, and dry-run pack scripts expected by CI and release workflows.

### Changed

- Bundled the interactive surface bridge into the generated dist CSS.
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
