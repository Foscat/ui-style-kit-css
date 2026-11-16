<!-- Generated with jsdoc2md from demo/studio/protocol.js; do not edit by hand. -->

# studio protocol

<a name="module_studio/protocol"></a>

## studio/protocol

Versioned frame messages and copyable public CSS configuration.

- [studio/protocol](#module_studio/protocol)
  - [.isFrameMessage(event, source, channel)](#module_studio/protocol.isFrameMessage) ⇒ <code>boolean</code>
  - [.targetOrigin(href)](#module_studio/protocol.targetOrigin) ⇒ <code>string</code>
  - [.overrideCss(appearance, prefix, tokens)](#module_studio/protocol.overrideCss) ⇒ <code>string</code>
  - [.setupMarkup(appearance)](#module_studio/protocol.setupMarkup) ⇒ <code>string</code>
  - [.copyText(text)](#module_studio/protocol.copyText) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_studio/protocol.isFrameMessage"></a>

### studio/protocol.isFrameMessage(event, source, channel) ⇒ <code>boolean</code>

Recognizes only messages from an owned preview window and channel.

**Kind**: static method of [<code>studio/protocol</code>](#module_studio/protocol)  
**Returns**: <code>boolean</code> - Whether the message belongs to the studio protocol.

| Param   | Type                                             | Description               |
| ------- | ------------------------------------------------ | ------------------------- |
| event   | <code>MessageEvent</code> \| <code>Object</code> | Incoming message.         |
| source  | <code>Window</code> \| <code>Object</code>       | Expected source window.   |
| channel | <code>string</code>                              | Per-frame random channel. |

<a name="module_studio/protocol.targetOrigin"></a>

### studio/protocol.targetOrigin(href) ⇒ <code>string</code>

Resolves exact HTTP origins while supporting opaque local-file documents.

**Kind**: static method of [<code>studio/protocol</code>](#module_studio/protocol)  
**Returns**: <code>string</code> - Explicit target origin or the required local-file wildcard.

| Param | Type                | Description |
| ----- | ------------------- | ----------- |
| href  | <code>string</code> | Target URL. |

<a name="module_studio/protocol.overrideCss"></a>

### studio/protocol.overrideCss(appearance, prefix, tokens) ⇒ <code>string</code>

Formats resolved palette channels using their owning public token namespace.

**Kind**: static method of [<code>studio/protocol</code>](#module_studio/protocol)  
**Returns**: <code>string</code> - Reusable CSS.

| Param      | Type                                                   | Description             |
| ---------- | ------------------------------------------------------ | ----------------------- |
| appearance | <code>Appearance</code>                                | Visual configuration.   |
| prefix     | <code>string</code>                                    | Public preset prefix.   |
| tokens     | <code>Array.&lt;{role:string, value:string}&gt;</code> | Resolved public colors. |

<a name="module_studio/protocol.setupMarkup"></a>

### studio/protocol.setupMarkup(appearance) ⇒ <code>string</code>

Produces a minimal CSS-only setup rather than a demo runtime dependency.

**Kind**: static method of [<code>studio/protocol</code>](#module_studio/protocol)  
**Returns**: <code>string</code> - Copyable installation and HTML example.

| Param      | Type                    | Description           |
| ---------- | ----------------------- | --------------------- |
| appearance | <code>Appearance</code> | Visual configuration. |

<a name="module_studio/protocol.copyText"></a>

### studio/protocol.copyText(text) ⇒ <code>Promise.&lt;void&gt;</code>

Copies text, letting the caller provide a visible manual fallback.

**Kind**: static method of [<code>studio/protocol</code>](#module_studio/protocol)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the clipboard accepts the text.

| Param | Type                | Description   |
| ----- | ------------------- | ------------- |
| text  | <code>string</code> | Text to copy. |
