<!-- Generated with jsdoc2md from demo/studio/reference.js; do not edit by hand. -->

# studio reference

<a name="module_studio/reference"></a>

## studio/reference

Retained library QA controller; authored board markup is owned by shared modules.

- [studio/reference](#module_studio/reference)
  - [~referenceContext(ui)](#module_studio/reference..referenceContext) ⇒ <code>Object</code>
  - [~retroGlassIcon(name)](#module_studio/reference..retroGlassIcon) ⇒ <code>string</code>
  - [~loadPresetSpecimen(ui)](#module_studio/reference..loadPresetSpecimen) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~syncManifestSelectOptions()](#module_studio/reference..syncManifestSelectOptions)
  - [~normalizeThemeSelection(value)](#module_studio/reference..normalizeThemeSelection) ⇒ <code>string</code>
  - [~applyDemoQuerySelection()](#module_studio/reference..applyDemoQuerySelection) ⇒ <code>void</code>
  - [~applyPaletteSelection()](#module_studio/reference..applyPaletteSelection) ⇒ <code>void</code>
  - [~selectReferencePalette()](#module_studio/reference..selectReferencePalette)
  - [~getThemeUsageStatement()](#module_studio/reference..getThemeUsageStatement) ⇒ <code>string</code>
  - [~getThemeOverrideKey()](#module_studio/reference..getThemeOverrideKey) ⇒ <code>string</code>
  - [~getThemeOverrideSelector()](#module_studio/reference..getThemeOverrideSelector) ⇒ <code>string</code>
  - [~rgbChannelsToHex(value)](#module_studio/reference..rgbChannelsToHex) ⇒ <code>string</code>
  - [~getColorTokenName(role)](#module_studio/reference..getColorTokenName) ⇒ <code>string</code>
  - [~getActiveColorTokens()](#module_studio/reference..getActiveColorTokens) ⇒ <code>Array.&lt;{role: string, name: string, value: string}&gt;</code>
  - [~setTokenOverride(role, value)](#module_studio/reference..setTokenOverride) ⇒ <code>string</code>
  - [~resetTokenOverride(role)](#module_studio/reference..resetTokenOverride)
  - [~resetPaletteOverrides()](#module_studio/reference..resetPaletteOverrides)
  - [~buildThemeOverrideCss()](#module_studio/reference..buildThemeOverrideCss) ⇒ <code>string</code>
  - [~updateThemeOverridePreview()](#module_studio/reference..updateThemeOverridePreview)
  - [~renderUsageSection(p)](#module_studio/reference..renderUsageSection) ⇒ <code>string</code>
  - [~copyTextToClipboard(text)](#module_studio/reference..copyTextToClipboard) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~bindCodeCopyButtons(root)](#module_studio/reference..bindCodeCopyButtons) ⇒ <code>void</code>
  - [~bindNativeDialogDemo()](#module_studio/reference..bindNativeDialogDemo) ⇒ <code>void</code>
  - [~bindNativeSemanticStates()](#module_studio/reference..bindNativeSemanticStates) ⇒ <code>void</code>
  - [~bindThemeTokenControls()](#module_studio/reference..bindThemeTokenControls) ⇒ <code>void</code>
  - [~renderChoiceControls(ui, p)](#module_studio/reference..renderChoiceControls) ⇒ <code>string</code>
  - [~isTemplateReferenceView()](#module_studio/reference..isTemplateReferenceView) ⇒ <code>boolean</code>
  - [~renderActiveTemplateSpecimen(ui, p)](#module_studio/reference..renderActiveTemplateSpecimen) ⇒ <code>string</code>
  - [~renderTemplateReferences(ui, p)](#module_studio/reference..renderTemplateReferences) ⇒ <code>string</code>
  - [~extractStyleFeatures(markup, kind)](#module_studio/reference..extractStyleFeatures) ⇒ <code>string</code>
  - [~renderStyleSpecificGallery(ui, p)](#module_studio/reference..renderStyleSpecificGallery) ⇒ <code>string</code>
  - [~updateStyleFeatureRange(range)](#module_studio/reference..updateStyleFeatureRange) ⇒ <code>void</code>
  - [~bindStyleSpecificGallery()](#module_studio/reference..bindStyleSpecificGallery)
  - [~bindActivePresetSpecimen(ui)](#module_studio/reference..bindActivePresetSpecimen) ⇒ <code>void</code>
  - [~bindPresetSpecificDemo(ui)](#module_studio/reference..bindPresetSpecificDemo) ⇒ <code>void</code>
  - [~hydrateDemoIcons()](#module_studio/reference..hydrateDemoIcons)
  - [~syncPresetSpecificVisibility()](#module_studio/reference..syncPresetSpecificVisibility) ⇒ <code>void</code>
  - [~getSurfaceVariant(element)](#module_studio/reference..getSurfaceVariant) ⇒ <code>string</code>
  - [~syncPrimaryNavCurrent(targetId)](#module_studio/reference..syncPrimaryNavCurrent) ⇒ <code>void</code>
  - [~renderMedallionIcon(ui, name, fallback)](#module_studio/reference..renderMedallionIcon) ⇒ <code>string</code>
  - [~replaceDemoSection(selector, markup)](#module_studio/reference..replaceDemoSection) ⇒ <code>HTMLElement</code> \| <code>null</code>
  - [~refreshPalettePresentation()](#module_studio/reference..refreshPalettePresentation) ⇒ <code>void</code>
  - [~renderSelectedPreset()](#module_studio/reference..renderSelectedPreset) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~requestPresetRender()](#module_studio/reference..requestPresetRender) ⇒ <code>void</code>

<a name="module_studio/reference..referenceContext"></a>

### studio/reference~referenceContext(ui) ⇒ <code>Object</code>

Resolves live reference state for a shared module.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>Object</code> - Explicit owned context.

| Param | Type                | Description    |
| ----- | ------------------- | -------------- |
| ui    | <code>string</code> | Active preset. |

<a name="module_studio/reference..retroGlassIcon"></a>

### studio/reference~retroGlassIcon(name) ⇒ <code>string</code>

Uses the shared wrapper with the retained companion registry.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Decorative markup.

| Param | Type                | Description |
| ----- | ------------------- | ----------- |
| name  | <code>string</code> | Icon name.  |

<a name="module_studio/reference..loadPresetSpecimen"></a>

### studio/reference~loadPresetSpecimen(ui) ⇒ <code>Promise.&lt;void&gt;</code>

Loads the shared, versioned definition needed by one preset.
The common loader owns retries and optional artwork dependencies.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the selected preset's scripts are executable.

| Param | Type                | Description                 |
| ----- | ------------------- | --------------------------- |
| ui    | <code>string</code> | Selected preset identifier. |

<a name="module_studio/reference..syncManifestSelectOptions"></a>

### studio/reference~syncManifestSelectOptions()

Populates controls from the library inventory while retaining the optional palette selection.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..normalizeThemeSelection"></a>

### studio/reference~normalizeThemeSelection(value) ⇒ <code>string</code>

Treats null, empty, None, and legacy reference-palette values as no shared theme.
Unknown names also fall back safely instead of activating an unresolved theme seam.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - A supported theme identifier, or an empty native-palette selection.

| Param | Type                                                               | Description                 |
| ----- | ------------------------------------------------------------------ | --------------------------- |
| value | <code>string</code> \| <code>null</code> \| <code>undefined</code> | Requested theme identifier. |

<a name="module_studio/reference..applyDemoQuerySelection"></a>

### studio/reference~applyDemoQuerySelection() ⇒ <code>void</code>

Restores a shareable demo state using only values from the public inventory.
The personality alias retains compatibility with existing style-review URLs.
Omitted fields and invalid preset/mode requests preserve the current controls; an explicit
unresolved palette request restores style defaults. Shared edits and corners remain validated.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..applyPaletteSelection"></a>

### studio/reference~applyPaletteSelection() ⇒ <code>void</code>

Synchronizes public theme attributes and per-context edits without a demo color namespace.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..selectReferencePalette"></a>

### studio/reference~selectReferencePalette()

Selects the same native-palette option from every preset-specific reference button.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..getThemeUsageStatement"></a>

### studio/reference~getThemeUsageStatement() ⇒ <code>string</code>

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Copyable setup code that preserves the selected palette source.  
<a name="module_studio/reference..getThemeOverrideKey"></a>

### studio/reference~getThemeOverrideKey() ⇒ <code>string</code>

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Namespaced edit identity; native palettes are owned by a preset and mode.  
<a name="module_studio/reference..getThemeOverrideSelector"></a>

### studio/reference~getThemeOverrideSelector() ⇒ <code>string</code>

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - CSS scope for the active native palette or reusable shared theme.  
<a name="module_studio/reference..rgbChannelsToHex"></a>

### studio/reference~rgbChannelsToHex(value) ⇒ <code>string</code>

Convert a string of RGB channels to a hexadecimal color string.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - - The corresponding hexadecimal color string (e.g., "#ff0000").

| Param | Type                | Description                                           |
| ----- | ------------------- | ----------------------------------------------------- |
| value | <code>string</code> | The string containing RGB channels (e.g., "255 0 0"). |

<a name="module_studio/reference..getColorTokenName"></a>

### studio/reference~getColorTokenName(role) ⇒ <code>string</code>

Resolves a palette edit to its owning public variable without activating a shared theme.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - The concrete CSS custom property to override.

| Param | Type                | Description                                             |
| ----- | ------------------- | ------------------------------------------------------- |
| role  | <code>string</code> | Palette role, including preset-specific material roles. |

<a name="module_studio/reference..getActiveColorTokens"></a>

### studio/reference~getActiveColorTokens() ⇒ <code>Array.&lt;{role: string, name: string, value: string}&gt;</code>

Get the currently active color tokens from the computed styles of the document body.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>Array.&lt;{role: string, name: string, value: string}&gt;</code> - - An array of active color token objects.  
<a name="module_studio/reference..setTokenOverride"></a>

### studio/reference~setTokenOverride(role, value) ⇒ <code>string</code>

Set a color token override for the current theme and mode, updating the document's inline styles and the stored overrides.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - - The normalized RGB value that was set.

| Param | Type                | Description                                              |
| ----- | ------------------- | -------------------------------------------------------- |
| role  | <code>string</code> | The role of the color token to override.                 |
| value | <code>string</code> | The new RGB value for the color token (e.g., "255 0 0"). |

<a name="module_studio/reference..resetTokenOverride"></a>

### studio/reference~resetTokenOverride(role)

Reset a color token override for the current theme and mode, updating the document's inline styles and the stored overrides.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                | Description                           |
| ----- | ------------------- | ------------------------------------- |
| role  | <code>string</code> | The role of the color token to reset. |

<a name="module_studio/reference..resetPaletteOverrides"></a>

### studio/reference~resetPaletteOverrides()

Removes only the active palette's edits, preserving experiments in other contexts.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..buildThemeOverrideCss"></a>

### studio/reference~buildThemeOverrideCss() ⇒ <code>string</code>

Build the CSS string for the current theme overrides.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - - The CSS string representing the active color token overrides.  
<a name="module_studio/reference..updateThemeOverridePreview"></a>

### studio/reference~updateThemeOverridePreview()

Update the theme override preview code block in the demo to reflect the current active color token overrides.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..renderUsageSection"></a>

### studio/reference~renderUsageSection(p) ⇒ <code>string</code>

Renders the palette-dependent usage examples without rebuilding the surrounding demo.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Usage section markup for the active palette and mode.

| Param | Type                | Description                 |
| ----- | ------------------- | --------------------------- |
| p     | <code>string</code> | Active preset class prefix. |

<a name="module_studio/reference..copyTextToClipboard"></a>

### studio/reference~copyTextToClipboard(text) ⇒ <code>Promise.&lt;void&gt;</code>

Copy text to the clipboard using the Clipboard API if available, or fallback to a textarea method for older browsers.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                | Description                        |
| ----- | ------------------- | ---------------------------------- |
| text  | <code>string</code> | The text to copy to the clipboard. |

<a name="module_studio/reference..bindCodeCopyButtons"></a>

### studio/reference~bindCodeCopyButtons(root) ⇒ <code>void</code>

Bind click event listeners to all code copy buttons in the document. When a button is clicked, it copies the associated code block's content to the clipboard and provides visual feedback.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                    | Description                                |
| ----- | ----------------------- | ------------------------------------------ |
| root  | <code>ParentNode</code> | Root containing the copy controls to bind. |

<a name="module_studio/reference..bindNativeDialogDemo"></a>

### studio/reference~bindNativeDialogDemo() ⇒ <code>void</code>

Bind the native modal specimen without replacing browser dialog semantics.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..bindNativeSemanticStates"></a>

### studio/reference~bindNativeSemanticStates() ⇒ <code>void</code>

Apply native runtime-only states that cannot be represented by HTML attributes.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..bindThemeTokenControls"></a>

### studio/reference~bindThemeTokenControls() ⇒ <code>void</code>

Bind event listeners to theme token controls, allowing users to modify and reset theme tokens.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..renderChoiceControls"></a>

### studio/reference~renderChoiceControls(ui, p) ⇒ <code>string</code>

Render the choice controls (checkboxes, radio buttons, and switches) for the specified UI style. If the UI style does not have custom choices, it will render native HTML controls instead.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - - The HTML string for the choice controls.

| Param | Type                | Description                                 |
| ----- | ------------------- | ------------------------------------------- |
| ui    | <code>string</code> | The unique identifier for the UI component. |
| p     | <code>string</code> | The prefix for CSS class names.             |

<a name="module_studio/reference..isTemplateReferenceView"></a>

### studio/reference~isTemplateReferenceView() ⇒ <code>boolean</code>

Reports whether the demo was explicitly opened as a developer reference fixture.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>boolean</code> - True only for the opt-in reference view.  
<a name="module_studio/reference..renderActiveTemplateSpecimen"></a>

### studio/reference~renderActiveTemplateSpecimen(ui, p) ⇒ <code>string</code>

Renders the selected authored reference board, shared by fixtures and feature excerpts.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Original reference markup, or an empty string when none exists.

| Param | Type                | Description          |
| ----- | ------------------- | -------------------- |
| ui    | <code>string</code> | Preset identifier.   |
| p     | <code>string</code> | Public class prefix. |

<a name="module_studio/reference..renderTemplateReferences"></a>

### studio/reference~renderTemplateReferences(ui, p) ⇒ <code>string</code>

Keeps full template copies out of the public component showcase.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Opt-in visual QA fixture.

| Param | Type                | Description          |
| ----- | ------------------- | -------------------- |
| ui    | <code>string</code> | Preset identifier.   |
| p     | <code>string</code> | Public class prefix. |

<a name="module_studio/reference..extractStyleFeatures"></a>

### studio/reference~extractStyleFeatures(markup, kind) ⇒ <code>string</code>

Selects explicitly authored, non-nesting excerpt boundaries, not arbitrary HTML tags.
The same component markup is used in both the gallery and its original reference board.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Concatenated feature fragments.

| Param  | Type                | Default                          | Description                        |
| ------ | ------------------- | -------------------------------- | ---------------------------------- |
| markup | <code>string</code> |                                  | Authored template markup.          |
| kind   | <code>string</code> | <code>&quot;feature&quot;</code> | Boundary kind: feature or support. |

<a name="module_studio/reference..renderStyleSpecificGallery"></a>

### studio/reference~renderStyleSpecificGallery(ui, p) ⇒ <code>string</code>

Showcases distinctive preset components inside the shared demo navigation and palette.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Accessible, curated component gallery.

| Param | Type                | Description          |
| ----- | ------------------- | -------------------- |
| ui    | <code>string</code> | Preset identifier.   |
| p     | <code>string</code> | Public class prefix. |

<a name="module_studio/reference..updateStyleFeatureRange"></a>

### studio/reference~updateStyleFeatureRange(range) ⇒ <code>void</code>

Updates the native range's visible readout and preset-owned track variables.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                          | Description                               |
| ----- | ----------------------------- | ----------------------------------------- |
| range | <code>HTMLInputElement</code> | A range from the curated feature gallery. |

<a name="module_studio/reference..bindStyleSpecificGallery"></a>

### studio/reference~bindStyleSpecificGallery()

Binds the small set of interactions retained outside their full reference boards.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..bindActivePresetSpecimen"></a>

### studio/reference~bindActivePresetSpecimen(ui) ⇒ <code>void</code>

Binds only the external specimen module represented by the current DOM.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                | Description                 |
| ----- | ------------------- | --------------------------- |
| ui    | <code>string</code> | Selected preset identifier. |

<a name="module_studio/reference..bindPresetSpecificDemo"></a>

### studio/reference~bindPresetSpecificDemo(ui) ⇒ <code>void</code>

Binds interactions that exist only in the active preset's rendered regions.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param | Type                | Description                 |
| ----- | ------------------- | --------------------------- |
| ui    | <code>string</code> | Selected preset identifier. |

<a name="module_studio/reference..hydrateDemoIcons"></a>

### studio/reference~hydrateDemoIcons()

Hydrates stable semantic demo icons once, without replacing their controls on preset changes.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..syncPresetSpecificVisibility"></a>

### studio/reference~syncPresetSpecificVisibility() ⇒ <code>void</code>

Keeps every preset-only demo region synchronized with the active style.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..getSurfaceVariant"></a>

### studio/reference~getSurfaceVariant(element) ⇒ <code>string</code>

Resolves the public interaction feedback variant from a rendered control's semantics.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Primary, secondary, danger, or subtle interaction feedback variant.

| Param   | Type                 | Description                             |
| ------- | -------------------- | --------------------------------------- |
| element | <code>Element</code> | Native or prefixed interactive control. |

<a name="module_studio/reference..syncPrimaryNavCurrent"></a>

### studio/reference~syncPrimaryNavCurrent(targetId) ⇒ <code>void</code>

Keeps feature deep links within their owning top-level navigation section.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)

| Param    | Type                | Default                           | Description             |
| -------- | ------------------- | --------------------------------- | ----------------------- |
| targetId | <code>string</code> | <code>&quot;overview&quot;</code> | Current in-page anchor. |

<a name="module_studio/reference..renderMedallionIcon"></a>

### studio/reference~renderMedallionIcon(ui, name, fallback) ⇒ <code>string</code>

Selects scalable medallion artwork while preserving each preset's existing icon family.
Maximalist uses SVG strokes for its annotated star, check, and directional arrow.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>string</code> - Trusted bundled SVG markup or the supplied decorative glyph.

| Param    | Type                | Description                                  |
| -------- | ------------------- | -------------------------------------------- |
| ui       | <code>string</code> | Active UI preset identifier.                 |
| name     | <code>string</code> | Icon asset name.                             |
| fallback | <code>string</code> | Decorative text glyph used by other presets. |

<a name="module_studio/reference..replaceDemoSection"></a>

### studio/reference~replaceDemoSection(selector, markup) ⇒ <code>HTMLElement</code> \| <code>null</code>

Replaces one palette-dependent section while retaining the rest of the live demo DOM.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>HTMLElement</code> \| <code>null</code> - Inserted section, or null when the current section is absent.

| Param    | Type                | Description                       |
| -------- | ------------------- | --------------------------------- |
| selector | <code>string</code> | Selector for the current section. |
| markup   | <code>string</code> | Replacement section markup.       |

<a name="module_studio/reference..refreshPalettePresentation"></a>

### studio/reference~refreshPalettePresentation() ⇒ <code>void</code>

Refreshes only content whose text or controls depend on theme and mode.
The developer reference fixture retains full rendering because its authored boards encode mode in markup.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
<a name="module_studio/reference..renderSelectedPreset"></a>

### studio/reference~renderSelectedPreset() ⇒ <code>Promise.&lt;void&gt;</code>

Renders the most recently requested preset after its optional module is ready.
Stale loads cannot replace a newer user selection.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the current preset is rendered.  
<a name="module_studio/reference..requestPresetRender"></a>

### studio/reference~requestPresetRender() ⇒ <code>void</code>

Reports an optional specimen failure without leaving an unhandled promise rejection.

**Kind**: inner method of [<code>studio/reference</code>](#module_studio/reference)
