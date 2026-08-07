'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const errors = [];
const warnings = [];
const checks = [];

function read(relative) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) {
    errors.push(`Missing file: ${relative}`);
    return '';
  }
  return fs.readFileSync(target, 'utf8');
}

function json(relative) {
  try {
    return JSON.parse(read(relative));
  } catch (error) {
    errors.push(`Invalid JSON ${relative}: ${error.message}`);
    return {};
  }
}

function check(id, passed, detail, severity = 'error') {
  const result = Boolean(passed);
  checks.push({ id, passed: result, detail });
  if (!result) (severity === 'warning' ? warnings : errors).push(detail);
}

const production = json('billing-worker/wrangler.jsonc');
const preview = json('wrangler.jsonc');
const release = json('docs/scifi-ui/data/current-release.json');
const publicContract = json('docs/scifi-ui/data/public-platform-contract.json');
const packageAsset = release.channels?.multiplatform || release.channels?.windows || null;
const androidAsset = release.channels?.android || null;
const syncWorkflow = read('.github/workflows/sync-current-release.yml');
const home = read('docs/scifi-ui/index.html');
const downloads = read('docs/scifi-ui/downloads/index.html');
const releaseController = read('docs/scifi-ui/scripts/release-metadata.js');
const desktopCss = read('docs/scifi-ui/styles/formatx-desktop-unified.css');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const voiceStability = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const masterSync = read('docs/scifi-ui/scripts/organism-master-sync.js');
const masterSyncCss = read('docs/scifi-ui/styles/organism-master-sync.css');
const genome = read('docs/scifi-ui/scripts/synaptic-thought-genome.js');
const disclosure = read('docs/scifi-ui/scripts/synaptic-thought-disclosure.js');
const disclosureCss = read('docs/scifi-ui/styles/synaptic-thought-disclosure.css');
const privacy = read('docs/scifi-ui/privacy.html');
const productionWrapper = read('billing-worker/src/production-content-entry.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const previewWrapper = read('content-preview-entry.js');
const previewWorker = read('worker.js');
const sitemap = read('docs/sitemap.xml');
const robots = read('docs/robots.txt');

check(
  'production-worker',
  production.main === 'src/production-content-entry.js'
    && JSON.stringify((production.routes || []).map(route => route.pattern))
      === JSON.stringify(['formatxsuite.com', 'www.formatxsuite.com']),
  'Production Worker ownership is invalid'
);
check(
  'preview-worker',
  preview.main === 'content-preview-entry.js'
    && preview.workers_dev === true
    && !(preview.routes || []).length,
  'Preview Worker must remain isolated on workers.dev'
);
for (const [name, source] of [['production', productionWrapper], ['preview', previewWrapper]]) {
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
  'release-provenance',
  release.ok === true
    && release.schema_version === 2
    && release.source === 'github_published_release'
    && release.prerelease !== true,
  'Current release provenance is invalid'
);
check(
  'official-package',
  packageAsset?.available === true
    && /^https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\//.test(
      packageAsset?.download_url || ''
    )
    && /^sha256:[a-f0-9]{64}$/i.test(packageAsset?.digest || ''),
  'Official package or SHA-256 digest is invalid'
);
check(
  'android-package-integrity',
  androidAsset?.available === true
    && androidAsset?.download_url === '/download/android'
    && Number.isInteger(androidAsset?.size)
    && androidAsset.size > 0
    && /^sha256:[a-f0-9]{64}$/i.test(androidAsset?.digest || ''),
  'Official Android package size or SHA-256 digest is invalid'
);
check(
  'public-platform-contract',
  publicContract.public_copy?.primary_system === 'linux-bazzite'
    && publicContract.public_copy?.download_channel === 'multiplatform'
    && publicContract.public_copy?.public_release_version_visible === false
    && publicContract.public_copy?.supported_secondary_platforms?.includes('windows')
    && publicContract.public_copy?.supported_secondary_platforms?.includes('android'),
  'Public Bazzite-first multiplatform contract is invalid'
);
check(
  'detached-signature',
  Boolean(release.evidence?.signature_asset_url),
  'No detached signature asset is published for the current release',
  'warning'
);

check(
  'public-copy',
  home.includes('data-release-download="multiplatform"')
    && downloads.includes('data-release-download="multiplatform"')
    && downloads.includes('Bazzite/Linux elsődleges')
    && downloads.includes('Windows támogatott')
    && !home.includes('/releases/download/v92/')
    && !downloads.includes('/releases/download/v92/')
    && !home.includes('92.00'),
  'Public release copy still contains a stale or Windows-only contract'
);
check(
  'download-csp',
  downloads.includes('../styles/downloads-page.css')
    && !downloads.includes('<style>'),
  'Downloads page styling is incompatible with its CSP'
);
check(
  'trusted-download-gate',
  releaseController.includes('if (!state.available) return null;')
    && releaseController.includes('releaseDescription')
    && releaseController.includes("setText('[data-release-version]', '', false)")
    && releaseController.includes('channels?.multiplatform')
    && releaseController.includes('channels?.windows'),
  'Public download controller does not enforce trust, accessibility, hidden versions and legacy channel normalization'
);

const selectorStart = syncWorkflow.indexOf('def multiplatform_asset:');
const selectorEnd = syncWorkflow.indexOf('def android_asset:');
const selector = selectorStart >= 0 && selectorEnd > selectorStart
  ? syncWorkflow.slice(selectorStart, selectorEnd)
  : '';
check(
  'release-sync-asset-order',
  selector.includes('zip')
    && selector.includes('tar')
    && selector.indexOf('zip') < selector.indexOf('tar')
    && selector.includes('//'),
  'Release sync must prefer ZIP before tar fallbacks'
);
check(
  'release-sync-deterministic',
  syncWorkflow.includes('del(.synced_at, .channels.android.updated_at)')
    && syncWorkflow.includes('cmp -s')
    && syncWorkflow.includes('--retry-all-errors')
    && syncWorkflow.includes('android_local_size')
    && syncWorkflow.includes('android_local_digest')
    && syncWorkflow.includes('sha256sum')
    && syncWorkflow.includes("stat -c '%s'"),
  'Release sync is not deterministic and resilient'
);

check(
  'desktop-layout',
  desktopCss.includes('grid-template-columns')
    && desktopCss.includes('height: min(860px, calc(100svh - 69px))')
    && desktopCss.includes('max-height: min(860px, calc(100svh - 69px))')
    && desktopCss.includes('min-height: 680px')
    && desktopCss.includes('max-height: 820px')
    && desktopCss.includes('min-width: 1100px'),
  'Desktop hero composition contract is incomplete'
);
check(
  'organism-loader',
  loader.includes('safe-ready-v27')
    && loader.includes('safe-degraded-v27')
    && loader.includes('formatx-desktop-unified.css')
    && loader.includes('organism-master-sync.js?v=20260802-master-sync-1')
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
  'organism-overlay-stability',
  voiceStability.includes('function interfaceBlocked()')
    && voiceStability.includes('function stopSpeech()')
    && voiceStability.includes('candidates.slice(0, -1).forEach(node => node.remove())'),
  'Organism overlay or duplicate-instance stability contract failed'
);
check(
  'organism-master-sync',
  masterSync.includes('data-fx-organism-dialogue-enabled')
    && masterSync.includes('fx-organism-master-disabled')
    && masterSync.includes('organism-master-sync.css?v=20260802-master-sync-1')
    && masterSync.includes('formatx:organismmastersync')
    && !masterSync.includes("document.createElement('style')")
    && masterSyncCss.includes('html.fx-organism-master-disabled .fx-thought-genome-layer')
    && masterSyncCss.includes('html.fx-organism-master-disabled .fx-thought-genome-disclosure')
    && productionEntry.includes('organism-master-sync.js')
    && productionEntry.includes('organism-master-sync.css')
    && previewWorker.includes('organism-master-sync.js')
    && previewWorker.includes('organism-master-sync.css'),
  'Organism master switch does not control every optional thought layer safely'
);
check(
  'thought-genome',
  genome.includes('questionStored: false')
    && genome.includes('fingerprint-only')
    && !genome.includes('fetch(')
    && disclosure.includes('details.open = false')
    && disclosure.includes("liveRegion: 'response-only'")
    && disclosureCss.includes(':not([open]) > .fx-thought-genome-controls'),
  'Thought Genome privacy or progressive-disclosure contract failed'
);
check(
  'privacy-notice',
  privacy.includes('nyers kérdésszöveget nem menti')
    && privacy.includes('legfeljebb 12 gondolatgenom-lenyomat')
    && privacy.includes('helyi vagy online hangot használhat'),
  'Privacy notice is incomplete'
);

check(
  'sitemap-root',
  sitemap.includes('<loc>https://www.formatxsuite.com/</loc>'),
  'Sitemap missing canonical root homepage'
);
for (const route of [
  '/scifi-ui/downloads/',
  '/scifi-ui/android/',
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
  'docs/scifi-ui/styles/organism-master-sync.css',
  'docs/scifi-ui/scripts/release-metadata.js',
  'docs/scifi-ui/scripts/formatx-public-shell.js',
  'docs/scifi-ui/scripts/public-evidence-pages.js',
  'docs/scifi-ui/scripts/organism-master-sync.js',
  '.github/scripts/validate-public-release-integration.py',
  '.github/scripts/validate-public-pages-browser.cjs',
  '.github/scripts/validate-thought-disclosure-browser.cjs',
  '.github/workflows/validate-organism-dialogue.yml',
  '.github/workflows/validate-android-release-integrity.yml',
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
    android_package_digest: androidAsset?.digest || null,
    android_package_size: androidAsset?.size || null,
    primary_platform: publicContract.public_copy?.primary_system || null,
    supported_platforms: [
      publicContract.public_copy?.primary_system,
      ...(publicContract.public_copy?.supported_secondary_platforms || [])
    ].filter(Boolean),
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
