# Publishing Guide

## Dry run

```bash
npm run release:verify
```

`npm run release:verify` is the non-publishing release gate. It runs `npm run check`, `npm run test:e2e`, `npm run test:axe`, `npm run test:visual`, `npm run test:matrix`, `npm run check:ecosystem:packs`, `npm audit --audit-level=moderate`, and `npm run pack:dry-run`.

`npm run check` rebuilds dist CSS, runs stylelint, executes package, class API, shared theme-color, and vendor-prefix unit checks, validates core text/link contrast pairs and filled component `on-*` contrast pairs, and confirms package metadata. Browser gates cover regular demo flows, representative Axe scans, curated visual smoke checks, and the sharded 990-combination matrix. `npm run check:ecosystem:packs` verifies standalone, pairwise, and all-three packed package compatibility for the canonical visual/theme/state/layout imports and the deprecated bridge imports. `npm run pack:dry-run` shows the exact files that would publish.

By default, `npm run check:ecosystem:packs` packs this repository, packs the sibling `../Layout-Style-CSS` checkout, and packs the published `interactive-surface-css@1.5.0` artifact. It extracts imports from the explicitly maintained current documentation in all three sibling repositories and resolves every documented specifier from the installed tarballs. Deprecated UI bridge guides are validated as a separate supported-compatibility class; changelogs and Layout migration guides are reviewed historical material rather than current setup. Use `-- --ui-spec <specifier>`, `-- --layout-repo <path>`, `-- --layout-spec <specifier>`, `-- --interactive-spec <specifier>`, `-- --layout-docs-repo <path>`, or `-- --interactive-docs-repo <path>` when validating different package or documentation sources.

`npm run build` uses exactly pinned CSS Tree parsing and Lightning CSS formatting/minification. Generated minified bundles retain the release banner while preserving grammar-sensitive selector and `calc()` whitespace.

The npm artifact is library-focused: `dist/`, `styles/`, docs, and metadata. Demo pages, favicon source assets, and social preview images remain checked in for GitHub Pages but are excluded from the tarball to keep package installs small.

## Publish

No package, tag, or registry release occurs without explicit approval.

The completed 2.0.4 correctness hotfix is historical context. The current companion set is already published as `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`; do not create replacement tags or registry releases merely to verify it.

Run the registry-only ecosystem proof from this repository:

```bash
npm run check:ecosystem:packs -- --ui-spec ui-style-kit-css@2.1.0 --layout-spec layout-style-css@3.0.0 --interactive-spec interactive-surface-css@1.5.0
```

```bash
npm publish
```

`prepublishOnly` runs `npm run release:verify`, so a direct `npm publish` still has the full release gate. For GitHub releases, create or dispatch a release for the matching package tag, such as `v2.1.0`. The release workflows verify that `package.json`, `package-lock.json`, `CHANGELOG.md`, and generated dist banners are aligned before publishing.

## Versioning

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

Use patch for fixes, minor for new themes/styles, and major for breaking public API changes. The 2.x release line is major because color-scheme authoring moved from per-UI `--<prefix>-*-rgb` blocks to shared `--usk-*-rgb` roles in `styles/theme-colors.css`.
