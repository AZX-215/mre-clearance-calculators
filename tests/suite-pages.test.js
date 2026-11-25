const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const pages = ['light.html', 'ugi-resag.html', 'mon-power-midspan.html', 'feet-inches.html'];
test('one light-themed entry per calculator, with a common stylesheet and return link', () => {
  const home = read('index.html');
  for (const page of pages) {
    assert.match(home, new RegExp('href="' + page + '"'));
    assert.match(read(page), /href="suite\.css\?v=20261125"/);
    assert.match(read(page), /href="index\.html"/);
    assert.match(read(page), /<body class="tool /);
  }
  assert.equal((home.match(/class="swatch"/g) || []).length, 4);
  assert.doesNotMatch(home, /href="(?:blue|grey)\.html"/);
  for (const legacy of ['blue.html', 'grey.html']) assert.match(read(legacy), /url=light\.html/);
});
