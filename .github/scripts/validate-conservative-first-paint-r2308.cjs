'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const head=html.slice(0,html.indexOf('</head>'));
const loads=[...head.matchAll(/<link\b[^>]*rel="preload"[^>]*as="style"[^>]*>/g)].map(m=>m[0]);
assert(loads.length>=3,'R2308 keep the successful earlier mobile hints');
const critical=[
  'formatx-p0-first-paint-r490.css',
  'formatx-desktop-first-paint-r328.css',
  'formatx-reference-production-r244.css'
];
for(const file of critical){
  assert(!loads.some(tag=>tag.includes(file)),
    'R2306 speculative high-priority desktop preload reintroduced: '+file);
}
const selectors=[
  ['formatx-menu-owner-r1956.css','(max-width:900px)'],
  ['formatx-mobile-first-paint-r358.css','(max-width:900px)'],
  ['formatx-mobile-brand-dedupe-r1952.css','all']
];
for(const [file,media] of selectors){
  const matches=loads.filter(tag=>tag.includes(file));
  assert.equal(matches.length,1,'Original first packet hint duplicated: '+file);
  assert(matches[0].includes('media="'+media+'"'));
}
assert(head.includes('data-fx-intro-bootstrap-r1629="true"'));
assert(head.includes('data-fx-dna-inline-r2248="true"'));
assert(head.includes('data-fx-p0-first-paint-r503="true"'));
console.log('R2308_CONSERVATIVE_PRELOAD_ROLLBACK_AND_FILM_FIRST_BYTE_PASS');
