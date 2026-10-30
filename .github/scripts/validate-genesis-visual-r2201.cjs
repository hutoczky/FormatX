'use strict';
/* FormatX R2201 - real GENESIS cinematic contract.
 * A reload must begin with the user's reference DNA, then a saturated
 * cyan/coral biological cell, then the physically assembled four-arm MAG.
 * The visual screenshots remain authoritative for appearance. */
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const read=path=>fs.readFileSync(path,'utf8');
const html=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const renderer=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const worker=read('billing-worker/src/production-content-entry.js');
assert.doesNotThrow(()=>new Function(intro),'R533 must parse');
assert.doesNotThrow(()=>new Function(renderer),'R1280 must parse');
const match=html.match(/<script data-fx-intro-bootstrap-r1629="true">([\s\S]*?)<\/script>/);
assert(match,'Inline parser-owned GENESIS bootstrap missing');
const hash="'sha256-"+crypto.createHash('sha256').update(match[1]).digest('base64')+"'";
const meta=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
assert(meta?.[1]?.includes(hash),'The exact new GENESIS inline hash must appear in HTML CSP');
const declared=worker.split('\n').find(line=>
  /^const INLINE_R\d+_BOOT_HASH = "/.test(line)&&line.includes(' = "'+hash+'";'));
assert(declared,'Worker must declare the exact active GENESIS inline hash');
const hashName=declared.match(/^const (INLINE_R\d+_BOOT_HASH) = /)[1];
assert(worker.split('${'+hashName+'}').length-1===2,
  'Worker meta/header CSP must both include the current GENESIS hash');
const activeFilm=match[1].match(/formatx-mag-birth-live-r533\.js\?v=[^"']+/)?.[0];
assert(activeFilm,'Parser must load a versioned canonical cinematic bridge');
const rescue=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
assert(rescue.includes(activeFilm),
  'Parser and rescue must load the same current cinematic revision');
assert(match[1].includes("const v=f||(!a&&p.get('intro')!=='0')"),
  'Every normal full navigation must play GENESIS; explicit ?intro=0 may skip');
assert(match[1].includes('fresh-navigation-genesis'),'Must identify the new repeatable film bootstrap');
assert(!intro.includes('if (!FORCE && (seen || AUTOMATION))'),
  'The old sessionStorage skip must not silently suppress the DNA film');
assert(intro.includes('if (!FORCE && (SKIP_REQUESTED || AUTOMATION))'),
  'User-initiated skip and automated audit skip must remain supported');
for(const listener of [
  "addEventListener('formatx:real3dready'",
  "addEventListener('resize',()=>{sizeCanvas();syncTarget(true);},interactionOptions)",
  "addEventListener('orientationchange',()=>setTimeout(()=>{"
])assert(intro.includes(listener),'Retired-film lifecycle listener missing: '+listener);
assert(intro.includes("if(!finished)syncTarget(true);\n  },120),interactionOptions);"),
  'Queued orientation work must stop after the genuine MAG handoff');
assert(!intro.includes("addEventListener('resize',()=>{sizeCanvas();syncTarget(true);},{passive:true})"),
  'Geometry listener must not survive the film AbortController');
const required=[
  "const placements=this.mobileRender?",
  "const h=this.createHelix(index===0?3.54:4.08",
  "this.makeGenomeParticles();",
  "this.makeEmbryoFilm();",
  "this.makeCinematicBiophotons();",
  "this.embryoMaterial.opacity=.89*visible",
  "emissiveMap:this.embryoTexture",
  "const coral=clamp((coralCloud-.545)*5.1)",
  "this.updateDNA(t,time);",
  "this.updateGenomeParticles(t,time);",
  "this.updateCore(t,time);",
  "this.updateMechanical(t,time);",
  "const appear=smooth((t-3.52)/.76)",
  "const dissolve=1-smooth((t-5.66)/1.12)",
  "const grow=smooth((t-5.88)/1.18)"
];
for(const str of required)assert(renderer.includes(str),'R2201 cinematic stage missing: '+str);
assert(renderer.indexOf('this.updateDNA(t,time);')<renderer.indexOf('this.updateCore(t,time);'),
  'The DNA must be updated before the embryo');
assert(renderer.indexOf('this.updateCore(t,time);')<renderer.indexOf('this.updateMechanical(t,time);'),
  'The embryo must be updated before the MAG');
assert(worker.includes('formatx-mag-genesis-three-r1280.js?v=20261028-r2217-studio-spectral-titanium'),
  'Cloudflare must never rewrite the live R533 film back to an older visual');
console.log('GENESIS_R2201_SOURCE_CONTRACT_PASS',JSON.stringify({
  fullNavigationReplay:true,explicitSkip:true,stages:['DNA','cyan/coral cell','four-arm MAG'],
  bothCspLayers:true,hash
}));
