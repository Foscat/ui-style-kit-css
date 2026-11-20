<!-- Generated with jsdoc2md from scripts/build.mjs; do not edit by hand. -->

# build library

<a name="module_scripts/build"></a>

## scripts/build

Generates standalone, visual, compatibility, and focused library distributions from the public manifest.

- [scripts/build](#module_scripts/build)
  - [~resolveBrowserTargets(queries)](#module_scripts/build..resolveBrowserTargets) ⇒ <code>BrowserTargets</code>
  - [~normalizeSourceText(source)](#module_scripts/build..normalizeSourceText) ⇒ <code>string</code>
  - [~addPresetConstraintToRoot(selector, selectedRoot)](#module_scripts/build..addPresetConstraintToRoot) ⇒ <code>boolean</code>
  - [~dedupeNestedSelectorLists(selector)](#module_scripts/build..dedupeNestedSelectorLists) ⇒ <code>void</code>
  - [~hasPositiveSemanticClass(selector, aliases)](#module_scripts/build..hasPositiveSemanticClass) ⇒ <code>boolean</code>
  - [~expandSemanticExclusions(selector)](#module_scripts/build..expandSemanticExclusions) ⇒ <code>string</code> \| <code>null</code>
  - [~aliasSemanticSelector(selector, selectedRoot, semanticAliasBySourceClass)](#module_scripts/build..aliasSemanticSelector) ⇒ <code>string</code> \| <code>null</code>
  - [~addSemanticAliases(css, filename, selectedPresets)](#module_scripts/build..addSemanticAliases) ⇒ <code>string</code>
  - [~preparedPresetCss(file, id, prefix, composition)](#module_scripts/build..preparedPresetCss) ⇒ <code>string</code>
  - [~rebaseFocusedAssets(css)](#module_scripts/build..rebaseFocusedAssets) ⇒ <code>string</code>
  - [~BrowserTargets](#module_scripts/build..BrowserTargets) : <code>Object.&lt;string, number&gt;</code>
  - [~CssNode](#module_scripts/build..CssNode) : <code>Object</code>

<a name="module_scripts/build..resolveBrowserTargets"></a>

### scripts/build~resolveBrowserTargets(queries) ⇒ <code>BrowserTargets</code>

Resolve the package browser policy into Lightning CSS compilation targets.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>BrowserTargets</code> - Lightning CSS target map.

| Param   | Type                              | Description                                 |
| ------- | --------------------------------- | ------------------------------------------- |
| queries | <code>Array.&lt;string&gt;</code> | Browserslist queries from package metadata. |

<a name="module_scripts/build..normalizeSourceText"></a>

### scripts/build~normalizeSourceText(source) ⇒ <code>string</code>

Normalizes authored source text before CSS Tree offsets are used for selector
edits, keeping generated artifacts identical across Windows and Linux.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> - Source text with canonical line-feed separators.

| Param  | Type                | Description               |
| ------ | ------------------- | ------------------------- |
| source | <code>string</code> | Authored CSS source text. |

<a name="module_scripts/build..addPresetConstraintToRoot"></a>

### scripts/build~addPresetConstraintToRoot(selector, selectedRoot) ⇒ <code>boolean</code>

Constrains a generated semantic alias to the selected presets without increasing root specificity.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>boolean</code> - Whether the selector already contained a data-ui root.

| Param        | Type                | Description                                          |
| ------------ | ------------------- | ---------------------------------------------------- |
| selector     | <code>object</code> | CSS Tree selector node being aliased.                |
| selectedRoot | <code>string</code> | Specificity-safe selector for the active preset set. |

<a name="module_scripts/build..dedupeNestedSelectorLists"></a>

### scripts/build~dedupeNestedSelectorLists(selector) ⇒ <code>void</code>

Removes selector-list duplicates created when several preset classes collapse
to the same public namespace alias.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)

| Param    | Type                 | Description                |
| -------- | -------------------- | -------------------------- |
| selector | <code>CssNode</code> | Selector AST to normalize. |

<a name="module_scripts/build..hasPositiveSemanticClass"></a>

### scripts/build~hasPositiveSemanticClass(selector, aliases) ⇒ <code>boolean</code>

Identifies selectors that positively opt into a promoted component family.

Exclusion-only rules already cover semantic markup. Cloning them would remove
the original prefixed exclusion and let an alias rule recolor that component.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>boolean</code> - Whether a component class occurs outside a negation.

| Param    | Type                                    | Description                           |
| -------- | --------------------------------------- | ------------------------------------- |
| selector | <code>CssNode</code>                    | Authored selector AST.                |
| aliases  | <code>Map.&lt;string, string&gt;</code> | Public aliases keyed by source class. |

<a name="module_scripts/build..expandSemanticExclusions"></a>

### scripts/build~expandSemanticExclusions(selector) ⇒ <code>string</code> \| <code>null</code>

Preserves prefixed exclusions while excluding both generated namespaces too.

Exact class-token attributes describe exclusions without promoting a generic
rule into a semantic component rule or changing its authored root specificity.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> \| <code>null</code> - Expanded selector, or null when no component was excluded.

| Param    | Type                 | Description                                        |
| -------- | -------------------- | -------------------------------------------------- |
| selector | <code>CssNode</code> | Authored selector containing component exclusions. |

<a name="module_scripts/build..aliasSemanticSelector"></a>

### scripts/build~aliasSemanticSelector(selector, selectedRoot, semanticAliasBySourceClass) ⇒ <code>string</code> \| <code>null</code>

Projects a positively selected component into one scoped semantic namespace.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> \| <code>null</code> - Scoped semantic selector, or null for an exclusion-only rule.

| Param                      | Type                                    | Description                                      |
| -------------------------- | --------------------------------------- | ------------------------------------------------ |
| selector                   | <code>CssNode</code>                    | Authored selector AST.                           |
| selectedRoot               | <code>string</code>                     | Specificity-safe scope for the admitted presets. |
| semanticAliasBySourceClass | <code>Map.&lt;string, string&gt;</code> | Source-to-semantic selector map.                 |

<a name="module_scripts/build..addSemanticAliases"></a>

### scripts/build~addSemanticAliases(css, filename, selectedPresets) ⇒ <code>string</code>

Adds semantic selectors while preserving authored declarations and variant guards.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> - CSS with scoped aliases and namespace-safe component exclusions.

| Param           | Type                              | Description                                   |
| --------------- | --------------------------------- | --------------------------------------------- |
| css             | <code>string</code>               | Normalized authored CSS text.                 |
| filename        | <code>string</code>               | Source filename used by parser diagnostics.   |
| selectedPresets | <code>Array.&lt;object&gt;</code> | Manifest presets admitted to this entrypoint. |

<a name="module_scripts/build..preparedPresetCss"></a>

### scripts/build~preparedPresetCss(file, id, prefix, composition) ⇒ <code>string</code>

Prepares each immutable preset/composition partition once within this build invocation.
Cached strings are safe to reuse; mutable parser nodes never cross transformation owners.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> - Formatted generated CSS for the exact input partition.

| Param       | Type                | Description                                                    |
| ----------- | ------------------- | -------------------------------------------------------------- |
| file        | <code>string</code> | Authored stylesheet path relative to the package root.         |
| id          | <code>string</code> | Manifest preset identifier.                                    |
| prefix      | <code>string</code> | Namespaced component prefix.                                   |
| composition | <code>string</code> | Visual paint or deprecated structural compatibility partition. |

<a name="module_scripts/build..rebaseFocusedAssets"></a>

### scripts/build~rebaseFocusedAssets(css) ⇒ <code>string</code>

Rebases bundled raster references for focused stylesheets one directory deeper.

**Kind**: inner method of [<code>scripts/build</code>](#module_scripts/build)  
**Returns**: <code>string</code> - CSS with portable focused-entrypoint URLs.

| Param | Type                | Description      |
| ----- | ------------------- | ---------------- |
| css   | <code>string</code> | Authored bundle. |

<a name="module_scripts/build..BrowserTargets"></a>

### scripts/build~BrowserTargets : <code>Object.&lt;string, number&gt;</code>

Browser version thresholds encoded by Lightning CSS.

**Kind**: inner typedef of [<code>scripts/build</code>](#module_scripts/build)  
<a name="module_scripts/build..CssNode"></a>

### scripts/build~CssNode : <code>Object</code>

CSS Tree grammar node consumed by selector transformations.

**Kind**: inner typedef of [<code>scripts/build</code>](#module_scripts/build)  
**Properties**

| Name | Type                | Description        |
| ---- | ------------------- | ------------------ |
| type | <code>string</code> | Grammar node kind. |
