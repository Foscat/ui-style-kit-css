# Theming Model

UI Style Kit CSS uses three root-level attributes:

- `data-ui` selects the style system.
- `data-theme` selects one of the 20 color schemes.
- `data-mode` selects `light`, `dark`, or `contrast`.

## Attribute Pattern

```html
<body data-ui="minimal-saas" data-theme="arctic-indigo" data-mode="light">
```

All style files follow this selector shape:

- `:where([data-ui][data-theme="<theme>"][data-mode="<mode>"])` in `styles/theme-colors.css` for concrete shared RGB palette values.
- `[data-ui="<style>"][data-mode="<mode>"]` for mode-level behavior such as `color-scheme`, alpha density, shadows, and contrast behavior.
- `[data-ui="<style>"][data-theme][data-mode]` in each UI file for prefixed alias assembly and UI composition tokens.

## Token Flow

```txt
Shared color scheme channels
  -> prefixed RGB aliases
  -> functional UI and native tokens
  -> rendered UI
```

The shared theme/mode block stores raw `--usk-*` RGB channels. Each UI file maps those channels to its prefix, exposes a small functional API, and keeps component and native-element defaults on that API. The shared native layer reads `--usk-native-*` tokens so each preset can provide visual treatment without repeating native selectors.

## Token Layers

Each style uses a prefix-scoped token model:

1. Foundation tokens: spacing, radii, typography, transitions.
2. Mode modifiers: alpha and contrast behavior by `data-mode`.
3. Shared palette channels: `--usk-bg-rgb`, `--usk-text-rgb`, `--usk-primary-rgb`, etc.
4. Prefixed RGB aliases: `--<prefix>-bg-rgb`, `--<prefix>-text-rgb`, `--<prefix>-primary-rgb`, etc.
5. Functional aliases: `bg`, `fg`, `surface`, `surface-fg`, `text`, `muted`, `border`, `control-bg`, `control-fg`, `link`, and semantic palette aliases.
6. Filled-surface text aliases: `on-primary`, `on-secondary`, `on-accent`, `on-success`, `on-warning`, and `on-danger`.
7. Native fallback aliases: `--usk-native-*` tokens for shared element selectors.
8. UI composition aliases: `theme-bg`, `card-bg`, `control-bg`, tooltip tokens, and spinner tokens.

Example from the `saas` prefix model:

```css
:root {
  --saas-space-4: 1rem;
  --saas-radius-md: 0.75rem;
}

[data-ui="minimal-saas"][data-theme][data-mode] {
  --saas-bg-rgb: var(--usk-bg-rgb);
  --saas-text-rgb: var(--usk-text-rgb);
  --saas-primary-rgb: var(--usk-primary-rgb);
  --saas-primary-text-rgb: var(--usk-primary-text-rgb);
  --saas-bg: rgb(var(--saas-bg-rgb));
  --saas-text: rgb(var(--saas-text-rgb));
  --saas-fg: var(--saas-text);
  --saas-surface: rgb(var(--saas-surface-rgb) / var(--saas-panel-alpha));
  --saas-surface-fg: var(--saas-text);
  --saas-primary: rgb(var(--saas-primary-rgb));
  --saas-on-primary: rgb(var(--saas-primary-text-rgb));
  --saas-focus-ring: 0 0 0 3px rgb(var(--saas-focus-rgb) / var(--saas-focus-alpha));
}
```

## Shared Theme Set

All 20 styles define the same themes:

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
- `chrome-navy`
- `recycled-emerald`
- `industrial-orange`
- `performance-red`
- `heritage-brass`
- `service-blue-red`
- `newsprint-crimson`
- `foundry-amber`
- `soft-orchid`
- `electric-noir`


## Modes

- `light`: lighter surfaces and lower shadow density.
- `dark`: darker surfaces and stronger shadow depth.
- `contrast`: high-separation palette choices for stronger legibility.

## Safe Overrides

Use scoped custom properties instead of editing classes directly:

```css
:where([data-ui][data-theme="arctic-indigo"][data-mode="light"]) {
  --usk-primary-rgb: 37 99 235;
  --usk-primary-hover-rgb: 29 78 216;
  --usk-primary-text-rgb: 255 255 255;
}

[data-ui="minimal-saas"] {
  --saas-radius-md: 1rem;
}
```

When overriding a filled color substantially, review the matching shared `--usk-*-text-rgb` role and the prefixed `on-*` alias used over that filled surface. For normal text, prefer `--<prefix>-text`, `--<prefix>-text-muted`, and `--<prefix>-link`.

## v2.0.1 Migration

Before the v2 token model, each UI file repeated concrete color values under selectors such as `[data-ui="minimal-saas"][data-theme="arctic-indigo"][data-mode="light"]`. In `v2.0.1`, those values live once in `theme-colors.css` under `:where([data-ui][data-theme="arctic-indigo"][data-mode="light"])`, and native selectors live once in `native-elements.css`.

- Add or change schemes with `--usk-*` roles.
- Keep component code on prefixed functional tokens.
- Import `ui-style-kit-css/theme-colors.css` and `ui-style-kit-css/native-elements.css` before a standalone UI style if your toolchain does not resolve CSS `@import`.

## Prefix Rule

Classes are prefix-bound to `data-ui`.

- If `data-ui="minimal-saas"`, use `saas-*` classes.
- If `data-ui="retro-glass"`, use `rg-*` classes.

Mixing prefixes in one component tree causes inconsistent styling.
