<!-- Generated with jsdoc2md from demo/studio/changes.js; do not edit by hand. -->

# studio changes

<a name="module_studio/changes"></a>

## studio/changes

Classifies frame snapshots by the work their consumers actually own.

- [studio/changes](#module_studio/changes)
  - _static_
    - [.changesBetween(previous, next)](#module_studio/changes.changesBetween) ⇒ <code>Object</code>
  - _inner_
    - [~same([left], [right])](#module_studio/changes..same) ⇒ <code>boolean</code>

<a name="module_studio/changes.changesBetween"></a>

### studio/changes.changesBetween(previous, next) ⇒ <code>Object</code>

Computes independent visual and interaction invalidation domains.
Missing previous state intentionally requests a complete initial render.

**Kind**: static method of [<code>studio/changes</code>](#module_studio/changes)  
**Returns**: <code>Object</code> - Mount, appearance, geometry, palette, icon, filter, bridge and interaction changes.

| Param    | Type                | Description                   |
| -------- | ------------------- | ----------------------------- |
| previous | <code>Object</code> | Last accepted frame snapshot. |
| next     | <code>Object</code> | Requested frame snapshot.     |

<a name="module_studio/changes..same"></a>

### studio/changes~same([left], [right]) ⇒ <code>boolean</code>

Compares flat public records without serializing unrelated state.

**Kind**: inner method of [<code>studio/changes</code>](#module_studio/changes)  
**Returns**: <code>boolean</code> - Whether the records carry equal primitive fields.

| Param   | Type                | Default         | Description      |
| ------- | ------------------- | --------------- | ---------------- |
| [left]  | <code>Object</code> | <code>{}</code> | Previous values. |
| [right] | <code>Object</code> | <code>{}</code> | Next values.     |
