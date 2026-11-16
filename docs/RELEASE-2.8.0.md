# UI Style Kit CSS 2.8.0

Style Studio replaces the repetitive demo with working examples, a dense catalog of 74 component options, authored style details, and isolated comparison. Canonical usk-* markup, copy controls, scoped RGB editing, CSS/setup export, and optional CDN/npm icon installation make the demo useful as a real integration tool. The icon default remains Minimal SaaS monochrome, with style-specific and themed options.

Layout Style CSS owns responsive composition; UI Style Kit owns paint and typography; Interactive Surface owns interaction feedback; Motion owns lifecycle effects. Local demo CSS remains 2,243 bytes. Paper textures are byte-identical external assets rather than repeated data URLs. Lazy specimens, cached dependencies, and transactional frame updates reduce loading work and keep failure recovery coherent.

Native Clay materials consume their editable public RGB channels, including the finished primary pigment and readable dark hover ink. Choice groups wrap without shrinking 44px switch tracks. Persisted browser navigation retains preview DOM, drafts, listeners, and pending save completion. These fixes have focused browser and contract regressions.

This is a compatible minor release. Existing CSS entrypoints, preset-prefixed classes, generated ui-* aliases, 20 presets, 25 named palettes, and Safari 16 support remain. One preset per document is the supported contract; Studio comparisons use isolated frames. Package runtime remains CSS-only.

## Verification and publication

Run the normal release:verify gate on the frozen candidate before committing or creating the PR. Granular documentation comes from npm run docs and is checked by npm run docs:check. The earlier affected implementation gate passed 91 unit checks and 40 Chromium browser cases; the release gate supplies the broader publication proof. The exhaustive three-engine visual matrix is not a default release gate.

After the release commit is merged into main and its CI is green, push the signed v2.8.0 tag. Verify Release Version Alignment, the exact GitHub Release, protected npm publication, registry metadata, and downloaded package bytes independently. Publication and live demo deployment are separate acceptance surfaces. Historical releases remain immutable.
