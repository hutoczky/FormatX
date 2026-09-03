'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '../../docs/scifi-ui/scripts', name), 'utf8');
const canonical = read('formatx-event-horizon.js');
const shapeSync = read('formatx-mag-shape-sync-r476.js');
const legacy = read('formatx-mobile-reference-layout-v1.js');

const telemetryStart = canonical.indexOf('function syncCanonicalMagAnimations(');
const telemetryEnd = canonical.indexOf('\nfunction bindPause(', telemetryStart);
assert.ok(telemetryStart >= 0 && telemetryEnd > telemetryStart, 'R507 canonical MAG telemetry function missing');
const telemetryBody = canonical.slice(telemetryStart, telemetryEnd);
assert.doesNotMatch(telemetryBody, /\.getAnimations\s*\(/, 'R507 control owner must not enumerate CSS animations');
assert.doesNotMatch(telemetryBody, /\.pause\s*\(/, 'R507 control owner must not pause the CSSAnimation clock directly');
assert.doesNotMatch(telemetryBody, /\.play\s*\(/, 'R507 control owner must not resume the CSSAnimation clock directly');
assert.match(telemetryBody, /fxCanonicalMagClockOwnerR507=['\"]mag-shape-sync-r476-only['\"]/, 'R507 explicit MAG clock ownership marker missing');
assert.match(shapeSync, /canvas\.getAnimations\(\)/, 'MAG shape-sync must enumerate the canonical CSSAnimation');
assert.match(shapeSync, /animation\.pause\(\)/, 'MAG shape-sync must own canonical pause');
assert.match(shapeSync, /animation\.play\(\)/, 'MAG shape-sync must own canonical resume');

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
const canonicalStateSync = [];
const scope = {
  Element, HTMLButtonElement: Button, ROOT: root, root, button,
  copy: () => ({ pause: 'Pause', resume: 'Resume' }),
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
  dispatchEvent: event => events.push(event),
  document: { querySelectorAll: () => [button, fallback] },
  performance: { now: () => 1000 },
  setPaused: value => legacyToggles.push(value),
  syncCanonicalMagAnimations: value => canonicalStateSync.push(Boolean(value))
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
assert.deepEqual(canonicalStateSync, [true], 'Canonical PAUSE state telemetry must update exactly once');
vm.runInContext('syncPauseButtons();', scope);
assert.equal(button.dataset.paused, 'true', 'Legacy reconciliation must not unpause the canonical control');
assert.equal(fallback.dataset.paused, 'false', 'Legacy-only pages keep their fallback control');

button.listeners[0](event('click'));
assert.equal(button.dataset.paused, 'false');
assert.equal(button.attributes['aria-pressed'], 'false');
assert.equal(events.length, 2);
assert.deepEqual(canonicalStateSync, [true, false], 'Canonical RESUME state telemetry must update exactly once');

button.dataset.paused = 'true';
root.dataset.fxReferenceMotionPaused = 'true';
button.listeners[0](event('click', true));
assert.equal(button.dataset.paused, 'true');
assert.equal(events.length, 2);
assert.deepEqual(canonicalStateSync, [true, false], 'Default-prevented legacy clicks must not mutate canonical state');
console.log('PASS: R507 keeps one user PAUSE event owner and one CSSAnimation clock owner; physical, keyboard and cached-legacy activation remain single-toggle.');
