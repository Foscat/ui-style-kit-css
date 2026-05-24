# Accessibility

UI Style Kit CSS provides presentation-level accessibility helpers. Semantic structure and interaction behavior are still application responsibilities.

## Included in All 11 Styles

- Visible focus treatment (`:focus-visible`)
- Reduced motion support (`@media (prefers-reduced-motion: reduce)`)
- Native HTML coverage for common typography/form/table elements

## Included in Full Utility Styles (7 Styles)

The following are present in `minimal-saas`, `bento`, `maximalist`, `bauhaus`, `tactile`, `neumorphism`, and `retrofuturism`:

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

## Example: Skip Link + Main Landmark

```html
<a class="saas-skip-link" href="#main">Skip to content</a>
<main id="main" class="saas-page">
  ...
</main>
```

Use the matching prefix (`saas-`, `bento-`, `retro-`, etc.) for the selected `data-ui`.
