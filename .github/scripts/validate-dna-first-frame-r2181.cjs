'use strict';
// R2181: a visitor must see a recognizable DNA double helix BEFORE the
// asynchronous film owner is fetched, parsed or compiles its WebGL shader.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-dna-first-frame-r2181.css','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const gpu=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const prepaint=html.match(/<section id="fx-mag-birth-prepaint-r1606"[\s\S]*?<\/section>/);
assert(prepaint,'Missing initial parser-owned prepaint scene');
assert(prepaint[0].includes('fxb-first-frame-dna-r2181'),'First visible prepaint is not DNA');
assert(prepaint[0].includes('fxb-first-frame-pairs-r2181'),'DNA lacks paired base bridges');
assert(prepaint[0].includes('fxb-first-frame-strands-r2181'),'DNA lacks the opposed helix ribbons');
const pairs=(prepaint[0].match(/<line x1=/g)||[]).length;
const nodes=(prepaint[0].match(/<circle class=/g)||[]).length;
assert(pairs>=28&&nodes>=38,'Opening DNA geometry is too sparse');
assert(css.includes('.fxb-first-frame-dna-r2181'),'Canonical DNA first-frame CSS is empty');
assert(/<link rel="stylesheet" fetchpriority="high" data-fx-dna-first-frame-r2181="true" href="\/scifi-ui\/styles\/formatx-dna-first-frame-r2181\.css\?v=20261025-r2185-wide-studio-dna">/.test(html),
  'DNA first frame must use the high-priority canonical stylesheet');
assert(!html.includes('<style data-fx-dna-first-frame-r2181="true">'),
  'Legacy duplicated inline DNA first-frame CSS returned');
assert(css.includes('data-fx-intro-prepaint-r1611="show"'),'Cold frame hidden on initial HTML');
assert(css.includes('prefers-reduced-motion:reduce'),'Reduced motion must remain accessible');
assert(birth.includes('const firstFrameDnaR2181=overlay.querySelector'),'R533 does not adopt DNA shell');
assert(birth.includes("releaseFirstFrameDnaR2181('gpu-film-first-frame')"),'DNA fades before first painted GPU frame');
assert(birth.includes("releaseFirstFrameDnaR2181('dna-chapter-fallback-handoff')"),'DNA would obstruct a software-fallback embryo');
assert(gpu.includes('this.makeDNAField();')&&gpu.includes('this.makeGenomeParticles();'),'GPU genome chapter missing');
assert(gpu.includes('this.makeEmbryoFilm();')&&gpu.includes('this.makeMechanicalLayer();'),'DNA-to-embryo-to-MAG pipeline incomplete');
assert(/if\(t<2\.52\)/.test(gpu)&&gpu.includes('const grow=smooth((t-5.88)/1.18)'),'Genesis timeline ordering changed');
console.log('R2181_FIRST_VISIBLE_FRAME_DNA_PASS',JSON.stringify({basePairs:pairs,nucleotides:nodes,criticalCss:'high-priority-canonical-asset',gpuHandoff:true,fallbackHandoff:true}));
