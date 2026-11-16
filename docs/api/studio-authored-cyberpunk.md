<!-- Generated with jsdoc2md from demo/studio/authored/cyberpunk.js; do not edit by hand. -->

# studio authored cyberpunk

<a name="module_studio/authored/cyberpunk"></a>

## studio/authored/cyberpunk

Canonical cyberpunk specimen shared by Studio and reference consumers.

- [studio/authored/cyberpunk](#module_studio/authored/cyberpunk)
  - _static_
    - [.render(context)](#module_studio/authored/cyberpunk.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/cyberpunk.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(_context)](#module_studio/authored/cyberpunk..create) ⇒ <code>Object</code>
      - [~renderCyberpunkTemplateSpecimen(ui, p)](#module_studio/authored/cyberpunk..create..renderCyberpunkTemplateSpecimen) ⇒ <code>string</code>

<a name="module_studio/authored/cyberpunk.render"></a>

### studio/authored/cyberpunk.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/cyberpunk</code>](#module_studio/authored/cyberpunk)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/cyberpunk.bind"></a>

### studio/authored/cyberpunk.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/cyberpunk</code>](#module_studio/authored/cyberpunk)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/cyberpunk..create"></a>

### studio/authored/cyberpunk~create(_context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/cyberpunk</code>](#module_studio/authored/cyberpunk)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param    | Type                | Description                                                    |
| -------- | ------------------- | -------------------------------------------------------------- |
| _context | <code>Object</code> | Unused context; this specimen renders from explicit arguments. |

<a name="module_studio/authored/cyberpunk..create..renderCyberpunkTemplateSpecimen"></a>

#### create~renderCyberpunkTemplateSpecimen(ui, p) ⇒ <code>string</code>

Renders the retained Cyberpunk template specimen with public cyber-* classes.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/cyberpunk..create)  
**Returns**: <code>string</code> - Cyberpunk specimen markup or an empty string for other presets.

| Param | Type                | Description                     |
| ----- | ------------------- | ------------------------------- |
| ui    | <code>string</code> | Active style preset identifier. |
| p     | <code>string</code> | Active style prefix.            |
