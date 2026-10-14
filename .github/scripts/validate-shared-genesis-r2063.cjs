'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const adopt=source.slice(source.indexOf('  function adoptCanonicalStage(){'),source.indexOf('  function syncTarget('));
const release=source.slice(source.indexOf('  function releaseStageStyle() {'),source.indexOf('  function requestCoreWarmup('));
class Element{
  constructor(){
    this.parentNode=null;this.nextSibling=null;this.attributes=new Map();
    const values=new Map();const attributes=this.attributes;
    const update=()=>attributes.set('style',[...values].map(([name,item])=>name+':'+item.value+(item.priority?' !'+item.priority:'')).join(';'));
    this.style={
      [Symbol.iterator]:()=>values.keys(),
      getPropertyValue:name=>values.get(name)?.value||'',
      getPropertyPriority:name=>values.get(name)?.priority||'',
      setProperty(name,value,priority=''){values.set(name,{value,priority});update();},
      removeProperty(name){values.delete(name);update();}
    };
  }
  hasAttribute(name){return this.attributes.has(name);}
  getBoundingClientRect(){return {left:60,top:180,width:500,height:500};}
  getAttribute(name){return this.attributes.get(name)??null;}
  setAttribute(name,value){this.attributes.set(name,value);}
  removeAttribute(name){this.attributes.delete(name);}
}
for(const initialStyle of [null,'opacity:.7;transform:rotate(2deg)']){
  const stage=new Element(),sibling=new Element();
  if(initialStyle!==null){
    stage.style.setProperty('opacity','.7');stage.style.setProperty('transform','rotate(2deg)');
  }
  const movements=[],progress=[];
  const parent={appendChild(node){movements.push('append-home');node.parentNode=this;},
    insertBefore(node,next){assert.equal(next,sibling);movements.push('restore-position');node.parentNode=this;}};
  stage.parentNode=parent;stage.nextSibling=sibling;sibling.parentNode=parent;
  const overlay={isConnected:true,dataset:{},appendChild(){throw new Error('The real MAG must retain its original DOM owner');}};
  const context={HTMLElement:Element,stage,overlay,ROOT:{dataset:{fxCrystalOrganismR326:'initializing'},removeAttribute(){}},
    finished:false,overlayTornDown:false,canonicalIntroActive:false,canonicalStageHome:null,canvas:{hidden:false},filmRenderer:{destroy(){movements.push('destroy-reference');}},
    coreApi:{genesis(value){progress.push(value);},requestRender(){}},REDUCED:false,startedAt:100,DURATION:1350,
    performance:{now:()=>500},innerWidth:1440,innerHeight:900,locateStage(){return stage;}};
  vm.createContext(context);vm.runInContext(adopt+'\n'+release,context);
  assert.equal(context.adoptCanonicalStage(),false,'An unpainted renderer must never take over the visible intro');
  assert.equal(stage.parentNode,parent);
  context.ROOT.dataset.fxCrystalOrganismR326='ready';
  assert.equal(context.adoptCanonicalStage(),true);
  assert.equal(stage.parentNode,parent,'The original stage must stay in its existing reserved layout');
  assert.equal(context.adoptCanonicalStage(),false,'Repeated native readiness must not adopt twice');
  stage.style.setProperty('--another-owner','preserved');
  context.releaseStageStyle();
  assert.equal(stage.parentNode,parent,'Teardown must return the existing stage, never a clone');
  assert.equal(stage.style.getPropertyValue('opacity'),initialStyle===null?'':'.7');
  assert.equal(stage.style.getPropertyValue('transform'),initialStyle===null?'':'rotate(2deg)');
  assert.equal(stage.style.getPropertyValue('--another-owner'),'preserved','Unrelated runtime style changes must survive intro teardown');
  assert.equal(stage.style.getPropertyValue('--fxb-genesis-x'),'');
  assert.equal(progress.at(-1),null,'The page camera must be restored after the cinematic');
  assert.deepEqual(movements,['destroy-reference']);
  context.finished=true;
  assert.equal(context.adoptCanonicalStage(),false,'Late readiness must not reinsert the completed intro');
  context.finished=false;overlay.isConnected=false;
  assert.equal(context.adoptCanonicalStage(),false,'A watchdog-removed overlay cannot capture a later native stage');
}
const start=source.slice(source.indexOf('  function start() {'),source.indexOf('  /* R1701'));
assert.ok(start.indexOf('startedAt=performance.now()')<start.indexOf('sizeCanvas()'),'Actual overlay time must precede canvas setup');
assert.ok(!source.includes('if(!startedAt)startedAt=now'),'The first compositor frame cannot restart the intro clock');
assert.ok(start.includes("finish('timeline-end-r2063'),DURATION"),'The real intro must complete from its normal visible timeline');
console.log('SHARED_GENESIS_R2063_PASS: native readiness, one-stage adoption, exact style/parent restoration, late-ready race and real clock');
