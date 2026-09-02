'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_VISUAL_DIR||'artifacts/content-visuals';
const VIEWPORTS=[
  {name:'phone-320',width:320,height:700,mobile:true},
  {name:'phone-360',width:360,height:800,mobile:true},
  {name:'phone-390',width:390,height:844,mobile:true},
  {name:'phone-430',width:430,height:932,mobile:true},
  {name:'tablet-768',width:768,height:1024,mobile:true},
  {name:'desktop-1024',width:1024,height:768,mobile:false},
  {name:'desktop-1366',width:1366,height:768,mobile:false},
  {name:'desktop-1440',width:1440,height:900,mobile:false},
  {name:'desktop-1920',width:1920,height:1080,mobile:false}
];
const STOPS=['#hero','.fx-category-deck--standalone','#experience','#capabilities','#pricing','#system','#resources','footer.site-footer'];

function overlaps(a,b,gap=0){
  if(!a||!b)return false;
  return !(a.right+gap<=b.left||b.right+gap<=a.left||a.bottom+gap<=b.top||b.bottom+gap<=a.top);
}

async function visibleBox(page,selector,required=false){
  const loc=page.locator(selector).first();
  if(!(await loc.count())){if(required)throw new Error('Missing '+selector);return null;}
  const v=await loc.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,visible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>0&&r.height>0,text:(el.textContent||'').trim()};});
  if(required)assert(v.visible,'Not visible: '+selector+' '+JSON.stringify(v));
  return v.visible?v:null;
}

async function assertHeaderAndHeroControls(page,profile){
  const header=[
    ['brand',await visibleBox(page,'.topbar > .brand')],
    ['mag',await visibleBox(page,'.fx-reference-mag-button')],
    ['lang',await visibleBox(page,'.fx-language-toggle')],
    ['menu',await visibleBox(page,'.fx-reference-menu-button,#menu-toggle')]
  ].filter(([,v])=>v);
  for(let i=0;i<header.length;i++)for(let j=i+1;j<header.length;j++)assert(!overlaps(header[i][1],header[j][1],2),`${profile.name} header overlap ${header[i][0]} / ${header[j][0]}: ${JSON.stringify({a:header[i],b:header[j]})}`);

  const controls=await visibleBox(page,'#hero .fx-reference-controls-r204');
  const sound=await visibleBox(page,'#hero .fx-reference-controls-r204 .fx-three-sound');
  const ask=await visibleBox(page,'#hero .fx-reference-controls-r204 .fx-reference-ask');
  const pause=await visibleBox(page,'#hero .fx-reference-controls-r204 .fx-reference-pause');
  const row=[['sound',sound],['ask',ask],['pause',pause]].filter(([,v])=>v);
  if(row.length===3){
    for(const [,v] of row){
      assert(v.left>=-1&&v.right<=profile.width+1,`${profile.name} hero control leaves viewport: ${JSON.stringify(v)}`);
      assert(v.width>=44&&v.height>=44,`${profile.name} hero control below touch target: ${JSON.stringify(v)}`);
    }
    assert(!overlaps(sound,ask,2),`${profile.name} SOUND/ASK overlap`);
    assert(!overlaps(ask,pause,2),`${profile.name} ASK/PAUSE overlap`);
    assert(Math.abs(sound.top-ask.top)<=8&&Math.abs(ask.top-pause.top)<=8,`${profile.name} controls are not one row`);
    if(controls)assert(controls.left>=-1&&controls.right<=profile.width+1,`${profile.name} control group leaves viewport`);
  }
}

async function activateNativeMag(page,profile){
  const surface=page.locator('#hero .hero-space').first();
  await surface.waitFor({state:'visible',timeout:10000});
  const box=await surface.boundingBox();
  assert(box&&box.width>80&&box.height>80,`${profile.name} MAG surface has no usable pointer geometry: ${JSON.stringify(box)}`);
  await page.mouse.click(box.x+box.width*.5,box.y+box.height*.5);
  await page.waitForFunction(()=>{
    const root=document.documentElement;
    const canvas=document.querySelector('#hero .fx-core-mobile-v55-canvas,#hero .fx-core-r120-canvas,#hero .fx-crystal-organism-r326-canvas');
    return root.dataset.fxCoreCompositionR285==='pure-webgl3d-no-2d-overlays'&&canvas;
  },null,{timeout:15000});
  console.log(`PASS ${profile.name}: genuine pointer on visible MAG surface activated native WebGL`);
}

async function assertPure3d(page,profile){
  const state=await page.evaluate(()=>{
    const root=document.documentElement;
    const heroSpace=document.querySelector('#hero .hero-space');
    const stage=document.querySelector('#hero .fx-core-mobile-v55-stage,#hero .fx-core-r120-stage,#hero .fx-crystal-organism-r326-stage');
    const canvas=document.querySelector('#hero .fx-core-mobile-v55-canvas,#hero .fx-core-r120-canvas,#hero .fx-crystal-organism-r326-canvas');
    const before=heroSpace?getComputedStyle(heroSpace,'::before'):null;
    const after=heroSpace?getComputedStyle(heroSpace,'::after'):null;
    const visible=el=>{if(!(el instanceof Element))return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>0&&r.height>0;};
    const legacy=[...document.querySelectorAll('#hero .fx-core-detail-r122,#hero .fx-core-live-r147-layer,#hero .fx-r155-heartbeat-core,#hero .fx-r155-heartbeat-ring,#hero .fx-r155-heartbeat-wave,#hero [class^="fx-r168-"],#hero [class*=" fx-r168-"]')];
    let context='none';
    try{const gl=canvas?.getContext?.('webgl2')||canvas?.getContext?.('webgl');if(gl)context=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext?'webgl2':'webgl1';}catch(_){context='error';}
    return{
      composition:root.dataset.fxCoreCompositionR285||'',renderer:root.dataset.fxCoreRenderer||'',real3d:root.dataset.fxCoreReal3d||'',context,
      stageChildren:stage?[...stage.children].map(el=>({tag:el.tagName,className:el.className,visible:visible(el)})):[],
      legacyVisible:legacy.filter(visible).map(el=>el.className),
      detailCount:document.querySelectorAll('#hero .fx-core-detail-r122').length,
      liveLayerCount:document.querySelectorAll('#hero .fx-core-live-r147-layer').length,
      before:{content:before?.content||'',background:before?.backgroundImage||''},after:{content:after?.content||'',background:after?.backgroundImage||''}
    };
  });
  assert.equal(state.composition,'pure-webgl3d-no-2d-overlays',`${profile.name} pure-3D marker missing: ${JSON.stringify(state)}`);
  assert.match(state.renderer,/webgl/i,`${profile.name} renderer is not WebGL: ${JSON.stringify(state)}`);
  assert.match(state.context,/webgl[12]/,`${profile.name} no active WebGL context: ${JSON.stringify(state)}`);
  assert.deepEqual(state.legacyVisible,[],`${profile.name} visible 2D MAG layer: ${JSON.stringify(state)}`);
  assert.equal(state.detailCount,0,`${profile.name} 2D detail canvas exists`);
  assert.equal(state.liveLayerCount,0,`${profile.name} DOM live-motion layer exists`);
  for(const pseudo of [state.before,state.after]){
    assert(pseudo.content==='none'||pseudo.content==='normal'||pseudo.content==='',`${profile.name} hero-space pseudo paints content: ${JSON.stringify(state)}`);
    assert(pseudo.background==='none'||pseudo.background==='',`${profile.name} hero-space pseudo paints a 2D background: ${JSON.stringify(state)}`);
  }
}

async function scanInformation(page,label){
  const result=await page.evaluate(()=>{
    const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;};
    const ownText=el=>[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent||'').join(' ').replace(/\s+/g,' ').trim();
    const info=[...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,label,small,th,td,output')].filter(el=>visible(el)&&((ownText(el)||(el.textContent||'').trim()).length>0));
    const clipped=[];
    for(const el of info){
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      const clipX=(s.overflowX==='hidden'||s.overflowX==='clip')&&el.scrollWidth>el.clientWidth+2;
      const clipY=(s.overflowY==='hidden'||s.overflowY==='clip')&&el.scrollHeight>el.clientHeight+2;
      const outside=r.left<-2||r.right>innerWidth+2;
      if(clipX||clipY||outside||s.textOverflow==='ellipsis')clipped.push({tag:el.tagName,id:el.id||'',className:typeof el.className==='string'?el.className.slice(0,120):'',text:(el.textContent||'').trim().slice(0,120),clipX,clipY,outside,left:r.left,right:r.right,width:r.width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});
    }
    const overlays=[...document.querySelectorAll('body *')].filter(el=>{if(!visible(el))return false;const s=getComputedStyle(el);if(s.position!=='fixed'&&s.position!=='sticky')return false;const r=el.getBoundingClientRect();return r.width*r.height>500;});
    const alpha=color=>{const m=String(color).match(/rgba?\([^,]+,[^,]+,[^,]+(?:,\s*([\d.]+))?\)/);return m?(m[1]===undefined?1:Number(m[1])):0;};
    const occluded=[];
    for(const infoEl of info){
      const a=infoEl.getBoundingClientRect(),area=Math.max(1,a.width*a.height);
      for(const overlay of overlays){
        if(overlay===infoEl||overlay.contains(infoEl)||infoEl.contains(overlay))continue;
        const b=overlay.getBoundingClientRect(),left=Math.max(a.left,b.left),right=Math.min(a.right,b.right),top=Math.max(a.top,b.top),bottom=Math.min(a.bottom,b.bottom);
        if(right<=left||bottom<=top)continue;
        const intersection=(right-left)*(bottom-top);if(intersection<120||intersection/area<.18)continue;
        const s=getComputedStyle(overlay),painted=alpha(s.backgroundColor)>.08||s.backgroundImage!=='none'||s.backdropFilter!=='none'||s.boxShadow!=='none'||s.borderTopWidth!=='0px'||(overlay.textContent||'').trim().length>0;if(!painted)continue;
        const x=Math.max(1,Math.min(innerWidth-1,(left+right)/2)),y=Math.max(1,Math.min(innerHeight-1,(top+bottom)/2));
        const stack=document.elementsFromPoint(x,y),overlayIndex=stack.findIndex(el=>el===overlay||overlay.contains(el)),infoIndex=stack.findIndex(el=>el===infoEl||infoEl.contains(el));
        if(overlayIndex!==-1&&(infoIndex===-1||overlayIndex<infoIndex))occluded.push({info:{tag:infoEl.tagName,id:infoEl.id||'',text:(infoEl.textContent||'').trim().slice(0,100)},overlay:{tag:overlay.tagName,id:overlay.id||'',className:typeof overlay.className==='string'?overlay.className.slice(0,90):''},ratio:Number((intersection/area).toFixed(3))});
      }
    }
    return{clipped:clipped.slice(0,30),occluded:occluded.slice(0,30),scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
  });
  assert(result.scrollWidth-result.clientWidth<=2,`${label} horizontal overflow: ${JSON.stringify(result)}`);
  assert.deepEqual(result.clipped,[],`${label} clipped information: ${JSON.stringify(result.clipped)}`);
  assert.deepEqual(result.occluded,[],`${label} fixed/sticky layer covers information: ${JSON.stringify(result.occluded)}`);
}

async function runProfile(browser,profile){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:profile.mobile,hasTouch:profile.mobile,deviceScaleFactor:profile.mobile?2:1,colorScheme:'dark',reducedMotion:'no-preference'});
  await context.addInitScript(()=>{try{localStorage.setItem('formatx:intro-seen-v1','1');}catch(_){}});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/WebGL|WebGPU|favicon|404|ERR_ABORTED/i.test(m.text()))errors.push(m.text());});
  try{
    await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForSelector('#hero',{timeout:10000});await page.waitForTimeout(800);
    await activateNativeMag(page,profile);await assertPure3d(page,profile);await assertHeaderAndHeroControls(page,profile);
    for(const selector of STOPS){const target=page.locator(selector).first();if(!(await target.count()))continue;await target.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'}));await page.waitForTimeout(120);await scanInformation(page,`${profile.name}:${selector}`);}
    await page.evaluate(()=>scrollTo({top:0,left:0,behavior:'auto'}));await page.waitForTimeout(100);assert.deepEqual(errors,[],`${profile.name} browser errors: ${JSON.stringify(errors)}`);
    console.log(`PASS ${profile.name}: interaction-activated pure WebGL MAG + no clipped/covered information`);
  }catch(error){await fs.mkdir(OUT,{recursive:true});await page.screenshot({path:path.join(OUT,`occlusion-failure-${profile.name}.png`),fullPage:true}).catch(()=>{});throw error;}finally{await context.close();}
}

(async()=>{await fs.mkdir(OUT,{recursive:true});const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});try{for(const profile of VIEWPORTS)await runProfile(browser,profile);}finally{await browser.close();}console.log('PASS: 320–1920px browser matrix has interaction-activated pure WebGL MAG and no detected information clipping or fixed/sticky occlusion.');})().catch(error=>{console.error(error.stack||error);process.exit(1);});
