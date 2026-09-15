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

  function getReferences(state) {
    if (!state) return [];
    if (state.locked && Number.isFinite(state.lockedValue)) return [];
    const refs = [state.sourceA];
    if (state.operation !== 'convert') refs.push(state.sourceB);
    return refs
      .filter((value) => value && value !== 'manual')
      .map(Number)
      .filter(Number.isInteger);
  }

  function wouldCreateCycle(states, calculatorNumber, candidateSourceNumber) {
    const target = Number(calculatorNumber);
    const start = Number(candidateSourceNumber);
    if (!Number.isInteger(target) || !Number.isInteger(start)) return false;
    if (target === start) return true;

    const visited = new Set();
    function reachesTarget(calcNumber) {
      if (calcNumber === target) return true;
      if (visited.has(calcNumber)) return false;
      visited.add(calcNumber);
      const state = states[calcNumber - 1];
      return getReferences(state).some(reachesTarget);
    }
    return reachesTarget(start);
  }

  function evaluateCalculator(states, calculatorNumber, visiting) {
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
      return evaluateCalculator(states, sourceNumber, active);
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

  function createDefaultState() {
    return {
      feetA: '',
      inchA: '',
      sourceA: 'manual',
      feetB: '',
      inchB: '',
      factor: '',
      sourceB: 'manual',
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
    resultInchesToFactor,
    wouldCreateCycle,
    evaluateCalculator,
    createDefaultStates,
  };
});
