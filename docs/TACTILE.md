# Tactile workspace components

Use `data-ui="tactile"` and `data-mode="light"`, `dark`, or `contrast` on the
owning root. Omit `data-theme` for the native material palette; a named theme
repaints the existing materials through shared `--usk-*-rgb` roles.

Import `ui-style-kit-css/tactile.css` for the complete preset or
`ui-style-kit-css/visual/tactile.css` for the focused visual distribution.
Existing semantic `.ui-*` components, native controls, and `tactile-*` classes
remain available without the workspace composition.

## Advanced workspace inventory

The authored workspace classes are listed in
`manifest.classApi.presetExtras.tactile` so consuming tools can discover them.
They are an optional preset-specific composition, not new universal `.ui-*` aliases.

| Area | Classes (with the `tactile-` prefix) |
| --- | --- |
| Frame and navigation | `workspace-shell`, `workspace-sidebar`, `workspace-menu`, `workspace-link`, `workspace-icon`, `workspace-sidebar-note` |
| Identity | `workspace-brand`, `workspace-brand-mark`, `workspace-header`, `workspace-title` |
| Main settings | `workspace-main`, `workspace-body`, `workspace-settings`, `workspace-row`, `workspace-fields`, `workspace-switches` |
| Instrument panels | `workspace-security`, `workspace-readiness`, `workspace-gauge`, `workspace-gauge-key`, `workspace-shelf`, `workspace-progress` |

Keep real links, labels, inputs, and buttons inside these visual containers.
Use `aria-current="page"` for an active workspace link. CSS supplies appearance;
application code owns navigation, settings persistence, and instrument values.

## Material colors and accessibility

Native mode exposes preset material RGB channels such as paper and ink in the
[demo workbench](DEMO-SHOWCASE.md). Native exports target `--tactile-*-rgb`;
named-theme exports retain `--usk-*-rgb`. The shared background token resolves
to the final Tactile background instead of requiring an explicit theme.

Trust-seal captions inherit their paired foreground, including the dark
instrument treatment. Recheck contrast after custom palette edits. Passing token
checks does not replace keyboard, zoom, screen-reader, and rendered contrast QA.
