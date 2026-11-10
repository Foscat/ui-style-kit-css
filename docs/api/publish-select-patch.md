<!-- Generated with jsdoc2md from scripts/publish-select-patch.mjs; do not edit by hand. -->

## Functions

<dl>
<dt><a href="#admitFocusedPatch">admitFocusedPatch(evidence)</a> ⇒ <code>string</code></dt>
<dd><p>Admit only this patch&#39;s verified source and the latest exact-source STE-Adam review.</p>
</dd>
<dt><a href="#run">run(program, args)</a> ⇒ <code>string</code></dt>
<dd><p>Execute a fixed program with argument-array boundaries and no credential output on failure.</p>
</dd>
<dt><a href="#api">api(endpoint)</a> ⇒ <code>object</code></dt>
<dd><p>Read one bounded JSON result from the authenticated repository API.</p>
</dd>
<dt><a href="#receipt">receipt()</a> ⇒ <code>object</code></dt>
<dd><p>Read the immutable checksum receipt produced before publication.</p>
</dd>
<dt><a href="#main">main(mode)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Publish-support commands perform admission, artifact hashing and public byte readback only.
The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.</p>
</dd>
</dl>

<a name="admitFocusedPatch"></a>

## admitFocusedPatch(evidence) ⇒ <code>string</code>
Admit only this patch's verified source and the latest exact-source STE-Adam review.

**Kind**: global function  
**Returns**: <code>string</code> - Exact admitted source commit.  

| Param | Type | Description |
| --- | --- | --- |
| evidence | <code>object</code> | Authoritative GitHub and checked-out package evidence. |

<a name="run"></a>

## run(program, args) ⇒ <code>string</code>
Execute a fixed program with argument-array boundaries and no credential output on failure.

**Kind**: global function  
**Returns**: <code>string</code> - Successful standard output.  

| Param | Type | Description |
| --- | --- | --- |
| program | <code>string</code> | Fixed executable. |
| args | <code>Array.&lt;string&gt;</code> | Literal arguments. |

<a name="api"></a>

## api(endpoint) ⇒ <code>object</code>
Read one bounded JSON result from the authenticated repository API.

**Kind**: global function  
**Returns**: <code>object</code> - Parsed API result.  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | Fixed repository endpoint with validated scope. |

<a name="receipt"></a>

## receipt() ⇒ <code>object</code>
Read the immutable checksum receipt produced before publication.

**Kind**: global function  
**Returns**: <code>object</code> - Exact artifact identity.  
<a name="main"></a>

## main(mode) ⇒ <code>Promise.&lt;void&gt;</code>
Publish-support commands perform admission, artifact hashing and public byte readback only.
The workflow owns the explicit npm publication; no tests or lifecycle hooks are dispatched here.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Completion after the selected phase verifies its boundary.  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>string</code> | Fixed workflow phase. |

