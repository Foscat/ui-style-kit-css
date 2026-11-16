<!-- Generated with jsdoc2md from demo/studio/catalog.js; do not edit by hand. -->

# studio catalog

<a name="module_studio/catalog"></a>

## studio/catalog

Canonical component examples and a compact, searchable copy catalog.

- [studio/catalog](#module_studio/catalog)
  - _static_
    - [.componentOptions](#module_studio/catalog.componentOptions) : <code>Array.&lt;{id:string, family:string, label:string, html:string}&gt;</code>
    - [.renderComponent(id, [model], [prefix])](#module_studio/catalog.renderComponent) ⇒ <code>string</code>
    - [.renderCatalog(family, query, model, prefix)](#module_studio/catalog.renderCatalog) ⇒ <code>string</code>
  - _inner_
    - [~add(id, family, label, html)](#module_studio/catalog..add) ⇒ <code>void</code>
    - [~representation(html, model, prefix)](#module_studio/catalog..representation) ⇒ <code>string</code>

<a name="module_studio/catalog.componentOptions"></a>

### studio/catalog.componentOptions : <code>Array.&lt;{id:string, family:string, label:string, html:string}&gt;</code>

Public copyable examples.

**Kind**: static constant of [<code>studio/catalog</code>](#module_studio/catalog)  
<a name="module_studio/catalog.renderComponent"></a>

### studio/catalog.renderComponent(id, [model], [prefix]) ⇒ <code>string</code>

Renders one family without studio chrome for reusable exported examples.

**Kind**: static method of [<code>studio/catalog</code>](#module_studio/catalog)  
**Returns**: <code>string</code> - Component blocks.

| Param    | Type                | Default                                       | Description             |
| -------- | ------------------- | --------------------------------------------- | ----------------------- |
| id       | <code>string</code> |                                               | Family or all.          |
| [model]  | <code>string</code> | <code>&quot;&#x27;semantic&#x27;&quot;</code> | Public markup model.    |
| [prefix] | <code>string</code> | <code>&quot;&#x27;saas&#x27;&quot;</code>     | Selected preset prefix. |

<a name="module_studio/catalog.renderCatalog"></a>

### studio/catalog.renderCatalog(family, query, model, prefix) ⇒ <code>string</code>

Renders the dense catalog with one copy affordance per public element block.

**Kind**: static method of [<code>studio/catalog</code>](#module_studio/catalog)  
**Returns**: <code>string</code> - Trusted catalog markup.

| Param  | Type                | Description                            |
| ------ | ------------------- | -------------------------------------- |
| family | <code>string</code> | Selected group.                        |
| query  | <code>string</code> | Case-insensitive name or class search. |
| model  | <code>string</code> | Public markup model.                   |
| prefix | <code>string</code> | Selected preset prefix.                |

<a name="module_studio/catalog..add"></a>

### studio/catalog~add(id, family, label, html) ⇒ <code>void</code>

Registers trusted authored markup once for preview, filtering and copying.

**Kind**: inner method of [<code>studio/catalog</code>](#module_studio/catalog)

| Param  | Type                | Description               |
| ------ | ------------------- | ------------------------- |
| id     | <code>string</code> | Stable option identifier. |
| family | <code>string</code> | Navigation group.         |
| label  | <code>string</code> | Visible option name.      |
| html   | <code>string</code> | Canonical public markup.  |

<a name="module_studio/catalog..representation"></a>

### studio/catalog~representation(html, model, prefix) ⇒ <code>string</code>

Converts only component classes; optional Layout classes retain their structural meaning.

**Kind**: inner method of [<code>studio/catalog</code>](#module_studio/catalog)  
**Returns**: <code>string</code> - Equivalent public representation.

| Param  | Type                | Description                                  |
| ------ | ------------------- | -------------------------------------------- |
| html   | <code>string</code> | Trusted canonical markup.                    |
| model  | <code>string</code> | Semantic, prefixed or native representation. |
| prefix | <code>string</code> | Validated preset prefix.                     |
