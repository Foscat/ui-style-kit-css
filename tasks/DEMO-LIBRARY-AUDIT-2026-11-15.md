# Demo and library audit - 2026-11-15

Status: initial scoped audit complete. Nine findings were subsequently implemented in the [remedy pass](DEMO-LIBRARY-REMEDIES-2026-11-15.md); F2 remains a documented compatibility limitation. The observations below retain the original audit baseline.

## Outcome

Ten actionable findings: seven reproduced runtime issues, one confirmed source/generated-document contract mismatch, and two optimization opportunities. Fix operation lifetime, preview replacement, and semantic scope ownership before additional demo cleanup. The highest-value measured payload opportunity is extracting Paper Editorial's unchanged raster textures from CSS.

The demo's two authored local stylesheets total **2,243 bytes** (`demo/demo.css`: 335; `demo/studio.css`: 1,908). This pass found stronger targets than further cosmetic reduction. Keep Layout Style CSS responsible for responsive composition, UI Style Kit responsible for paint, Interactive Surface responsible for feedback, Motion responsible for lifecycle choreography, and ui-style-kit-icons responsible for icon artwork. Add no demo paint overrides to address these findings.

## Target and evidence boundaries

- Repository: `C:\Users\Foscat Laptop\Desktop\ui-style-kit-css`, distinct from `ui-style-kit-css-icons`.
- Branch: `fix-sys-graphite-focus-20261113`; HEAD: `5d3248be6deda2e47d26ef6fa08bc9c9fb47baef`; package version: 2.7.5.
- Existing dirty source and generated work was retained. The staging area was empty at closure. No commit, push, PR, package publication, or deployment occurred.
- Development Command Center's coordinator, plan-builder, and STE composition skills and Gnomie Duck Debugger's audit, reverse tracing, testing, and handoff references were loaded. Work remained inline.
- Browser evidence came from isolated local Playwright Chromium against the existing root `index.html`, served by `startStudioServer(0)`. Desktop: 1440 x 1000; phone sample: 390 x 844. Reduced motion was requested; settled accessibility screenshots also disabled finite animations.
- Gnomie Browser Commander was attempted: its persistent browser profile was already in use. CUA tab creation and selection both failed with `undefined timeoutMs`. Native Computer Use initialized its module but its Windows pipe was unavailable. These surfaces supplied no functional proof.
- Browser Use's public-web route was discovered but is inapplicable to this uncommitted localhost checkout. The public Pages demo is a different revision. No cloud run was started.
- Screenshots were inspected for the nested scope failure, failed replacement, and desktop comparison. Diagnostic actions/assertions and screenshots are separate evidence; no video or screen-reader session was recorded.
- Fingerprinting covered 337 production files. At closure, 336 were unchanged; `demo/index.html` differed from its initial hash. That change's origin was not established and it was preserved. The root `index.html`, authored JS, library CSS, and distributions used by the probes remained stable. See [integrity evidence](../.tmp/demo-library-audit/integrity.json).
- No broad CI, production build, docs regeneration, or complete browser/preset matrix ran during this audit. Earlier implementation checks are not represented as fresh audit proof.

## Ranked findings

Priority expresses recommended order and impact, rather than a release severity standard.

| Order | ID  | Priority | Finding                                                                   | Evidence classification                                                  |
| ----- | --- | -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1     | F1  | High     | Save can remain disabled and busy after leaving and returning             | Confirmed runtime                                                        |
| 2     | F2  | High     | Nested semantic components inherit an outer preset's paint                | Confirmed runtime and generator trace                                    |
| 3     | F3  | High     | Failed replacement removes the last working preview's paint               | Confirmed runtime                                                        |
| 4     | F9  | High     | Clay default light text misses 4.5:1 contrast in three sampled components | Confirmed settled Chromium/Axe                                           |
| 5     | F4  | Medium   | A fetched asset without expected registration poisons Retry               | Confirmed runtime, two loader branches                                   |
| 6     | F5  | Medium   | An older subtree icon request overwrites a newer global choice            | Confirmed runtime                                                        |
| 7     | F7  | Medium   | Two embedded Paper textures are transferred inside CSS regardless of use  | Measured payload opportunity                                             |
| 8     | F6  | Medium   | Generated API docs faithfully publish incorrect source contracts          | Confirmed static mismatch                                                |
| 9     | F10 | Medium   | Desktop A/B comparison repeats four landmark names                        | Confirmed automated best-practice finding; assistive navigation untested |
| 10    | F8  | Low      | Build repeats preset partition preparation for identical inputs           | Confirmed call graph; speed benefit unmeasured                           |

### F1 - Operation state outlives its completion timer

**Observation and trigger:** Fill both required fields in the Form example. A normal save completes. Start another save, wait for its busy state, switch to Dashboard within 44 ms, wait 800 ms, and return to Form. The button is disabled with `aria-busy="true"`, still reads "Saving...", and the message remains "Saving your sample changes...".

**Causal path:** `demo/studio/frame.js:410` sends shared form state `saving`; line 411 schedules its completion with the frame's `later` helper. A view remount clears the timers at lines 505-506. The host's interaction model retains `saving`, so returning reconstructs an operation whose completion producer has been cancelled. The related component-save notice uses the same lifetime pattern at lines 374-375; that sibling is source-supported rather than separately reproduced.

**Contract and remedy:** Every in-flight shared operation needs a terminal transition independent of presentation teardown. Give the operation a host/model lifetime, or explicitly transition it to cancelled/idle when its owner is disposed. Avoid retaining an invisible detached timer merely to mask the ownership mismatch.

**Focused acceptance:** Write the save/navigate/return regression first. Prove normal success, the intended failure-email path, rapid example navigation, and appearance-only updates leave the form in a usable terminal state. Preserve input values and accessible feedback.

Evidence: [result](../.tmp/demo-library-audit/save-lifecycle.json), [reproduction](../.tmp/demo-library-audit/probe-save.mjs), [returned form](../.tmp/demo-library-audit/save-after-navigation.png).

### F2 - An ancestor selector does not identify the nearest style owner

**Observation and trigger:** With the aggregate visual CSS and public component composition loaded, place a Minimal SaaS `usk-button` primary component inside a Minimal SaaS root nested in a Clay root. Its paint changes to Clay. A standalone semantic control and the nested prefixed `saas-button saas-button-primary` control agree with one another.

**Measured difference:** The semantic nested button uses Segoe UI, Clay shadows, irregular 7.68/9.6/8.32/8.96 px corner radii, and 5.44 x 10.24 px padding. Both controls use Inter, no shadow, 6 px corners, and 7.2 x 12 px padding.

**Causal path:** `scripts/build.mjs:325-345` rewrites component classes to semantic aliases and constrains them with `selectedRoot`. The generated `:where([data-ui="..."]) ...` descendant rule admits any matching ancestor. Outer Clay component rules therefore remain eligible inside the inner Minimal SaaS owner. Shared aliases let preset source order resolve the conflict; scoped token values alone do not exclude the wrong component rules.

**Contract and remedy:** Define and enforce nearest-root ownership for semantic selectors at the generator boundary, retaining parity with prefixed classes. Keep the declared browser support policy; do not adopt an unsupported selector mechanism without compatibility proof. If nested scopes are intentionally unsupported, document that public limitation explicitly instead of implying scoped composability.

**Focused acceptance:** Before changing generation, add inner/outer/prefixed parity cases, including a neutral wrapper, both source orders, light/dark/contrast, and focused versus aggregate entrypoints. The reproduction establishes one nested preset pair, not all possible pairs.

Evidence: [computed styles](../.tmp/demo-library-audit/runtime.json), [fixture](../.tmp/demo-library-audit/probe-runtime.mjs), [visual comparison](../.tmp/demo-library-audit/nested-scope.png). Source contract context: `README.md:124` and semantic twin tests.

### F3 - Replacement commits before all prerequisites succeed

**Observation and trigger:** Open Clay Details successfully, block `demo-bento.js`, and select Bento. The error and Retry action appear, but the retained Clay board loses its surface color and shape: its sheet background changes from `rgb(233,226,217)` to transparent and its corner radius from `12px 15px 11px 14px` to zero.

**Causal path:** `frame.js:480` loads and activates the replacement stylesheet. `assets.js:50-53` removes the previous active link. `frame.js:489` applies the new appearance before `frame.js:499` prepares the detail module. Failure at the latter boundary leaves old DOM under the replacement root and CSS. Keeping nonempty old DOM does not preserve the last working preview.

**Contract and remedy:** Stage stylesheet, icon, and specimen readiness without replacing the active view. Commit the selected generation's DOM, appearance, and stylesheet together; retain the last good resources when preparation fails. Include a rollback/disposal policy if mount or bind fails after preparation.

**Focused acceptance:** Test failed detail-module, icon, and stylesheet prerequisites separately, as well as stale A/B requests. Assert retained computed paint, geometry, interaction state, error visibility, and successful Retry. Existing checks that only require nonempty DOM are insufficient.

Evidence: [before/after measurements](../.tmp/demo-library-audit/runtime.json), [reproduction](../.tmp/demo-library-audit/probe-runtime.mjs), [failed replacement](../.tmp/demo-library-audit/failed-replacement.png).

### F4 - Retry validates transport but caches invalid application readiness

Two independent branches violate the same readiness contract:

1. **Specimen registration:** Return HTTP 200 with valid JavaScript that does not register the Clay module. `specimen-loader.js:20` resolves on script load and keeps that fulfilled promise. `prepareSpecimen` later rejects the missing `render`/`bind` registration, outside cache eviction. Retry displays the same error and makes no second request: request count remains one.
2. **Icon variant registration:** Start with monochrome already registered, then return HTTP 200 for themed artwork without registering it. `icons.js:97` checks only the pack object. That passes because monochrome exists, then hydration reads the missing variant's `plus`. Retry reuses the fulfilled cache entry; total request count remains two across the host and frame rather than fetching again.

**Counterevidence:** Network `onerror` paths already evict entries. These controlled malformed-success responses distinguish registration validation from ordinary transport failures; they do not imply that current distributed assets are malformed.

**Remedy:** Validate the exact requested module or variant at the loader's success boundary, evict rejected readiness entries, and remove unusable script nodes. Define required icon inventory validation without eagerly loading both variants.

**Focused acceptance:** Write one test per branch before its patch: invalid successful response, then restore the valid response and click Retry. Require a fresh fetch and a working rendered result. Retain ordinary success and transport-failure behavior.

Evidence: `demo/studio/specimen-loader.js:12-45`, `demo/studio/icons.js:84-105`, [runtime results](../.tmp/demo-library-audit/runtime.json).

### F5 - Overlapping icon scopes have independent stale-request guards

**Observation and trigger:** Delay the host's cold monochrome request while allowing the preview request through. Let token rows request monochrome, select Themed globally, then release the old monochrome response. The global checkbox and status say Themed; header icons remain themed while token reset icons become monochrome.

**Causal path:** `app.js:243-252` hydrates the document; `app.js:448-482` independently hydrates the token subtree. `icons.js:154-158` stores request identity in a WeakMap keyed by scope. A new document request does not supersede an older subtree request targeting the same icon nodes.

**Remedy:** Coordinate generations at the document owner or target-node level so overlapping scopes agree on the latest preference. Retain the useful optimization of updating only changed/subtree icons, without relying on disjoint scopes that the callers do not guarantee.

**Focused acceptance:** Hold only the host's initial variant, issue a newer global choice, resolve the old response last, and assert every affected node agrees with the selected pack and variant. Include the inverse direction and default Minimal SaaS monochrome behavior.

Evidence: [reproduction](../.tmp/demo-library-audit/probe-icon-scope.mjs), [mixed final variants](../.tmp/demo-library-audit/icon-scope.json).

### F6 - Correct generation can still produce incorrect API documentation

**Static proof:** `reference.js:876-878` leaves a Technical Blueprint renderer comment attached to `getSurfaceVariant(element)` at line 881. `docs/api/studio-reference.md:436-441` therefore documents `getSurfaceVariant(ui)` as returning an entire reference board. `icons.js:79-84` omits the `variant` parameter from `prepareIcons` documentation and promises both variants, while the implementation loads the selected variant lazily. `docs/api/studio-icons.md:61-66` repeats that stale contract.

**Remedy:** Correct source JSDoc descriptions, parameter types/defaults, readiness/error behavior, and return values. Regenerate granular Markdown through `npm.cmd run docs`; do not edit generated Markdown by hand. Add focused assertions for the changed signatures and selected-variant promise contract, rather than assuming byte drift checks prove semantic accuracy.

**Tool boundary:** API Documentation Checker was discovered. Its available operations are for explicitly provided endpoint/parameter/request/response contracts, so this JavaScript helper review used direct source-to-Markdown comparison instead of fabricating HTTP endpoints for that tool. No external documentation-check result is claimed.

### F7 - Move existing Paper textures out of the stylesheet payload

**Measured source:** `styles/paper-editorial.css:994` and `:1020` define distinct light/dark PNG data URIs. Together they occupy 145,604 encoded characters; their unchanged decoded PNGs are 54,579 and 54,591 bytes. Both embedded images travel inside the CSS even when only one mode is active, or when a consumer loads the aggregate bundle without using Paper.

An in-memory experiment substituted relative asset URLs without changing image contents or production files:

| Existing entrypoint | Current gzip CSS bytes | Candidate gzip CSS bytes | Candidate light first-visit estimate including one unchanged PNG |
| ------------------- | ---------------------: | -----------------------: | ---------------------------------------------------------------: |
| Focused Paper       |                172,816 |                   60,562 |                                                          115,141 |
| Aggregate visual    |                459,563 |                  346,880 |                                                          401,459 |

For focused Paper light, this estimates roughly **33% fewer payload bytes** including its texture. For aggregate consumers not using Paper, the CSS alone is roughly **24.5% smaller**. These are byte estimates, excluding headers, caching, and timing; they are not measured page-load improvements. Visiting both modes changes the transfer comparison.

**Remedy:** Extract the exact PNG bytes into `styles/assets`, use existing distribution asset-copy and focused URL-rebasing machinery, and preserve artwork. Test hashes/pixel parity, relative URLs from packed installs, and actual mode-specific resource requests. Preserve a self-contained option only if that is an explicit supported distribution requirement.

**Counterevidence:** Blind minification is a weaker target: the in-memory Clay minification experiment made gzip size 333 bytes larger. Optimize measured ownership and payload sources rather than treating raw line count as the performance metric.

Evidence: [texture experiment](../.tmp/demo-library-audit/texture-metrics.mjs), [byte results](../.tmp/demo-library-audit/texture-metrics.json), [distribution metrics](../.tmp/demo-library-audit/metrics.json).

### F8 - Cache immutable preset partitions within one build

**Static proof:** `scripts/build.mjs:514` parses and partitions a preset for every call. `visualSections()` runs for the aggregate visual bundle at line 634, again for the default bundle at 635, and once per focused preset at 649. With 20 presets, this produces 60 visual preparations plus 20 compatibility preparations for 40 distinct preset/composition input partitions.

**Remedy:** Cache the immutable prepared CSS string using all effective inputs within a single build, or reuse previously computed section strings. Do not share mutable AST instances across transformations. This can reduce the identified preparation-stage calls from 80 to 40; total build-time savings have not been measured.

**Focused acceptance:** Profile this stage before/after, compare every generated distribution/map and export byte-for-byte, then verify source changes invalidate the cache correctly. Avoid persistent cache machinery until profiling justifies it.

Evidence: [call-graph metrics](../.tmp/demo-library-audit/metrics.json), `scripts/build.mjs:432`, `:514`, `:599-649`.

### F9 - Clay's default muted ink is too light on two actual surfaces

**Settled runtime proof:** In Clay, Style defaults, Light, Components, Axe measured the same muted foreground `#6e675f` on:

| Component                                 | Effective background | Contrast | Normal text size |
| ----------------------------------------- | -------------------- | -------: | ---------------: |
| Catalog help text (`usk-help-text`)       | `#ebe4db`            |   4.41:1 |            14 px |
| File dropzone (`usk-dropzone`)            | `#e5ded5`            |   4.17:1 |            16 px |
| Empty-state body (`usk-empty-state-body`) | `#e5ded5`            |   4.17:1 |            16 px |

**Causal path:** `styles/clay.css:782-791` supplies the light material canvas, inset, and muted ink. Lines 874-880 map material colors back into component/native paint. The muted ink/surface pairs miss the check's 4.5:1 requirement for these normal-sized texts. The issue persisted after finite animations were disabled; it is not a transition-only scan result.

**Remedy:** Adjust the library's paired muted ink or surface tokens, preserving Clay's material identity. Do not darken text through local demo overrides. Test all actual Clay surface combinations, default and named palettes, three modes, and affected native/semantic/prefixed equivalents. This audit did not establish failures in every palette or mode.

Evidence: [full node/color results](../.tmp/demo-library-audit/accessibility.json), [settled comparison](../.tmp/demo-library-audit/a11y-compare-clay.png), [probe](../.tmp/demo-library-audit/probe-accessibility.mjs).

### F10 - Comparison landmarks need preview context

**Observation:** A single Minimal SaaS catalog has no sampled Axe violations. Showing both comparison previews produces four `landmark-unique` findings for repeated names: Sample navigation, Breadcrumb, Example pagination, and Sample project records. The same duplicates remain with Clay on side B.

**Discrimination and cause:** Scanning each iframe separately reports zero duplicate-landmark findings. The frames already have distinct titles, Pinned style preview and Editable style preview. However, `catalog.js:249`, `:255`, `:261`, and `:286` emit identical landmark labels into both visible documents, and the aggregate Axe scan compares those roles/names across frames. The installed rule's after-phase confirms that cross-document comparison.

**Remedy:** Give rendered preview landmarks accessible A/B or pinned/editable context through the frame's semantic rendering inputs. Keep copied component snippets generic and reusable. Verify both single and comparison views and phone visibility. A real screen-reader landmark navigation pass remains outstanding; this is a confirmed Deque best-practice finding, not a claimed WCAG conformance failure. See [Deque's rule documentation](https://dequeuniversity.com/rules/axe/4.9/landmark-unique), which includes duplicate landmarks across an iframe in its failing examples.

Evidence: [settled accessibility results](../.tmp/demo-library-audit/accessibility.json), [frame-local discrimination](../.tmp/demo-library-audit/closure.json).

## Coverage ledger and working controls

All **12 inventoried workflow areas were examined**. Eight have linked findings; four have sampled valid controls with limits. No workflow remains unexamined. These dispositions do not mean all states, browsers, integrations, or preset combinations were tested.

| ID  | Workflow                                | Disposition and evidence                                                                                                          | Remaining limit                                                                                 |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| W01 | State, URL/history, preferences         | Sampled valid: palette edits and pinned appearance restore from shared URL; private form value absent                             | Full back/forward/storage migration matrix not replayed                                         |
| W02 | Stylesheet/specimen readiness and Retry | F3, F4; failure injection and retained paint measurements                                                                         | Full sibling failure matrix belongs to implementation acceptance                                |
| W03 | Icon variants and cancellation          | F4, F5; failed registration and overlapping-scope race                                                                            | All 20 icon packs/variants not enumerated                                                       |
| W04 | Copy/code/CSS exports                   | Sampled valid: copied primary button has `usk-button` and primary variant, no demo action hooks; edited CSS updates               | Clipboard API was stubbed to capture bytes; OS clipboard and downloaded-file workflows untested |
| W05 | Resource/operation lifetime             | F1; ordinary success versus pending save/navigation                                                                               | Every retained specimen's lifecycle not stress-tested                                           |
| W06 | Responsive composition                  | Sampled valid: 390 px viewport has 390 px document width; side A selection works                                                  | One phone geometry and desktop comparison sample; no complete viewport matrix                   |
| W07 | Accessibility, focus, motion            | F9, F10; Escape returns dialog focus; sampled visible phone side has no Axe violations                                            | No real screen-reader or full motion/elevation audit; other palettes/modes remain unverified    |
| W08 | Generation and caching                  | F8; deterministic call graph and existing asset version paths inspected                                                           | No full build timing or warm/cold benchmark                                                     |
| W09 | Source/generated documentation          | F6; concrete helper signature/description comparisons                                                                             | Complete semantic documentation review not performed                                            |
| W10 | CSS payload and duplication             | F7; four CSS entries measured; exact-image extraction estimate                                                                    | No network latency/TTI benchmark; no production payload modifications                           |
| W11 | Semantic/native theme ownership         | F2, F9; nested aliases versus prefixed controls and settled color pairs                                                           | All nesting pairs, native controls, palettes, and engines not checked                           |
| W12 | Package entrypoints/compatibility       | Static valid controls: 162 exports exist; 26 generated CSS files have no remaining imports; 123 relative asset references resolve | Fresh packed-consumer and declared-engine execution not rerun                                   |

Additional working controls: all 74 catalog options return after clearing search; filtering to "indeterminate" settles at one option and retains the entered email. The first immediate count in `ordinary-flows.json` was captured before the requestAnimationFrame update; `closure.json` waits for the settled state and supersedes that timing observation. The intended failure-email save branch gives its useful error. The sampled ordinary path collected no page errors.

Harness errors were kept separate from product findings: an initial form probe omitted a required field, and an Axe harness initially used `browser.newPage()` instead of its required explicit context. The corrected diagnostics provide the cited results; neither harness error is reported as a library defect.

The machine-readable [ledger](../.tmp/demo-library-audit/ledger.json), scripts, results, and screenshots remain under `.tmp/demo-library-audit`. They are local diagnostic artifacts, not published acceptance evidence.

## Development Command Center remedy plan

Objective: make preview recovery, state lifetime, theme ownership, and documentation reliable while reducing measured library delivery/build work. The following is proposed implementation scope; no remedy was executed by this audit.

| Phase / weight | Findings   | Responsible boundary and dependency                                                | Acceptance checkpoint                                                                                                                         |
| -------------- | ---------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 / 10%        | F1         | Move/cancel operation lifetime at the model boundary                               | Write the navigation regression first; run it once before and after the fix, plus ordinary terminal-state siblings                            |
| 2 / 25%        | F3, F4     | Define exact asset readiness, then stage and atomically commit preview replacement | Separate tests for missing registration, transport failure, stale requests, retained paint, and working Retry                                 |
| 3 / 10%        | F5         | Coordinate overlapping icon requests with the latest preference                    | Reproduce the held-host response, then assert consistent variants and retained controls/focus                                                 |
| 4 / 20%        | F2         | Correct generator scope ownership using supported CSS mechanisms                   | Add nested semantic/prefixed parity before generation edits; verify aggregate and focused output                                              |
| 5 / 10%        | F9, F10    | Correct library ink/surface pairs and preview-specific landmark labels             | Settled color checks, copied-markup neutrality, single/A-B/phone Axe, and local assistive navigation when available                           |
| 6 / 10%        | F7         | Externalize unchanged Paper PNGs through existing assets/rebase paths              | Exact bytes/pixels, mode resource requests, packed relative URLs, and measured transfer comparison                                            |
| 7 / 5%         | F8         | Reuse immutable prepared build sections                                            | Narrow profiler and byte-identical artifacts; invalidate on source change                                                                     |
| 8 / 10%        | F6 and all | Correct source JSDoc, align final artifacts/docs, and close review                 | Generate affected granular docs, verify signatures and drift, format/lint touched code, then complete the authorized final verification chain |

Gnomie owns causal checks and before/after replay; Command Center owns ordering, checkpoints, and completion accounting. Repository sources, manifest, lockfile, and retained composition record are authoritative. There is no React client in this demo; no React migration or new component library is proposed.

For every implementation phase: write the focused failing regression before code, change the responsible boundary, regenerate affected artifacts and granular docs before their checks, then run the specific check. Keep successful evidence and do not rerun green sections without a relevant change or the final gate. Run focused CSS/JS formatting and lint for touched files; do not weaken lint rules to pass a patch.

At final implementation closure, the discovered generator commands are `npm.cmd run demo:build` and `npm.cmd run docs`; check with `npm.cmd run docs:check`, applicable package/ownership/contrast checks, and the relevant browser regressions. A library generator change additionally requires its full distribution build and package checks. Reserve any broad CI-style run for completed implementation and explicit authorization. If a chain section fails, repair/retest that section, continue, and use one final uninterrupted chain when required before a PR. Do not start duplicate remote runs.

Reattempt Gnomie/Computer Use for the real local surface after their access failures are resolved; otherwise report the same limitation and retain isolated Chromium evidence. Browser Use becomes applicable only to an authorized reachable deployment of the same candidate. Replay each issue under comparable state before claiming a repair. A screen recording can supplement that evidence if requested and supported.

Composition acceptance must retain public `usk-*` classes and variants, Minimal SaaS monochrome default icons, optional icon pack/themed controls and companion installation guidance, Layout's responsive primitives, and no new demo paint overrides. Recheck only affected entries in `docs/STUDIO-COMPOSITION.json`, including local CSS bytes, ownership, containment, and motion/feedback contracts. Commit readiness, remote CI, release, deployment, and live verification remain separate facts.
