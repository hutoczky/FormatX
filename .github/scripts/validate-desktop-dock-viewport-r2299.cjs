'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const dock=fs.readFileSync('.github/scripts/validate-native-mag-dock-entry-r2173.cjs','utf8');
const marker='/* R2299: keep the desktop native MAG in the REAL viewport';
assert(css.includes(marker),'R2299 scope missing');
const section=css.slice(css.indexOf(marker));
assert(!section.includes('scale:1!important'),
  'R2304: even scale:1 creates a fixed containing block: forbid identity scale on desktop ancestor');
for(const item of ['min-width:901px','prefers-reduced-motion:no-preference',
 'body.living-architecture main#main-content > #hero','body.living-architecture #hero .hero-grid',
 'body.living-architecture #hero .hero-space','will-change:auto!important','contain:none!important',
 'scale:none!important','rotate:none!important','translate:none!important','perspective:none!important',
 'filter:none!important','content-visibility:visible!important',
 '.fx-crystal-organism-r326-stage.fx-archive-native-docked']){
 assert(section.includes(item),'R2299 runtime desktop ancestor reset incomplete: '+item);
}
assert(html.includes('formatx-cinematic-archive-r1987.css?v=20261103-r2304-no-fixed-scale-capture'));
assert(dock.includes('R2299 desktop MAG escaped the left photographic lane') &&
 dock.includes('R2299 fixed desktop MAG must be positioned in the real viewport')&&
 dock.includes('fixedChain:stage?'),'P0 must keep strict viewport proof and ancestor telemetry');
console.log('R2299_DESKTOP_VIEWPORT_DOCK_SOURCE_PASS');
