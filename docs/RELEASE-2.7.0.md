# v2.7.0 release candidate

UI Style Kit CSS 2.7.0 is the minor release candidate for shared component spacing, link presentation, feedback visibility, and preset variant paint. Its entrypoints, 20 presets, and theme inventory remain available. Version 2.6.1 remains published on npm until the release workflow completes.

## Changed

- Added token-backed card spacing and link presentation controls for consumer markup.
- Made generic structural elements neutral and contained shared component content at narrow widths.
- Kept status titles in readable neutral ink while status surfaces, edges, and icons carry success, warning, and danger.
- Centered Paper Editorial status icons and gave native loading indicators the active preset identity.
- Guarded legacy neutral fallback paint so a button with both a preset class and `data-ui-variant` retains its selected variant in 17 affected presets.
- Repaired annotation contrast, star sizing, progress centering, text insets, tooltip variation, controls, and warning actions.
- The options toolbar stays visible during page scrolling at narrow and wide viewport sizes. Section links land below the toolbar.
- Optional preset specimen modules load when their preset is selected, reducing the initial demo JavaScript transfer.
- Theme and mode changes update palette-dependent sections while preserving unrelated demo controls and user-entered values.
- The toolbar uses shared semantic field and select styles with one neutral platform indicator rule in local CSS.
- Updated development-only dependency resolutions for fast-uri, postcss-selector-parser, and source-map-js.

## Verification

The 2.7.0 candidate passed the focused UI correction tests, the remaining 43 Chromium release smoke cases, package export admission, affected CSS lint, and a clean npm advisory audit. The complete release workflow will repeat its protected gates from the merged commit. Confirm generated demo asset hashes, package exports, and version surfaces before merging. Tagging, GitHub Release creation, and npm publication follow the protected workflow in [PUBLISHING.md](PUBLISHING.md).
