<!-- Generated with jsdoc2md from demo/studio/examples.js; do not edit by hand. -->

# studio examples

<a name="module_studio/examples"></a>

## studio/examples

Shared, deterministic examples. Visual configuration never changes their data.

- [studio/examples](#module_studio/examples)
  - _static_
    - [.renderExample(name)](#module_studio/examples.renderExample) ⇒ <code>string</code>
  - _inner_
    - [~chartValues](#module_studio/examples..chartValues)
    - [~chart()](#module_studio/examples..chart) ⇒ <code>string</code>
    - [~dashboard()](#module_studio/examples..dashboard) ⇒ <code>string</code>
    - [~form()](#module_studio/examples..form) ⇒ <code>string</code>
    - [~content()](#module_studio/examples..content) ⇒ <code>string</code>

<a name="module_studio/examples.renderExample"></a>

### studio/examples.renderExample(name) ⇒ <code>string</code>

Selects one shared example, keeping content independent of appearance.

**Kind**: static method of [<code>studio/examples</code>](#module_studio/examples)  
**Returns**: <code>string</code> - Trusted example markup.

| Param | Type                | Description         |
| ----- | ------------------- | ------------------- |
| name  | <code>string</code> | Example identifier. |

<a name="module_studio/examples..chartValues"></a>

### studio/examples~chartValues

Six real values shared by the SVG and its accessible data table.

**Kind**: inner constant of [<code>studio/examples</code>](#module_studio/examples)  
<a name="module_studio/examples..chart"></a>

### studio/examples~chart() ⇒ <code>string</code>

Draws a directly labeled SVG trend backed by the exact same table values.

**Kind**: inner method of [<code>studio/examples</code>](#module_studio/examples)  
**Returns**: <code>string</code> - Accessible chart and data disclosure.  
<a name="module_studio/examples..dashboard"></a>

### studio/examples~dashboard() ⇒ <code>string</code>

Renders the records dashboard; filtering is bound once by the frame controller.

**Kind**: inner method of [<code>studio/examples</code>](#module_studio/examples)  
**Returns**: <code>string</code> - Dashboard markup.  
<a name="module_studio/examples..form"></a>

### studio/examples~form() ⇒ <code>string</code>

Renders a native validated form with a demonstrable local save lifecycle.

**Kind**: inner method of [<code>studio/examples</code>](#module_studio/examples)  
**Returns**: <code>string</code> - Form example.  
<a name="module_studio/examples..content"></a>

### studio/examples~content() ⇒ <code>string</code>

Renders a customer-facing page with locally selectable plans and feedback.

**Kind**: inner method of [<code>studio/examples</code>](#module_studio/examples)  
**Returns**: <code>string</code> - Content example.
