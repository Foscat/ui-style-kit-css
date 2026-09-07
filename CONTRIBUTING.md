# Contributing

## Local workflow

```bash
npm install
npm run check
```

The library is CSS-only for consumers. Build and validation scripts run with Node and do not create runtime dependencies for package users.

## Adding or changing a style system

1. Keep the public `data-ui`, `data-theme`, and `data-mode` API stable unless preparing a documented major version.
2. Preserve class prefixes and prefixed functional tokens.
3. Define named color schemes in `styles/theme-colors.css` as shared `--usk-*` roles. Keep each preset's native light/dark/contrast palette in its source file, preserve explicit-theme precedence, and verify both paths.
4. Include the native HTML coverage and accessibility layer.
5. Run `npm run check` before publishing.
6. Update `STYLE-MAP.md`, `docs/TOKENS.md`, `README.md`, wiki pages, and `CHANGELOG.md` for public API changes.

Use focused tests during implementation and the complete release gate at the end.
Rebuild after source CSS edits because both demo entrypoints load generated `dist/`
assets. The build also refreshes manifests, bundled icons, README size measurements,
and demo cache hashes. Reusable JavaScript helpers should carry JSDoc-compatible
comments; do not hand-edit generated output. The tracked `wiki/` pages are local
wiki sources; updating them alone does not publish the hosted GitHub Wiki.

## Versioning

- Patch: CSS fixes, docs fixes, small accessibility corrections.
- Minor: new UI style, new theme, new public utility classes.
- Major: breaking token names, class names, mode names, or import paths.
