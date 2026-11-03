'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const head=html.slice(0,html.indexOf('</head>'));
const first=html.indexOf('<meta charset=');
const base=head.indexOf('<base href="/scifi-ui/">');
const preloads=[...head.matchAll(/<link\b[^>]*rel="preload"[^>]*as="style"[^>]*>/g)];
const links=[...head.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
const critical=[
  ['formatx-p0-first-paint-r490.css','(min-width:901px)'],
  ['formatx-menu-owner-r1956.css','all'],
  ['formatx-mobile-first-paint-r358.css','(max-width:900px)'],
  ['formatx-desktop-first-paint-r328.css','(min-width:901px)'],
  ['formatx-reference-production-r244.css','(min-width:901px)'],
  ['formatx-mobile-brand-dedupe-r1952.css','all']
];
assert(preloads.length>=critical.length,'Missing first-packet CSS hints');
assert(first>0&&base>first,'Must preserve the parser-owned first-byte stage');
for(const [name,media] of critical){
  const p=preloads.filter(x=>x[0].includes('/scifi-ui/styles/'+name+'?'));
  assert.equal(p.length,1,'Exactly one absolute preload for '+name);
  const tag=p[0][0],index=p[0].index;
  assert(index<base,'Hint must appear before the base/first CSS fetch: '+name);
  assert(tag.includes('fetchpriority="high"')&&tag.includes('media="'+media+'"'),
    'Preload must be media-scoped and high priority: '+name);
  const href=tag.match(/href="([^"]+)"/)?.[1];
  assert(href?.startsWith('/scifi-ui/styles/'),'Root route safe critical preload required');
  const styles=links.filter(x=>x[0].includes(name));
  assert(styles.some(x=>x[0].includes('v='+href.split('?v=')[1])),
    'Preload CSS cache version must equal actual stylesheet: '+name);
}
assert(!preloads.some(x=>/href="\.\/?styles\//.test(x[0])),
  'Relative preload before base creates a wasted /styles/ request on /');
assert(/data-fx-intro-bootstrap-r1629/.test(head));
assert(/data-fx-dna-inline-r2248/.test(head));
console.log('R2306_ROOT_SAFE_CRITICAL_CSS_PRELOAD_SOURCE_PASS');
