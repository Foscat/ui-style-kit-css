<!-- Generated with jsdoc2md from demo/studio/authored/tactile.js; do not edit by hand. -->

# studio authored tactile

<a name="module_studio/authored/tactile"></a>

## studio/authored/tactile

Canonical tactile specimen shared by Studio and reference consumers.

- [studio/authored/tactile](#module_studio/authored/tactile)
  - _static_
    - [.render(context)](#module_studio/authored/tactile.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/tactile.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/tactile..create) ⇒ <code>Object</code>
      - [~renderTactileTemplateSpecimen(ui)](#module_studio/authored/tactile..create..renderTactileTemplateSpecimen) ⇒ <code>string</code>
      - [~tactileWorkspaceIcon(name)](#module_studio/authored/tactile..create..tactileWorkspaceIcon) ⇒ <code>string</code>

<a name="module_studio/authored/tactile.render"></a>

### studio/authored/tactile.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/tactile</code>](#module_studio/authored/tactile)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/tactile.bind"></a>

### studio/authored/tactile.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/tactile</code>](#module_studio/authored/tactile)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/tactile..create"></a>

### studio/authored/tactile~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/tactile</code>](#module_studio/authored/tactile)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/tactile..create) ⇒ <code>Object</code>
  - [~renderTactileTemplateSpecimen(ui)](#module_studio/authored/tactile..create..renderTactileTemplateSpecimen) ⇒ <code>string</code>
  - [~tactileWorkspaceIcon(name)](#module_studio/authored/tactile..create..tactileWorkspaceIcon) ⇒ <code>string</code>

<a name="module_studio/authored/tactile..create..renderTactileTemplateSpecimen"></a>

#### create~renderTactileTemplateSpecimen(ui) ⇒ <code>string</code>

Renders the retained Tactile workspace as reusable public tactile-* elements.
The specimen intentionally relies on the preset's material tokens so an
explicit library theme repaints it without changing its physical geometry.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/tactile..create)  
**Returns**: <code>string</code> - Complete Tactile workspace markup or an empty string.

| Param | Type                | Description               |
| ----- | ------------------- | ------------------------- |
| ui    | <code>string</code> | Active preset identifier. |

<a name="module_studio/authored/tactile..create..tactileWorkspaceIcon"></a>

#### create~tactileWorkspaceIcon(name) ⇒ <code>string</code>

Renders a licensed Lucide icon for the retained Tactile workspace specimen.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/tactile..create)  
**Returns**: <code>string</code> - Decorative icon markup supplied by the local icon bundle.

| Param | Type                | Description                |
| ----- | ------------------- | -------------------------- |
| name  | <code>string</code> | Vendored Lucide icon name. |
