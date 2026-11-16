<!-- Generated with jsdoc2md from demo/studio/frame.js; do not edit by hand. -->

# studio preview

<a name="module_studio/frame"></a>

## studio/frame

Owns one isolated preview document and its local, disposable interaction wiring.

- [studio/frame](#module_studio/frame)
  - [~iconObserver](#module_studio/frame..iconObserver)
  - [~send(type, [payload])](#module_studio/frame..send) ⇒ <code>void</code>
  - [~action(scope, patch)](#module_studio/frame..action) ⇒ <code>void</code>
  - [~tokens()](#module_studio/frame..tokens) ⇒ <code>Array.&lt;{role:string, value:string}&gt;</code>
  - [~applyAppearance([retag])](#module_studio/frame..applyAppearance) ⇒ <code>void</code>
  - [~syncInteractions([scopes], [surfaces])](#module_studio/frame..syncInteractions) ⇒ <code>void</code>
  - [~publicMarkup(source)](#module_studio/frame..publicMarkup) ⇒ <code>string</code>
  - [~copyComponent(id)](#module_studio/frame..copyComponent) ⇒ <code>void</code>
  - [~bind()](#module_studio/frame..bind) ⇒ <code>void</code>
  - [~loadSpecimens()](#module_studio/frame..loadSpecimens) ⇒ <code>Promise.&lt;Object&gt;</code>
  - [~configure(next, nextRevision)](#module_studio/frame..configure) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~filterCatalog()](#module_studio/frame..filterCatalog) ⇒ <code>void</code>

<a name="module_studio/frame..iconObserver"></a>

### studio/frame~iconObserver

Authored specimens may append controls locally; refresh only their newly inserted artwork.

**Kind**: inner constant of [<code>studio/frame</code>](#module_studio/frame)  
<a name="module_studio/frame..send"></a>

### studio/frame~send(type, [payload]) ⇒ <code>void</code>

Sends a bounded event through this frame's private protocol channel.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)

| Param     | Type                | Default         | Description          |
| --------- | ------------------- | --------------- | -------------------- |
| type      | <code>string</code> |                 | Protocol event name. |
| [payload] | <code>Object</code> | <code>{}</code> | Event data.          |

<a name="module_studio/frame..action"></a>

### studio/frame~action(scope, patch) ⇒ <code>void</code>

Forwards a local interaction to the one shared state owner.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)

| Param | Type                | Description           |
| ----- | ------------------- | --------------------- |
| scope | <code>string</code> | Example identifier.   |
| patch | <code>Object</code> | Changed local values. |

<a name="module_studio/frame..tokens"></a>

### studio/frame~tokens() ⇒ <code>Array.&lt;{role:string, value:string}&gt;</code>

Resolves palette roles from the actual selected preview, including material colors.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)  
**Returns**: <code>Array.&lt;{role:string, value:string}&gt;</code> - Editable resolved colors.  
<a name="module_studio/frame..applyAppearance"></a>

### studio/frame~applyAppearance([retag]) ⇒ <code>void</code>

Applies only visual attributes and public tokens, retaining the live example DOM.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)

| Param   | Type                 | Default           | Description                                                      |
| ------- | -------------------- | ----------------- | ---------------------------------------------------------------- |
| [retag] | <code>boolean</code> | <code>true</code> | Whether retained prefixed components need their classes updated. |

<a name="module_studio/frame..syncInteractions"></a>

### studio/frame~syncInteractions([scopes], [surfaces]) ⇒ <code>void</code>

Synchronizes real values without resetting focus or an input's caret.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)

| Param      | Type                              | Default            | Description                                                   |
| ---------- | --------------------------------- | ------------------ | ------------------------------------------------------------- |
| [scopes]   | <code>Array.&lt;string&gt;</code> |                    | Changed interaction domains.                                  |
| [surfaces] | <code>boolean</code>              | <code>false</code> | Whether every interaction hook needs initial synchronization. |

<a name="module_studio/frame..publicMarkup"></a>

### studio/frame~publicMarkup(source) ⇒ <code>string</code>

Serializes public rendered markup, including hydrated icons, without studio instrumentation.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)  
**Returns**: <code>string</code> - Standalone component markup; application behavior remains consumer-owned.

| Param  | Type                 | Description                                       |
| ------ | -------------------- | ------------------------------------------------- |
| source | <code>Element</code> | Container whose children form the reusable block. |

<a name="module_studio/frame..copyComponent"></a>

### studio/frame~copyComponent(id) ⇒ <code>void</code>

Copies the selected rendered block while excluding studio-only behavior hooks.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)

| Param | Type                | Description                |
| ----- | ------------------- | -------------------------- |
| id    | <code>string</code> | Registered catalog option. |

<a name="module_studio/frame..bind"></a>

### studio/frame~bind() ⇒ <code>void</code>

Binds the shared example once per mount using an abortable listener scope.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)  
<a name="module_studio/frame..loadSpecimens"></a>

### studio/frame~loadSpecimens() ⇒ <code>Promise.&lt;Object&gt;</code>

Lazily loads the explicit authored-specimen registry only for Style details.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Registry.  
<a name="module_studio/frame..configure"></a>

### studio/frame~configure(next, nextRevision) ⇒ <code>Promise.&lt;void&gt;</code>

Reconciles one host configuration; stale asynchronous mounts cannot commit.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when this configuration is visible.

| Param        | Type                | Description                   |
| ------------ | ------------------- | ----------------------------- |
| next         | <code>Object</code> | Validated host configuration. |
| nextRevision | <code>number</code> | Monotonic host revision.      |

<a name="module_studio/frame..filterCatalog"></a>

### studio/frame~filterCatalog() ⇒ <code>void</code>

Filters mounted options without discarding controls, artwork or local interaction state.

**Kind**: inner method of [<code>studio/frame</code>](#module_studio/frame)
