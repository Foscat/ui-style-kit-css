# Publishing Guide

## Dry run

```bash
npm run check
npm run pack:dry-run
```

`npm run check` rebuilds dist CSS, runs stylelint, executes unit package checks, verifies contrast pairs, and confirms package metadata. `npm run pack:dry-run` shows the exact files that would publish.

## Publish

```bash
npm publish
```

For GitHub releases, create or dispatch a release for the matching package tag, such as `v1.2.2`. The release workflows verify that `package.json`, `package-lock.json`, and `CHANGELOG.md` are aligned before publishing.

## Versioning

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

Use patch for fixes, minor for new themes/styles, and major for breaking public API changes.
