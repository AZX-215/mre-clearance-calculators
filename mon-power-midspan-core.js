(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MonPowerMidspan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_CALCULATORS = 8;
  const fields = ['label', 'feetA', 'inchesA', 'feetB', 'inchesB', 'span', 'existingFeet', 'existingInches'];
  const blank = (value) => String(value ?? '').trim() === '';

  function decimal(value, name) {
    const text = String(value ?? '').trim();
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) || !Number.isFinite(Number(text))) {
      throw new Error(`${name}: enter a valid positive number.`);
    }
    return Number(text);
  }

  function height(feet, inches, name) {
    if (blank(feet) && blank(inches)) return null;
    const ft = blank(feet) ? 0 : decimal(feet, name);
    const inch = blank(inches) ? 0 : decimal(inches, name);
    if (!Number.isSafeInteger(ft)) throw new Error(`${name}: feet must be a whole number.`);
    if (inch >= 12) throw new Error(`${name}: inches must be less than 12.`);
    const total = ft * 12 + inch;
    if (total <= 0 || total > Number.MAX_SAFE_INTEGER / 4) {
      throw new Error(`${name}: enter a height greater than zero.`);
    }
    return total;
  }

  // Spreadsheet ROUND(x, 0) for nonnegative inches, including fractional input.
  function roundInches(value) {
    return Math.floor(value + 0.5 + Number.EPSILON * Math.max(1, value) * 4);
  }

  function calculate(state) {
    if (state.method === 'existing-comms') {
      const existing = height(state.existingFeet, state.existingInches, 'Existing comm height');
      if (existing === null) return null;
      return { method: state.method, finalInches: roundInches(existing + 4), offsetInches: 4 };
    }
    if (state.method !== 'no-comms') throw new Error('Select a calculation method.');
    const a = height(state.feetA, state.inchesA, 'SCID A height');
    const b = height(state.feetB, state.inchesB, 'SCID B height');
    let spanFeet = null;
    let enteredSpan = null;
    if (!blank(state.span)) {
      enteredSpan = decimal(state.span, 'Span length');
      spanFeet = Math.ceil(enteredSpan);
      if (enteredSpan <= 0 || !Number.isSafeInteger(spanFeet)) {
        throw new Error('Span length must be greater than zero.');
      }
    }
    if (a === null || b === null || spanFeet === null) return null;
    const averageInches = roundInches((a + b) / 2);
    const rate = spanFeet < 300 ? 0.005 : 0.01;
    const sagInches = spanFeet * rate * 12;
    const finalRaw = averageInches - sagInches;
    if (finalRaw < 0) throw new Error('Calculated height is below ground. Check heights and span length.');
    return {
      method: state.method, averageInches, rate, sagInches, spanFeet,
      spanRounded: spanFeet !== enteredSpan, finalInches: roundInches(finalRaw),
    };
  }

  function formatHeight(inches) {
    if (!Number.isSafeInteger(inches) || inches < 0) throw new Error('Invalid height result.');
    return `${Math.floor(inches / 12)}\u2032 ${inches % 12}\u2033`;
  }

  function normalizeSavedState(saved) {
    const count = saved && Number.isInteger(saved.count) && saved.count >= 1 && saved.count <= MAX_CALCULATORS
      ? saved.count : 2;
    const calculators = Array.from({ length: MAX_CALCULATORS }, (_, i) => {
      const candidate = saved && Array.isArray(saved.calculators) ? saved.calculators[i] : null;
      const result = { method: candidate?.method === 'existing-comms' ? 'existing-comms' : 'no-comms' };
      for (const field of fields) {
        const value = candidate?.[field];
        result[field] = typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))
          ? String(value).slice(0, field === 'label' ? 80 : 24) : '';
      }
      return result;
    });
    return { count, calculators };
  }

  return { MAX_CALCULATORS, calculate, formatHeight, normalizeSavedState };
});
