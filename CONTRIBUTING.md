# Contributing

Thanks for contributing to UI Style Kit CSS.

## Ground Rules

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Keep changes focused and scoped.
- Prefer additive, backward-compatible class changes for existing prefixes.
- Document any public API changes in README/wiki.

## Local Workflow

1. Fork and clone the repository.
2. Create a branch: `git checkout -b feat/your-change`.
3. Make your changes.
4. Run lint:
   - `npm install`
   - `npm run lint:css`
5. Commit with a clear message.
6. Open a pull request.

## Pull Request Checklist

- [ ] Change is scoped and intentional.
- [ ] CSS naming aligns with the active style prefix convention.
- [ ] No unintended regressions in existing styles.
- [ ] README/wiki updated when public behavior changed.
- [ ] Lint passes locally.

## Reporting Bugs

Use GitHub Issues and include:

- Expected behavior
- Actual behavior
- Reproduction steps
- Browser + version
- Screenshots if visual regression is involved

## Feature Requests

Open an issue first for significant additions (new style systems, major API expansion) to align direction before implementation.
