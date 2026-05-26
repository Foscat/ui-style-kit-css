# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2026-05-26

### Changed

- Bumped package version to `1.0.4` for a clean npm republish after failed `1.0.2` / `1.0.3` attempts.
- Synced release metadata in `package.json` and `package-lock.json` to `1.0.4`.

## [1.0.3] - 2026-05-26

### Fixed

- Standardized changelog formatting and version notation for the latest patch release entry.
- Replaced legacy demo image references with branded assets (`logo.png`, `assets/seo/social-card.png`).

## [1.0.2] - 2026-05-25

### Added

- `.github/workflows/sync-package-version-with-main.yml` to keep pull request branch versions aligned with `main`.
- `.github/workflows/release-version-alignment.yml` to enforce matching GitHub tag, `package.json`, changelog entry, and npm publish target version.

### Changed

- Bumped package version to `1.0.2`.
- Upgraded `stylelint` from `^16.24.0` to `^17.12.0`.
- Updated GitHub Actions in CI:
  - `actions/checkout` from `v4` to `v6`
  - `actions/setup-node` from `v4` to `v6`

## [1.0.1] - 2026-05-25

### Fixed

- Patched release metadata and demo HTML (`package.json`, `index.html`) for package stability.

## [1.0.0] - 2026-05-24

### Added

- Full project wiki under `wiki/`
- `CODE_OF_CONDUCT.md`
- SEO support files for GitHub Pages demo:
  - `robots.txt`
  - `sitemap.xml`
  - `site.webmanifest`
  - `browserconfig.xml`
  - `.nojekyll`
  - `logo.png`
  - `assets/seo/social-card.png`
- `llms.txt`
- Professional repository scaffolding:
  - `CONTRIBUTING.md`
  - `SECURITY.md`
  - `.editorconfig`
  - `.gitattributes`
  - `.github/workflows/ci.yml`
  - GitHub issue and pull request templates
  - Dependabot config
- Stylelint configuration:
  - `.stylelintrc.json`
  - `.stylelintignore`
  - package scripts and dev dependencies

### Changed

- Expanded `index.html` with comprehensive SEO, social metadata, and JSON-LD structured data.
- Updated README with quality, community, and SEO sections.
