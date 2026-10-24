'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const path=require('node:path');

const html=fs.readFileSync('docs/genesis/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const home=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const take=(pattern,label)=>{const match=html.match(pattern);assert(match,'Missing Genesis '+label);return match[1]};
const styles=take(/<style>([\s\S]*?)<\/style>/,'embedded CSS');
const imports=take(/<script type="importmap">([\s\S]*?)<\/script>/,'Three.js import map');
const moduleSource=take(/<script type="module">([\s\S]*?)<\/script>/,'application module');
const sha=s=>"'sha256-"+crypto.createHash('sha256').update(s,'utf8').digest('base64')+"'";
for(const [kind,body] of [['style',styles],['importmap',imports],['module',moduleSource]]){
  const hash=sha(body);
  assert(worker.includes(hash),'Production Worker lacks exact Genesis '+kind+' CSP hash '+hash);
  console.log('GENESIS_CSP '+kind+' '+hash);
}
assert(worker.includes('isGenesis ? GENESIS_CSP : HEADER_CSP'),'Original /genesis/ must keep its own CSP even with an additional Genesis Studio route');
assert(worker.includes('if (!isGenesis && !isGenesisStudio) html = normalizeMetaCsp(html);'),'Either Genesis film must bypass production homepage meta-CSP rewriting');
assert(home.includes('fx-genesis-entrance')&&home.includes('/genesis/index.html'),'Main site has no visible Genesis hero entrance');
assert(html.includes('href="/scifi-ui/assets/images/formatx-icon-80.png"'), 'Genesis must declare the existing site favicon rather than requesting a missing root favicon.ico');
for(const token of [
  'const N=9600;','new THREE.Points(','new UnrealBloomPass(','new OrbitControls(',
  'gsap.timeline(','new THREE.ShaderMaterial(','AudioContext','addEventListener',
  'uMorph','makeParticles','makeNucleus','progress','cameraMode','toggleSound'
])assert(moduleSource.includes(token),'Genesis missing feature '+token);
const result=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:moduleSource,encoding:'utf8'});
assert.equal(result.status,0,'Genesis module syntax invalid: '+result.stderr);
// R2179: the filmed nucleus must keep fine particle structure instead of
// saturating into a featureless white plate; editorial typography must not
// split the six-letter title into disconnected vertical columns.
for(const token of [
  'renderer.toneMappingExposure=.87;',
  'bloom.threshold=.46;bloom.radius=.46;bloom.strength=.56;',
  'bloom.strength=.49+.12*state.glow+.018*Math.sin(elapsed*.7);',
  'particles.material.uniforms.uOpacity.value=.92-.32*smooth((t-3.6)/3.0);'
])assert(moduleSource.includes(token),'R2179 cinematic nucleus grade regressed: '+token);
assert(styles.includes('h1 span{display:inline;letter-spacing:-.075em}'),
  'R2179 GENESIS masthead must be continuous, not stacked letters');
assert(styles.includes('line-height:.94;white-space:nowrap;'),
  'R2179 GENESIS masthead must fit as one studio editorial word');
JSON.parse(imports);
console.log('GENESIS_SOURCE_PASS',{particles:9600,embeddedCss:styles.length,moduleLength:moduleSource.length,importmap:true});

async function live(){
  const {chromium}=require('playwright');
  const root=(process.env.FORMATX_TEST_URL||'https://formatxsuite.com').replace(/\/+$/,'');
  const out=process.env.FORMATX_GENESIS_EVIDENCE_DIR||'artifacts/live-genesis';
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({
    executablePath:process.env.CHROME_BIN||undefined,
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader-webgl','--enable-unsafe-swiftshader']
  });
  try{
    for(const profile of [
      {id:'desktop',viewport:{width:1440,height:900},isMobile:false},
      {id:'mobile',viewport:{width:390,height:844},isMobile:true}
    ]){
      const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile,deviceScaleFactor:profile.isMobile?1:1.5,reducedMotion:'no-preference'});
      const page=await context.newPage();
      const errors=[];
      const failedResponses=[];
      page.on('pageerror',e=>errors.push('pageerror '+String(e)));
      page.on('response',response=>{
        if(response.status()>=400)failedResponses.push(response.status()+' '+response.url());
      });
      page.on('requestfailed',request=>{
        failedResponses.push('requestfailed '+request.url()+' '+(request.failure()?.errorText||''));
      });
      page.on('console',m=>{
        if(m.type()==='error')errors.push('console '+m.text()+' @ '+m.location().url);
      });
      const url=root+'/genesis/index.html?proof='+profile.id+'&rev='+Date.now();
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
      assert.equal(response?.status(),200,'Genesis route is not HTTP 200: '+url);
      await page.waitForFunction(()=>document.documentElement.dataset.genesisReady==='true',{timeout:45000}).catch(async error=>{
        const debug=await page.evaluate(()=>({loading:document.getElementById('loadingText')?.textContent,fallback:document.getElementById('fallback')?.className,src:[...document.scripts].map(s=>s.src||s.type)}));
        fs.writeFileSync(path.join(out,profile.id+'-bootstrap-failure.json'),JSON.stringify({debug,errors,error:String(error)},null,2));
        throw error;
      });
      const initial=await page.evaluate(()=>({
        count:Number(document.documentElement.dataset.genesisParticles),
        canvas:document.querySelectorAll('#viewport').length,
        title:document.title,
        width:document.documentElement.scrollWidth,
        innerWidth:innerWidth,
        phase:document.getElementById('actTitle')?.textContent,
        shader:document.querySelectorAll('script[type^="x-shader"]').length
      }));
      assert.equal(initial.count,9600,'Incorrect 3D points count');
      assert.equal(initial.canvas,1,'Expected one full-screen WebGL canvas');
      assert.equal(initial.shader,4,'Missing source-embedded shaders');
      assert.ok(initial.width<=initial.innerWidth+2,'Horizontal overflow on '+profile.id);
      await page.locator('#play').click();
      await page.locator('#progress').evaluate(input=>{
        input.value='8.5';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      });
      await page.waitForTimeout(500);
      const final=await page.evaluate(()=>({
        progress:Number(document.getElementById('progress').value),
        phase:document.getElementById('actTitle').textContent,
        renderingCanvas:document.querySelector('#viewport').width,
        opacity:getComputedStyle(document.querySelector('#viewport')).opacity,
        viewLabel:document.getElementById('cameraMode').textContent
      }));
      assert.ok(final.progress>8.4,'Genesis timeline seeking did not reach cell nucleus');
      assert.ok(final.phase.includes('SZÜLETÉS'),'Genesis did not enter nucleus finale phase: '+final.phase);
      await page.screenshot({path:path.join(out,profile.id+'-nucleus.png'),fullPage:false});
      await page.locator('#cameraMode').click();
      await page.waitForTimeout(280);
      assert.ok((await page.locator('#cameraMode').textContent()).includes('FILMES KAMERA'),'Camera view control failed');
      assert.deepEqual(errors,[],'Genesis browser errors on '+profile.id+': '+errors.join(' | ')+'; failed requests: '+failedResponses.join(' | '));
      fs.writeFileSync(path.join(out,profile.id+'.json'),JSON.stringify({initial,final,errors,failedResponses,url},null,2));
      await context.close();
      console.log('GENESIS_BROWSER_PASS',profile.id,JSON.stringify({count:initial.count,phase:final.phase,errors:errors.length}));
    }
  }finally{await browser.close();}
}
if(process.env.FORMATX_TEST_URL)live().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
