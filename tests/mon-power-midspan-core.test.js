const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, formatHeight, normalizeSavedState } = require('../mon-power-midspan-core.js');

const input = (feetA, inchesA, feetB, inchesB, span) => ({
  method: 'no-comms', feetA, inchesA, feetB, inchesB, span,
});

test('matches the supplied template and all six populated job rows, including intermediate rounding', () => {
  // TEMPLATE D/F cached results, rows 3–9 of the supplied job workbook.
  const rows = [
    [10, 0, 20, 0, 250, 180, 165],
    [30, 0, 22, 4, 174, 314, 304],
    [30, 0, 24, 10, 203, 329, 317],
    [27, 6, 19, 0, 265, 279, 263],
    [19, 10, 19, 2, 402, 234, 186],
    [19, 2, 20, 11, 212, 241, 228],
    [23, 1, 33, 8, 499, 341, 281],
  ];
  for (const [a, ai, b, bi, span, average, final] of rows) {
    const result = calculate(input(a, ai, b, bi, span));
    assert.equal(result.averageInches, average);
    assert.equal(result.finalInches, final);
  }
});

test('switches from 0.5% to 1% at exactly 300 feet', () => {
  const below = calculate(input(20, 0, 20, 0, 299));
  const at = calculate(input(20, 0, 20, 0, 300));
  const above = calculate(input(20, 0, 20, 0, 301));
  assert.equal(below.rate, 0.005);
  assert.equal(below.finalInches, 222);
  assert.equal(at.rate, 0.01);
  assert.equal(at.finalInches, 204);
  assert.equal(above.rate, 0.01);
});

test('rounds the average before subtracting sag and rounds final half-inches away from zero', () => {
  assert.equal(calculate(input(20, 0, 20, 1, 25)).finalInches, 240);
  assert.equal(calculate(input(20, 0, 20, 0, 25)).finalInches, 239);
  assert.equal(calculate(input(20, 0.25, 20, 0.75, 100)).averageInches, 241);
});

test('rounds fractional spans up before the threshold decision and exposes the used length', () => {
  const result = calculate(input(20, 0, 20, 0, '299.1'));
  assert.equal(result.spanFeet, 300);
  assert.equal(result.spanRounded, true);
  assert.equal(result.rate, 0.01);
});

test('existing comm method adds four inches with no percentage sag or endpoint dependency', () => {
  const result = calculate({ method: 'existing-comms', existingFeet: '18', existingInches: '10', span: 'bad' });
  assert.equal(result.finalInches, 230);
  assert.equal(result.offsetInches, 4);
  assert.equal(result.rate, undefined);
  assert.equal(formatHeight(result.finalInches), '19\u2032 2\u2033');
});

test('blank or incomplete inputs return no result, while explicit zero inches are allowed', () => {
  assert.equal(calculate({ method: 'no-comms' }), null);
  assert.equal(calculate(input(20, '', '', '', 100)), null);
  assert.equal(calculate(input(20, '', 21, '', 100)).finalInches, 240);
  assert.equal(calculate({ method: 'existing-comms' }), null);
});

test('rejects invalid heights, lengths, methods and impossible negative results', () => {
  for (const span of ['0', '-1', 'abc', 'Infinity', '0x10', '1e3']) {
    assert.throws(() => calculate(input(20, 0, 20, 0, span)));
  }
  for (const [feet, inches] of [[-1, 0], [20, -1], [20, 12], ['abc', 0], [20.5, 0]]) {
    assert.throws(() => calculate(input(feet, inches, 20, 0, 100)));
  }
  assert.throws(() => calculate(input(0, 0, 0, 0, 100)));
  assert.throws(() => calculate(input(1, 0, 1, 0, 2000)), /below ground/i);
  assert.throws(() => calculate({ method: 'unknown' }));
});

test('formats whole-inch results with a carried foot and no decimal inches', () => {
  assert.equal(formatHeight(240), '20\u2032 0\u2033');
  assert.equal(formatHeight(239), '19\u2032 11\u2033');
  assert.equal(formatHeight(0), '0\u2032 0\u2033');
  assert.throws(() => formatHeight(NaN));
});

test('restores eight independent instances, keeps hidden values, and sanitizes persisted state', () => {
  const saved = { count: 1, calculators: [{ feetA: '20', method: 'no-comms' }, { feetA: '30', label: 'span 2' }] };
  const state = normalizeSavedState(saved);
  assert.equal(state.count, 1);
  assert.equal(state.calculators.length, 8);
  assert.equal(state.calculators[1].feetA, '30');
  state.calculators[0].feetA = '21';
  assert.equal(state.calculators[1].feetA, '30');
  assert.equal(normalizeSavedState({ count: 99 }).count, 2);
  assert.equal(normalizeSavedState({ calculators: [null, { method: 'bad', feetA: {} }] }).calculators[1].method, 'no-comms');
  assert.equal(normalizeSavedState(null).calculators[0].feetA, '');
});
