'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const boot=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const film=three.slice(three.indexOf('    makeCinematicBiophotons(){'),three.indexOf('    updateGenomeParticles('));
for(const v of [
 'R2318: retain the full physical cellular photon population',
 "const dna=build(this.mobileRender?260:620,'dna')",
 "const embryo=build(this.mobileRender?1200:3100,'embryo')",
 'setup(this.dnaBiofield,(1-smooth((t-2.94)/1.42))*.84)',
 '(this.mobileRender?.39:.44)',
 'this.embryoBiofield=embryo'
])assert(film.includes(v),'R2318 true optical cell / DNA population regression: '+v);
assert(!film.includes('(this.mobileRender?.48:.55)'),
 'R2318 must not recreate the overexposed 5.5s biophoton source');
assert(three.includes('cortexNormalsR2317.needsUpdate=true'));
assert(three.includes('const fullFrameZ=Math.max(z,4.36)'));
const key='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals-r2318-cell-photon-depth';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+key));
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+key));
const parser=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(parser?.includes(key));
const digest="'sha256-"+crypto.createHash('sha256').update(parser).digest('base64')+"'";
assert(html.includes(digest));
assert(worker.includes('const INLINE_R2318_BOOT_HASH = "'+digest+'";'));
assert.equal((worker.match(/\$\{INLINE_R2318_BOOT_HASH\}/g)||[]).length,2);
console.log('R2318_CELLULAR_PHOTON_DEPTH_FULL_PARTICLE_COUNTS_AND_EXACT_CSP_PASS');
