<!-- Generated with jsdoc2md from demo/studio/authored/paper-editorial.js; do not edit by hand. -->

# studio authored paper editorial

<a name="module_studio/authored/paper-editorial"></a>

## studio/authored/paper-editorial

Canonical paper-editorial specimen shared by Studio and reference consumers.

- [studio/authored/paper-editorial](#module_studio/authored/paper-editorial)
  - _static_
    - [.render(context)](#module_studio/authored/paper-editorial.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/paper-editorial.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/paper-editorial..create) ⇒ <code>Object</code>
      - [~renderPaperEditorialTemplateSpecimen()](#module_studio/authored/paper-editorial..create..renderPaperEditorialTemplateSpecimen)
      - [~bindPaperEditorialSpecimen()](#module_studio/authored/paper-editorial..create..bindPaperEditorialSpecimen)

<a name="module_studio/authored/paper-editorial.render"></a>

### studio/authored/paper-editorial.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/paper-editorial</code>](#module_studio/authored/paper-editorial)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/paper-editorial.bind"></a>

### studio/authored/paper-editorial.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/paper-editorial</code>](#module_studio/authored/paper-editorial)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/paper-editorial..create"></a>

### studio/authored/paper-editorial~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/paper-editorial</code>](#module_studio/authored/paper-editorial)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/paper-editorial..create) ⇒ <code>Object</code>
  - [~renderPaperEditorialTemplateSpecimen()](#module_studio/authored/paper-editorial..create..renderPaperEditorialTemplateSpecimen)
  - [~bindPaperEditorialSpecimen()](#module_studio/authored/paper-editorial..create..bindPaperEditorialSpecimen)

<a name="module_studio/authored/paper-editorial..create..renderPaperEditorialTemplateSpecimen"></a>

#### create~renderPaperEditorialTemplateSpecimen()

Renders the eleven-folio field manual using public Paper Editorial components.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/paper-editorial..create)  
<a name="module_studio/authored/paper-editorial..create..bindPaperEditorialSpecimen"></a>

#### create~bindPaperEditorialSpecimen()

Binds scoped, keyboard-accessible sample interactions without external data writes.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/paper-editorial..create)
