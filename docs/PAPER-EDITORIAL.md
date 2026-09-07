# Paper Editorial

The Paper Editorial preset translates the retained **Pressroom Field Manual** template into the canonical `paper-*` API. It preserves the current eleven-folio reference composition, not the older twelve-panel distressed alternative.

## Reference Contract

- Source: the retained `artifact-template-paper-editorial` design guide, stylesheet, specimen HTML, and dark/light reference boards.
- Square controls, thin printed rules, oxblood editorial identity, blue revision/focus states, serif content, sans-serif labels, and monospaced metadata.
- Binder rail, manual metadata, oversized masthead, property stamp, circular revision stamp, and a numbered section index.
- Original dark/light paper-fiber PNG tiles are embedded in CSS. This keeps source, focused, and combined bundles portable without path rebasing. A consumer CSP must permit `data:` images to show the optional texture.

## Component Coverage

| Folio | Public components and examples |
| --- | --- |
| 1 | Navigation, breadcrumb, tabs, pagination |
| 2 | Primary/secondary/destructive action states, icon actions, loading and text buttons |
| 3 | Inputs, search and input icon, textarea, upload, date/time, validation and disabled states |
| 4 | Grouped native select, removable chips, checkboxes and radio buttons |
| 5 | Switches and keyboard-focus states |
| 6 | Ruler, range slider, measurement output and secondary ranges |
| 7 | Progress, threshold meter, workflow stages and loading indicator |
| 8 | Semantic badges, dismissible alerts, skeletons and tooltip |
| 9 | Revision form, modal dialog, empty state, token swatches, metric, disclosure and popover |
| 10 | Dense records table and CSV export |
| 11 | Article deck, byline, drop cap, pull quote, marginalia, footnote and segmented control |

The manifest is the authoritative class inventory. Template `pe-*` selectors are translated, not exposed as aliases. The ruled module uses `paper-folio-section` because `paper-section` remains a deprecated structural-layout selector. Existing common components continue to appear in the shared demonstration below the specimen.

## Tokens And Modes

Use `data-ui="paper-editorial"` with `data-mode="light"`, `dark`, or `contrast`. Omit `data-theme` for the preset reference palette; set it to a supported named theme to recolor the preset through `--usk-*` tokens.

`--paper-sheet-*` material aliases resolve through the existing `--paper-*` semantic aliases. Primary/background and foreground pairs remain coupled. Contrast-safe status inks replace low-contrast reference text without discarding the reference color roles. The demo's **Use reference palette** control removes the named-theme override; it does not change the mode.

For a Chromium range fill, set `--paper-slider-value` to the current percentage on `.paper-slider` and update it with the input value. Firefox uses its native range-progress pseudo-element. The demo updates all slider fills locally.

## Interaction And Accessibility

The demo provides roving keyboard focus for tabs and segmented controls, range-key input, local tag addition/removal, alert dismissal, table filtering/export, file selection, native modal Escape/focus return, and local revision confirmation. No newsroom backend is contacted and selected files are not uploaded.

Controls have labels; icon actions have accessible names and tooltips. Status copy supplements color. Reduced motion suppresses loaders and skeleton animation; coarse-pointer controls receive 44px targets. The reference board reflows on narrow screens, with bounded scrolling for dense tables and the button-state matrix.

The specimen is rendered only for Paper Editorial. The shared preset-visibility contract hides every non-owning `data-preset-only` region across all presets.

## Verification

Focused tests live in `tests/paper-editorial-template.test.js` and `tests/e2e/paper-editorial-template.spec.js`. They cover the component inventory, reference materials, dark/light accessibility, native/legacy loader consistency, token switching, keyboard behavior, modal behavior, mobile containment, and all-preset visibility.

Browser screenshots are captured from the rebuilt distribution, not the retained source package. The supplied source QA report is historical evidence only. Native date, time, select, file, and meter rendering may differ by browser; responsive reflow and contrast corrections are intentional departures from a static bitmap.

### Local Verification, 2026-09-05

- Component inventory unit test and all four focused Chromium cases passed, run individually.
- Dark/light specimen axe checks and named-theme axe passed. Keyboard, Escape/focus return, tag removal, slider updates, and 602px/390px containment passed.
- Every manifest preset was selected to verify non-owning preset-specific regions remain hidden.
- Class API passed. Public API passed after resolving the deprecated `paper-section` collision; only that failed subsection was rerun.
- Updated declaration fingerprints and partial-extra inventory checks passed. The existing authored semantic-hook assertion still fails on unrelated Retrofuturism `.ui-*` aliases; it was not relaxed or repaired here.
- Lint, contrast (1,200 named-theme states and 60 fallbacks), compatibility (26 entrypoints), ownership, package integrity, and `git diff --check` passed.
- Final distribution generation completed using the existing build module. Windows repeatedly blocked rewriting `styles/content-overflow.css`; an invocation-local guard skipped that one write only after proving its existing bytes exactly matched the generator output. No generator or build source was changed for this workaround. A plain `npm.cmd run build` remains subject to that local file-lock condition.
- Screenshots: `%TEMP%/usk-paper-editorial-template/dark.png`, `light.png`, and `mobile.png`.

No full test suite, CI, commit, push, publication, or deployment was run as part of this Paper Editorial change.
