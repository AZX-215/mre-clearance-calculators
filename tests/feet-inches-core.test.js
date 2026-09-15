const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('../feet-inches-core.js');

test('parseDecimal accepts blanks and decimal values but rejects fractions', () => {
  assert.equal(core.parseDecimal(''), 0);
  assert.equal(core.parseDecimal(' 8.5 '), 8.5);
  assert.equal(core.parseDecimal('-2.25'), -2.25);
  assert.throws(() => core.parseDecimal('1/2'), /decimal number/i);
});

test('measurementToInches supports decimal feet and inches', () => {
  assert.equal(core.measurementToInches('29', '8.5'), 356.5);
  assert.equal(core.measurementToInches('0.5', '3.25'), 9.25);
});

test('formatFeetInches displays decimal inches without fractions', () => {
  assert.equal(core.formatFeetInches(362.5), '30 ft 2.5 in');
  assert.equal(core.formatFeetInches(360), '30 ft 0 in');
  assert.equal(core.formatFeetInches(-14.25), '-1 ft 2.25 in');
});

test('calculateOperation adds and subtracts two measurements', () => {
  assert.equal(core.calculateOperation('add', 356.5, 16.25), 372.75);
  assert.equal(core.calculateOperation('subtract', 356.5, 16.25), 340.25);
});

test('calculateOperation multiplies and divides by a decimal factor', () => {
  assert.equal(core.calculateOperation('multiply', 150, 1.5), 225);
  assert.equal(core.calculateOperation('divide', 150, 2), 75);
  assert.throws(() => core.calculateOperation('divide', 150, 0), /divide by zero/i);
});

test('linked result uses decimal feet when it serves as a multiply or divide factor', () => {
  assert.equal(core.resultInchesToFactor(362), 362 / 12);
});

test('wouldCreateCycle rejects direct and indirect calculator loops', () => {
  const states = [
    { sourceA: 'manual', sourceB: '2' },
    { sourceA: 'manual', sourceB: '3' },
    { sourceA: 'manual', sourceB: 'manual' },
  ];

  assert.equal(core.wouldCreateCycle(states, 3, 1), true);
  assert.equal(core.wouldCreateCycle(states, 2, 1), true);
  assert.equal(core.wouldCreateCycle(states, 1, 3), false);
});

test('serialize-friendly blank state is generated for eight calculators', () => {
  const states = core.createDefaultStates(8);
  assert.equal(states.length, 8);
  assert.deepEqual(states[0], {
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
  });
});

test('evaluateCalculator can add a linked calculator result', () => {
  const states = core.createDefaultStates(2);
  states[0].feetA = '10';
  states[0].inchA = '6.5';
  states[0].operation = 'convert';
  states[1].sourceA = '1';
  states[1].operation = 'add';
  states[1].feetB = '1';
  states[1].inchB = '5.5';

  assert.equal(core.evaluateCalculator(states, 2), 144);
});

test('evaluateCalculator uses a linked result as decimal-feet factor for multiply', () => {
  const states = core.createDefaultStates(2);
  states[0].feetA = '2';
  states[0].inchA = '6';
  states[1].feetA = '4';
  states[1].operation = 'multiply';
  states[1].sourceB = '1';

  assert.equal(core.evaluateCalculator(states, 2), 120);
});

test('evaluateCalculator returns a locked snapshot even after inputs change', () => {
  const states = core.createDefaultStates(1);
  states[0].feetA = '10';
  states[0].locked = true;
  states[0].lockedValue = 120;
  states[0].feetA = '25';

  assert.equal(core.evaluateCalculator(states, 1), 120);
});

test('evaluateCalculator rejects persisted circular references', () => {
  const states = core.createDefaultStates(2);
  states[0].sourceA = '2';
  states[1].sourceA = '1';

  assert.throws(() => core.evaluateCalculator(states, 1), /circular/i);
});

test('wouldCreateCycle ignores an inactive B source when operation is convert', () => {
  const states = core.createDefaultStates(2);
  states[0].operation = 'convert';
  states[0].sourceB = '2';

  assert.equal(core.wouldCreateCycle(states, 2, 1), false);
});

test('wouldCreateCycle treats a locked result as a dependency break', () => {
  const states = core.createDefaultStates(2);
  states[0].operation = 'add';
  states[0].sourceB = '2';
  states[0].locked = true;
  states[0].lockedValue = 120;

  assert.equal(core.wouldCreateCycle(states, 2, 1), false);
});
