# Token Contract

Each UI style uses its own prefix, but the token shape is intentionally consistent.

## Prefixes

| UI style | Prefix |
|---|---:|
| Minimal SaaS | `saas` |
| Bento UI | `bento` |
| Maximalist / Playful | `max` |
| Bauhaus / Swiss Modern | `bau` |
| Skeuomorphic / Tactile | `tactile` |
| Neumorphism | `neo` |
| Retrofuturism | `retro` |
| Brutalism | `brutal` |
| Cyberpunk | `cyber` |
| Y2K | `y2k` |
| Retro Glass | `rg` |

## Stable token families

Replace `<prefix>` with the style prefix:

```css
--<prefix>-bg
--<prefix>-surface
--<prefix>-surface-strong
--<prefix>-surface-soft
--<prefix>-text
--<prefix>-text-muted
--<prefix>-border
--<prefix>-primary
--<prefix>-primary-hover
--<prefix>-primary-text
--<prefix>-secondary
--<prefix>-secondary-hover
--<prefix>-secondary-text
--<prefix>-accent
--<prefix>-success
--<prefix>-warning
--<prefix>-danger
--<prefix>-link
--<prefix>-focus
```

Most systems also expose RGB source tokens such as:

```css
--<prefix>-primary-rgb
--<prefix>-border-rgb
--<prefix>-focus-rgb
```

These are useful for custom alpha effects:

```css
.my-component {
  border-color: rgb(var(--saas-primary-rgb) / 0.35);
}
```

## Override example

```css
/* Consumer CSS is unlayered, so it overrides the library's layered rules cleanly. */
[data-ui="minimal-saas"][data-theme="arctic-indigo"] {
  --saas-radius-md: 1rem;
  --saas-primary-rgb: 72 91 255;
}
```
