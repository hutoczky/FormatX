/* FormatX R2327: the live post-Genesis MAG, not its cell-phase ovum,
   owns the four-point machined foreground. Preserve genuine cortex depth
   and full geometry while eliminating an overlarge round silhouette. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.match(src,/appendEllipsoid\(\[\.045,\.040,-\.235\],\[\.540,\.575,\.320\],1\.12,/);
assert.match(src,/fxNativeMagAnatomyR2327='compact-recessed-living-cortex-four-machined-arms-foreground'/);
assert.match(src,/const isCortex=facetBase>=1\.10&&facetBase<1\.34/);
assert.match(src,/float livingCortex=step\(1\.10,vFacet\)/);
assert.doesNotMatch(src,/R2327.*createElement\(['"]canvas/);
console.log('R2327_COMPACT_PHYSICAL_MAG_CORTEX_CONTRACT_PASS');
