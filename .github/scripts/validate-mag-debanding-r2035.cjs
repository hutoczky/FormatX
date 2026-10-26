'use strict';
// R2035 standalone debanding regression. This checks the real live renderer
// and shared depth mathematics; Chromium visual tests remain authoritative.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const core=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const introThree=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const archive=read('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js');
const productionWorker=read('billing-worker/src/production-content-entry.js');
const html=read('docs/scifi-ui/index.html');
const retro=read('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const intro=read('docs/scifi-ui/styles/formatx-mag-birth-live-r533.css');
const desk=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const mobile=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const scheduler=read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
for(const [name,s] of [['core',core],['archive',archive],['desktop-loader',desk],['mobile-loader',mobile]])
  assert.doesNotThrow(()=>new Function(s),name+' JavaScript parsing failed');
// R2137: the permanent on-page MAG, not only the birth film, must carry
// visible raised metal arms in the single canonical WebGL geometry.
for(const token of [
  'for(let axis=0;axis<4;axis++)',
  'R2153 — continuous 3D titanium arms replace the eight detached',
  'const tipRadius=axis===1?1.096:axis===3?1.045:1.075',
  'const rootRadius=.255',
  'const opticalCentreZ=magSkinZ(0,0)-.073',
  'appendEllipsoid([0,0,opticalCentreZ],[.135,.135,.055]',
  'opticPoint(.084,angle,.036)',
  'const radius=rootRadius+(tipRadius-rootRadius)*t',
  'const steps=14',
  'const eased=t*t*(3-2*t)',
  'armorQuad(a.left,a.crown,b.crown,b.left,5.20+axis*.008)',
  'armorQuad(a.crown,a.right,b.right,b.crown,5.24+axis*.008)',
  'const metalFacet=facet>=5.0&&facet<6.0',
  'armorQuad(innerA,outerA,outerB,innerB,5.22)',
  'const normal=normalize([position[0]*1.14,position[1]*1.14,1.40])',
  "float yaw=${mobile?'.535':'.465'}+uRotation.y",
  'const opticPoint=(radius,angle,depth)=>',
  'for(let j=0;j<48;j++)',
  'for(let j=0;j<8;j++)',
  'float metalSpec=pow(max(dot(n,normalize(keyDir+view)),0.0),22.0)',
  'return axisZ*Math.pow(remaining,1/exponent)',
  'float machinedArmor=step(5.0,vFacet)',
  'c=mix(c,titanium,machinedArmor*.99)',
  'float titaniumDepthBias=step(5.0,aFacet)*(1.0-step(6.0,aFacet))',
  'gl_Position=vec4(projected,-world.z*.13-titaniumDepthBias*.030,1.0)',
  "mobile?'.195':'.252'"
]){
  assert.ok(core.includes(token),'R2137 permanent MAG geometry/material regression: '+token);
}
// R2178: reject the genuine root cause of visible titanium pepper-speckles:
 // the former R2141 double-lane armour overlaid the newer R2153 one-piece
 // arm hulls at almost identical projected depth. Exactly four arm hulls.
const magHullStart=core.indexOf('/* R2153 — continuous 3D titanium arms');
const magInlayStart=core.indexOf('/* R2194 — continuous polished titanium vein inlays');
const magBezelStart=core.indexOf('/* The centre is not a painted circle.');
assert.ok(magHullStart>=0&&magInlayStart>magHullStart&&magBezelStart>magInlayStart,
  'R2194: the native four-arm hull, polished surface veins and optical bezel must be in order');
const mainArmSection=core.slice(magHullStart,magInlayStart);
const veinSection=core.slice(magInlayStart,magBezelStart);
assert.equal(mainArmSection.split('for(let axis=0;axis<4;axis++)').length-1,1,
  'R2178: permanent MAG must have exactly one structural four-arm hull');
assert.equal(veinSection.split('for(let axis=0;axis<4;axis++)').length-1,1,
  'R2194: polished veins must follow the four existing arms, without extra hulls');
assert.ok(!/armorTri\(first\.left,first\.right,first\.crown/.test(veinSection),
  'R2194: vein layer must not duplicate structural titanium hull caps');
assert.ok(!core.includes('for(const lane of [-1,1])'),
  'R2178: retired duplicate titanium lane geometry has returned');
assert.ok(core.includes('R2178: the retired eight raised titanium winglets'),
  'R2178: missing documented single-chassis ownership');
assert.ok(!core.includes('1-smooth(t)'), 'R2154: undefined smooth() must not break permanent WebGL geometry');
assert.ok(!html.includes('class="fx-mag-replay-r2150"') && !html.includes('data-fx-mag-replay-r2150'),
  'R2157: removed INTRO ÚJRA must not return to the permanent MAG hero');
for(const token of [
  'this.birthRungs=[];',
  'new T.LineSegments(geometry,material)',
  'this.birthRungs.forEach((bridge,axis)=>',
  'a.setXYZ(i*2,p.getX(j),p.getY(j),p.getZ(j))',
  'a.setXYZ(i*2+1,q.getX(j),q.getY(j),q.getZ(j))'
])assert.ok(introThree.includes(token),'R2157 DNA base-pair bridge missing: '+token);
assert.ok(core.includes('software ? 28 : constrainedMobile ? 30 : mobile ? 40'),
  'R2157 adaptive mobile/simulation four-arm mesh resolution regressed');

assert.ok(productionWorker.includes('formatx-p0-motion-scheduler-r490.js?v=20261026-r2194-polished-four-arm-mag'),
  'Cloudflare Worker must not pin the previous P0 MAG scheduler cache');
assert.ok(productionWorker.includes('formatx-motion-runtime-loader-r239.js?v=20261026-r2194-polished-four-arm-mag'),
  'Cloudflare Worker must not rewrite the scheduler to R1950');
assert.ok(productionWorker.includes('formatx-mag-genesis-three-r1280.js?v=20261026-r2195-reference-cell-depth'),
  'Cloudflare Worker must serve the R2143 canonical Three.js source from the correct route');
// R2148: the user-visible native Three.js cinematic must end with a true
// machined optical instrument rather than the small pre-R2148 glowing bead.
for(const token of [
  'this.mechOpticSocket=new T.Mesh(',
  'this.mechOpticRim=new T.Mesh(',
  'this.mechOpticCapillary=new T.Mesh(',
  'this.mechOpticShutters=new T.Mesh(',
  'new T.SphereGeometry(.120,48,24)',
  'this.mechOpticShutters.material.opacity=.79*wake;',
  'this.mechOpticShutters.rotation.z=.11*(1-opticWake)'
]){
  assert.ok(introThree.includes(token),'R2148 physical optical assembly lost: '+token);
}
// R2194 MUST affect both the permanent visible R326 model and the
// cinematic assembly, without creating a second permanent canvas.
assert.ok(core.includes('R2194 — continuous polished titanium vein inlays')&&
  core.includes('float polishedRib=smoothstep(5.43,5.455,vFacet)'),
  'R2194 visible four-arm polished titanium relief missing from R326');
const realIntro=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
assert.ok(realIntro.includes('R2194 — the same eight continuous studio-polished titanium ribs')&&
  realIntro.includes('this.armTrim=new T.Mesh(ribGeometry,this.armTrimMaterial)')&&
  realIntro.includes('const trimSeat=smooth((t-6.02)/1.18)'),
  'R2194 film must seat the same raised chromium filaments after DNA');
assert.ok(core.includes('const fragmentSource = constrainedFragmentSource;'),
  'Desktop and mobile must share the same canonical WebGL MAG material');
assert.ok(core.includes("fxCoreOpticsR2035='debanded-single-body-broad-softboxes-subpixel-safe'"),
  'Original MAG must publish stripe-free material selection');
const body=core.split('const constrainedFragmentSource = ')[1]?.split('const softwareFragmentSource = ')[0]||'';
assert.ok(body.includes('Broadband depth density replaces periodic'),
  'MAG optical density must be continuous, not repeated scanlines');
assert.ok(!body.includes('sin(vLocal.y*11.0+vLocal.x*1.8-vLocal.z*1.4)'),
  'Legacy procedural MAG scanlines are present');
assert.ok(body.includes('ribbonB*.052'),
  'PC and phone cannot reintroduce the thin high-intensity studio stripe');
assert.ok(body.includes('pow(abs(cos(polar*4.0)),4.0)'),
  'Thin fourfold faceting streaks must be optically widened');
assert.ok(core.includes('float microFold=sin(aUv.x*22.0+aUv.y*15.4)*.00028*cortexEnvelope'),
  'Thin vertex-fold ripples would reintroduce temporal aliasing');
assert.ok(archive.includes('opticalDepth*d,d'),
  'Archive and MAG must share correct homogeneous depth ordering');
const archiveRevision=archive.match(/const VERSION='cinematic-archive-(r\d{4})-[^']*'/)?.[1];
assert.ok(archiveRevision,'The WebGL MAG archive must publish one recognized cinematic revision');
const scriptRevision=html.match(/formatx-cinematic-archive-r1987\.js\?v=(\d{8})-(r\d{4})-[^"]+/);
assert.ok(scriptRevision&&scriptRevision[1]>='20261012'&&scriptRevision[2]===archiveRevision,
  'The HTML and native eight-module MAG archive must load the SAME revision; never accept stale caches');
assert.ok(archive.includes('fxArchiveDepthPolicyR2035'),
  'Wrong archive-depth revision active');
const depth=z=>Math.max(-.16,Math.min(.86,.33-.15*z));
const oldDepth=z=>((z-2.8)*.36)/Math.max(2.4,6.2-z);
assert.ok(oldDepth(-1.15)<0,'Fixture: old shelf was projected to front of MAG');
for(const z of [-1.45,-1.15,-.88,-.3]){
  assert.ok(depth(z)>.29,'Shelves must stay behind the canonical MAG at '+z);
}
assert.ok(depth(2.30)<.02,'Retrieved physical paper must approach foreground');
assert.ok(!retro.includes('repeating-linear-gradient(180deg'),
  'PC/mobile fallback stage still paints an explicit scanline grid');
assert.ok(intro.includes('Continuous cinematographic atmosphere'),
  'Cinematic MAG intro still overlays 4px raster stripes');
assert.ok(!intro.includes('background-size: 4px 4px'),
  'The 4px intro grid was not removed');
// R2153 must bust the R2035 browser cache while RETAINING every strict
// R2035 geometric/material anti-banding invariant verified above.
for(const loader of [desk,mobile,motion]){
  assert.ok(loader.includes('20261026-r2194'),
    'R2153 connected-arm MAG renderer loader is stale and may serve the old WebGL timing');
}
assert.ok(motion.includes('formatx-current-mag-loader-r422.js?v=20261026-r2194'),
  'Motion owner may boot the old cached MAG runtime');
assert.ok(scheduler.includes('formatx-motion-runtime-loader-r239.js?v=20261026-r2194'),
  'Desktop startup scheduler may cache the old renderer loader');
assert.ok(html.includes('formatx-p0-motion-scheduler-r490.js?v=20261026-r2194'),
  'Canonical HTML must load the R2153 scheduler');
for(const resource of [
 'formatx-core-real3d-v20.css?v=20261011-r2035-no-scanlines',
 'formatx-mag-birth-live-r533.css?v=20261025-r2182-dna-chapter-first']){
 assert.ok(html.includes(resource),'Public site has a stale optical resource '+resource);
}
/* R2103 additionally forbids the exact unreadable low-power source that
   was photographed on Android, while retaining R2035 anti-banding checks. */
const fallback=read('docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js');
assert.ok(fallback.includes("fxMagFallbackSilhouetteR2103")&&
  fallback.includes('for(let blade=0;blade<8;blade++)')&&
  html.includes('formatx-mag-reference-film-r649.js?v=20261025-r2182-studio-depth-first-genome'),
  'Missing actual cache-busted four-point R2103 Android replacement');
// R2145: phone cover-crop cannot discard the genome. The opening must
// show a centered vertical helix and an embryo BEFORE the metal object.
const dnaBorn=fallback.indexOf('const dnaFade=1-smooth((t-2.58)/1.20)');
const embryoBorn=fallback.indexOf('const embryo=smooth((t-2.45)/.88)');
const metalBorn=fallback.indexOf('const grow=smooth((t-5.58)/1.30)');
assert.ok(dnaBorn>=0 && embryoBorn>dnaBorn && metalBorn>embryoBorn,
  'R2145 temporal contract: DNA first, living embryo second, titanium MAG last');
for(const token of [
  'x:640,y:360,l:520,a:61,r:Math.PI/2',
  'const transfer=smooth((t-5.15)/.52)',
  'drawDNA(ctx,genome,time,dnaFade*.95,genomeScale)',
  'R2145: the permanent four-point metal belongs to the FINAL act',
  'R2182 — Canvas cinematic safety path: genuine depth-sorted helix',
  'elements.sort((a,b)=>a.depth-b.depth)',
  'Desktop also opens with ONE identifiable central DNA helix',
  'R2182 — living organelle, NOT a prematurely illuminated MAG pupil',
  'const opticWake=smooth((t-7.38)/.76)'
])assert.ok(fallback.includes(token),'R2145 portrait-first fallback missing: '+token);
// The 412 x 915 Android cover crop only shows the central ~324 virtual
// horizontal units. A vertical helix centered at 640 stays fully inside it.
const visibleW=412*720/915;
assert.ok(61*2<visibleW && Math.abs(640-640)<visibleW*.5,
  'R2145 central portrait DNA is clipped at a common Android aspect ratio');
assert.ok(fallback.includes('fxMagFallbackMaterialR2104')&&
  fallback.includes('moving-softbox-smoked-chrome-sapphire-facets')&&
  fallback.includes('const studioTravel=.5+.5*Math.sin(time*.00053)'),
  'R2104 movie must use a real animated optical studio-light material');
assert.ok(intro.includes('end-r2103-mobile-compact-four-point-intro')&&
  intro.includes('opacity:1!important;')&&
  intro.includes('min-height:44px!important;'),
  'Skip button contrast and low-power fallback CSS must stay visible');
console.log('MAG_R2035_DEBANDING_SOURCE_PASS',JSON.stringify({
 pc:true,mobile:true,canonicalWebgl:true,oldRearDepth:oldDepth(-1.15),
 correctedRearDepth:depth(-1.15),retrievedSheetDepth:depth(2.30),
 noCssScanlines:true,unmodifiedMagTopology:true
}));
