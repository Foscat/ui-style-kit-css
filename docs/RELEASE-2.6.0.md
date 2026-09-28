# v2.6.0 release notes

UI Style Kit CSS 2.6.0 is a backward-compatible minor release that improves
component quality and makes every UI style available through a canonical,
self-contained preset import.

## Delivery contract

- Import `ui-style-kit-css` or `ui-style-kit-css/visual.css` when an application
  needs all 20 styles and runtime `data-ui` switching.
- Import `ui-style-kit-css/presets/<name>.css` when an application needs one
  style. Each generated preset file includes its shared foundations and contains
  no unresolved CSS imports.
- Existing `visual/<name>.css`, raw preset, bridge, and v2 compatibility exports
  remain available.
- Runtime selection continues to use `data-ui`; `data-theme` and `data-mode`
  remain independent.

## Component and visual fixes

- Added clean spacing defaults plus explicit `.usk-flush` and `.usk-underline`; Technical Blueprint remains exempt so its measured, adjoining geometry is preserved
  overrides.
- Kept decorative underlines opt-in while preserving semantic edit notation.
- Corrected reference-palette foreground and background pairs, including late
  Bento and Clay contrast cases.
- Repaired semantic checkbox, radio, switch, avatar, chip, icon, and pagination
  geometry without framework-specific CSS.
- Preserved preset-owned radius and clipped-corner identities through the
  Interactive Surface bridge.

## Verification boundary

The release candidate requires focused public-export, manifest, package,
contrast, ownership, semantic-component, and browser checks before the final
release gate. Pull-request checks, the merge commit, GitHub Release, npm
publication, and registry availability are verified as separate stages.
