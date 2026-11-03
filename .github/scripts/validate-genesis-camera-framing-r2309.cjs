'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const boot=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const camera=three.slice(three.indexOf('    updateCamera(t,time){'),three.indexOf('    render(r,time){'));
for(const fragment of ['R2309: frame the ENTIRE four-point titanium chassis',
 'const assemblyFraming=smooth((t-6.28)/.68)*',
 '(1-smooth((t-8.58)/.92))',
 'if(!this.mobileRender)', 'const fullFrameZ=Math.max(z,4.36)',
 'z=mix(z,fullFrameZ,assemblyFraming)', 'this.camera.position.set(x,y,z)',
 'this.camera.lookAt(0,0,0)'])
 assert(camera.includes(fragment),'R2309 continuous 3D camera framing absent: '+fragment);
assert(three.includes('new THREE.PerspectiveCamera(42,1,0.05,80)'));
assert.equal((three.match(/this\.camera=new THREE\.PerspectiveCamera/g)||[]).length,1);
const key='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+key));
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+key));
const inline=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(inline?.includes(key));
const digest="'sha256-"+crypto.createHash('sha256').update(inline).digest('base64')+"'";
assert(html.includes(digest));
assert(worker.includes('const INLINE_R2309_BOOT_HASH = "'+digest+'";'));
assert.equal((worker.match(/\$\{INLINE_R2309_BOOT_HASH\}/g)||[]).length,2);
console.log('R2309_COMPLETE_TITANIUM_REVEAL_ONE_CAMERA_AND_STRICT_CSP_PASS');
