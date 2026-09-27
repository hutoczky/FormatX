'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js'), 'utf8');

function fixture({ mobile = true, complete = false } = {}) {
  const scripts = [], microtasks = [], frames = [];
  class Script extends EventTarget {
    constructor() { super(); this.dataset = {}; }
    setAttribute(name, value) { this[name] = value; }
  }
  const window = new EventTarget();
  const document = new EventTarget();
  const root = { dataset: complete ? { fxPreloaderR531: 'done', fxIntroCompletionR769: 'done' } : {} };
  Object.assign(document, {
    documentElement: root, readyState: 'complete', visibilityState: 'visible',
    body: { dataset: {}, classList: { contains: () => false } },
    querySelector: () => null, createElement: () => new Script(),
    head: { appendChild: node => scripts.push(node) },
  });
  vm.runInNewContext(source, {
    document, window, HTMLScriptElement: Script,
    addEventListener: window.addEventListener.bind(window),
    matchMedia: query => ({ matches: query.includes('prefers-reduced-motion') ? false : mobile }),
    requestAnimationFrame: fn => frames.push(fn), queueMicrotask: fn => microtasks.push(fn),
    setTimeout: () => 1, clearTimeout: () => {},
  });
  return {
    scripts, frames,
    flush: () => microtasks.splice(0).forEach(fn => fn()),
    release() {
      root.dataset.fxPreloaderR531 = 'done';
      root.dataset.fxIntroCompletionR769 = 'done';
      // This is the actual intro owner's non-bubbling document notification.
      document.dispatchEvent(new Event('formatx:preloadercomplete'));
    },
  };
}

function expectPostIntroOwners(f) {
  assert.equal(f.scripts.filter(s => s.src.includes('formatx-current-mag-loader-r422.js')).length, 1);
  assert.equal(f.scripts.filter(s => s.src.includes('formatx-mag-shape-sync-r476.js')).length, 1);
  assert.equal(f.scripts.filter(s => s.src.includes('formatx-wda-controls-r198.js')).length, 1);
  assert.equal(f.scripts.length, 3, 'only critical MAG, shape and SOUND start at release');
}

test('mobile starts automatically from the canonical document release notification once', () => {
  const f = fixture();
  assert.equal(f.scripts.length, 0);
  f.release();
  expectPostIntroOwners(f);
  f.release();
  expectPostIntroOwners(f);
  assert.equal(f.frames.length, 1, 'one optional enhancement scheduler');
});

test('late startup adopts the durable completed state without replaying an event', () => {
  const f = fixture({ complete: true });
  f.flush();
  expectPostIntroOwners(f);
  f.release();
  expectPostIntroOwners(f);
});

test('desktop keeps navigation-owned MAG and acquires SOUND only after intro release', () => {
  const f = fixture({ mobile: false });
  assert.equal(f.scripts.length, 2);
  assert(f.scripts.every(s => !s.src.includes('formatx-wda-controls-r198.js')));
  f.release();
  expectPostIntroOwners(f);
});
