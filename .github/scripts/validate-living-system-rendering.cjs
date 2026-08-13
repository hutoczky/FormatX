'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const fail = message => { throw new Error(message); };
const requireToken = (source, token, message) => { if (!source.includes(token)) fail(message || `Missing token: ${token}`); };
const forbid = (source, token, message) => { if (source.includes(token)) fail(message || `Forbidden token: ${token}`); };

const living = read('docs/scifi-ui/scripts/formatx-living-system-rendering-v1.js');
const bridge = read('docs/scifi-ui/scripts/formatx-living-telemetry-visual-bridge-v1.js');
const interaction = read('docs/scifi-ui/scripts/formatx-core-direct-interaction.js');
const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const css = read('docs/scifi-ui/styles/formatx-living-system-rendering-v1.css');

for (const token of [
  "navigator.hardwareConcurrency",
  "navigator.deviceMemory",
  "navigator.connection",
  "requestAnimationFrame(sampleFrame)",
  "formatx:organismsemanticstate",
  "formatx:organismstatechange",
  "formatx:organismcoreactivate",
  "formatx:corecommand",
  "deviceorientation",
  "formatx-core-awakening-v1",
  "sessionStorage.setItem(AWAKEN_KEY",
  "source: 'browser-runtime'",
  "renderPressure"
]) requireToken(living, token, `Living System Rendering contract missing: ${token}`);

for (const token of [
  "A mag érzékel. A gerinc döntési utat épít.",
  "Hat specializált szerv. Egyetlen élő rendszer.",
  "hivatalos kiadási csatornán"
]) requireToken(living, token, `Copy guard missing: ${token}`);

for (const forbidden of [
  'preventDefault(',
  'scrollTo(',
  'scrollIntoView(',
  'cloneNode(',
  '.getContext(',
  'CPU load',
  'cpuLoad'
]) forbid(living, forbidden, `Living System Rendering must not own scrolling/WebGL or fake CPU telemetry: ${forbidden}`);

requireToken(interaction, 'formatx-living-system-rendering-v1.js', 'Core interaction does not boot Living System Rendering');
requireToken(interaction, 'formatx-living-telemetry-visual-bridge-v1.js', 'Core interaction does not boot telemetry visual bridge');
requireToken(bootstrap, 'direct-interaction-r4-root-integrity', 'Core bootstrap cache revision is stale');

for (const token of [
  '.fx-living-system-layer',
  'pointer-events: none',
  'data-fx-core-awakening="running"',
  '@media (max-width: 900px), (pointer: coarse)',
  '@media (prefers-reduced-motion: reduce)',
  '--fx-system-ring-glow'
]) requireToken(css, token, `Living visual contract missing: ${token}`);

forbid(css, '* var(', 'Do not depend on CSS multiplication for the mobile production path');
forbid(css, 'scroll-snap-type', 'Award layer must not alter scroll snap policy');
forbid(css, 'scroll-behavior', 'Award layer must not own scroll behavior');

for (const token of [
  '--fx-system-cyan-alpha',
  '--fx-system-blur',
  '--fx-system-ring-glow',
  'formatx:systemstate'
]) requireToken(bridge, token, `Telemetry visual bridge missing: ${token}`);

console.log('Living System Rendering validation passed.');
