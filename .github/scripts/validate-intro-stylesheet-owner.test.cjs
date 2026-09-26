'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../docs/scifi-ui/scripts/formatx-event-horizon.js'), 'utf8');
const styleUrl = source.match(/const P0_FX_STYLE=([^;]+);/)[1];
const ensureSource = source.slice(source.indexOf('function ensureP0FxStyle()'), source.indexOf('function cancelDeadline()'));

function fixture(href, baseURI = 'https://formatxsuite.com/scifi-ui/index.html') {
  let writes = 0;
  class HTMLLinkElement {
    constructor(value) { this.value = value; this.dataset = {}; }
    get href() { return new URL(this.value, baseURI).href; }
    set href(value) { writes++; this.value = value; }
  }
  let link = href == null ? null : new HTMLLinkElement(href);
  const appended = [];
  const document = {
    baseURI,
    querySelector: () => link,
    createElement: () => new HTMLLinkElement(''),
    head: { appendChild(node) { appended.push(node); link = node; } }
  };
  const context = vm.createContext({ document, HTMLLinkElement, URL });
  vm.runInContext(`const P0_FX_STYLE=${styleUrl};\n${ensureSource}`, context);
  return { ensure: () => vm.runInContext('ensureP0FxStyle()', context), get link() { return link; }, get writes() { return writes; }, appended };
}

test('adopts a current relative or absolute critical stylesheet without an href write', () => {
  const current = vm.runInNewContext(styleUrl);
  for (const href of [current, new URL(current, 'https://formatxsuite.com/scifi-ui/index.html').href]) {
    const f = fixture(href), original = f.link;
    assert.equal(f.ensure(), original);
    assert.equal(f.ensure(), original);
    assert.equal(f.writes, 0, 'reassigning the same href withdraws the loaded stylesheet');
    assert.equal(f.appended.length, 0);
  }
});

test('replaces an obsolete revision once, then adopts it', () => {
  const f = fixture('./styles/formatx-intro-p0-r575.css?v=obsolete');
  f.ensure(); f.ensure();
  assert.equal(f.writes, 1);
  assert.equal(f.link.href, new URL(vm.runInNewContext(styleUrl), 'https://formatxsuite.com/scifi-ui/index.html').href);
});

test('creates one missing stylesheet and keeps the same owner on repeated calls', () => {
  const f = fixture(null);
  const first = f.ensure();
  assert.equal(first.rel, 'stylesheet');
  assert.equal(first.dataset.fxIntroP0R575, 'true');
  assert.equal(f.ensure(), first);
  assert.equal(f.appended.length, 1);
  assert.equal(f.writes, 1);
});
