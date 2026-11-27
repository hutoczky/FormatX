'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/interaction-genome-export-stability.js','utf8');
const section=(a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
const simulate=new Function(`
 let historyWrites=0,styleWrites=0,scheduled=0;
 const classes=new Set(),bodyClasses=new Set();
 const classList=set=>({contains:k=>set.has(k),add:k=>set.add(k),remove:k=>set.delete(k)});
 class HTMLElement{constructor(){const v=new Map(),p=new Map();this.style={getPropertyValue:k=>v.get(k)||'',getPropertyPriority:k=>p.get(k)||'',setProperty:(k,x,y)=>{styleWrites++;v.set(k,x);p.set(k,y||'');}};}}
 const shell=new HTMLElement();shell.hidden=true;shell.classList=classList(classes);shell.setAttribute=()=>{};
 const document={getElementById:id=>id==='fx-organism-console'?shell:null,querySelectorAll:()=>[],body:{classList:classList(bodyClasses)}};
 const root={dataset:{fxScene:'3'},classList:classList(new Set())};
 const location={pathname:'/',search:'?x=1'};
 const state={keep:true};const history={state,replaceState:(s,title,url)=>{if(s!==state)throw Error('history state lost');historyWrites++;}};
 const schedulePublicState=()=>scheduled++;
 ${section('  function setImportant(','  function schedulePublicState()')}
 ${section('  function hasOpenOrganism()','  function stabilizePublicState()')}
 return {open:()=>{shell.hidden=false;classes.add('is-authorised-open');},close:forceCloseOrganism,style:()=>setImportant(shell,'width','58px'),stats:()=>({historyWrites,styleWrites,scheduled,scene:root.dataset.fxScene})};
`);
const t=simulate();
t.close();assert.equal(t.stats().scene,'3');assert.equal(t.stats().historyWrites,0);
t.open();t.close();t.close();assert.equal(t.stats().scene,'0');assert.equal(t.stats().historyWrites,1);assert.equal(t.stats().scheduled,1);
const previous=t.stats().styleWrites;for(let i=0;i<1000;i++)t.style();
assert.equal(t.stats().styleWrites,previous+1);
assert(s.includes("event.key !== 'Escape' || event.repeat || !hasOpenOrganism()"));
console.log('R2316 Escape scope and 1000 idempotent style writes: PASS');
