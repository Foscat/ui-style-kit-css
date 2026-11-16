<!-- Generated with jsdoc2md from scripts/serve-studio.mjs; do not edit by hand. -->

# serve studio

<a name="module_scripts/serve-studio"></a>

## scripts/serve-studio

Small local static server for the studio and HTTP-only failure-injection checks.

<a name="module_scripts/serve-studio.startStudioServer"></a>

### scripts/serve-studio.startStudioServer([port]) ⇒ <code>Promise.&lt;Object&gt;</code>

Starts a loopback-only server with an optional ephemeral port.

**Kind**: static method of [<code>scripts/serve-studio</code>](#module_scripts/serve-studio)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Server handle, base URL, and asynchronous close method.

| Param  | Type                | Default           | Description                                     |
| ------ | ------------------- | ----------------- | ----------------------------------------------- |
| [port] | <code>number</code> | <code>4173</code> | Requested local port; zero selects a free port. |
