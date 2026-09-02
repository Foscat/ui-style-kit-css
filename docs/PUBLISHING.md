# Publishing Guide

## 2.4.0 release workflow

Prepare `ui-style-kit-css@2.4.0` on its release branch, open a pull request against `main`, and merge only after the complete gate is green. The aligned companion set is `layout-style-css@3.1.0` and `interactive-surface-css@1.6.0`.

Do not push `v2.4.0` before the reviewed release commit is on `main`. A pushed version tag runs Release Version Alignment, which validates the tag/package/changelog contract and creates the GitHub Release; publishing that release triggers the protected npm workflow.

Release Version Alignment owns the expensive browser release gate: Playwright demo coverage, curated visual checks, the sharded UI matrix, and the full clean-install ecosystem matrix. The protected npm workflow intentionally does not rerun those browser gates; it revalidates the immutable tag, package contracts, browser-free compatibility checks, companion commit reachability, the explicit release preflight with `--skip-clean-install`, npm token presence, npm owner authorization, and registry state before publishing.

## Dry run

```bash
npm run release:verify
```

`npm run release:verify` is the non-publishing release gate. It runs `npm run check`, `npm run test:e2e`, `npm run test:axe`, `npm run test:visual`, `npm run test:matrix`, the explicit UI-candidate release preflight, `npm audit --audit-level=moderate`, and `npm run pack:dry-run`.

`npm run release:preflight` validates the shared manifests and compatibility contract, queries npm for every exact minimum/current version, resolves every export from the candidate tarball, checks maintained documentation against installed packages, and reuses the current/minimum clean-install browser matrix. Normal UI preflight remains strict and queries `ui-style-kit-css@2.4.0` alongside every other documented exact version. The release workflows pass `--candidate-package ui-style-kit-css`, which excludes only that exact current version while it is absent from npm and still requires every published minimum and companion version. The gate performs no publish, tag, release, or deployment mutation and is therefore safe to execute on pull requests.

`npm run check` rebuilds dist CSS, runs stylelint, executes package and API contracts, validates all theme/mode contrast pairs, enforces the Browserslist compatibility contract through `check:compat`, verifies CSS ownership, and confirms package metadata. Browser gates cover regular demo flows, representative Axe scans, curated visual checks, and the sharded 3,600-combination matrix. `npm run check:ecosystem:packs` verifies standalone, pairwise, and all-three packed package compatibility for canonical visual/theme/state/layout imports and deprecated bridge imports in both supported matrices. `npm run pack:dry-run` shows the exact files that would publish.

`npm run check:ecosystem:current` packs this repository and the sibling `../Layout-Style-CSS` and `../Interactive-Surface-CSS` checkouts. It extracts imports from the explicitly maintained current documentation in all three repositories and resolves every documented specifier from the installed tarballs. Deprecated UI bridge guides are validated as a separate supported-compatibility class; changelogs and Layout migration guides are reviewed historical material rather than current setup. Use `-- --ui-spec <specifier>`, `-- --layout-repo <path>`, `-- --layout-spec <specifier>`, `-- --interactive-spec <specifier>`, `-- --interactive-repo <path>`, `-- --layout-docs-repo <path>`, or `-- --interactive-docs-repo <path>` when validating different package or documentation sources.

`npm run check:ecosystem:minimum` downloads and repacks the declared minimum published runtime versions: `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`. Those tarballs predate the additive shared-manifest policy introduced on the coordinated branches, so the minimum matrix validates their exact installed versions and published CSS entry points; current packed heads retain the stricter manifest-schema and current-documentation checks. `npm run check:ecosystem:packs` runs current first and minimum second.

The current matrix checks `ui-style-kit-css@2.4.0` as the active candidate only while its exact npm version is absent, `interactive-surface-css@1.6.0` as a published release, and `layout-style-css@3.1.0` as a published release. The minimum published matrix remains `ui-style-kit-css@2.1.0`, `interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`.

Both matrices install fresh tarball consumers for UI only, Interaction only, Layout only, every pair, and all three. Chromium then checks selected theme paint, native and prefixed components, interaction focus/disabled/loading/selected/persistent states, Layout wrappers/primitives/recipes/personalities, console cleanliness, and an empty external-request log. Three text-free baselines under `tests/snapshots/clean-install/` cover the highest-risk integrated combinations.

Snapshot verification decodes PNG pixels, requires exact dimensions, ignores pixelmatch-classified antialias noise, uses a `0.1` color threshold, and permits at most `0.25%` differing pixels. The committed fixtures render at 720-721 by 261 pixels and therefore allow 469-470 changed pixels while rejecting the tested 42% meaningful change. A mismatch retains both `SCENARIO-actual.png` and `SCENARIO-diff.png` in the reported safe temporary directory. CI only validates committed baselines and never passes the generation flag. To intentionally refresh them locally, run the current checker with `--update-snapshots`, inspect all three images, and rerun without that flag.

The PR integration and npm-publish workflows read the companion repository and immutable revision pins from `ecosystem-compatibility.json`, then pack those coordinated reviewed artifacts. Advance those pins whenever a later release changes a companion contract. The current values pin the published Interactive Surface CSS merge at `b50a60d8ffd804d8227b1a16903c394556b88511` and the published Layout Style CSS merge at `afcb1fdf70d4635e35739e621ee1598400fed103`.

Use this exact bootstrap and merge sequence:

1. Verify the published Interactive Surface CSS and Layout Style CSS merge commits remain remotely reachable.
2. Update and review the final UI companion pins against those immutable merge commits.
3. Push the final UI branch, rerun its explicit UI-candidate ecosystem preflight, and merge UI with a merge commit.
4. Do not squash or rebase away reviewed release commits that remain part of the pinned verification history.

The workflows enforce immutable remote-object reachability and do not fall back to mutable branches or registry packages. The stable bootstrap ref lets companion workflows load the reviewed preflight implementation before the final UI commit references their heads.

`npm run build` synchronizes manifest-driven component and overflow inventories and uses exactly pinned CSS Tree parsing and Lightning CSS formatting/minification. Every transform resolves the package Browserslist policy through `browserslistToTargets`. Generated minified bundles retain the release banner while preserving grammar-sensitive selector and `calc()` whitespace.

The npm artifact is library-focused: `dist/`, `styles/`, docs, and metadata. Demo pages, favicon source assets, and social preview images remain checked in for GitHub Pages but are excluded from the tarball to keep package installs small.

## Publish

No package, tag, or registry release occurs without explicit approval. Release tags must use the `v<package-version>` form and point to the reviewed commit on `main`.

Run the coordinated checked-out ecosystem proof from this repository:

```bash
npm run check:ecosystem:packs -- --layout-repo ../Layout-Style-CSS --interactive-repo ../Interactive-Surface-CSS --layout-docs-repo ../Layout-Style-CSS --interactive-docs-repo ../Interactive-Surface-CSS
```

```bash
npm publish
```

`prepublishOnly` runs `npm run release:verify`, so a direct `npm publish` still has the full release gate. For GitHub releases, push or dispatch the matching package tag, such as `v2.4.0`, only after the release PR is merged. The release workflows verify that `package.json`, `package-lock.json`, `CHANGELOG.md`, generated dist banners, and ecosystem pins are aligned before publishing. Dispatch the protected npm workflow from the current `main` workflow file when recovering publication for a release that has already passed Release Version Alignment.

The repository `NPM_TOKEN` secret must authenticate to npm as a user that appears in `npm owner ls ui-style-kit-css`. If the token belongs to another npm account or lacks package publish rights, npm may report a misleading registry `E404` at publish time.

## Versioning

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

Use patch for compatible fixes, minor for new themes, presets, component capabilities, or browser-support contracts, and major for incompatible public API changes. The complete preset-specific native-control identity and browser coverage contract make `2.4.0` a minor release.
