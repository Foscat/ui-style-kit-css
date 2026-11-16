<!-- Generated with jsdoc2md from demo/studio/script-loader.js; do not edit by hand. -->

# studio script loader

<a name="module_studio/script-loader"></a>

## studio/script-loader

Shares versioned classic-script loading with exact registration validation and retryable failures.

<a name="module_studio/script-loader.loadRegisteredScript"></a>

### studio/script-loader.loadRegisteredScript(filename, registered, message) ⇒ <code>Promise.&lt;void&gt;</code>

Loads and validates one registry before retaining its successful readiness promise.

**Kind**: static method of [<code>studio/script-loader</code>](#module_studio/script-loader)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after execution and registration validation.

| Param      | Type                  | Description                                                  |
| ---------- | --------------------- | ------------------------------------------------------------ |
| filename   | <code>string</code>   | Demo-relative generated asset.                               |
| registered | <code>function</code> | Predicate for the exact requested module or artwork variant. |
| message    | <code>string</code>   | Useful transport or registration failure feedback.           |
