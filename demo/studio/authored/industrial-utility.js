/**
 * @module studio/authored/industrial-utility
 * @description Canonical industrial-utility specimen shared by Studio and reference consumers.
 */
import { escapeHtml } from '../html.js';
import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} context Owned specimen configuration.
 * @returns {Object} Authored renderer and binder.
 */
function create(context) {
  const selectReferencePalette = () => context.onAppearance({ theme: '' });
  /** Renders only the active Industrial Utility preset using the retained element-board layout. */
  function renderIndustrialTemplateSpecimen(ui) {
    if (ui !== 'industrial-utility') return '';
    return `<section id="industrial-utility-template" class="demo-industrial-utility-specimen ly-stack ly-gap-4" data-preset-only="industrial-utility" data-testid="industrial-utility-template-specimen" aria-label="Industrial Utility UI element reference sheet">
    <header class="demo-iu-specimen-header ly-grid">
      <section class="demo-iu-header-zone demo-iu-brand-zone ly-cluster ly-items-center">
        <div class="utility-nameplate"><span>PLC D14</span></div>
        <div class="demo-iu-brand-copy">
          <h2>Industrial Utility</h2>
          <p>PLC / SCADA operator interface / element system 01</p>
        </div>
      </section>

      <section class="demo-iu-header-zone demo-iu-palette-zone ly-cluster ly-items-center ly-grid" aria-label="Core palette">
        <div class="utility-token"><i style="background:var(--utility-material-safety-amber)"></i><span>SAFETY</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-lamp-green)"></i><span>RUN</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-hazard-red)"></i><span>ALARM</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-lamp-blue)"></i><span>INFO</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-steel)"></i><span>STEEL</span></div>
        <div class="utility-token"><i style="background:var(--utility-material-header)"></i><span>PANEL</span></div>
      </section>

      <section class="demo-iu-header-zone demo-iu-mode-zone ly-cluster ly-items-center ly-grid">
        <div class="demo-iu-mode-meta">
          <span class="utility-overline">System style mode</span>
          <strong><span class="utility-pilot-light" aria-hidden="true"></span> <span id="utility-mode-name">${escapeHtml(context.appearance.mode)} console</span></strong>
          <small>OPERATOR UI / SAFETY-CRITICAL HIERARCHY</small>
          <button class="utility-button utility-button-ghost" type="button" data-utility-reference aria-label="Use reference palette" title="Use reference palette">Reference palette</button>
        </div>
        <div class="demo-iu-clock"><output>09:42:18</output><small>Local / line A</small></div>
      </section>
    </header>

    <div class="demo-iu-specimen-grid ly-grid">
      <section class="utility-panel demo-iu-panel-buttons" data-component="buttons">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Buttons <small>states + priority</small></header>
        <div class="utility-panel-body utility-control-grid demo-iu-button-grid ly-grid">
          <div class="demo-iu-button-sample"><span class="utility-label">Primary</span><button class="utility-button utility-button-primary" type="button">Execute</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Secondary</span><button class="utility-button utility-button-secondary" type="button">Manual</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Outline</span><button class="utility-button utility-button-ghost" type="button">Inspect</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Hover</span><button class="utility-button is-hover" type="button">Hover</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Pressed</span><button class="utility-button is-pressed" aria-pressed="true" type="button">Pressed</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Destructive</span><button class="utility-button utility-button-danger" type="button">Delete</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Loading</span><button class="utility-button is-loading" aria-busy="true" type="button">Sending</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Disabled</span><button class="utility-button" type="button" disabled>Locked</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Guarded</span><button class="utility-button utility-button-guarded" type="button"><span>Reset</span></button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Small</span><button class="utility-button utility-button-primary" type="button">Start</button></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Link</span><a class="utility-button utility-button-ghost" href="#utility-navigation">Open log</a></div>
          <div class="demo-iu-button-sample"><span class="utility-label">Emergency</span><button class="utility-button utility-button-danger" type="button">Trip</button></div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-inputs" data-component="inputs">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Inputs <small>native form coverage</small></header>
        <div class="utility-panel-body demo-iu-input-grid ly-grid">
          <label class="utility-field"><span class="utility-label">Text</span><input class="utility-input" type="text" value="Pump 04"></label>
          <label class="utility-field"><span class="utility-label">Password</span><input class="utility-input" type="password" value="interlock"></label>
          <label class="utility-field"><span class="utility-label">Search</span><input class="utility-input" type="search" placeholder="Search assets"></label>
          <label class="utility-field"><span class="utility-label">Number</span><input class="utility-input" type="number" value="72.6" step="0.1"></label>
          <label class="utility-field"><span class="utility-label">Date</span><input class="utility-input" type="date" value="2026-09-05"></label>
          <label class="utility-field"><span class="utility-label">Time</span><input class="utility-input" type="time" value="09:42"></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">File upload</span><input class="utility-file" type="file"></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">Validation error</span><input class="utility-input is-error" aria-invalid="true" type="text" value="PT-201 out of range"><small class="utility-help is-error">Enter a value from 0-150 PSI.</small></label>
          <label class="utility-field demo-iu-wide"><span class="utility-label">Textarea</span><textarea class="utility-textarea" rows="1" placeholder="Maintenance note"></textarea></label>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-status" data-component="status">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">System status <small>live semantics</small></header>
        <div class="utility-panel-body demo-iu-status-layout ly-grid">
          <div class="demo-iu-status-bank ly-grid">
            <div class="demo-iu-status-line ly-grid ly-items-center"><span class="utility-pilot-light" aria-hidden="true"></span><b>Running</b><small>RUN</small></div>
            <div class="demo-iu-status-line ly-grid ly-items-center"><span class="utility-pilot-light is-blue" aria-hidden="true"></span><b>Remote</b><small>REM</small></div>
            <div class="demo-iu-status-line ly-grid ly-items-center"><span class="utility-pilot-light is-red" aria-hidden="true"></span><b>Alarm</b><small>ALM</small></div>
            <div class="demo-iu-status-line ly-grid ly-items-center"><span class="utility-pilot-light is-off" aria-hidden="true"></span><b>Offline</b><small>OFF</small></div>
          </div>
          <div class="demo-iu-status-badges ly-cluster ly-grid">
            <span class="utility-badge utility-badge-success">Open</span>
            <span class="utility-badge utility-badge-primary">Active</span>
            <span class="utility-badge utility-badge-warning">Warning</span>
            <span class="utility-badge utility-badge-danger">Critical</span>
            <span class="utility-badge utility-badge-success">Safe</span>
            <span class="utility-badge">Planned</span>
          </div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-selection" data-component="selection">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Selection controls <small>single + multi</small></header>
        <div class="utility-panel-body demo-iu-selection-layout ly-grid">
          <div>
            <label class="utility-field"><span class="utility-label">Closed select</span><select class="utility-select"><option>Line A</option><option>Line B</option><option>Line C</option></select></label>
            <div class="utility-label" style="margin-top:8px">Expanded select</div>
            <div class="utility-dropdown" role="listbox" aria-label="Production lines"><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Line A</button><button type="button" class="utility-option" role="option" aria-selected="true" tabindex="0">Line B</button><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Line C - maintenance</button><button type="button" class="utility-option" role="option" aria-selected="false" tabindex="-1">Utilities</button></div>
          </div>
          <div class="demo-iu-selection-groups ly-grid">
            <div class="demo-iu-option-stack ly-grid">
              <span class="utility-label">Checkboxes</span>
              <label class="utility-check"><input type="checkbox"> Unchecked</label>
              <label class="utility-check"><input type="checkbox" checked> Checked</label>
              <label class="utility-check is-disabled"><input type="checkbox" disabled> Disabled</label>
            </div>
            <div class="demo-iu-option-stack ly-grid">
              <span class="utility-label">Radio group</span>
              <label class="utility-radio"><input type="radio" name="utility-operating-mode" checked> Auto</label>
              <label class="utility-radio"><input type="radio" name="utility-operating-mode"> Manual</label>
              <label class="utility-radio is-disabled"><input type="radio" name="utility-operating-mode" disabled> Local</label>
            </div>
            <div class="demo-iu-chip-row ly-cluster" aria-label="Multi-select values">
              <span class="utility-badge utility-badge-primary">Pump 04</span><span class="utility-badge utility-badge-primary">Pump 05</span><span class="utility-badge">Valve 201</span>
            </div>
          </div>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-toggles" data-component="toggles">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Switchgear <small>semi-tactile controls</small></header>
        <div class="utility-panel-body demo-iu-toggle-layout ly-grid">
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Toggle off</span><label class="utility-toggle"><input type="checkbox"><span>Off</span></label></div>
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Toggle on</span><label class="utility-toggle"><input type="checkbox" checked><span>On</span></label></div>
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Key switch</span><button class="utility-key-switch" type="button" aria-label="Key switch: Auto" data-position="auto" data-utility-key></button><small class="utility-help">OFF / AUTO / ON</small></div>
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Guarded stop</span><button class="utility-emergency-stop" type="button" id="utility-estop" aria-pressed="false">E-STOP</button></div>
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Pilot bank</span><div class="demo-iu-lamp-row ly-cluster ly-items-center"><span class="utility-pilot-light" aria-hidden="true"></span><span class="utility-pilot-light is-blue" aria-hidden="true"></span><span class="utility-pilot-light is-warning" aria-hidden="true"></span><span class="utility-pilot-light is-red" aria-hidden="true"></span><span class="utility-pilot-light is-off" aria-hidden="true"></span></div><small class="utility-help">RUN / REM / WARN / ALM / OFF</small></div>
          <div class="utility-control-cell demo-iu-toggle-well ly-stack ly-items-center"><span class="utility-control-name">Three position</span><div class="utility-three-position"><button type="button">Jog</button><button type="button" class="is-active">Auto</button><button type="button">Hand</button></div></div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-instruments" data-component="sliders">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Sliders + meters <small>process values</small></header>
        <div class="utility-panel-body demo-iu-instrument-layout ly-grid">
          <div class="demo-iu-instrument-block">
            <span class="utility-label utility-readout-label">Discharge pressure</span>
            <div class="utility-readout"><output id="utility-pressure-value">72.6</output><small>PSI</small></div>
            <div class="utility-ticks"><span>0</span><span>50</span><span>100</span><span>150</span></div>
            <input class="utility-slider" id="utility-pressure" aria-label="Discharge pressure" type="range" min="0" max="150" step=".1" value="72.6">
          </div>
          <div class="demo-iu-instrument-block">
            <span class="utility-label">Linear progress</span>
            <div class="demo-iu-meter-line ly-grid ly-items-center"><div class="utility-meter" role="meter" aria-label="Linear progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65"><span style="width:65%"></span></div><output>65%</output></div>
            <span class="utility-label" style="margin-top:12px">Batch transfer</span>
            <progress class="utility-progress" aria-label="Batch transfer" max="100" value="78">78%</progress>
          </div>
          <div class="demo-iu-instrument-block demo-iu-wide">
            <span class="utility-label">Threshold meter</span>
            <div class="utility-ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
            <input class="utility-slider" aria-label="Threshold meter" type="range" min="0" max="100" value="61">
            <div class="utility-stage-track" aria-label="Process stages">
              <div class="utility-stage is-complete"><b>1</b>Request</div>
              <div class="utility-stage is-complete"><b>2</b>Validate</div>
              <div class="utility-stage is-current" aria-current="step"><b>3</b>Execute</div>
              <div class="utility-stage"><b>4</b>Complete</div>
            </div>
          </div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-navigation" data-component="navigation" id="utility-navigation">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Navigation <small>wayfinding</small></header>
        <div class="utility-panel-body demo-iu-nav-stack ly-grid">
          <nav class="utility-breadcrumb" aria-label="Breadcrumb"><span>Plant West</span><i>/</i><span>Unit 02</span><i>/</i><b>Line A</b></nav>
          <div class="utility-tabs" role="tablist" aria-label="Operating views">
            <button class="utility-tab is-active" role="tab" aria-selected="true" type="button">Overview</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">Alarms</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">History</button>
            <button class="utility-tab" role="tab" aria-selected="false" type="button">Service</button>
          </div>
          <div class="demo-iu-nav-row ly-cluster ly-items-center ly-justify-between"><span class="utility-label">Pagination</span><div class="utility-pagination"><button type="button">Prev</button><button class="is-active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">Next</button></div></div>
          <div class="demo-iu-nav-row ly-cluster ly-items-center ly-justify-between"><span class="utility-label">Segmented</span><div class="utility-segmented"><button class="is-active" type="button">1H</button><button type="button">6H</button><button type="button">12H</button><button type="button">24H</button></div></div>
          <div class="demo-iu-link-row ly-cluster"><a href="#industrial-utility-template">Default link</a><a href="#industrial-utility-template" class="is-hover">Hover link</a><span>Disabled link</span></div>
          <details class="utility-details" open><summary>Maintenance details</summary><p>Interlock verified / last service 08:15.</p></details>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-table" data-component="table">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Work orders <small>dense operational data</small></header>
        <div class="utility-panel-body">
          <div class="demo-iu-table-toolbar ly-cluster ly-items-center">
            <select class="utility-select" aria-label="Status filter"><option>All status</option><option>Open</option><option>Complete</option></select>
            <select class="utility-select" aria-label="Area filter"><option>All areas</option><option>Line A</option><option>Utilities</option></select>
            <input class="utility-input" type="search" aria-label="Search work orders" placeholder="Search work orders">
            <button class="utility-button utility-button-primary" type="button" data-utility-new>New work order</button>
          </div>
          <div class="utility-table-wrap" tabindex="0">
            <table class="utility-table">
              <thead><tr><th>WO #</th><th>Status</th><th>Priority</th><th>Description</th><th>Asset</th><th>Area</th><th>Assigned</th></tr></thead>
              <tbody>
                <tr><td>WO-24817</td><td><span class="utility-badge utility-badge-success">Open</span></td><td><span class="utility-badge utility-badge-danger">High</span></td><td>Inspect feed pump vibration</td><td>P-04</td><td>Line A</td><td>M. Johnson</td></tr>
                <tr><td>WO-24815</td><td><span class="utility-badge utility-badge-primary">In progress</span></td><td><span class="utility-badge utility-badge-warning">Medium</span></td><td>Replace cartridge filters</td><td>F-02</td><td>Line A</td><td>T. Williams</td></tr>
                <tr><td>WO-24814</td><td><span class="utility-badge utility-badge-success">Open</span></td><td><span class="utility-badge utility-badge-warning">Medium</span></td><td>Calibrate pressure transmitter</td><td>PT-201</td><td>Line A</td><td>R. Anderson</td></tr>
                <tr><td>WO-24813</td><td><span class="utility-badge">Planned</span></td><td><span class="utility-badge utility-badge-primary">Low</span></td><td>Quarterly valve maintenance</td><td>XV-201</td><td>Line A</td><td>J. Davis</td></tr>
                <tr><td>WO-24810</td><td><span class="utility-badge utility-badge-success">Complete</span></td><td><span class="utility-badge utility-badge-primary">Low</span></td><td>Inspect tank level switch</td><td>LS-101</td><td>Tank Farm</td><td>S. Miller</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!--demo-style-feature-->
      <section class="utility-panel demo-iu-panel-alerts" data-component="alerts">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Alerts + feedback <small>alarm hierarchy</small></header>
        <div class="utility-panel-body demo-iu-alerts-layout ly-grid">
          <div class="utility-alert utility-alert-danger" data-utility-critical role="status"><span class="utility-pilot-light is-red" aria-hidden="true"></span><div><strong>Critical / HH pressure</strong>PT-201 exceeded 145 PSI. Immediate action required.</div><span class="utility-badge utility-badge-danger">Unacked</span></div>
          <div class="utility-alert utility-alert-warning"><span class="utility-pilot-light is-warning" aria-hidden="true"></span><div><strong>Warning / filter differential</strong>F-02 pressure drop is approaching the service limit.</div><span class="utility-badge utility-badge-warning">Active</span></div>
          <div class="utility-alert utility-alert-success"><span class="utility-pilot-light" aria-hidden="true"></span><div><strong>Normal / process stable</strong>Line A is operating inside the configured envelope.</div><span class="utility-badge utility-badge-success">Normal</span></div>
          <div class="utility-alert"><span class="utility-pilot-light is-blue" aria-hidden="true"></span><div><strong>Advisory / scheduled service</strong>Pump 05 inspection is due in 18 operating hours.</div><span class="utility-badge utility-badge-primary">Info</span></div>
          <div class="demo-iu-alert-controls ly-cluster"><button class="utility-button utility-button-ghost" type="button" data-utility-silence aria-pressed="false">Silence horn</button><button class="utility-button utility-button-primary" type="button" data-utility-ack-open>Acknowledge</button></div>
        </div>
      </section>

      <!--/demo-style-feature-->
      <section class="utility-panel demo-iu-panel-overlays" data-component="overlays">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Overlays + loading <small>blocking states</small></header>
        <div class="utility-panel-body demo-iu-overlay-layout ly-grid">
          <div class="utility-dialog" role="group" aria-labelledby="utility-dialog-title">
            <header id="utility-dialog-title">Confirm acknowledge</header>
            <p>Acknowledge all unhandled Line A alarms? This sample changes acknowledgment only.</p>
            <footer><button class="utility-button utility-button-ghost" type="button" data-utility-cancel>Cancel</button><button class="utility-button utility-button-primary" type="button" data-utility-ack-open>Acknowledge</button></footer>
          </div>
          <div class="demo-iu-overlay-stack ly-grid">
            <div><span class="utility-label">Tooltip</span><div class="utility-tooltip" role="tooltip">Discharge pressure at end of Line A.</div></div>
            <div class="demo-iu-loading-well ly-cluster ly-items-center"><span class="utility-spinner" role="status" aria-label="Loading process history"></span><span>Loading process history</span></div>
            <div class="utility-card utility-popover"><h3>Popover card</h3><p>Controller P-04 is in automatic mode at 45.2 Hz.</p></div>
          </div>
        </div>
      </section>

      <section class="utility-panel demo-iu-panel-tokens" data-component="tokens">
        <span class="utility-rivet is-tl" aria-hidden="true"></span><span class="utility-rivet is-tr" aria-hidden="true"></span><header class="utility-panel-header">Tokens + type <small>foundation</small></header>
        <div class="utility-panel-body demo-iu-tokens-layout ly-grid">
          <div class="utility-token-row">
            <div class="utility-token"><i style="background:var(--utility-material-safety-amber)"></i><span>AMBER</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-lamp-green)"></i><span>GREEN</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-hazard-red)"></i><span>RED</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-lamp-blue)"></i><span>BLUE</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-steel)"></i><span>STEEL</span></div>
            <div class="utility-token"><i style="background:var(--utility-material-surface-low)"></i><span>WELL</span></div>
          </div>
          <div class="demo-iu-type-sample ly-grid"><span class="demo-iu-display">Process HMI</span><span class="demo-iu-body">Condensed body copy for dense operational interfaces.</span><span class="demo-iu-mono">AI-204 / 72.6 PSI / AUTO</span></div>
          <div class="demo-iu-spacing-key ly-grid">
            <div><span>04</span><i style="width:16px"></i></div>
            <div><span>08</span><i style="width:32px"></i></div>
            <div><span>16</span><i style="width:64px"></i></div>
            <div><span>24</span><i style="width:96px"></i></div>
          </div>
          <div class="utility-skeleton"></div><div class="utility-skeleton" style="width:72%"></div>
          <div class="utility-empty-state"><span class="utility-pilot-light is-off" aria-hidden="true"></span>No active bypasses</div>
        </div>
      </section>
    </div>
  <!--demo-style-support-->
  <div class="utility-toast-stack demo-iu-extra-feedback"><div class="utility-toast" role="status" data-utility-feedback>Console ready</div></div>
<dialog class="utility-dialog demo-iu-confirm-dialog" aria-labelledby="utility-confirm-title"><header id="utility-confirm-title">Confirm acknowledge</header><p>Acknowledge the displayed sample alarm? Its critical condition remains active.</p><footer><button type="button" class="utility-button utility-button-ghost" data-utility-dialog-cancel>Cancel</button><button type="button" class="utility-button utility-button-primary" data-utility-dialog-confirm>Acknowledge</button></footer></dialog>
<!--/demo-style-support-->
</section>`;
  }

  /** Binds inert console interactions inside the active preset, without affecting other styles. */
  function bindIndustrialSpecimen() {
    const root = context.byId('industrial-utility-template');
    if (!root) return;
    const feedback = root.querySelector('[data-utility-feedback]');
    const report = (message) => {
      feedback.textContent = message;
    };
    context.listenOptional(
      root.querySelector('[data-utility-reference]'),
      'click',
      selectReferencePalette,
    );
    const pressure = root.querySelector('#utility-pressure');
    context.listen(pressure, 'input', () => {
      root.querySelector('#utility-pressure-value').value = Number(pressure.value).toFixed(1);
    });
    root.querySelectorAll('.utility-toggle input').forEach((input) => {
      context.listen(input, 'change', () => {
        input.nextElementSibling.textContent = input.checked ? 'On' : 'Off';
      });
    });
    const key = root.querySelector('[data-utility-key]');
    context.listen(key, 'click', () => {
      const positions = ['off', 'auto', 'on'];
      const next = positions[(positions.indexOf(key.dataset.position) + 1) % positions.length];
      key.dataset.position = next;
      const label = next[0].toUpperCase() + next.slice(1);
      key.setAttribute('aria-label', `Key switch: ${label}`);
      key.nextElementSibling.textContent = `OFF / AUTO / ON: ${label}`;
      report(`Sample key switch: ${label}`);
    });
    context.listen(root.querySelector('#utility-estop'), 'click', (event) => {
      const pressed = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      event.currentTarget.setAttribute('aria-pressed', String(pressed));
      event.currentTarget.classList.toggle('is-pressed', pressed);
      event.currentTarget.textContent = pressed ? 'RESET' : 'E-STOP';
      report(pressed ? 'Sample stop latched. No equipment is connected.' : 'Sample stop reset.');
    });
    const dialog = root.querySelector('dialog');
    let opener;
    root.querySelectorAll('[data-utility-ack-open]').forEach((button) =>
      context.listen(button, 'click', () => {
        opener = button;
        dialog.showModal();
      }),
    );
    context.listen(dialog.querySelector('[data-utility-dialog-cancel]'), 'click', () =>
      dialog.close(),
    );
    context.listen(dialog.querySelector('[data-utility-dialog-confirm]'), 'click', () => {
      const alarm = root.querySelector('[data-utility-critical]');
      alarm.querySelector('.utility-badge').textContent = 'Acknowledged';
      report('Sample acknowledgment recorded locally. Critical pressure remains active.');
      dialog.close();
    });
    context.listen(dialog, 'close', () => opener?.focus());
    context.listen(root.querySelector('[data-utility-silence]'), 'click', (event) => {
      const muted = event.currentTarget.getAttribute('aria-pressed') !== 'true';
      event.currentTarget.setAttribute('aria-pressed', String(muted));
      event.currentTarget.textContent = muted ? 'Restore horn' : 'Silence horn';
      report(muted ? 'Sample horn muted; alarms remain visible.' : 'Sample horn restored.');
    });

    // Use one roving-focus model for tabs, the listbox, and mutually exclusive modes.
    root
      .querySelectorAll(
        '.utility-tabs, .utility-dropdown, .utility-segmented, .utility-three-position',
      )
      .forEach((group) => {
        const buttons = [...group.querySelectorAll('button')];
        const attribute = group.matches('.utility-tabs, .utility-dropdown')
          ? 'aria-selected'
          : 'aria-pressed';
        const select = (button, focus = false) => {
          buttons.forEach((item) => {
            const active = item === button;
            item.setAttribute(attribute, String(active));
            item.classList.toggle('is-active', active);
            item.tabIndex = active ? 0 : -1;
          });
          if (focus) button.focus();
        };
        select(
          buttons.find(
            (button) =>
              button.getAttribute(attribute) === 'true' || button.classList.contains('is-active'),
          ) || buttons[0],
        );
        context.listen(group, 'click', (event) => {
          const button = event.target.closest('button');
          if (!buttons.includes(button)) return;
          select(button);
          report(`${button.textContent.trim()} selected`);
        });
        context.listen(group, 'keydown', (event) => {
          if (
            !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
          )
            return;
          event.preventDefault();
          const index = buttons.indexOf(context.document.activeElement);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? buttons.length - 1
                : (index +
                    (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          select(buttons[next], true);
        });
      });
    const table = root.querySelector('.utility-table tbody');
    const search = root.querySelector('[aria-label="Search work orders"]');
    const status = root.querySelector('[aria-label="Status filter"]');
    const area = root.querySelector('[aria-label="Area filter"]');
    const filter = () => {
      [...table.rows].forEach((row) => {
        row.hidden =
          !row.textContent.toLowerCase().includes(search.value.toLowerCase()) ||
          (status.selectedIndex > 0 && row.cells[1].textContent.trim() !== status.value) ||
          (area.selectedIndex > 0 && row.cells[5].textContent.trim() !== area.value);
      });
      report(`${[...table.rows].filter((row) => !row.hidden).length} sample work orders shown`);
    };
    // Work-order controls are intentionally present only in the complete reference fixture.
    context.listenOptional(search, 'input', filter);
    context.listenOptional(status, 'change', filter);
    context.listenOptional(area, 'change', filter);
    context.listenOptional(root.querySelector('[data-utility-new]'), 'click', () => {
      const row = table.rows[0].cloneNode(true);
      row.cells[0].textContent = `WO-DEMO-${table.rows.length + 1}`;
      row.cells[3].textContent = 'New local inspection draft';
      table.prepend(row);
      filter();
    });
    const pages = root.querySelector('.utility-pagination');
    let currentPage = 1;
    context.listenOptional(pages, 'click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const label = button.textContent.trim();
      currentPage =
        label === 'Prev'
          ? Math.max(1, currentPage - 1)
          : label === 'Next'
            ? Math.min(3, currentPage + 1)
            : Number(label);
      pages.querySelectorAll('button').forEach((item) => {
        const active = item.textContent.trim() === String(currentPage);
        item.classList.toggle('is-active', active);
        if (active) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      report(`Sample navigation page ${currentPage} selected`);
    });
    root
      .querySelectorAll('.demo-iu-button-grid button, [data-utility-cancel]')
      .forEach((button) => {
        context.listen(button, 'click', () =>
          report(`${button.textContent.trim()} sample selected. No equipment is connected.`),
        );
      });
  }
  return { render: renderIndustrialTemplateSpecimen, bind: bindIndustrialSpecimen };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'industrial-utility') return '';
  return create(context).render(context.appearance.ui, context.prefix);
}

/** Binds one mounted specimen and returns its complete resource cleanup.
 * @param {HTMLElement} root Owned content container.
 * @param {Object} context Appearance and callbacks.
 * @param {AbortSignal} signal Parent mount lifetime.
 * @returns {Function} Idempotent cleanup.
 */
export function bind(root, context, signal) {
  const lifetime = createLifetime(signal);
  const owned = { ...context, ...lifetime, root, document: root.ownerDocument };
  try {
    const instance = create(owned);
    instance.bind?.();
  } catch (error) {
    lifetime.dispose();
    throw error;
  }
  return lifetime.dispose;
}

if (typeof window !== 'undefined') {
  window.StudioAuthored ??= {};
  window.StudioAuthored['industrial-utility'] = { render, bind };
}
