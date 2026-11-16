<!-- Generated with jsdoc2md from demo/studio/authored/editorial-luxe.js; do not edit by hand. -->

# studio authored editorial luxe

<a name="module_studio/authored/editorial-luxe"></a>

## studio/authored/editorial-luxe

Canonical editorial-luxe specimen shared by Studio and reference consumers.

- [studio/authored/editorial-luxe](#module_studio/authored/editorial-luxe)
  - _static_
    - [.render(context)](#module_studio/authored/editorial-luxe.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/editorial-luxe.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/editorial-luxe..create) ⇒ <code>Object</code>
      - [~icon(name)](#module_studio/authored/editorial-luxe..create..icon)
      - [~button(text)](#module_studio/authored/editorial-luxe..create..button)
      - [~group(n)](#module_studio/authored/editorial-luxe..create..group)
      - [~field(type)](#module_studio/authored/editorial-luxe..create..field)
      - [~choice(type)](#module_studio/authored/editorial-luxe..create..choice)
      - [~render(ui, mode, reference)](#module_studio/authored/editorial-luxe..create..render) ⇒ <code>string</code>
      - [~bind(useReference)](#module_studio/authored/editorial-luxe..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/editorial-luxe.render"></a>

### studio/authored/editorial-luxe.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/editorial-luxe</code>](#module_studio/authored/editorial-luxe)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/editorial-luxe.bind"></a>

### studio/authored/editorial-luxe.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/editorial-luxe</code>](#module_studio/authored/editorial-luxe)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/editorial-luxe..create"></a>

### studio/authored/editorial-luxe~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/editorial-luxe</code>](#module_studio/authored/editorial-luxe)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/editorial-luxe..create) ⇒ <code>Object</code>
  - [~icon(name)](#module_studio/authored/editorial-luxe..create..icon)
  - [~button(text)](#module_studio/authored/editorial-luxe..create..button)
  - [~group(n)](#module_studio/authored/editorial-luxe..create..group)
  - [~field(type)](#module_studio/authored/editorial-luxe..create..field)
  - [~choice(type)](#module_studio/authored/editorial-luxe..create..choice)
  - [~render(ui, mode, reference)](#module_studio/authored/editorial-luxe..create..render) ⇒ <code>string</code>
  - [~bind(useReference)](#module_studio/authored/editorial-luxe..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/editorial-luxe..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param | Type                | Description                                                          |
| ----- | ------------------- | -------------------------------------------------------------------- |
| name  | <code>string</code> | Licensed Lucide icon name. @returns {string} Decorative icon markup. |

<a name="module_studio/authored/editorial-luxe..create..button"></a>

#### create~button(text)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param | Type                | Description                                                                                                                        |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| text  | <code>string</code> | Authored copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. |

<a name="module_studio/authored/editorial-luxe..create..group"></a>

#### create~group(n)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param | Type                | Description                                                                                                                     |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| n     | <code>number</code> | Reference group number. @param {string} name Group title. @param {string} body Authored content. @returns {string} Ruled group. |

<a name="module_studio/authored/editorial-luxe..create..field"></a>

#### create~field(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param | Type                | Description                                                                                                                                                     |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native type. @param {string} label Accessible label. @param {string} value Sample value. @param {string} attrs Authored state. @returns {string} Labeled field. |

<a name="module_studio/authored/editorial-luxe..create..choice"></a>

#### create~choice(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param | Type                | Description                                                                                                               |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native choice. @param {string} label Visible copy. @param {string} attrs Authored state. @returns {string} Choice markup. |

<a name="module_studio/authored/editorial-luxe..create..render"></a>

#### create~render(ui, mode, reference) ⇒ <code>string</code>

Renders the complete reference surface only for the active legacy preset ID.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)  
**Returns**: <code>string</code> - Specimen HTML, or empty markup for other presets.

| Param     | Type                 | Description                                     |
| --------- | -------------------- | ----------------------------------------------- |
| ui        | <code>string</code>  | Active preset ID.                               |
| mode      | <code>string</code>  | Active color mode.                              |
| reference | <code>boolean</code> | Whether fallback reference colors are selected. |

<a name="module_studio/authored/editorial-luxe..create..bind"></a>

#### create~bind(useReference) ⇒ <code>void</code>

Binds accessible controls without sending data or changing persistent storage.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/editorial-luxe..create)

| Param        | Type                  | Description                             |
| ------------ | --------------------- | --------------------------------------- |
| useReference | <code>function</code> | Host callback for the fallback palette. |
