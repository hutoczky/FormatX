'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const script=fs.readFileSync('docs/scifi-ui/scripts/formatx-license-links.js','utf8');
const start=script.indexOf('  function schedule(');
const end=script.indexOf('\n  ensureFooterLink();',start);
assert.ok(start>=0&&end>start);
class Element {
 constructor(parent=null,anchor=false){this.parent=parent;this.anchor=anchor;}
 contains(n){for(let p=n;p;p=p.parent)if(p===this)return true;return false;}
 querySelector(){return this.anchor?{}:null;}
}
class HTMLAnchorElement extends Element{}
class DocumentFragment extends Element{}
const document=new Element(null,true),parent=new Element(document,true),child=new HTMLAnchorElement(parent),unrelated=new Element(document,false);
const roots=new Set();let frames=0;
const ctx=vm.createContext({document,Element,HTMLAnchorElement,DocumentFragment,pendingRoots:roots,frame:0,flush:()=>{},requestAnimationFrame:()=>++frames,parent,child,unrelated});
vm.runInContext(script.slice(start,end)+'\nschedule(unrelated); schedule(child); schedule(parent); schedule(child);',ctx);
assert.equal(frames,1);assert.deepEqual([...roots],[parent]);
vm.runInContext('schedule(document); schedule(child);',ctx);
assert.deepEqual([...roots],[document]);assert.equal(frames,1);
assert.match(script,/addEventListener\('pageshow', event => \{[\s\S]*?observer.observe/);
console.log('R2297 licence mutation coalescing: PASS');
