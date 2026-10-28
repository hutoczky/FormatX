'use strict';
// R2213: the original physical MAG creates the visible site chapter-by-chapter.
// Visibility gating must not erase semantic HTML or break accessibility.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const js=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-living-habitat-r1530.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
assert.doesNotThrow(()=>new Function(js),'native MAG must still parse');
assert(js.includes("document.querySelectorAll('#main-content > section.scene:not(#hero)')"),
  'Canonical R326 must own ALL primary chapter reveals');
assert(js.includes("root.dataset.fxMagExtractionR2213='armed'"),'MAG must authorize materialization');
assert(js.includes("root.dataset.fxMagExtractionR2213='accessible-immediate'"),
  'Audit and reduced-motion fallback required');
assert(js.includes("!auditMode&&!reduced.matches"),
  'Lighthouse and reduced-motion must not conceal content');
assert(js.includes("section.dataset.fxMagRevealR2213='waiting'"),'Chapter starts visually concealed');
assert(js.includes("section.dataset.fxMagRevealR2213='revealed'"),'MAG must release chapter');
assert(js.includes('formatx:magmaterialize'),'Core-owned extraction event required');
assert(js.includes("listen(document,'focusin',event=>"),
  'Keyboard focus must reveal a pending chapter without hidden focus');
assert(js.includes("listen(reduced,'change',()=>"),
  'Runtime reduced-motion toggle must release concealed chapters');
assert(js.includes("const materializeSection=section=>"),
  'The same original MAG materializes scroll and focus destinations');
assert(js.includes("signalPhysiology(sectionPhysiology[id]||'curiosity'"),
  'Section reveal must be physically linked to native MAG');
assert(js.includes("extractObserver?.disconnect()"),'Observer must be disposed');
assert(js.includes("root.dataset.fxMagExtractionR2213='released'"),
  'Removing renderer must not strand invisible content');
assert(css.includes('production-r2213-original-mag-extracts-page-chapters'),
  'Chapter presentation stylesheet missing');
assert(css.includes('opacity:0!important'),'Unseen chapters remain visually absent');
assert(css.includes('@media (prefers-reduced-motion: reduce), (forced-colors: active)'),
  'Respect reduced motion / forced colours');
assert(html.includes('formatx-living-habitat-r1530.css?v=20261028-r2213-mag-chapter-extraction'),
  'Exact visual extraction revision must load');
for(const id of ['experience','capabilities','pricing','system','network','resources'])
  assert(html.includes('id="'+id+'"'),'All original semantic chapters retained: '+id);
assert(html.includes('id="hero"'),'Visible MAG hero remains semantic');
assert(!css.includes('display:none!important;\n    pointer-events:none!important;\n    transition:none!important;'),
  'Do not remove whole chapters from the accessibility document');
assert(worker.includes('formatx-mag-genesis-three-r1280.js'),
  'Existing 3D origin remains: do not create a second rendering engine');
console.log('MAG_R2213_ORIGINAL_CORE_SECTION_EXTRACTION_PASS');
