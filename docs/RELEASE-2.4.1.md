# v2.4.1 release preparation

## Scope

UI Style Kit CSS 2.4.1 packages the five shared color themes already merged into
`main`: Signal Yellow, Botanical Green, Cobalt Electric, Stone Graphite, and Walnut
Clay. Each theme provides light, dark, and contrast palettes through the existing
`data-theme` and `data-mode` contract.

The release preserves the v2 selectors and package entrypoints. It does not add or
remove preset identifiers, exports, cascade layers, or companion-library ownership
boundaries.

## Release surfaces

- Package, lockfile, public manifest, web manifests, structured metadata, generated
  CSS banners, compatibility metadata, README, wiki sources, and maintained release
  documentation identify `2.4.1`.
- The changelog records the theme additions, expanded 4,500-case browser matrix,
  demo metadata refresh, and Signal Yellow foreground correction under the dated
  `2.4.1` entry.
- The aligned companion versions remain `interactive-surface-css@1.7.0` and
  `layout-style-css@3.1.0`.

## Verification boundary

Run focused version and compatibility tests after updating source metadata, then run
the repository's final `npm run release:verify` gate. That gate rebuilds generated
assets, lints authored CSS, executes unit and release-smoke browser checks, validates
contrast, compatibility, ownership, package contents, ecosystem preflight, audit,
and the dry-run tarball.

A local green gate does not publish anything. Merge the reviewed release branch into
`main` before creating `v2.4.1`; the tag-alignment workflow creates the GitHub Release,
and the protected npm workflow publishes the immutable tagged package.
