<!-- Generated with jsdoc2md from demo/studio/authored/organic-modern.js; do not edit by hand. -->

# studio authored organic modern

<a name="module_studio/authored/organic-modern"></a>

## studio/authored/organic-modern

Canonical organic-modern specimen shared by Studio and reference consumers.

- [studio/authored/organic-modern](#module_studio/authored/organic-modern)
  - _static_
    - [.render(context)](#module_studio/authored/organic-modern.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/organic-modern.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/organic-modern..create) ⇒ <code>Object</code>
      - [~icon(name)](#module_studio/authored/organic-modern..create..icon)
      - [~tool(name)](#module_studio/authored/organic-modern..create..tool)
      - [~button(text)](#module_studio/authored/organic-modern..create..button)
      - [~photo(region, alt)](#module_studio/authored/organic-modern..create..photo) ⇒ <code>string</code>
      - [~section(title)](#module_studio/authored/organic-modern..create..section)
      - [~field(type)](#module_studio/authored/organic-modern..create..field)
      - [~choice(label)](#module_studio/authored/organic-modern..create..choice)
      - [~range(name)](#module_studio/authored/organic-modern..create..range)
      - [~pages(name)](#module_studio/authored/organic-modern..create..pages)
      - [~render(ui, mode)](#module_studio/authored/organic-modern..create..render) ⇒ <code>string</code>
      - [~tableRows(page)](#module_studio/authored/organic-modern..create..tableRows)
      - [~bind(useReference, setMode)](#module_studio/authored/organic-modern..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/organic-modern.render"></a>

### studio/authored/organic-modern.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/organic-modern</code>](#module_studio/authored/organic-modern)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/organic-modern.bind"></a>

### studio/authored/organic-modern.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/organic-modern</code>](#module_studio/authored/organic-modern)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/organic-modern..create"></a>

### studio/authored/organic-modern~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/organic-modern</code>](#module_studio/authored/organic-modern)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/organic-modern..create) ⇒ <code>Object</code>
  - [~icon(name)](#module_studio/authored/organic-modern..create..icon)
  - [~tool(name)](#module_studio/authored/organic-modern..create..tool)
  - [~button(text)](#module_studio/authored/organic-modern..create..button)
  - [~photo(region, alt)](#module_studio/authored/organic-modern..create..photo) ⇒ <code>string</code>
  - [~section(title)](#module_studio/authored/organic-modern..create..section)
  - [~field(type)](#module_studio/authored/organic-modern..create..field)
  - [~choice(label)](#module_studio/authored/organic-modern..create..choice)
  - [~range(name)](#module_studio/authored/organic-modern..create..range)
  - [~pages(name)](#module_studio/authored/organic-modern..create..pages)
  - [~render(ui, mode)](#module_studio/authored/organic-modern..create..render) ⇒ <code>string</code>
  - [~tableRows(page)](#module_studio/authored/organic-modern..create..tableRows)
  - [~bind(useReference, setMode)](#module_studio/authored/organic-modern..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/organic-modern..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                   |
| ----- | ------------------- | ------------------------------------------------------------- |
| name  | <code>string</code> | Phosphor regular glyph. @returns {string} Current-color icon. |

<a name="module_studio/authored/organic-modern..create..tool"></a>

#### create~tool(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                                            |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| name  | <code>string</code> | Icon. @param {string} label Accessible name. @param {string} attrs Authored attributes. @returns {string} Tool button. |

<a name="module_studio/authored/organic-modern..create..button"></a>

#### create~button(text)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                                                 |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| text  | <code>string</code> | Authored label. @param {string} variant Visual suffix. @param {string} attrs Authored attributes. @returns {string} Button. |

<a name="module_studio/authored/organic-modern..create..photo"></a>

#### create~photo(region, alt) ⇒ <code>string</code>

Windows only photographic regions from the supplied board, never interface pixels.
Coordinates use its 1920x1280 presentation scale; the full retained PNG stays unchanged.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)  
**Returns**: <code>string</code> - Clipped, locally retained photograph.

| Param  | Type                              | Description                            |
| ------ | --------------------------------- | -------------------------------------- |
| region | <code>Array.&lt;number&gt;</code> | Photo-only x/y/width/height rectangle. |
| alt    | <code>string</code>               | Image description.                     |

<a name="module_studio/authored/organic-modern..create..section"></a>

#### create~section(title)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                              |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| title | <code>string</code> | Heading. @param {string} body Section body. @param {string} id Anchor. @returns {string} Control family. |

<a name="module_studio/authored/organic-modern..create..field"></a>

#### create~field(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                                     |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native type. @param {string} name Label. @param {string} value Authored value. @returns {string} Labeled field. |

<a name="module_studio/authored/organic-modern..create..choice"></a>

#### create~choice(label)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                                    |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| label | <code>string</code> | Choice name. @param {string} type Native type. @param {string} attrs Authored state. @returns {string} Choice. |

<a name="module_studio/authored/organic-modern..create..range"></a>

#### create~range(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                                                                                                           |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| name  | <code>string</code> | Name. @param {string} id Unique id. @param {number} value Initial value. @param {string} prefix Unit prefix. @returns {string} Range. |

<a name="module_studio/authored/organic-modern..create..pages"></a>

#### create~pages(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                         |
| ----- | ------------------- | --------------------------------------------------- |
| name  | <code>string</code> | Accessible name. @returns {string} Page navigation. |

<a name="module_studio/authored/organic-modern..create..render"></a>

#### create~render(ui, mode) ⇒ <code>string</code>

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)  
**Returns**: <code>string</code> - Complete public-component specimen or empty markup.

| Param | Type                | Default                        | Description                              |
| ----- | ------------------- | ------------------------------ | ---------------------------------------- |
| ui    | <code>string</code> |                                | Active preset.                           |
| mode  | <code>string</code> | <code>&quot;light&quot;</code> | Active mode, independent of color theme. |

<a name="module_studio/authored/organic-modern..create..tableRows"></a>

#### create~tableRows(page)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param | Type                | Description                                             |
| ----- | ------------------- | ------------------------------------------------------- |
| page  | <code>number</code> | One-based page. @returns {string} Authored sample rows. |

<a name="module_studio/authored/organic-modern..create..bind"></a>

#### create~bind(useReference, setMode) ⇒ <code>void</code>

Attaches interactions only to the current Organic sheet.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/organic-modern..create)

| Param        | Type                  | Description                                    |
| ------------ | --------------------- | ---------------------------------------------- |
| useReference | <code>function</code> | Select original palette without changing mode. |
| setMode      | <code>function</code> | Update the shared demo's mode.                 |
