<!-- Generated with jsdoc2md from demo/studio/authored/bauhaus.js; do not edit by hand. -->

# studio authored bauhaus

<a name="module_studio/authored/bauhaus"></a>

## studio/authored/bauhaus

Canonical bauhaus specimen shared by Studio and reference consumers.

- [studio/authored/bauhaus](#module_studio/authored/bauhaus)
  - _static_
    - [.render(context)](#module_studio/authored/bauhaus.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/bauhaus.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/bauhaus..create) ⇒ <code>Object</code>
      - [~icon(name)](#module_studio/authored/bauhaus..create..icon)
      - [~header(title)](#module_studio/authored/bauhaus..create..header)
      - [~field(title)](#module_studio/authored/bauhaus..create..field)
      - [~render(ui)](#module_studio/authored/bauhaus..create..render)
      - [~bind(onReference, onMode)](#module_studio/authored/bauhaus..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/bauhaus.render"></a>

### studio/authored/bauhaus.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/bauhaus</code>](#module_studio/authored/bauhaus)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/bauhaus.bind"></a>

### studio/authored/bauhaus.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/bauhaus</code>](#module_studio/authored/bauhaus)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/bauhaus..create"></a>

### studio/authored/bauhaus~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/bauhaus</code>](#module_studio/authored/bauhaus)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/bauhaus..create) ⇒ <code>Object</code>
  - [~icon(name)](#module_studio/authored/bauhaus..create..icon)
  - [~header(title)](#module_studio/authored/bauhaus..create..header)
  - [~field(title)](#module_studio/authored/bauhaus..create..field)
  - [~render(ui)](#module_studio/authored/bauhaus..create..render)
  - [~bind(onReference, onMode)](#module_studio/authored/bauhaus..create..bind) ⇒ <code>void</code>

<a name="module_studio/authored/bauhaus..create..icon"></a>

#### create~icon(name)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/bauhaus..create)

| Param | Type                | Description                                                           |
| ----- | ------------------- | --------------------------------------------------------------------- |
| name  | <code>string</code> | Licensed Lucide identifier. @returns {string} Decorative icon markup. |

<a name="module_studio/authored/bauhaus..create..header"></a>

#### create~header(title)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/bauhaus..create)

| Param | Type                | Description                                                                   |
| ----- | ------------------- | ----------------------------------------------------------------------------- |
| title | <code>string</code> | Panel title. @param {string} name Icon name. @returns {string} Panel heading. |

<a name="module_studio/authored/bauhaus..create..field"></a>

#### create~field(title)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/bauhaus..create)

| Param | Type                | Description                                                                           |
| ----- | ------------------- | ------------------------------------------------------------------------------------- |
| title | <code>string</code> | Field label. @param {string} control Control markup. @returns {string} Labeled field. |

<a name="module_studio/authored/bauhaus..create..render"></a>

#### create~render(ui)

**Kind**: inner method of [<code>create</code>](#module_studio/authored/bauhaus..create)

| Param | Type                | Description                                                                                  |
| ----- | ------------------- | -------------------------------------------------------------------------------------------- |
| ui    | <code>string</code> | Selected preset. @param {string} mode Selected mode. @returns {string} Preset-only specimen. |

<a name="module_studio/authored/bauhaus..create..bind"></a>

#### create~bind(onReference, onMode) ⇒ <code>void</code>

Binds local specimen behavior after the demo replaces its content.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/bauhaus..create)

| Param       | Type                  | Description                         |
| ----------- | --------------------- | ----------------------------------- |
| onReference | <code>function</code> | Select the preset fallback palette. |
| onMode      | <code>function</code> | Select the shared light/dark mode.  |
