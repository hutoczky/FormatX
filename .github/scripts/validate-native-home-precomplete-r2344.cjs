'use strict';
// R2344 source-level execution guard. The unchanged real R2173 Chromium
// test remains the authority for post-completion geometry and GL identity.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const start=src.indexOf('  function prepareNativeHomeR2315(');
const end=src.indexOf('  function setHeroCanvasLaneFront(',start);
assert(start>0&&end>start,'R2315 native stage function missing');
const pre=src.indexOf("document.addEventListener('formatx:magbirthprepare',()=>{");
const complete=src.indexOf("document.addEventListener('formatx:magbirthcomplete',()=>{");
assert(pre>0&&complete>pre,'Native geometry must prepare before film completion');
const preListener=src.slice(pre,complete);
const nextListener=src.indexOf("addEventListener('formatx:languagechange'",complete);
assert(nextListener>complete,'Completion listener boundary missing');
const completion=src.slice(complete,nextListener);
assert(preListener.includes('prepareNativeHomeR2315(true);'),
  'The pre-completion handoff must snapshot real native stage geometry');
assert(!completion.includes('      prepareNativeHomeR2315();'),
  'The completed film must not synchronously read native stage geometry');
assert(completion.includes("queueMicrotask(()=>prepareNativeHomeR2315());"),
  'Late native-ready fallback must run in an archive-owned microtask');
assert(completion.includes('introDone=true;'),
  'Do not change completed cinematic ownership');
assert(src.includes("root.dataset.fxMagNativeHomeR2315='prepared';"),
  'The real fixed-home CSS geometry contract must remain');
const snippet=src.slice(start,end);
const cases=[];
for(const profile of [
  {label:'desktop-precompletion',mobile:false,reduced:false,hidden:false,expected:1},
  {label:'mobile-precompletion',mobile:true,reduced:false,hidden:false,expected:0},
  {label:'reduced-precompletion',mobile:false,reduced:true,hidden:false,expected:0},
  {label:'hidden-precompletion',mobile:false,reduced:false,hidden:true,expected:0}
]){
  const reads=[],styles={};
  class Element{
    constructor(name){this.name=name;this.isConnected=true;this.style={
      setProperty:(name,value)=>{styles[name]=value;}
    };}
    getBoundingClientRect(){
      reads.push(this.name);
      return {left:581.46875,top:112,width:643.515625,height:537.59375};
    }
  }
  const stage=new Element('stage'),host=new Element('host');
  const state={dataset:{fxCrystalOrganismR326:'ready'}};
  const env={root:state,disposed:false,reduced:{matches:profile.reduced},
    mobile:()=>profile.mobile,archiveActive:false,introDone:false,
    document:{hidden:profile.hidden,querySelector:selector=>selector.includes('hero-space')?host:stage},
    window:{FormatXLivingCore:{stage}},scrollY:0,innerHeight:900,
    HTMLElement:Element,console};
  const prepare=vm.runInNewContext('(function(){'+snippet+'return prepareNativeHomeR2315;})()',env);
  prepare();
  assert.equal(reads.length,0,'No early native read without explicit film-preparation permission');
  prepare(true);
  assert.equal(reads.length,profile.expected,profile.label+' stage read mismatch');
  if(profile.expected){
    assert.equal(state.dataset.fxMagNativeHomeR2315,'prepared');
    assert.equal(styles['--fx-native-home-width-r2315'],'643.516px');
    assert.equal(styles['--fx-native-home-top-r2315'],'112.000px');
  }else{
    assert.equal(state.dataset.fxMagNativeHomeR2315,undefined);
  }
  cases.push({profile:profile.label,preparationReads:reads.length});
}
console.log('MAG_NATIVE_PRECOMPLETE_GEOMETRY_R2344_PASS',JSON.stringify({
  cases,sourceBeforeCompletion:true,lateFallbackAsynchronous:true,
  originalR2173BrowserOracleUnchanged:true,renderingPerformanceUncertified:true
}));
