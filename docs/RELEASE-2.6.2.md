# v2.6.2 release candidate

UI Style Kit CSS 2.6.2 is a compatible patch for the interactive demo. The package's public CSS entrypoints, presets, and theme inventory remain unchanged.

## Changed

- The options toolbar stays visible during page scrolling at narrow and wide viewport sizes. Section links land below the toolbar.
- Optional preset specimen modules load when their preset is selected, reducing the initial demo JavaScript transfer.
- Theme and mode changes update palette-dependent sections while preserving unrelated demo controls and user-entered values.
- The toolbar uses shared semantic field and select styles with one neutral platform indicator rule in local CSS.

## Verification

Run the repository's build, lint, focused demo tests, package checks, and Chromium release gate for the final review commit. Confirm the generated demo asset hashes and release version surfaces before merging. Tagging, GitHub Release creation, and npm publication follow the separate protected release workflow in [PUBLISHING.md](PUBLISHING.md).
