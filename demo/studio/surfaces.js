/**
 * @module studio/surfaces
 * @description Shared public surface examples for the Studio and retained reference.
 */

/**
 * Renders additional public surface utilities without reproducing a full reference page.
 * @param {string} ui Preset identifier.
 * @param {string} p Public class prefix.
 * @returns {string} Preset-specific surface samples.
 */
export function renderStyleSpecificSurface(ui, p) {
  const extras = {
    'minimal-saas': `
      <div class="${p}-metric"><span class="${p}-metric-value">98%</span><span class="${p}-metric-label">metric</span></div>
      <div class="${p}-empty-state"><h3 class="${p}-heading">Empty state</h3><p class="${p}-copy">No records need attention.</p></div>`,
    bento: `
      <div class="${p}-grid-feature">
        <div class="${p}-tile ${p}-tile-lg"><span class="${p}-stat-value">42</span><span class="${p}-stat-label">large tile</span></div>
        <div class="${p}-tile ${p}-tile-sm"><span class="${p}-stat-value">8</span><span class="${p}-stat-label">small tile</span></div>
      </div>`,
    maximalist: `
      <span class="${p}-sticker">Sticker</span>
      <div class="${p}-callout ${p}-wiggle">Playful callout motion utility</div>`,
    bauhaus: `
      <div class="${p}-composition"><div class="${p}-block">Block</div><div class="${p}-rail">Rail</div></div>`,
    tactile: `
      <div class="${p}-bevel">Beveled surface</div>
      <button class="${p}-button ${p}-pressed">Pressed surface</button>
      <span class="${p}-knob" aria-hidden="true"></span>`,
    neumorphism: `
      <div class="${p}-card">Raised surface</div>
      <div class="${p}-well">Inset surface</div>
      <button class="${p}-button" type="button" aria-pressed="true">Pressed surface</button>`,
    retrofuturism: `
      <div class="${p}-panel"><span class="${p}-badge">Mission 2084</span><p class="${p}-copy">Mission telemetry</p></div>
      <div class="${p}-well">Instrument-style surface</div>`,
    brutalism: `
      <button class="${p}-button ${p}-pressed">Pressed block</button>`,
    cyberpunk: `
      <div class="${p}-console"><code>console.surface.ready()</code></div>`,
    y2k: `
      <div class="${p}-bubble">Bubble surface</div>`,
    'retro-glass': `
      <div class="${p}-console"><code>glass.surface.ready()</code></div>`,
    'editorial-luxe': `
      <div class="${p}-metric"><span class="${p}-metric-value">01</span><span class="${p}-metric-label">Editorial measure</span></div>
      <div class="${p}-well">Hairline framing and serif-led hierarchy.</div>`,
    'organic-modern': `
      <div class="${p}-metric"><span class="${p}-metric-value">84%</span><span class="${p}-metric-label">Natural balance</span></div>
      <div class="${p}-well">Biomorphic surfaces with soft layered depth.</div>`,
    'industrial-utility': `
      <div class="${p}-metric"><span class="${p}-metric-value">READY</span><span class="${p}-metric-label">System status</span></div>
      <div class="${p}-well">Operational framing and compact equipment-style controls.</div>`,
    'technical-blueprint': `
      <div class="${p}-metric"><span class="${p}-metric-value">A-04</span><span class="${p}-metric-label">Drawing reference</span></div>
      <div class="${p}-empty-state"><strong>No drawings in this package</strong><span>Add a drawing to begin the review.</span></div>
      <pre class="${p}-code"><code>--blueprint-grid-size: 16px;
--blueprint-line-heavy: 2px;
--blueprint-control-height: 44px;</code></pre>
      <blockquote class="${p}-quote">Line weight and section hatching communicate state.</blockquote>`,
    'art-deco': `
      <div class="${p}-metric"><span class="${p}-metric-value">◆</span><span class="${p}-metric-label">Deco detail</span></div>
      <div class="${p}-well">Symmetry, double framing, and geometric ornament.</div>`,
    clay: `
      <div class="${p}-metric"><span class="${p}-metric-value">3D</span><span class="${p}-metric-label">Sculpted surface</span></div>
      <div class="${p}-well">Rounded dimensional controls with friendly elevation.</div>`,
    'data-terminal': `
      <div class="${p}-metric"><span class="${p}-metric-value">42ms</span><span class="${p}-metric-label">Telemetry</span></div>
      <div class="${p}-well"><code>monitor.status = nominal;</code></div>`,
    'paper-editorial': `
      <div class="${p}-metric"><span class="${p}-metric-value">A1</span><span class="${p}-metric-label">Edition</span></div>
      <div class="${p}-well">Print-inspired rules, paper cues, and editorial hierarchy.</div>`,
    'neo-noir': `
      <div class="${p}-metric"><span class="${p}-metric-value">20:45</span><span class="${p}-metric-label">After dark</span></div>
      <div class="${p}-well">Cinematic framing with restrained atmospheric glow.</div>`,
  };

  return extras[ui] ? `<div data-preset-only="${ui}">${extras[ui]}</div>` : '';
}
