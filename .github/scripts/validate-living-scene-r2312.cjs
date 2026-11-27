'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/living-architecture.js','utf8');
const segment=(a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
const formatCode=segment('  const moneyFormatters =','  function checkoutHref(');
let created=0,lang='hu';
const money=new Function('language','Intl',formatCode+'return money;')(()=>lang,{NumberFormat:class {constructor(...args){created++;this.f=new Intl.NumberFormat(...args);}format(v){return this.f.format(v);}}});
for(const language of ['hu','en']){lang=language;for(const currency of ['HUF','EUR'])for(let i=0;i<100;i++){
 const expected=new Intl.NumberFormat(lang==='hu'?'hu-HU':'en-GB',{style:'currency',currency,minimumFractionDigits:0,maximumFractionDigits:0}).format(7900+i);
 assert.equal(money(7900+i,currency),expected);
}}
assert.equal(created,4);
const sceneCode=segment('  function syncScene()','  function loadQrImage(');
let writes=0;const style=new Map();
const ROOT={dataset:{fxScene:'0'},style:{getPropertyValue:k=>style.get(k)||'',setProperty:(k,v)=>{writes++;style.set(k,v);}}};
const makeNode=()=>{let value='',active=false,aria=null;return {get textContent(){return value},set textContent(v){value=v;writes++},classList:{contains:()=>active,toggle:(k,v)=>{active=v;writes++}},getAttribute:()=>aria,hasAttribute:()=>aria!==null,setAttribute:(k,v)=>{aria=v;writes++},removeAttribute:()=>{aria=null;writes++}}};
const nodes=[makeNode(),makeNode()],statusIndex=makeNode(),statusName=makeNode();
const sync=new Function('ROOT','SCENES','nodes','statusIndex','statusName','language',sceneCode+'return syncScene;')(ROOT,[{hu:'MAG',en:'CORE',progress:0},{hu:'RENDSZER',en:'SYSTEM',progress:.2}],nodes,statusIndex,statusName,()=>lang);
lang='hu';sync();const first=writes;for(let i=0;i<1000;i++)sync();assert.equal(writes,first);
ROOT.dataset.fxScene='1';sync();assert.equal(statusName.textContent,'RENDSZER');assert.equal(nodes[0].getAttribute('aria-current'),null);assert.equal(nodes[1].getAttribute('aria-current'),'step');
lang='en';sync();assert.equal(statusName.textContent,'SYSTEM');
console.log('R2312 living scene regression: PASS (400 formatting samples, 4 formatters, 1000 unchanged scene updates, zero repeated writes)');
