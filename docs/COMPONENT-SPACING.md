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
