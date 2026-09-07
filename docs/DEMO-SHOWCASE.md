# Demo showcase and reference fixtures

The default `index.html` and `demo/index.html` present one shared library showcase:
semantic components, overview, color tokens, prefixed components, native HTML,
the Interactive Surface bridge, and usage examples.

## Preview state and palette editing

Use `?ui=tactile&theme=None&mode=dark` to preview a native palette. The `personality`
query parameter is a compatibility alias for `ui`; `ui` takes precedence when both
are present. Only manifest-supported preset, theme, and mode values are accepted.

**None — style defaults** omits `data-theme`. The color workbench exposes the
selected preset's computed RGB variables, including material colors such as paper,
ink, and brass. Native edits export `--<prefix>-*-rgb` and remain scoped to that
preset and mode. Named themes expose the 23 shared `--usk-*-rgb` roles instead.
Switching contexts restores that context's edits; reset affects only the active
palette. Reload clears temporary edits. Recheck accessibility after editing colors.

The toolbar uses one native dropdown indicator across styles. This does not change
the preset-specific select specimens or their platform-owned popup behavior.

## Style-specific components

The Components section begins with `#style-specific`. This gallery changes with
the selected UI style without adding a second page header, navigation system,
palette picker, or repeated form/button catalogue.

Industrial Utility includes its pilot/status bank, switchgear, key switch, guarded
stop, pressure readout, meters, process stages, and alarm acknowledgment flow.
These controls operate on local demonstration state only; no equipment is connected.
Acknowledging a sample alarm does not remove its critical condition.

Clay, Neo Noir, Art Deco, Editorial Lux, Retro Glass, and Technical Blueprint also
reuse distinctive progress and instrumentation fragments from their authored boards.
Other presets retain their public surface/shape examples in this same section.

Gallery fragments use the actual library classes and inherit the active palette.
Selecting **None — style defaults** uses native preset colors; named themes and
token-editor overrides continue to apply. No gallery sets its own color theme.

## Original reference boards

Open `index.html?view=reference` (or `demo/index.html?view=reference`) to display
the original complete boards for developer comparisons. Select the desired preset
using the normal controls. The curated gallery is omitted in this view to avoid
duplicate component IDs and event handlers. The view includes a return link.

The reference assets, board renderers, and library styles have not been deleted.
Existing board-specific browser tests use this explicit query. Public-page tests
continue to use the default URL.

## Maintaining excerpts

The authored board marks complete, non-nesting fragments with
`<!--demo-style-feature-->` / `<!--/demo-style-feature-->` comments. The gallery
extracts only those explicit boundaries, not arbitrary HTML tags. Associated
dialog/live-region markup uses `demo-style-support` boundaries and stays outside
the feature grid. Keep unique IDs and their referenced labels inside retained
fragments, and bind any interactive controls in the public view as well as the fixture.

`tests/demo-style-showcase.test.js` verifies rendering and focused controller
behavior without launching a browser. `tests/e2e/demo-style-showcase.spec.js`
covers actual layout, keyboard interaction, modal focus, and theme/mode switching.
The latter requires an available, authorized browser session for rendered QA.
