'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');
const html=fs.readFileSync(path.join(__dirname,'../../docs/scifi-ui/index.html'),'utf8');
const charset=/<meta\s+charset="utf-8"\s*>/i.exec(html);
assert(charset&&Buffer.byteLength(html.slice(0,charset.index+charset[0].length),'utf8')<=1024,
  'The real HTML must declare UTF-8 within its first 1024 bytes, including on a static server without an HTTP charset');
const source=fs.readFileSync(path.join(__dirname,'../../docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js'),'utf8');
const start=source.indexOf('  function setLegacyHeroReservation(');
const end=source.indexOf('  function setLegacyHeroHidden(',start);
assert(start>0&&end>start,'The actual hero reservation owner is missing');
const helper=source.slice(start,end);
class ElementStub{
  constructor(height,value='',priority=''){
    this.height=height;this.reads=0;this.writes=0;
    this.values=new Map([['opacity',['.61','important']]]);
    if(value)this.values.set('min-height',[value,priority]);
    this.style={
      getPropertyValue:name=>this.values.get(name)?.[0]||'',
      getPropertyPriority:name=>this.values.get(name)?.[1]||'',
      setProperty:(name,next,nextPriority)=>{this.writes++;this.values.set(name,[next,nextPriority||'']);},
      removeProperty:name=>{this.writes++;this.values.delete(name);}
    };
  }
  getBoundingClientRect(){this.reads++;return{height:this.height};}
}
const sandbox={HTMLElement:ElementStub};
vm.runInNewContext('let legacyHeroReservation=null;\n'+helper+'\nglobalThis.reserve=setLegacyHeroReservation;',sandbox);
for(const [value,priority] of [['',''],['70dvh','important'],['640px','']]){
  const hero=new ElementStub(1505.265625,value,priority);
  sandbox.reserve(hero,true);
  assert.equal(hero.style.getPropertyValue('min-height'),'1505.266px');
  assert.equal(hero.style.getPropertyPriority('min-height'),'important');
  sandbox.reserve(hero,true);
  assert.equal(hero.reads,1,'An unchanged archive state must not remeasure the hero');
  assert.equal(hero.writes,1,'An unchanged archive state must not rewrite geometry');
  sandbox.reserve(null,false);
  assert.equal(hero.style.getPropertyValue('min-height'),value);
  assert.equal(hero.style.getPropertyPriority('min-height'),priority);
  assert.equal(hero.style.getPropertyValue('opacity'),'.61');
  assert.equal(hero.style.getPropertyPriority('opacity'),'important');
  sandbox.reserve(null,false);
  assert.equal(hero.writes,2,'Repeated restoration must be idempotent');
}
for(const height of [0,-1,NaN,Infinity]){
  const hero=new ElementStub(height,'60dvh','important');
  sandbox.reserve(hero,true);
  assert.equal(hero.writes,0,'Invalid/unlaid-out geometry must not replace the original minimum');
  hero.height=823;
  sandbox.reserve(hero,true);
  assert.equal(hero.style.getPropertyValue('min-height'),'823.000px');
  sandbox.reserve(null,false);
  assert.equal(hero.style.getPropertyValue('min-height'),'60dvh');
  assert.equal(hero.style.getPropertyPriority('min-height'),'important');
}
console.log('HERO_FOOTPRINT_RESTORE_R2117_PASS');

// Execute the real render method across stored/retrieved/returned paper states.
// Count actual nonzero-opacity mesh submissions, never a readiness/status label.
const renderStart=source.indexOf('    render(frame){',source.indexOf('  class MAGScene {'));
const renderEnd=source.indexOf('    dispose(){',renderStart);
assert(renderStart>0&&renderEnd>renderStart,'The original native archive render owner is missing');
let connectionCases=0;
const nativeSources=['rotor','left-shelf','bottom-drawer','vertical-crystal','sealed-vault','right-cell','inner-chamber','assembled'];
for(const [index,nativeSource] of nativeSources.entries()){
  for(const portrait of [false,true])for(const quality of ['low','high'])for(const progress of [0,.16,.48,.78,.99,1]){
    const root={dataset:{}},scene={index,source:nativeSource,color:[.2,.8,1]};
    const renderSandbox={root,current:{s:scene,progress},archiveActive:true,document:{hidden:false},
      performance:{now:()=>100},quality,mobile:()=>portrait,painted:0,
      scenes:Array.from({length:8},()=>scene),CameraDirector:{forScene:()=>[0,0,0]},
      PerformanceManager:{observeSubmission:()=>{}},
      clamp:(value,a=0,b=1)=>Math.max(a,Math.min(b,value)),mix:(a,b,t)=>a+(b-a)*t,
      smooth:value=>{value=Math.max(0,Math.min(1,value));return value*value*(3-2*value);}};
    const render=vm.runInNewContext('({'+source.slice(renderStart,renderEnd)+'}).render',renderSandbox);
    const commands=[];
    const model={gl:new Proxy({},{get:()=>()=>{}}),uniform:{},panelDetail:quality==='high',
      panel:{count:12},box:{count:36},mesh(...args){this.drawCalls++;commands.push(args);}};
    render.call(model,{aspect:portrait?.48:1.6});
    const filaments=commands.filter(args=>args[8]===true);
    const expected=(quality==='high'?(portrait?4:6):(portrait?2:3))*(quality==='high'&&!portrait?3:1);
    assert.equal(filaments.length,expected,'Actual stored/retrieved/returned connection missing '+JSON.stringify({nativeSource,portrait,quality,progress}));
    assert.equal(Number(root.dataset.fxArchiveFilamentCount),filaments.length,'Counter must describe actual mesh commands');
    for(const args of filaments){
      assert(args[5]>0&&args[5]<=1,'A zero-opacity mesh must not count as a live connection');
      assert(args[1].every(Number.isFinite)&&args[2].every(value=>Number.isFinite(value)&&value>0),'Connection geometry must be finite and nondegenerate');
    }
    connectionCases++;
  }
}
console.log('ARCHIVE_ACTUAL_CONNECTION_PHASES_R2117_PASS '+JSON.stringify({cases:connectionCases}));

function maximumLayoutShiftWindow(shifts){
  let maximum=0,total=0,first=-Infinity,last=-Infinity;
  for(const shift of shifts){
    if(shift.at-last>1000||shift.at-first>5000){first=shift.at;total=0;}
    total+=shift.value;last=shift.at;maximum=Math.max(maximum,total);
  }
  return maximum;
}

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
    '--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'
  ]});
  try{
    const context=await browser.newContext({viewport:{width:412,height:823},deviceScaleFactor:1.75,
      isMobile:true,hasTouch:true,reducedMotion:'no-preference',locale:'hu-HU'});
    try{
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(String(error)));
      await page.addInitScript(()=>{
        const audit=window.__heroFootprintR2117={shifts:[],ready:0};
        document.addEventListener('DOMContentLoaded',()=>{
          const hero=document.getElementById('hero');
          audit.originalMinimum=[hero.style.getPropertyValue('min-height'),hero.style.getPropertyPriority('min-height')];
          window.__heroFootprintOriginalHeading=document.getElementById('hero-title');
        },{once:true});
        addEventListener('formatx:real3dready',()=>{
          audit.ready++;
          if(!window.__heroFootprintCanvas)window.__heroFootprintCanvas=window.FormatXLivingCore?.canvas;
        });
        new PerformanceObserver(list=>{
          for(const entry of list.getEntries())if(!entry.hadRecentInput)audit.shifts.push({at:entry.startTime,value:entry.value,
            sources:(entry.sources||[]).map(item=>({id:item.node?.id,className:typeof item.node?.className==='string'?item.node.className:'',
              previous:item.previousRect.toJSON(),current:item.currentRect.toJSON()}))});
        }).observe({type:'layout-shift',buffered:true});
      });
      const cdp=await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:562.5,
        downloadThroughput:1474.56*1024/8,uploadThroughput:675*1024/8});
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      const url=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:65000});
      await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveCinema==='active'
        &&!document.querySelector('.fx-mag-birth-r533'),null,{timeout:45000});
      await page.waitForLoadState('networkidle',{timeout:45000});
      await page.waitForTimeout(350);
      const initial=await page.evaluate(()=>{
        const hero=document.getElementById('hero'),core=window.FormatXLivingCore;
        const minimum=hero.style.getPropertyValue('min-height');
        return{...window.__heroFootprintR2117,minimum,priority:hero.style.getPropertyPriority('min-height'),
          actualHeight:hero.getBoundingClientRect().height,sameCanvas:core?.canvas===window.__heroFootprintCanvas,
          canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
          active:document.querySelectorAll('[data-fx-cinema-panel-active="true"]').length,
          hidden:[...document.querySelectorAll('[data-fx-cinema-panel-active="false"]')].map(node=>getComputedStyle(node).contentVisibility)};
      });
      const cls=maximumLayoutShiftWindow(initial.shifts);
      assert(cls<.05,'Cold mobile handoff moves the original document: '+JSON.stringify({cls,shifts:initial.shifts}));
      assert.match(initial.minimum,/^\d+(?:\.\d+)?px$/,'The floor must come from actual laid-out geometry');
      assert.equal(initial.priority,'important');
      assert(initial.actualHeight>=parseFloat(initial.minimum)-.01,'The original hero footprint collapsed');
      assert.equal(initial.sameCanvas,true);assert.equal(initial.canvasCount,1);assert.equal(initial.active,1);
      assert.equal(initial.hidden.length,7);assert(initial.hidden.every(value=>value==='hidden'));
      const output=path.join(__dirname,'../../artifacts/r2117-hero-footprint');
      fs.mkdirSync(output,{recursive:true});
      await page.screenshot({path:path.join(output,'cold-mobile-after-handoff.png')});
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
      const resized=[];
      for(const viewport of [{width:844,height:390},{width:320,height:640},{width:412,height:823}]){
        await page.setViewportSize(viewport);
        await page.waitForTimeout(300);
        const state=await page.evaluate(()=>{
          const hero=document.getElementById('hero'),core=window.FormatXLivingCore;
          const panel=document.querySelector('[data-fx-cinema-panel-active="true"]');
          const rect=panel?.getBoundingClientRect();
          return{width:innerWidth,height:innerHeight,minimum:hero.style.getPropertyValue('min-height'),
            actualHeight:hero.getBoundingClientRect().height,sameCanvas:core?.canvas===window.__heroFootprintCanvas,
            canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
            active:document.querySelectorAll('[data-fx-cinema-panel-active="true"]').length,
            readable:!!rect&&rect.width>100&&rect.right>0&&rect.left<innerWidth&&rect.top<innerHeight,
            overflow:document.documentElement.scrollWidth-innerWidth};
        });
        assert.equal(state.minimum,initial.minimum,'Responsive growth must preserve the measured minimum');
        assert(state.actualHeight>=parseFloat(initial.minimum)-.01);
        assert(state.sameCanvas&&state.canvasCount===1&&state.active===1&&state.readable,JSON.stringify(state));
        assert(state.overflow<2,'Reservation must not introduce horizontal overflow: '+JSON.stringify(state));
        resized.push(state);
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.documentElement.dataset.fxArchiveExperience==='disposed',null,{timeout:5000});
      const restored=await page.evaluate(()=>{
        const hero=document.getElementById('hero');
        return{minimum:[hero.style.getPropertyValue('min-height'),hero.style.getPropertyPriority('min-height')],
          sameHeading:document.getElementById('hero-title')===window.__heroFootprintOriginalHeading,
          canvasCount:document.querySelectorAll('.fx-crystal-organism-r326-canvas').length};
      });
      assert.deepEqual(restored.minimum,initial.originalMinimum,'Actual reduced motion must restore exact original minimum/priority');
      assert.equal(restored.sameHeading,true);assert.equal(restored.canvasCount,1);assert.deepEqual(errors,[]);
      fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({cls,initial,resized,restored,errors},null,2));
      console.log('HERO_FOOTPRINT_COLD_MOBILE_R2117_PASS '+JSON.stringify({cls,minimum:initial.minimum,
        actualHeight:initial.actualHeight,sameCanvas:initial.sameCanvas,active:initial.active,hidden:initial.hidden,
        shifts:initial.shifts.map(shift=>({at:shift.at,value:shift.value})),resized,restored,errors}));
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
