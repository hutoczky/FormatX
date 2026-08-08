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
const feedbackApi = read('billing-worker/src/feedback-api.js');
const feedbackSchema = read('billing-worker/src/feedback-schema.js');
const feedbackEntry = read('billing-worker/src/production-feedback-entry.js');
const feedbackUi = read('docs/scifi-ui/scripts/formatx-feedback.js');
const feedbackPublicStyle = read('docs/scifi-ui/styles/formatx-feedback-public.css');
const living = read('docs/scifi-ui/scripts/living-architecture.js');
const apex = read('docs/scifi-ui/scripts/formatx-apex.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const masterSync = read('docs/scifi-ui/scripts/organism-master-sync.js');
const mobileEntry = read('docs/scifi-ui/scripts/mobile-webgl-entry.js');
const morphEngine = read('docs/scifi-ui/scripts/mobile-core-engine-v3.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const deployWorkflow = read('.github/workflows/deploy-formatx-custom-domain.yml');

assert.ok(includesAll(loader, ['safe-ready-v28', 'safe-degraded-v28', 'load(index + 1)']), 'failure-tolerant loader missing');
assert.ok(loader.indexOf('organism-core-controller.js') < loader.indexOf('organism-voice.js'), 'core must load before voice');
assert.ok(loader.indexOf('organism-voice-stability.js') < loader.indexOf('organism-master-sync.js'), 'voice stability must load before master sync');
assert.ok(loader.indexOf('formatx-infinite-scroll.js') < loader.indexOf('formatx-apex-native.js'), 'seamless-v7 must initialise before native Apex');
assert.ok(loader.indexOf('formatx-apex-native.js') < loader.indexOf('formatx-three-host-safe.js'), 'native Apex must precede the safe Three fallback');
assert.ok(!loader.includes('organism-voice-foreground.js'), 'conflicting foreground module returned');

assert.ok(includesAll(menu, ['function setOpen(toggle, nav, open)', 'aria-expanded', 'fx-organism-menu-open']), 'menu state contract missing');
assert.ok(includesAll(consoleState, ['forceClosed', 'is-authorised-open', 'shell.hidden = true']), 'panel closed-state contract missing');
assert.ok(includesAll(language, ["toggle.className = 'fx-language-toggle'", 'localStorage.setItem', 'localStorage.getItem']), 'single language toggle contract missing');

assert.ok(includesAll(infinite, [
  "const VERSION = 'seamless-v7'",
  "root.dataset.fxInfiniteInput = 'native'",
  "root.dataset.fxInfiniteCloneMode = 'visual-bridge'",
  "root.dataset.fxAutomaticLoop = 'enabled'",
  "root.dataset.fxScrollJumpGuard = 'visual-match-v4'",
  "root.dataset.fxMobileScrollMode = 'native-momentum-loop'",
  'automaticLoop: true',
  'visualBridge: true',
  'clonedHeroOnly: true',
  'clonedContent: false',
  'mobileNativeMomentumPreserved: true',
  "mobileTransfer: 'scrollend-or-idle'",
  'jumpFree: true',
  "addEventListener('scroll', onScroll, { passive: true })",
  "addEventListener('scrollend', onScrollEnd, { passive: true })",
  "document.addEventListener('touchstart', onTouchStart, { passive: true })",
  'buildBridge',
  'performTransfer',
]), 'seamless continuous scroll controller contract missing');
assert.ok(infinite.includes('window.scrollTo(') && infinite.includes('cloneNode(true)'), 'visual bridge transfer implementation missing');
assert.ok(!/addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,180}preventDefault/.test(infinite), 'scroll runtime must not capture wheel or touchmove input');
assert.ok(!infinite.includes('document.body.cloneNode') && !infinite.includes('document.documentElement.cloneNode'), 'scroll runtime must clone only the inert Hero bridge, never the page');
assert.ok(includesAll(loopStyle, ["scroll-snap-type: none !important", "scroll-snap-align: none !important"]), 'seamless scroll must disable section snapping');
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
  "SCHEMA_VERSION = '6'",
  'export async function createFeedbackTableIfMissing',
  'database.prepare(createTableSql()).run()',
  'bootstrapPromise',
  'if (hasCanonicalColumns(columns)) return;',
  'ALTER TABLE user_feedback ADD COLUMN',
]), 'on-demand bootstrap or non-destructive feedback maintenance missing');
assert.ok(!feedbackSchema.includes('DROP TABLE user_feedback'), 'feedback recovery must never drop the live table');
assert.ok(!feedbackSchema.includes('RECOVERY_TABLE'), 'legacy destructive feedback recovery path returned');
assert.ok(!feedbackApi.includes('ensureFeedbackSchemaCompatibility') && !feedbackApi.includes('const SCHEMA_SQL'), 'normal feedback API path must not run blanket schema maintenance');
assert.ok(includesAll(feedbackApi, [
  "import { createFeedbackTableIfMissing } from './feedback-schema.js';",
  'runWithFeedbackTable',
  "classifyFeedbackError(error) !== 'feedback_table_missing'",
  'await createFeedbackTableIfMissing(database)',
  'database_binding_unavailable',
  'publish_permission = 1',
  'SELECT overall, comment, display_name, locale, approved_at',
  'reviews,',
]), 'targeted feedback bootstrap or consent-gated public review API missing');
assert.ok(includesAll(feedbackEntry, [
  "['/downloads/', '/scifi-ui/downloads/']",
  "['/support.html', '/scifi-ui/support.html']",
  'handleFeedbackRequest(request, env)',
]), 'feedback direct routing or public aliases missing');
assert.ok(!feedbackEntry.includes('ensureFeedbackSchemaCompatibility') && !feedbackEntry.includes('schemaFailure'), 'blocking feedback schema preflight returned');
assert.ok(includesAll(feedbackUi, [
  'function renderPublicReviews',
  "rootMargin: '800px 0px'",
  'paragraph.textContent',
  'formatx-feedback-public.css',
]), 'lazy approved public comment rendering missing');
assert.ok(includesAll(feedbackPublicStyle, ['.fx-feedback-public-card', 'content-visibility: auto', 'contain: layout paint style']), 'public comment rendering containment missing');

assert.ok(includesAll(living, [
  "ROOT.dataset.fxThreeLoader = 'deferred-user-activation'",
  "addEventListener('formatx:immersiveactivate', loadThreeExperience, { once: true })",
  "rootMargin: '700px 0px'",
  'qrDockActivated',
  "image.loading = 'lazy'",
]), 'heavy Organism or QR work is not deferred until needed');
assert.ok(!living.includes("document.addEventListener('formatx:introcomplete', loadThreeExperience"), 'heavy Organism renderer must not auto-load after intro');
assert.ok(includesAll(apex, [
  "const RELEASE_API = './data/current-release.json'",
  'requestAnimationFrame(progress)',
  'requestAnimationFrame(apply)',
  "ROOT.dataset.fxApex = 'controller-performance-v2'",
]), 'frame-throttled interaction or local release metadata contract missing');
assert.ok(!apex.includes('https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest'), 'homepage must not call GitHub release API directly');

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

require('./validate-igloo-floor.cjs');
console.log('PASS: FormatX seamless continuous scrolling preserves desktop wheel flow and mobile momentum before the visual loop handoff; native Apex, deferred rendering, feedback, downloads, responsive UI and deployment gates remain present.');
