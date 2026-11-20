<!-- Generated with jsdoc2md from scripts/write-generated-file.mjs; do not edit by hand. -->

# generated files

<a name="module_scripts/write-generated-file"></a>

## scripts/write-generated-file

Preserve identical generated artifacts and retry transient Windows output locks.

- [scripts/write-generated-file](#module_scripts/write-generated-file)
  - [.writeGeneratedFile(filePath, contents, [maxAttempts])](#module_scripts/write-generated-file.writeGeneratedFile) ⇒ <code>Promise.&lt;void&gt;</code>
  - [.copyGeneratedFile(sourcePath, targetPath)](#module_scripts/write-generated-file.copyGeneratedFile) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_scripts/write-generated-file.writeGeneratedFile"></a>

### scripts/write-generated-file.writeGeneratedFile(filePath, contents, [maxAttempts]) ⇒ <code>Promise.&lt;void&gt;</code>

Writes changed bytes only, preserving timestamps and watcher state for identical output.

**Kind**: static method of [<code>scripts/write-generated-file</code>](#module_scripts/write-generated-file)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after matching bytes exist at the target.

| Param         | Type                                       | Default        | Description                                      |
| ------------- | ------------------------------------------ | -------------- | ------------------------------------------------ |
| filePath      | <code>string</code>                        |                | Absolute generated-file path.                    |
| contents      | <code>string</code> \| <code>Buffer</code> |                | Generated artifact contents.                     |
| [maxAttempts] | <code>number</code>                        | <code>8</code> | Maximum attempts for transient filesystem locks. |

<a name="module_scripts/write-generated-file.copyGeneratedFile"></a>

### scripts/write-generated-file.copyGeneratedFile(sourcePath, targetPath) ⇒ <code>Promise.&lt;void&gt;</code>

Copies generated binary or text assets using the same unchanged-output and retry contract.

**Kind**: static method of [<code>scripts/write-generated-file</code>](#module_scripts/write-generated-file)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the destination contains the source bytes.

| Param      | Type                | Description            |
| ---------- | ------------------- | ---------------------- |
| sourcePath | <code>string</code> | Trusted source asset.  |
| targetPath | <code>string</code> | Generated destination. |
