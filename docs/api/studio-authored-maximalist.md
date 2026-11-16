<!-- Generated with jsdoc2md from demo/studio/authored/maximalist.js; do not edit by hand. -->

# studio authored maximalist

<a name="module_studio/authored/maximalist"></a>

## studio/authored/maximalist

Canonical maximalist specimen shared by Studio and reference consumers.

- [studio/authored/maximalist](#module_studio/authored/maximalist)
  - _static_
    - [.render(context)](#module_studio/authored/maximalist.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/maximalist.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/maximalist..create) ⇒ <code>Object</code>
      - [~renderMaximalistTemplateSpecimen(ui)](#module_studio/authored/maximalist..create..renderMaximalistTemplateSpecimen) ⇒ <code>string</code>
      - [~maximalistIcon(name)](#module_studio/authored/maximalist..create..maximalistIcon) ⇒ <code>string</code>

<a name="module_studio/authored/maximalist.render"></a>

### studio/authored/maximalist.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/maximalist</code>](#module_studio/authored/maximalist)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/maximalist.bind"></a>

### studio/authored/maximalist.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/maximalist</code>](#module_studio/authored/maximalist)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/maximalist..create"></a>

### studio/authored/maximalist~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/maximalist</code>](#module_studio/authored/maximalist)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/maximalist..create) ⇒ <code>Object</code>
  - [~renderMaximalistTemplateSpecimen(ui)](#module_studio/authored/maximalist..create..renderMaximalistTemplateSpecimen) ⇒ <code>string</code>
  - [~maximalistIcon(name)](#module_studio/authored/maximalist..create..maximalistIcon) ⇒ <code>string</code>

<a name="module_studio/authored/maximalist..create..renderMaximalistTemplateSpecimen"></a>

#### create~renderMaximalistTemplateSpecimen(ui) ⇒ <code>string</code>

Renders the retained Maximalist component board with public max-* classes.
The board groups every supported component family while leaving color paint
on semantic tokens so explicit library themes continue to take priority.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/maximalist..create)  
**Returns**: <code>string</code> - Complete Maximalist specimen markup or an empty string.

| Param | Type                | Description               |
| ----- | ------------------- | ------------------------- |
| ui    | <code>string</code> | Active preset identifier. |

<a name="module_studio/authored/maximalist..create..maximalistIcon"></a>

#### create~maximalistIcon(name) ⇒ <code>string</code>

Renders a vendored Lucide icon for the Maximalist reference specimen.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/maximalist..create)  
**Returns**: <code>string</code> - Decorative SVG wrapper or an empty wrapper when unavailable.

| Param | Type                | Description                |
| ----- | ------------------- | -------------------------- |
| name  | <code>string</code> | Vendored Lucide icon name. |
