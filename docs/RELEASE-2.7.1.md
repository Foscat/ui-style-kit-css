# v2.7.1 interaction contrast patch

This compatible patch preserves the 20 presets, 25 named color themes, native palettes, three modes, and existing public entrypoints.

## Corrections

- Neutral hover rules no longer replace filled action backgrounds while retaining their foregrounds.
- Outlined CTAs retain readable surface ink at rest and their paired primary fill on hover. Neutral defaults exclude these paint-owning modifiers; Clay icon buttons use the control surface beneath their labels.
- Inline-link presentation excludes prefixed and semantic action classes. The build generates semantic aliases only for selectors that positively select a promoted component; exclusions alone cannot introduce a competing component rule. Variant exclusions also cover mixed prefixed/semantic markup used by React consumers.
- Primary, danger, warning, and current-navigation labels retain a matched foreground and background. Decorative reflections stay outside the central label lane.
- Neumorphism table values use readable surface ink, and Bento success and warning badge labels remain readable on translucent tints.
- Neo Noir warning paint belongs to its skewed face, preserving the component geometry.
- Y2K cut modifiers preserve primary action paint, and the compact trust seal contains its full number and caption.

## Verification boundary

Focused Chromium regressions cover all presets, native plus named palettes, all modes, and rest, hover, active, keyboard-focus, and pressed-hover states. Fixtures include prefixed buttons, both semantic namespaces, mixed React class models, anchor actions, marketing CTAs, icon actions, native fields, disclosures, navigation, and tables. The React paint check asserts the real theme IDs visited, preventing a repeated native palette from masquerading as named-theme coverage.

Manual demo interaction uses the connected local Opera browser because Gnomie Browser Commander's runtime is unavailable in this session. Local evidence, protected GitHub release checks, npm publication, and live demo verification remain separate gates. No jsdoc2md generator is configured in this CSS package; JSDoc-compatible comments and the repository build maintain the generated artifacts.

Publication follows [PUBLISHING.md](PUBLISHING.md). The aligned companions remain Interactive Surface CSS 1.7.3 and Layout Style CSS 3.2.3.
