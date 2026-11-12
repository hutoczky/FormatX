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
for(const id of ['hero','experience','capabilities','pricing','system','network','resources']){
  assert.ok(homepage.includes('id="'+id+'"'),id+' section missing');
  assert.ok(js.includes("['"+id+"'"),id+' timeline chapter missing');
}
assert.match(js,/addEventListener\('scroll',request,\{passive:true\}\)/);
assert.match(js,/requestAnimationFrame\(render\)/);
assert.match(js,/prefers-reduced-motion: reduce/);
assert.match(js,/core\.rotateBy\(/);
assert.match(js,/heroRect\.bottom <= 0/);
assert.doesNotMatch(js,/new WebGLRenderer|createElement\('canvas'\)|preventDefault\(/);
assert.match(js,/footerRect\.top < vh/);
assert.match(css,/\.fx-mag-story-rail\[hidden\]\{display:none!important\}/);
assert.match(css,/@media\(max-width:900px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
console.log('FormatX MAG scroll R2203 static contract PASS');
