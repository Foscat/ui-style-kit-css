# Theming Model

UI Style Kit CSS uses three root-level attributes:

- `data-ui` selects the style system.
- `data-theme` selects one of the 10 color schemes.
- `data-mode` selects `light`, `dark`, or `contrast`.

## Attribute Pattern

```html
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
```

All style files follow this selector shape:

- `[data-ui="<style>"][data-mode="<mode>"]` for mode-level behavior.
- `[data-ui="<style>"][data-theme][data-mode]` for semantic token assembly.
- `[data-ui="<style>"][data-theme="<theme>"][data-mode="<mode>"]` for concrete palette values.

## Token Layers

Each style uses a prefix-scoped token model:

1. Foundation tokens: spacing, radii, typography, transitions.
2. Mode modifiers: alpha and contrast behavior by `data-mode`.
3. Semantic tokens: `bg`, `surface`, `text`, `border`, `primary`, `secondary`, `success`, `warning`, `danger`, `link`, `focus`.
4. Raw palette channels: `--<prefix>-*-rgb`.

Example from the `saas` prefix model:

```css
:root {
  --saas-space-4: 1rem;
  --saas-radius-md: 0.75rem;
}

[data-ui="minimal-saas"][data-theme][data-mode] {
  --saas-bg: rgb(var(--saas-bg-rgb));
  --saas-primary: rgb(var(--saas-primary-rgb));
  --saas-focus-ring: 0 0 0 3px rgb(var(--saas-focus-rgb) / var(--saas-focus-alpha));
}
```

## Shared Theme Set

All 11 styles define the same themes:

- `midnight-gold`
- `ocean-steel`
- `forest-moss`
- `sunset-ember`
- `royal-plum`
- `graphite-cyan`
- `desert-sage`
- `rose-quartz`
- `cyber-lime`
- `arctic-indigo`

## Modes

- `light`: lighter surfaces and lower shadow density.
- `dark`: darker surfaces and stronger shadow depth.
- `contrast`: high-separation palette choices for stronger legibility.

## Safe Overrides

Use scoped custom properties instead of editing classes directly:

```css
[data-ui="minimal-saas"][data-theme="arctic-indigo"][data-mode="light"] {
  --saas-primary-rgb: 37 99 235;
  --saas-primary-hover-rgb: 29 78 216;
}
```

## Prefix Rule

Classes are prefix-bound to `data-ui`.

- If `data-ui="minimal-saas"`, use `saas-*` classes.
- If `data-ui="retro-glass"`, use `rg-*` classes.

Mixing prefixes in one component tree causes inconsistent styling.
