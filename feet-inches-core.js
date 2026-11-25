(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FeetInchesCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function parseDecimal(value) {
    const text = String(value ?? '').trim();
    if (text === '') return 0;
    const number = Number(text);
    if (!Number.isFinite(number)) throw new Error('Enter a valid decimal number.');
    return number;
  }

  function measurementToInches(feet, inches) {
    return parseDecimal(feet) * 12 + parseDecimal(inches);
  }

  function trimNumber(value, maxDecimals = 6) {
    if (!Number.isFinite(value)) return '';
    if (Math.abs(value) < 0.5 * Math.pow(10, -maxDecimals)) value = 0;
    return value.toFixed(maxDecimals).replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatFeetInches(totalInches) {
    if (!Number.isFinite(totalInches)) throw new Error('Result is not a finite number.');
    const sign = totalInches < 0 ? '-' : '';
    let absolute = Math.abs(totalInches);
    let feet = Math.floor(absolute / 12);
    let inches = absolute - feet * 12;
    inches = Number(trimNumber(inches));
    if (inches >= 12) {
      feet += 1;
      inches = 0;
    }
    return `${sign}${feet} ft ${trimNumber(inches)} in`;
  }

  function calculateOperation(operation, aInches, bOrFactor) {
    if (!Number.isFinite(aInches) || !Number.isFinite(bOrFactor)) {
      throw new Error('Enter valid decimal values.');
    }
    switch (operation) {
      case 'convert': return aInches;
      case 'add': return aInches + bOrFactor;
      case 'subtract': return aInches - bOrFactor;
      case 'multiply': return aInches * bOrFactor;
      case 'divide':
        if (bOrFactor === 0) throw new Error('Cannot divide by zero.');
        return aInches / bOrFactor;
      default: throw new Error('Unknown operation.');
    }
  }

  function resultInchesToFactor(totalInches) {
    if (!Number.isFinite(totalInches)) throw new Error('Linked result is invalid.');
    return totalInches / 12;
  }

  function evaluateLegacyLink(states, calculatorNumber, visiting) {
    const calcNumber = Number(calculatorNumber);
    const state = states[calcNumber - 1];
    if (!state) throw new Error('Calculator source is unavailable.');

    if (state.locked && Number.isFinite(state.lockedValue)) return state.lockedValue;

    const active = visiting || new Set();
    if (active.has(calcNumber)) throw new Error('Circular calculator reference detected.');
    active.add(calcNumber);

    function linkedValue(source) {
      const sourceNumber = Number(source);
      if (!Number.isInteger(sourceNumber) || sourceNumber < 1 || sourceNumber > states.length) {
        throw new Error('Linked calculator source is unavailable.');
      }
      return evaluateLegacyLink(states, sourceNumber, active);
    }

    try {
      const a = state.sourceA && state.sourceA !== 'manual'
        ? linkedValue(state.sourceA)
        : measurementToInches(state.feetA, state.inchA);

      let second = 0;
      if (state.operation === 'add' || state.operation === 'subtract') {
        second = state.sourceB && state.sourceB !== 'manual'
          ? linkedValue(state.sourceB)
          : measurementToInches(state.feetB, state.inchB);
      } else if (state.operation === 'multiply' || state.operation === 'divide') {
        second = state.sourceB && state.sourceB !== 'manual'
          ? resultInchesToFactor(linkedValue(state.sourceB))
          : parseDecimal(state.factor);
      }

      return calculateOperation(state.operation, a, second);
    } finally {
      active.delete(calcNumber);
    }
  }

  // Legacy links are evaluated only while migrating old saved inputs.
  function migrateLinkedInputs(rawStates) {
    let converted = 0, cleared = 0;
    const calculators = rawStates.map((raw, i) => {
      if (!raw || typeof raw !== 'object') return raw;
      const next = { ...raw };
      for (const which of ['A', 'B']) {
        const source = raw['source' + which];
        if (source && source !== 'manual') {
          const isFactor = which === 'B' && ['multiply', 'divide'].includes(raw.operation);
          // A hidden B operand has no active source value; do not replace its saved manual values.
          if (which === 'B' && raw.operation === 'convert') continue;
          try {
            const value = evaluateLegacyLink(rawStates, Number(source));
            if (!Number.isFinite(value)) throw new Error('Invalid linked result');
            if (isFactor) next.factor = String(value / 12);
            else { next['feet' + which] = ''; next['inch' + which] = String(value); }
            converted += 1;
          } catch (_) {
            if (isFactor) next.factor = '';
            else { next['feet' + which] = ''; next['inch' + which] = ''; }
            // Block a misleading zero result until the missing input is reviewed.
            if (isFactor) next.factor = 'Re-enter value';
            else next['inch' + which] = 'Re-enter value';
            cleared += 1;
          }
        }
      }
      delete next.sourceA;
      delete next.sourceB;
      return next;
    });
    return { calculators, converted, cleared };
  }

  function evaluateCalculator(states, calculatorNumber) {
    const state = states[Number(calculatorNumber) - 1];
    if (!state) throw new Error('Calculator is unavailable.');
    if (state.locked && Number.isFinite(state.lockedValue)) return state.lockedValue;
    const a = measurementToInches(state.feetA, state.inchA);
    let second = 0;
    if (state.operation === 'add' || state.operation === 'subtract') second = measurementToInches(state.feetB, state.inchB);
    else if (state.operation === 'multiply' || state.operation === 'divide') second = parseDecimal(state.factor);
    return calculateOperation(state.operation, a, second);
  }

  function createDefaultState() {
    return {
      feetA: '',
      inchA: '',
      feetB: '',
      inchB: '',
      factor: '',
      operation: 'convert',
      locked: false,
      lockedValue: null,
      result: 0,
      error: '',
    };
  }

  function createDefaultStates(count) {
    return Array.from({ length: count }, createDefaultState);
  }

  return {
    parseDecimal,
    measurementToInches,
    trimNumber,
    formatFeetInches,
    calculateOperation,
    migrateLinkedInputs,
    evaluateCalculator,
    createDefaultStates,
  };
});
