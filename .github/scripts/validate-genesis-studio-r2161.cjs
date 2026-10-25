'use strict';
// R2161 — source + live-Chromium proof of the independent 9000-point studio film.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process'),path=require('node:path');
const html=fs.readFileSync('docs/scifi-ui/genesis/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const home=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const homeAudioStyle=fs.readFileSync('docs/scifi-ui/styles/formatx-genesis-studio-r2160.css','utf8');
const embeddedHomeAudio=home.match(/<style data-fx-genesis-studio-r2160="true">([\s\S]*?)<\/style>/)?.[1];
assert.equal(embeddedHomeAudio,homeAudioStyle,'Homepage cinematic audio control CSS must remain byte-exact inline');
assert(!home.includes('<link rel="stylesheet" href="/scifi-ui/styles/formatx-genesis-studio-r2160.css'),'Homepage must not block its parser on the cinematic audio CSS request');
const homeAudioHash="'sha256-"+crypto.createHash('sha256').update(homeAudioStyle,'utf8').digest('base64')+"'";
assert(home.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1].includes(homeAudioHash),'Homepage CSP is missing exact cinematic audio style hash');
assert(worker.includes(`const INLINE_GENESIS_AUDIO_STYLE_HASH = "${homeAudioHash}"`),'Worker is missing exact cinematic audio style hash');
assert(worker.match(/const META_CSP = `([\s\S]*?)`;/)?.[1].includes('${INLINE_GENESIS_AUDIO_STYLE_HASH}'),'Worker META_CSP does not authorize cinematic audio style');
assert(worker.match(/const HEADER_CSP = \[([\s\S]*?)\]\.join/)?.[1].includes('${INLINE_GENESIS_AUDIO_STYLE_HASH}'),'Worker HEADER_CSP does not authorize cinematic audio style');
const take=(regex,label)=>{const x=html.match(regex);assert(x,'Studio HTML lacks '+label);return x[1];};
const style=take(/<style>([\s\S]*?)<\/style>/,'embedded style');
const imports=take(/<script type="importmap">([\s\S]*?)<\/script>/,'Three.js import map');
const source=take(/<script type="module">([\s\S]*?)<\/script>/,'inline 3D module');
for(const [label,value] of [['style',style],['importmap',imports],['module',source]]){
  const hash="'sha256-"+crypto.createHash('sha256').update(value,'utf8').digest('base64')+"'";
  assert(worker.includes(hash),'Studio '+label+' CSP SHA-256 has drifted: '+hash);
}
assert(worker.includes("GENESIS_STUDIO_PATHS.has(url.pathname)"),'Studio route must use explicit CSP');
assert(worker.includes("GENESIS_STUDIO_CSP"),'Studio needs a separately scoped CDN policy');
assert(worker.includes("if (!isGenesis && !isGenesisStudio)"),'Homepage CSP must not rewrite Studio HTML');
// R2187: the hero CTA intentionally replays the canonical production DNA-to-MAG\n// birth film; the independent 9000-point Genesis Studio retains its own route.\nassert(home.includes('fx-genesis-entrance" href="/?intro=1"'),'Main hero must replay the real DNA-to-MAG birth film');
JSON.parse(imports);
for(const token of [
 'const COUNT=9000','new THREE.Points(','new UnrealBloomPass(','new EffectComposer(','new OrbitControls(',
 'gsap.timeline(','new THREE.ShaderMaterial(','AudioContext','uMorph','aOuter',
 '.addLabel(\'dna\',0)','.addLabel(\'morph\',3)','.addLabel(\'nucleus\',7)',
 'id="play"','id="progress"','id="view"','id="sound"'
])assert(html.includes(token),'Missing Studio feature '+token);
assert(!source.includes('gl_VertexID'),'WebGL1-compatible shader must not use gl_VertexID');
const syntax=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
assert.equal(syntax.status,0,'Invalid Studio module: '+syntax.stderr);
console.log('GENESIS_STUDIO_SOURCE_PASS',JSON.stringify({particles:9000,styleBytes:style.length,scriptBytes:source.length,isolatedCsp:true}));

async function verifyLive(){
 const {chromium}=require('playwright');
 const base=(process.env.FORMATX_TEST_URL||'https://formatxsuite.com').replace(/\/+$/,'');
 const out=process.env.FORMATX_GENESIS_STUDIO_EVIDENCE_DIR||'artifacts/live-genesis-studio';
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader-webgl','--enable-unsafe-swiftshader']});
 try{
  for(const profile of [{id:'desktop',width:1440,height:900,isMobile:false},{id:'mobile',width:390,height:844,isMobile:true}]){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.isMobile,deviceScaleFactor:1,reducedMotion:'no-preference',locale:'hu-HU'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   page.on('console',m=>{if(m.type()==='error'&&!/favicon|WebGL|GPU|swiftshader|permissions policy/i.test(m.text()))errors.push(m.text());});
   const url=base+'/scifi-ui/genesis/index.html?proof='+profile.id+'&v='+Date.now();
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(response?.status(),200,'Studio returned '+response?.status()+': '+url);
   await page.waitForFunction(()=>window.__formatxGenesis?.getParticles()===9000,null,{timeout:45000});
   const start=await page.evaluate(()=>({count:window.__formatxGenesis.getParticles(),canvas:document.querySelectorAll('#webgl').length,overflow:document.documentElement.scrollWidth-innerWidth,loading:document.querySelector('#load')?.classList.contains('ready')}));
   assert.equal(start.count,9000,'Studio particle count');
   assert.equal(start.canvas,1,'Studio should have a single WebGL canvas');
   assert.ok(start.overflow<=2,'Studio horizontal overflow '+start.overflow);
   assert.equal(start.loading,true,'Studio loading layer still visible');
   await page.evaluate(()=>window.__formatxGenesis.seek(4.8));
   const mid=await page.evaluate(()=>({morph:window.__formatxGenesis.getMorph(),chapter:document.querySelector('#chapterPhase')?.textContent}));
   assert.ok(mid.morph>.20 && mid.morph<.85,'DNA-to-nucleus midpoint is not interpolated: '+mid.morph);
   await page.evaluate(()=>window.__formatxGenesis.seek(9.0));
   const end=await page.evaluate(()=>({morph:window.__formatxGenesis.getMorph(),chapter:document.querySelector('#chapterPhase')?.textContent,progress:Number(document.querySelector('#progress').value)}));
   assert.ok(end.morph>.99,'Finished nucleus never assembled');
   assert.equal(end.chapter,'Ébredés','Final chapter not rendered');
   await page.screenshot({path:path.join(out,profile.id+'-nucleus.png')});
   await page.locator('#view').click();
   assert.equal(await page.locator('#view').getAttribute('aria-pressed'),'true','OrbitControls toggle broken');
   await page.locator('#sound').click();
   assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false','Audio mute toggle broken');
   assert.deepEqual(errors,[],'Studio browser errors: '+errors.join(' | '));
   fs.writeFileSync(path.join(out,profile.id+'.json'),JSON.stringify({start,mid,end,errors,url},null,2));
   await context.close();
   console.log('GENESIS_STUDIO_BROWSER_PASS',profile.id,JSON.stringify({count:start.count,midMorph:mid.morph,finalMorph:end.morph}));
  }
 }finally{await browser.close();}
}
if(process.env.FORMATX_TEST_URL)verifyLive().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
