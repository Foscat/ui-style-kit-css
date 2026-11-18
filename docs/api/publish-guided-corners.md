<!-- Generated with jsdoc2md from scripts/publish-guided-corners.mjs; do not edit by hand. -->

# publish guided corners

<a name="module_scripts/publish-guided-corners"></a>

## scripts/publish-guided-corners

Publish only the independently reviewed 2.9.0 artifact through the existing package-owner route.

- [scripts/publish-guided-corners](#module_scripts/publish-guided-corners)
  - _static_
    - [.admitGuidedCornerRelease(evidence)](#module_scripts/publish-guided-corners.admitGuidedCornerRelease) ⇒ <code>string</code>
    - [.validateGuidedCornerProducer(evidence)](#module_scripts/publish-guided-corners.validateGuidedCornerProducer) ⇒ <code>number</code>
    - [.verifyGuidedCornerArtifactBytes(expected, bytes)](#module_scripts/publish-guided-corners.verifyGuidedCornerArtifactBytes) ⇒ <code>boolean</code>
    - [.verifyGuidedCornerReceipt(value, expected)](#module_scripts/publish-guided-corners.verifyGuidedCornerReceipt) ⇒ <code>object</code>
  - _inner_
    - [~run(program, args)](#module_scripts/publish-guided-corners..run) ⇒ <code>string</code>
    - [~api(endpoint)](#module_scripts/publish-guided-corners..api) ⇒ <code>object</code>
    - [~receipt()](#module_scripts/publish-guided-corners..receipt) ⇒ <code>object</code>
    - [~verifyArtifact()](#module_scripts/publish-guided-corners..verifyArtifact) ⇒ <code>object</code>
    - [~runIfSuccessful(program, args)](#module_scripts/publish-guided-corners..runIfSuccessful) ⇒ <code>string</code> \| <code>null</code>
    - [~main(mode)](#module_scripts/publish-guided-corners..main) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_scripts/publish-guided-corners.admitGuidedCornerRelease"></a>

### scripts/publish-guided-corners.admitGuidedCornerRelease(evidence) ⇒ <code>string</code>

Admit only this patch's verified source and the latest exact-source STE-Adam review.

**Kind**: static method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>string</code> - Exact admitted source commit.

| Param    | Type                | Description                                            |
| -------- | ------------------- | ------------------------------------------------------ |
| evidence | <code>object</code> | Authoritative GitHub and checked-out package evidence. |

<a name="module_scripts/publish-guided-corners.validateGuidedCornerProducer"></a>

### scripts/publish-guided-corners.validateGuidedCornerProducer(evidence) ⇒ <code>number</code>

Validate that a continuation artifact came from this trusted workflow and admitted source.

**Kind**: static method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>number</code> - Immutable artifact ID to restore.

| Param    | Type                | Description                                   |
| -------- | ------------------- | --------------------------------------------- |
| evidence | <code>object</code> | GitHub workflow-run and artifact API results. |

<a name="module_scripts/publish-guided-corners.verifyGuidedCornerArtifactBytes"></a>

### scripts/publish-guided-corners.verifyGuidedCornerArtifactBytes(expected, bytes) ⇒ <code>boolean</code>

Verify that the retained tarball is byte-for-byte identical to its checksum receipt.

**Kind**: static method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>boolean</code> - Whether all recorded checksums and size match.

| Param    | Type                | Description                  |
| -------- | ------------------- | ---------------------------- |
| expected | <code>object</code> | Immutable artifact identity. |
| bytes    | <code>Buffer</code> | Retained tarball contents.   |

<a name="module_scripts/publish-guided-corners.verifyGuidedCornerReceipt"></a>

### scripts/publish-guided-corners.verifyGuidedCornerReceipt(value, expected) ⇒ <code>object</code>

Bind a retained checksum receipt to the admitted source, approval and producing run.

**Kind**: static method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>object</code> - Verified receipt.

| Param    | Type                | Description                 |
| -------- | ------------------- | --------------------------- |
| value    | <code>object</code> | Persisted receipt contents. |
| expected | <code>object</code> | Current workflow identity.  |

<a name="module_scripts/publish-guided-corners..run"></a>

### scripts/publish-guided-corners~run(program, args) ⇒ <code>string</code>

Execute a fixed program with argument-array boundaries and no credential output on failure.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>string</code> - Successful standard output.

| Param   | Type                              | Description        |
| ------- | --------------------------------- | ------------------ |
| program | <code>string</code>               | Fixed executable.  |
| args    | <code>Array.&lt;string&gt;</code> | Literal arguments. |

<a name="module_scripts/publish-guided-corners..api"></a>

### scripts/publish-guided-corners~api(endpoint) ⇒ <code>object</code>

Read one bounded JSON result from the authenticated repository API.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>object</code> - Parsed API result.

| Param    | Type                | Description                                     |
| -------- | ------------------- | ----------------------------------------------- |
| endpoint | <code>string</code> | Fixed repository endpoint with validated scope. |

<a name="module_scripts/publish-guided-corners..receipt"></a>

### scripts/publish-guided-corners~receipt() ⇒ <code>object</code>

Read the immutable checksum receipt produced before publication.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>object</code> - Exact artifact identity.  
<a name="module_scripts/publish-guided-corners..verifyArtifact"></a>

### scripts/publish-guided-corners~verifyArtifact() ⇒ <code>object</code>

Verify the retained artifact against its prepublication receipt.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>object</code> - Verified artifact identity.  
<a name="module_scripts/publish-guided-corners..runIfSuccessful"></a>

### scripts/publish-guided-corners~runIfSuccessful(program, args) ⇒ <code>string</code> \| <code>null</code>

Run a fixed program and return null when it exits unsuccessfully.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>string</code> \| <code>null</code> - Successful standard output or null on command failure.

| Param   | Type                              | Description        |
| ------- | --------------------------------- | ------------------ |
| program | <code>string</code>               | Fixed executable.  |
| args    | <code>Array.&lt;string&gt;</code> | Literal arguments. |

<a name="module_scripts/publish-guided-corners..main"></a>

### scripts/publish-guided-corners~main(mode) ⇒ <code>Promise.&lt;void&gt;</code>

Publish-support commands perform admission, artifact hashing and public byte readback only.
The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Completion after the selected phase verifies its boundary.

| Param | Type                | Description           |
| ----- | ------------------- | --------------------- |
| mode  | <code>string</code> | Fixed workflow phase. |
