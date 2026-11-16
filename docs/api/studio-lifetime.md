<!-- Generated with jsdoc2md from demo/studio/lifetime.js; do not edit by hand. -->

# studio lifetime

<a name="module_studio/lifetime"></a>

## studio/lifetime

Explicit resource ownership for one mounted specimen, without browser API interception.

- [studio/lifetime](#module_studio/lifetime)
  - [.createLifetime([parent])](#module_studio/lifetime.createLifetime) ⇒ <code>Object</code>
    - [~dispose()](#module_studio/lifetime.createLifetime..dispose) ⇒ <code>void</code>
    - [~listen(target, type, listener, [options])](#module_studio/lifetime.createLifetime..listen) ⇒ <code>void</code>
    - [~handle(target, type, handler)](#module_studio/lifetime.createLifetime..handle) ⇒ <code>function</code>
    - [~observe(Observer, ...args)](#module_studio/lifetime.createLifetime..observe) ⇒ <code>Object</code>
    - [~later(callback, delay)](#module_studio/lifetime.createLifetime..later) ⇒ <code>\*</code>
    - [~objectUrl(blob)](#module_studio/lifetime.createLifetime..objectUrl) ⇒ <code>string</code>
    - [~listenOptional(target, ...args)](#module_studio/lifetime.createLifetime..listenOptional) ⇒ <code>void</code>

<a name="module_studio/lifetime.createLifetime"></a>

### studio/lifetime.createLifetime([parent]) ⇒ <code>Object</code>

Creates a disposable listener, observer, timer and object-URL scope.

**Kind**: static method of [<code>studio/lifetime</code>](#module_studio/lifetime)  
**Returns**: <code>Object</code> - Native-compatible resource helpers and an idempotent disposer.

| Param    | Type                     | Description                   |
| -------- | ------------------------ | ----------------------------- |
| [parent] | <code>AbortSignal</code> | Optional owning mount signal. |

- [.createLifetime([parent])](#module_studio/lifetime.createLifetime) ⇒ <code>Object</code>
  - [~dispose()](#module_studio/lifetime.createLifetime..dispose) ⇒ <code>void</code>
  - [~listen(target, type, listener, [options])](#module_studio/lifetime.createLifetime..listen) ⇒ <code>void</code>
  - [~handle(target, type, handler)](#module_studio/lifetime.createLifetime..handle) ⇒ <code>function</code>
  - [~observe(Observer, ...args)](#module_studio/lifetime.createLifetime..observe) ⇒ <code>Object</code>
  - [~later(callback, delay)](#module_studio/lifetime.createLifetime..later) ⇒ <code>\*</code>
  - [~objectUrl(blob)](#module_studio/lifetime.createLifetime..objectUrl) ⇒ <code>string</code>
  - [~listenOptional(target, ...args)](#module_studio/lifetime.createLifetime..listenOptional) ⇒ <code>void</code>

<a name="module_studio/lifetime.createLifetime..dispose"></a>

#### createLifetime~dispose() ⇒ <code>void</code>

Releases every owned resource exactly once.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)  
<a name="module_studio/lifetime.createLifetime..listen"></a>

#### createLifetime~listen(target, type, listener, [options]) ⇒ <code>void</code>

Registers a native event listener inside this mount.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)

| Param     | Type                                        | Description              |
| --------- | ------------------------------------------- | ------------------------ |
| target    | <code>EventTarget</code>                    | Event source.            |
| type      | <code>string</code>                         | Native event name.       |
| listener  | <code>function</code>                       | Handler.                 |
| [options] | <code>boolean</code> \| <code>Object</code> | Native listener options. |

<a name="module_studio/lifetime.createLifetime..handle"></a>

#### createLifetime~handle(target, type, handler) ⇒ <code>function</code>

Owns a native event property, restoring earlier owners in reverse assignment order.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)  
**Returns**: <code>function</code> - Assigned handler, preserving assignment expression behavior.

| Param   | Type                     | Description                       |
| ------- | ------------------------ | --------------------------------- |
| target  | <code>EventTarget</code> | Native control.                   |
| type    | <code>string</code>      | Event name without the on prefix. |
| handler | <code>function</code>    | Native property handler.          |

<a name="module_studio/lifetime.createLifetime..observe"></a>

#### createLifetime~observe(Observer, ...args) ⇒ <code>Object</code>

Constructs an observer whose connection is released on unmount.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)  
**Returns**: <code>Object</code> - Observer instance.

| Param    | Type                  | Description                  |
| -------- | --------------------- | ---------------------------- |
| Observer | <code>function</code> | Native observer constructor. |
| ...args  | <code>\*</code>       | Constructor arguments.       |

<a name="module_studio/lifetime.createLifetime..later"></a>

#### createLifetime~later(callback, delay) ⇒ <code>\*</code>

Schedules sample feedback only while its mount remains live.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)  
**Returns**: <code>\*</code> - Native timer handle, or null after disposal.

| Param    | Type                  | Description   |
| -------- | --------------------- | ------------- |
| callback | <code>function</code> | Local work.   |
| delay    | <code>number</code>   | Milliseconds. |

<a name="module_studio/lifetime.createLifetime..objectUrl"></a>

#### createLifetime~objectUrl(blob) ⇒ <code>string</code>

Owns a generated download URL until the specimen unmounts.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)  
**Returns**: <code>string</code> - Native object URL.

| Param | Type              | Description            |
| ----- | ----------------- | ---------------------- |
| blob  | <code>Blob</code> | Local sample document. |

<a name="module_studio/lifetime.createLifetime..listenOptional"></a>

#### createLifetime~listenOptional(target, ...args) ⇒ <code>void</code>

Registers an optional control only when that authored region exists.

**Kind**: inner method of [<code>createLifetime</code>](#module_studio/lifetime.createLifetime)

| Param   | Type                     | Description                          |
| ------- | ------------------------ | ------------------------------------ |
| target  | <code>EventTarget</code> | Optional event source.               |
| ...args | <code>\*</code>          | Native event registration arguments. |
