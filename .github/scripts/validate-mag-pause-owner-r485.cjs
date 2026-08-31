'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '../../docs/scifi-ui/scripts', name), 'utf8');
const canonical = read('formatx-event-horizon.js');
const legacy = read('formatx-mobile-reference-layout-v1.js');

class Element {}
class Button extends Element {
  dataset = {};
  attributes = {};
  listeners = [];
  closest() { return this; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(type, listener) { if (type === 'click') this.listeners.push(listener); }
}
const button = new Button();
const fallback = new Button();
const root = { lang: 'hu', dataset: {} };
const events = [];
const legacyToggles = [];
const scope = {
  Element, HTMLButtonElement: Button, ROOT: root, root, button,
  copy: () => ({ pause: 'Pause', resume: 'Resume' }),
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  dispatchEvent: event => events.push(event),
  document: { querySelectorAll: () => [button, fallback] },
  performance: { now: () => 1000 },
  setPaused: value => legacyToggles.push(value)
};
const canonicalFunction = canonical.slice(canonical.indexOf('function bindPause('), canonical.indexOf('\nfunction ensureControls('));
const legacySync = legacy.split('\n').find(line => line.startsWith('function syncPauseButtons()'));
const legacyActivation = legacy.split('\n').find(line => line.startsWith('let lastPausePointerUp='))
  .split("document.addEventListener('pointerup'")[0];
vm.createContext(scope);
vm.runInContext(`${canonicalFunction}\nlet paused=false;\n${legacySync}\n${legacyActivation}\nbindPause(button);bindPause(button);`, scope);
assert.equal(button.listeners.length, 1, 'Canonical PAUSE must bind only once');

const event = (type, defaultPrevented = false) => ({
  type, target: button, button: 0, defaultPrevented,
  preventDefault() { this.defaultPrevented = true; },
  stopImmediatePropagation() { this.stopped = true; }
});
scope.pointer = event('pointerup');
scope.click = event('click');
vm.runInContext('handlePauseActivation(pointer);handlePauseActivation(click);', scope);
assert.equal(legacyToggles.length, 0, 'Legacy handlers must relinquish the canonical control');
assert.equal(scope.click.defaultPrevented, false, 'Legacy capture must leave the canonical click intact');
button.listeners[0](scope.click);
assert.equal(button.dataset.paused, 'true');
assert.equal(root.dataset.fxReferenceMotionPaused, 'true');
assert.equal(button.attributes['aria-pressed'], 'true');
assert.equal(events.length, 1, 'A physical click must emit exactly one pause event');
vm.runInContext('syncPauseButtons();', scope);
assert.equal(button.dataset.paused, 'true', 'Legacy reconciliation must not unpause the canonical control');
assert.equal(fallback.dataset.paused, 'false', 'Legacy-only pages keep their fallback control');

// A keyboard/programmatic activation is one click, with no pointerup.
button.listeners[0](event('click'));
assert.equal(button.dataset.paused, 'false');
assert.equal(button.attributes['aria-pressed'], 'false');
assert.equal(events.length, 2);

// An older cached compatibility script already consumed this click. The new
// canonical owner must not reverse its pause result a second time.
button.dataset.paused = 'true';
root.dataset.fxReferenceMotionPaused = 'true';
button.listeners[0](event('click', true));
assert.equal(button.dataset.paused, 'true');
assert.equal(events.length, 2);
console.log('PASS: one PAUSE owner; physical, keyboard and cached-legacy events toggle exactly once.');
