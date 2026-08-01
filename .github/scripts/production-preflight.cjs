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
const publicContract = json('docs/scifi-ui/data/public-platform-contract.json');
const packageAsset = release.channels?.multiplatform || null;
const syncWorkflow = read('.github/workflows/sync-current-release.yml');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const genome = read('docs/scifi-ui/scripts/synaptic-thought-genome.js');
const disclosure = read('docs/scifi-ui/scripts/synaptic-thought-disclosure.js');
const disclosureCss = read('docs/scifi-ui/styles/synaptic-thought-disclosure.css');
const privacy = read('docs/scifi-ui/privacy.html');
const downloads = read('docs/scifi-ui/downloads/index.html');
const home = read('docs/scifi-ui/index.html');
const productionWrapper = read('billing-worker/src/production-content-entry.js');
const previewWrapper = read('content-preview-entry.js');
const sitemap = read('docs/sitemap.xml');
const robots = read('docs/robots.txt');

check(
  'production-entry',
  production.main === 'src/production-content-entry.js',
  'Production Worker must use the content wrapper'
);
check(
  'production-domains',
  JSON.stringify((production.routes || []).map(route => route.pattern))
    === JSON.stringify(['formatxsuite.com', 'www.formatxsuite.com']),
  'Production Worker must own both FormatX custom domains'
);
check(
  'preview-isolation',
  preview.main === 'content-preview-entry.js'
    && preview.workers_dev === true
    && !(preview.routes || []).length,
  'Preview Worker must remain isolated on workers.dev'
);

for (const [name, source] of [
  ['production', productionWrapper],
  ['preview', previewWrapper],
]) {
  check(
    `${name}-wrapper`,
    source.includes('formatx-public-shell.js')
      && source.includes('release-metadata.js')
      && source.includes('cleanLegacyReleaseCopy')
      && source.includes("Cache-Control', 'no-store"),
    `${name} public content wrapper is incomplete`
  );
}

check(
  'release-source',
  release.ok === true
    && release.schema_version === 2
    && release.source === 'github_published_release'
    && release.prerelease !== true,
  'Current release provenance is invalid'
);
check(
  'multiplatform-package',
  packageAsset?.available === true
    && /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\//.test(
      packageAsset?.download_url || ''
    ),
  'Official multiplatform package is unavailable'
);
check(
  'platform-priority',
  packageAsset?.primary_platform === 'linux-bazzite'
    && ['linux-bazzite', 'windows'].every(
      platform => packageAsset?.supported_platforms?.includes(platform)
    ),
  'Package must identify Bazzite/Linux as primary and Windows as supported'
);
check(
  'release-digest',
  /^sha256:[a-f0-9]{64}$/i.test(packageAsset?.digest || ''),
  'Multiplatform package SHA-256 digest is missing'
);
check(
  'detached-signature',
  Boolean(release.evidence?.signature_asset_url),
  'No detached signature asset is published for the current release',
  'warning'
);
check(
  'public-version-hidden',
  publicContract.public_copy?.public_release_version_visible === false,
  'Public release version must remain hidden'
);
check(
  'public-contract',
  publicContract.public_copy?.primary_system === 'linux-bazzite'
    && publicContract.public_copy?.download_channel === 'multiplatform'
    && publicContract.public_copy?.supported_secondary_platforms?.includes('windows'),
  'Public Bazzite-first multiplatform contract is invalid'
);
check(
  'public-download-copy',
  downloads.includes('data-release-download="multiplatform"')
    && downloads.includes('Bazzite/Linux elsődleges')
    && downloads.includes('Windows támogatott')
    && !downloads.includes('/releases/download/v92/'),
  'Downloads page does not expose the current multiplatform contract'
);
check(
  'public-home-copy',
  home.includes('data-release-download="multiplatform"')
    && !home.includes('/releases/download/v92/')
    && !home.includes('92.00'),
  'Home page contains stale public release copy'
);

const zipPosition = syncWorkflow.indexOf('\\.zip$');
const tarPosition = syncWorkflow.indexOf('tar\\.gz|tar\\.xz');
check(
  'release-sync-zip-first',
  syncWorkflow.includes('def multiplatform_asset:')
    && zipPosition >= 0
    && tarPosition >= 0
    && zipPosition < tarPosition,
  'Release sync must prefer ZIP before tar fallbacks'
);
check(
  'release-sync-deterministic',
  syncWorkflow.includes('del(.synced_at)')
    && syncWorkflow.includes('cmp -s')
    && syncWorkflow.includes('--retry-all-errors'),
  'Release sync is not deterministic and resilient'
);

check(
  'organism-loader',
  loader.includes('safe-ready-v26')
    && loader.includes('safe-degraded-v26')
    && loader.includes('synaptic-thought-disclosure.js'),
  'Current Organism loader contract is missing'
);
check(
  'organism-safe-defaults',
  voice.includes('let speechEnabled = false')
    && voice.includes('setOpen(false, false)')
    && voice.includes('fx-organism-master-toggle')
    && !voice.includes('fetch(')
    && !voice.includes('XMLHttpRequest')
    && !voice.includes('WebSocket'),
  'Organism privacy or default-state contract failed'
);
check(
  'thought-genome-local',
  genome.includes('questionStored: false')
    && genome.includes('fingerprint-only')
    && !genome.includes('fetch(')
    && !genome.includes('XMLHttpRequest')
    && !genome.includes('WebSocket'),
  'Thought Genome must remain local and fingerprint-only'
);
check(
  'thought-disclosure',
  disclosure.includes('details.open = false')
    && disclosure.includes('defaultOpen: false')
    && disclosure.includes("liveRegion: 'response-only'")
    && disclosureCss.includes(':not([open]) > .fx-thought-genome-controls'),
  'Thought disclosure accessibility contract failed'
);
check(
  'privacy-notice',
  privacy.includes('nyers kérdésszöveget nem menti')
    && privacy.includes('legfeljebb 12 gondolatgenom-lenyomat')
    && privacy.includes('helyi vagy online hangot használhat'),
  'Privacy notice is incomplete'
);

for (const route of [
  '/scifi-ui/',
  '/scifi-ui/downloads/',
  '/scifi-ui/known-issues.html',
  '/scifi-ui/security.html',
  '/scifi-ui/privacy.html',
  '/scifi-ui/support.html',
]) {
  check(`sitemap-${route}`, sitemap.includes(route), `Sitemap missing ${route}`);
}
check(
  'robots-sitemap',
  robots.includes('Sitemap: https://www.formatxsuite.com/sitemap.xml'),
  'robots.txt does not declare the canonical sitemap'
);

for (const relative of [
  'docs/scifi-ui/styles/formatx-desktop-unified.css',
  'docs/scifi-ui/styles/downloads-page.css',
  'docs/scifi-ui/scripts/release-metadata.js',
  'docs/scifi-ui/scripts/formatx-public-shell.js',
  'docs/scifi-ui/scripts/public-evidence-pages.js',
  '.github/scripts/validate-public-release-integration.py',
  '.github/scripts/validate-public-pages-browser.cjs',
  '.github/scripts/validate-thought-disclosure-browser.cjs',
  '.github/workflows/validate-organism-dialogue.yml',
]) {
  check(
    `required-${relative}`,
    fs.existsSync(path.join(root, relative)),
    `Missing production readiness component: ${relative}`
  );
}

const report = {
  schema_version: 2,
  generated_at: new Date().toISOString(),
  ready: errors.length === 0,
  errors: [...new Set(errors)],
  warnings: [...new Set(warnings)],
  release: {
    internal_version: release.version || null,
    public_version_visible: false,
    package_digest: packageAsset?.digest || null,
    primary_platform: packageAsset?.primary_platform || null,
    supported_platforms: packageAsset?.supported_platforms || [],
    integrity_status: release.integrity?.status || null,
  },
  checks,
};

const outDir = path.join(root, 'artifacts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'production-readiness.json'),
  JSON.stringify(report, null, 2) + '\n'
);

console.log(JSON.stringify(report, null, 2));
if (!report.ready) process.exit(1);
