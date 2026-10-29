# Shared component spacing and structural composition

UI Style Kit owns component appearance and internal geometry. Layout Style CSS
owns page arrangement, measures, gutters and section rhythm. Interactive Surface
CSS owns state feedback. React exposes those contracts without another paint layer.

## Choose the existing owner

| Need | Public configuration |
| --- | --- |
| Paragraph hyperlink | A classless native anchor, or `data-link-presentation="inline"` on a classed anchor |
| Aligned navigation action | `data-link-presentation="control"`; use the navigation component for current-page semantics |
| Card content inset | `data-card-spacing="flush\|compact\|normal\|comfortable"` on `.usk-card` or `.ui-card` |
| Structural shell, article or aside | `data-ui-structure="neutral"` with the optional component-composition stylesheet |
| Wider content lane | Layout `.ly-wrapper--content`, `--wide`, `--workspace`, `--full` or `--breakout` |
| Screen gutter | Layout `--ly-wrapper-gutter`; the wrapper incorporates the device safe area |
| Section block spacing | Layout `.ly-section`, `--compact` or `--flush` |
| Centering or wrapping actions | Layout center/cluster primitives and their public alignment/gap options |

React candidates expose `Link presentation`, `Card spacing`, `Layout.Wrapper
measure`, and `Layout.Section spacing`. Undecorated Layout article/aside semantics
carry the neutral structural hook. Existing wrapper and section APIs require no
new Layout release.

## Inline links

```html
<p>Read <a href="/guide">the guide</a>, then continue.</p>
<a class="usk-link" data-link-presentation="inline" href="/guide">
  <span class="usk-link__label">A long wrapping guide title</span>
</a>
```

The link and label have no independent margin, padding, border or control fill.
Focus and theme colors remain available. Omitting the presentation attribute on
an existing classed link retains its preset defaults. Control presentation adds
inline alignment and uses `--usk-link-gap`; it does not turn navigation into a
button action or replace the application's accessible name.

## Card density

```html
<div class="usk-card" data-card-spacing="comfortable">
  <article data-ui-structure="neutral">Structural content inside one card.</article>
</div>
```

| Density | Default inset | Optional token |
| --- | --- | --- |
| flush | 0 | No inset |
| compact | .75rem | `--usk-card-padding-compact` |
| normal | 1rem | `--usk-card-padding-normal` |
| comfortable | `clamp(1.25rem, 2.5vw, 2rem)` | `--usk-card-padding-comfortable` |

Omitting density preserves the preset's card inset. Configure the density token
at an application boundary when product composition needs another measure;
avoid descendant `.usk-card` padding overrides. Compound card regions remain
available for media and content composition.

Native article/aside decoration remains the default. Neutral structure is an
explicit opt-in, so existing standalone semantic panels retain their appearance.
The same hook is available on div, main, section, header, footer and navigation
boundaries to prevent the element floor from accumulating through a nested shell.
Layout's later structural layer continues to own configured gutters and section
padding. React's neutral Layout article/aside treatment is automatic; other
neutral shell boundaries remain explicit native data attributes.

## Compact components and feedback

Empty-state symbols use `--usk-empty-state-icon-size` (default `2.75rem`) so
compact preset typography does not reduce the illustration to body-text size.
Chip, tab and segment frames use `--usk-compact-content-padding-block` (`.35rem`)
and `--usk-compact-content-padding-inline` (`.65rem`). Status badges use
`--usk-badge-padding-block` (`.22rem`) and `--usk-badge-padding-inline` (`.6rem`).
These are frame insets; compound labels and icons do not add another inset.
Popover, menu and listbox frames use `--usk-overlay-padding` (`.5rem`);
menu items and listbox options use `--usk-option-padding-block` (`.55rem`)
and `--usk-option-padding-inline` (`.7rem`) to keep their text clear of edges.

Progress tracks and fills do not inherit the element-spacing floor. Switch
thumbs use `--usk-switch-thumb-size` (`1.125rem`) and remain centered inside the
track at either end. Presets continue to supply their silhouettes and materials;
native slider thumbs use the preset's action color.

A toast with a direct title places that title above its content, across the full
available row. Title and body text wrap at word boundaries rather than splitting
letters into a narrow side column. The toast owns its content inset through
`--usk-toast-padding` (`1rem`). Page columns and the surrounding card layout remain
Layout Style CSS or application responsibilities.

Tooltip tone and placement are independent:

```html
<span class="usk-tooltip" data-ui-variant="primary" role="tooltip">Primary tip</span>
<span class="usk-tooltip" data-ui-variant="secondary" role="tooltip">Context cue</span>
<span class="usk-tooltip" data-ui-variant="accent" role="tooltip">Action hint</span>
```

Primary uses the paired action fill and ink. Secondary uses an outlined context
treatment, and accent uses a double edge and the paired accent colors. Existing
unqualified tooltips keep their preset defaults. Advanced prefixed markup can
combine, for example, `saas-tooltip saas-tooltip-right saas-tooltip-secondary`.

Secondary buttons use paired secondary fill and ink to remain distinct from ghost
actions. Warning buttons and badges use the warm warning palette and a slow
brightness pulse; text stays opaque. `--usk-warning-attention-duration` defaults
to `1.8s`. Reduced-motion users receive the static warm treatment. Disabled radios
use muted paint and a dashed edge; forced-color mode retains system colors.

These contracts are covered by `tests/e2e/demo-annotation-regressions.spec.js`.

Status messages retain success, warning and danger tints after preset material
rules. Titles and body copy use the same readable message ink. Status color
remains in the surface tint, leading edge and symbol; title hierarchy comes from
the preset's weight and typography. Small titles do not need text shadows or
outlines to compensate for a low-contrast foreground.
Browsers without `color-mix()` retain solid status fills with paired readable
foregrounds; the tinted treatment is a guarded enhancement.

Icon tiles pair their ink with the painted face, including inverted theme
materials and translucent plates. Metallic rims remain decorative around a
stable glyph surface. Busy indicators retain preset geometry while using visible
paint against the actual button face; palette accent fill alone is insufficient
for a small moving mark. The shared coverage is in
`tests/e2e/feedback-visibility.spec.js`.

Paper Editorial message symbols occupy a fixed 24px lane and stay centered
against the full message, including wrapped copy. Text and optional dismiss
buttons occupy separate grid columns. Native loader hooks must retain the active
preset's geometry, paint and animation, including decorative pseudo-elements.
These contracts are covered by `tests/e2e/feedback-layout.spec.js`.

## Migration and validation

The inline link and component-label fixes correct the global element spacing
floor. Optional component composition also owns modal auto margins, avatar
fallback centering and chip-label containment. Edge drawers retain their
placement contract. These contracts have focused browser regressions in
`tests/e2e/css-ownership-composition.spec.js`.

Consumer migrations must be checked against the exact packed candidate artifacts.
An unchanged published dependency pin does not mean these candidate contracts
are present in that installed release. Publish UI Style Kit before adopting the
React/consumer release pair; temporary tarball references belong only in ignored
integration fixtures.

## React variant attributes and prefixed classes

React buttons may combine a semantic class, a preset class and
`data-ui-variant`. Legacy neutral-only paint rules exclude attribute-selected
variants through `:where(:not([data-ui-variant]))`. This keeps their specificity
stable while allowing the selected primary, secondary, danger or ghost surface
to retain its paired foreground and decoration. The mixed-class regression
checks all presets, palettes, modes and pressed states.
