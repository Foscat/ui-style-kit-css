# Publishing Guide

## Dry run

```bash
npm run release:verify
```

`npm run release:verify` is the non-publishing release gate. It runs `npm run check`, `npm run test:e2e`, `npm run test:axe`, `npm run test:visual`, `npm run test:matrix`, `npm run release:preflight`, `npm audit --audit-level=moderate`, and `npm run pack:dry-run`.

`npm run release:preflight` validates the shared manifests and compatibility contract, queries npm for every exact minimum/current version, resolves every export from the candidate tarball, checks maintained documentation against installed packages, and reuses the current/minimum clean-install browser matrix. It performs no publish, tag, release, or deployment mutation and is therefore the release contract executed on pull requests.

`npm run check` rebuilds dist CSS, runs stylelint, executes package, class API, shared theme-color, and vendor-prefix unit checks, validates core text/link contrast pairs and filled component `on-*` contrast pairs, and confirms package metadata. Browser gates cover regular demo flows, representative Axe scans, curated visual smoke checks, and the sharded 990-combination matrix. `npm run check:ecosystem:packs` verifies standalone, pairwise, and all-three packed package compatibility for the canonical visual/theme/state/layout imports and the deprecated bridge imports in both supported matrices. `npm run pack:dry-run` shows the exact files that would publish.

`npm run check:ecosystem:current` packs this repository and the sibling `../Layout-Style-CSS` and `../Interactive-Surface-CSS` checkouts. It extracts imports from the explicitly maintained current documentation in all three repositories and resolves every documented specifier from the installed tarballs. Deprecated UI bridge guides are validated as a separate supported-compatibility class; changelogs and Layout migration guides are reviewed historical material rather than current setup. Use `-- --ui-spec <specifier>`, `-- --layout-repo <path>`, `-- --layout-spec <specifier>`, `-- --interactive-spec <specifier>`, `-- --interactive-repo <path>`, `-- --layout-docs-repo <path>`, or `-- --interactive-docs-repo <path>` when validating different package or documentation sources.

`npm run check:ecosystem:minimum` downloads and repacks the declared minimum published runtime versions: `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`. Those tarballs predate the additive shared-manifest policy introduced on the coordinated branches, so the minimum matrix validates their exact installed versions and published CSS entry points; current packed heads retain the stricter manifest-schema and current-documentation checks. `npm run check:ecosystem:packs` runs current first and minimum second.

Both matrices install fresh tarball consumers for UI only, Interaction only, Layout only, every pair, and all three. Chromium then checks selected theme paint, native and prefixed components, interaction focus/disabled/loading/selected/persistent states, Layout wrappers/primitives/recipes/personalities, console cleanliness, and an empty external-request log. Three text-free baselines under `tests/snapshots/clean-install/` cover the highest-risk integrated combinations.

Snapshot verification decodes PNG pixels, requires exact dimensions, ignores pixelmatch-classified antialias noise, uses a `0.1` color threshold, and permits at most `0.25%` differing pixels. The committed fixtures render at 720-721 by 261 pixels and therefore allow 469-470 changed pixels while rejecting the tested 42% meaningful change. A mismatch retains both `SCENARIO-actual.png` and `SCENARIO-diff.png` in the reported safe temporary directory. CI only validates committed baselines and never passes the generation flag. To intentionally refresh them locally, run the current checker with `--update-snapshots`, inspect all three images, and rerun without that flag.

The PR integration and npm-publish workflows read the companion repository and immutable revision pins from `ecosystem-compatibility.json`, then pack those coordinated reviewed artifacts. Advance those pins whenever later work changes a companion contract; the current values include the Task 9 release-preflight commits.

Use this exact bootstrap and merge sequence:

1. Push a stable UI bootstrap ref containing `72286fc27e4c3664ab05598a34c4dcf7e8267821`.
2. Push and merge Interactive Surface CSS and Layout Style CSS with merge commits so their reviewed commit SHAs remain reachable.
3. Update and verify the final UI companion pins against those merged companion commits.
4. Push the final UI branch, rerun its ecosystem preflight, and merge UI with a merge commit.
5. Do not squash, rebase, or delete the only remote refs until every pinned commit is reachable through merged ancestry.

The workflows enforce immutable remote-object reachability and do not fall back to mutable branches or registry packages. The stable bootstrap ref lets companion workflows load the reviewed preflight implementation before the final UI commit references their heads.

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
