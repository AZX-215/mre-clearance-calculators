const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { MAX_CALCULATORS } = require('../mon-power-midspan-core.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'mon-power-midspan.html'), 'utf8');

test('all calculator counts are present before JavaScript initializes', () => {
  const selector = html.match(/<select id="calcCount">([\s\S]*?)<\/select>/)[1];
  const options = [...selector.matchAll(/<option value="(\d+)"/g)].map((match) => Number(match[1]));
  assert.deepEqual(options, Array.from({ length: MAX_CALCULATORS }, (_, i) => i + 1));
  assert.match(selector, /<option value="2" selected>/);
});

test('page requests matched versioned local assets to avoid mixing old scripts with new HTML', () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => new URL(match[1], 'https://example.test/'));
  const stylesheet = new URL(html.match(/<link rel="stylesheet" href="([^"]+)"/)[1], 'https://example.test/');
  const assets = [...scripts, stylesheet];
  assert.equal(scripts.length, 2);
  const version = scripts[0].searchParams.get('v');
  assert.ok(version, 'Scripts need a release version so browsers fetch the current implementation.');
  for (const asset of assets) {
    assert.equal(asset.searchParams.get('v'), version);
    assert.ok(fs.existsSync(path.join(__dirname, '..', asset.pathname.slice(1))));
  }
});
