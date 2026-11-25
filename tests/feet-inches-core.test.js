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

test('serialize-friendly blank state is generated for eight calculators', () => {
  const states = core.createDefaultStates(8);
  assert.equal(states.length, 8);
  assert.deepEqual(states[0], {
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
  });
});

test('calculators are independent even if legacy source fields are present', () => {
  const states = core.createDefaultStates(2);
  Object.assign(states[0], { feetA: '10', inchA: '6.5' });
  Object.assign(states[1], { feetA: '1', inchA: '5.5', operation: 'add', feetB: '2', sourceA: '1' });
  assert.equal(core.evaluateCalculator(states, 2), 41.5);
  states[0].feetA = '99';
  assert.equal(core.evaluateCalculator(states, 2), 41.5);
});

test('legacy measurement and factor links become fixed values', () => {
  const states = core.createDefaultStates(3);
  Object.assign(states[0], { feetA: '2', inchA: '6' });
  Object.assign(states[1], { sourceA: '1', operation: 'add', feetB: '1' });
  Object.assign(states[2], { feetA: '4', operation: 'multiply', sourceB: '1' });
  const migration = core.migrateLinkedInputs(states);
  assert.equal(migration.converted, 2);
  assert.equal(migration.cleared, 0);
  assert.equal(core.evaluateCalculator(migration.calculators, 2), 42);
  assert.equal(core.evaluateCalculator(migration.calculators, 3), 120);
  assert.equal('sourceA' in migration.calculators[1], false);
  assert.equal('sourceB' in migration.calculators[2], false);
  migration.calculators[0].feetA = '9';
  assert.equal(core.evaluateCalculator(migration.calculators, 2), 42);
  assert.equal(core.evaluateCalculator(migration.calculators, 3), 120);
});

test('evaluateCalculator returns a locked snapshot even after inputs change', () => {
  const states = core.createDefaultStates(1);
  states[0].feetA = '10';
  states[0].locked = true;
  states[0].lockedValue = 120;
  states[0].feetA = '25';

  assert.equal(core.evaluateCalculator(states, 1), 120);
});

test('legacy circular or unavailable links are flagged for manual re-entry', () => {
  const states = core.createDefaultStates(3);
  states[0].sourceA = '2';
  states[1].sourceA = '1';
  states[2].sourceA = '8';
  const migration = core.migrateLinkedInputs(states);
  assert.equal(migration.cleared, 3);
  for (let n = 1; n <= 3; n++) assert.throws(() => core.evaluateCalculator(migration.calculators, n), /decimal number/i);
});

test('legacy locked and hidden operands preserve saved values', () => {
  const states = core.createDefaultStates(3);
  Object.assign(states[0], { feetA: '12', locked: true, lockedValue: 30 });
  Object.assign(states[1], { sourceA: '1' });
  Object.assign(states[2], { sourceB: '1', feetB: '7', operation: 'convert' });
  const migration = core.migrateLinkedInputs(states);
  assert.equal(core.evaluateCalculator(migration.calculators, 2), 30);
  assert.equal(migration.calculators[2].feetB, '7');
  assert.equal(core.evaluateCalculator(migration.calculators, 1), 30);
});
