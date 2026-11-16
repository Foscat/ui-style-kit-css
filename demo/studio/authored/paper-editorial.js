/**
 * @module studio/authored/paper-editorial
 * @description Canonical paper-editorial specimen shared by Studio and reference consumers.
 */
import { escapeHtml } from '../html.js';
import { createLifetime } from '../lifetime.js';

/** Creates one explicit rendering/binding context without mutable module globals.
 * @param {Object} context Owned specimen configuration.
 * @returns {Object} Authored renderer and binder.
 */
function create(context) {
  const referencePalette = context.referencePalette;
  const selectReferencePalette = () => context.onAppearance({ theme: '' });
  /** Renders the eleven-folio field manual using public Paper Editorial components. */
  function renderPaperEditorialTemplateSpecimen(ui) {
    if (ui !== 'paper-editorial') return '';
    const icon = (name) =>
      `<span class="demo-pe-icon ly-cluster ly-items-center" aria-hidden="true">${context.icons[name] || ''}</span>`;
    const button = (label, variant = '', attrs = '') =>
      `<button type="button" class="paper-button ${variant ? `paper-button-${variant}` : ''}" ${attrs}>${label}</button>`;
    const field = (id, label, type = 'text', value = '', attrs = '') =>
      `<label class="paper-field" for="${id}"><span class="paper-label">${label}</span><input class="paper-input" id="${id}" type="${type}" value="${value}" ${attrs}></label>`;
    const heading = (n, title) => `<h3 class="paper-section-title"><b>${n}</b>${title}</h3>`;
    const panel = (n, name, title, content) =>
      `<section class="paper-folio-section demo-pe-${name}" id="paper-folio-${n}" data-component="${name}" data-folio="FOLIO ${String(n).padStart(2, '0')}">${heading(n, title)}${content}</section>`;
    const pages = [1, 2, 3, 4, 5]
      .map(
        (n) =>
          `<button type="button" ${n === 3 ? 'aria-current="page"' : ''} data-paper-page="${n}">${n}</button>`,
      )
      .join('');
    const badges = [
      ['primary', 'New'],
      ['success', 'Verified'],
      ['warning', 'Fact check'],
      ['danger', 'Restricted'],
      ['', 'Archived'],
    ]
      .map(
        ([kind, label]) =>
          `<span class="paper-badge ${kind ? `paper-badge-${kind}` : ''}">${label}</span>`,
      )
      .join('');
    const alerts = [
      ['', 'Information', 'New source attached.'],
      ['success', 'Verified', 'Story saved successfully.'],
      ['warning', 'Warning', 'Two citations need review.'],
      ['danger', 'Error', 'Headline is required.'],
    ]
      .map(
        ([kind, label, copy]) =>
          `<div class="paper-alert ${kind ? `paper-alert-${kind}` : ''}"><strong>${label}</strong><button type="button" data-paper-dismiss aria-label="Dismiss ${label}" title="Dismiss ${label}">${icon('x')}</button><p>${copy}</p></div>`,
      )
      .join('');
    const swatches = [
      ['primary', 'Oxblood'],
      ['accent', 'Press blue'],
      ['success', 'Forest'],
      ['warning', 'Ochre'],
      ['bg', 'Paper'],
      ['text', 'Ink'],
    ]
      .map(
        ([token, label]) =>
          `<div class="paper-swatch"><i style="background:var(--paper-${token})"></i><code>${label}</code></div>`,
      )
      .join('');
    const rows = [
      [
        '26-1187',
        '09/03/26',
        'City Contracts Under Review',
        'Invest.',
        'In review',
        'primary',
        '9:14 AM',
      ],
      ['26-1186', '09/03/26', 'Parks Maintenance Audit', 'Metro', 'Assigned', 'warning', '8:47 AM'],
      ['26-1185', '09/01/26', 'Transit Equity Report', 'Metro', 'Editing', '', '7:32 PM'],
      [
        '26-1184',
        '08/31/26',
        'Vendor No-Bid Contracts',
        'Invest.',
        'Published',
        'success',
        '6:05 PM',
      ],
    ];
    const dialogFields = `<div class="demo-pe-two ly-grid">${field('paper-record', 'Record ID', 'text', '26-1185')}${field('paper-action', 'Action', 'text', 'Revise')}</div><label class="paper-field" for="paper-reason"><span class="paper-label">Reason / notes</span><textarea class="paper-textarea" id="paper-reason">Clarify headline, update figures, and add source attribution.</textarea></label><div class="demo-pe-two ly-grid">${field('paper-author', 'Authorized by', 'text', 'A. Thompson')}${field('paper-signed', 'Date', 'text', 'Sep 03')}</div>`;
    return `<section id="paper-editorial-template" class="paper-sheet demo-paper-editorial-specimen ly-stack ly-gap-4" data-preset-only="paper-editorial" data-testid="paper-editorial-template-specimen" aria-label="Paper Editorial field manual">
    <div class="paper-binding" aria-hidden="true"><i></i><i></i><i></i><span>Pressroom reference / field manual / PM-FM-26A</span></div>
    <header class="paper-masthead demo-pe-masthead ly-grid ly-items-center"><div class="paper-manual-meta"><span class="paper-label">Manual no.</span><b>PM-FM-26A</b><p>REVISION &nbsp; C</p><span class="paper-label">Date</span><em>SEP 03 2026</em></div><div class="demo-pe-title"><p class="paper-kicker">Paper Editorial</p><h2 class="paper-masthead-title">Pressroom Field Manual</h2><p class="paper-caption">${escapeHtml(context.appearance.mode)} mode component reference</p></div><div class="paper-property-stamp">Property of<br>Reference library<br>Field office<strong>Document control</strong></div><div class="paper-edition-stamp">REVISED<b>SEP 03<br>2026</b><span>ED. C</span></div></header>
    <nav class="paper-section-index demo-pe-index ly-grid" aria-label="Field manual index">${['Navigation', 'Buttons', 'Inputs', 'Select', 'Checks', 'Slider', 'Progress', 'Feedback', 'Overlay', 'Table', 'Editorial'].map((label, i) => `<button type="button" data-paper-folio="${i + 1}" ${i === 0 ? 'class="is-active"' : ''}>${String(i + 1).padStart(2, '0')} ${label}</button>`).join('')}</nav>
    <div class="demo-pe-grid ly-grid">
    ${panel(1, 'navigation', 'Navigation, breadcrumbs, tabs & pagination', `<p class="paper-label">Primary navigation</p><nav class="paper-nav demo-pe-nav ly-cluster ly-justify-between" aria-label="Newsroom">${['Home', 'Editions', 'Desk', 'Reports', 'Archive', 'Settings'].map((name) => `<button type="button" class="paper-nav-link ${name === 'Desk' ? 'is-active' : ''}" data-paper-nav>${name}</button>`).join('')}</nav><p class="paper-label">Breadcrumb</p><nav class="paper-breadcrumb" aria-label="Story breadcrumb"><a href="#paper-folio-1">Home</a><span>Editions</span><span>City desk</span><span>Investigation / 26-1185</span></nav><p class="paper-label">Tabs</p><div class="paper-tabs" role="tablist" aria-label="Story views">${['Story', 'Notes', 'Sources 3', 'Files', 'Activity'].map((name, i) => `<button type="button" class="paper-tab" role="tab" id="paper-tab-${i}" aria-controls="paper-story-view" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join('')}</div><div id="paper-story-view" role="tabpanel" aria-labelledby="paper-tab-0" class="paper-help" tabindex="0">Story / City Contracts Under Review</div><p class="paper-label">Pagination</p><nav class="paper-pagination" aria-label="Record pages"><button type="button" data-paper-prev aria-label="Previous page" title="Previous page">${icon('chevron-left')}</button>${pages}<button type="button" data-paper-next aria-label="Next page" title="Next page">${icon('chevron-right')}</button></nav>`)}
    ${panel(
      2,
      'buttons',
      'Buttons & actions',
      `<div class="demo-pe-state-scroll ly-overflow-auto" tabindex="0"><div class="demo-pe-state-grid ly-grid">${['Default', 'Hover', 'Pressed', 'Disabled'].map((state) => `<span class="paper-label">${state}</span>`).join('')}${[
        ['primary', 'Authorize'],
        ['secondary', 'Revise'],
        ['danger', 'Reject'],
      ]
        .map(([variant, label]) =>
          ['', 'is-hovered', 'is-pressed', 'disabled']
            .map(
              (state) =>
                `<button type="button" class="paper-button paper-button-${variant} ${state === 'disabled' ? '' : state}" ${state === 'disabled' ? 'disabled' : 'data-paper-authorize'}>${label}</button>`,
            )
            .join(''),
        )
        .join(
          '',
        )}</div></div><hr class="paper-rule"><p class="paper-label">Compact actions</p><div class="demo-pe-row ly-cluster ly-items-center">${button(icon('search'), '', 'class="unused" data-paper-search aria-label="Search records" title="Search records"')}${button(icon('plus'), '', 'data-paper-new aria-label="New record" title="New record"')}<button type="button" class="paper-button paper-icon-button" data-paper-authorize aria-label="Record settings" title="Record settings">${icon('settings')}</button>${button('Edit', '', 'data-paper-authorize')}${button('Print', '', 'data-paper-print')}${button('Read proofs', 'primary', 'data-paper-authorize')}</div><div class="demo-pe-row demo-pe-small-gap ly-cluster ly-items-center"><button type="button" class="paper-button paper-button-loading" aria-busy="true">Checking</button>${button('Export CSV', 'text', 'data-paper-export')}</div>`,
    )}
    ${panel(3, 'inputs', 'Text input, search, upload & validation', `<div class="demo-pe-input-grid ly-grid"><div class="demo-pe-stack ly-stack">${field('paper-headline', 'Text input', 'text', '', 'maxlength="60" placeholder="Headline (60 characters max)"')}<label class="paper-field" for="paper-search"><span class="paper-label">Search</span><span class="paper-search"><span class="paper-input-icon">${icon('search')}</span><input class="paper-input" id="paper-search" type="search" placeholder="Search records, names, IDs..."></span></label><label class="paper-field" for="paper-summary"><span class="paper-label">Textarea</span><textarea class="paper-textarea" id="paper-summary" maxlength="300">Summary of the story. Include key facts and context for the newsroom.</textarea><span class="paper-help" id="paper-summary-count">71/300</span></label></div><div class="demo-pe-stack ly-stack"><span class="paper-label">File upload</span><label class="paper-file-upload" for="paper-upload">${icon('upload')}<strong>FILE</strong><span data-paper-filename>Drop file here or browse</span><small>PDF, DOCX, XLSX / 25 MB</small><input class="paper-file" id="paper-upload" type="file" accept=".pdf,.docx,.xlsx"></label>${field('paper-date', 'Date', 'date', '2026-09-03')}</div><div class="demo-pe-stack ly-stack">${field('paper-saved', 'Validation states', 'text', 'Saved.', 'readonly aria-label="Saved validation state"')}${field('paper-required', 'Required', 'text', '', 'aria-invalid="true" aria-describedby="paper-required-help" placeholder="Required."')}<span class="paper-help paper-help-error" id="paper-required-help">Headline is required.</span>${field('paper-disabled', 'Disabled', 'text', 'Disabled', 'disabled')}${field('paper-time', 'Time', 'time', '09:14')}</div></div>`)}
    ${panel(
      4,
      'selection',
      'Select & tokens',
      `<div class="demo-pe-two ly-grid"><div class="demo-pe-stack ly-stack"><label class="paper-field" for="paper-desk"><span class="paper-label">Native select</span><span class="paper-select-wrap"><select class="paper-select" id="paper-desk"><optgroup label="Newsroom desks"><option>Investigations Unit</option><option>Metro Desk</option><option>City Hall Bureau</option></optgroup><optgroup label="Features"><option>Opinion Desk</option><option>Arts & Culture</option></optgroup></select></span></label><p class="paper-label">Multi-select tokens / tags</p><div class="demo-pe-row ly-cluster ly-items-center" data-paper-tags>${['City Contracts', 'Transit Equity', 'FY 2026', 'Public Records'].map((tag) => `<span class="paper-chip">${tag}<button type="button" aria-label="Remove ${tag}" title="Remove ${tag}" data-paper-remove>${icon('x')}</button></span>`).join('')}</div><label class="paper-field" for="paper-add-tag"><span class="paper-label">Add tag</span><input class="paper-input" id="paper-add-tag" placeholder="Add tag..."></label></div><div class="demo-pe-stack ly-stack"><span class="paper-label">Checkbox</span>${[
        ['Checked', 'checked'],
        ['Unchecked', ''],
        ['Disabled', 'checked disabled'],
      ]
        .map(
          ([label, attrs]) =>
            `<label class="paper-check"><input type="checkbox" ${attrs}>${label}</label>`,
        )
        .join(
          '',
        )}<span class="paper-label">Radio</span>${['Morning', 'Evening'].map((label, i) => `<label class="paper-radio"><input type="radio" name="paper-edition" ${i === 0 ? 'checked' : ''}>${label}</label>`).join('')}</div></div>`,
    )}
    ${panel(
      5,
      'toggles',
      'Toggles & focus',
      `<div class="demo-pe-two ly-grid"><div class="demo-pe-stack ly-stack"><span class="paper-label">Switch</span>${[
        ['Live edition', 'checked'],
        ['Fact checked', ''],
        ['Locked', 'checked disabled'],
      ]
        .map(
          ([label, attrs]) =>
            `<label class="paper-switch"><input type="checkbox" role="switch" ${attrs}><span>${label}</span></label>`,
        )
        .join(
          '',
        )}</div><div class="demo-pe-stack ly-stack"><span class="paper-label">Focus states</span><label class="paper-check demo-pe-focus"><input type="checkbox" aria-label="Focus checkbox"></label><label class="paper-radio demo-pe-focus"><input type="radio" name="paper-focus" aria-label="Focus radio"></label>${button('Keyboard focus', 'secondary', 'data-paper-focus')}</div></div>`,
    )}
    ${panel(6, 'range', 'Range slider & measurement control', `<div class="demo-pe-range-grid ly-grid"><div><label class="paper-label" for="paper-measure">Measurement ruler</label><div class="demo-pe-scale ly-cluster ly-justify-between" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div><input class="paper-slider" id="paper-measure" type="range" min="0" max="100" value="68"><div class="paper-ruler" aria-hidden="true"></div><div class="demo-pe-row demo-pe-measure ly-cluster ly-items-center ly-justify-between"><span class="paper-label">Measurement (mm)</span><output class="paper-metric-value" id="paper-measure-output" for="paper-measure">68</output><span class="paper-help">mm</span></div></div><div class="demo-pe-stack ly-stack"><span class="paper-label">Secondary ranges</span><label class="paper-label" for="paper-opacity">Opacity</label><input class="paper-slider" id="paper-opacity" type="range" value="35"><label class="paper-label" for="paper-column">Column width</label><input class="paper-slider" id="paper-column" type="range" value="75"><span class="paper-footnote">Measurement units: millimeters</span></div></div>`)}
    ${panel(7, 'progress', 'Progress, meters & workflow', `<div class="demo-pe-two ly-grid"><label class="paper-field"><span class="paper-label">Continuous bar / 68%</span><progress class="paper-progress" value="68" max="100" aria-label="Editorial completion">68%</progress></label><label class="paper-field"><span class="paper-label">Threshold meter</span><meter class="paper-meter" min="0" max="100" low="40" high="70" optimum="20" value="65" aria-label="Citation review threshold">65%</meter></label></div><p class="paper-label">Editorial workflow</p><div class="paper-stage-track ly-cluster" aria-label="Editorial workflow">${['Report', 'Review', 'Edit', 'Authorize', 'Publish'].map((name, i) => `<span class="paper-stage ${i === 1 ? 'is-active' : ''}" ${i === 1 ? 'aria-current="step"' : ''}>${i + 1}<br>${name}</span>`).join('')}</div><div class="demo-pe-row demo-pe-loading ly-cluster ly-items-center"><span class="paper-label">Loading / indeterminate</span><span class="paper-spinner" role="status" aria-label="Checking citations"></span><span class="paper-help">Checking citations...</span></div>`)}
    ${panel(8, 'feedback', 'Badges, alerts, tooltips & loading', `<div class="demo-pe-row ly-cluster ly-items-center">${badges}</div><div class="demo-pe-alert-grid ly-grid">${alerts}</div><div class="demo-pe-two ly-grid"><div class="demo-pe-stack ly-stack" aria-hidden="true"><div class="paper-skeleton"></div><div class="paper-skeleton demo-pe-skeleton-short"></div></div><div class="paper-tooltip" role="tooltip">Helpful context appears here.</div></div>`)}
    ${panel(9, 'overlays', 'Dialog, empty state & style legend', `<div class="paper-dialog demo-pe-dialog-preview" role="group" aria-label="Revision authorization form"><header><h4>Revision authorization</h4><span class="paper-badge paper-badge-danger">Requires signature</span></header><div class="paper-dialog-body demo-pe-stack ly-stack">${dialogFields}</div><footer>${button('Cancel', '', 'data-paper-reset')}${button('Submit', 'primary', 'data-paper-authorize')}</footer></div><p class="paper-label">Empty state</p><div class="paper-empty-state">No archived proofs for this edition.</div><hr class="paper-rule"><p class="paper-label">Spot-ink palette</p><div class="demo-pe-swatches ly-grid">${swatches}</div><div class="paper-metric demo-pe-row ly-cluster ly-items-center"><span class="paper-metric-label">Typography</span><span class="paper-metric-value">H1</span><span class="paper-help">Display / Serif / Sans / Mono</span></div><details class="paper-details"><summary>Document notes</summary><div class="paper-popover">Reference copy / City Desk / revision C.</div></details>`)}
    ${panel(10, 'records', 'Data table / dense records', `<div class="paper-table-wrap" tabindex="0"><table class="paper-table"><caption class="paper-caption">City desk records</caption><thead><tr>${['ID', 'Date', 'Headline', 'Desk', 'Status', 'Updated'].map((name) => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${rows.map(([id, date, headline, desk, status, kind, time]) => `<tr><td>${id}</td><td>${date}</td><td>${headline}</td><td>${desk}</td><td><span class="paper-badge ${kind ? `paper-badge-${kind}` : ''}">${status}</span></td><td>${time}</td></tr>`).join('')}</tbody></table></div><div class="demo-pe-row demo-pe-record-footer ly-cluster ly-items-center ly-justify-between"><span class="paper-footnote" data-paper-record-count>Showing 1 to 4 of 128 entries</span>${button('Export CSV', 'text', 'data-paper-export')}</div>`)}
    ${panel(11, 'editorial', 'Editorial voice & composition', `<div class="demo-pe-two ly-grid"><article><p class="paper-kicker">Investigations</p><p class="paper-article-deck">Public records reveal a city system caught between policy and practice.</p><p class="paper-byline">By A. Thompson / City Desk</p><p class="paper-dropcap">Documents tell a story in margins, corrections and patient lines of type. Editorial controls should feel composed, not mechanical.</p><p class="paper-footnote">1. City budget records, fiscal year 2026.</p></article><aside><blockquote class="paper-pullquote">&ldquo;Clarity earns<br>the reader's trust.&rdquo;<cite>Copy Desk Manual</cite></blockquote><p class="paper-marginalia">Margin note: confirm figures, names and source attribution.</p><div class="paper-segmented" aria-label="Edition format">${['Print', 'Digital'].map((label, i) => `<button type="button" aria-pressed="${i === 0}">${label}</button>`).join('')}</div></aside></div>`)}
    </div><hr class="paper-rule paper-rule-double"><footer class="demo-pe-footer ly-cluster ly-items-center ly-justify-between"><span class="paper-folio">Print method: risograph 2-3 color / uncoated paper stock</span><span class="paper-footnote" role="status" data-paper-feedback>Designed for newsrooms, journals & archives</span><button type="button" class="paper-button paper-button-text" data-paper-reference aria-label="Use reference palette" title="Use reference palette" aria-pressed="${referencePalette}">Rev C / ${escapeHtml(context.appearance.mode)}</button></footer>
    <dialog class="paper-dialog" aria-labelledby="paper-confirm-title"><header><h3 id="paper-confirm-title">Revision authorization</h3></header><div class="paper-dialog-body"><p>Confirm this sample revision for record 26-1185?</p><p class="paper-help">This preview does not submit records to a newsroom.</p></div><footer>${button('Cancel', '', 'data-paper-cancel')}${button('Authorize', 'primary', 'data-paper-confirm')}</footer></dialog>
  </section>`;
  }

  /** Binds scoped, keyboard-accessible sample interactions without external data writes. */
  function bindPaperEditorialSpecimen() {
    const root = context.byId('paper-editorial-template');
    if (!root) return;
    const report = (message) => {
      root.querySelector('[data-paper-feedback]').textContent = message;
    };
    root.querySelectorAll('.paper-slider').forEach((input) => {
      const paint = () => input.style.setProperty('--paper-slider-value', `${input.value}%`);
      paint();
      context.listen(input, 'input', paint);
    });
    context.listen(root.querySelector('[data-paper-reference]'), 'click', selectReferencePalette);
    context.listen(root.querySelector('#paper-measure'), 'input', (event) => {
      root.querySelector('#paper-measure-output').value = event.target.value;
    });
    root.querySelectorAll('[data-paper-dismiss]').forEach((button) =>
      context.listen(button, 'click', () => {
        button.closest('.paper-alert').hidden = true;
      }),
    );
    context.listen(root.querySelector('[data-paper-tags]'), 'click', (event) => {
      event.target.closest('[data-paper-remove]')?.closest('.paper-chip').remove();
    });
    context.listen(root.querySelector('#paper-add-tag'), 'keydown', (event) => {
      if (event.key !== 'Enter' || !event.target.value.trim()) return;
      event.preventDefault();
      const label = event.target.value.trim();
      const chip = context.document.createElement('span');
      chip.className = 'paper-chip';
      chip.textContent = label;
      const remove = context.document.createElement('button');
      remove.type = 'button';
      remove.dataset.paperRemove = '';
      remove.setAttribute('aria-label', `Remove ${label}`);
      remove.title = `Remove ${label}`;
      remove.textContent = '\u00d7';
      chip.append(remove);
      root.querySelector('[data-paper-tags]').append(chip);
      event.target.value = '';
    });
    root.querySelectorAll('.paper-tabs, .paper-segmented').forEach((group) => {
      const tabs = [...group.querySelectorAll('button')];
      const attribute = group.matches('.paper-tabs') ? 'aria-selected' : 'aria-pressed';
      const activate = (button) => {
        tabs.forEach((tab) => {
          tab.setAttribute(attribute, String(tab === button));
          tab.tabIndex = tab === button ? 0 : -1;
        });
        if (attribute === 'aria-selected') {
          const panel = root.querySelector('#paper-story-view');
          panel.setAttribute('aria-labelledby', button.id);
          panel.textContent = `${button.textContent} / City Contracts Under Review`;
        }
      };
      context.listen(group, 'click', (event) => {
        const button = event.target.closest('button');
        if (button) activate(button);
      });
      context.listen(group, 'keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = tabs.indexOf(context.document.activeElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
    root.querySelectorAll('[data-paper-nav]').forEach((button) =>
      context.listen(button, 'click', () => {
        root
          .querySelectorAll('[data-paper-nav]')
          .forEach((item) => item.classList.toggle('is-active', item === button));
        report(`${button.textContent} desk selected`);
      }),
    );
    root.querySelectorAll('[data-paper-folio]').forEach((button) =>
      context.listen(button, 'click', () => {
        root
          .querySelectorAll('[data-paper-folio]')
          .forEach((item) => item.classList.toggle('is-active', item === button));
        root
          .querySelector(`#paper-folio-${button.dataset.paperFolio}`)
          .scrollIntoView({ block: 'start' });
      }),
    );
    context.listen(root.querySelector('.paper-pagination'), 'click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const current = Number(root.querySelector("[aria-current='page']").dataset.paperPage);
      const next = Math.max(
        1,
        Math.min(
          5,
          Number(button.dataset.paperPage) ||
            current + (button.hasAttribute('data-paper-next') ? 1 : -1),
        ),
      );
      root.querySelectorAll('[data-paper-page]').forEach((item) => {
        if (Number(item.dataset.paperPage) === next) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
      report(`Record page ${next} selected`);
    });
    const dialog = root.querySelector('dialog');
    let opener;
    root.querySelectorAll('[data-paper-authorize]').forEach((button) =>
      context.listen(button, 'click', () => {
        opener = button;
        dialog.showModal();
      }),
    );
    context.listen(root.querySelector('[data-paper-cancel]'), 'click', () => dialog.close());
    context.listen(root.querySelector('[data-paper-confirm]'), 'click', () => {
      dialog.close();
      report('Sample revision authorized locally.');
    });
    context.listen(dialog, 'close', () => opener?.focus());
    context.listen(root.querySelector('[data-paper-focus]'), 'click', () =>
      root.querySelector('.demo-pe-focus input').focus(),
    );
    context.listen(root.querySelector('[data-paper-search]'), 'click', () =>
      root.querySelector('#paper-search').focus(),
    );
    context.listen(root.querySelector('[data-paper-new]'), 'click', () => {
      root.querySelector('#paper-headline').value = '';
      root.querySelector('#paper-headline').focus();
    });
    context.listen(root.querySelector('[data-paper-print]'), 'click', () => window.print());
    context.listen(root.querySelector('[data-paper-reset]'), 'click', () => {
      root
        .querySelectorAll('.demo-pe-dialog-preview input, .demo-pe-dialog-preview textarea')
        .forEach((input) => {
          input.value = input.defaultValue;
        });
      report('Revision draft reset.');
    });
    context.listen(root.querySelector('#paper-upload'), 'change', (event) => {
      const file = event.target.files[0];
      root.querySelector('[data-paper-filename]').textContent = file
        ? file.name
        : 'Drop file here or browse';
      report(file ? `${file.name} selected locally; not uploaded.` : 'No file selected.');
    });
    context.listen(root.querySelector('#paper-summary'), 'input', (event) => {
      root.querySelector('#paper-summary-count').textContent = `${event.target.value.length}/300`;
    });
    context.listen(root.querySelector('#paper-search'), 'input', (event) => {
      const query = event.target.value.toLowerCase();
      const rows = [...root.querySelectorAll('.paper-table tbody tr')];
      rows.forEach((row) => {
        row.hidden = !row.textContent.toLowerCase().includes(query);
      });
      root.querySelector('[data-paper-record-count]').textContent =
        `${rows.filter((row) => !row.hidden).length} sample records shown`;
    });
    root.querySelectorAll('[data-paper-export]').forEach((button) =>
      context.listen(button, 'click', () => {
        const csv = [...root.querySelectorAll('.paper-table tr')]
          .filter((row) => !row.hidden)
          .map((row) =>
            [...row.cells]
              .map((cell) => `"${cell.textContent.trim().replaceAll('"', '""')}"`)
              .join(','),
          )
          .join('\r\n');
        const url = context.objectUrl(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = context.document.createElement('a');
        link.href = url;
        link.download = 'paper-editorial-sample.csv';
        link.click();
        context.later(() => URL.revokeObjectURL(url), 1000);
        report('Sample records exported.');
      }),
    );
  }
  return { render: renderPaperEditorialTemplateSpecimen, bind: bindPaperEditorialSpecimen };
}

/** Renders the original specimen without depending on host form controls.
 * @param {Object} context Owned appearance, assets and palette configuration.
 * @returns {string} Trusted authored markup.
 */
export function render(context) {
  if (context.appearance.ui !== 'paper-editorial') return '';
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
  window.StudioAuthored['paper-editorial'] = { render, bind };
}
