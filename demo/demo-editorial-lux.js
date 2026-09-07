/**
 * Reference-backed Editorial Lux specimen with local-only interaction state.
 * @namespace EditorialLuxSpecimen
 */
window.EditorialLuxSpecimen = (() => {
  const portrait = new URL('./assets/editorial-portrait.png', document.currentScript.src).href;
  /** @param {string} name Licensed Lucide icon name. @returns {string} Decorative icon markup. */
  const icon = (name) => `<span aria-hidden="true" class="demo-el-icon">${window.UI_STYLE_KIT_ICONS[name === 'circle-alert' ? 'circle-x' : name] || ''}</span>`;
  /** @param {string} text Authored copy. @param {string} variant Public variant. @param {string} attrs Authored attributes. @returns {string} Button markup. */
  const button = (text, variant = 'secondary', attrs = '') => `<button type="button" class="luxe-button luxe-button-${variant}" ${attrs}>${text}</button>`;
  /** @param {number} n Reference group number. @param {string} name Group title. @param {string} body Authored content. @returns {string} Ruled group. */
  const group = (n, name, body) => `${n === 5 ? '<!--demo-style-feature-->' : ''}<section class="demo-el-group" id="luxe-group-${n}" data-component="${n}"><h3 class="luxe-section-title"><span class="luxe-section-number">${String(n).padStart(2, '0')}.</span>${name}</h3>${body}</section>${n === 5 ? '<!--/demo-style-feature-->' : ''}`;
  /** @param {string} type Native type. @param {string} label Accessible label. @param {string} value Sample value. @param {string} attrs Authored state. @returns {string} Labeled field. */
  const field = (type, label, value, attrs = '') => `<label class="demo-el-field"><span class="luxe-label">${label}</span><input class="luxe-input" type="${type}" value="${value}" ${attrs}></label>`;
  /** @param {string} type Native choice. @param {string} label Visible copy. @param {string} attrs Authored state. @returns {string} Choice markup. */
  const choice = (type, label, attrs = '') => {
    const name = type === 'radio' ? 'radio' : 'check';
    return `<label class="luxe-${name}"><input type="${type}" ${attrs}><span class="luxe-${name}-control" aria-hidden="true"></span><span>${label}</span></label>`;
  };

/**
 * Renders the complete reference surface only for the active legacy preset ID.
 * @param {string} ui Active preset ID.
 * @param {string} mode Active color mode.
 * @param {boolean} reference Whether fallback reference colors are selected.
 * @returns {string} Specimen HTML, or empty markup for other presets.
 */
function render(ui, mode, reference) {
  if (ui !== 'editorial-luxe') return '';
  const safeMode = ['dark', 'light', 'contrast'].includes(mode) ? mode : 'light';
  const tabs = ['Overview', 'Details', 'Notes', 'History'];
  const looks = ['01', '02', '03', '12', '15'];
  return `<section id="editorial-lux-template" class="luxe-sheet demo-editorial-lux-specimen" data-preset-only="editorial-luxe" data-testid="editorial-lux-template-specimen" aria-label="Editorial Lux UI Element System">
    <header class="luxe-masthead"><div><h2 class="luxe-masthead-title">Editorial Lux</h2><p class="luxe-kicker">Couture culture & contemporary life / UI element system</p></div><nav class="demo-el-top-nav" aria-label="Editorial Lux sections"><a href="#luxe-group-1">Components</a><a href="#luxe-group-2">Forms</a><a href="#luxe-group-8">Data</a><a href="#luxe-foundations">Tokens</a></nav><div class="demo-el-issue">Issue No. 01<br>System / Reference 2026<br>${button(safeMode, 'ghost', `data-luxe-reference aria-label="Use reference palette" aria-pressed="${reference}" title="Use reference palette"`)}</div></header>
    <div class="demo-el-upper"><div class="demo-el-editorial">
      <aside class="luxe-collection-rail"><h3>Collections</h3><nav aria-label="Collections"><ol>${['Editorials','Couture','Culture','Interviews','Archive','Lookbook'].map((name, i) => `<li><button type="button" data-luxe-collection ${i === 1 ? 'aria-current="true"' : ''}>${name}</button></li>`).join('')}</ol></nav><div class="demo-el-current"><span class="luxe-label">Current selection</span><p data-luxe-current>The Silence of Drapes<br>Look 12 / 34</p></div><div class="demo-el-rail-actions">${['View lookbook','Share','Add to collection','Download'].map((name) => `<button type="button" data-luxe-action="${name}">${name}</button>`).join('')}</div></aside>
      <div class="luxe-portrait"><img src="${portrait}" alt="Couture portrait with sculptural ivory drapery in an architectural interior" width="388" height="434"></div>
      <article class="luxe-story"><h3 class="luxe-story-title">The<br>Silence<br>of<br>Drapes</h3><p class="luxe-byline">Words by Aline Moreau</p><p class="luxe-deck">In the hush between gesture and fabric, meaning is formed. A study in restraint and intention, where couture speaks through absence.</p><a class="demo-el-read" href="#luxe-editorial-copy">Read the editorial ${icon('arrow-right')}</a></article>
    </div><div class="demo-el-forms">
      ${group(1, 'Buttons', `<div class="demo-el-matrix"><span></span>${['Primary','Secondary','Outline','Destructive'].map((name) => `<span class="luxe-label">${name}</span>`).join('')}${['Default','Pressed','Disabled'].map((state) => `<span class="luxe-label">${state}</span>${[['View look','primary'],['Discover','secondary'],['Learn more','ghost'],['Remove','danger']].map(([name, variant]) => button(name, variant, `${state === 'Disabled' ? 'disabled' : state === 'Pressed' ? 'data-luxe-pressed' : ''} ${variant === 'danger' ? 'data-luxe-open' : `data-luxe-action="${name}"`}`)).join('')}`).join('')}</div>`)}
      ${group(2, 'Inputs', `<div class="demo-el-input-row">${field('text','Text','Maison Editorial','data-luxe-valid')}${field('password','Password','archive')}${field('search','Search','','placeholder="Search the archive" data-luxe-search')}</div><div class="demo-el-input-lower"><label class="demo-el-field"><span class="luxe-label">Textarea</span><textarea class="luxe-textarea" rows="6" placeholder="Notes on silhouette, movement, and the language of couture..."></textarea></label><div class="demo-el-field"><span class="luxe-label">File upload</span><label class="luxe-file-upload"><input type="file" aria-label="Upload editorial file"><span class="luxe-file-drop">${icon('paperclip')}<span data-luxe-filename>Drop file here<br>or browse</span></span></label></div><div class="demo-el-field"><span class="luxe-label">Selects</span>${['Collection','Season','Designer','Look'].map((name) => `<select class="luxe-select" aria-label="${name}" ${name === 'Look' ? 'data-luxe-look' : ''}><option value="">${name}</option>${(name === 'Look' ? looks.map((look) => `Look ${look}`) : [name === 'Season' ? 'SS26' : name === 'Designer' ? 'A. Demarais' : 'Couture', 'Archive']).map((item) => `<option>${item}</option>`).join('')}</select>`).join('')}</div><div class="luxe-select-panel" role="listbox" aria-label="Look selection">${looks.map((look) => `<button type="button" class="luxe-option" role="option" aria-selected="${look === '12'}" tabindex="${look === '12' ? 0 : -1}">Look ${look}</button>`).join('')}</div></div>`)}
    </div></div>
    <div class="demo-el-middle">
      ${group(3, 'Selection controls', `<div class="demo-el-choices"><div><p class="luxe-label">Checkbox</p>${choice('checkbox','Unchecked')}${choice('checkbox','Checked','checked')}${choice('checkbox','Disabled','disabled')}</div><div><p class="luxe-label">Radio</p>${choice('radio','Option one','name="luxe-edition"')}${choice('radio','Option two','name="luxe-edition" checked')}${choice('radio','Disabled radio','name="luxe-edition" disabled')}</div><div><p class="luxe-label">Toggle</p><label class="luxe-switch-segment"><input type="checkbox" role="switch" checked aria-label="Editorial notifications"><span>Off</span><span>On</span></label></div></div>`)}
      ${group(4, 'Range sliders', [['volume','Volume',72,0,100],['zoom','Zoom',3,1,5],['rating','Rating',78,0,100]].map(([id,name,value,min,max]) => `<div class="demo-el-range"><label class="luxe-label" for="luxe-${id}">${name}</label><div><input class="luxe-range" type="range" id="luxe-${id}" min="${min}" max="${max}" value="${value}"><div class="luxe-range-scale"><span>${min}</span><output id="luxe-${id}-output" for="luxe-${id}">${value}</output><span>${max}</span></div></div></div>`).join(''))}
      ${group(5, 'Progress & meters', `<div class="demo-el-stack"><span class="luxe-label">Continuous progress</span><div class="demo-el-progress"><div class="luxe-progress" role="progressbar" aria-label="Continuous progress" aria-valuenow="68" aria-valuemin="0" aria-valuemax="100"><span class="luxe-progress-bar" style="width:68%"></span></div><span>68%</span></div><span class="luxe-label">Segmented progress</span><div class="luxe-segmented-progress" role="progressbar" aria-label="Segmented progress" aria-valuenow="2" aria-valuemin="0" aria-valuemax="4"><i class="is-done"></i><i class="is-done"></i><i></i><i></i></div><span class="luxe-label">Threshold meter</span><div class="luxe-meter" role="meter" aria-label="Threshold meter" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" aria-valuetext="80, high"></div></div>`)}
      ${group(6, 'Alerts', `<div class="demo-el-stack">${[['success','Success','Look added to your collection.','check'],['warning','Warning','Some changes may not be saved.','triangle-alert'],['danger','Error','Unable to complete the request.','circle-alert']].map(([variant,name,text,glyph]) => `<div class="luxe-alert luxe-alert-${variant}"><span class="luxe-alert-mark">${icon(glyph)}</span><div><strong>${name}</strong>${text}</div><button type="button" class="luxe-alert-close" aria-label="Dismiss ${name}" title="Dismiss ${name}" data-luxe-dismiss>${icon('x')}</button></div>`).join('')}</div>`)}
    </div>
    <div class="demo-el-lower">
      ${group(7, 'Tabs', `<div class="luxe-tabs"><div class="luxe-tab-list" role="tablist" aria-label="Editorial views">${tabs.map((name,i) => `<button type="button" class="luxe-tab" role="tab" id="luxe-tab-${i}" aria-controls="luxe-tab-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${name}</button>`).join('')}</div><div class="luxe-tab-panel" id="luxe-tab-panel" role="tabpanel" tabindex="0" aria-labelledby="luxe-tab-0">A considered system of form and fabric, each element curated for expression, and each detail speaking in the language of the house.</div></div>`)}
      ${group(8, 'Table', `<div class="luxe-table-wrap"><table class="luxe-table"><caption class="luxe-sr-only">Editorial archive</caption><thead><tr>${['Look','Designer','Season','Date'].map((name) => `<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${['A. Demarais','L. Roche','M. Lefevre','E. Moreau'].map((name,i) => `<tr><td>Look ${String(12-i).padStart(2,'0')}</td><td>${name}</td><td>SS26</td><td>05 / ${i < 2 ? '12' : '11'} / 26</td></tr>`).join('')}</tbody></table></div><p class="luxe-empty-state" data-luxe-empty hidden>No matching looks.</p>`)}
      ${group(9, 'Badges, pagination & stepper', `<div class="demo-el-badges"><span class="luxe-badge-medallion">New</span><span class="luxe-badge-medallion luxe-badge-brass">Saved</span><span class="luxe-badge-medallion luxe-badge-danger">Hold</span></div><nav class="luxe-pagination" aria-label="Editorial pages"><button type="button" aria-label="Previous page">${icon('chevron-left')}</button>${[1,2,3,4].map((n) => `<button type="button" ${n === 2 ? 'aria-current="page"' : ''}>${n}</button>`).join('')}<button type="button" aria-label="Next page">${icon('chevron-right')}</button></nav><div class="luxe-stepper"><button type="button" data-luxe-decrease aria-label="Decrease quantity">${icon('minus')}</button><output id="luxe-quantity" aria-live="polite" aria-label="Quantity">12</output><button type="button" data-luxe-increase aria-label="Increase quantity">${icon('plus')}</button></div>`)}
      ${group(10, 'Tooltip, loading & dialog', `<div class="demo-el-feedback"><div class="luxe-tooltip" role="tooltip" id="luxe-tooltip">Archive items are preserved as originally published.</div><div class="luxe-skeleton" role="status" aria-label="Loading article"><i></i><i></i></div></div><div class="luxe-dialog" role="group" aria-label="Removal confirmation preview"><strong class="luxe-label">Remove Look 12?</strong><p>This action cannot be undone.</p><div class="luxe-dialog-actions">${button('Cancel','secondary','data-luxe-action="Removal cancelled"')}${button('Remove','danger','data-luxe-open aria-describedby="luxe-tooltip"')}</div></div>`)}
    </div>
    <footer class="luxe-colophon"><span>Editorial Lux / Paris / New York</span><em>For those who preserve beauty, shape culture, and dress the world.</em><span>Editorial Lux 2026</span></footer>
    <details class="luxe-details" id="luxe-foundations"><summary>Native fields & foundations</summary><div class="demo-el-supplement">${field('number','Look number','12')}${field('date','Date','2026-05-12')}${field('time','Time','10:30')}${field('text','Required headline','','aria-invalid="true" aria-describedby="luxe-error"')}<span class="luxe-help-error" id="luxe-error">Enter a headline.</span>${button('Loading','primary','aria-busy="true" aria-disabled="true" tabindex="-1"')}<span class="luxe-spinner" role="status" aria-label="Loading preview"></span><label class="demo-el-field"><span class="luxe-label">Native file</span><input class="luxe-input" type="file"></label><label class="demo-el-field"><span class="luxe-label">Native progress</span><progress value="68" max="100" aria-label="Native progress">68%</progress></label><label class="demo-el-field"><span class="luxe-label">Native meter</span><meter min="0" max="100" value="64" aria-label="Native meter">64%</meter></label></div><div class="demo-el-swatches">${['surface','text','primary','danger','brass','text-muted'].map((name) => `<span><i style="background:var(--luxe-${name})" aria-hidden="true"></i>${name}</span>`).join('')}</div><details class="luxe-details"><summary>Table density guidance</summary><p>Look 12 / SS26 / four archive records</p></details></details>
    <details class="luxe-details" id="luxe-editorial-copy"><summary>The Silence of Drapes</summary><p class="luxe-deck">In the hush between gesture and fabric, meaning is formed. A study in restraint and intention, where couture speaks through absence.</p></details>
    <p class="demo-el-status" role="status" data-luxe-status>Look 12 selected.</p>
    <dialog class="luxe-dialog" aria-labelledby="luxe-dialog-title"><h3 id="luxe-dialog-title">Remove Look 12?</h3><p>This changes the local preview only.</p><div class="luxe-dialog-actions">${button('Cancel','secondary','data-luxe-cancel')}${button('Remove','danger','data-luxe-confirm')}</div></dialog>
  </section>`;
}

/**
 * Binds accessible controls without sending data or changing persistent storage.
 * @param {Function} useReference Host callback for the fallback palette.
 * @returns {void}
 */
function bind(useReference) {
  const root = document.getElementById('editorial-lux-template');
  if (!root) return;
  const report = (text) => { root.querySelector('[data-luxe-status]').textContent = text; };
  const tableRegion = root.querySelector('.luxe-table-wrap');
  tableRegion.tabIndex = 0;
  tableRegion.setAttribute('role', 'region');
  tableRegion.setAttribute('aria-label', 'Editorial archive table');
  root.querySelector('[data-luxe-reference]').addEventListener('click', useReference);
  root.querySelectorAll('[data-luxe-pressed]').forEach((node) => node.classList.add('is-pressed'));
  root.querySelector('[data-luxe-valid]').classList.add('luxe-input-valid');
  root.querySelectorAll('[data-luxe-action]').forEach((node) => node.addEventListener('click', () => {
    const action = node.dataset.luxeAction;
    report(`${action}: local preview updated.`);
    root.querySelector('[data-luxe-current]').textContent = action === 'View lookbook' ? 'Lookbook opened / Look 12 of 34' : 'The Silence of Drapes / Look 12 of 34';
  }));
  root.querySelectorAll('[data-luxe-collection]').forEach((node) => node.addEventListener('click', () => {
    root.querySelectorAll('[data-luxe-collection]').forEach((item) => item.removeAttribute('aria-current'));
    node.setAttribute('aria-current', 'true');
    report(`${node.textContent} collection selected.`);
  }));
  const dialog = root.querySelector('dialog');
  let opener;
  root.querySelectorAll('[data-luxe-open]').forEach((node) => node.addEventListener('click', () => { opener = node; dialog.showModal(); }));
  root.querySelector('[data-luxe-cancel]').addEventListener('click', () => dialog.close());
  root.querySelector('[data-luxe-confirm]').addEventListener('click', () => { dialog.close(); report('Look 12 removed from the local selection.'); });
  dialog.addEventListener('close', () => opener?.focus());
  root.querySelectorAll('[data-luxe-dismiss]').forEach((node) => node.addEventListener('click', () => {
    const next = node.closest('.luxe-alert').nextElementSibling?.querySelector('button');
    node.closest('.luxe-alert').hidden = true;
    (next || root.querySelector('.luxe-tab')).focus();
    report('Notification dismissed.');
  }));
  const tabCopy = ['A considered system of form and fabric, each element curated for expression, and each detail speaking in the language of the house.', 'SS26 / Look 12 / A. Demarais', 'Archive notes: The Silence of Drapes.', 'Last revised: May 12, 2026.'];
  const tabs = [...root.querySelectorAll('.luxe-tab')];
  const activateTab = (node) => {
    tabs.forEach((item) => { item.setAttribute('aria-selected', String(item === node)); item.tabIndex = item === node ? 0 : -1; });
    const panel = root.querySelector('.luxe-tab-panel');
    panel.setAttribute('aria-labelledby', node.id);
    panel.textContent = tabCopy[tabs.indexOf(node)];
  };
  tabs.forEach((node, i) => {
    node.addEventListener('click', () => activateTab(node));
    node.addEventListener('keydown', (event) => {
      const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); activateTab(tabs[next]); tabs[next].focus();
    });
  });
  const options = [...root.querySelectorAll('.luxe-option')];
  const select = root.querySelector('[data-luxe-look]');
  const choose = (node) => {
    options.forEach((item) => { item.setAttribute('aria-selected', String(item === node)); item.tabIndex = item === node ? 0 : -1; });
    select.value = node.textContent;
    report(`${node.textContent} selected.`);
  };
  options.forEach((node, i) => {
    node.addEventListener('click', () => choose(node));
    node.addEventListener('keydown', (event) => {
      const next = event.key === 'ArrowDown' ? Math.min(i + 1, options.length - 1) : event.key === 'ArrowUp' ? Math.max(0, i - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); choose(options[next]); options[next].focus();
    });
  });
  select.addEventListener('change', () => { const node = options.find((item) => item.textContent === select.value); if (node) choose(node); });
  select.value = 'Look 12';
  root.querySelectorAll('.luxe-range').forEach((node) => node.addEventListener('input', () => { root.querySelector(`#${node.id}-output`).value = node.value; }));
  const quantity = root.querySelector('#luxe-quantity');
  const down = root.querySelector('[data-luxe-decrease]');
  const up = root.querySelector('[data-luxe-increase]');
  [down, up].forEach((node) => node.addEventListener('click', () => {
    quantity.value = String(Math.max(1, Math.min(99, Number(quantity.value) + (node === up ? 1 : -1))));
    down.disabled = quantity.value === '1'; up.disabled = quantity.value === '99';
  }));
  const pages = [...root.querySelectorAll('.luxe-pagination button')];
  let current = 2;
  pages.forEach((node, i) => node.addEventListener('click', () => {
    current = Math.max(1, Math.min(4, i === 0 ? current - 1 : i === 5 ? current + 1 : i));
    pages.forEach((item, n) => { item.removeAttribute('aria-current'); if (n === current) item.setAttribute('aria-current', 'page'); });
    pages[0].disabled = current === 1; pages[5].disabled = current === 4;
    report(`Archive page ${current} selected.`);
  }));
  const file = root.querySelector('.luxe-file-upload input');
  file.addEventListener('change', () => { root.querySelector('[data-luxe-filename]').textContent = file.files[0]?.name || 'Drop file here or browse'; });
  root.querySelector('[data-luxe-search]').addEventListener('input', (event) => {
    let visible = 0;
    root.querySelectorAll('.luxe-table tbody tr').forEach((row) => { row.hidden = !row.textContent.toLowerCase().includes(event.target.value.toLowerCase()); if (!row.hidden) visible += 1; });
    root.querySelector('[data-luxe-empty]').hidden = visible > 0;
    report(`${visible} matching archive records.`);
  });
  root.querySelectorAll('a[href="#luxe-editorial-copy"], a[href="#luxe-foundations"]').forEach((node) => node.addEventListener('click', () => { root.querySelector(node.getAttribute('href')).open = true; }));
}

return { render, bind };
})();
