<!-- Generated with jsdoc2md from demo/studio/app.js; do not edit by hand. -->

# studio app

<a name="module_studio/app"></a>

## studio/app

Coordinates the stable studio shell. Preview documents own rendered examples.

- [studio/app](#module_studio/app)
  - [~syncShellAppearance()](#module_studio/app..syncShellAppearance) ⇒ <code>void</code>
  - [~announce(message)](#module_studio/app..announce) ⇒ <code>void</code>
  - [~configuration(side)](#module_studio/app..configuration) ⇒ <code>Object</code>
  - [~frameStatus(frame, status, [message])](#module_studio/app..frameStatus) ⇒ <code>void</code>
  - [~sendConfiguration(frame, [force])](#module_studio/app..sendConfiguration) ⇒ <code>void</code>
  - [~connectFrame(side)](#module_studio/app..connectFrame) ⇒ <code>Object</code>
  - [~syncUrl([replace])](#module_studio/app..syncUrl) ⇒ <code>void</code>
  - [~renderComponentList()](#module_studio/app..renderComponentList) ⇒ <code>void</code>
  - [~refreshHostIcons()](#module_studio/app..refreshHostIcons) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~renderShell()](#module_studio/app..renderShell) ⇒ <code>void</code>
  - [~commit(next, [options])](#module_studio/app..commit) ⇒ <code>void</code>
  - [~flushPresentation()](#module_studio/app..flushPresentation) ⇒ <code>void</code>
  - [~requestMarkup([copyResult])](#module_studio/app..requestMarkup) ⇒ <code>void</code>
  - [~titleCase(text)](#module_studio/app..titleCase) ⇒ <code>string</code>
  - [~hex(value)](#module_studio/app..hex) ⇒ <code>string</code>
  - [~renderTokens()](#module_studio/app..renderTokens) ⇒ <code>void</code>
  - [~exportKey()](#module_studio/app..exportKey) ⇒ <code>string</code>
  - [~updateExport()](#module_studio/app..updateExport) ⇒ <code>void</code>
  - [~copy(text, message)](#module_studio/app..copy) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~scheduleSampleOutcome(scope, patch)](#module_studio/app..scheduleSampleOutcome) ⇒ <code>void</code>
  - [~receiveAction(scope, patch)](#module_studio/app..receiveAction) ⇒ <code>void</code>
  - [~selectInspectorTab(selected)](#module_studio/app..selectInspectorTab) ⇒ <code>void</code>

<a name="module_studio/app..syncShellAppearance"></a>

### studio/app~syncShellAppearance() ⇒ <code>void</code>

Applies the selected shared palette and mode through public library attributes.
The shell keeps its Minimal SaaS component structure; isolated previews select their own preset.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..announce"></a>

### studio/app~announce(message) ⇒ <code>void</code>

Announces actual outcomes without replacing a focused control.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param   | Type                | Description            |
| ------- | ------------------- | ---------------------- |
| message | <code>string</code> | User-visible feedback. |

<a name="module_studio/app..configuration"></a>

### studio/app~configuration(side) ⇒ <code>Object</code>

Returns the current configuration for one owned preview.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>Object</code> - Serializable frame configuration.

| Param | Type                | Description                     |
| ----- | ------------------- | ------------------------------- |
| side  | <code>string</code> | A pinned or B editable preview. |

<a name="module_studio/app..frameStatus"></a>

### studio/app~frameStatus(frame, status, [message]) ⇒ <code>void</code>

Sets a frame's asynchronous status without hiding its last good document.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param     | Type                | Default                               | Description               |
| --------- | ------------------- | ------------------------------------- | ------------------------- |
| frame     | <code>Object</code> |                                       | Owned frame.              |
| status    | <code>string</code> |                                       | Loading, ready, or error. |
| [message] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Visible status message.   |

<a name="module_studio/app..sendConfiguration"></a>

### studio/app~sendConfiguration(frame, [force]) ⇒ <code>void</code>

Sends state after the frame handshake and starts a bounded readiness deadline.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param   | Type                 | Default            | Description                  |
| ------- | -------------------- | ------------------ | ---------------------------- |
| frame   | <code>Object</code>  |                    | Owned frame.                 |
| [force] | <code>boolean</code> | <code>false</code> | Re-send after a failed load. |

<a name="module_studio/app..connectFrame"></a>

### studio/app~connectFrame(side) ⇒ <code>Object</code>

Creates an isolated preview with its own random channel and message source.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>Object</code> - Owned frame record.

| Param | Type                | Description   |
| ----- | ------------------- | ------------- |
| side  | <code>string</code> | Preview slot. |

<a name="module_studio/app..syncUrl"></a>

### studio/app~syncUrl([replace]) ⇒ <code>void</code>

Updates bookmark state without leaking local form contents into URLs.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param     | Type                 | Default            | Description                                        |
| --------- | -------------------- | ------------------ | -------------------------------------------------- |
| [replace] | <code>boolean</code> | <code>false</code> | Replace transient edits instead of adding history. |

<a name="module_studio/app..renderComponentList"></a>

### studio/app~renderComponentList() ⇒ <code>void</code>

Renders the component family selector independently of the live previews.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..refreshHostIcons"></a>

### studio/app~refreshHostIcons() ⇒ <code>Promise.&lt;void&gt;</code>

Updates decorative artwork without replacing its containing controls.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the current family is available or an error is shown.  
<a name="module_studio/app..renderShell"></a>

### studio/app~renderShell() ⇒ <code>void</code>

Updates tool chrome without replacing controls, selection, or preview DOM.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..commit"></a>

### studio/app~commit(next, [options]) ⇒ <code>void</code>

Commits one application transition, then sends the same snapshot to both previews.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param     | Type                | Default         | Description               |
| --------- | ------------------- | --------------- | ------------------------- |
| next      | <code>Object</code> |                 | New immutable state.      |
| [options] | <code>Object</code> | <code>{}</code> | URL and loading behavior. |

<a name="module_studio/app..flushPresentation"></a>

### studio/app~flushPresentation() ⇒ <code>void</code>

Flushes one coherent snapshot while keeping interaction-only commits outside shell rendering.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..requestMarkup"></a>

### studio/app~requestMarkup([copyResult]) ⇒ <code>void</code>

Requests a current public example only when its markup is actually consumed.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param        | Type                 | Default            | Description                                          |
| ------------ | -------------------- | ------------------ | ---------------------------------------------------- |
| [copyResult] | <code>boolean</code> | <code>false</code> | Copy the requested result after revision validation. |

<a name="module_studio/app..titleCase"></a>

### studio/app~titleCase(text) ⇒ <code>string</code>

Converts inventory slugs to concise labels.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>string</code> - Human-readable label.

| Param | Type                | Description           |
| ----- | ------------------- | --------------------- |
| text  | <code>string</code> | Inventory identifier. |

<a name="module_studio/app..hex"></a>

### studio/app~hex(value) ⇒ <code>string</code>

Converts normalized RGB channels to a native color-input value.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>string</code> - Hex color.

| Param | Type                | Description   |
| ----- | ------------------- | ------------- |
| value | <code>string</code> | RGB channels. |

<a name="module_studio/app..renderTokens"></a>

### studio/app~renderTokens() ⇒ <code>void</code>

Reconciles token rows while retaining the field currently being edited.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..exportKey"></a>

### studio/app~exportKey() ⇒ <code>string</code>

Identifies the visual and markup state that must match a preview report.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>string</code> - Stable configuration fingerprint without private form text.  
<a name="module_studio/app..updateExport"></a>

### studio/app~updateExport() ⇒ <code>void</code>

Refreshes copy/download content from the committed preview report.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
<a name="module_studio/app..copy"></a>

### studio/app~copy(text, message) ⇒ <code>Promise.&lt;void&gt;</code>

Copies text or opens an explicit manual fallback without claiming success.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the available copy path is presented.

| Param   | Type                | Description           |
| ------- | ------------------- | --------------------- |
| text    | <code>string</code> | Requested text.       |
| message | <code>string</code> | Success announcement. |

<a name="module_studio/app..scheduleSampleOutcome"></a>

### studio/app~scheduleSampleOutcome(scope, patch) ⇒ <code>void</code>

Completes shared sample operations independently of preview presentation lifetime.
A new terminal state or reset cancels the pending outcome for that interaction domain.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param | Type                | Description                    |
| ----- | ------------------- | ------------------------------ |
| scope | <code>string</code> | Validated interaction domain.  |
| patch | <code>Object</code> | Accepted shared-state changes. |

<a name="module_studio/app..receiveAction"></a>

### studio/app~receiveAction(scope, patch) ⇒ <code>void</code>

Validates the small action surface exposed to owned sample frames.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param | Type                | Description                  |
| ----- | ------------------- | ---------------------------- |
| scope | <code>string</code> | Local example or appearance. |
| patch | <code>Object</code> | Candidate local changes.     |

<a name="module_studio/app..selectInspectorTab"></a>

### studio/app~selectInspectorTab(selected) ⇒ <code>void</code>

Switches the inspector's accessible tab pair.

**Kind**: inner method of [<code>studio/app</code>](#module_studio/app)

| Param    | Type                | Description     |
| -------- | ------------------- | --------------- |
| selected | <code>string</code> | Colors or code. |
