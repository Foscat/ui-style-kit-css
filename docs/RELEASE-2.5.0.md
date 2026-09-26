# v2.5.0 release notes

UI Style Kit CSS 2.5.0 is a backward-compatible minor release that
expands the stable semantic component API from 29 to 75 selectors.

## Scope

- Tier A promotes tabs, pagination, breadcrumb, skeleton, empty state, metric,
  chip, avatar, stepper, and toast patterns.
- Tier B promotes popover, menu, segmented-control, file-upload, dropzone, and
  listbox patterns.
- Semantic chip and toast variants continue to use `data-ui-variant`.
- Skeleton shape and step workflow state use explicit, documented data hooks.
- Preset-prefixed classes remain supported for compatibility and advanced use.

Every stable `.ui-*` selector maps to a universal preset-prefixed source suffix.
The build emits specificity-safe aliases beneath the active `data-ui` root, and
the shared foundation resolves visual paint through that preset's native tokens.
React or application code continues to own selection, focus, dismissal, file
handling, and other behavior.

The reviewed companion release set is `interactive-surface-css@1.7.3` and
`layout-style-css@3.2.3`. The compatibility manifest pins their immutable
release commits so CI and publication cannot silently substitute branch heads,
dirty working trees, or stale registry artifacts.

## Verification boundary

Focused semantic source, generated alias, runtime-markup, artifact-integrity,
and pairwise identity checks are required before the full release gate. The
identity metric uses a one-percent perceptual threshold and viewport-specific
component floors so restrained preset palettes remain measurable without
pair-specific exceptions. Browser matrix, package preflight, registry
publication, tag creation, and deployment remain separate proofs.
