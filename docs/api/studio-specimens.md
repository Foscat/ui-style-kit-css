<!-- Generated with jsdoc2md from demo/studio/specimens.js; do not edit by hand. -->

# studio specimens

<a name="module_studio/specimens"></a>

## studio/specimens

Mounts the same explicit authored modules used by the retained reference fixture.

- [studio/specimens](#module_studio/specimens)
  - [~prepare(appearance)](#module_studio/specimens..prepare) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [~mount(root, appearance, onAppearance)](#module_studio/specimens..mount) ⇒ <code>function</code>

<a name="module_studio/specimens..prepare"></a>

### studio/specimens~prepare(appearance) ⇒ <code>Promise.&lt;Object&gt;</code>

Prepares one selected board through the shared loader.

**Kind**: inner method of [<code>studio/specimens</code>](#module_studio/specimens)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Registered authored module.

| Param      | Type                | Description      |
| ---------- | ------------------- | ---------------- |
| appearance | <code>Object</code> | Selected preset. |

<a name="module_studio/specimens..mount"></a>

### studio/specimens~mount(root, appearance, onAppearance) ⇒ <code>function</code>

Mounts a board with explicit signal propagation and complete resource cleanup.

**Kind**: inner method of [<code>studio/specimens</code>](#module_studio/specimens)  
**Returns**: <code>function</code> - Idempotent disposer.

| Param        | Type                     | Description                            |
| ------------ | ------------------------ | -------------------------------------- |
| root         | <code>HTMLElement</code> | Owned content region.                  |
| appearance   | <code>Object</code>      | Current appearance.                    |
| onAppearance | <code>function</code>    | Explicit sample palette/mode callback. |
