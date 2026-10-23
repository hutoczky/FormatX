'use strict';
// R2148 + R2143 regression: the root-domain homepage must load the same native
// Three.js birth engine as /scifi-ui/index.html. A page-relative import
// once resolved to /scripts/three-r185.module.js and forced the 2D fallback.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const engine=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const worker=read('billing-worker/src/production-content-entry.js');
const modulePath='/scifi-ui/scripts/three-r185.module.js';
const revision='formatx-mag-genesis-three-r1280.js?v=20261023-r2165-centered-studio-genesis';
assert.ok(fs.statSync('docs'+modulePath).size>1000,'Real bundled Three.js module absent');
assert.ok(engine.includes("new URL('/scifi-ui/scripts/three-r185.module.js', location.origin).href"),
  '3D cinematic must resolve bundled Three.js against the canonical origin');
assert.ok(!engine.includes("new URL('./scripts/three-r185.module.js', location.href)"),
  'Page-relative Three.js import would break canonical root homepage');
// R2146 portrait composition must keep a real central 3D helix visible.
assert.ok(engine.includes('const placements=this.mobileRender?[') &&
  engine.includes('[.00,.06,.60,1.57,.92]') &&
  engine.includes('[.00,-.87,-.20,1.58,.39]'),
  'Portrait Three.js DNA must be centered within the mobile camera frustum');
// R2165: prevent the original offscreen desktop panorama from replacing
// the new first-frame, fully visible DNA double helix.
assert.ok(engine.includes('[.00,.03,.55,1.57,.76]') &&
  engine.includes('[-2.00,1.02,-.34,-.44,.43]') &&
  engine.includes('[2.00,1.02,-.34,.44,.43]'),
  'Desktop first-frame must establish a central helix and subdued arm donors');
assert.ok(engine.includes('const grow=smooth((t-5.88)/1.18)') &&
  engine.includes('const opticWake=smooth((t-7.44)/.78)') &&
  engine.includes('this.birthRungs.forEach((bridge,axis)=>'),
  'Narrative continuity must be DNA -> paired arm transfer -> assembled MAG -> eye ignition');
// R2164: enforce the story as real staged geometry, not metadata/CSS copy.
const desktopPlacement=engine.split('const placements=this.mobileRender?[')[1]?.split(']:[')[1]
  ?.match(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]/);
assert.ok(desktopPlacement,'Desktop DNA placements are missing');
const [heroX,heroY,heroZ,heroRotation,heroScale]=desktopPlacement.slice(1).map(Number);
assert.ok(Math.abs(heroX)<.10 && Math.abs(heroY)<.10 && heroZ>.45 &&
  Math.abs(heroRotation-Math.PI/2)<.15 && heroScale>.70,
  'Desktop establishing shot must show a centered, vertical 3D double helix');
assert.ok(engine.includes('h.userData.primary=Math.abs(x)<.03&&Math.abs(y)<.09&&z>.50'),
  'Desktop cinematic has no authoritative founding DNA');
assert.ok(engine.includes('const satelliteReveal=smooth((t-1.12)/.86)') &&
  engine.includes('(h.userData.primary?1:satelliteReveal)'),
  'Secondary DNA must join the scene after the centered helix is recognizable');
assert.ok(engine.includes('const appear=smooth((t-2.38)/.76)') &&
  engine.includes('const grow=smooth((t-5.88)/1.18)') &&
  engine.includes('const opticWake=smooth((t-7.44)/.78)'),
  'DNA / living embryo / assembled titanium MAG / optical ignition story order regressed');
assert.ok(engine.includes('root.dataset.fxMagBirthCenteredDnaR2164'),
  'Canonical Three.js framebuffer proof must confirm the central DNA subject');
assert.ok(birth.includes(revision),'Intro bootstrap is still caching old Three.js engine');
assert.ok(worker.includes(revision),'Cloudflare asset rewrite would downgrade the canonical 3D intro');
for(const home of [
  'https://formatxsuite.com/',
  'https://formatxsuite.com/scifi-ui/index.html',
  'https://www.formatxsuite.com/'
]){
  const u=new URL(modulePath,new URL(home).origin);
  assert.equal(u.pathname,modulePath,home+' must resolve the exact bundled 3D engine');
}
console.log('FORMATX_R2143_ROOT_THREE_MODULE_ROUTE_PASS');
