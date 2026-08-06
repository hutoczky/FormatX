const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const feedback = read('docs/scifi-ui/scripts/formatx-feedback.js');
const compatible = read('docs/scifi-ui/assets/images/product-showcase/portable-installer-compatible.svg');
const schema = read('billing-worker/src/feedback-schema.js');
const entry = read('billing-worker/src/production-feedback-entry.js');
const workerConfig = read('billing-worker/wrangler.jsonc');

assert.match(compatible, /^<svg[\s\S]*<\/svg>\s*$/, 'compatible portable installer must be a self-contained SVG');
assert.doesNotMatch(compatible, /data:image\/webp/i, 'Android-compatible asset must not embed WebP');
assert.doesNotMatch(compatible, /<image\b/i, 'Android-compatible asset must not rely on a nested raster image');
assert.match(compatible, /Teljes cross-platform csomag/, 'portable installer visual is missing the cross-platform state');
assert.match(compatible, /Linux indítófájlt/, 'portable installer visual is missing Linux launcher state');
assert.match(compatible, /Windows EXE/, 'portable installer visual is missing Windows launcher state');
assert.match(compatible, /macOS indítófájlt/, 'portable installer visual is missing macOS launcher state');

assert.match(feedback, /portable-installer-compatible\.svg\?v=/, 'mobile compatibility replacement is missing');
assert.match(feedback, /MutationObserver/, 'dynamically inserted showcase images are not monitored');
assert.match(feedback, /FEEDBACK_SUMMARY_URL = '\/api\/feedback\/summary'/, 'feedback summary endpoint is missing');
assert.match(feedback, /FEEDBACK_SUBMIT_URL = '\/api\/feedback'/, 'feedback submit endpoint is missing');
assert.match(feedback, /privacy_consent: true/, 'privacy consent is not sent explicitly');
assert.match(feedback, /REQUEST_TIMEOUT_MS/, 'feedback request timeout is missing');
assert.match(feedback, /credentials: 'same-origin'/, 'same-origin credentials are missing');

assert.match(schema, /PRAGMA table_info\(user_feedback\)/, 'D1 feedback schema verification is missing');
assert.match(entry, /ensureFeedbackSchemaCompatibility/, 'feedback entry must migrate the D1 schema before handling requests');
assert.match(workerConfig, /"main": "src\/production-content-entry\.js"/, 'unexpected production Worker entry');

console.log('FormatX mobile showcase and feedback integration validation passed.');
