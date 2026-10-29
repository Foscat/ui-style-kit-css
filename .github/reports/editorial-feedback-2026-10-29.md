# Message readability and native loader follow-up — 29 October 2026

> Historical verification checkpoint. The [updated coordinated candidate](css-ownership-continuation-2026-10-29.md) supersedes artifact/status claims here; message titles now use normal readable ink.


The user selected normal readable title ink. Titles now share the message's
foreground while retaining preset typography and weight. Success, warning and
danger remain identifiable through their label, icon, colored edge and tinted
surface. This replaces the earlier status-title hue treatment; no text shadow
or outline is required to compensate for the foreground color.

Paper Editorial symbols occupy a fixed 24px lane, use a 20px symbol font and stay
centered against the full message, including wrapped copy. Text and optional
dismiss controls use the component's own grid flow. Native loaders share the
active preset's dimensions, paint, animation and decorative parts.

## Causes and repairs

| Finding | Confirmed cause | Repair |
| --- | --- | --- |
| Title readability preference | The previous generated rules deliberately mixed signal-colored title shades. | Remove the title hue rules and unused shade variables; inherit the readable message foreground. Retain guarded tinted surfaces and paired solid-color fallbacks. |
| Small, displaced Paper symbols | The retained reference uses a wrapping flex row, tiny pseudo-element and full-width paragraphs with a 22px left margin. The symbol becomes a separate row. | Reserve a fixed symbol lane, center its pseudo-element independently, reset paragraph insets at matching specificity and use automatic grid placement for text/buttons. |
| Bento native loader color drift | Native hooks and prefixed spinners follow different fallback color paths in native palettes. | Use the same readable link-ink fallback for all loading entry points. |
| Industrial Utility native loader size drift | The classed rotor was refined to 20px while the attribute-only hook retained its initial 32px dimensions. | Apply the current 20px base size to native standalone hooks. Preserve the mechanical rotor geometry and animation. |

The initial Paper centering repair exposed a retained type-specific paragraph
rule that still won on width/margin. The corrected selector restores the content
inset contract. Final ownership validation rejected explicit placement of native
grid children; natural grid flow provides the required arrangement without an
ownership exception or checker change.

## Verification

Focused tests were written before the corresponding source changes and executed
one at a time. The final coverage in Chromium and WebKit includes:

- **Neutral titles:** 20 styles × 26 palette choices × three modes, covering
  success/warning/danger in canonical, compatibility and prefixed markup. Titles
  and body share readable ink; text contrast remains at least 4.5:1.
- **Paper geometry:** 26 palette choices × three modes × two widths (320/768px),
  including wrapped messages and the dismissible reference structure. Symbols
  remain legible and vertically centered, with text contained in its own lane.
- **Native identity:** 20 styles × 26 palette choices × three modes. `.ui-spinner`,
  `.loading-spinner`, `[data-loading-spinner]` and `.usk-spinner` match the
  prefixed loader, including decorative pseudo-elements. Fixture animations are
  paused while comparing signatures; animation name, duration and timing remain
  part of the comparison.

That is **6,552 component-state checks** across the two browsers. The matrices are
scoped to the affected contracts. Firefox was not included in this follow-up.
No full unit suite or remote CI was run.

Build, focused lint/syntax, generated-source synchronization, declaration review,
semantic alias/entrypoint contracts, retained Paper API, ownership, compatibility,
package integrity and static palette contrast pass. Ownership examines 37,107
declarations with zero exceptions. Compatibility covers 26 entrypoints and 60
resolved targets; palette contrast covers 1,500 themed plus 60 native states.
The incremental compiled declaration change is +16 over the preceding clean
feedback candidate. Version remains 2.6.2. The repository has no jsdoc2md script;
its established generation updates CSS, cache references and README bundle sizes.
The spacing guide reflects the new title and icon contracts.

## Local evidence and boundary

The existing local server at `http://127.0.0.1:5500/demo/index.html` is preserved.
Local Opera supplies manual mode/theme selection and rendered inspection through
the available browser controls. Direct Gnomie Browser Commander runtime tools
are not exposed in this session; its workflow is applied through that local
surface. The cloud browser cannot reach localhost. No accounts, credentials,
messages, provider settings or production data are involved.

The reference message was dismissed through its real demo control after the
layout repair; its `hidden` state was checked. Before images replay the saved
pre-patch CSS against the same demo. After images use the working preview. The
fixed toolbar is hidden only during component capture. Screenshots, interactions
and deterministic assertions are separate evidence; no recording was requested.
Initial preview selections are restored to Minimal SaaS / native / light.

- [Before: Paper light messages](evidence/editorial-feedback-20261029/before-paper-light.png)
- [After: Paper light messages](evidence/editorial-feedback-20261029/after-paper-light.png)
- [After: Paper dark messages](evidence/editorial-feedback-20261029/after-paper-dark.png)
- [After: native and classed Bento loaders](evidence/editorial-feedback-20261029/after-bento-loaders.png)
- [Dismissible reference message](evidence/editorial-feedback-20261029/after-paper-dismissible.png)
- [Machine-readable evidence](evidence/editorial-feedback-20261029/verification.json)

All changes remain local and uncommitted. A plain ignored HEAD export isolates
the review artifact from the pre-existing Bento badge tint edits and their test;
this is not a worktree. Browser matrices use the working build, while declaration
fingerprints and package gates use the isolated candidate. Their only source
difference is the preserved Bento badge tint block. Other local edits and output
remain intact. No release, consumer update, merge or deployment is included.
