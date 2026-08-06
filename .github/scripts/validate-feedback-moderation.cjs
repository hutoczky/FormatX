const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const required = [
  'billing-worker/src/feedback-api.js',
  'billing-worker/src/feedback-schema.js',
  'billing-worker/src/production-feedback-entry.js',
  'docs/fx-owner-license/index.html',
  'docs/fx-owner-license/feedback.html',
  'docs/fx-owner-license/feedback-admin.js',
  'docs/fx-owner-license/feedback-admin.css',
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `Missing moderation file: ${file}`);

const api = read('billing-worker/src/feedback-api.js');
const schema = read('billing-worker/src/feedback-schema.js');
const entry = read('billing-worker/src/production-feedback-entry.js');
const index = read('docs/fx-owner-license/index.html');
const page = read('docs/fx-owner-license/feedback.html');
const script = read('docs/fx-owner-license/feedback-admin.js');
const style = read('docs/fx-owner-license/feedback-admin.css');

assert.match(api, /ADMIN_FEEDBACK_ROOT = '\/fx-owner-license\/api\/feedback'/, 'protected moderation API root missing');
assert.match(api, /Cf-Access-Jwt-Assertion/, 'Cloudflare Access JWT requirement missing');
assert.match(api, /verifyAccessJwt/, 'Access JWT verification missing');
assert.match(api, /ADMIN_EMAILS/, 'admin allowlist validation missing');
assert.match(api, /WHERE status = 'approved'/, 'public average must remain approved-only');
assert.match(api, /status === 'approved' \? now : null/, 'approved timestamp handling missing');
assert.match(api, /DELETE FROM user_feedback/, 'permanent deletion workflow missing');
assert.match(api, /origin_not_allowed/, 'same-origin mutation protection missing');
assert.doesNotMatch(api, /contact_email[^\n]+feedbackSummary/, 'public summary must not expose email');

assert.match(schema, /PRAGMA table_info\(user_feedback\)/, 'runtime schema inspection missing');
assert.match(schema, /ALTER TABLE user_feedback ADD COLUMN/, 'missing-column migration missing');
assert.match(schema, /duplicate column/, 'concurrent migration handling missing');
assert.match(schema, /CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created/, 'feedback IP index migration missing');
assert.match(schema, /schemaReadyPromise/, 'per-isolate migration cache missing');
assert.match(schema, /feedback_schema_column_missing/, 'post-migration verification missing');
assert.match(entry, /ensureFeedbackSchemaCompatibility/, 'production entry does not run the migration');
assert.match(entry, /isFeedbackRequestPath/, 'production entry does not scope migration to feedback requests');
assert.ok(entry.indexOf('ensureFeedbackSchemaCompatibility') < entry.indexOf('handleFeedbackRequest(request, env)'), 'migration must run before feedback API handling');

assert.match(index, /feedback\.html/, 'owner centre feedback navigation missing');
assert.match(page, /noindex,nofollow,noarchive/, 'moderation page must not be indexed');
assert.match(page, /approveButton/, 'approval control missing');
assert.match(page, /rejectButton/, 'rejection control missing');
assert.match(page, /deleteButton/, 'deletion control missing');
assert.match(page, /feedback-admin\.js/, 'moderation runtime missing');
assert.match(page, /feedback-admin\.css/, 'moderation stylesheet missing');

assert.match(script, /\/fx-owner-license\/api\/feedback/, 'moderation API client missing');
assert.match(script, /method: 'PATCH'/, 'moderation update request missing');
assert.match(script, /method: 'DELETE'/, 'moderation deletion request missing');
assert.match(script, /textContent/, 'safe text rendering missing');
assert.doesNotMatch(script, /innerHTML\s*=/, 'untrusted feedback must not be rendered with innerHTML');
assert.match(style, /\.feedback-layout/, 'moderation layout styling missing');
assert.match(style, /@media\(max-width:/, 'moderation mobile layout missing');

console.log('FormatX protected feedback and D1 schema migration validation passed.');
