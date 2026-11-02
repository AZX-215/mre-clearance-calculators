const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, formatHeight, normalizeSavedState, exportMarkdown } = require('../mon-power-midspan-core.js');

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

test('restores 100 independent instances, keeps hidden values, and preserves earlier saved calculators', () => {
  const saved = { count: 1, calculators: [{ feetA: '20', method: 'no-comms' }, { feetA: '30', label: 'span 2' }] };
  const state = normalizeSavedState(saved);
  assert.equal(state.count, 1);
  assert.equal(state.calculators.length, 100);
  assert.equal(state.calculators[1].feetA, '30');
  state.calculators[0].feetA = '21';
  assert.equal(state.calculators[1].feetA, '30');
  assert.equal(normalizeSavedState({ count: 100 }).count, 100);
  assert.equal(normalizeSavedState({ count: 101 }).count, 2);
  assert.equal(normalizeSavedState({ count: 0 }).count, 2);
  assert.equal(normalizeSavedState({ calculators: [null, { method: 'bad', feetA: {} }] }).calculators[1].method, 'no-comms');
  assert.equal(normalizeSavedState(null).calculators[0].feetA, '');
});

test('exports completed calculations from all 100 saved instances, including hidden ones', () => {
  const state = normalizeSavedState(null);
  state.count = 1;
  state.calculators[0] = { ...input(19, 10, 19, 2, 402), label: '007 + 006' };
  state.calculators[99] = { method: 'existing-comms', existingFeet: '18', existingInches: '10' };
  const result = exportMarkdown(state);
  assert.equal(result.completedCount, 2);
  assert.equal(result.skippedCount, 0);
  assert.match(result.markdown, /## Calculator 1\n/);
  assert.match(result.markdown, /007 \+ 006/);
  assert.match(result.markdown, /SCID A proposed comm height \| 19′ 10″/);
  assert.match(result.markdown, /SCID B proposed comm height \| 19′ 2″/);
  assert.match(result.markdown, /Average attach height \| 19′ 6″/);
  assert.match(result.markdown, /Sag allowance \| 48.24″ \(1%\)/);
  assert.match(result.markdown, /Proposed midspan height after ice load \| \*\*15′ 6″\*\*/);
  const existingSection = result.markdown.split('## Calculator 100\n')[1];
  assert.match(existingSection, /Existing comm midspan height \| 18′ 10″/);
  assert.match(existingSection, /Offset \| 4″/);
  assert.match(existingSection, /Proposed midspan height \| \*\*19′ 2″\*\*/);
  assert.doesNotMatch(existingSection, /ice|sag|SCID A/i);
});

test('export uses current inputs and shows fractional span normalization', () => {
  const state = normalizeSavedState(null);
  state.calculators[0] = { ...input(20, 0, 20, 0, '299.1'), finalInches: 999 };
  let result = exportMarkdown(state);
  assert.match(result.markdown, /Entered span length \| 299.1′/);
  assert.match(result.markdown, /Span used \| 300′ \(rounded up\)/);
  assert.match(result.markdown, /\*\*17′ 0″\*\*/);
  state.calculators[0].feetB = '22';
  result = exportMarkdown(state);
  assert.match(result.markdown, /\*\*18′ 0″\*\*/);
});

test('export skips empty, incomplete and invalid instances without losing completed results', () => {
  const state = normalizeSavedState(null);
  state.calculators[0] = { ...input(20, 0, 20, 0, 100) };
  state.calculators[1].feetA = '20';
  state.calculators[2] = input(20, 0, 20, 0, 'bad');
  state.calculators[3].label = 'Unfilled span';
  const before = JSON.stringify(state);
  const result = exportMarkdown(state);
  assert.equal(result.completedCount, 1);
  assert.equal(result.skippedCount, 3);
  assert.match(result.markdown, /## Calculator 1\n/);
  assert.doesNotMatch(result.markdown, /## Calculator [234]\n/);
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(exportMarkdown(normalizeSavedState(null)), { markdown: '', completedCount: 0, skippedCount: 0 });
});

test('export treats labels as text, escaping Markdown and HTML', () => {
  const state = normalizeSavedState(null);
  state.calculators[0] = { ...input(20, 0, 20, 0, 100), label: '<img src=x>\n# [link](url) | *text*' };
  const result = exportMarkdown(state);
  assert.doesNotMatch(result.markdown, /<img|\n# \[link/);
  assert.match(result.markdown, /&lt;img src=x&gt;/);
  assert.match(result.markdown, /\\\|/);
  assert.match(result.markdown, /\\\*text\\\*/);
});
