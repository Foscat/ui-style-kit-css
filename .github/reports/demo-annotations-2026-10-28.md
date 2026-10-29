# Demo annotation repairs — 28 October 2026

> Historical verification checkpoint. The [updated coordinated candidate](css-ownership-continuation-2026-10-29.md) supersedes artifact/status claims here; message titles now use normal readable ink.


The 15 reported demo issues are implemented in the shared CSS library and its
demo. This is a local, unpublished 2.6.2 candidate on
`codex/css-ownership-20261028`; it does not establish consumer or deployment
acceptance. The existing cross-repository report describes an earlier artifact.
Any later release must repack and admit this candidate into the consumers.

## Reported behavior and repair

| Report | Result and owner |
| --- | --- |
| Overview text contrast | Shared tab text uses surface-readable ink; Bento dialog-toolbar tab rules are scoped to that toolbar. Typed tab roots stack header and panel. |
| Small star across styles | Empty-state icon defaults to 2.75rem with native link ink. |
| Low progress bar | Track/fill reset element margins and padding and center the fill. |
| Text against a border | Compact labels, badges, overlays and options own explicit content insets after the native spacing floor. |
| Narrow side title splitting letters | A toast's direct title spans the full row above its content; title/body wrap at word boundaries. |
| Other button contrast | Secondary and warning actions use paired fill/ink; public Bento segments are separated from legacy segment containers. |
| Box escaping parent | Public frames shrink within parents; demo columns use minmax(0, 1fr); Cyberpunk and Retro Glass code frames scroll within their bounds. |
| Identical tooltips | Primary, secondary and accent variants provide solid, dashed context and double-edge accent treatments independently of direction. |
| Small, low switch dot | 1.125rem thumb stays vertically centered at either end of its track. |
| Checked input background | Layered checkbox background supports solid or gradient preset fills. |
| Disabled radios | Muted solid paint and dashed edge survive preset overrides; forced colors retain system colors. |
| Pale slider knob | All 20 presets use their native primary action color for the thumb. |
| Inconsistent checkbox marker | The shared stroke uses preset marker ink and border weight while clearing legacy masks and positioning. |
| Secondary resembles ghost | Paired secondary fill/ink and primary edge differentiate the action. |
| Warning attention | Warm paired warning fill/ink and a 1.8s brightness pulse; reduced-motion users receive the static treatment. |

The manifest and generated exact preset selectors own these rules. They do not
depend on a broad class-substring patch, a React shim, or application selectors.
The spacing guide documents the new configuration tokens and tooltip API.

## Investigation and verification

Gnomie Duck Debugger traced the annotation failures to competing element floors,
legacy preset selectors and invalid gradient-as-color combinations. Development
Command Center coordinated the focused test-first changes; STE Modular Website
Builder kept ownership in the CSS library. Gnomie Browser Commander used the
available local Opera tab for rendered manual checks; cloud browser execution
cannot reach this localhost and was not started.

Five new regression cases cover geometry, readable colors, actual demo
containment, form states, and tooltip/warning motion. Tests run individually and
stop on their first failure. No full unit or CI suite was run.

- Geometry covers 20 presets, three modes and both canonical/prefixed markup.
- Color checks cover 20 presets × 26 palette choices × three modes, measuring
  14 foreground/background pairs per state in Chromium and WebKit.
- Real demo containment covers all 20 presets at 320, 390, 768, 1280 and 1440px.
- Form and tooltip/warning checks pass in Chromium and WebKit. They include
  checked fill, disabled radios, slider color, switch centering, marker geometry,
  secondary/ghost separation and reduced motion.
- Nested tabs were added after manual Opera inspection exposed a fixture that
  omitted the real header/panel wrapper. The corrected fixture reproduced the
  issue before the repair and passed afterward.
- Screenshot review exposed 546 overlay/option inset failures across the matrix;
  those exact cases were added before correcting their clean-defaults owner.
- A combined responsive run reached its three-minute harness limit while
  selecting the next preset. The final run is split by viewport and asserts each
  preset immediately; the limit was not increased and no CSS workaround was made.
- Manual Opera checks exercised Overview, checkbox, switch and keyboard range
  changes, confirmed the disabled radio, and restored Minimal SaaS / no theme /
  light mode. The existing preview server was preserved.

Firefox verification is blocked by local Playwright browser startup. An isolated
blank-page probe reproduces the page-map failure in two installed Playwright
versions before application CSS loads. No Firefox CSS pass is claimed and no
browser security settings or installed dependencies were changed to bypass it.

Build, style lint, syntax, whitespace, package integrity, contrast and browser
compatibility checks passed. Static contrast covered 1,500 themed states plus
60 native fallback states; compatibility covered 26 entrypoints and 60 resolved
browser targets. Final ownership checked 37,049 declarations with zero exceptions.
Focused manifest, suffix, alias, entrypoint and declaration-artifact contracts
passed; green checks were repeated only when a later change affected their scope.

The reviewed generated declaration blocks add 144 declarations to each full
entrypoint. The changes comprise the named component repairs, native disabled
states and preset range tokens; the unrelated Bento tint edits are excluded.

| Clean candidate artifact | SHA-256 of complete file |
| --- | --- |
| `dist/ui-style-kit.css` | `2385f12af9e22a1e8253559cb157784e4ab9fe66c7d6071e9fdf50464c55957e` |
| `dist/ui-style-kit.visual.css` | `653517db49ca038d6a09efb6161f87ecb8aeba58cb043e8f540cf5c2730ba8ee` |
| `dist/ui-style-kit.min.css` | `5e961ad83d17a4aa5a2540424765dc01c4ee71feb03dcef5667fbb07d2ac5fa3` |

## Evidence and scope

Local preview: <http://127.0.0.1:5500/demo/index.html>.

- [Bento semantic components](evidence/demo-annotations-20261028/bento-semantic.png)
- [Minimal controls and differentiated tooltips](evidence/demo-annotations-20261028/minimal-controls.png)
- [Native choices and sliders](evidence/demo-annotations-20261028/minimal-native-forms.png)
- [Machine-readable final browser evidence](evidence/demo-annotations-20261028/verification.json)

These are rendered local screenshots with the fixed demo toolbar hidden only
during image capture. They are separate from deterministic test results and
manual interaction evidence; no recording was requested. This report and its
images are outside the npm package files allowlist.
Screenshots show the working preview, including the preserved pre-existing
Bento tint edits; deterministic candidate tests use the isolated clean export.

Initial dirty files were snapshotted under ignored
`.tmp/demo-annotations-20261028/before`. The unrelated Bento badge tint edits,
their test, and other local output are preserved. A plain HEAD export under
`review-source` isolates the repair candidate from those badge edits without
creating a Git worktree. Generated fingerprints refer to that clean candidate;
they intentionally differ from a working build containing unrelated edits.

The repository has no jsdoc2md generation script. Existing component generation,
compiled CSS, demo cache references, README bundle sizes and spacing docs are
updated through its established build. No npm publication, merge or deployment
is included in this repair.
