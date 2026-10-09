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
  const missingAssets=[];
  let apiRequests=0;

  page.on('response',response=>{
    if(response.status()===404)missingAssets.push(new URL(response.url()).pathname);
  });

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

  await page.locator('#network').scrollIntoViewIfNeeded();
  await page.locator('[data-net-start]').click();

  await page.waitForFunction(()=>{
    const el=document.querySelector('#network');
    return el?.getAttribute('data-fx-net-state')==='complete';
  },null,{timeout:90000});

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
  assert.deepEqual(meaningful,[],`Missing assets: ${JSON.stringify([...new Set(missingAssets)])}`);

  await context.close();
  await browser.close();
  console.log(JSON.stringify({ok:true,apiRequests,quality}));
})().catch(error=>{console.error(error);process.exit(1);});
