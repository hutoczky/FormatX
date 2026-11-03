'use strict';
// R2301: physical 3D cell optical density, not fewer particles or a 2D bypass.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const film=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const boot=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const html=read('docs/scifi-ui/index.html');
const worker=read('billing-worker/src/production-content-entry.js');
const version='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris';
for(const token of [
 'const count=this.mobileRender?6000:9600;',
 "const embryo=build(this.mobileRender?1200:3100,'embryo');",
 'float cellOpticalDepth=curve(3.38,4.28,uPhase)*',
 '1.0-.44*cellOpticalDepth',
 '(this.mobileRender?.48:.55)',
 "fxGenesisStudioR2301='cellular-depth-first-tamed-additive",
 'this.makeEmbryoFilm();',
 'this.makeMechanicalLayer();',
 'this.mechEyeCore.geometry.computeVertexNormals()'
])assert(film.includes(token),'R2301 biological detail missing: '+token);
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+version));
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+version));
assert(html.includes(version));
assert(birth.includes('const DURATION = 10000;'));
const inline=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(inline);
const digest="'sha256-"+crypto.createHash('sha256').update(inline).digest('base64')+"'";
assert(html.includes(digest));
const authorized=[...worker.matchAll(/const (INLINE_R[0-9]+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===digest &&
    worker.split(String.fromCharCode(36,123)+name+String.fromCharCode(125)).length===3);
assert(authorized,'the active parser SHA256 must be authorized by both Worker CSPs');
console.log('GENESIS_R2301_CELL_DEPTH_STUDIO_SOURCE_PASS');
