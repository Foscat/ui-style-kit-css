<!-- Generated with jsdoc2md from scripts/generate-guided-corners.mjs; do not edit by hand. -->

# guided corners

<a name="module_scripts/generate-guided-corners"></a>

## scripts/generate-guided-corners

Generate opt-in, preset-independent control/surface geometry without changing authored defaults.

- [scripts/generate-guided-corners](#module_scripts/generate-guided-corners)
  - [.guidedCornersCss(manifest)](#module_scripts/generate-guided-corners.guidedCornersCss) ⇒ <code>string</code>
  - [.syncGuidedCorners(root, manifest, [options])](#module_scripts/generate-guided-corners.syncGuidedCorners) ⇒ <code>void</code>

<a name="module_scripts/generate-guided-corners.guidedCornersCss"></a>

### scripts/generate-guided-corners.guidedCornersCss(manifest) ⇒ <code>string</code>

Build a closed opt-in geometry layer for native, canonical, compatibility and prefixed controls.
Omitting the attribute restores each preset; avatar and circular decoration roles are excluded.

**Kind**: static method of [<code>scripts/generate-guided-corners</code>](#module_scripts/generate-guided-corners)  
**Returns**: <code>string</code> - Deterministic CSS with no changes to colors, layout, clipping, motion or defaults.

| Param    | Type                | Description                                     |
| -------- | ------------------- | ----------------------------------------------- |
| manifest | <code>object</code> | Public preset and semantic namespace inventory. |

<a name="module_scripts/generate-guided-corners.syncGuidedCorners"></a>

### scripts/generate-guided-corners.syncGuidedCorners(root, manifest, [options]) ⇒ <code>void</code>

Synchronize the generated module before the normal distribution build.

**Kind**: static method of [<code>scripts/generate-guided-corners</code>](#module_scripts/generate-guided-corners)  
**Returns**: <code>void</code> - Completes with exact bytes or a bounded drift error.

| Param           | Type                 | Default            | Description                    |
| --------------- | -------------------- | ------------------ | ------------------------------ |
| root            | <code>string</code>  |                    | Owning library checkout.       |
| manifest        | <code>object</code>  |                    | Authoritative public manifest. |
| [options]       | <code>object</code>  |                    | Read-only drift check options. |
| [options.check] | <code>boolean</code> | <code>false</code> | Refuse drift without writing.  |
