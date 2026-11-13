/* FormatX MAG scroll story contract checks — no external dependencies. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const homepage=fs.readFileSync(path.join(root,'docs/scifi-ui/index.html'),'utf8');
const jsPath=path.join(root,'docs/scifi-ui/scripts/formatx-mag-scroll-story-r2202.js');
const cssPath=path.join(root,'docs/scifi-ui/styles/formatx-mag-scroll-story-r2202.css');
const js=fs.readFileSync(jsPath,'utf8');
const css=fs.readFileSync(cssPath,'utf8');
const syntax=spawnSync(process.execPath,['--check',jsPath],{encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
assert.match(homepage,/formatx-mag-scroll-story-r2202\.js/);
assert.match(homepage,/formatx-mag-scroll-story-r2202\.css/);
assert.equal((homepage.match(/data-fx-mag-story-r2202="true"/g)||[]).length,2);
const dnaCritical='data-fx-dna-first-frame-r2181="true"';
const audioChrome='data-fx-genesis-studio-r2160="true"';
assert.ok(homepage.indexOf(dnaCritical)>0);
assert.ok(homepage.indexOf(dnaCritical)<homepage.indexOf(audioChrome),
  'DNA first-frame sheet must start downloading before intro audio chrome');
assert.match(homepage,/formatx-genesis-studio-r2160\.css[^>]*data-fx-r487-deferred-style="true"/);
assert.equal((homepage.match(/data-fx-dna-first-frame-r2181="true"/g)||[]).length,1);
assert.ok(homepage.includes('data-fx-mag-story-r2202="true" data-fx-r487-deferred-style="true"'));
assert.match(js,/formatx:deferredcssready/);
assert.ok(js.indexOf('const bounds = chapters.map') < js.indexOf('updates.forEach'), 'Layout reads must precede DOM writes');
assert.match(js,/const lastChapterStyles = chapters\.map/);
assert.match(js,/prior\.visibility!==update\.visibility/);
assert.match(js,/prior\.offset!==update\.offset/);
assert.doesNotMatch(js,/setProperty\('--fx-mag-story-local'/,
  'Unused per-frame chapter local variable must not be mutated');
for(const id of ['hero','experience','capabilities','pricing','system','network','resources']){
  assert.ok(homepage.includes('id="'+id+'"'),id+' section missing');
  assert.ok(js.includes("['"+id+"'"),id+' timeline chapter missing');
}
assert.match(js,/addEventListener\('scroll',request,\{passive:true\}\)/);
assert.match(js,/requestAnimationFrame\(render\)/);
assert.match(js,/prefers-reduced-motion: reduce/);
assert.match(js,/core\.rotateBy\(/);
assert.match(js,/archiveOwnsStage = \(\) =>/);
assert.match(js,/fxArchiveDock === 'active'/);
assert.match(js,/fxArchiveCinema === 'active'/);
assert.match(js,/Math\.PI \* 3/);
assert.match(js,/mag-scroll-r2217/);
// R2223: the canonical photographic GPU program remains identical except
// for algebraic x*x substitutions. Never switch to the unused simplified
// software shader, alter optics, or remove the real full-quality WebGL model.
const corePath=path.join(root,'docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const coreSource=fs.readFileSync(corePath,'utf8');
const coreSyntax=spawnSync(process.execPath,['--check',corePath],{encoding:'utf8'});
assert.equal(coreSyntax.status,0,coreSyntax.stderr);
const canonicalShader=coreSource.split('const constrainedFragmentSource = `')[1]
  ?.split('const softwareFragmentSource = `')[0]||'';
assert.ok(canonicalShader.length>10000,'Real photographic MAG shader was replaced');
assert.ok(!canonicalShader.includes(',2.0)'),
  'Canonical shader still uses general pow() for a mathematical square');
assert.match(coreSource,/R2223: exact algebraic squares/);
assert.ok(coreSource.includes('gl.drawArrays(gl.TRIANGLES,0,geometry.count)'), 'Canonical native MAG draw lost');
assert.ok(coreSource.includes('root.dataset.fxCoreMeshBuildMsR2220'), 'CPU geometry timing lost');
assert.ok(coreSource.includes('const publishRuntimeState=(key,value)=>{') &&
  coreSource.includes('if(root.dataset[key]!==next)root.dataset[key]=next;'),
  'R2225 must deduplicate GPU-frame telemetry attribute mutations');
assert.ok(coreSource.includes('if(now-lastRefreshTelemetryAt>=250 || lastRefreshTelemetryAt===-Infinity)') &&
  coreSource.includes("publishRuntimeState('fxCoreRefreshHzR1622',estimatedHz.toFixed(1))") &&
  coreSource.includes("publishRuntimeState('fxCoreRenderDivisorR1622',String(divisor))"),
  'R2225 must sample diagnostics at <=4Hz without reducing real frame rate');
assert.ok(coreSource.includes("publishRuntimeState('fxCoreRenderMs',renderAverage.toFixed(2))") &&
  coreSource.includes("publishRuntimeState('fxCorePassModelR1450'"),
  'R2225 must report real GPU timings while suppressing unchanged DOM writes');
assert.ok(coreSource.includes('gl.drawArrays(gl.TRIANGLES,0,geometry.count)'), 'R2225 must preserve real MAG render pass');
const cinematicJourney=fs.readFileSync(
  path.join(root,'docs/scifi-ui/scripts/formatx-cinematic-journey-r536.js'),'utf8');
assert.match(cinematicJourney,/const scrollOwnsCamera = root\.dataset\.fxArchiveDock==='active'/);
assert.match(cinematicJourney,/root\.dataset\.fxMagStoryCoreMode==='archive'/);
assert.match(cinematicJourney,/if \(!scrollOwnsCamera\)\s*api\.rotateBy\?/);
assert.match(cinematicJourney,/api\.surfacePulse\?\.\('r536-'/);
assert.match(js,/const mode=archiveActive\?'archive':'hero';/);
assert.ok(js.indexOf("const mode=archiveActive?'archive':'hero';")
   < js.indexOf('const difference=clamp(remaining*.35'),
   'Continuous MAG scroll owner must be published before any settled scene rotation');

assert.match(js,/lastCoreTurn = clamp\(lastCoreTurn \+ difference\)/);
assert.match(js,/difference=clamp\(remaining\*\.35,-\.095,\.095\)/);
assert.doesNotMatch(js,/clamp\(progress - lastCoreTurn, -\.008, \.008\)/);
assert.match(js,/Math\.abs\(progress-lastCoreTurn\)>\.001\) request\(\)/);
assert.match(js,/if \(animateChapters\) updates\.forEach/);
assert.match(js,/if \(!animateChapters\) return/);
assert.match(js,/coreProgress:lastCoreTurn/);

assert.doesNotMatch(js,/difference \* 170|difference \* -32/,
  'R326 expects radians; historic degree-scale scroll jumps are prohibited');

assert.match(js,/heroRect\.bottom <= 0/);
assert.doesNotMatch(js,/new WebGLRenderer|createElement\('canvas'\)|preventDefault\(/);
assert.match(js,/footerRect\.top < vh/);
assert.match(css,/\.fx-mag-story-rail\[hidden\]\{display:none!important\}/);
assert.match(css,/@media\(max-width:900px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/min-height:44px/);
assert.match(css,/overflow-x:auto/);
assert.match(css,/left:0;right:0;transform:none/);
assert.match(js,/track\.scrollLeft = 0/);
assert.match(js,/innerWidth <= 440/);
assert.match(css,/@media \(min-width:360px\) and \(max-width:440px\)/);

const previewPath=path.join(root,'docs/scifi-ui/mag-scroll-preview.html');
const previewJs=path.join(root,'docs/scifi-ui/scripts/formatx-mag-scroll-preview-r2210.js');
const previewCss=path.join(root,'docs/scifi-ui/styles/formatx-mag-scroll-preview-r2210.css');
const preview=fs.readFileSync(previewPath,'utf8');
const previewCode=fs.readFileSync(previewJs,'utf8');
const previewStyles=fs.readFileSync(previewCss,'utf8');
const previewSyntax=spawnSync(process.execPath,['--check',previewJs],{encoding:'utf8'});
assert.equal(previewSyntax.status,0,previewSyntax.stderr);
assert.equal((preview.match(/<canvas\b/g)||[]).length,1,'Preview must have one visible canvas');
assert.equal((preview.match(/class="fxp-chapter\b/g)||[]).length,7);
assert.match(preview,/formatx-mag-genesis-three-r1280\.js/);
assert.match(preview,/formatx-mag-reference-film-r649\.js/);
assert.match(previewCode,/const owner=window\.FormatXMagGenesisThreeR1280/);
assert.match(previewCode,/renderer=await owner\.attach\(canvas,getTarget\)/);
assert.match(previewCode,/FormatXMagReferenceFilmR649\.attach/);
assert.match(previewCode,/requestAnimationFrame\(frame\)/);
assert.match(previewCode,/filmKeys=\[\[0,0\],\[\.17,\.42\],\[\.34,\.82\]/);
assert.match(previewCode,/addEventListener\('scroll',onScroll,\{passive:true\}\)/);
assert.match(previewStyles,/prefers-reduced-motion:reduce/);
assert.match(preview,/name="robots" content="noindex,nofollow"/);

console.log('FormatX MAG scroll R2210 static contract PASS');
