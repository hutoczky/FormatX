'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const index=read('docs/scifi-ui/index.html');
const css=read('docs/scifi-ui/styles/formatx-signature-system-r185.css');
const criticalSignature=read('docs/scifi-ui/styles/formatx-critical-signature-r227.css');
const js=read('docs/scifi-ui/scripts/formatx-signature-system-r185.js');
const app=read('App.xaml.cs');
const appMag=read('SignatureMagController.cs');

assert.ok(index.includes('formatx-critical-signature-r227.css?v=20260819-r227'),'missing r227 critical signature bundle');
assert.ok(index.includes('formatx-signature-system-r185.js?v=20260816-iconic-mag-r185b-hitlayer'),'missing index signature JS asset');
assert.equal((index.match(/formatx-critical-signature-r227\.css/g)||[]).length,1,'critical signature bundle must load once');
assert.equal((index.match(/formatx-signature-system-r185\.js/g)||[]).length,1,'signature JS must load once');
assert.ok(criticalSignature.includes('BEGIN formatx-signature-system-r185.css'),'critical signature bundle must identify its canonical source');
assert.ok(criticalSignature.includes(css),'critical signature bundle must contain the complete canonical r185 CSS');

for(const token of [
  '#hero>.fx-signature-core-trigger','.fx-signature-architecture','.fx-signature-map','.fx-signature-node',
  'z-index:420','pointer-events:auto!important','clip-path:polygon(50% 1%',
  'min-height:44px','touch-action:manipulation','focus-visible','prefers-reduced-motion:reduce',
  'clip-path:circle(150vmax','main>.scene:not(#hero)::before','scroll-margin-top:82px'
]) assert.ok(css.includes(token),`missing signature CSS token: ${token}`);
assert.doesNotMatch(css,/scroll-snap-type\s*:/i,'signature layer must not force scroll snapping');

for(const token of [
  "r185b-iconic-mag-hitlayer-unfold","{id:'hero'","{id:'experience'","{id:'capabilities'","{id:'pricing'","{id:'system'","{id:'resources'",
  'aria-modal','aria-expanded','formatx:signatureunfold','Escape','focusables()','scrollIntoView','ResizeObserver',
  'hero.appendChild(trigger)','document.elementFromPoint',"'synced-hit'",'signature-pointer-r185b','signature-press-r185b',
  "fxSignatureUsability='touch-focus-reduced-motion-r185b'","source:'signature-unfold-r185b'"
]) assert.ok(js.includes(token),`missing signature JS token: ${token}`);
assert.equal((js.match(/id:'/g)||[]).length,6,'architecture must expose exactly six system scenes');
new Function(js);

assert.ok(app.includes('SignatureMagController.Attach(_window);'),'app must attach the signature MAG');
for(const token of [
  'MagCoreControl','CorePanelRequested','FormatXLivingMagHost','DispatcherTimer','GlobalProgressBar','MainTabView','ValueChanged',
  'SetRuntimePreferences','SetLicense(MagLicenseInfo.Unknown)','SetIntegrity(MagIntegrityState.Unknown)',
  'SetOperation(MagOperation.Booting','MagOperation.Formatting','MagOperation.Partitioning','MagOperation.SecureErasing','MagOperation.HealthChecking',
  'MagUpdateState.Downloading','MagUpdateState.ChecksumVerification','MagIntegrityState.Sha256Verified',
  'ShowCorePanelAsync','SystemCorePanel','SettingsService.Current.Language'
]) assert.ok(appMag.includes(token),`missing current app MAG contract: ${token}`);

assert.match(appMag,/root\.Loaded[\s\S]*MagStateService\.Current\.Ready/,'MAG must enter ready state after load');
assert.match(appMag,/window\.Activated[\s\S]*_mag\.SetActive/,'MAG must follow window activation state');
assert.match(appMag,/window\.Closed[\s\S]*MagOperation\.ShuttingDown/,'MAG must enter shutdown state when the window closes');
assert.match(appMag,/new ContentDialog[\s\S]*new SystemCorePanel\(\)/,'MAG core control must open the system core panel');

console.log('PASS: r185b web signature identity and current product MAG runtime/state contract are present.');
