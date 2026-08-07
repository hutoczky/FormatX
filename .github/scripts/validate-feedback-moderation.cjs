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
assert.doesNotMatch(api, /SCHEMA_SQL|ensureFeedbackSchemaCompatibility|ensureFeedbackSchema\(/, 'normal feedback API path must not execute blanket schema preflight or duplicate DDL');
assert.match(api, /import \{ createFeedbackTableIfMissing \} from '.\/feedback-schema\.js'/, 'on-demand table bootstrap import missing');
assert.match(api, /async function runWithFeedbackTable/, 'missing-table retry wrapper missing');
assert.match(api, /classifyFeedbackError\(error\) !== 'feedback_table_missing'/, 'bootstrap must be limited to a proven missing-table error');
assert.match(api, /await createFeedbackTableIfMissing\(database\)/, 'missing table is not bootstrapped on demand');
assert.match(api, /diagnostic: 'database_binding_unavailable'/, 'D1 binding diagnostic missing');
assert.match(api, /function classifyFeedbackError/, 'safe D1 failure classification missing');
assert.match(api, /feedback_table_missing/, 'missing-table diagnostic missing');

assert.match(schema, /PRAGMA table_info\(user_feedback\)/, 'maintenance schema inspection missing');
assert.match(schema, /SCHEMA_VERSION = '6'/, 'feedback maintenance schema version must be v6');
assert.match(schema, /export async function createFeedbackTableIfMissing/, 'on-demand feedback table bootstrap missing');
assert.match(schema, /database\.prepare\(createTableSql\(\)\)\.run\(\)/, 'bootstrap must create the canonical table with a single prepared D1 statement');
assert.match(schema, /bootstrapPromise/, 'bootstrap race protection missing');
assert.match(schema, /if \(hasCanonicalColumns\(columns\)\) return;/, 'maintenance read-only fast path missing');
assert.match(schema, /ALTER TABLE user_feedback ADD COLUMN/, 'non-destructive missing-column migration missing');
assert.doesNotMatch(schema, /DROP TABLE user_feedback/, 'schema recovery must never drop live feedback data');
assert.doesNotMatch(schema, /RECOVERY_TABLE/, 'destructive recovery-table path must be retired');

assert.match(entry, /handleFeedbackRequest\(request, env\)/, 'production feedback routing missing');
assert.doesNotMatch(entry, /ensureFeedbackSchemaCompatibility|isFeedbackRequestPath|schemaFailure/, 'production request path must not be blocked by schema maintenance');

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

console.log('FormatX feedback validation passed: direct D1 routing, on-demand missing-table bootstrap and protected moderation are intact.');
