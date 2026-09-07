# Industrial Utility

Industrial Utility implements the retained Industrial template as the canonical
`utility-*` preset. The source template's `iu-*` names are not public aliases.
The shared `.ui-*` contract remains unchanged.

## Loading and Color

Load `dist/ui-style-kit.css`, or the focused `dist/visual/industrial-utility.css`
bundle with the supporting files required by that entry point. Select
`data-ui="industrial-utility"` and `data-mode="light"`, `"dark"`, or `"contrast"`.
Use `data-theme` for a named color scheme. Omit `data-theme` to use the preset's
reference palette; the demo's **Use reference palette** button does this.

`--utility-material-*` aliases resolve through the host `--usk-*` palette. Action,
status, text, focus, border, and surface roles therefore follow theme changes
without replacing the industrial geometry. Foreground/background token pairs
must be overridden together when customizing a palette.

Dark headers, the console bezel, and black instrument wells are intentional
materials in both modes. Their optional extension tokens are
`--usk-industrial-header-rgb`, `--usk-industrial-header-text-rgb`,
`--usk-industrial-bezel-rgb`, and `--usk-industrial-readout-text-rgb`.
Metal bevels, rivets, guard stripes, and fixed switch geometry retain the
template's tactile character. This is not a drafting-grid or glass preset.

## Component Surface

The exact published inventory is `manifest.classApi.presetExtras["industrial-utility"]`
plus `manifest.classApi.universalVisualSuffixes`. All names below use `utility-`:

| Group | Components |
| --- | --- |
| Console | panel, panel-header, panel-body, rivet, nameplate, card, overline |
| Actions | button, button-primary, button-secondary, button-ghost, button-danger, button-guarded, icon-button |
| Forms | field, label, input, select, textarea, file, help, check, radio, dropdown, option |
| Switchgear | control-grid, control-cell, control-name, toggle, three-position, key-switch, emergency-stop, pilot-light |
| Instruments | readout, readout-label, slider, ticks, meter, progress, progress-bar, stage-track, stage, metric, metric-label, metric-value |
| Navigation | breadcrumb, tabs, tab, pagination, segmented, details |
| Data and Feedback | table-wrap, table, badge and status variants, alert and status variants, spinner, skeleton, empty-state, toast-stack, toast |
| Overlays and Foundations | dialog, tooltip, popover, token-row, token |

The specimen contains eleven reference groups: buttons, inputs, system status,
selection, switchgear, instruments, navigation, work orders, alerts, overlays,
and foundations. Additional existing preset examples remain available only
while Industrial Utility is selected. All demo preset-only regions are checked
against their owning preset across the full style selector.

## States and Behavior

- Buttons support hover, focus-visible, pressed, disabled, and loading states.
  Guarded controls retain a striped surround; loading indicators reserve space.
- Native checkbox/radio inputs can be displayed directly inside `utility-check`
  and `utility-radio`. Existing adjacent `*-control` markup remains supported.
- Options, tabs, and segmented controls use selected state plus keyboard focus;
  the demo implements arrow, Home, and End navigation.
- Pilot lights and alarms use labels and acknowledgment text as well as color.
- Range controls use native keyboard behavior. Readouts and progress labels
  expose their values without depending on their visual fill.
- A native `dialog.utility-dialog` is hidden until opened. A static
  `div.utility-dialog` can demonstrate its surface without pretending to be an
  active modal. Real dialogs retain native focus containment and Escape handling.
- Reduced motion disables decorative loading animation. Coarse pointers receive
  larger targets; forced colors retain visible boundaries and checked states.

Demo controls operate on local, inert sample data only. The emergency stop does
not control equipment. Acknowledgment changes the acknowledgment state, never
the critical alarm condition. No operator log, server write, or network control
is implied by the sample interface.

## Reviewed Controls

`.utility-pilot-light.is-warning` adds a warning-role lamp with the same slow
pulse as warning badges, disabled by reduced-motion preferences. Warning alerts
use the warning role instead of the primary-action role. `.utility-alert-info`
keeps the separate blue information treatment. Named theme warning tokens still
take precedence over fallback paint.

Every preset supports `.{prefix}-button-warning` alongside its base button class,
and `.ui-button[data-ui-variant="warning"]` is the equivalent semantic API.
Warning controls inherit preset geometry and use paired warning fill/text roles.
The shared demo displays this variant for every style; Industrial Danger examples
opt into `.is-alarm`, while destructive commands remain steady.

Use `.utility-button.is-alarm` (or `.ui-button.is-alarm` in this preset) for an
active alarm command. Danger badges, danger alerts, and red pilot lights pulse
at the warning cadence. `.utility-button-danger` alone remains steady for
destructive commands such as Delete. Reduced-motion preferences stop signaling
animations without removing the status color or label.

All spinner entry points, including `.is-loading` and `aria-busy`, share the
eight-step mechanical rotor. Plain `.utility-panel` content has a 16px inset;
panels with a direct `.utility-panel-body` delegate padding to that body.
Containers reserve 16px inline padding. Native checked boxes use a centered
square, and native tables inherit the same header and rule treatment as the
prefixed table. Icon-only buttons reserve a visible SVG box.

Shared native `audio[controls]` styling now uses each preset's control surface,
radius, border, and shadow without requiring JavaScript or replacing native
keyboard/playback behavior. Chromium/WebKit control panels also inherit the
surface. Internal playback buttons remain browser-owned, particularly in
Firefox; CSS cannot provide identical internal controls across engines.

## Verification Evidence

Focused checks live in `tests/industrial-utility-template.test.js` and
`tests/e2e/industrial-utility-template.spec.js`. The browser spec covers the
generated bundle, all eleven groups, the manifest inventory, preset isolation,
reference-mode accessibility, keyboard interactions, host token overrides,
reduced motion, and desktop/mobile containment. Dark and light captures are
written to the operating system's temporary `usk-industrial-utility-template`
directory for comparison with the retained boards.

The responsive browser specimen preserves native controls and accessible text
instead of scaling a fixed bitmap. Native date/file UI and mobile reflow therefore
differ from the static reference image. Historical QA shipped with the template
is not evidence that the current library build has passed validation.

### Local Validation, September 5, 2026

The implementation passed its focused component and browser checks, including
reference dark/light axe audits, a named-theme axe audit with paired custom
primary tokens, keyboard interactions, and 602/390 px containment. The generated
build, class/public API checks, contrast matrix, lint, ownership, compatibility,
package integrity, reviewed fingerprints, and whitespace checks also passed.

The full semantic-component contract file has one remaining unrelated failure:
its authored-selector assertion expects only `.ui-spinner` and `.ui-tooltip`,
while the existing Retrofuturism source declares additional semantic aliases.
Those changes were preserved. This run did not execute full CI, publish a
package, commit changes, or push a branch.
