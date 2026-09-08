# v2.4.0 release preparation

Status: local release candidate; not published by this task.

## Compatibility contract

- Package, lockfile, and manifest remain version `2.4.0`.
- All 20 presets, 20 shared themes, three modes, 29 semantic selectors, and v2 import paths remain supported.
- `data-ui` and `data-mode` are required; omit `data-theme` for a native palette.
- Named themes retain shared `--usk-*` color ownership. Native demo edits target actual preset RGB variables, including material-specific colors.
- The typed `--ui-color-bg` resolves through `--usk-native-bg` to the active preset background.
- Existing companion compatibility pins remain unchanged; this task does not upgrade sibling libraries.

## Prepared changes

The accumulated candidate includes reference-driven preset refinements and native
control coverage. This audit adds shared trust-seal text inheritance, the native
background handshake fix, material-aware palette editing, validated demo deep
links, and Organic Modern native-light contrast corrections. Recent Maximalist and
Tactile annotation corrections remain included. Generated documentation and demo
entrypoints now use the same bounded file-lock retries as distribution CSS.
The manifest now inventories existing Bento, Bauhaus, Clay, and Tactile workspace
classes that were absent from capability metadata. Organic's duplicate `field`
entry was removed from preset extras because it remains a universal capability;
authored component behavior is unchanged by these metadata corrections.

The default demo presents one unified kit with a style-specific gallery. Industrial
Utility's instruments and local alarm flow remain visible. Original complete boards
are available through `?view=reference`, not duplicated above the public showcase.

README, token/native/style guides, changelog, contributor/publishing instructions,
and tracked wiki sources describe the same native/theme model. Focused CSS bundle
sizes and demo asset hashes are regenerated from actual build output.

## Verification boundary

Focused regression checks are run per changed behavior. Final local checks cover
build output, lint, syntax, documented imports, semantic and package contracts,
contrast, browser-free compatibility, and ownership. Record actual results below;
do not infer current results from old snapshots or prior design-QA reports.

Browser navigation was blocked by an admin-policy verification error in the Codex
browser path. No alternate browser or file-URL workaround was used. Rendered
desktop/mobile comparisons, browser interactions, Axe, the 3,600-case engine
matrix, and packed-browser ecosystem verification remain unverified in this audit.

### Final local results

- Build: passed; default, visual, all 20 focused, and bridge bundles regenerated, together with manifest snapshots, README measurements, and asset hashes.
- CSS lint: passed after the final source and tooling changes.
- Contrast: passed all 1,200 named-theme combinations and 60 native fallback palettes. This is token-pair arithmetic, not rendered accessibility certification.
- CSS compatibility: passed 26 generated entrypoints against 60 resolved browser targets; this is a parser/policy check, not execution in those browsers.
- CSS ownership: passed 35,799 declarations with zero reviewed exceptions.
- Package integrity: passed; exports, tracked documentation links, wiki routes, release-version surfaces, semantic producer contracts, measured bundle sizes, and demo asset hashes have focused checks.
- Focused regressions: passed native-material inventory/edit/export/reset isolation, None/null selection, deep links, seal foreground inheritance, all-preset background mapping, Organic contrast, and generated-file retry/error handling. Checks were run individually; no full unit or CI suite was run.
- Dependency audit: `npm audit --audit-level=moderate` passed with zero reported vulnerabilities after the targeted `fast-uri` patch below.
- Packaging dry run: `npm pack --dry-run --ignore-scripts --json` passed with 125 files (approximately 12.6 MiB packed / 31.4 MiB unpacked). The release/demo/Tactile guides are included; demo, test, wiki, and temporary output directories are excluded. Lifecycle hooks were disabled, so this was inventory validation, not the full prepublish chain.

### Development-tooling security correction

The installed chain was `stylelint → table → ajv → fast-uri@3.1.5`. AJV uses the
URI resolver for schema references; no URI fetch path or runtime JavaScript
dependency was established in this CSS package. The confirmed finding was the
vulnerable installed tooling and failed audit gate, not a demonstrated application
SSRF endpoint.

The security-fix checklist kept this change to the existing override, lockfile,
and focused regression coverage: `fast-uri@3.1.6`, within AJV's supported v3 range.
The upstream patch addresses [URI canonicalization advisories](https://github.com/fastify/fast-uri/releases/tag/v3.1.6).
The malformed-IPv6 regression failed before the update and passed afterward;
encoded schemes, nested host escapes, and scheme-relative IDN normalization also
passed. Ordinary URI resolution, AJV schema references, the exact override
contract, and CSS lint passed. No network requests were made by these URI fixtures.

Only one installed package changed. Other overrides, direct dependencies, public
CSS imports, and consumer APIs were preserved. Browser and packed-consumer proof
remain outside this narrow tooling fix and are still pending for the release.

## Publication handoff

Do not tag, publish, or merge on the strength of static checks alone. Complete the
required browser and packed-consumer gates using [Publishing](PUBLISHING.md), review
the full candidate diff, and obtain the requested release authority. Set the real
release date in the changelog at that handoff. The tracked `wiki/` sources still
need a separate hosted-wiki publication step.

No commit, push, release tag, GitHub Release, npm publication, or deployment is part
of this local preparation task.
