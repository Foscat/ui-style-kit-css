<!-- Generated with jsdoc2md from demo/studio/state.js; do not edit by hand. -->

# studio state

<a name="module_studio/state"></a>

## studio/state

Pure studio state and URL contracts. Preview documents never own configuration.

- [studio/state](#module_studio/state)
  - _static_
    - [.COLOR_ROLES](#module_studio/state.COLOR_ROLES)
    - [.normalizeRgb(value)](#module_studio/state.normalizeRgb) ⇒ <code>string</code>
    - [.paletteKey(appearance)](#module_studio/state.paletteKey) ⇒ <code>string</code>
    - [.appearanceLabels(appearance, inventory)](#module_studio/state.appearanceLabels) ⇒ <code>Array.&lt;string&gt;</code>
    - [.createState(inventory, [search])](#module_studio/state.createState) ⇒ <code>StudioState</code>
    - [.changeAppearance(state, patch, inventory)](#module_studio/state.changeAppearance) ⇒ <code>StudioState</code>
    - [.editToken(state, role, value)](#module_studio/state.editToken) ⇒ <code>StudioState</code>
    - [.pinBaseline(state)](#module_studio/state.pinBaseline) ⇒ <code>StudioState</code>
    - [.updateInteraction(state, example, patch)](#module_studio/state.updateInteraction) ⇒ <code>StudioState</code>
    - [.serializeState(state)](#module_studio/state.serializeState) ⇒ <code>string</code>
  - _inner_
    - [~appearanceFor(value, inventory)](#module_studio/state..appearanceFor) ⇒ <code>Appearance</code>
    - [~cleanEdits(values, roles)](#module_studio/state..cleanEdits) ⇒ <code>Record.&lt;string, string&gt;</code>
    - [~Appearance](#module_studio/state..Appearance) : <code>Object</code>
    - [~Inventory](#module_studio/state..Inventory) : <code>Object</code>
    - [~PinnedAppearance](#module_studio/state..PinnedAppearance) : <code>Object</code>
    - [~StudioState](#module_studio/state..StudioState) : <code>Object</code>

<a name="module_studio/state.COLOR_ROLES"></a>

### studio/state.COLOR\_ROLES

Shared RGB roles supported by every palette.

**Kind**: static constant of [<code>studio/state</code>](#module_studio/state)  
<a name="module_studio/state.normalizeRgb"></a>

### studio/state.normalizeRgb(value) ⇒ <code>string</code>

Normalizes three integer RGB channels; invalid input never reaches CSS.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>string</code> - Normalized channels or an empty string.

| Param | Type                 | Description          |
| ----- | -------------------- | -------------------- |
| value | <code>unknown</code> | Candidate RGB value. |

<a name="module_studio/state.paletteKey"></a>

### studio/state.paletteKey(appearance) ⇒ <code>string</code>

Returns the palette owner, preserving named-theme portability across styles.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>string</code> - Palette context key.

| Param      | Type                    | Description    |
| ---------- | ----------------------- | -------------- |
| appearance | <code>Appearance</code> | Configuration. |

<a name="module_studio/state.appearanceLabels"></a>

### studio/state.appearanceLabels(appearance, inventory) ⇒ <code>Array.&lt;string&gt;</code>

Describes validated visual choices consistently in compact and expanded UI context.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>Array.&lt;string&gt;</code> - Preset, palette, mode and optional corner labels.

| Param      | Type                    | Description                                     |
| ---------- | ----------------------- | ----------------------------------------------- |
| appearance | <code>Appearance</code> | Current visual configuration.                   |
| inventory  | <code>Inventory</code>  | Authoritative preset labels and corner choices. |

<a name="module_studio/state.createState"></a>

### studio/state.createState(inventory, [search]) ⇒ <code>StudioState</code>

Creates a fresh workspace or restores a shareable configuration.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>StudioState</code> - Validated state without private form contents.

| Param     | Type                   | Default                               | Description               |
| --------- | ---------------------- | ------------------------------------- | ------------------------- |
| inventory | <code>Inventory</code> |                                       | Public library inventory. |
| [search]  | <code>string</code>    | <code>&quot;&#x27;&#x27;&quot;</code> | URL query.                |

<a name="module_studio/state.changeAppearance"></a>

### studio/state.changeAppearance(state, patch, inventory) ⇒ <code>StudioState</code>

Applies a visual change without replacing example interaction state.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>StudioState</code> - Updated state.

| Param     | Type                                    | Description              |
| --------- | --------------------------------------- | ------------------------ |
| state     | <code>StudioState</code>                | Current state.           |
| patch     | <code>Partial.&lt;Appearance&gt;</code> | Requested visual change. |
| inventory | <code>Inventory</code>                  | Public inventory.        |

<a name="module_studio/state.editToken"></a>

### studio/state.editToken(state, role, value) ⇒ <code>StudioState</code>

Updates one token or removes it when reset is requested.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>StudioState</code> - Updated state; invalid input preserves identity.

| Param | Type                                     | Description                     |
| ----- | ---------------------------------------- | ------------------------------- |
| state | <code>StudioState</code>                 | Current state.                  |
| role  | <code>string</code>                      | Public color role.              |
| value | <code>string</code> \| <code>null</code> | RGB channels, or null to reset. |

<a name="module_studio/state.pinBaseline"></a>

### studio/state.pinBaseline(state) ⇒ <code>StudioState</code>

Pins a detached visual snapshot; later edits cannot mutate the baseline.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>StudioState</code> - State with a pinned configuration.

| Param | Type                     | Description    |
| ----- | ------------------------ | -------------- |
| state | <code>StudioState</code> | Current state. |

<a name="module_studio/state.updateInteraction"></a>

### studio/state.updateInteraction(state, example, patch) ⇒ <code>StudioState</code>

Merges a local example action shared by both comparison frames.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>StudioState</code> - Updated state.

| Param   | Type                     | Description                   |
| ------- | ------------------------ | ----------------------------- |
| state   | <code>StudioState</code> | Current state.                |
| example | <code>string</code>      | Example identifier.           |
| patch   | <code>Object</code>      | New local interaction values. |

<a name="module_studio/state.serializeState"></a>

### studio/state.serializeState(state) ⇒ <code>string</code>

Encodes visual/workspace state only; form contents never enter share links.

**Kind**: static method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>string</code> - Query string compatible with legacy appearance links.

| Param | Type                     | Description    |
| ----- | ------------------------ | -------------- |
| state | <code>StudioState</code> | Current state. |

<a name="module_studio/state..appearanceFor"></a>

### studio/state~appearanceFor(value, inventory) ⇒ <code>Appearance</code>

Validates appearance against the authoritative inventory.

**Kind**: inner method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>Appearance</code> - Supported configuration.

| Param     | Type                   | Description               |
| --------- | ---------------------- | ------------------------- |
| value     | <code>Object</code>    | Candidate appearance.     |
| inventory | <code>Inventory</code> | Public library inventory. |

<a name="module_studio/state..cleanEdits"></a>

### studio/state~cleanEdits(values, roles) ⇒ <code>Record.&lt;string, string&gt;</code>

Drops unknown roles and malformed channel values from shared configuration.

**Kind**: inner method of [<code>studio/state</code>](#module_studio/state)  
**Returns**: <code>Record.&lt;string, string&gt;</code> - Safe edits.

| Param  | Type                              | Description          |
| ------ | --------------------------------- | -------------------- |
| values | <code>Object</code>               | Candidate edits.     |
| roles  | <code>Array.&lt;string&gt;</code> | Approved role names. |

<a name="module_studio/state..Appearance"></a>

### studio/state~Appearance : <code>Object</code>

**Kind**: inner typedef of [<code>studio/state</code>](#module_studio/state)  
<a name="module_studio/state..Inventory"></a>

### studio/state~Inventory : <code>Object</code>

**Kind**: inner typedef of [<code>studio/state</code>](#module_studio/state)  
**Properties**

| Name            | Type                                                     | Description                             |
| --------------- | -------------------------------------------------------- | --------------------------------------- |
| presets         | <code>Array.&lt;Object&gt;</code>                        | Public preset identifiers and prefixes. |
| themes          | <code>Array.&lt;string&gt;</code>                        | Named palette identifiers.              |
| modes           | <code>Array.&lt;string&gt;</code>                        | Supported display modes.                |
| [guidedCorners] | <code>Object</code>                                      | Supported corner choices.               |
| [paletteRoles]  | <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> | Public native material roles by preset. |

<a name="module_studio/state..PinnedAppearance"></a>

### studio/state~PinnedAppearance : <code>Object</code>

**Kind**: inner typedef of [<code>studio/state</code>](#module_studio/state)  
**Properties**

| Name    | Type                                       | Description                                      |
| ------- | ------------------------------------------ | ------------------------------------------------ |
| ui      | <code>string</code>                        | Pinned preset.                                   |
| theme   | <code>string</code>                        | Pinned palette or an empty native palette.       |
| mode    | <code>string</code>                        | Pinned mode.                                     |
| corners | <code>string</code>                        | Pinned corner choice or an empty preset default. |
| bridge  | <code>boolean</code>                       | Whether interaction feedback is enabled.         |
| edits   | <code>Object.&lt;string, string&gt;</code> | Detached RGB overrides.                          |

<a name="module_studio/state..StudioState"></a>

### studio/state~StudioState : <code>Object</code>

**Kind**: inner typedef of [<code>studio/state</code>](#module_studio/state)  
**Properties**

| Name         | Type                                                              | Description                             |
| ------------ | ----------------------------------------------------------------- | --------------------------------------- |
| appearance   | <code>Appearance</code>                                           | Editable visual configuration.          |
| edits        | <code>Record.&lt;string, Record.&lt;string, string&gt;&gt;</code> | Edits by palette owner and mode.        |
| baseline     | <code>PinnedAppearance</code>                                     | Independent pinned configuration.       |
| view         | <code>string</code>                                               | Active workspace.                       |
| example      | <code>string</code>                                               | Active shared example.                  |
| component    | <code>string</code>                                               | Active component family.                |
| markup       | <code>string</code>                                               | Semantic, prefixed, or native markup.   |
| filter       | <code>string</code>                                               | Local catalog search.                   |
| icons        | <code>Object</code>                                               | Explicit companion artwork preferences. |
| interactions | <code>Record.&lt;string, Object&gt;</code>                        | Shared local example state.             |
| paletteRoles | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code>          | Supported native material roles.        |
