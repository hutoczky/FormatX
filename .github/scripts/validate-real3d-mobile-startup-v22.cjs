'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const style = read('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

for (const token of [
  "const STARTUP_REVISION = 'v22-mobile-safe'",
  'function acquireContext(attributes, profile)',
  "const primaryProfile = coarse.matches ? 'mobile-default' : 'desktop-high-performance'",
  "powerPreference: coarse.matches ? 'default' : 'high-performance'",
  "}, 'safe-retry')",
  "emitCoreFallback('context-unavailable'",
  "addEventListener('webglcontextcreationerror'",
  "addEventListener('webglcontextlost'",
  "addEventListener('webglcontextrestored'",
  "root.dataset.fxCoreReal3dStartup = 'ready-' + STARTUP_REVISION",
  "const VISUAL_REVISION = 'v24-volumetric-crystal'",
  'root.dataset.fxCoreVisualRevision = VISUAL_REVISION',
  'p = .68',
  'scaling(scaleX,scaleY,scaleY)',
  "root.dataset.fxCoreContextPolicy = mobile ? 'mobile-default-no-probe' : 'desktop-high-performance-no-probe'"
]) assert.ok(runtime.includes(token), `mobile-safe real3D startup contract missing: ${token}`);

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'active engine source must have one WebGL2 acquisition site');
assert.doesNotMatch(runtime, /desynchronized\s*:/, 'desynchronized context mode is forbidden for the mobile-safe startup');
assert.match(premium, /if \(document\.querySelector\('script\[data-fx-core-real3d="true"\]'\)\) return 'webgl2-pending'/, 'dedicated engine must bypass the preflight probe context');
assert.match(premium, /addEventListener\('formatx:core3dfallback', handleCoreFallback\)/, 'GPU failure must activate the resilient fallback without exposing the legacy oval');
assert.match(style, /data-fx-core-real3d="context-unavailable"[\s\S]{0,700}#hero \.hero-ring/, 'legacy oval must be hidden when WebGL2 cannot start');
assert.ok(homepage.includes('v=20260809-real3d-v24-volumetric-crystal'), 'v24 visual cache revision is not bootstrapped');

const quality = contract.quality_contract;
assert.equal(quality.mag_startup_revision, 'v22-mobile-safe');
assert.equal(quality.mag_preflight_probe_context_count, 0);
assert.equal(quality.mag_mobile_context_power_preference, 'default');
assert.equal(quality.mag_desynchronized_context, false);
assert.equal(quality.mag_reference_pnorm_exponent, 0.68);
assert.equal(quality.mag_mobile_geometric_scale_x, 0.88);
assert.equal(quality.mag_mobile_geometric_scale_yz, 0.94);
assert.equal(quality.mag_mobile_dpr_cap_high, 1.45);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_frame_rate_target, '60-plus-display-refresh-uncapped');

console.log('PASS: real3D v22 mobile startup uses no probe context, safe Android context attributes, one active WebGL2 acquisition site and bounded recovery.');
