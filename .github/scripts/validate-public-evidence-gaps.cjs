const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const required = [
  'billing-worker/src/feedback-api.js',
  'billing-worker/src/production-feedback-entry.js',
  'billing-worker/src/production-content-base.js',
  'billing-worker/license-migrations/0002_user_feedback.sql',
  'docs/scifi-ui/scripts/formatx-feedback.js',
  'docs/scifi-ui/styles/formatx-feedback.css',
  'docs/scifi-ui/styles/formatx-feedback-public.css',
  'docs/scifi-ui/technical-report.html',
  'docs/scifi-ui/reports/formatx-technical-evidence-report.md',
  'docs/sitemap.xml',
];
required.forEach(file => assert.ok(exists(file), `Missing public evidence file: ${file}`));

const contentEntry = read('billing-worker/src/production-content-entry.js');
const contentBase = read('billing-worker/src/production-content-base.js');
const feedbackApi = read('billing-worker/src/feedback-api.js');
const feedbackUi = read('docs/scifi-ui/scripts/formatx-feedback.js');
const feedbackCss = read('docs/scifi-ui/styles/formatx-feedback.css');
const feedbackPublicCss = read('docs/scifi-ui/styles/formatx-feedback-public.css');
const migration = read('billing-worker/license-migrations/0002_user_feedback.sql');
const report = read('docs/scifi-ui/technical-report.html');
const reportDownload = read('docs/scifi-ui/reports/formatx-technical-evidence-report.md');
const sitemap = read('docs/sitemap.xml');
const summaryStart = feedbackApi.indexOf('async function feedbackSummary');
const summaryEnd = feedbackApi.indexOf('async function submitFeedback');
const publicSummary = summaryStart >= 0 && summaryEnd > summaryStart ? feedbackApi.slice(summaryStart, summaryEnd) : '';

assert.match(contentEntry, /production-content-base\.js/, 'public routing wrapper is not delegating to the content pipeline');
assert.match(contentBase, /production-feedback-entry\.js/, 'production feedback wrapper is not active in the content pipeline');
assert.match(contentBase, /id=\"live-os-overview\"/, 'static indexable Live OS section missing');
assert.match(contentBase, /itemtype=\"https:\/\/schema\.org\/SoftwareApplication\"/, 'SoftwareApplication microdata missing');
assert.match(contentBase, /data-fx-live-os-cta/, 'primary Live OS CTA missing');
assert.match(contentBase, /id=\"user-feedback\"/, 'homepage user feedback form missing');
assert.match(contentBase, /data-fx-feedback-summary/, 'approved feedback summary missing');
assert.match(contentBase, /fx-noscript-proof/, 'noscript evidence fallback missing');
assert.match(contentBase, /technical-report\.html/, 'technical report link missing');
assert.match(contentBase, /Felhasználói értékelés és visszajelzés/, 'privacy disclosure injection missing');

assert.match(publicSummary, /WHERE status = 'approved'/, 'public average must use approved feedback only');
assert.match(publicSummary, /publish_permission = 1/, 'public text must require explicit publication permission');
assert.match(publicSummary, /SELECT overall, comment, display_name, locale, approved_at/, 'approved public review projection missing');
assert.doesNotMatch(publicSummary, /contact_email|ip_hash|user_agent|moderation_note|consent_version/, 'public feedback summary exposes private data');
assert.match(feedbackApi, /'pending'/, 'new feedback must start as pending moderation');
assert.match(feedbackApi, /privacy_consent/, 'privacy consent validation missing');
assert.match(feedbackApi, /PUBLIC_API_RATE_LIMIT/, 'public API rate limiting missing');
assert.match(feedbackApi, /hashRequestIdentity/, 'raw network identifier must not be stored');
assert.match(feedbackApi, /explicit publication permission/, 'summary privacy/publication disclosure missing');
assert.doesNotMatch(feedbackApi, /CF-Connecting-IP[^\n]+INSERT/, 'raw IP must not be inserted');

assert.match(migration, /CREATE TABLE IF NOT EXISTS user_feedback/, 'feedback table migration missing');
assert.match(migration, /CHECK \(status IN \('pending', 'approved', 'rejected'\)\)/, 'feedback moderation status constraint missing');
assert.match(migration, /contact_email TEXT/, 'optional contact field missing');
assert.match(migration, /publish_permission/, 'publication permission field missing');

assert.match(feedbackUi, /\/api\/feedback\/summary/, 'feedback summary endpoint not used');
assert.match(feedbackUi, /method: 'POST'/, 'feedback submission POST missing');
assert.match(feedbackUi, /pending moderation|moderálásra vár/, 'moderation messaging missing');
assert.match(feedbackUi, /data-fx-live-os-launcher/, 'Live OS CTA integration missing');
assert.match(feedbackUi, /renderPublicReviews/, 'approved comments are not rendered publicly');
assert.match(feedbackUi, /paragraph\.textContent/, 'approved comments must use safe text rendering');
assert.match(feedbackUi, /rootMargin: '800px 0px'/, 'feedback work must be deferred until close to the viewport');
assert.match(feedbackCss, /\.fx-rating-stars/, 'star rating styling missing');
assert.match(feedbackCss, /prefers-reduced-motion/, 'reduced-motion feedback styling missing');
assert.match(feedbackPublicCss, /\.fx-feedback-public-card/, 'approved review card styling missing');
assert.match(feedbackPublicCss, /contain: layout paint style/, 'approved review rendering containment missing');

assert.match(report, /Desktop és mobil minőségkapuk/, 'current technical quality-gate section missing');
assert.match(report, /No independent professional review has been published|Nincs publikált független szakmai teszt/, 'honest external evidence gap missing');
assert.match(report, /Még hiányzó külső bizonyíték/, 'current external evidence-gap section missing');
assert.match(report, /Seamless-v7 natív folytonos görgetés/, 'current continuous-scroll evidence section missing');
assert.match(reportDownload, /Performance: legalább 90/, 'downloadable report gate missing');
assert.match(reportDownload, /Moderált felhasználói értékelés/, 'downloadable feedback moderation report missing');
assert.match(reportDownload, /minden eszközre garantált 120 FPS nincs állítva|minden eszközre garantált 60 vagy 120 FPS field eredmény/, 'non-guaranteed field FPS disclosure missing');
assert.match(sitemap, /technical-report\.html/, 'technical report is absent from sitemap');

(async () => {
  const moduleUrl = pathToFileURL(path.join(root, 'billing-worker/src/feedback-api.js')).href;
  const { validateFeedbackPayload } = await import(moduleUrl);

  const valid = validateFeedbackPayload({
    overall: 5,
    usability: 4,
    performance: 4,
    design: 5,
    features: 4,
    comment: 'Valódi tesztvisszajelzés.',
    contact_email: 'user@example.com',
    privacy_consent: true,
  });
  assert.equal(valid.ok, true, JSON.stringify(valid.errors));

  const invalid = validateFeedbackPayload({
    overall: 9,
    usability: 0,
    performance: 3.5,
    design: 5,
    features: 4,
    contact_email: 'invalid',
    privacy_consent: false,
  });
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.overall);
  assert.ok(invalid.errors.usability);
  assert.ok(invalid.errors.performance);
  assert.ok(invalid.errors.contact_email);
  assert.ok(invalid.errors.privacy_consent);

  console.log('FormatX public evidence, lazy feedback and consent-gated public comment validation passed through the current production content pipeline.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
