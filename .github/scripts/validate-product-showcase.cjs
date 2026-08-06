const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const runtime = read('docs/scifi-ui/scripts/formatx-product-showcase.js');
const loader = read('docs/scifi-ui/scripts/formatx-origin-proof.js');
const styles = read('docs/scifi-ui/styles/formatx-product-showcase.css');

const rasterProofImages = [
  'control-center.svg',
  'live-system-monitor.svg',
  'diagnostics.svg',
  'usb-creator.svg'
];
const nativeVectorImages = ['portable-installer.svg'];
const images = [...rasterProofImages, ...nativeVectorImages];

assert.match(runtime, /const ITEMS = \[/, 'showcase item registry missing');
assert.match(runtime, /fx-product-showcase__dialog/, 'full-size dialog missing');
assert.match(runtime, /formatx:languagechange/, 'language refresh missing');
assert.match(runtime, /loading="lazy"/, 'lazy image loading missing');
assert.match(loader, /formatx-product-showcase\.css\?v=20260806-real-product-1/, 'showcase stylesheet loader missing');
assert.match(loader, /formatx-product-showcase\.js\?v=20260806-real-product-1/, 'showcase runtime loader missing');
assert.match(styles, /prefers-reduced-motion: reduce/, 'reduced-motion treatment missing');
assert.match(styles, /content-visibility: auto/, 'offscreen rendering optimisation missing');

for (const image of rasterProofImages) {
  const file = `docs/scifi-ui/assets/images/product-showcase/${image}`;
  assert.ok(exists(file), `missing product screen: ${image}`);
  const source = read(file);
  assert.match(source, /data:image\/webp;base64,/, `embedded WebP payload missing: ${image}`);
  assert.ok(source.length > 5000, `product screen payload is unexpectedly small: ${image}`);
}

for (const image of nativeVectorImages) {
  const file = `docs/scifi-ui/assets/images/product-showcase/${image}`;
  assert.ok(exists(file), `missing product screen: ${image}`);
  const source = read(file);
  assert.match(source, /^<svg[\s\S]*<\/svg>\s*$/, `native SVG is malformed: ${image}`);
  assert.doesNotMatch(source, /data:image\/webp/i, `native SVG must not embed WebP: ${image}`);
  assert.doesNotMatch(source, /<image\b/i, `native SVG must not embed a nested raster image: ${image}`);
  assert.match(source, /Teljes cross-platform csomag/, `portable installer state missing: ${image}`);
  assert.ok(source.length > 5000, `native SVG proof is unexpectedly small: ${image}`);
}

assert.equal((runtime.match(/image: '/g) || []).length, images.length, 'showcase item count does not match uploaded images');
console.log(`FormatX product showcase validation passed: ${images.length} real screens.`);