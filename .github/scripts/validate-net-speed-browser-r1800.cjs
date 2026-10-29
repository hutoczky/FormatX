const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const TEST_URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1280,height:900},locale:'hu-HU',reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');}catch(_){}
  });
  const page=await context.newPage();
  const errors=[];
  let apiRequests=0;

  page.on('pageerror',error=>errors.push(String(error)));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});

  await page.route('**/api/net/**',async route=>{
    apiRequests+=1;
    const request=route.request();
    const url=new URL(request.url());
    if(url.pathname==='/api/net/ping'){
      await route.fulfill({
        status:200,
        contentType:'application/json',
        body:JSON.stringify({ok:true,now:Date.now(),edge:'TEST',protocol:'HTTP/3'})
      });
      return;
    }
    if(url.pathname==='/api/net/download'){
      const requested=Math.max(65536,Math.min(8*1024*1024,Number(url.searchParams.get('bytes'))||1024*1024));
      await route.fulfill({
        status:200,
        contentType:'application/octet-stream',
        headers:{'Content-Length':String(requested),'Cache-Control':'no-store'},
        body:Buffer.alloc(requested,0x5a)
      });
      return;
    }
    if(url.pathname==='/api/net/upload'){
      const bytes=request.postDataBuffer()?.byteLength||0;
      await route.fulfill({
        status:200,
        contentType:'application/json',
        body:JSON.stringify({ok:true,bytes,edge:'TEST',protocol:'HTTP/3'})
      });
      return;
    }
    await route.fulfill({status:404,contentType:'application/json',body:'{"ok":false}'});
  });

  await page.goto(TEST_URL+'?lighthouse=1&net-test=r1800',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('[data-fx-net-speed-r1800="true"]',{state:'attached',timeout:15000});

  assert.equal(apiRequests,0,'NET test must not generate traffic before explicit user action');
  assert.equal(await page.locator('#network').getAttribute('data-fx-net-state'),'idle');
  // R2238: prove the heavy controller is NOT booted far below the fold.
  // The scroll below immediately exercises the genuine first-click replay.
  const initial=await page.evaluate(()=>{
    const section=document.getElementById('network');
    const rect=section.getBoundingClientRect();
    return {
      farBelow:rect.top>innerHeight+800,
      loader:section.dataset.fxNetLoaderR2238||'',
      controller:section.dataset.fxNetBoundR1800||'',
      heavyScript:!!document.querySelector(
        'script[src*="formatx-net-speed-r1800.js"]'
      )
    };
  });
  assert.ok(initial.loader,'NET must have an active viewport/intent loader');
  if(initial.farBelow){
    assert.equal(initial.heavyScript,false,
      'Heavy NET benchmark script must not execute on first hero paint');
    assert.equal(initial.controller,'',
      'Controller must not bind offscreen on first hero paint');
  }

  await page.locator('#network').scrollIntoViewIfNeeded();
  await page.locator('[data-net-start]').click();

  // R2239: distinguish a failed lazy bootstrap from a real measurement
  // failure. The old 90-second timeout hid the actual browser state and
  // console diagnostics, so no functional cause could be established.
  try{
    await page.waitForFunction(()=>{
      const el=document.querySelector('#network');
      return ['complete','error','cancelled'].includes(
        el?.getAttribute('data-fx-net-state')
      )||['bind-failed','load-failed'].includes(
        el?.getAttribute('data-fx-net-loader-r2238')
      );
    },null,{timeout:45000});
  }catch(error){
    const state=await page.evaluate(()=>{
      const el=document.querySelector('#network');
      const btn=el?.querySelector('[data-net-start]');
      return {
        state:el?.dataset.fxNetState,
        loader:el?.dataset.fxNetLoaderR2238,
        bound:el?.dataset.fxNetBoundR1800,
        status:el?.querySelector('[data-net-status]')?.textContent,
        startDisabled:btn?.disabled,
        startVisible:!!(btn?.getClientRects().length),
        loadingScripts:[...document.scripts].filter(
          s=>s.src.includes('formatx-net-speed')
        ).map(s=>s.src),
        documentReady:document.readyState,
        viewport:[innerWidth,innerHeight],
        networkTop:el?.getBoundingClientRect().top
      };
    });
    console.error('FORMATX_NET_R2239_TIMEOUT_DIAGNOSTICS',
      JSON.stringify({state,apiRequests,errors}));
    throw error;
  }
  const finalState=await page.locator('#network').getAttribute('data-fx-net-state');
  if(finalState!=='complete'){
    console.error('FORMATX_NET_R2239_FAILURE_DIAGNOSTICS',
      JSON.stringify({
        finalState,apiRequests,errors,
        loader:await page.locator('#network').getAttribute('data-fx-net-loader-r2238'),
        bound:await page.locator('#network').getAttribute('data-fx-net-bound-r1800'),
        status:await page.locator('[data-net-status]').textContent()
      }));
  }
  assert.equal(finalState,'complete','NET must finish the first user-initiated test');

  assert.equal(await page.locator('#network').getAttribute('data-fx-net-loader-r2238'),
    'loaded','First scroll or click must bootstrap the real meter exactly once');
  assert.ok(apiRequests>=30,'Expected parallel ping/download/upload traffic after user action');
  for(const selector of ['[data-net-ping]','[data-net-jitter]','[data-net-download]','[data-net-down-latency]','[data-net-upload]','[data-net-up-latency]']){
    const value=(await page.locator(selector).textContent()||'').trim();
    assert.notEqual(value,'—',selector+' should contain a measured value');
  }
  const quality=(await page.locator('[data-net-quality]').textContent()||'').trim();
  assert.match(quality,/\/100$/);
  assert.equal(await page.locator('[data-net-copy]').isDisabled(),false);
  assert.match((await page.locator('[data-net-edge]').textContent()||''),/TEST/);

  const meaningful=errors.filter(x=>!/favicon|WebGL|WebGPU|GPU|Permissions policy/i.test(x));
  assert.deepEqual(meaningful,[]);

  await context.close();
  await browser.close();
  console.log(JSON.stringify({ok:true,apiRequests,quality}));
})().catch(error=>{console.error(error);process.exit(1);});
