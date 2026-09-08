# Demo Showcase

The default demo contains one shared overview, palette workbench, semantic and
prefixed components, native HTML, bridge examples, and usage guidance. The
style-specific gallery lives inside Components rather than above the library kit.

Industrial Utility exposes pilot lights, switchgear, a key switch, guarded stop,
meters, process stages, and a local alarm acknowledgment flow. These examples are
demonstrations only and are not connected to equipment.

## Native and named palettes

Select **None — style defaults** to omit `data-theme`. The color table reads the
preset's actual RGB variables, including custom material colors. Edits export
`--<prefix>-*-rgb` scoped to the active preset/mode without a theme. Named themes
instead edit the 23 shared `--usk-*-rgb` roles. Each context retains its own edits
until reload; reset affects only the current context.

## Review links

- `?ui=tactile&theme=None&mode=dark`: native dark Tactile.
- `?personality=maximalist`: compatibility form of the style selector.
- `?ui=industrial-utility&theme=industrial-orange&mode=light`: named-theme preview.
- `?view=reference&ui=tactile`: full original board for developer comparison.

The `ui` parameter takes precedence over `personality`. Presets and modes are
validated against the manifest; unsupported themes normalize to None.

The same queries work on `index.html` and `demo/index.html`. [Theming Model](Theming-Model)
describes safe overrides; [Accessibility](Accessibility) covers validation duties.
