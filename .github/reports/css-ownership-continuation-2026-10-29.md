# Updated CSS ownership candidate — 29 October 2026

The latest demo, feedback and Paper Editorial repairs are included in the UI
review candidate. Message titles use normal readable ink. The original company
copy and Cyberpunk marketing migrations remain in their existing reviews.

## React button propagation defect

The React Button emits a semantic class, a preset class and data-ui-variant.
Neutral-only preset rules excluded variant classes but still matched that mixed
markup. Their stronger selector replaced the selected surface while leaving its
paired foreground. Tactile dark primary actions consequently displayed dark ink
over a dark neutral gradient. The focused baseline recorded 10,062 mismatched
paint properties across 17 presets.

Twenty responsible fallback selectors now exclude attribute-selected variants
through a zero-specificity where condition. No declaration values, interaction
package, consumer override or production dependency pin was added for this fix.
The new regression tests the actual class/attribute combination at rest and
pressed. It is included in the existing release smoke selection.

## Final local acceptance

- Chromium and WebKit each pass 3,120 presentation/state cases: 20 presets,
  26 palette choices, three modes and rest/pressed, with five variants per case.
  Both matrices read the exact freshly installed tarball CSS and record its hash.
- Eighteen focused React, company and marketing checks pass, including modal
  dismissal/focus, keyboard, reduced motion, forced colors, identity geometry,
  inline links, card density, short-height menus, invalid forms, selected
  navigation and workflow paint. Only a failing case was repeated.
- Responsive route proofs pass for company, marketing and fixture-backed SYS.
  Current local SYS application work remains a separate source boundary.
- Eleven final source gates pass: scoped CSS lint, syntax, semantic alias
  safety, declaration fingerprints, ownership, browser compatibility, package
  integrity, React test lint/format, generated granular docs and doc drift.
- Every installed public export matches its reviewed source. Every packed UI
  file matches the frozen export and the tarball integrity matches its metadata.
  Marketing transfer is 67.38 KiB CSS / 107.28 KiB JS gzip, within existing limits.

The initial two-preset React contrast batch exceeded five minutes. One-preset
batches retain every palette/mode and assertion. The WebKit identity check also
needed the measured engine-specific budget already used by the full theme
matrix; its retry passed without changing product code or assertions. The broad
contrast replay was interrupted when manual inspection exposed the mixed-class
gradient defect. Its solid-fallback audit is not direct gradient contrast proof,
and its partial results are not reported as final full-matrix acceptance.

## Browser and artifact evidence

Gnomie Browser Commander runtime tools remain unavailable. Its workflow used the
available local Opera surface and separate deterministic Playwright checks.
Manual inspection verified the corrected Tactile dark button and readable
feedback, company communication copy and selected marketing workflow content.
Cloud Browser Use cannot reach these loopback previews. Firefox is not included
in this continuation. No recording, authentication or external form submission
was involved.

- [Final React Tactile feedback](evidence/plan-continuation-20261029/react-tactile-dark.png)
- [Company About on phone](evidence/plan-continuation-20261029/company-about-390.png)
- [Selected marketing workflow](evidence/plan-continuation-20261029/marketing-workflow-390.png)
- [Checks and limits](evidence/plan-continuation-20261029/verification.json)
- [Exact package identities](evidence/plan-continuation-20261029/runtime-identity.json)

Local previews: company http://127.0.0.1:4691/about, marketing
http://127.0.0.1:4702/, React http://127.0.0.1:4694/demo/.
The user's existing demo at port 5500 is preserved.

## Remaining release boundary

SYS review #237 now conflicts with an advancing v2 base. A clean merge candidate
preserves both CSS-audit and portal-navigation documentation entries and freshly
generates 116 reference files; its diff against that captured base remains the
original eleven CSS review files. The base advanced again during verification,
so that prepared resolution was not applied and no SYS working files changed.
Reconcile those documentation entries against the stable latest base before merge.

The package is an unpublished same-version 2.6.2 candidate, identified by its
tarball hash rather than a public version claim. The prior 2.7.0 UI / 2.2.0 React
release proposal remains a separate decision. Publish UI first, raise the React
CSS peer floor and publish React, then admit consumer pins and run normal frozen
release gates before authorized merges/deployments. No publication, PR merge,
deployment, SYS migration or managed-client change occurred here. Remote CI is
deferred under the existing draft-review budget; no green remote CI is claimed.
