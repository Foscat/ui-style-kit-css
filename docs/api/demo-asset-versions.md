<!-- Generated with jsdoc2md from scripts/sync-demo-asset-versions.mjs; do not edit by hand. -->

# demo asset versions

<a name="module_scripts/demo-asset-versions"></a>

## scripts/demo-asset-versions

Resolve content-versioned asset URLs before generated HTML reaches disk.

- [scripts/demo-asset-versions](#module_scripts/demo-asset-versions)
  - [.versionDemoAssetUrls(root, entry, html)](#module_scripts/demo-asset-versions.versionDemoAssetUrls) ⇒ <code>string</code>
  - [.syncDemoAssetVersions(root)](#module_scripts/demo-asset-versions.syncDemoAssetVersions) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_scripts/demo-asset-versions.versionDemoAssetUrls"></a>

### scripts/demo-asset-versions.versionDemoAssetUrls(root, entry, html) ⇒ <code>string</code>

Versions local CSS/JavaScript references without an intermediate template write.
Existing non-version query parameters and external URLs are preserved.

**Kind**: static method of [<code>scripts/demo-asset-versions</code>](#module_scripts/demo-asset-versions)  
**Returns**: <code>string</code> - Final HTML with current asset hashes.

| Param | Type                | Description                           |
| ----- | ------------------- | ------------------------------------- |
| root  | <code>string</code> | Absolute repository root.             |
| entry | <code>string</code> | HTML path relative to the repository. |
| html  | <code>string</code> | Rendered template contents.           |

<a name="module_scripts/demo-asset-versions.syncDemoAssetVersions"></a>

### scripts/demo-asset-versions.syncDemoAssetVersions(root) ⇒ <code>Promise.&lt;void&gt;</code>

Refreshes all maintained entrypoints without touching already-current files.

**Kind**: static method of [<code>scripts/demo-asset-versions</code>](#module_scripts/demo-asset-versions)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when every local asset URL is current.

| Param | Type                | Description               |
| ----- | ------------------- | ------------------------- |
| root  | <code>string</code> | Absolute repository root. |
