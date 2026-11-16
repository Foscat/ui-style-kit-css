<!-- Generated with jsdoc2md from demo/studio/assets.js; do not edit by hand. -->

# studio assets

<a name="module_studio/assets"></a>

## studio/assets

Stages focused stylesheets and retains the active paint until a replacement transaction succeeds.

- [studio/assets](#module_studio/assets)
  - _static_
    - [.preparePresetStylesheet(ui)](#module_studio/assets.preparePresetStylesheet) ⇒ <code>Promise.&lt;Object&gt;</code>
  - _inner_
    - [~releaseEntry(entry)](#module_studio/assets..releaseEntry) ⇒ <code>void</code>

<a name="module_studio/assets.preparePresetStylesheet"></a>

### studio/assets.preparePresetStylesheet(ui) ⇒ <code>Promise.&lt;Object&gt;</code>

Stages one library stylesheet without repainting the visible document.
Call activate only for the selected render generation, then finish or roll back its transaction.
Always release the lease, including when another generation supersedes preparation.

**Kind**: static method of [<code>studio/assets</code>](#module_studio/assets)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Lease with activate and release methods; activation exposes finish and rollback.

| Param | Type                | Description                  |
| ----- | ------------------- | ---------------------------- |
| ui    | <code>string</code> | Validated preset identifier. |

<a name="module_studio/assets..releaseEntry"></a>

### studio/assets~releaseEntry(entry) ⇒ <code>void</code>

Releases an inactive stylesheet once no pending renderer still owns it.

**Kind**: inner method of [<code>studio/assets</code>](#module_studio/assets)

| Param | Type                | Description              |
| ----- | ------------------- | ------------------------ |
| entry | <code>Object</code> | Shared stylesheet entry. |
