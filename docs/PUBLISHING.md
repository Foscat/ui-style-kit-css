# Publishing Guide

## Dry run

```bash
npm run release:verify
```

`npm run release:verify` is the non-publishing release gate. It runs `npm run check`, `npm run test:e2e`, `npm run test:axe`, `npm run test:visual`, `npm run test:matrix`, `npm run check:ecosystem:packs`, `npm audit --audit-level=moderate`, and `npm run pack:dry-run`.

`npm run check` rebuilds dist CSS, runs stylelint, executes package, class API, shared theme-color, and vendor-prefix unit checks, validates core text/link contrast pairs and filled component `on-*` contrast pairs, and confirms package metadata. Browser gates cover regular demo flows, representative Axe scans, curated visual smoke checks, and the sharded 990-combination matrix. `npm run check:ecosystem:packs` verifies standalone, pairwise, and all-three packed package compatibility for the canonical visual/theme/state/layout imports and the deprecated bridge imports in both supported matrices. `npm run pack:dry-run` shows the exact files that would publish.

`npm run check:ecosystem:current` packs this repository and the sibling `../Layout-Style-CSS` and `../Interactive-Surface-CSS` checkouts. It extracts imports from the explicitly maintained current documentation in all three repositories and resolves every documented specifier from the installed tarballs. Deprecated UI bridge guides are validated as a separate supported-compatibility class; changelogs and Layout migration guides are reviewed historical material rather than current setup. Use `-- --ui-spec <specifier>`, `-- --layout-repo <path>`, `-- --layout-spec <specifier>`, `-- --interactive-spec <specifier>`, `-- --interactive-repo <path>`, `-- --layout-docs-repo <path>`, or `-- --interactive-docs-repo <path>` when validating different package or documentation sources.

`npm run check:ecosystem:minimum` downloads and repacks the declared minimum published runtime versions: `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`. Those tarballs predate the additive shared-manifest policy introduced on the coordinated branches, so the minimum matrix validates their exact installed versions and published CSS entry points; current packed heads retain the stricter manifest-schema and current-documentation checks. `npm run check:ecosystem:packs` runs current first and minimum second.

Both matrices install fresh tarball consumers for UI only, Interaction only, Layout only, every pair, and all three. Chromium then checks selected theme paint, native and prefixed components, interaction focus/disabled/loading/selected/persistent states, Layout wrappers/primitives/recipes/personalities, console cleanliness, and an empty external-request log. Three text-free baselines under `tests/snapshots/clean-install/` cover the highest-risk integrated combinations. To intentionally refresh them, run the current checker with `--update-snapshots`, inspect all three images, and rerun without that flag.

The PR integration and npm-publish workflows read the companion repository and immutable revision pins from `ecosystem-compatibility.json`, then pack those coordinated Task 4 artifacts. Advance those pins whenever later work changes a companion contract; Task 9/final release work is responsible for replacing these interim fixture revisions with final heads.

Before expecting a UI pull request or release verification to pass, push the Interactive Surface and Layout Style commits, verify both pinned SHAs as remote commit objects, then push the UI branch and verify its CI. The workflows enforce that order with a remote-object fetch preflight and do not fall back to mutable branches or registry packages.

`npm run build` uses exactly pinned CSS Tree parsing and Lightning CSS formatting/minification. Generated minified bundles retain the release banner while preserving grammar-sensitive selector and `calc()` whitespace.

The npm artifact is library-focused: `dist/`, `styles/`, docs, and metadata. Demo pages, favicon source assets, and social preview images remain checked in for GitHub Pages but are excluded from the tarball to keep package installs small.

## Publish

No package, tag, or registry release occurs without explicit approval.

The completed 2.0.4 correctness hotfix is historical context. Do not create replacement tags or registry releases merely to verify the coordinated compatibility contract.

Run the coordinated checked-out ecosystem proof from this repository:

```bash
npm run check:ecosystem:packs -- --layout-repo ../Layout-Style-CSS --interactive-repo ../Interactive-Surface-CSS --layout-docs-repo ../Layout-Style-CSS --interactive-docs-repo ../Interactive-Surface-CSS
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
