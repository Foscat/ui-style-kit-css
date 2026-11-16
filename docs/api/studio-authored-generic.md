<!-- Generated with jsdoc2md from demo/studio/authored/generic.js; do not edit by hand. -->

# studio authored generic

<a name="module_studio/authored/generic"></a>

## studio/authored/generic

Shared surface-only specimens for presets without a dedicated reference board.

- [studio/authored/generic](#module_studio/authored/generic)
  - [.render(context)](#module_studio/authored/generic.render) ⇒ <code>string</code>
  - [.bind()](#module_studio/authored/generic.bind) ⇒ <code>function</code>

<a name="module_studio/authored/generic.render"></a>

### studio/authored/generic.render(context) ⇒ <code>string</code>

Renders the selected public surface collection.

**Kind**: static method of [<code>studio/authored/generic</code>](#module_studio/authored/generic)  
**Returns**: <code>string</code> - Authored markup.

| Param   | Type                | Description                  |
| ------- | ------------------- | ---------------------------- |
| context | <code>Object</code> | Owned appearance and prefix. |

<a name="module_studio/authored/generic.bind"></a>

### studio/authored/generic.bind() ⇒ <code>function</code>

Surface-only samples require no additional event resources.

**Kind**: static method of [<code>studio/authored/generic</code>](#module_studio/authored/generic)  
**Returns**: <code>function</code> - Empty cleanup.
