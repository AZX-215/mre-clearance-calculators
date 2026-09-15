(function () {
  'use strict';

  const MAX_CALCULATORS = 8;
  const STORAGE_KEY = 'feet-inches-calculator-state-v2';
  const core = window.FeetInchesCore;
  const $ = (id) => document.getElementById(id);
  const operations = new Set(['convert', 'add', 'subtract', 'multiply', 'divide']);

  if (!core) throw new Error('Calculator core failed to load.');

  function sourceOptions(n) {
    let options = '<option value="manual">Manual entry</option>';
    for (let i = 1; i <= MAX_CALCULATORS; i += 1) {
      if (i === n) continue;
      options += `<option value="${i}">Calculator ${i} result</option>`;
    }
    return options;
  }

  function calcMarkup(n) {
    return `
      <article class="calculator" data-calc="${n}" id="calculator${n}">
        <div class="calc-header">
          <h2>Calculator ${n}</h2>
          <button class="lock-button" id="lock${n}" type="button" aria-pressed="false">Lock result</button>
        </div>
        <div class="content">
          <section class="step">
            <h3 class="step-title">Measurement A</h3>
            <div class="source-row">
              <label for="sourceA${n}">Source</label>
              <select id="sourceA${n}">${sourceOptions(n)}</select>
            </div>
            <div class="field-pair" id="manualA${n}">
              <div>
                <label for="feetA${n}">Feet</label>
                <input id="feetA${n}" inputmode="decimal" placeholder="0" autocomplete="off" />
              </div>
              <div>
                <label for="inchA${n}">Inches</label>
                <input id="inchA${n}" inputmode="decimal" placeholder="0" autocomplete="off" />
              </div>
            </div>
            <div class="linked-value hidden" id="linkedA${n}"></div>
          </section>

          <section class="operation-box">
            <label for="op${n}">Operation</label>
            <select id="op${n}">
              <option value="convert">Convert A only</option>
              <option value="add">+ Add</option>
              <option value="subtract">− Subtract</option>
              <option value="multiply">× Multiply</option>
              <option value="divide">÷ Divide</option>
            </select>
          </section>

          <section class="step" id="operandB${n}">
            <h3 class="step-title" id="operandBTitle${n}">Measurement B</h3>
            <div class="source-row">
              <label for="sourceB${n}">Source</label>
              <select id="sourceB${n}">${sourceOptions(n)}</select>
            </div>
            <div class="field-pair" id="manualB${n}">
              <div>
                <label for="feetB${n}">Feet</label>
                <input id="feetB${n}" inputmode="decimal" placeholder="0" autocomplete="off" />
              </div>
              <div>
                <label for="inchB${n}">Inches</label>
                <input id="inchB${n}" inputmode="decimal" placeholder="0" autocomplete="off" />
              </div>
            </div>
            <div class="single-field hidden" id="factorWrap${n}">
              <div>
                <label for="factor${n}">Factor</label>
                <input id="factor${n}" inputmode="decimal" placeholder="Example: 1.5" autocomplete="off" />
              </div>
            </div>
            <div class="linked-value hidden" id="linkedB${n}"></div>
          </section>

          <div class="buttons">
            <button id="calc${n}" type="button">Calculate</button>
            <button class="secondary" id="clear${n}" type="button">Clear</button>
          </div>

          <section class="result" id="resultBox${n}" aria-live="polite">
            <div class="result-top">
              <span class="result-label">Result</span>
              <span class="status-badge" id="status${n}">Live</span>
            </div>
            <div class="big" id="mainResult${n}">0 ft 0 in</div>
            <div class="result-details" id="details${n}">
              <div class="metric"><span class="metric-label">Decimal feet</span><span class="metric-value" id="decimalFeet${n}">0</span></div>
              <div class="metric"><span class="metric-label">Total inches</span><span class="metric-value" id="totalInches${n}">0</span></div>
            </div>
          </section>
        </div>
      </article>`;
  }

  $('calculatorGrid').innerHTML = Array.from({ length: MAX_CALCULATORS }, (_, index) => calcMarkup(index + 1)).join('');

  function normalizeState(raw, fallback) {
    const next = { ...fallback };
    if (!raw || typeof raw !== 'object') return next;
    ['feetA', 'inchA', 'feetB', 'inchB', 'factor'].forEach((key) => {
      if (typeof raw[key] === 'string' || typeof raw[key] === 'number') next[key] = String(raw[key]);
    });
    ['sourceA', 'sourceB'].forEach((key) => {
      const value = String(raw[key] ?? 'manual');
      next[key] = value === 'manual' || (/^[1-8]$/.test(value)) ? value : 'manual';
    });
    if (operations.has(raw.operation)) next.operation = raw.operation;
    next.locked = raw.locked === true;
    next.lockedValue = Number.isFinite(raw.lockedValue) ? raw.lockedValue : null;
    if (next.locked && next.lockedValue === null) next.locked = false;
    return next;
  }

  function loadSaved() {
    const defaults = core.createDefaultStates(MAX_CALCULATORS);
    let count = 2;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        count = Math.max(1, Math.min(MAX_CALCULATORS, Number(saved.count) || 2));
        if (Array.isArray(saved.calculators)) {
          for (let i = 0; i < MAX_CALCULATORS; i += 1) defaults[i] = normalizeState(saved.calculators[i], defaults[i]);
        }
      }
    } catch (error) {
      count = 2;
    }
    return { count, states: defaults };
  }

  const saved = loadSaved();
  let calculatorCount = saved.count;
  let states = saved.states;

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: calculatorCount, calculators: states }));
    } catch (error) {
      // The calculator still works if storage is unavailable.
    }
  }

  function setCalculatorCount(value) {
    calculatorCount = Math.max(1, Math.min(MAX_CALCULATORS, Number(value) || 2));
    document.body.dataset.count = String(calculatorCount);
    $('calcCount').value = String(calculatorCount);
    for (let i = 1; i <= MAX_CALCULATORS; i += 1) $('calculator' + i).classList.toggle('hidden', i > calculatorCount);
    persist();
  }

  function refreshSourceOptions() {
    for (let n = 1; n <= MAX_CALCULATORS; n += 1) {
      ['A', 'B'].forEach((which) => {
        const select = $('source' + which + n);
        const selected = states[n - 1]['source' + which];
        Array.from(select.options).forEach((option) => {
          if (option.value === 'manual') {
            option.disabled = false;
            return;
          }
          const candidate = Number(option.value);
          option.disabled = candidate === n || core.wouldCreateCycle(states, n, candidate);
        });
        select.value = selected;
        if (select.value !== selected) {
          states[n - 1]['source' + which] = 'manual';
          select.value = 'manual';
        }
      });
    }
  }

  function syncInputsFromState(n) {
    const state = states[n - 1];
    $('feetA' + n).value = state.feetA;
    $('inchA' + n).value = state.inchA;
    $('feetB' + n).value = state.feetB;
    $('inchB' + n).value = state.inchB;
    $('factor' + n).value = state.factor;
    $('sourceA' + n).value = state.sourceA;
    $('sourceB' + n).value = state.sourceB;
    $('op' + n).value = state.operation;
  }

  function getLinkedResult(source) {
    if (!source || source === 'manual') return null;
    const sourceNumber = Number(source);
    try {
      return { number: sourceNumber, value: core.evaluateCalculator(states, sourceNumber), error: '' };
    } catch (error) {
      return { number: sourceNumber, value: null, error: error.message };
    }
  }

  function updateCardLayout(n) {
    const state = states[n - 1];
    const isMeasureOperation = state.operation === 'add' || state.operation === 'subtract';
    const isFactorOperation = state.operation === 'multiply' || state.operation === 'divide';
    const hasB = state.operation !== 'convert';

    $('operandB' + n).classList.toggle('hidden', !hasB);
    $('operandBTitle' + n).textContent = isFactorOperation ? 'Factor' : 'Measurement B';

    const linkedA = state.sourceA !== 'manual';
    $('manualA' + n).classList.toggle('hidden', linkedA);
    $('linkedA' + n).classList.toggle('hidden', !linkedA);

    const linkedB = state.sourceB !== 'manual';
    $('manualB' + n).classList.toggle('hidden', !isMeasureOperation || linkedB);
    $('factorWrap' + n).classList.toggle('hidden', !isFactorOperation || linkedB);
    $('linkedB' + n).classList.toggle('hidden', !hasB || !linkedB);

    if (linkedA) {
      const linked = getLinkedResult(state.sourceA);
      $('linkedA' + n).classList.toggle('error', Boolean(linked.error));
      $('linkedA' + n).textContent = linked.error
        ? `Calculator ${linked.number}: ${linked.error}`
        : `Calculator ${linked.number}: ${core.formatFeetInches(linked.value)}`;
    }

    if (hasB && linkedB) {
      const linked = getLinkedResult(state.sourceB);
      $('linkedB' + n).classList.toggle('error', Boolean(linked.error));
      if (linked.error) {
        $('linkedB' + n).textContent = `Calculator ${linked.number}: ${linked.error}`;
      } else if (isFactorOperation) {
        $('linkedB' + n).textContent = `Calculator ${linked.number}: ${core.trimNumber(core.resultInchesToFactor(linked.value))}`;
      } else {
        $('linkedB' + n).textContent = `Calculator ${linked.number}: ${core.formatFeetInches(linked.value)}`;
      }
    }

    $('calculator' + n).classList.toggle('locked', state.locked);
    $('lock' + n).classList.toggle('is-locked', state.locked);
    $('lock' + n).textContent = state.locked ? 'Unlock result' : 'Lock result';
    $('lock' + n).setAttribute('aria-pressed', state.locked ? 'true' : 'false');
  }

  function renderResult(n) {
    const state = states[n - 1];
    const main = $('mainResult' + n);
    const details = $('details' + n);
    const resultBox = $('resultBox' + n);
    const status = $('status' + n);

    resultBox.classList.toggle('is-locked', state.locked);
    status.classList.toggle('locked', state.locked);
    status.textContent = state.locked ? 'Locked' : 'Live';

    if (state.error) {
      main.className = 'big error';
      main.textContent = state.error;
      details.classList.add('hidden');
      return;
    }

    main.className = 'big';
    main.textContent = core.formatFeetInches(state.result);
    details.classList.remove('hidden');
    $('decimalFeet' + n).textContent = core.trimNumber(state.result / 12);
    $('totalInches' + n).textContent = core.trimNumber(state.result);
  }

  function recalculateAll() {
    for (let n = 1; n <= MAX_CALCULATORS; n += 1) {
      const state = states[n - 1];
      try {
        state.result = core.evaluateCalculator(states, n);
        state.error = '';
      } catch (error) {
        state.error = error.message;
      }
    }
    refreshSourceOptions();
    for (let n = 1; n <= MAX_CALCULATORS; n += 1) {
      updateCardLayout(n);
      renderResult(n);
    }
    persist();
  }

  function updateTextField(n, key, value) {
    states[n - 1][key] = value;
    recalculateAll();
  }

  function updateSource(n, key, value) {
    const previous = states[n - 1][key];
    if (value !== 'manual' && core.wouldCreateCycle(states, n, Number(value))) {
      $('source' + key.slice(-1) + n).value = previous;
      states[n - 1].error = 'That link would create a circular calculator reference.';
      renderResult(n);
      return;
    }
    states[n - 1][key] = value;
    recalculateAll();
  }

  function clearCalculator(n) {
    states[n - 1] = core.createDefaultStates(1)[0];
    syncInputsFromState(n);
    recalculateAll();
  }

  function toggleLock(n) {
    const state = states[n - 1];
    if (state.locked) {
      state.locked = false;
      state.lockedValue = null;
      recalculateAll();
      return;
    }

    try {
      const value = core.evaluateCalculator(states, n);
      state.locked = true;
      state.lockedValue = value;
      state.result = value;
      state.error = '';
      recalculateAll();
    } catch (error) {
      state.error = error.message;
      renderResult(n);
    }
  }

  function bindCalculator(n) {
    ['feetA', 'inchA', 'feetB', 'inchB', 'factor'].forEach((key) => {
      $(key + n).addEventListener('input', (event) => updateTextField(n, key, event.target.value));
    });
    $('sourceA' + n).addEventListener('change', (event) => updateSource(n, 'sourceA', event.target.value));
    $('sourceB' + n).addEventListener('change', (event) => updateSource(n, 'sourceB', event.target.value));
    $('op' + n).addEventListener('change', (event) => {
      states[n - 1].operation = event.target.value;
      recalculateAll();
    });
    $('calc' + n).addEventListener('click', recalculateAll);
    $('clear' + n).addEventListener('click', () => clearCalculator(n));
    $('lock' + n).addEventListener('click', () => toggleLock(n));
  }

  for (let n = 1; n <= MAX_CALCULATORS; n += 1) {
    syncInputsFromState(n);
    bindCalculator(n);
  }

  $('calcCount').addEventListener('change', (event) => setCalculatorCount(event.target.value));
  $('clearAll').addEventListener('click', () => {
    states = core.createDefaultStates(MAX_CALCULATORS);
    for (let n = 1; n <= MAX_CALCULATORS; n += 1) syncInputsFromState(n);
    recalculateAll();
  });

  setCalculatorCount(calculatorCount);
  recalculateAll();
})();
