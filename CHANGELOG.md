# Changelog

All notable changes to this project will be documented in this file.
Entries are aligned to commits merged into `main` between tagged release points.

## [Unreleased]

### Fixed - Sync workflow push ambiguity

- Fixed `git push` in `.github/workflows/sync-package-version-with-main.yml` to explicitly target branch refs, preventing potential conflicts with tag refs.


## [1.1.1] - 2026-06-01

### Changed - Release readiness

- Bumped package version metadata to `1.1.1` for the next publish target.
- Aligned `package-lock.json` root metadata with `package.json` at `1.1.1`.
- Hardened npm publish automation to validate release tag/version alignment before attempting `npm publish`.
- Updated changelog history alignment notes to reflect tagged release progression.

## [1.1.0] - 2026-06-01

### Added - UI Style Kit bridge

- Added `styles/interactive-surface-bridge.css` to map UI Style Kit tokens to `interactive-surface-css` token hooks.
- Added new package export aliases:
  - `ui-style-kit-css/interactive-surface-bridge`
  - `ui-style-kit-css/styles/interactive-surface-bridge`

### Changed - UI Style Kit bridge

- Included `interactive-surface-bridge.css` in the combined `dist/ui-style-kit.css` and `dist/ui-style-kit.min.css` build pipeline.
- Updated README and wiki setup docs with first-class cross-library integration guidance.
- Added package integrity coverage for interactive surface bridge export and bundling.
- Included release metadata correction commit (`chore(release): bump version to 1.0.4`) in the `1.0.4..v1.1.0` commit range.

## [1.0.4] - 2026-05-26

### Changed - 1.0.4

- Added deployment/build prep updates across CI, publish, and release workflows (`[chore] Build deployment pieces`).
- Synced `package.json` version from `main` (`chore: sync package.json version with main`).

## [1.0.3] - 2026-05-26

### Added - 1.0.3

- Added `.github/workflows/npm-publish.yml` (`Add publish workflow`).

### Changed - 1.0.3

- Updated `package.json` version metadata and changelog formatting for the `1.0.3` line.
- Applied pull request follow-up changelog fix (`Potential fix for pull request finding`).
- Included `package.json` sync commits from automation (`chore: sync package.json version with main`).

## [1.0.2] - 2026-05-25

### Added - 1.0.2

- `.github/workflows/sync-package-version-with-main.yml` to keep pull request branch versions aligned with `main`.
- `.github/workflows/release-version-alignment.yml` to enforce matching GitHub tag, `package.json`, changelog entry, and npm publish target version.

### Changed - 1.0.2

- Bumped package version to `1.0.2`.
- Upgraded `stylelint` from `16.26.1` to `17.12.0`.
- Updated GitHub Actions in CI:
  - `actions/checkout` from `v4` to `v6`
  - `actions/setup-node` from `v4` to `v6`
- Updated release alignment notes and changelog formatting during review feedback.

## [1.0.1] - 2026-05-25

### Fixed - 1.0.1

- Patched release metadata and demo HTML (`package.json`, `index.html`) for package stability.

## [1.0.0] - 2026-05-24

### Added - 1.0.0

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

### Changed - 1.0.0

- Expanded `index.html` with comprehensive SEO, social metadata, and JSON-LD structured data.
- Updated README with quality, community, and SEO sections.
