'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(repo,p),'utf8');
const index=read('docs/scifi-ui/index.html');
const css=read('docs/scifi-ui/styles/formatx-signature-system-r185.css');
const explicitCss=read('docs/scifi-ui/styles/formatx-signature-explicit-r320.css');
const criticalSignature=read('docs/scifi-ui/styles/formatx-critical-signature-r227.css');
const header=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const js=read('docs/scifi-ui/scripts/formatx-signature-system-r185.js');
const app=read('App.xaml.cs');
const appMag=read('SignatureMagController.cs');

assert.ok(index.includes('formatx-critical-signature-r227.css?v=20260819-r227'),'missing r227 critical signature bundle');
/* r461+ deliberately removed the old browser signature JS from the active
   first-load path. Its architecture source remains in-repo for explicit/dormant
   compatibility, but loading it on every visit would resurrect a second MAG
   ownership layer and the ghost fixed close-control that r466/r467 retired. */
assert.ok(!index.includes('formatx-signature-system-r185.js'),'retired signature JS must stay off the active web bootstrap');
assert.equal((index.match(/formatx-critical-signature-r227\.css/g)||[]).length,1,'critical signature bundle must load once');
assert.equal((index.match(/formatx-signature-system-r185\.js/g)||[]).length,0,'retired signature JS must not load on first visit');
assert.ok(criticalSignature.includes('BEGIN formatx-signature-system-r185.css'),'critical signature bundle must identify its canonical source');
assert.ok(criticalSignature.includes(css),'critical signature bundle must contain the complete canonical r185 visual CSS');

for(const token of [
  '.fx-signature-architecture','.fx-signature-map','.fx-signature-node',
  'min-height:44px','touch-action:manipulation','focus-visible','prefers-reduced-motion:reduce',
  'clip-path:circle(150vmax','main>.scene:not(#hero)::before','scroll-margin-top:82px'
]) assert.ok(css.includes(token),`missing signature CSS token: ${token}`);
assert.doesNotMatch(css,/scroll-snap-type\s*:/i,'signature layer must not force scroll snapping');

for(const token of [
  '#hero > .fx-signature-core-trigger','display: none !important','pointer-events: none !important',
  'html.fx-signature-open body','.fx-signature-architecture[aria-hidden="true"]'
]) assert.ok(explicitCss.includes(token),`missing explicit-disclosure CSS token: ${token}`);

for(const token of [
  "const VERSION='r325-inert-hidden-architecture'",
  "{id:'hero'","{id:'experience'","{id:'capabilities'","{id:'pricing'","{id:'system'","{id:'resources'",
  'aria-modal','formatx:signatureunfold','Escape','focusables()','scrollIntoView','IntersectionObserver',
  'retired-r320-no-core-hitlayer','native-webgl-owner-r317','formatx:signature-open-request',
  'FormatXSignatureArchitecture','explicit-disclosure-focus-inert-r325',
  'external-css-no-inline-style-r325','formatx-signature-explicit-r320.css?v=20260824-r320-explicit-architecture',
  "overlay.setAttribute('inert','')","overlay.removeAttribute('inert')","hiddenInert:true"
]) assert.ok(js.includes(token),`missing dormant r325 signature source token: ${token}`);
assert.equal((js.match(/id:'/g)||[]).length,6,'dormant architecture source must still describe exactly six system scenes');
assert.doesNotMatch(js,/hero\.appendChild\(trigger\)|document\.elementFromPoint|signature-pointer-r185b|signature-press-r185b/,'hidden MAG hit-layer ownership must stay retired');
assert.doesNotMatch(js,/\.style\b|style\.setProperty|document\.body\.style/,'dormant signature runtime must remain strict-CSP compatible');
new Function(js);

for(const token of [
  'html:not(.fx-signature-open) body.living-architecture .fx-signature-architecture',
  'display:none!important','visibility:hidden!important','pointer-events:none!important',
  'html.fx-signature-open body.living-architecture .fx-signature-architecture'
]) assert.ok(header.includes(token),`missing r467 closed signature-surface guard: ${token}`);

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

console.log('PASS: retired first-load web signature runtime stays dormant/CSP-safe, its closed surface cannot ghost over the header, and the current product MAG runtime/state contract remains present.');