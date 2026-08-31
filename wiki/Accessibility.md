# Accessibility

UI Style Kit CSS provides presentation-level accessibility helpers. Semantic structure and interaction behavior are still application responsibilities.

## Included in All 20 Styles

- Visible focus treatment (`:focus-visible`)
- Reduced motion support (`@media (prefers-reduced-motion: reduce)`)
- Native HTML coverage for common typography/form/table elements
- Visible tooltip surfaces through prefixed utilities and generic `[role="tooltip"]` hooks
- Theme-aware text utilities, filled-surface `on-*` colors, 4.5:1 text contrast checks, and 3:1 light-mode component-edge checks
- Shared `--usk-*` color-scheme roles with a manifest-driven audit of all 20 presets, 20 schemes, and three modes

The following are also present in every preset:

- `prefers-contrast: more` media support
- `forced-colors: active` media support
- print media styles
- helper classes:
  - `*-sr-only`
  - `*-visually-hidden`
  - `*-skip-link`

## Practical Guidance

1. Use semantic HTML landmarks (`main`, `nav`, `section`, `h1`-`h6`) first.
2. Keep keyboard focus order valid when toggling or moving UI.
3. Do not rely on color alone for state communication.
4. Pair style classes with real form labels and error text.
5. Use ARIA only where native elements cannot express the state.
6. Use normal text aliases (`text`, `text-muted`, `link`) for body copy and reserve semantic palette colors for emphasis, status indicators, or filled UI.

## Example: Skip Link + Main Landmark

```html
<a class="saas-skip-link" href="#main">Skip to content</a>
<main id="main" class="saas-page">
  ...
</main>
```

Use the matching prefix (`saas-`, `bento-`, `retro-`, etc.) for the selected `data-ui`.

## Loading states

Spinner utilities are visual indicators only. Use accessible names or status text when loading state is meaningful:

```html
<button class="saas-button saas-button-primary" aria-busy="true">Saving</button>
<span class="saas-spinner" role="status" aria-label="Loading"></span>
```

`aria-busy="true"` on themed buttons adds an inline spinner automatically. Its shape follows the active UI preset, remains separated from the label, and does not replace readable status copy. Remove the attribute when the action completes.

## Tooltip surfaces

Tooltip classes are presentation helpers. Connect them to controls with application-managed IDs, `aria-describedby`, hover/focus behavior, and dismissal logic when tooltips are interactive or dynamic.

## Native element coverage

The themed native layer now includes semantic containers, definition lists, inline semantics, menu/search, media embeds, options, and loading states. This gives plain HTML a themed baseline, but it does not replace correct document structure, labels, and ARIA state management.
