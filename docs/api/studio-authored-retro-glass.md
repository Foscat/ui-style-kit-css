<!-- Generated with jsdoc2md from demo/studio/authored/retro-glass.js; do not edit by hand. -->

# studio authored retro glass

<a name="module_studio/authored/retro-glass"></a>

## studio/authored/retro-glass

Canonical retro-glass specimen shared by Studio and reference consumers.

- [studio/authored/retro-glass](#module_studio/authored/retro-glass)
  - _static_
    - [.render(context)](#module_studio/authored/retro-glass.render) ⇒ <code>string</code>
    - [.bind(root, context, signal)](#module_studio/authored/retro-glass.bind) ⇒ <code>function</code>
  - _inner_
    - [~create(context)](#module_studio/authored/retro-glass..create) ⇒ <code>Object</code>
      - [~renderRetroGlassTemplateSpecimen(ui)](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen) ⇒ <code>string</code>
        - [~densityChoices](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..densityChoices)
        - [~switchExamples](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..switchExamples)
      - [~retroGlassIcon(name)](#module_studio/authored/retro-glass..create..retroGlassIcon) ⇒ <code>string</code>
      - [~bindRetroGlassSpecimen()](#module_studio/authored/retro-glass..create..bindRetroGlassSpecimen) ⇒ <code>void</code>

<a name="module_studio/authored/retro-glass.render"></a>

### studio/authored/retro-glass.render(context) ⇒ <code>string</code>

Renders the original specimen without depending on host form controls.

**Kind**: static method of [<code>studio/authored/retro-glass</code>](#module_studio/authored/retro-glass)  
**Returns**: <code>string</code> - Trusted authored markup.

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| context | <code>Object</code> | Owned appearance, assets and palette configuration. |

<a name="module_studio/authored/retro-glass.bind"></a>

### studio/authored/retro-glass.bind(root, context, signal) ⇒ <code>function</code>

Binds one mounted specimen and returns its complete resource cleanup.

**Kind**: static method of [<code>studio/authored/retro-glass</code>](#module_studio/authored/retro-glass)  
**Returns**: <code>function</code> - Idempotent cleanup.

| Param   | Type                     | Description               |
| ------- | ------------------------ | ------------------------- |
| root    | <code>HTMLElement</code> | Owned content container.  |
| context | <code>Object</code>      | Appearance and callbacks. |
| signal  | <code>AbortSignal</code> | Parent mount lifetime.    |

<a name="module_studio/authored/retro-glass..create"></a>

### studio/authored/retro-glass~create(context) ⇒ <code>Object</code>

Creates one explicit rendering/binding context without mutable module globals.

**Kind**: inner method of [<code>studio/authored/retro-glass</code>](#module_studio/authored/retro-glass)  
**Returns**: <code>Object</code> - Authored renderer and binder.

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| context | <code>Object</code> | Owned specimen configuration. |

- [~create(context)](#module_studio/authored/retro-glass..create) ⇒ <code>Object</code>
  - [~renderRetroGlassTemplateSpecimen(ui)](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen) ⇒ <code>string</code>
    - [~densityChoices](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..densityChoices)
    - [~switchExamples](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..switchExamples)
  - [~retroGlassIcon(name)](#module_studio/authored/retro-glass..create..retroGlassIcon) ⇒ <code>string</code>
  - [~bindRetroGlassSpecimen()](#module_studio/authored/retro-glass..create..bindRetroGlassSpecimen) ⇒ <code>void</code>

<a name="module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen"></a>

#### create~renderRetroGlassTemplateSpecimen(ui) ⇒ <code>string</code>

Renders every retained RetroGlass template group using the public rg-* API.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/retro-glass..create)  
**Returns**: <code>string</code> - The complete reference board, only for Retro Glass.

| Param | Type                | Description               |
| ----- | ------------------- | ------------------------- |
| ui    | <code>string</code> | Active preset identifier. |

- [~renderRetroGlassTemplateSpecimen(ui)](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen) ⇒ <code>string</code>
  - [~densityChoices](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..densityChoices)
  - [~switchExamples](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..switchExamples)

<a name="module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..densityChoices"></a>

##### renderRetroGlassTemplateSpecimen~densityChoices

Demonstrates mutually exclusive radio states without changing native semantics.

**Kind**: inner constant of [<code>renderRetroGlassTemplateSpecimen</code>](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen)  
<a name="module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen..switchExamples"></a>

##### renderRetroGlassTemplateSpecimen~switchExamples

Contrasts enabled and disabled switch states with explicit visible descriptions.

**Kind**: inner constant of [<code>renderRetroGlassTemplateSpecimen</code>](#module_studio/authored/retro-glass..create..renderRetroGlassTemplateSpecimen)  
<a name="module_studio/authored/retro-glass..create..retroGlassIcon"></a>

#### create~retroGlassIcon(name) ⇒ <code>string</code>

Renders a local Lucide icon from the vendored, licensed source artwork.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/retro-glass..create)  
**Returns**: <code>string</code> - Decorative icon markup; its control supplies the accessible name.

| Param | Type                | Description       |
| ----- | ------------------- | ----------------- |
| name  | <code>string</code> | Lucide icon name. |

<a name="module_studio/authored/retro-glass..create..bindRetroGlassSpecimen"></a>

#### create~bindRetroGlassSpecimen() ⇒ <code>void</code>

Binds specimen controls using native inputs and dialog focus management.

**Kind**: inner method of [<code>create</code>](#module_studio/authored/retro-glass..create)
