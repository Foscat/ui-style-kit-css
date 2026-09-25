# v2.4.2 release preparation

UI Style Kit CSS 2.4.2 is a backward-compatible release candidate focused on
consumer composition. It does not add a preset, theme, selector, component
variant, or package export.

## Candidate scope

- Preserve consumer-owned width, sticky-position, and internal-scroll rules
  when the visual bundle loads after application CSS.
- Verify semantic cards at 320px and 390px with selects, ranges, progress,
  wide tables, icon-only controls, and long content.
- Verify a short-height card keeps its toolbar sticky and its content region
  internally scrollable.
- Verify representative icon-only actions retain neutral or subtle preset paint
  and do not inherit the primary action treatment.
- Expand migration guidance for preset-prefixed hooks, preset-private tokens,
  and legacy `variant-*` state classes.

## Ecosystem alignment

The coordinated local candidate train is `ui-style-kit-css@2.4.2`,
`interactive-surface-css@1.7.1`, and `layout-style-css@3.2.1`. The checked-in
companion revisions remain the last reviewed immutable release baselines until
the candidate packages have stable commits. They must be refreshed to those
commits before remote release workflows can treat the candidate train as
publishable.

The supported minimum remains `ui-style-kit-css@2.1.0`,
`interactive-surface-css@1.5.0`, and `layout-style-css@3.0.0`.

## Verification boundary

Local build, lint, unit, focused browser, package, and candidate-tarball checks
are evidence for preparation only. They do not prove a commit, pull request,
tag, registry publication, or deployed site. Those external mutations require
separate approval and immutable companion revisions.
