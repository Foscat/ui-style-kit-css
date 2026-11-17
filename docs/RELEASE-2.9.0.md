# UI Style Kit CSS 2.9.0

Owner: Sanderson Technology Enterprises LLC

Explicit guided corner choices now apply consistently to ordinary controls and semantic surfaces across the twenty presets. The opt-in public API is `data-usk-corners="none|small|medium|large"` on the existing `data-ui` / `data-mode` root. Omitting the attribute restores the preset's authored defaults. Avatars and decorative clipping retain their original shapes. No layout, motion or color ownership changes.

The module is included in standard, visual and focused preset distributions and exported as `ui-style-kit-css/guided-corners.css`. Its closed values and cascade position are declared in the manifest. The Art Deco action rule honors the explicit choice while retaining its existing fallback.

Selected Chromium cases cover all twenty presets and all four choices independently in light, dark and contrast modes, including default restoration and avatar preservation. Focused CSS ownership, lint, generated references and package checks qualify the source; no whole test suite or CI script is used. Publication requires a signed exact source, merged canonical pull request and STE-Adam's current independent approval. The artifact-only publisher performs immutable checksum/public-byte verification and preserves the earlier 2.7.2 continuation unchanged.
