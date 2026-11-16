# Studio optimization measurements

Measured locally on 2026-11-15 against the approved pre-optimization Studio snapshot. These are artifact and observable-work measurements, not network timing or production deployment claims.

| Measure                                                |          Before |                                            After |
| ------------------------------------------------------ | --------------: | -----------------------------------------------: |
| Host JavaScript                                        |    63,028 bytes |                     31,140 bytes (50.6% smaller) |
| Visual CSS per preview document                        | 2,938,352 bytes | 348,855 to 578,410 bytes (80.3 to 88.1% smaller) |
| Minimal SaaS visual CSS                                | 2,938,352 bytes |                                    360,059 bytes |
| Host mutations while entering six form characters      |             208 |                                                0 |
| Preview-root clones while entering six characters      |               6 |                                                0 |
| Preview-root clones for the same input with comparison |              12 |                                                0 |
| Maintained demo CSS                                    |     2,583 bytes |                     2,243 bytes across two files |

The host no longer contains catalog option markup. Icon families load monochrome and themed treatments independently. Source maps contain maintained source and load only when requested by developer tooling. No library paint overrides were added. Shared Layout defaults now live in demo/demo.css; demo/studio.css contains shell geometry and visibility. Both are authored directly, without a separate preview stylesheet or generated CSS copies.

## Source ownership

The host owns state, URL history and export presentation; each frame owns its DOM and local interactions. Change classification and animation-frame batching keep typing outside shell rendering, palette reads and icon work. Component search changes visibility without replacing controls. Example serialization occurs only when Code or Copy consumes it, with revision-checked replies and one pending request per revision.

Fifteen explicit authored modules cover all 20 presets and serve both Studio and the retained reference page. A shared context supplies actual root, appearance, assets and callbacks. Disposers release native listeners, event properties, observers, timers and object URLs. Production code does not patch browser prototypes or fabricate host controls.

The build compiles declared sources into minified classic scripts with linked, content-versioned maps. It removes only recognized obsolete generated specimen/icon outputs. The documentation generator discovers nested maintained modules and generates 38 granular jsdoc2md references, including the library build.

## Verification scope

Focused browser contracts cover zero shell mutations/root clones during typing, retained catalog identity, selected icon treatments, stylesheet ordering, failed-load retry, stale-load rejection, handler disposal, cached-icon recovery and stale-artwork cancellation, current markup consumption and selected interaction feedback. Paint parity compares six representative components across every preset, native and named palettes, and light/dark/contrast modes (120 configurations).

Desktop and 390px phone review reported zero axe violations and page errors; phone document width matched its viewport. Organic keyboard range interaction synchronized its progress value, label and width. The retained reference interaction and all-preset phone cases also passed during implementation. Browser evidence uses local Playwright Chromium because Gnomie Browser Commander's persistent profile was locked.

The exact metrics and original renderer parity evidence are retained under .tmp/optimization/. Final quality results are recorded in tasks/todo.md. These checks do not establish a published package or live deployment.

## Audit remedies on 2026-11-15

The earlier table records the original Studio optimization checkpoint. The subsequent audit/remedy pass adds model-owned sample operations, a single registration-validating classic-script loader, document-owned icon request generations, transactional stylesheet/DOM rollback, contextual preview landmarks with reusable copy labels, and corrected Clay material contrast. Local CSS remains 2,243 bytes across the same two authored stylesheets.

Paper Editorial now references two external, byte-identical PNG textures. Focused Paper CSS is 391,460 raw / 54,716 gzip bytes, compared with 578,410 raw / 172,816 gzip bytes before extraction. Light mode requests its unchanged 54,579-byte PNG, for 109,295 combined payload bytes before headers/cache effects. The existing focused-asset rebasing path also normalizes generated CSS formatting; these are actual artifact sizes, not measured load-time claims. The aggregate visual CSS is 2,792,807 raw / 346,880 gzip bytes. Browser checks verify that the unused dark PNG is not fetched until dark mode is selected.

An instrumented real build reduced preset partition parsing from 80 calls to 40. All 133 generated distribution/demo files were byte-identical across that isolated caching change. The cache contains immutable CSS strings and lives only for one build invocation. The observed total build durations are not treated as a reliable speed benchmark.

The confirmed compatibility contract is one preset per document with Safari 16 support retained. Mixed nested presets are unsupported; comparisons use separate iframe documents, as Studio already does. No new demo paint overrides or dependencies were introduced.

Evidence: `tests/e2e/demo-studio-audit-remedies.spec.js`, `tests/demo-studio-api-docs.test.js`, `tests/paper-texture-assets.test.js`, and local `.tmp/audit-remedies` artifacts. See [the implementation record](../tasks/DEMO-LIBRARY-REMEDIES-2026-11-15.md) for final verification and limits.
