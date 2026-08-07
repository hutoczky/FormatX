'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));
const includesAll = (source, tokens) => tokens.every(token => source.includes(token));

const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const menu = read('docs/scifi-ui/scripts/organism-menu-controller.js');
const consoleState = read('docs/scifi-ui/scripts/organism-console-state.js');
const language = read('docs/scifi-ui/scripts/single-language-toggle.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const loopStyle = read('docs/scifi-ui/styles/formatx-seamless-loop.css');
const downloads = read('docs/scifi-ui/downloads/index.html');
const downloadStyle = read('docs/scifi-ui/styles/downloads-page.css');
const feedbackSchema = read('billing-worker/src/feedback-schema.js');
const feedbackEntry = read('billing-worker/src/production-feedback-entry.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const masterSync = read('docs/scifi-ui/scripts/organism-master-sync.js');
const mobileEntry = read('docs/scifi-ui/scripts/mobile-webgl-entry.js');
const morphEngine = read('docs/scifi-ui/scripts/mobile-core-engine-v3.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const deployWorkflow = read('.github/workflows/deploy-formatx-custom-domain.yml');

assert.ok(includesAll(loader, ['safe-ready-v27', 'safe-degraded-v27', 'load(index + 1)']), 'failure-tolerant loader missing');
assert.ok(loader.indexOf('organism-core-controller.js') < loader.indexOf('organism-voice.js'), 'core must load before voice');
assert.ok(loader.indexOf('organism-voice-stability.js') < loader.indexOf('organism-master-sync.js'), 'voice stability must load before master sync');
assert.ok(!loader.includes('organism-voice-foreground.js'), 'conflicting foreground module returned');

assert.ok(includesAll(menu, ['function setOpen(toggle, nav, open)', 'aria-expanded', 'fx-organism-menu-open']), 'menu state contract missing');
assert.ok(includesAll(consoleState, ['forceClosed', 'is-authorised-open', 'shell.hidden = true']), 'panel closed-state contract missing');
assert.ok(includesAll(language, ["toggle.className = 'fx-language-toggle'", 'localStorage.setItem', 'localStorage.getItem']), 'single language toggle contract missing');

assert.ok(includesAll(infinite, [
  "const VERSION = 'seamless-v6'",
  "root.dataset.fxInfiniteInput = 'native'",
  "root.dataset.fxInfiniteCloneMode = 'visual-bridge'",
  'clonedHeroOnly: true',
  'clonedContent: false',
  'reinitialisedRenderer: false',
  'frameStableLanding: true',
  'jumpFree: true',
  "addEventListener('scroll', onScroll, { passive: true })",
  "window.scrollTo({ top: target, left: 0, behavior: 'auto' })",
  "root.dataset.fxLoopLandingState = 'stabilising'",
  "root.dataset.fxLoopLandingState = 'settled'",
]), 'seamless loop controller contract missing');
assert.ok(!/addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,180}preventDefault/.test(infinite), 'loop must not capture wheel or touch input');
assert.ok(!infinite.includes('document.body.cloneNode') && !infinite.includes('document.documentElement.cloneNode'), 'full-page cloning is forbidden');
assert.ok(includesAll(loopStyle, ['.fx-loop-bridge', '.fx-loop-hero-clone', 'html.fx-seamless-loop-transfer']), 'seamless loop visual contract missing');
assert.ok(includesAll(infinite, ['fx-release-download-hub', 'repairReleasePanel', 'Licencfeltételek']), 'release/footer repair missing');
assert.ok(includesAll(infinite, ['TELJES VERZIÓ', '5 napos próbalicenc']), 'full release and five-day trial copy missing from release hub');

assert.ok(includesAll(downloads, [
  'https://github.com/hutoczky/FormatX-Updates/releases/latest',
  'data-release-download="multiplatform"',
  '../verification.html',
  '../test-matrix.html',
  '../known-issues.html',
  '../security.html',
  '../support.html',
  'Teljes multiplatform verzió letöltése',
  '5 napos próbalicenc',
]), 'downloads page fallback, full release, trial or evidence links missing');
assert.ok(!downloads.includes('data-release-download="multiplatform" data-release-description="multiplatform-beta-note" aria-describedby="multiplatform-beta-note" href="./"'), 'downloads fallback must not point to itself');
assert.ok(!/\b(?:nyilvános béta|public beta)\b/i.test(downloads), 'retired beta wording remains on downloads page');
assert.ok(includesAll(downloadStyle, ['grid-template-columns: repeat(3', '@media (max-width: 800px)', '@media (min-width: 2200px)']), 'downloads responsive range missing');

assert.ok(includesAll(feedbackSchema, [
  "SCHEMA_VERSION = '4'",
  'ALTER TABLE user_feedback ADD COLUMN',
  'feedback_schema_column_missing',
  'saveSchemaVersionBestEffort',
  'CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created',
]), 'non-destructive recoverable feedback schema missing');
assert.ok(!feedbackSchema.includes('DROP TABLE user_feedback'), 'feedback recovery must never drop the live table');
assert.ok(!feedbackSchema.includes('RECOVERY_TABLE'), 'legacy destructive feedback recovery path returned');
assert.ok(includesAll(feedbackEntry, [
  'feedback_schema_unavailable',
  "['/downloads/', '/scifi-ui/downloads/']",
  "['/support.html', '/scifi-ui/support.html']",
  'ensureFeedbackSchemaCompatibility',
]), 'feedback fail-safe or public aliases missing');

const qrFiles = [
  'docs/scifi-ui/assets/qr/business_lite-huf.svg',
  'docs/scifi-ui/assets/qr/business_lite-eur.svg',
  'docs/scifi-ui/assets/qr/business_pro-huf.svg',
  'docs/scifi-ui/assets/qr/business_pro-eur.svg',
  'docs/scifi-ui/assets/qr/technician_team-huf.svg',
  'docs/scifi-ui/assets/qr/technician_team-eur.svg',
];
assert.ok(qrFiles.every(exists), 'local QR fallback set incomplete');
assert.ok(includesAll(pricingApi, ["url.pathname === '/api/checkout-qr'", "Content-Type', 'image/png"]), 'QR endpoint missing');

assert.ok(includesAll(voice, ['SpeechSynthesisUtterance', 'A FormatX Organizmus válaszai']) && !voice.includes('XMLHttpRequest'), 'local voice contract missing');
assert.ok(includesAll(masterSync, ['formatx:organismmastersync', 'speechSynthesis.cancel()']), 'master switch synchronization missing');
assert.ok(mobileEntry.includes('mobile-core-engine-v3.js') && includesAll(morphEngine, ['coreForm', 'neuralForm', 'organForm', 'heartForm', 'skeletonForm', 'beaconForm']), 'morphing organism renderer missing');

assert.ok(includesAll(productionEntry, ['formatx-infinite-scroll.js', 'organism-interface.js', 'formatx-premium-finish.js']), 'critical production assets missing');
assert.ok(deployWorkflow.includes('needs: validate') && deployWorkflow.includes('npx wrangler deploy'), 'production deploy must depend on validation');
assert.ok(deployWorkflow.includes('https://formatxsuite.com') && deployWorkflow.includes('https://www.formatxsuite.com'), 'custom-domain smoke checks missing');

console.log('PASS: FormatX seamless scroll, full release/trial copy, non-destructive feedback recovery, downloads, responsive UI and deployment gates are present.');
