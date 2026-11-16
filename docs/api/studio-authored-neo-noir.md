<!-- Generated with jsdoc2md from demo/studio/authored/neo-noir.js; do not edit by hand. -->

# studio authored neo noir

<a name="module_studio/authored/neo-noir"></a>

## studio/authored/neo-noir

Canonical neo-noir specimen shared by Studio and reference consumers.

- [studio/authored/neo-noir](#module_studio/authored/neo-noir)
  - _static_
    - [.render(context)](#module_studio/authored/neo-noir.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/neo-noir.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/neo-noir..create) ⇒ <code>Object</code>
      - [~icon(name)](#module_studio/authored/neo-noir..create..icon)
      - [~button(text)](#module_studio/authored/neo-noir..create..button)
      - [~group(n)](#module_studio/authored/neo-noir..create..group)
      - [~field(type)](#module_studio/authored/neo-noir..create..field)
      - [~fields(label)](#module_studio/authored/neo-noir..create..fields)
      - [~choice(type)](#module_studio/authored/neo-noir..create..choice)
      - [~progress(value)](#module_studio/authored/neo-noir..create..progress)
      - [~dialogBody()](#module_studio/authored/neo-noir..create..dialogBody) ⇒ <code>string</code>
      - [~render(ui, mode, reference)](#module_studio/authored/neo-noir..create..render) ⇒ <code>string</code>
      - [~bind(useReference)](#module_studio/authored/neo-noir..create..bind) ⇒ <code>void</code>
        - [~roving(selector)](#module_studio/authored/neo-noir..create..bind..roving)

<a name="module_studio/authored/neo-noir.render"></a>

### studio/authored/neo-noir.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/neo-noir</code>](#module_studio/authored/neo-noir)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/neo-noir.bind"></a>

### studio/authored/neo-noir.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/neo-noir</code>](#module_studio/authored/neo-noir)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/neo-noir..create"></a>

### studio/authored/neo-noir~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/neo-noir</code>](#module_studio/authored/neo-noir)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/neo-noir..create) ⇒ <code>Object</code>
  - [~icon(name)](#module_studio/authored/neo-noir..create..icon)
  - [~button(text)](#module_studio/authored/neo-noir..create..button)
  - [~group(n)](#module_studio/authored/neo-noir..create..group)
  - [~field(type)](#module_studio/authored/neo-noir..create..field)
  - [~fields(label)](#module_studio/authored/neo-noir..create..fields)
  - [~choice(type)](#module_studio/authored/neo-noir..create..choice)
  - [~progress(value)](#module_studio/authored/neo-noir..create..progress)
  - [~dialogBody()](#module_studio/authored/neo-noir..create..dialogBody) ⇒ <code>string</code>
  - [~render(ui, mode, reference)](#module_studio/authored/neo-noir..create..render) ⇒ <code>string</code>
  - [~bind(useReference)](#module_studio/authored/neo-noir..create..bind) ⇒ <code>void</code>
    - [~roving(selector)](#module_studio/authored/neo-noir..create..bind..roving)

<a name="module_studio/authored/neo-noir..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                      |
| ----- | ------------------- | ------------------------------------------------ |
| name  | <code>string</code> | Licensed icon. @returns {string} Decorative SVG. |

<a name="module_studio/authored/neo-noir..create..button"></a>

#### create~button(text)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                                                               |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| text  | <code>string</code> | Button copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button. |

<a name="module_studio/authored/neo-noir..create..group"></a>

#### create~group(n)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                                                          |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| n     | <code>number</code> | Group index. @param {string} title Heading. @param {string} body Authored content. @returns {string} Numbered group. |

<a name="module_studio/authored/neo-noir..create..field"></a>

#### create~field(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                                                                   |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native type. @param {string} state Visible state. @param {string} value Sample value. @returns {string} Native labeled field. |

<a name="module_studio/authored/neo-noir..create..fields"></a>

#### create~fields(label)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                                                                                                |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| label | <code>string</code> | Column title. @param {string} type Native type. @param {string[]} states Shown states. @param {string} value Sample value. @returns {string} Field family. |

<a name="module_studio/authored/neo-noir..create..choice"></a>

#### create~choice(type)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                                                     |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| type  | <code>string</code> | Native choice. @param {string} label Copy. @param {string} attrs Authored attributes. @returns {string} Choice. |

<a name="module_studio/authored/neo-noir..create..progress"></a>

#### create~progress(value)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param | Type                | Description                                                                     |
| ----- | ------------------- | ------------------------------------------------------------------------------- |
| value | <code>number</code> | Percentage. @param {string} label Accessible label. @returns {string} Progress. |

<a name="module_studio/authored/neo-noir..create..dialogBody"></a>

#### create~dialogBody() ⇒ <code>string</code>

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)  
**Returns**: <code>string</code> - Reusable confirmation anatomy.  
<a name="module_studio/authored/neo-noir..create..render"></a>

#### create~render(ui, mode, reference) ⇒ <code>string</code>

Returns no preset-specific markup for other styles.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)  
**Returns**: <code>string</code> - Complete reference specimen.

| Param     | Type                 | Description                  |
| --------- | -------------------- | ---------------------------- |
| ui        | <code>string</code>  | Active preset.               |
| mode      | <code>string</code>  | Color mode.                  |
| reference | <code>boolean</code> | Reference-palette selection. |

<a name="module_studio/authored/neo-noir..create..bind"></a>

#### create~bind(useReference) ⇒ <code>void</code>

Binds keyboard-equivalent, local-only sample interactions.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/neo-noir..create)

| Param        | Type                  | Description                      |
| ------------ | --------------------- | -------------------------------- |
| useReference | <code>function</code> | Host reference palette callback. |

<a name="module_studio/authored/neo-noir..create..bind..roving"></a>

##### bind~roving(selector)

**Kind**: inner method of [<code>bind</code>](#module_studio/authored/neo-noir..create..bind)

| Param    | Type                | Description                                                                                                                     |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| selector | <code>string</code> | Item selector. @param {string} attribute Selection attribute. @param {Function} selected Selection side effect. @returns {void} |
