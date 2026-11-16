<!-- Generated with jsdoc2md from demo/studio/authored/clay.js; do not edit by hand. -->

# studio authored clay

<a name="module_studio/authored/clay"></a>

## studio/authored/clay

Canonical clay specimen shared by Studio and reference consumers.

- [studio/authored/clay](#module_studio/authored/clay)
  - _static_
    - [.render(context)](#module_studio/authored/clay.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/clay.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/clay..create) ⇒ <code>Object</code>
      - [~themedPalette](#module_studio/authored/clay..create..themedPalette)
      - [~icon(name)](#module_studio/authored/clay..create..icon)
      - [~button(text)](#module_studio/authored/clay..create..button)
      - [~tool(name)](#module_studio/authored/clay..create..tool)
      - [~group(id)](#module_studio/authored/clay..create..group)
      - [~field(type)](#module_studio/authored/clay..create..field)
      - [~choice(type)](#module_studio/authored/clay..create..choice)
      - [~toggle(label)](#module_studio/authored/clay..create..toggle)
      - [~progress(label)](#module_studio/authored/clay..create..progress)
      - [~confirmation()](#module_studio/authored/clay..create..confirmation) ⇒ <code>string</code>
      - [~render(ui, mode, referencePalette)](#module_studio/authored/clay..create..render) ⇒ <code>string</code>
      - [~bind(changeMode)](#module_studio/authored/clay..create..bind) ⇒ <code>void</code>
        - [~roving(selector)](#module_studio/authored/clay..create..bind..roving)
        - [~showFile(file)](#module_studio/authored/clay..create..bind..showFile)

<a name="module_studio/authored/clay.render"></a>

### studio/authored/clay.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/clay</code>](#module_studio/authored/clay)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/clay.bind"></a>

### studio/authored/clay.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/clay</code>](#module_studio/authored/clay)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/clay..create"></a>

### studio/authored/clay~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/clay</code>](#module_studio/authored/clay)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/clay..create) ⇒ <code>Object</code>
  - [~themedPalette](#module_studio/authored/clay..create..themedPalette)
  - [~icon(name)](#module_studio/authored/clay..create..icon)
  - [~button(text)](#module_studio/authored/clay..create..button)
  - [~tool(name)](#module_studio/authored/clay..create..tool)
  - [~group(id)](#module_studio/authored/clay..create..group)
  - [~field(type)](#module_studio/authored/clay..create..field)
  - [~choice(type)](#module_studio/authored/clay..create..choice)
  - [~toggle(label)](#module_studio/authored/clay..create..toggle)
  - [~progress(label)](#module_studio/authored/clay..create..progress)
  - [~confirmation()](#module_studio/authored/clay..create..confirmation) ⇒ <code>string</code>
  - [~render(ui, mode, referencePalette)](#module_studio/authored/clay..create..render) ⇒ <code>string</code>
  - [~bind(changeMode)](#module_studio/authored/clay..create..bind) ⇒ <code>void</code>
    - [~roving(selector)](#module_studio/authored/clay..create..bind..roving)
    - [~showFile(file)](#module_studio/authored/clay..create..bind..showFile)

<a name="module_studio/authored/clay..create..themedPalette"></a>

#### create~themedPalette

Shared role swatches remain live when the demo's RGB token editor changes theme paint.

**Kind**: inner constant of [<code>create</code>](#module_studio/authored/clay..create)  
<a name="module_studio/authored/clay..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                            |
| ----- | ------------------- | ------------------------------------------------------ |
| name  | <code>string</code> | Licensed icon name. @returns {string} Decorative icon. |

<a name="module_studio/authored/clay..create..button"></a>

#### create~button(text)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                                                                         |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| text  | <code>string</code> | Authored label. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. |

<a name="module_studio/authored/clay..create..tool"></a>

#### create~tool(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                                                                 |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| name  | <code>string</code> | Icon name. @param {string} label Accessible name. @param {string} attrs Authored attributes. @returns {string} Icon button. |

<a name="module_studio/authored/clay..create..group"></a>

#### create~group(id)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                                                                   |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| id    | <code>string</code> | Stable group id. @param {string} title Group title. @param {string} body Authored content. @returns {string} Reference group. |

<a name="module_studio/authored/clay..create..field"></a>

#### create~field(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                                                                |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native field type. @param {string} label Field label. @param {string} value Sample value. @returns {string} Labeled field. |

<a name="module_studio/authored/clay..create..choice"></a>

#### create~choice(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                                                                     |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native choice type. @param {string} label Visible label. @param {string} attrs Authored state. @returns {string} Native choice. |

<a name="module_studio/authored/clay..create..toggle"></a>

#### create~toggle(label)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                         |
| ----- | ------------------- | ----------------------------------------------------------------------------------- |
| label | <code>string</code> | Visible switch label. @param {string} attrs Native state. @returns {string} Switch. |

<a name="module_studio/authored/clay..create..progress"></a>

#### create~progress(label)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param | Type                | Description                                                                      |
| ----- | ------------------- | -------------------------------------------------------------------------------- |
| label | <code>string</code> | Progress name. @param {number} value Percentage. @returns {string} Progress bar. |

<a name="module_studio/authored/clay..create..confirmation"></a>

#### create~confirmation() ⇒ <code>string</code>

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)  
**Returns**: <code>string</code> - Shared confirmation copy.  
<a name="module_studio/authored/clay..create..render"></a>

#### create~render(ui, mode, referencePalette) ⇒ <code>string</code>

Renders only for Clay; material and responsive geometry belong to the library CSS.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)  
**Returns**: <code>string</code> - Complete reference sheet or empty markup.

| Param            | Type                 | Default                        | Description                                       |
| ---------------- | -------------------- | ------------------------------ | ------------------------------------------------- |
| ui               | <code>string</code>  |                                | Active style.                                     |
| mode             | <code>string</code>  | <code>&quot;light&quot;</code> | Active color mode.                                |
| referencePalette | <code>boolean</code> | <code>false</code>             | Whether the original mineral palette is selected. |

<a name="module_studio/authored/clay..create..bind"></a>

#### create~bind(changeMode) ⇒ <code>void</code>

Binds a freshly rendered sheet; the outer renderer replaces its DOM on mode changes.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/clay..create)

| Param      | Type                  | Description                            |
| ---------- | --------------------- | -------------------------------------- |
| changeMode | <code>function</code> | Callback for the shared mode selector. |

- [~bind(changeMode)](#module_studio/authored/clay..create..bind) ⇒ <code>void</code>
  - [~roving(selector)](#module_studio/authored/clay..create..bind..roving)
  - [~showFile(file)](#module_studio/authored/clay..create..bind..showFile)

<a name="module_studio/authored/clay..create..bind..roving"></a>

##### bind~roving(selector)

**Kind**: inner method of [<code>bind</code>](#module_studio/authored/clay..create..bind)

| Param    | Type                | Description                                                                             |
| -------- | ------------------- | --------------------------------------------------------------------------------------- |
| selector | <code>string</code> | Selector for roving focus. @param {Function} change Selection callback. @returns {void} |

<a name="module_studio/authored/clay..create..bind..showFile"></a>

##### bind~showFile(file)

**Kind**: inner method of [<code>bind</code>](#module_studio/authored/clay..create..bind)

| Param | Type              | Description                      |
| ----- | ----------------- | -------------------------------- |
| file  | <code>File</code> | Local selection. @returns {void} |
