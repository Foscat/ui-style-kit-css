<!-- Generated with jsdoc2md from demo/studio/specimen-context.js; do not edit by hand. -->

# studio specimen context

<a name="module_studio/specimen-context"></a>

## studio/specimen-context

Explicit appearance, asset and callback input shared by both demo consumers.

<a name="module_studio/specimen-context.createSpecimenContext"></a>

### studio/specimen-context.createSpecimenContext(root, appearance, inventory, onAppearance, [referencePalette]) ⇒ <code>Object</code>

Resolves one specimen context from actual host state rather than simulated controls.

**Kind**: static method of [<code>studio/specimen-context</code>](#module_studio/specimen-context)  
**Returns**: <code>Object</code> - Stable input for an authored renderer and its binder.

| Param              | Type                     | Default                        | Description                                   |
| ------------------ | ------------------------ | ------------------------------ | --------------------------------------------- |
| root               | <code>HTMLElement</code> |                                | Owned content container.                      |
| appearance         | <code>Object</code>      |                                | Selected preset, palette and mode.            |
| inventory          | <code>Object</code>      |                                | Generated public and specimen inventory.      |
| onAppearance       | <code>function</code>    |                                | Explicit palette/mode callback.               |
| [referencePalette] | <code>boolean</code>     | <code>!appearance.theme</code> | Whether the original board palette is active. |
