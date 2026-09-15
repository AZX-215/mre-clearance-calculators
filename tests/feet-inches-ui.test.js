const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'feet-inches.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'feet-inches.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'feet-inches-app.js'), 'utf8');
const allUiText = `${html}\n${css}\n${app}`;

test('page offers up to eight calculators and a clear-all action', () => {
  for (let value = 1; value <= 8; value += 1) {
    assert.match(html, new RegExp(`<option value="${value}"`));
  }
  assert.match(html, /id="clearAll"/);
  assert.match(app, /MAX_CALCULATORS\s*=\s*8/);
});

test('calculator cards use vertical manual-or-linked inputs and locking', () => {
  assert.match(app, /sourceA\$\{n\}/);
  assert.match(app, /sourceB\$\{n\}/);
  assert.match(app, /lock\$\{n\}/);
  assert.doesNotMatch(allUiText, /Independent feet and inches calculation/i);
});

test('rounding controls are removed and decimal entry is emphasized', () => {
  assert.doesNotMatch(allUiText, /Round inches to nearest/i);
  assert.doesNotMatch(allUiText, /1\/16/);
  assert.match(app, /inputmode="decimal"/);
  assert.doesNotMatch(app, /value="0"/);
});

test('page loads separated calculator assets and responsive auto-fit cards', () => {
  assert.match(html, /href="feet-inches\.css"/);
  assert.match(html, /<script src="feet-inches-core\.js"><\/script>/);
  assert.match(html, /<script src="feet-inches-app\.js"><\/script>/);
  assert.match(css, /auto-fit/);
});

test('browser state persistence includes calculator values, sources and locks', () => {
  assert.match(app, /feet-inches-calculator-state-v2/);
  assert.match(app, /localStorage\.setItem/);
  assert.match(app, /lockedValue/);
});
