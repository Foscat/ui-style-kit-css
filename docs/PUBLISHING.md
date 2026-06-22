# Publishing Guide

## Dry run

```bash
npm run check
npm run pack:dry-run
```

`npm run check` rebuilds dist CSS, runs stylelint, executes package, class API, shared theme-color, and vendor-prefix unit checks, validates core text/link contrast pairs and filled component `on-*` contrast pairs, and confirms package metadata. `npm run pack:dry-run` shows the exact files that would publish.

## Publish

```bash
npm publish
```

For GitHub releases, create or dispatch a release for the matching package tag, such as `v2.0.1`. The release workflows verify that `package.json`, `package-lock.json`, `CHANGELOG.md`, and generated dist banners are aligned before publishing.

## Versioning

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

Use patch for fixes, minor for new themes/styles, and major for breaking public API changes. The 2.x release line is major because color-scheme authoring moved from per-UI `--<prefix>-*-rgb` blocks to shared `--usk-*-rgb` roles in `styles/theme-colors.css`.
