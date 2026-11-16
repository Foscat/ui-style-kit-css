<!-- Generated with jsdoc2md from scripts/build-studio.mjs; do not edit by hand. -->

# build studio

<a name="module_scripts/build-studio"></a>

## scripts/build-studio

Produces offline-capable studio assets and HTML; demo.css and studio.css remain authored files.

- [scripts/build-studio](#module_scripts/build-studio)
  - _static_
    - [.buildStudio()](#module_scripts/build-studio.buildStudio) ⇒ <code>Promise.&lt;void&gt;</code>
  - _inner_
    - [~buildStudioIcons(manifest)](#module_scripts/build-studio..buildStudioIcons) ⇒ <code>Promise.&lt;Object&gt;</code>
    - [~compileSource(source, output)](#module_scripts/build-studio..compileSource) ⇒ <code>Promise.&lt;void&gt;</code>
    - [~authoredFiles(directory)](#module_scripts/build-studio..authoredFiles) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    - [~buildAuthoredSpecimens()](#module_scripts/build-studio..buildAuthoredSpecimens) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_scripts/build-studio.buildStudio"></a>

### scripts/build-studio.buildStudio() ⇒ <code>Promise.&lt;void&gt;</code>

Builds the studio without altering the CSS library's public runtime contract.

**Kind**: static method of [<code>scripts/build-studio</code>](#module_scripts/build-studio)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after bundles, manifest, chrome, and hashes align.  
<a name="module_scripts/build-studio..buildStudioIcons"></a>

### scripts/build-studio~buildStudioIcons(manifest) ⇒ <code>Promise.&lt;Object&gt;</code>

Builds lazy family assets directly from the pinned companion package.
Compatibility registry names retain existing specimen bindings while artwork comes from one source.

**Kind**: inner method of [<code>scripts/build-studio</code>](#module_scripts/build-studio)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Companion version and explicit studio defaults.

| Param    | Type                | Description                 |
| -------- | ------------------- | --------------------------- |
| manifest | <code>Object</code> | Public UI preset inventory. |

<a name="module_scripts/build-studio..compileSource"></a>

### scripts/build-studio~compileSource(source, output) ⇒ <code>Promise.&lt;void&gt;</code>

Compiles one authoritative entry to a compact classic script and linked content-versioned map.

**Kind**: inner method of [<code>scripts/build-studio</code>](#module_scripts/build-studio)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when both artifacts are current.

| Param  | Type                | Description                           |
| ------ | ------------------- | ------------------------------------- |
| source | <code>string</code> | Repository-relative authored entry.   |
| output | <code>string</code> | Repository-relative generated output. |

<a name="module_scripts/build-studio..authoredFiles"></a>

### scripts/build-studio~authoredFiles(directory) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>

Lists only authored files in stable order, including nested specimen modules.

**Kind**: inner method of [<code>scripts/build-studio</code>](#module_scripts/build-studio)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Recursive file inventory.

| Param     | Type                | Description  |
| --------- | ------------------- | ------------ |
| directory | <code>string</code> | Source root. |

<a name="module_scripts/build-studio..buildAuthoredSpecimens"></a>

### scripts/build-studio~buildAuthoredSpecimens() ⇒ <code>Promise.&lt;void&gt;</code>

Compiles explicit specimen sources shared by both demo consumers.

**Kind**: inner method of [<code>scripts/build-studio</code>](#module_scripts/build-studio)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after every canonical entry is built.
