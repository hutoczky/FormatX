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
const productionBase = read('billing-worker/src/production-entry.js');
const previewWrapper = read('content-preview-entry.js');
const previewBase = read('worker.js');
const syncWorkflow = read('.github/workflows/sync-current-release.yml');
const robots = read('docs/robots.txt');
const sitemap = read('docs/sitemap.xml');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const organismVoice = read('docs/scifi-ui/scripts/organism-voice.js');
const thoughtGenome = read('docs/scifi-ui/scripts/synaptic-thought-genome.js');
const thoughtDisclosure = read('docs/scifi-ui/scripts/synaptic-thought-disclosure.js');
const thoughtDisclosureCss = read('docs/scifi-ui/styles/synaptic-thought-disclosure.css');
const privacy = read('docs/scifi-ui/privacy.html');

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

check('organism-loader-v25', loader.includes('safe-ready-v25') && loader.includes('safe-degraded-v25'), 'Organism startup loader must use the v25 disclosure-safe contract');
check('organism-loader-disclosure', loader.includes('synaptic-thought-disclosure.js?v=20260731-thought-disclosure-1'), 'Organism startup loader does not include the thought disclosure module');
check('organism-loader-order', loader.indexOf('synaptic-thought-genome.js') < loader.indexOf('synaptic-thought-disclosure.js') && loader.indexOf('synaptic-thought-disclosure.js') < loader.indexOf('formatx-three-host-safe.js'), 'Thought disclosure startup ordering is invalid');
check('organism-master-switch', organismVoice.includes('fx-organism-master-toggle') && organismVoice.includes('ROOT.dataset.fxOrganismDialogueEnabled'), 'Organism master on/off control is missing');
check('organism-voice-off-default', organismVoice.includes('let speechEnabled = false'), 'Organism speech must remain off by default');
check('organism-dialogue-closed-default', organismVoice.includes("hidden: ''") && organismVoice.includes('setOpen(false, false)'), 'Organism thought dialogue must start closed');
check('organism-local-response', !organismVoice.includes('fetch(') && !organismVoice.includes('XMLHttpRequest') && !organismVoice.includes('WebSocket'), 'Organism response engine must not send questions over the network');
check('thought-genome-fingerprint-only', thoughtGenome.includes('questionStored: false') && thoughtGenome.includes('fingerprint-only'), 'Thought Genome must store fingerprints instead of raw questions');
check('thought-genome-local', !thoughtGenome.includes('fetch(') && !thoughtGenome.includes('XMLHttpRequest') && !thoughtGenome.includes('WebSocket'), 'Thought Genome must remain local');
check('thought-disclosure-closed-default', thoughtDisclosure.includes('details.open = false') && thoughtDisclosure.includes('defaultOpen: false'), 'Thought Genome advanced controls must start closed');
check('thought-disclosure-response-live-region', thoughtDisclosure.includes("bubble.removeAttribute('aria-live')") && thoughtDisclosure.includes("output.setAttribute('aria-live', 'polite')") && thoughtDisclosure.includes("liveRegion: 'response-only'"), 'Only the Organism response text may be an aria-live region');
check('thought-disclosure-master-off', thoughtDisclosureCss.includes("data-fx-organism-dialogue-enabled='false'") && thoughtDisclosureCss.includes('.fx-thought-genome-layer') && thoughtDisclosureCss.includes('opacity: 0 !important'), 'Organism master off must hide the thought constellation');
check('thought-disclosure-progressive', thoughtDisclosureCss.includes(':not([open]) > .fx-thought-genome-controls') && thoughtDisclosureCss.includes('display: none !important'), 'Thought Genome advanced controls must use progressive disclosure');
check('organism-privacy-raw-question', privacy.includes('nyers kérdésszöveget nem menti') && privacy.includes('legfeljebb 12 gondolatgenom-lenyomat'), 'Privacy notice must document fingerprint-only Thought Genome storage');
check('organism-privacy-speech-service', privacy.includes('helyi vagy online hangot használhat'), 'Privacy notice must disclose that browser speech may be local or online');
for (const [label, source] of [['production', productionBase], ['preview', previewBase]]) {
  check(`${label}-thought-disclosure-js`, source.includes('synaptic-thought-disclosure.js'), `${label} Worker must serve thought disclosure JavaScript without stale caching`);
  check(`${label}-thought-disclosure-css`, source.includes('synaptic-thought-disclosure.css'), `${label} Worker must serve thought disclosure CSS without stale caching`);
}
check('preview-thought-disclosure-routes', JSON.stringify(preview).includes('/scifi-ui/scripts/synaptic-thought-disclosure.js') && JSON.stringify(preview).includes('/scifi-ui/styles/synaptic-thought-disclosure.css'), 'Preview Worker route list is missing thought disclosure assets');

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
  'docs/scifi-ui/scripts/organism-voice.js',
  'docs/scifi-ui/scripts/synaptic-thought-genome.js',
  'docs/scifi-ui/scripts/synaptic-thought-disclosure.js',
  'docs/scifi-ui/styles/synaptic-thought-disclosure.css',
  '.github/scripts/validate-public-release-integration.py',
  '.github/scripts/validate-public-pages-browser.cjs',
  '.github/scripts/validate-thought-disclosure-browser.cjs',
  '.github/workflows/validate-organism-dialogue.yml',
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
