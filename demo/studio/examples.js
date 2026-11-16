/**
 * @module studio/examples
 * @description Shared, deterministic examples. Visual configuration never changes their data.
 */

export { componentInventory } from './inventory.js';
export { renderComponent } from './catalog.js';
export { escapeHtml } from './html.js';

/** Six real values shared by the SVG and its accessible data table. */
const chartValues = [32, 46, 40, 66, 59, 84];
const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

/** Draws a directly labeled SVG trend backed by the exact same table values.
 * @returns {string} Accessible chart and data disclosure.
 */
function chart() {
  const points = chartValues
    .map((value, index) => 30 + index * 96 + ',' + (151 - value * 1.3))
    .join(' ');
  return (
    '<figure class="example-chart ly-stack"><figcaption class="ly-cluster ly-justify-between"><strong>Completed projects</strong><details class="usk-tooltip-anchor"><summary>About this chart</summary><span class="usk-tooltip" id="chart-help" role="tooltip" data-ui-variant="accent">Six months of illustrative project totals.</span></details><span>Monthly totals · sample data</span></figcaption>' +
    '<svg class="usk-svg" viewBox="0 0 540 190" role="img" aria-label="Completed projects increased from 32 in March to 84 in August.">' +
    [20, 50, 80]
      .map(
        (value) =>
          '<line x1="28" x2="512" y1="' +
          (151 - value * 1.3) +
          '" y2="' +
          (151 - value * 1.3) +
          '" stroke="var(--ui-color-border)"/>',
      )
      .join('') +
    '<polyline points="' +
    points +
    '" fill="none" stroke="var(--ui-color-primary)" stroke-width="3" stroke-linejoin="round"/>' +
    chartValues
      .map(
        (value, index) =>
          '<circle cx="' +
          (30 + index * 96) +
          '" cy="' +
          (151 - value * 1.3) +
          '" r="4" fill="var(--ui-color-primary)"/><text fill="var(--ui-color-text)" x="' +
          (30 + index * 96) +
          '" y="179" text-anchor="middle">' +
          months[index] +
          '</text>',
      )
      .join('') +
    '<text fill="var(--ui-color-text)" x="510" y="30" text-anchor="end" class="chart-value">84</text></svg>' +
    '<details><summary>View chart data</summary><table><caption>Completed projects by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Projects</th></tr></thead><tbody>' +
    chartValues
      .map(
        (value, index) =>
          '<tr><th scope="row">' + months[index] + '</th><td>' + value + '</td></tr>',
      )
      .join('') +
    '</tbody></table></details></figure>'
  );
}

/** Renders the records dashboard; filtering is bound once by the frame controller.
 * @returns {string} Dashboard markup.
 */
function dashboard() {
  return (
    '<div data-ui-structure="neutral" class="example-app ly-wrapper ly-wrapper--content ly-section ly-section--compact ly-stack"><header class="example-topbar usk-toolbar ly-cluster ly-justify-between"><strong>Northstar<span class="example-brand-dot">●</span></strong><span class="usk-badge" data-ui-variant="secondary">Workspace</span><button class="usk-button" data-ui-variant="primary" data-action="new-project" type="button"><span class="usk-button__icon" aria-hidden="true" data-studio-icon="plus"></span>New project</button></header>' +
    '<div data-ui-structure="neutral" class="example-body ly-stack"><header class="example-heading ly-cluster ly-justify-between"><div><p class="example-eyebrow">Workspace overview</p><h1>Good work, in view.</h1><p>Keep your team’s projects moving.</p></div><span class="example-avatar usk-avatar" aria-label="Alex Morgan">AM</span></header>' +
    '<div class="example-metrics ly-grid" data-ly-primitive="grid"><article class="usk-metric"><span class="usk-metric-label">Active projects</span><strong class="usk-metric-value">24</strong><small class="usk-metric-detail">6 due this week</small></article><article class="usk-metric"><span class="usk-metric-label">On-time delivery</span><strong class="usk-metric-value">96<span>%</span></strong><small class="usk-metric-detail">↑ 4% this quarter</small></article><article class="usk-metric"><span class="usk-metric-label">Team members</span><strong class="usk-metric-value">12</strong><small class="usk-metric-detail">Across 3 teams</small></article></div>' +
    '<article class="usk-card" data-card-spacing="normal">' +
    chart() +
    '</article>' +
    '<section class="usk-card" data-card-spacing="normal" aria-labelledby="projects-title"><div class="example-section-heading ly-cluster ly-justify-between"><h2 id="projects-title">Recent projects</h2><span class="usk-badge" data-record-count>4 projects</span></div>' +
    '<div class="example-filters ly-grid"><label class="usk-field"><span class="usk-label">Search projects</span><input class="usk-input" type="search" data-action="project-search" placeholder="Search project or owner…"></label><label class="usk-field"><span class="usk-label">Status</span><select class="usk-select" data-action="project-status"><option value="all">All statuses</option><option value="Active">Active</option><option value="Review">Review</option><option value="Complete">Complete</option></select></label></div>' +
    '<div class="example-table-wrap usk-table-wrap ly-overflow-auto" tabindex="0" role="region" aria-label="Projects"><table class="usk-table"><caption class="visually-hidden usk-visually-hidden">Project progress and owners</caption><thead><tr><th scope="col">Project</th><th scope="col">Owner</th><th scope="col">Status</th><th scope="col">Due</th></tr></thead><tbody>' +
    [
      ['Brand refresh', 'Alex Morgan', 'Active', 'Aug 24'],
      ['Customer portal', 'Sam Chen', 'Review', 'Aug 28'],
      ['Field guide', 'Jordan Rivera', 'Complete', 'Aug 19'],
      ['Launch campaign', 'Taylor Brooks', 'Active', 'Sep 02'],
    ]
      .map(
        ([name, owner, status, due]) =>
          '<tr data-record data-search="' +
          (name + ' ' + owner).toLowerCase() +
          '" data-status="' +
          status +
          '"><th scope="row">' +
          name +
          '</th><td>' +
          owner +
          '</td><td><span class="usk-badge" data-ui-variant="' +
          (status === 'Complete' ? 'success' : status === 'Review' ? 'warning' : 'primary') +
          '">' +
          status +
          '</span></td><td>' +
          due +
          '</td></tr>',
      )
      .join('') +
    '</tbody></table></div><p class="example-empty" data-project-empty hidden>No projects match. Try another search or status.</p>' +
    '<p class="example-notice usk-help-text" role="status" data-example-notice></p></section></div></div>'
  );
}

/** Renders a native validated form with a demonstrable local save lifecycle.
 * @returns {string} Form example.
 */
function form() {
  return (
    '<div data-ui-structure="neutral" class="example-app ly-wrapper ly-wrapper--content ly-section ly-section--compact ly-stack"><header class="example-topbar usk-toolbar ly-cluster ly-justify-between"><strong>Northstar</strong><span>Workspace settings</span><span class="usk-badge">Team account</span></header><div data-ui-structure="neutral" class="example-body example-form ly-stack">' +
    '<header class="example-heading ly-cluster ly-justify-between"><div><p class="example-eyebrow">Make it yours</p><h1>Your workspace.</h1><p>Clear controls, useful feedback, and room to focus.</p></div></header>' +
    '<form data-settings-form><section class="usk-card ly-stack example-form-fields" data-card-spacing="comfortable"><h2>Profile details</h2><p>Update the details your teammates see.</p>' +
    '<label class="usk-field"><span class="usk-label">Full name</span><input class="usk-input" name="name" autocomplete="name" required data-action="profile-name" placeholder="Alex Morgan"></label>' +
    '<label class="usk-field"><span class="usk-label">Email address</span><input class="usk-input" name="email" aria-describedby="profile-email-help" type="email" autocomplete="email" required data-action="profile-email" placeholder="alex@example.com"></label><small id="profile-email-help" class="usk-help-text">Use the address associated with your workspace.</small>' +
    '<label class="example-choice usk-check ly-cluster"><input type="checkbox" checked data-action="profile-notifications"><span class="usk-check-control" aria-hidden="true"></span><span>Send me a weekly project digest</span></label>' +
    '<div class="example-save-bar ly-cluster"><button class="usk-button interactive-surface" data-ui-variant="primary" data-surface-level="2" type="submit" data-save-button>Save changes</button><button class="usk-button" type="button" data-action="profile-reset">Reset form</button></div>' +
    '<p role="status" class="example-notice usk-help-text" data-form-message></p><small>Interactive sample · changes stay in this session.</small></section></form></div></div>'
  );
}

/** Renders a customer-facing page with locally selectable plans and feedback.
 * @returns {string} Content example.
 */
function content() {
  return (
    '<div data-ui-structure="neutral" class="example-app ly-wrapper ly-wrapper--content ly-section ly-section--compact ly-stack"><header class="example-topbar usk-toolbar ly-cluster ly-justify-between"><strong>Fieldwork</strong><nav aria-label="Sample page"><a href="#services">Services</a> <a href="#plans">Plans</a></nav><span class="usk-badge">Built for teams</span></header>' +
    '<div data-ui-structure="neutral" class="example-body ly-stack"><header class="example-content-hero ly-stack"><p class="example-eyebrow">Space for your next idea</p><h1>Less busywork.<br>More good work.</h1><p>A calmer place to plan, collaborate, and bring your team’s next project to life.</p><button class="usk-button" data-ui-variant="primary" data-action="content-start" type="button">Find your plan →</button><p class="example-caption usk-help-text">An illustrative customer page. No purchase or signup is submitted.</p></header>' +
    '<section id="services" class="example-features ly-grid"><article class="usk-card" data-card-spacing="normal"><span class="example-feature-number">01</span><h2>A clear plan</h2><p>Keep priorities, milestones, and next steps together.</p></article><article class="usk-card" data-card-spacing="normal"><span class="example-feature-number">02</span><h2>A connected team</h2><p>Make progress visible without another status meeting.</p></article><article class="usk-card" data-card-spacing="normal"><span class="example-feature-number">03</span><h2>A little momentum</h2><p>Turn useful feedback into your next good decision.</p></article></section>' +
    '<section class="usk-card" data-card-spacing="comfortable" id="plans"><p class="example-eyebrow">Choose your workspace</p><h2>A plan that fits.</h2><div class="example-plan-options ly-cluster" role="group" aria-label="Sample plan"><button class="usk-button" data-action="plan-solo" type="button" aria-pressed="false">Solo</button><button class="usk-button" data-action="plan-team" type="button" aria-pressed="true">Team</button></div><p data-plan-description>Shared projects and a little more room to grow.</p><button class="usk-button" data-ui-variant="primary" data-action="content-request" type="button">Request a sample invite</button><p role="status" class="example-notice usk-help-text" data-example-notice></p></section></div></div>'
  );
}

/** Selects one shared example, keeping content independent of appearance.
 * @param {string} name Example identifier.
 * @returns {string} Trusted example markup.
 */
export function renderExample(name) {
  return ({ dashboard, form, content }[name] ?? dashboard)();
}
