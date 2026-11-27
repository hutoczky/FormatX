'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const script=fs.readFileSync('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js','utf8');
const start=script.indexOf('  function guaranteeInitialHero() {');
const end=script.indexOf('\n  function repairFooterCopy',start);
assert.ok(start>=0&&end>start);
const code=script.slice(start,end);
assert.doesNotMatch(code,/scrollTo|forceHeroStart|requestAnimationFrame|replaceState|scrollRestoration/);
for(const allow of [true,false]){
 const root={dataset:{}};
 const ctx=vm.createContext({root,initialHeroGuardApplied:false,shouldGuaranteeHeroStart:()=>allow,heroTop:()=>76});
 vm.runInContext(code+'\nguaranteeInitialHero(); guaranteeInitialHero();',ctx);
 assert.equal(root.dataset.fxInitialHeroGuard,allow?'native-navigation-r2295':'preserve-navigation');
 if(allow)assert.equal(root.dataset.fxInitialHeroTop,'76');
}
assert.ok(script.includes('function landingTarget(')&&script.includes('function commitDesktopTransfer('),'Seamless transfer must remain implemented');
for(const p of ['docs/scifi-ui/scripts/formatx-infinite-scroll.js','docs/scifi-ui/scripts/formatx-return-state-recovery.js','billing-worker/src/production-entry.js']){
 assert.ok(fs.readFileSync(p,'utf8').includes('20261127-r2295-native-initial-scroll'));
}
console.log('R2295 native initial navigation regression: PASS');
