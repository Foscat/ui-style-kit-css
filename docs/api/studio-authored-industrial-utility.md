<!-- Generated with jsdoc2md from demo/studio/authored/industrial-utility.js; do not edit by hand. -->

# studio authored industrial utility

<a name="module_studio/authored/industrial-utility"></a>

## studio/authored/industrial-utility

Canonical industrial-utility specimen shared by Studio and reference consumers.

- [studio/authored/industrial-utility](#module_studio/authored/industrial-utility)
  - _static_
    - [.render(context)](#module_studio/authored/industrial-utility.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/industrial-utility.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/industrial-utility..create) ⇒ <code>Object</code>
      - [~renderIndustrialTemplateSpecimen()](#module_studio/authored/industrial-utility..create..renderIndustrialTemplateSpecimen)
      - [~bindIndustrialSpecimen()](#module_studio/authored/industrial-utility..create..bindIndustrialSpecimen)

<a name="module_studio/authored/industrial-utility.render"></a>

### studio/authored/industrial-utility.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/industrial-utility</code>](#module_studio/authored/industrial-utility)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/industrial-utility.bind"></a>

### studio/authored/industrial-utility.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/industrial-utility</code>](#module_studio/authored/industrial-utility)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/industrial-utility..create"></a>

### studio/authored/industrial-utility~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/industrial-utility</code>](#module_studio/authored/industrial-utility)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/industrial-utility..create) ⇒ <code>Object</code>
  - [~renderIndustrialTemplateSpecimen()](#module_studio/authored/industrial-utility..create..renderIndustrialTemplateSpecimen)
  - [~bindIndustrialSpecimen()](#module_studio/authored/industrial-utility..create..bindIndustrialSpecimen)

<a name="module_studio/authored/industrial-utility..create..renderIndustrialTemplateSpecimen"></a>

#### create~renderIndustrialTemplateSpecimen()

Renders only the active Industrial Utility preset using the retained element-board layout.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/industrial-utility..create)  
<a name="module_studio/authored/industrial-utility..create..bindIndustrialSpecimen"></a>

#### create~bindIndustrialSpecimen()

Binds inert console interactions inside the active preset, without affecting other styles.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/industrial-utility..create)
