# Native Element Coverage

UI Style Kit uses a hybrid-native policy: it themes safe element boxes and exposed subparts, uses `accent-color` and `color-scheme` as fallbacks, and leaves inaccessible browser popups to the platform.

## Classification

| Classification | Elements and surfaces |
|---|---|
| Fully themed | `html`, `body`, `main`, `section`, `header`, `footer`, `nav`, `article`, `aside`, `address`, `form`, `fieldset`, `legend`, `label`, `input`, `textarea`, `select`, `button`, `table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `details`, `summary`, `dialog`, `progress`, `meter`, `menu`, `search`, headings `h1`-`h6`, `hgroup`, paragraphs, lists, definition lists, blockquotes, `code`, `kbd`, `samp`, `pre`, `mark`, `abbr`, `strong`, `b`, `em`, `i`, `cite`, `var`, `q`, `ins`, `del`, `s`, `u`, `sub`, `sup`, `output`, `time`, `data`, `dfn`, `ruby`, `rt`, `rp`, `bdi`, and `bdo` |
| Progressively enhanced | `img`, `picture`, `video`, `audio`, `canvas`, `svg`, `math`, `iframe`, `object`, `embed`, `map`, `area`, `col`, `colgroup`, `optgroup`, `option`, `slot`, `selectedcontent`, `br`, and `wbr` |
| Platform-owned | `select` popup, `datalist popup`, color picker dialog, date/time picker dialogs, native media controls, autofill menus, spellcheck menus, and operating-system file pickers |
| Non-rendered | `base`, `datalist`, `head`, `link`, `meta`, `noscript`, `script`, `source`, `style`, `template`, `title`, and `track` |

`selectedcontent` is classified as progressive enhancement because support is still emerging. `datalist` remains non-rendered; the input box is themed, but the datalist popup is platform-owned.

## Exposed Subparts

The native layer styles safely exposed parts where engines allow it:

- placeholder text
- file selector buttons, including hover, focus, active, and disabled states
- range tracks, Firefox range progress, and thumbs
- color swatches
- determinate/indeterminate progress and meter tracks and values, including optimum, suboptimum, and critical bands
- calendar picker indicators
- search cancellation controls
- number spinners
- select picker indicators where supported
- summary and list markers
- supported scrollbars

## Native Tokens

Preset files map existing `--usk-native-*` roles through their active visual system. The shared native layer also defines these sizing and paint tokens:

| Group | Stable tokens |
|---|---|
| Foundation | `--usk-native-control-bg`, `--usk-native-border-width`, `--usk-native-radius-sm`, `--usk-native-radius`, `--usk-native-shadow`, `--usk-native-focus-ring`, `--usk-native-control-min-block-size`, `--usk-native-control-padding-block`, `--usk-native-control-padding-inline`, `--usk-native-subcontrol-padding-block`, `--usk-native-subcontrol-padding-inline` |
| Choice | `--usk-native-choice-*`, `--usk-native-checkbox-radius`, `--usk-native-radio-radius` |
| Select | `--usk-native-select-indicator-*`, `--usk-native-select-padding-inline-end` |
| Range | `--usk-native-range-track-*`, `--usk-native-range-progress-background`, `--usk-native-range-thumb-*` |
| Progress and meter | `--usk-native-progress-*`, `--usk-native-meter-*-background` |
| File and color | `--usk-native-file-button-*`, `--usk-native-color-swatch-*` |
| Indicators and scrollbars | `--usk-native-indicator-*`, `--usk-native-scrollbar-*` |

Single selects consume the preset indicator with logical LTR/RTL positioning. Multiple selects deliberately suppress it. Chromium/WebKit and Firefox pseudo-elements stay in separate safe selector blocks so one unsupported vendor selector cannot invalidate another engine's paint.

Platform-owned select/datalist popups, date/time and color picker dialogs, file pickers, autofill/spellcheck menus, media internals, and operating-system chrome remain native. The library themes only their exposed launch controls and indicators.

Invalid paint activates only through `[aria-invalid="true"]`, `.is-invalid`, or `:user-invalid`. Required empty controls do not get danger paint before user interaction.
