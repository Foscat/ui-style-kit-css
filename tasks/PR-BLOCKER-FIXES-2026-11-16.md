# PR blocker fixes - 2026-11-16

Status: complete in the reviewed scope. Both functional blockers and the additional mobile choice-grid issue are fixed. Final affected verification passed. Work remains inline and uncommitted; unrelated files are preserved.

## R1 - Native Clay palette routing

The library's native canvas, surface, raised surface, inset, text, muted text, seam, and primary background/label colors now consume their public RGB channels. The fallback RGB values match the authored native light/dark/contrast material colors. Shared palettes retain the existing mapping. No demo paint override, automatic theme switch, or browser baseline change was introduced.

The regression checks all ten initial field values in each mode, then asserts actual background, card, help-text, and primary-button background/label paint after editing. It applies the copied CSS to a separate document using the aggregate library and component-composition imports and asserts the same painted results. Gnomie independently verified the original Clay background reproduction: 235 228 219 initially, then rgb(18, 52, 86) after editing, with Style defaults still selected.

The declaration review proved that 47 intended Clay custom-property values and one intrinsic choice-grid declaration changed, while nine obsolete primary-mixing declarations were removed, with identical selectors. Reversing those approved edits recovered both prior reviewed declaration hashes exactly. Primary RGB channels now contain the finished pigment, preserving the rendered reference colors to integer-channel precision without requiring color-mix support. The dark primary hover was darkened to retain the 4.5:1 text contract. Contrast thresholds and validation rules were unchanged. The two frozen declaration assertions were updated from that reviewed evidence before final verification.

## R2 - Persisted browser lifecycle

Preview and host pagehide handlers now retain their resources when event.persisted is true. Browsers freeze and resume the existing DOM, observers, listeners, and operation timers; permanent navigation retains the original cleanup behavior. No synthetic remount or new appearance state is required.

The two regressions launch full Chromium with ordinary back-forward caching enabled and cacheable local responses. They require both the original parent and child document markers and a real persisted pageshow event. Details retain their visible board and draft. A pending save finishes after Back, and a trusted pointer click resets the form through the restored event wiring.

The first post-fix automation assertion exposed a driver limitation: cached iframe DOM was retained, while both old and freshly created Playwright frame locators reported no elements. Read-only lifecycle tracing proved that both documents received persisted hide/show events and kept their DOM. The regressions therefore inspect the actual same-origin child document after restoration and use a trusted pointer action for the restored form, rather than weakening the cache/state requirements. The original review's direct-DOM baseline showed zero boards before the fix.

## Expanded fidelity fixture alignment

The expanded Clay file exposed four pre-existing assertions that required decorative native thumbs, grain on named status/select paint, and local demo utility materials. A browser replay against the saved pre-fix aggregate and the candidate proved identical results at each boundary; see .tmp/pr-blocker-fixes-2026-11-16/legacy-fidelity-baseline.json. The assertions now verify primary-token ownership, readable named status paint, native palette indicators, and public material-class composition without demo paint overrides. Each corrected case passed separately before the final uninterrupted gate. No production styling was changed for these fixture failures.

The native edit/export regression now opens Code & export and waits for the enabled download control before consuming the committed CSS. Gnomie independently verified --clay-primary-rgb: 32 64 96 and matching rgb(32, 64, 96) paint with Style defaults retained.

## Additional mobile contract repair

The named-palette sweep exposed an obsolete .ui-card fixture selector and a genuine pre-existing 13px overflow at 390px. The saved pre-fix and candidate aggregates reproduced both identically. The palette fixture now selects the canonical .usk-card. Clay choice groups now fit their available width with the existing auto-fit/minmax pattern instead of forcing three columns, retaining 44px switch tracks without clipping or demo CSS. The regression checks whole-board containment and every switch track at both 320px and 390px. The declaration inverse proof includes exactly this one additional layout value.

## Verification boundary

Each regression was written and exercised before its source correction, including the additional primary RGB/contrast checks. The new tests are included in the existing formatter and release-smoke selection. Generated demo/library assets and all 38 granular JSDoc references are current. Final results are recorded under .tmp/pr-blocker-fixes-2026-11-16/verification.json. The final uninterrupted affected gate passed all 30 sections: 91 focused unit checks and 40 Chromium browser cases, with zero drift across 133 generated artifacts. All 38 granular references are current; lint, format, docs, ownership, Safari 16 compatibility, 1500 themed/60 fallback contrast states, package contracts, and packed-file checks passed. git diff --check passed and staging remains empty.

The final gate covers the affected quality sections, unit contracts, Studio recovery/optimization cases, Clay reference fidelity and named-palette behavior, package contents, and generated-artifact integrity. A full repository suite, Node 20 clean install, remote CI, commit, push, and PR creation are outside this affected verification receipt and are not claimed.

Safari 16 support and one preset per document remain the confirmed contract. debug.log, desktop.ini, and output/ remain outside the intended commit.
