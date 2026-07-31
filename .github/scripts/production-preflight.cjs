'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const errors = [];
const warnings = [];
const checks = [];

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    errors.push(`Missing file: ${relative}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function json(relative) {
  try {
    return JSON.parse(read(relative));
  } catch (error) {
    errors.push(`Invalid JSON ${relative}: ${error.message}`);
    return {};
  }
}

function check(id, condition, detail, severity = 'error') {
  const passed = Boolean(condition);
  checks.push({ id, passed, detail });
  if (!passed) (severity === 'warning' ? warnings : errors).push(detail);
}

const production = json('billing-worker/wrangler.jsonc');
const preview = json('wrangler.jsonc');
const release = json('docs/scifi-ui/data/current-release.json');
const issues = json('docs/scifi-ui/data/known-issues.json');
const productionWrapper = read('billing-worker/src/production-content-entry.js');
const previewWrapper = read('content-preview-entry.js');
const syncWorkflow = read('.github/workflows/sync-current-release.yml');
const robots = read('docs/robots.txt');
const sitemap = read('docs/sitemap.xml');

check('production-entry', production.main === 'src/production-content-entry.js', 'Production Worker must use src/production-content-entry.js');
check('production-domains', JSON.stringify((production.routes || []).map(route => route.pattern)) === JSON.stringify(['formatxsuite.com', 'www.formatxsuite.com']), 'Production Worker must exclusively own both FormatX custom domains');
check('preview-entry', preview.main === 'content-preview-entry.js', 'Preview Worker must use content-preview-entry.js');
check('preview-domain-isolation', !(preview.routes || []).length, 'Preview Worker must not own production domains');
check('preview-workers-dev', preview.workers_dev === true, 'Preview Worker must remain available through workers.dev');

for (const [label, source] of [['production', productionWrapper], ['preview', previewWrapper]]) {
  check(`${label}-public-shell`, source.includes('formatx-public-shell.js'), `${label} wrapper must inject the canonical public shell`);
  check(`${label}-release-controller`, source.includes('release-metadata.js'), `${label} wrapper must inject release metadata`);
  check(`${label}-no-store`, source.includes("Cache-Control', 'no-store"), `${label} wrapper must disable stale HTML/data caching`);
  check(`${label}-legacy-cleanup`, source.includes('cleanLegacyReleaseCopy'), `${label} wrapper must sanitize historical fixed release copy`);
}

check('release-ok', release.ok === true, 'Current official release metadata is not available');
check('release-source', release.source === 'github_published_release', 'Current release source is not github_published_release');
check('release-version', typeof release.version === 'string' && release.version.length > 0, 'Current release version is missing');
check('release-not-prerelease', release.prerelease !== true, 'Current official release must not be a prerelease');
check('windows-download', /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\//.test(release.channels?.windows?.download_url || ''), 'Windows download is not an official FormatX-Updates release asset');
check('release-schema-v2', release.schema_version === 2, 'Release metadata has not yet been regenerated with provenance schema 2', 'warning');
check('release-digest', /^sha256:[a-f0-9]{64}$/i.test(release.channels?.windows?.digest || ''), 'Windows package has no published SHA-256 digest', 'warning');
check('release-signature', Boolean(release.evidence?.signature_asset_url), 'No detached signature asset is published for the current release', 'warning');

check('known-issues-present', Array.isArray(issues.items) && issues.items.length > 0, 'Known-issues register is empty');
check('known-issues-current', typeof issues.updated === 'string' && issues.updated >= '2026-07-31', 'Known-issues register is not current');
check('release-sync-deterministic', syncWorkflow.includes("del(.synced_at)") && syncWorkflow.includes('cmp -s'), 'Release sync must ignore timestamp-only changes');
check('release-sync-retry', syncWorkflow.includes('--retry-all-errors'), 'Release sync lacks resilient GitHub API retries');

const publicPages = [
  '/scifi-ui/', '/scifi-ui/downloads/', '/scifi-ui/method.html',
  '/scifi-ui/verification.html', '/scifi-ui/test-matrix.html',
  '/scifi-ui/known-issues.html', '/scifi-ui/security.html',
  '/scifi-ui/decision-log.html', '/scifi-ui/license.html',
  '/scifi-ui/terms.html', '/scifi-ui/privacy.html', '/scifi-ui/support.html',
];
for (const url of publicPages) check(`sitemap-${url}`, sitemap.includes(url), `Sitemap missing ${url}`);
check('robots-sitemap', robots.includes('Sitemap: https://www.formatxsuite.com/sitemap.xml'), 'robots.txt does not declare the canonical sitemap');

for (const relative of [
  'docs/scifi-ui/scripts/formatx-public-shell.js',
  'docs/scifi-ui/scripts/public-evidence-pages.js',
  'docs/scifi-ui/scripts/release-metadata.js',
  '.github/scripts/validate-public-release-integration.py',
  '.github/scripts/validate-public-pages-browser.cjs',
]) {
  check(`required-${relative}`, fs.existsSync(path.join(root, relative)), `Missing production readiness component: ${relative}`);
}

const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  ready: errors.length === 0,
  errors: [...new Set(errors)],
  warnings: [...new Set(warnings)],
  release: {
    version: release.version || null,
    schema_version: release.schema_version || null,
    windows_digest: release.channels?.windows?.digest || null,
    integrity_status: release.integrity?.status || null,
  },
  checks,
};

const outDir = path.join(root, 'artifacts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'production-readiness.json'), JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report, null, 2));
if (!report.ready) process.exit(1);
