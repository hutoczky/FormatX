'use strict';
// R2298: real, active Three.js Genesis light and scratch-math regression.
// Source contract only; Chromium GPU, screenshots, CLS and Lighthouse remain mandatory.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const three=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const bootstrap=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const html=read('docs/scifi-ui/index.html');
const worker=read('billing-worker/src/production-content-entry.js');
const filmKey='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+filmKey),
  'real R533 film must load the optimized R1280 physical 3D asset');
assert(bootstrap.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+filmKey),
  'R1629 fallback must resolve the same film asset cache revision');
assert(html.includes(filmKey),'parser-first owner must use the same film revision');
const makeLights=three.split('    makeLights(){')[1]?.split('    makeStudioEnvironment(){')[0];
assert(makeLights,'R1280 studio lighting owner must exist');
assert(!/this\.mechLight\s*=/.test(makeLights),
  'never leave an overwritten zero-intensity pupil point light in the full scene');
const mech=three.split('    makeMechanicalLayer(){')[1]?.split('    createTaperedTube(')[0];
assert(mech && mech.includes('this.mechLight=new T.PointLight(0x86f4f3,0,4.2,2)'),
  'retain the one actually used physical optic point light');
assert(three.includes('this.mechLight.intensity=(.92+.18*finale)*opticWake*opticPulse'),
  'preserve original physical lens ignition');
const world=three.match(/    targetWorld\(\)\{([\s\S]*?)\n    \}/)?.[1];
assert(world && world.includes('this.targetRayR2298.set(') &&
  world.includes('this.targetWorldR2298.copy(this.camera.position).addScaledVector(ray,distance)'),
  'preserve original perspective-plane projection with reused vector math');
assert(!/new\s+\w+\.Vector3|\.clone\(/.test(world),
  'targetWorld must not allocate transient vectors every animation frame');
assert(three.includes('this.targetRayR2298=new THREE.Vector3()') &&
  three.includes('this.targetWorldR2298=new THREE.Vector3()'),
  'scratch vectors must be created once in constructor');
assert(birth.includes('const DURATION = 10000;'),
  'retain complete 10-second physical DNA-cell-MAG timeline');
const inline=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(inline,'parser boot script missing');
const csp="'sha256-"+crypto.createHash('sha256').update(inline).digest('base64')+"'";
assert(html.includes(csp),'HTML parser CSP must authorize exact current inline bytes');
// R2300+: the R2298 geometry guard must protect the *current* parser,
// not require an obsolete hash constant after each legitimate film upgrade.
// Match the literal declaration AND exactly two active Worker policy entries.
const authorized=[...worker.matchAll(/const (INLINE_R\d+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===csp &&
    worker.split('\${'+name+'}').length===3);
assert(authorized,'both Cloudflare Worker CSPs must authorize exact current parser SHA256');
console.log('GENESIS_R2298_LIGHT_BUDGET_SINGLE_CANVAS_SOURCE_PASS');
