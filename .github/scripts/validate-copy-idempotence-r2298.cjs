'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-copy-polish.js','utf8');
class Element { constructor(){this.dataset={};this.value='';this.writes=0;} get textContent(){return this.value;} set textContent(v){this.value=v;this.writes++;} }
const e=new Element();let lang='hu';
const ctx=vm.createContext({Element,e,language:()=>lang});
vm.runInContext(s.slice(s.indexOf('  function setBilingual('),s.indexOf('  function setAll('))+'\nsetBilingual(e,"HU","EN");setBilingual(e,"HU","EN");',ctx);
assert.equal(e.writes,1);lang='en';vm.runInContext('setBilingual(e,"HU","EN");setBilingual(e,"HU","EN");',ctx);
assert.equal(e.writes,2);assert.equal(e.textContent,'EN');
let frames=0,applied=0,callback;
const c=vm.createContext({requestAnimationFrame:fn=>{callback=fn;return ++frames;},applyCopy:()=>applied++});
vm.runInContext(s.slice(s.indexOf('  let copyFrame = 0;'),s.indexOf("  if (document.readyState === 'loading') document.addEventListener"))+'\nscheduleCopy();scheduleCopy();',c);
assert.equal(frames,1);callback();assert.equal(applied,1);vm.runInContext('scheduleCopy();',c);assert.equal(frames,2);
console.log('R2298 copy idempotence and frame coalescing: PASS');
