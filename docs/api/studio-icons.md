<!-- Generated with jsdoc2md from demo/studio/icons.js; do not edit by hand. -->

# studio icons

<a name="module_studio/icons"></a>

## studio/icons

UI Style Kit Icons artwork, lazy family loading, and optional consumer setup.

- [studio/icons](#module_studio/icons)
  - _static_
    - [.ICON_VERSION](#module_studio/icons.ICON_VERSION)
    - [.ICON_ALIASES](#module_studio/icons.ICON_ALIASES)
    - [.STUDIO_ICON_NAMES](#module_studio/icons.STUDIO_ICON_NAMES)
    - [.iconConfiguration(preferences, ui)](#module_studio/icons.iconConfiguration) ⇒ <code>Object</code>
    - [.prepareIcons([pack], [variant])](#module_studio/icons.prepareIcons) ⇒ <code>Promise.&lt;void&gt;</code>
    - [.decorateIcon(source, name, configuration, [marker])](#module_studio/icons.decorateIcon) ⇒ <code>string</code>
    - [.hydrateIcons(scope, preferences, ui)](#module_studio/icons.hydrateIcons) ⇒ <code>Promise.&lt;Object&gt;</code>
    - [.iconInstallMarkup(preferences, ui, [method])](#module_studio/icons.iconInstallMarkup) ⇒ <code>string</code>
  - _inner_
    - [~IconPreferences](#module_studio/icons..IconPreferences) : <code>Object</code>

<a name="module_studio/icons.ICON_VERSION"></a>

### studio/icons.ICON\_VERSION

Exactly pinned companion artifact used by the studio build and setup examples.

**Kind**: static constant of [<code>studio/icons</code>](#module_studio/icons)  
<a name="module_studio/icons.ICON_ALIASES"></a>

### studio/icons.ICON\_ALIASES

Compatibility names in the retained authored specimens, mapped to actual companion assets.

**Kind**: static constant of [<code>studio/icons</code>](#module_studio/icons)  
<a name="module_studio/icons.STUDIO_ICON_NAMES"></a>

### studio/icons.STUDIO\_ICON\_NAMES

Canonical icons used by studio controls in addition to the retained specimens.

**Kind**: static constant of [<code>studio/icons</code>](#module_studio/icons)  
<a name="module_studio/icons.iconConfiguration"></a>

### studio/icons.iconConfiguration(preferences, ui) ⇒ <code>Object</code>

Chooses artwork only; all icon and control paint remains library-owned.

**Kind**: static method of [<code>studio/icons</code>](#module_studio/icons)  
**Returns**: <code>Object</code> - Explicit family and color treatment.

| Param       | Type                         | Description              |
| ----------- | ---------------------------- | ------------------------ |
| preferences | <code>IconPreferences</code> | Global icon preferences. |
| ui          | <code>string</code>          | Validated preview style. |

<a name="module_studio/icons.prepareIcons"></a>

### studio/icons.prepareIcons([pack], [variant]) ⇒ <code>Promise.&lt;void&gt;</code>

Loads exactly one artwork variant and verifies the required studio inventory.

**Kind**: static method of [<code>studio/icons</code>](#module_studio/icons)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the selected variant is registered; failures remain retryable.

| Param     | Type                | Default                                           | Description                  |
| --------- | ------------------- | ------------------------------------------------- | ---------------------------- |
| [pack]    | <code>string</code> | <code>&quot;&#x27;minimal-saas&#x27;&quot;</code> | Canonical icon family.       |
| [variant] | <code>string</code> | <code>&quot;&#x27;monochrome&#x27;&quot;</code>   | Requested artwork treatment. |

<a name="module_studio/icons.decorateIcon"></a>

### studio/icons.decorateIcon(source, name, configuration, [marker]) ⇒ <code>string</code>

Normalizes licensed SVG copies through the companion API and scopes fragment IDs.

**Kind**: static method of [<code>studio/icons</code>](#module_studio/icons)  
**Returns**: <code>string</code> - Decorative, independently scoped inline SVG.

| Param         | Type                 | Default            | Description                                   |
| ------------- | -------------------- | ------------------ | --------------------------------------------- |
| source        | <code>string</code>  |                    | Exact package SVG.                            |
| name          | <code>string</code>  |                    | Canonical icon name.                          |
| configuration | <code>Object</code>  |                    | Artwork configuration.                        |
| [marker]      | <code>boolean</code> | <code>false</code> | Whether legacy markup needs a refresh marker. |

<a name="module_studio/icons.hydrateIcons"></a>

### studio/icons.hydrateIcons(scope, preferences, ui) ⇒ <code>Promise.&lt;Object&gt;</code>

Reconciles artwork under the document's latest selection without replacing control state or focus.

**Kind**: static method of [<code>studio/icons</code>](#module_studio/icons)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Applied artwork configuration.

| Param       | Type                                          | Description                     |
| ----------- | --------------------------------------------- | ------------------------------- |
| scope       | <code>Document</code> \| <code>Element</code> | Owned document or preview root. |
| preferences | <code>IconPreferences</code>                  | Global icon preferences.        |
| ui          | <code>string</code>                           | Style selected by this preview. |

<a name="module_studio/icons.iconInstallMarkup"></a>

### studio/icons.iconInstallMarkup(preferences, ui, [method]) ⇒ <code>string</code>

Gives copyable, optional NPM/self-hosted or pinned-CDN icon setup instructions.

**Kind**: static method of [<code>studio/icons</code>](#module_studio/icons)  
**Returns**: <code>string</code> - Consumer-owned installation and accessible markup.

| Param       | Type                         | Default                                  | Description           |
| ----------- | ---------------------------- | ---------------------------------------- | --------------------- |
| preferences | <code>IconPreferences</code> |                                          | Current icon options. |
| ui          | <code>string</code>          |                                          | Selected UI style.    |
| [method]    | <code>string</code>          | <code>&quot;&#x27;npm&#x27;&quot;</code> | NPM or CDN.           |

<a name="module_studio/icons..IconPreferences"></a>

### studio/icons~IconPreferences : <code>Object</code>

Icon artwork preferences shared by the host and both preview documents.

**Kind**: inner typedef of [<code>studio/icons</code>](#module_studio/icons)  
**Properties**

| Name            | Type                 | Default            | Description                               |
| --------------- | -------------------- | ------------------ | ----------------------------------------- |
| [styleSpecific] | <code>boolean</code> | <code>false</code> | Match the selected UI preset family.      |
| [themed]        | <code>boolean</code> | <code>false</code> | Use themed artwork instead of monochrome. |
