# Demo and library remedy implementation - 2026-11-15

Status: complete for the compatibility-preserving remedy pass. Nine audit findings are implemented and verified; F2 remains a documented nesting limitation. Existing source and generated work remains uncommitted.

## Implemented

| Finding | Result                                                                                                              | Focused evidence before the final integration pass                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| F1      | Shared host state owns sample save completion; navigation cannot cancel its terminal state                          | Save/navigation/success/failure regression and Gnomie replay passed                                                       |
| F3      | Prerequisites load before paint changes; stylesheet leases and DOM rollback retain the live board if binding throws | Failed-module recovery and binder rollback regressions passed; Gnomie confirmed retained paint and Retry                  |
| F4      | One classic-script loader validates exact registration and releases failed entries for fresh Retry                  | Missing specimen and missing icon variant each reproduced red and passed after the fix                                    |
| F5      | Icon generations belong to the document, including overlapping token subtrees                                       | Held host response/newer global choice race reproduced red and passed                                                     |
| F6      | Source contracts describe actual helper parameters and selected icon variant readiness                              | Generated-contract unit passed; 38 granular jsdoc2md references regenerated                                               |
| F7      | Exact original Paper PNGs are packaged as independently fetched mode assets                                         | Hash/payload unit and actual light/dark network-request regression passed                                                 |
| F8      | Build reuses immutable preset partition strings within one invocation                                               | 80 to 40 parse calls; all 133 outputs byte-identical across the isolated cache change; final candidate also uses 40 calls |
| F9      | Clay's light muted ink is corrected in the library's material tokens                                                | Settled rendered contrast regression went from three violations to zero                                                   |
| F10     | Rendered landmarks identify their preview; copied markup restores generic labels                                    | Aggregate comparison scan and copied navigation markup regression passed                                                  |

## Preserved compatibility boundary

The user confirmed the supported contract: retain Safari 16 support and document one preset per document. F2 is an accepted, documented limitation rather than a claimed nested-scope fix. Mixed nested `data-ui` roots are unsupported because they do not isolate ancestor selectors. Use separate iframe documents for comparisons, as Studio already does. No browser minimum or runtime behavior was changed by this documentation decision.

No demo paint overrides, dependencies, worktrees, subagents, publication, deployment, commit, push, or PR were added. The two authored demo stylesheets remain 335 and 1,908 bytes. Updated library paint, assets, docs, and regenerated demo/distribution files are intentional parts of this change.

## Measurements

| Measure                                                        |        Before |         After |
| -------------------------------------------------------------- | ------------: | ------------: |
| Focused Paper CSS gzip                                         | 172,816 bytes |  54,716 bytes |
| Paper light CSS plus its texture, before headers/cache effects | 172,816 bytes | 109,295 bytes |
| Aggregate visual CSS gzip                                      | 459,563 bytes | 346,880 bytes |
| Preset partition parser calls per build                        |            80 |            40 |

Paper light's combined artifact payload is approximately 36.8% smaller. The existing focused URL rebasing path also normalizes generated CSS formatting. This is artifact-byte evidence, not a measured load-time or total build-speed claim. Both PNG hashes match their original inline bytes.

## Verification record

The focused regressions were written and run before each behavior patch. `tests/e2e/demo-studio-audit-remedies.spec.js` covers the original failure paths and useful sibling behavior. `tests/paper-texture-assets.test.js` protects exact artwork and delivery size; `tests/demo-studio-api-docs.test.js` protects the corrected generated helper contracts. The two existing Paper template assertions and Clay reference ink assertion were aligned before final checks.

The final uninterrupted pass completed all **27 sections**, including **85 focused unit checks** and **24 browser cases**, with **zero drift across 133 generated artifacts**. All lint, formatting, generated-document, composition, compatibility, contrast, package, and packed-file checks passed. Four texture assets were verified in the packed file list. Results are recorded in `.tmp/audit-remedies/verification.json`. Checks run sequentially by section. A failure is repaired and retested only in its section; unaffected successful sections are retained. No complete unit/browser suite or remote CI is claimed by this focused verification pass.

Gnomie Browser Commander is available for this implementation pass and supplied real browser replay. Its isolated local Edge profile is separate from the user's existing tabs. Native Windows pipe and public-deployment coverage are not claimed. Browser Use remains inapplicable to the uncommitted local candidate. Expected console errors from deliberately aborted replacement requests are distinguished from ordinary-path page errors.

The declaration-artifact gate was corrected only after an in-memory inverse check restored both original reviewed hashes by reversing the Clay muted ink and the two Paper texture URLs. Declaration counts remained unchanged. The preceding valid cases were retained during repair, and the final uninterrupted pass reran the entire affected chain successfully. See `.tmp/audit-remedies/declaration-review.json`.
