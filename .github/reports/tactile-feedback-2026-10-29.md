# Feedback visibility repair — 29 October 2026

> Historical verification checkpoint. The [updated coordinated candidate](css-ownership-continuation-2026-10-29.md) supersedes artifact/status claims here; message titles now use normal readable ink.


Messages retain green, amber/yellow and red status fills and edges. Titles use a
shade of the same signal hue, with sufficient contrast in light, dark and
contrast modes. Tactile icon tiles use their material's paired foreground, and
busy buttons have a visible rotating arc. The requested combination checks also
identified and repaired related icon and loader defects in other presets.

This is a local, unpublished `2.6.2` candidate. Existing unrelated edits are
preserved. No commit, push, dependency upgrade, merge or deployment is included.

## Confirmed causes and source repairs

| Finding | Cause | Source repair |
| --- | --- | --- |
| F1: Tactile messages lose status colors | Later material border shorthands overwrite all three leading edges; titles inherit muted paragraph ink. | Exact manifest-generated status rules run after material/default paint. They own status fill, edge and title shade in both prefixed and semantic markup. |
| F2: gold icons disappear on light tiles | Named dark/contrast palettes invert Tactile sidebar materials while icon ink remains pale brass/accent. | Medallions use `--tactile-sidebar-fg`, the foreground paired with that material. |
| F3: native busy spinner appears absent | The Tactile busy glyph is a symmetric closed ring; the native dark ghost action also uses copper fill as ink. | A two-sided arc uses the button foreground, with readable link ink for unfilled native-palette actions. Existing motion preferences remain in effect. |
| F4: other icon failures | Bento, Editorial Luxe and Neo-Noir native palettes use fill colors as foregrounds. Retrofuturism puts pale glyphs over a bright chrome band. | Unfilled tiles use readable link ink. Retrofuturism retains the chrome rim around a stable surface paired with its glyph. Pixel checks reproduced 55 additional failing states before these repairs. |
| F5: other busy glyph failures | Maximalist and Art Deco loader colors are independent of button fill/ink. Clay's colored beads can blend into the button. Neo-Noir's secondary decorative face covers its intended fill. | Busy wedge/segments use current ink; Clay's leading bead follows current ink while other pigments remain. Neo-Noir's skewed secondary face uses its secondary fill. |

Status-title shades mix with black or white, preserving the signal hue instead
of inheriting a warm/cool cast from body ink. Light mode uses a sufficiently dark
shade even on Y2K's native silver surface. Color mixing is feature-guarded;
older engines retain solid status fills and their paired readable foregrounds.

## Verification

The final candidate's affected components are checked across **20 styles × 26
palette choices (25 themes plus native) × 3 modes = 1,560 combinations per
browser**. The three component matrices cover 9,360 component-state checks across
Chromium and WebKit.

- Messages: success/warning/danger fills and leading edges, matching title hue,
  and title/body text contrast of at least 4.5:1. Canonical `.usk-*`, compatibility
  `.ui-*` and preset-prefixed markup are covered.
- Icon medallions: at least 3:1 contrast at three glyph positions against actual
  browser-painted card/tile pixels. This includes chrome, translucent surfaces,
  decorative plates and contextual service-card geometry.
- Busy indicators: visible size and paint against native, neutral, primary,
  secondary, ghost and canonical semantic controls; Tactile requires a distinct
  rotating segment. Preset-specific rings, wedges, beads and segments are retained.
- Tests were added before source repairs and run individually. Each failure
  stopped its chain for causal diagnosis. Full CI and the full unit suite were
  not run.

The pixel fixture was corrected to use complete service-card structure, CSS-pixel
coordinates and explicit removal of fixture glyphs before backdrop sampling.
Geometry is checked before/after removal. This avoids confusing cropped geometry,
device scaling or a browser-specific text mask with product contrast failures.

Firefox remains blocked by local automation startup. A fresh isolated
`firefox.launch(); browser.newPage()` probe fails with
`Cannot read properties of undefined (reading '_page')` before application CSS
loads. No Firefox component pass is claimed, and no installed driver or browser
security setting was altered.

Build, focused lint/syntax, generated-source synchronization, version agreement,
declaration review, semantic alias/entrypoint contracts, Tactile trust-seal
foreground, CSS ownership, compatibility, package integrity and static palette
contrast are part of the final local gate. The incremental declaration review
adds 42 declarations over the previous clean demo-repair candidate. Package
version remains 2.6.2; the repository has no jsdoc2md generation script. Existing
component/CSS generation, demo cache references, README sizes and spacing guidance
are updated through the established build.

## Local browser activity and evidence

Gnomie Duck Debugger supplied causal tracing, Development Command Center supplied
the inline execution/checkpoint sequence, and Gnomie Browser Commander's workflow
supplied the browser verification route. Its direct runtime tools are not exposed
in this session, so the available local Opera controls provided manual inspection
and interactions. Native desktop APIs are unavailable. Browser Use's cloud
surface cannot reach localhost; no paid cloud run, authentication, credentials,
messages or provider changes were used.

Observed visits were limited to `http://127.0.0.1:5500/demo/index.html`, its
`#components` anchor, and the supported Tactile mode/theme query on that same page.
Manual actions selected Tactile, native dark, Midnight Gold contrast and light,
read the three status paints, checked the paired icon foreground, and observed
different spinner transform matrices on successive reads. Screenshots inspect
the rendered message and icon cards. The initial Minimal SaaS / native / light
selection is restored after verification. The existing server is preserved.

- [Native dark messages after repair](evidence/tactile-feedback-20261029/after-native-dark-messages.png)
- [Themed light messages](evidence/tactile-feedback-20261029/after-gold-light-messages.png)
- [Themed dark icon tile](evidence/tactile-feedback-20261029/after-gold-dark-icons.png)
- [Native busy buttons](evidence/tactile-feedback-20261029/after-native-dark-busy.png)
- [Before: dark messages](evidence/tactile-feedback-20261029/before-native-dark-messages.png)
- [Before: themed dark icon tile](evidence/tactile-feedback-20261029/before-gold-dark-icons.png)
- [Machine-readable final evidence](evidence/tactile-feedback-20261029/verification.json)

Before images replay the saved pre-patch CSS against the same local demo;
after images use the working preview, including preserved unrelated Bento tint
edits. The fixed toolbar is hidden only during component capture. Reduced motion
freezes animation for screenshots; manual transform observations separately
verify motion. No video was requested. This report and images remain outside the
npm files allowlist.

An ignored plain HEAD export under `.tmp/tactile-feedback-20261028/review-source`
isolates the cumulative review candidate from the pre-existing Bento badge tint
edits and their unrelated test. This is not a Git worktree. Candidate hashes and
declaration fingerprints refer to that export. The current patch supersedes the
older review artifact; a later consumer delivery must admit the exact new pack.
