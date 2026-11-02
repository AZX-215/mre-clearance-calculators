(function () {
  'use strict';
  const core = window.MonPowerMidspan;
  const STORAGE_KEY = 'mon-power-midspan-state-v1';
  const grid = document.getElementById('calculatorGrid');
  const count = document.getElementById('calcCount');
  const notice = document.getElementById('storageNotice');
  const exportStatus = document.getElementById('exportStatus');
  let state;
  try {
    state = core.normalizeSavedState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch (_) {
    state = core.normalizeSavedState(null);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      notice.hidden = true;
    } catch (_) {
      notice.textContent = 'Browser saving is unavailable. Keep this page open to retain your inputs.';
      notice.hidden = false;
    }
  }

  function measurement(n, title, prefix, feetField, inchesField) {
    return `<fieldset><legend>${title}</legend><div class="pair">
      <div><label for="${prefix}Feet${n}">Feet (\u2032)</label><input id="${prefix}Feet${n}" data-field="${feetField}" type="text" inputmode="numeric" maxlength="24" autocomplete="off" /></div>
      <div><label for="${prefix}Inches${n}">Inches (\u2033)</label><input id="${prefix}Inches${n}" data-field="${inchesField}" type="text" inputmode="decimal" maxlength="24" autocomplete="off" /></div>
    </div></fieldset>`;
  }

  function buildCard(n) {
    const card = document.createElement('article');
    card.className = 'calculator';
    card.dataset.index = String(n - 1);
    card.setAttribute('aria-labelledby', `heading${n}`);
    card.innerHTML = `<div class="calc-header"><h2 id="heading${n}">Calculator ${n}</h2><button type="button" data-action="clear" aria-label="Clear calculator ${n}">Clear</button></div>
      <div class="content">
        <div class="field"><label for="spanLabel${n}">Span / SCIDs (optional)</label><input id="spanLabel${n}" data-field="label" maxlength="80" type="text" autocomplete="off" /></div>
        <div class="field"><label for="method${n}">Calculation method</label><select id="method${n}" data-field="method">
          <option value="no-comms">No existing comms</option><option value="existing-comms">Existing comm below</option>
        </select></div>
        <div class="method-inputs" data-section="no-comms">
          ${measurement(n, 'SCID A proposed comm height', 'a', 'feetA', 'inchesA')}
          ${measurement(n, 'SCID B proposed comm height', 'b', 'feetB', 'inchesB')}
          <div class="field"><label for="spanLength${n}">Span length (\u2032)</label><input id="spanLength${n}" data-field="span" type="text" inputmode="decimal" maxlength="24" autocomplete="off" aria-describedby="spanHint${n}" /><p class="hint" id="spanHint${n}">Fractional feet round up.</p></div>
          <p class="hint">0.5% sag below 300\u2032; 1% at 300\u2032 and above. Neutral sag and elevation are not included.</p>
        </div>
        <div class="method-inputs" data-section="existing-comms" hidden>
          ${measurement(n, 'Existing comm midspan height', 'existing', 'existingFeet', 'existingInches')}
          <p class="hint">Proposed height = existing comm height + 4\u2033.</p>
        </div>
        <p class="error" id="error${n}" role="status" hidden></p>
        <div class="result empty" aria-live="polite" aria-atomic="true">
          <span class="result-title">Proposed midspan height after ice load</span>
          <output class="result-value" id="result${n}" aria-label="Calculator ${n} proposed midspan height">\u2014</output>
          <dl class="result-details" hidden>
            <div><dt>Average attach height</dt><dd data-result="average"></dd></div>
            <div><dt>Sag allowance</dt><dd data-result="sag"></dd></div>
            <div><dt>Span used</dt><dd data-result="span"></dd></div>
          </dl>
          <button class="copy" type="button" data-action="copy" disabled>Copy height</button>
        </div>
      </div>`;
    return card;
  }

  function fill(card) {
    const values = state.calculators[Number(card.dataset.index)];
    for (const control of card.querySelectorAll('[data-field]')) control.value = values[control.dataset.field];
  }

  function update(card) {
    const values = state.calculators[Number(card.dataset.index)];
    const noComms = values.method === 'no-comms';
    for (const section of card.querySelectorAll('[data-section]')) section.hidden = section.dataset.section !== values.method;
    card.querySelector('.result-title').textContent = noComms ? 'Proposed midspan height after ice load' : 'Proposed midspan height';
    const output = card.querySelector('output');
    const error = card.querySelector('.error');
    const details = card.querySelector('.result-details');
    const copy = card.querySelector('[data-action="copy"]');
    copy.disabled = true;
    copy.textContent = 'Copy height';
    output.textContent = '\u2014';
    output.removeAttribute('data-height');
    details.hidden = true;
    error.hidden = true;
    card.querySelector('.result').classList.add('empty');
    try {
      const result = core.calculate(values);
      if (!result) return;
      const height = core.formatHeight(result.finalInches);
      output.textContent = height;
      output.dataset.height = height;
      copy.disabled = false;
      card.querySelector('.result').classList.remove('empty');
      if (noComms) {
        details.hidden = false;
        card.querySelector('[data-result="average"]').textContent = core.formatHeight(result.averageInches);
        const sag = Number(result.sagInches.toFixed(4));
        card.querySelector('[data-result="sag"]').textContent = `${sag}\u2033 (${result.rate * 100}%)`;
        card.querySelector('[data-result="span"]').textContent = `${result.spanFeet}\u2032${result.spanRounded ? ' (rounded up)' : ''}`;
      }
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    }
  }

  function showCount() {
    while (grid.children.length < state.count) {
      const card = buildCard(grid.children.length + 1);
      grid.appendChild(card);
      fill(card);
      update(card);
    }
    document.body.dataset.count = String(state.count);
    count.value = String(state.count);
    for (const card of grid.children) card.hidden = Number(card.dataset.index) >= state.count;
  }

  showCount();

  function onEdit(event) {
    const control = event.target;
    if (!control.dataset.field) return;
    const card = control.closest('.calculator');
    state.calculators[Number(card.dataset.index)][control.dataset.field] = control.value;
    exportStatus.hidden = true;
    update(card);
    save();
  }
  grid.addEventListener('input', onEdit);
  grid.addEventListener('change', onEdit);
  count.addEventListener('change', () => {
    state.count = core.normalizeSavedState({ count: Number(count.value) }).count;
    showCount();
    save();
  });
  document.getElementById('clearAll').addEventListener('click', () => {
    exportStatus.hidden = true;
    state.calculators = core.normalizeSavedState(null).calculators;
    for (const card of grid.children) { fill(card); update(card); }
    save();
  });
  document.getElementById('exportMarkdown').addEventListener('click', () => {
    const result = core.exportMarkdown(state);
    exportStatus.hidden = false;
    if (!result.completedCount) {
      exportStatus.textContent = 'Complete at least one calculation before exporting.';
      return;
    }
    let url;
    let link;
    try {
      const blob = new Blob([result.markdown], { type: 'text/markdown;charset=utf-8' });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = 'Mon_Power_Proposed_Midspan_Calculations.md';
      document.body.appendChild(link);
      link.click();
      exportStatus.textContent = `Exported ${result.completedCount} calculation${result.completedCount === 1 ? '' : 's'}.${result.skippedCount ? ` Skipped ${result.skippedCount} incomplete or invalid calculator${result.skippedCount === 1 ? '' : 's'}.` : ''}`;
    } catch (_) {
      exportStatus.textContent = 'The file could not be downloaded. Please try exporting again.';
    } finally {
      if (link) link.remove();
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  grid.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const card = button.closest('.calculator');
    if (button.dataset.action === 'clear') {
      exportStatus.hidden = true;
      state.calculators[Number(card.dataset.index)] = core.normalizeSavedState(null).calculators[0];
      fill(card);
      update(card);
      save();
    } else if (button.dataset.action === 'copy') {
      const height = card.querySelector('output').dataset.height;
      if (!height) return;
      try {
        await navigator.clipboard.writeText(height);
        button.textContent = 'Copied';
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(card.querySelector('output'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Selected \u2014 press Ctrl/Cmd+C';
      }
    }
  });
})();
