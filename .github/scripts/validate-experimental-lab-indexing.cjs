'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const livingCore = read('docs/scifi-ui/living-core.html');
const threeStage = read('docs/scifi-ui/three-stage.html');
const launcher = read('docs/scifi-ui/scripts/formatx-living-core-launcher.js');
const sitemap = read('docs/sitemap.xml');

const noindex = /<meta\s+name="robots"\s+content="noindex,nofollow,noarchive">/i;

check(noindex.test(livingCore), 'Living Core experimental lab must be noindex,nofollow,noarchive');
check(noindex.test(threeStage), 'WebGPU / TSL experimental stage must be noindex,nofollow,noarchive');
check(/Living Core Lab/i.test(livingCore), 'Living Core title must identify the lab surface');
check(/EXPERIMENTAL LAB/i.test(livingCore), 'Living Core visible copy must identify the experimental lab');
check(/Experimental Stage/i.test(threeStage), 'WebGPU / TSL title must identify the experimental stage');
check(/kísérleti kezelőfelület/i.test(launcher) && /ORGANISM UI LAB/i.test(launcher), 'Living Core launcher must identify the destination as an experimental lab');
check(!/\/scifi-ui\/living-core(?:\.html|\/)?</i.test(sitemap), 'Living Core experimental lab must not be in the canonical sitemap');
check(!/\/scifi-ui\/three-stage(?:\.html|\/)?</i.test(sitemap), 'WebGPU / TSL experimental stage must not be in the canonical sitemap');

if (failures.length) {
  console.error('FAILED experimental lab indexing contract:');
  failures.forEach(item => console.error(' - ' + item));
  process.exit(1);
}

console.log('PASS: experimental Living Core and WebGPU/TSL lab surfaces are clearly labelled and excluded from search indexing.');
