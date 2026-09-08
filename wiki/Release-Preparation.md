# Release Preparation

The current local target is `ui-style-kit-css@2.4.0`. The package version, lockfile,
manifest, generated bundle banners, README, changelog, and maintained documentation
must agree before publication.

The release includes native palettes, the unified demo and style-specific gallery,
refined preset controls, native material-color editing, and preserved v2 imports.
Default, visual, focused, and optional bridge compositions remain supported.

Run focused regressions during development. At final verification, rebuild assets,
check CSS lint, documented imports, semantic contracts, contrast, compatibility,
ownership, package contents, and the complete authorized browser/ecosystem gates.
Do not treat static checks as rendered accessibility or cross-browser proof.

The tracked `wiki/` directory is the local source. These edits do not publish the
hosted GitHub Wiki. A release tag, GitHub Release, npm publication, wiki publication,
and deployment are separate actions requiring an explicit handoff.

See the repository's maintained [publishing guide](https://github.com/Foscat/ui-style-kit-css/blob/main/docs/PUBLISHING.md)
for protected workflows and resumable matrix commands. Do not publish while a
required gate is failed, blocked, or unverified.
