'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const index=read('docs/scifi-ui/index.html');
const css=read('docs/scifi-ui/styles/formatx-signature-system-r185.css');
const js=read('docs/scifi-ui/scripts/formatx-signature-system-r185.js');
const app=read('App.xaml.cs');
const appMag=read('SignatureMagController.cs');

for(const token of [
  'formatx-signature-system-r185.css?v=20260816-iconic-mag-r185b-hitlayer',
  'formatx-signature-system-r185.js?v=20260816-iconic-mag-r185b-hitlayer'
]) assert.ok(index.includes(token),`missing index signature asset: ${token}`);
assert.equal((index.match(/formatx-signature-system-r185\.css/g)||[]).length,1,'signature CSS must load once');
assert.equal((index.match(/formatx-signature-system-r185\.js/g)||[]).length,1,'signature JS must load once');

for(const token of [
  '#hero>.fx-signature-core-trigger','.fx-signature-architecture','.fx-signature-map','.fx-signature-node',
  'z-index:420','pointer-events:auto!important','clip-path:polygon(50% 1%',
  'min-height:44px','touch-action:manipulation','focus-visible','prefers-reduced-motion:reduce',
  'clip-path:circle(150vmax','main>.scene:not(#hero)::before','scroll-margin-top:82px'
]) assert.ok(css.includes(token),`missing signature CSS token: ${token}`);
assert.doesNotMatch(css,/scroll-snap-type\s*:/i,'signature layer must not force scroll snapping');

for(const token of [
  "r185b-iconic-mag-hitlayer-unfold","{id:'hero'","{id:'experience'","{id:'capabilities'","{id:'pricing'","{id:'system'","{id:'resources'",
  "aria-modal","aria-expanded","formatx:signatureunfold","Escape","focusables()","scrollIntoView","ResizeObserver",
  "hero.appendChild(trigger)","document.elementFromPoint","'synced-hit'","signature-pointer-r185b","signature-press-r185b",
  "fxSignatureUsability='touch-focus-reduced-motion-r185b'","source:'signature-unfold-r185b'"
]) assert.ok(js.includes(token),`missing signature JS token: ${token}`);
assert.equal((js.match(/id:'/g)||[]).length,6,'architecture must expose exactly six system scenes');
new Function(js);

assert.ok(app.includes('SignatureMagController.Attach(_window);'),'app must attach the signature MAG');
for(const token of [
  'Product-side expression of the FormatX signature MAG','DispatcherTimer','FormatX MAG – rendszerállapot és rendszerarchitektúra',
  'BuildArchitectureFlyout','GlobalProgressBar','ValueChanged','Gaussian(cycle, .12, .038)','Gaussian(cycle, .265, .052)',
  'SYSTEM / NOMINAL','SYSTEM / ACTIVE','MainTabView','0{i + 1}','MinHeight = 44','Width = 46','SettingsService.Current.Language'
]) assert.ok(appMag.includes(token),`missing app MAG token: ${token}`);
assert.equal((appMag.match(/"MAG \/ ISO → USB"|"IDEGRENDSZER \/ FORMÁZÁS"|"SZERVEK \/ PARTÍCIÓK"|"BIZTONSÁGI SZÍV \/ SECURE ERASE"|"VÁZ \/ LEMEZ EGÉSZSÉG"|"JELADÓ \/ BEÁLLÍTÁSOK"/g)||[]).length,6,'app flyout must map six product organs');

console.log('PASS: r185b iconic MAG identity, real hit-tested signature control, architecture unfold, usability guards and app system MAG contract are present.');
