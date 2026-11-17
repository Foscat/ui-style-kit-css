<!-- Generated with jsdoc2md from scripts/publish-guided-corners.mjs; do not edit by hand. -->

# publish guided corners

<a name="module_scripts/publish-guided-corners"></a>

## scripts/publish-guided-corners

Publish only the independently reviewed 2.9.0 artifact through the existing package-owner route.

- [scripts/publish-guided-corners](#module_scripts/publish-guided-corners)
  - _static_
    - [.admitGuidedCornerRelease(evidence)](#module_scripts/publish-guided-corners.admitGuidedCornerRelease) ⇒ <code>string</code>
  - _inner_
    - [~run(program, args)](#module_scripts/publish-guided-corners..run) ⇒ <code>string</code>
    - [~api(endpoint)](#module_scripts/publish-guided-corners..api) ⇒ <code>object</code>
    - [~receipt()](#module_scripts/publish-guided-corners..receipt) ⇒ <code>object</code>
    - [~main(mode)](#module_scripts/publish-guided-corners..main) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_scripts/publish-guided-corners.admitGuidedCornerRelease"></a>

### scripts/publish-guided-corners.admitGuidedCornerRelease(evidence) ⇒ <code>string</code>

Admit only this patch's verified source and the latest exact-source STE-Adam review.

**Kind**: static method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>string</code> - Exact admitted source commit.

| Param    | Type                | Description                                            |
| -------- | ------------------- | ------------------------------------------------------ |
| evidence | <code>object</code> | Authoritative GitHub and checked-out package evidence. |

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
<a name="module_scripts/publish-guided-corners..main"></a>

### scripts/publish-guided-corners~main(mode) ⇒ <code>Promise.&lt;void&gt;</code>

Publish-support commands perform admission, artifact hashing and public byte readback only.
The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.

**Kind**: inner method of [<code>scripts/publish-guided-corners</code>](#module_scripts/publish-guided-corners)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Completion after the selected phase verifies its boundary.

| Param | Type                | Description           |
| ----- | ------------------- | --------------------- |
| mode  | <code>string</code> | Fixed workflow phase. |
