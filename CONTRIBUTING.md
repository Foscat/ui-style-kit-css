# Contributing

## Local workflow

```bash
npm install
npm run check
```

The library is CSS-only for consumers. Build and validation scripts run with Node and do not create runtime dependencies for package users.

## Adding or changing a style system

1. Keep the public `data-ui`, `data-theme`, and `data-mode` API stable.
2. Preserve class prefixes.
3. Include the native HTML coverage and accessibility layer.
4. Run `npm run check` before publishing.
5. Update `STYLE-MAP.md`, `docs/TOKENS.md`, and `CHANGELOG.md` for public API changes.

## Versioning

- Patch: CSS fixes, docs fixes, small accessibility corrections.
- Minor: new UI style, new theme, new public utility classes.
- Major: breaking token names, class names, mode names, or import paths.
