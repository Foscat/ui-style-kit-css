<!-- Generated with jsdoc2md from demo/studio/authored/art-deco.js; do not edit by hand. -->

# studio authored art deco

<a name="module_studio/authored/art-deco"></a>

## studio/authored/art-deco

Canonical art-deco specimen shared by Studio and reference consumers.

- [studio/authored/art-deco](#module_studio/authored/art-deco)
  - _static_
    - [.render(context)](#module_studio/authored/art-deco.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/art-deco.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/art-deco..create) ⇒ <code>Object</code>
      - [~icon(name)](#module_studio/authored/art-deco..create..icon)
      - [~button(label)](#module_studio/authored/art-deco..create..button)
      - [~group(n)](#module_studio/authored/art-deco..create..group)
      - [~field(type)](#module_studio/authored/art-deco..create..field)
      - [~choice(type)](#module_studio/authored/art-deco..create..choice)
      - [~render(ui, mode, reference)](#module_studio/authored/art-deco..create..render) ⇒ <code>string</code>
      - [~bind(useReference)](#module_studio/authored/art-deco..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/art-deco.render"></a>

### studio/authored/art-deco.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/art-deco</code>](#module_studio/authored/art-deco)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/art-deco.bind"></a>

### studio/authored/art-deco.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/art-deco</code>](#module_studio/authored/art-deco)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/art-deco..create"></a>

### studio/authored/art-deco~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/art-deco</code>](#module_studio/authored/art-deco)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/art-deco..create) ⇒ <code>Object</code>
  - [~icon(name)](#module_studio/authored/art-deco..create..icon)
  - [~button(label)](#module_studio/authored/art-deco..create..button)
  - [~group(n)](#module_studio/authored/art-deco..create..group)
  - [~field(type)](#module_studio/authored/art-deco..create..field)
  - [~choice(type)](#module_studio/authored/art-deco..create..choice)
  - [~render(ui, mode, reference)](#module_studio/authored/art-deco..create..render) ⇒ <code>string</code>
  - [~bind(useReference)](#module_studio/authored/art-deco..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/art-deco..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param | Type                | Description                                                   |
| ----- | ------------------- | ------------------------------------------------------------- |
| name  | <code>string</code> | Licensed icon name. @returns {string} Decorative icon markup. |

<a name="module_studio/authored/art-deco..create..button"></a>

#### create~button(label)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param | Type                | Description                                                                                                                      |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| label | <code>string</code> | Button copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. |

<a name="module_studio/authored/art-deco..create..group"></a>

#### create~group(n)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param | Type                | Description                                                                                                                                         |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| n     | <code>number</code> | Group number. @param {string} id Group key. @param {string} title Heading. @param {string} body Authored content. @returns {string} Specimen group. |

<a name="module_studio/authored/art-deco..create..field"></a>

#### create~field(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param | Type                | Description                                                                                                                                                          |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native input type. @param {string} label Field name. @param {string} value Sample value. @param {string} attrs Authored attributes. @returns {string} Labeled field. |

<a name="module_studio/authored/art-deco..create..choice"></a>

#### create~choice(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param | Type                | Description                                                                                                                    |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| type  | <code>string</code> | Choice type. @param {string} label Visible name. @param {string} attrs Native attributes. @returns {string} Accessible choice. |

<a name="module_studio/authored/art-deco..create..render"></a>

#### create~render(ui, mode, reference) ⇒ <code>string</code>

Renders all seventeen reference groups only for the selected preset.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)  
**Returns**: <code>string</code> - Functional specimen HTML or an empty string.

| Param     | Type                 | Description                                     |
| --------- | -------------------- | ----------------------------------------------- |
| ui        | <code>string</code>  | Active preset.                                  |
| mode      | <code>string</code>  | Active mode.                                    |
| reference | <code>boolean</code> | Whether the native reference palette is active. |

<a name="module_studio/authored/art-deco..create..bind"></a>

#### create~bind(useReference) ⇒ <code>void</code>

Binds keyboard and native controls to inert local specimen data.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/art-deco..create)

| Param        | Type                  | Description                                      |
| ------------ | --------------------- | ------------------------------------------------ |
| useReference | <code>function</code> | Switches the host demo to its reference palette. |
