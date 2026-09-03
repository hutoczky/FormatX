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
assert.ok(telemetryStart >= 0 && telemetryEnd > telemetryStart, 'R511 canonical MAG telemetry function missing');
const telemetryBody = canonical.slice(telemetryStart, telemetryEnd);
assert.doesNotMatch(telemetryBody, /\.getAnimations\s*\(/, 'Canonical control owner must not enumerate CSS animations');
assert.doesNotMatch(telemetryBody, /\.pause\s*\(/, 'Canonical control owner must not pause the CSSAnimation clock directly');
assert.doesNotMatch(telemetryBody, /\.play\s*\(/, 'Canonical control owner must not resume the CSSAnimation clock directly');
assert.match(telemetryBody, /fxCanonicalMagClockOwnerR507=['\"]mag-shape-sync-r476-only['\"]/, 'Explicit MAG clock ownership marker missing');

const playbackStart = shapeSync.indexOf('function syncPrimaryPlayback(');
const playbackEnd = shapeSync.indexOf('\nfunction syncPlaybackSoon(', playbackStart);
assert.ok(playbackStart >= 0 && playbackEnd > playbackStart, 'R511 syncPrimaryPlayback owner missing');
const playbackBody = shapeSync.slice(playbackStart, playbackEnd);

assert.match(playbackBody, /canvas\.getAnimations\s*\(\s*\)/, 'R511 shape-sync must enumerate the canonical CSSAnimation for recreation-only phase preservation');
assert.match(shapeSync, /animation\.currentTime\s*=\s*frozen/, 'R510 recreation-only currentTime restoration contract missing');
assert.match(playbackBody, /const\s+expectedPlayState\s*=\s*stop\s*\?\s*['\"]paused['\"]\s*:\s*['\"]running['\"]/, 'R511 paused/running CSS state mapping missing');
assert.match(playbackBody, /setProperty\s*\(\s*['\"]animation-play-state['\"]\s*,\s*expectedPlayState\s*,\s*['\"]important['\"]\s*\)/, 'R511 animation-play-state important ownership write missing');
assert.match(playbackBody, /getComputedStyle\s*\(\s*canvas\s*\)\.animationPlayState/, 'R511 CSSOM animation-play-state readback barrier missing');
assert.match(shapeSync, /animation\.startTime\s*=\s*timelineTime\s*-\s*\(\s*frozen\s*\/\s*rate\s*\)/, 'R509 deterministic exceptional hold release missing');
assert.match(shapeSync, /!animation\.pending/, 'R509 exceptional hold must remain tracked until release resolves');
assert.doesNotMatch(shapeSync, /animation\.pause\s*\(/, 'CSS remains the sole lifecycle owner: WAAPI pause() is forbidden');
assert.doesNotMatch(shapeSync, /animation\.play\s*\(/, 'CSS remains the sole lifecycle owner: WAAPI play() is forbidden');
assert.match(shapeSync, /fxPrimaryMagPauseContractR508=['\"]css-play-state-owner-currenttime-pin-no-waapi-lifecycle['\"]/, 'R508 CSS lifecycle ownership marker missing');
assert.match(shapeSync, /fxPrimaryMagPauseContractR509=['\"]css-state-owner-deterministic-starttime-release['\"]/, 'R509 deterministic hold-release marker missing');
assert.match(shapeSync, /fxPrimaryMagPauseContractR510=['\"]stable-object-css-pause-recreation-only-currenttime-pin['\"]/, 'R510 recreation-only currentTime marker missing');
assert.match(shapeSync, /fxPrimaryMagPauseContractR511=['\"]cssom-committed-play-state-recreation-only-currenttime-pin['\"]/, 'R511 CSSOM commit-barrier ownership marker missing');

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
console.log('PASS: R511 validates semantic CSS play-state ownership, CSSOM commit barrier, recreation-only phase pinning, and zero WAAPI pause/play lifecycle ownership.');
