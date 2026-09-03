const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const feedback = read('docs/scifi-ui/scripts/formatx-feedback.js');
const showcase = read('docs/scifi-ui/scripts/formatx-product-showcase.js');
const styles = read('docs/scifi-ui/styles/formatx-feedback.css');
const compatible = read('docs/scifi-ui/assets/images/product-showcase/portable-installer-compatible.svg');
const schema = read('billing-worker/src/feedback-schema.js');
const entry = read('billing-worker/src/production-feedback-entry.js');
const feedbackApi = read('billing-worker/src/feedback-api.js');
const workerConfig = read('billing-worker/wrangler.jsonc');
const matrix = read('.github/scripts/validate-responsive-production-matrix.cjs');

assert.match(compatible, /^<svg[\s\S]*<\/svg>\s*$/, 'compatible portable installer must be a self-contained SVG');
assert.doesNotMatch(compatible, /data:image\/webp/i, 'Android-compatible asset must not embed WebP');
assert.doesNotMatch(compatible, /<image\b/i, 'Android-compatible asset must not rely on a nested raster image');
assert.match(compatible, /Teljes cross-platform csomag/, 'portable installer visual is missing the cross-platform state');
assert.match(compatible, /Linux indítófájlt/, 'portable installer visual is missing Linux launcher state');
assert.match(compatible, /Windows EXE/, 'portable installer visual is missing Windows launcher state');
assert.match(compatible, /macOS indítófájlt/, 'portable installer visual is missing macOS launcher state');

assert.match(feedback, /portable-installer-compatible\.svg\?v=/, 'mobile compatibility fallback replacement is missing');
assert.match(showcase, /image: 'portable-installer-compatible\.svg'/, 'showcase producer must create the compatible portable installer directly');
assert.doesNotMatch(showcase, /image: 'portable-installer\.svg'/, 'showcase producer still creates the obsolete portable installer');
assert.match(feedback, /patchPortableInstallerImages\(\)/, 'legacy/static portable installer fallback patch is missing');
assert.match(feedback, /FEEDBACK_SUMMARY_URL = '\/api\/feedback\/summary'/, 'feedback summary endpoint is missing');
assert.match(feedback, /FEEDBACK_SUBMIT_URL = '\/api\/feedback'/, 'feedback submit endpoint is missing');
assert.match(feedback, /privacy_consent: true/, 'privacy consent is not sent explicitly');
assert.match(feedback, /REQUEST_TIMEOUT_MS/, 'feedback request timeout is missing');
assert.match(feedback, /credentials: 'same-origin'/, 'same-origin credentials are missing');

assert.match(styles, /min-width: 981px[\s\S]*max-width: 1440px/, 'HD desktop breakpoint is missing');
assert.match(styles, /min-width: 1441px[\s\S]*max-width: 2879px/, 'Full HD and QHD breakpoint is missing');
assert.match(styles, /min-width: 2880px/, '4K and 8K breakpoint is missing');
assert.match(styles, /min-aspect-ratio: 2\/1/, 'ultrawide breakpoint is missing');
assert.match(styles, /min-aspect-ratio: 3\/1/, 'super-ultrawide breakpoint is missing');
assert.match(styles, /max-height: 800px/, 'short HD viewport protection is missing');
assert.match(styles, /max-inline-size: calc\(100vw - 32px\)/, 'global horizontal overflow protection is missing');

for (const marker of [
  '1366, height: 768',
  '1920, height: 1080',
  '2560, height: 1440',
  '3440, height: 1440',
  '5120, height: 1440',
  '3840, height: 2160',
  '7680, height: 4320',
]) {
  assert.ok(matrix.includes(marker), `responsive production matrix is missing ${marker}`);
}
assert.match(matrix, /horizontal document overflow/, 'matrix must detect horizontal overflow');
assert.match(matrix, /naturalWidth > 0/, 'matrix must detect broken product images');
assert.ok(
  matrix.includes('portable-installer-compatible') && matrix.includes('old portable installer image still active'),
  'matrix must verify compatible portable installer asset'
);
assert.match(matrix, /ratingColumns/, 'matrix must verify feedback rating layout');

assert.match(schema, /PRAGMA table_info\(user_feedback\)/, 'D1 feedback schema verification is missing');
assert.match(entry, /handleFeedbackRequest/, 'production feedback entry must delegate to the feedback API');
assert.match(feedbackApi, /createFeedbackTableIfMissing/, 'feedback API must bootstrap a missing canonical table');
assert.match(schema, /ensureFeedbackSchemaCompatibility/, 'maintenance-only D1 compatibility helper is missing');
assert.doesNotMatch(entry, /ensureFeedbackSchemaCompatibility/, 'D1 maintenance migration must not block every public request');
assert.match(workerConfig, /"main": "src\/production-content-entry\.js"/, 'unexpected production Worker entry');

console.log('FormatX mobile showcase, feedback and responsive matrix validation passed with direct compatible asset ownership.');
