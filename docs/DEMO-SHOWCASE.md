# Style Studio and reference fixtures

Both the project root and `demo/index.html` open the same Style Studio. Its shell keeps Minimal SaaS component structure and follows the selected named palette and mode through public library attributes. Each isolated preview selects its own style, palette, mode, and optional interaction feedback.

## Working views

**Examples** contains a searchable records dashboard, a validated settings form, and a customer-facing content page. These use deterministic sample data and local interactions. The settings example visibly saves or reports a simulated failure when its email contains `fail`; no remote account or record is changed.

**Components** opens a dense grid of 74 options covering every public component role. Search matches names and class names; family navigation becomes a compact native selector on phones. Each card has a Copy icon that copies its rendered element block with the selected public classes and icon artwork. Semantic `usk-*` classes are the default; advanced prefixed and native representations remain available. Keyboard tabs, native dialogs, form controls, and feedback are interactive. Canonical semantic markup remains mounted while appearance changes.

**Style details** lazily loads only the selected authored specimen and its icon dependencies. The studio does not extract component fragments from HTML comments. The original complete reference can also be opened separately.

## Comparison and palette editing

Choose **Compare styles** to pin A. The toolbar edits B; both sides share the same example and local interaction state. Desktop displays equal-width previews, and narrower screens provide an A/B switch. **Replace baseline** explicitly captures the current visual configuration and edits. Style details is a single-preview view; returning to Examples or Components restores an existing comparison.

**Style defaults** omits `data-theme`. Native color edits belong to the preset and mode; named-theme edits belong to the theme and mode and follow that theme across presets. On phones, appearance controls start collapsed while Compare and Customize remain visible. Open **Appearance** to change style, palette, mode, or corners.

**Corners** previews square, small, medium, or large corners on controls and surfaces. **Preset default** restores the preset’s authored geometry. Each comparison side retains its own choice. Shared URLs restore the selection, and setup markup includes `data-usk-corners` when a choice is active. Corner-only changes update geometry in place without palette reads or a loading transition. The collapsed Appearance summary and inspector identify the preset, palette, mode, and any corner override.

The editor includes the 23 shared roles and available native material RGB roles. Clay canvas, surfaces, ink, seams, and primary backgrounds and label ink use the same public RGB channels in native and named palettes; native defaults reflect the authored material colors. Primary channels contain the finished pigment without an additional color-mix dependency; the dark hover pair meets the 4.5:1 text threshold. Edits paint the preview and work in a standalone consumer of the exported CSS. Reset changes only the selected editing context.

Browser Back can restore a cached Studio document without rebuilding it. Persisted page transitions retain the authored board, local field values, delegated actions, observers, and pending sample-save completion. Permanent navigation still disposes those resources.

**Customize & export** provides setup markup, resolved palette CSS, selected example markup, CSS download, and a configuration URL. Shared URLs include the visual configuration, active palette edits, workspace selection, and pinned comparison. They exclude entered form text. Ordinary interactions do not create history entries.

Existing `?personality=maximalist` links work. `ui` takes precedence, and `?ui=tactile&theme=None&mode=dark` retains native-palette behavior. `?view=reference` opens the selected complete specimen in the studio. The standalone QA fixture lives at [reference.html](../demo/reference.html?view=reference).

## Companion icons (optional)

The demo uses pinned `ui-style-kit-icons@2.0.0` artwork. **Minimal SaaS monochrome** is the explicit default. **Match icons to style** selects each preview's own family, including separate comparison styles; **Themed icons** selects the companion's color treatment. Both preferences survive shared URLs and local preference storage. Filled action icons use the companion's public monochrome treatment to retain their action foreground.

**Customize & export, Code & export, Optional icon library** offers pinned CDN and NPM setup. The NPM example includes the asset-copy locations and public asset-base configuration. The CSS-only setup stays independently usable. Copied inline SVG blocks already contain their artwork; consumers only need the optional icon runtime when choosing the custom-element setup. Application behavior for copied controls remains consumer-owned. Setup for exported examples and copied blocks containing `ly-*` utilities includes the Layout Style CSS install, stylesheet, and `ly-root ly-page` body classes. A plain UI-only element keeps the minimal independent setup. The complete reference restores the same validated corners and native or named palette edits carried by its URL.

The build embeds exact licensed package SVGs in one lazy classic-script chunk per family and treatment, preserving HTTP and direct-file use. It normalizes variable-bearing SVG attributes with the companion's public `inlineSvg` helper and namespaces SVG fragment IDs. Appearance changes replace artwork without replacing inputs or focused buttons. The retained specimen icon registries use the same companion artwork through explicit compatibility name mappings.

## Architecture and maintenance

Authored JavaScript modules live in `demo/studio/`. Generated writes and companion copies preserve identical files, including their timestamps; changed outputs retain bounded Windows lock retries. Maintain `demo/demo.css` for shared Layout defaults and `demo/studio.css` for shell geometry and visibility. These two stylesheets are used directly; the build does not copy them into duplicate CSS files. The host owns configuration and URL history; each preview owns its DOM and disposable interactions. Frame messages validate the source window, origin where available, random channel, protocol version, and event type. Asynchronous rendering and error reports use separate generation and interaction revisions so typing cannot cancel a pending visual load. Failed replacement styles retain the last good preview and an actionable Retry state.

`scripts/build-studio.mjs` bundles classic scripts for HTTP and direct `file:` use. One shell generates both entrypoints, populates manifest-backed static options, copies licensed companion CSS, and updates content hashes. Explicit modules in `demo/studio/authored/` are the single source for both Studio and the retained reference controller. The build compiles their declared inventory directly; it does not extract functions from another bundle. Each binder receives an owned root, appearance, assets and callbacks and returns complete resource cleanup.

The shell loads the public Minimal SaaS visual entrypoint; each preview loads only its selected public preset stylesheet, alongside public `component-composition.css`, Layout Style CSS, and Interactive Surface state-core composition. Its controls use `usk-*` classes and supported `data-ui-variant` values; the library owns all UI colors, typography, borders, and elevation. Working examples use the same canonical classes, and their actions and status feedback demonstrate meaningful library variants. Chart artwork reads documented `--ui-color-*` tokens directly.

Responsive reflow and shared spacing use Layout Style CSS defaults, including its short-viewport adjustments. Local column minimums are optional content-density settings.

Local CSS contains only public `--ly-*` composition tokens, isolated-frame geometry, and application visibility/positioning. Reference-board markup uses Layout primitives rather than per-board visual overrides. Bento native samples use intrinsic grid flow without JavaScript row measurement. The retained fixture alone preserves the older optional bundle-switch demonstration so established library regressions remain valid. Library-focused browser tests target that fixture; `tests/e2e/demo-studio.spec.js` verifies the actual studio and preview frames.

Component filtering changes visibility in place and retains entered values. Animation-frame batching sends one coherent configuration snapshot; interaction-only updates touch their own domain. Palette reads and icon hydration occur only when their inputs change. Public example markup is cloned only when Code or Copy consumes it.

Generated classic scripts are minified with linked, content-versioned source maps containing the maintained sources. HTML, styles, lazy assets and maps carry versioned URLs. Generated browser bundles, HTML entrypoints, vendored assets, and API Markdown must not be edited by hand. See [optimization measurements](DEMO-OPTIMIZATION.md) for the bounded before/after evidence.

## Development and verification

- `npm run demo` starts a loopback-only server; `PORT` or a positional port selects another port.
- `npm run demo:build` rebuilds studio assets using existing CSS distributions.
- `npm run build` rebuilds library distributions and the studio together.
- `npm run docs` regenerates 36 granular jsdoc2md references; `npm run docs:check` detects drift.
- `npm run format:studio` formats authored studio files; `npm run format:check` checks them.
- `npm run lint:js` checks the authored JavaScript. Existing CSS lint rules remain in force.

Run individual Node or Playwright cases during implementation. Refresh documentation, expected behavior, and generated assets before the final local CI sequence. A local check does not establish publication or deployment.
