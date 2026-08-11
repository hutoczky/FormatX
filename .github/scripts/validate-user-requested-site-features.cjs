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
const scrollBootstrap = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const desktopScroll = read('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');
const loopStyle = read('docs/scifi-ui/styles/formatx-seamless-loop.css');
const continuousStyle = read('docs/scifi-ui/styles/formatx-continuous-scroll.css');
const mobileStyle = read('docs/scifi-ui/styles/formatx-mobile-production-r5.css');
const downloads = read('docs/scifi-ui/downloads/index.html');
const downloadStyle = read('docs/scifi-ui/styles/downloads-page.css');
const feedbackApi = read('billing-worker/src/feedback-api.js');
const feedbackSchema = read('billing-worker/src/feedback-schema.js');
const feedbackEntry = read('billing-worker/src/production-feedback-entry.js');
const feedbackUi = read('docs/scifi-ui/scripts/formatx-feedback.js');
const living = read('docs/scifi-ui/scripts/living-architecture.js');
const apex = read('docs/scifi-ui/scripts/formatx-apex.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const masterSync = read('docs/scifi-ui/scripts/organism-master-sync.js');
const mobileEntry = read('docs/scifi-ui/scripts/mobile-webgl-entry.js');
const morphEngine = read('docs/scifi-ui/scripts/mobile-core-engine-v3.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const deployWorkflow = read('.github/workflows/deploy-formatx-custom-domain.yml');
const scrollPolicy = JSON.parse(read('docs/scifi-ui/data/scroll-policy.json'));

assert.ok(includesAll(loader, ['safe-ready-v28', 'safe-loading-v28', 'load(index + 1)']), 'failure-tolerant v28 loader missing');
assert.ok(loader.indexOf('organism-core-controller.js') < loader.indexOf('organism-voice.js'), 'core must load before voice');
assert.ok(loader.indexOf('organism-voice-stability.js') < loader.indexOf('organism-master-sync.js'), 'voice stability must load before master sync');
assert.ok(!loader.includes('organism-voice-foreground.js'), 'conflicting foreground module returned');

assert.ok(includesAll(menu, ['function setOpen(toggle, nav, open)', 'aria-expanded', 'fx-organism-menu-open']), 'menu state contract missing');
assert.ok(includesAll(consoleState, ['forceClosed', 'is-authorised-open', 'shell.hidden = true']), 'panel closed-state contract missing');
assert.ok(includesAll(language, ["toggle.className = 'fx-language-toggle'", 'localStorage.setItem', 'localStorage.getItem']), 'single language toggle contract missing');

assert.equal(scrollPolicy.mobile.controller, 'mobile-native-document-v1', 'mobile native-document policy missing');
assert.equal(scrollPolicy.mobile.automatic_loop, false, 'mobile automatic loop must stay disabled');
assert.equal(scrollPolicy.mobile.visual_bridge, false, 'mobile visual bridge must stay disabled');
assert.equal(scrollPolicy.mobile.automatic_page_position_changes, false, 'mobile automatic page positioning must stay disabled');
assert.equal(scrollPolicy.desktop.controller, 'seamless-v7', 'desktop seamless-v7 policy missing');
assert.equal(scrollPolicy.desktop.automatic_loop, true, 'desktop seamless loop must stay enabled');
assert.equal(scrollPolicy.policy.input_capture, false, 'wheel/touch capture must stay disabled');

assert.ok(includesAll(scrollBootstrap, [
  'platform-scroll-v2',
  'mobile-native-document-v1',
  "fxAutomaticLoop = 'disabled-mobile'",
  "fxLoopBridge = 'disabled-mobile'",
  'automaticPagePositionChanges: false',
  'formatx-infinite-scroll-desktop-v7.js'
]), 'platform scroll bootstrap contract missing');
assert.ok(!scrollBootstrap.includes('scrollTo(') && !scrollBootstrap.includes('scrollIntoView(') && !scrollBootstrap.includes('cloneNode('), 'mobile-capable bootstrap must not move/clone the page');
assert.ok(!scrollBootstrap.includes('preventDefault'), 'scroll bootstrap must not capture input');
assert.ok(includesAll(desktopScroll, [
  "const VERSION = 'seamless-v7'",
  "root.dataset.fxInfiniteInput = 'native'",
  "root.dataset.fxInfiniteCloneMode = 'visual-bridge'",
  "root.dataset.fxAutomaticLoop = 'enabled'",
  'automaticLoop: true',
  'visualBridge: true',
  'clonedHeroOnly: true',
  'clonedContent: false',
  'sourceHero.cloneNode(true)',
  'window.scrollTo('
]), 'desktop seamless-v7 implementation missing');
assert.ok(!/addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,180}preventDefault/.test(desktopScroll), 'desktop runtime must not capture wheel/touchmove');
assert.ok(includesAll(loopStyle, ['scroll-snap-type: none !important', 'scroll-snap-align: none !important']), 'desktop loop snap suppression missing');
assert.ok(includesAll(continuousStyle, ['scroll-snap-type: none !important', 'scroll-snap-align: none !important']), 'global snap suppression missing');
assert.ok(includesAll(mobileStyle, ['.fx-award-proof__grid', '.fx-plan-qr-card:not(.is-qr-ready)', '.site-footer nav']), 'mobile production stability layer incomplete');

assert.ok(includesAll(downloads, [
  'https://github.com/hutoczky/FormatX-Updates/releases/latest',
  'data-release-download="multiplatform"',
  '../verification.html', '../test-matrix.html', '../known-issues.html', '../security.html', '../support.html',
  'Teljes multiplatform verzió letöltése', '5 napos próbalicenc'
]), 'downloads fallback/evidence/trial links missing');
assert.ok(!/\b(?:nyilvános béta|public beta)\b/i.test(downloads), 'retired beta wording remains on downloads page');
assert.ok(includesAll(downloadStyle, ['grid-template-columns: repeat(3', '@media (max-width: 800px)']), 'downloads responsive layout missing');

assert.ok(includesAll(feedbackSchema, ["SCHEMA_VERSION = '6'", 'createFeedbackTableIfMissing', 'ALTER TABLE user_feedback ADD COLUMN']), 'non-destructive feedback schema maintenance missing');
assert.ok(!feedbackSchema.includes('DROP TABLE user_feedback'), 'feedback recovery must never drop the live table');
assert.ok(includesAll(feedbackApi, ['runWithFeedbackTable', 'publish_permission = 1', 'SELECT overall, comment, display_name, locale, approved_at']), 'feedback consent/public review contract missing');
assert.ok(includesAll(feedbackEntry, ["['/downloads/', '/scifi-ui/downloads/']", 'handleFeedbackRequest(request, env)']), 'public alias/feedback routing missing');
assert.ok(includesAll(feedbackUi, ['function renderPublicReviews', "rootMargin: '800px 0px'", 'paragraph.textContent']), 'lazy public comment rendering missing');

assert.ok(includesAll(living, ["ROOT.dataset.fxThreeLoader = 'deferred-user-activation'", "addEventListener('formatx:immersiveactivate', loadThreeExperience, { once: true })", "image.loading = 'lazy'"]), 'heavy renderer/QR work is not deferred');
assert.ok(!living.includes("document.addEventListener('formatx:introcomplete', loadThreeExperience"), 'heavy renderer must not auto-load after intro');
assert.ok(includesAll(apex, ["const RELEASE_API = './data/current-release.json'", 'requestAnimationFrame(progress)', 'requestAnimationFrame(apply)']), 'frame-throttled local release metadata contract missing');
assert.ok(!apex.includes('https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest'), 'homepage must not call GitHub release API directly');

const qrFiles = [
  'docs/scifi-ui/assets/qr/business_lite-huf.svg', 'docs/scifi-ui/assets/qr/business_lite-eur.svg',
  'docs/scifi-ui/assets/qr/business_pro-huf.svg', 'docs/scifi-ui/assets/qr/business_pro-eur.svg',
  'docs/scifi-ui/assets/qr/technician_team-huf.svg', 'docs/scifi-ui/assets/qr/technician_team-eur.svg'
];
assert.ok(qrFiles.every(exists), 'local QR fallback set incomplete');
assert.ok(includesAll(pricingApi, ["url.pathname === '/api/checkout-qr'", "Content-Type', 'image/png"]), 'QR endpoint missing');

assert.ok(includesAll(voice, ['SpeechSynthesisUtterance', 'A FormatX Organizmus válaszai']) && !voice.includes('XMLHttpRequest'), 'local voice contract missing');
assert.ok(includesAll(masterSync, ['formatx:organismmastersync', 'speechSynthesis.cancel()']), 'master switch synchronization missing');
assert.ok(mobileEntry.includes('mobile-core-engine-v3.js') && includesAll(morphEngine, ['coreForm', 'neuralForm', 'organForm', 'heartForm', 'skeletonForm', 'beaconForm']), 'morphing organism renderer missing');

assert.ok(includesAll(productionEntry, ['formatx-infinite-scroll.js', 'organism-interface.js', 'formatx-premium-finish.js']), 'critical production assets missing');
assert.ok(deployWorkflow.includes('needs: validate') && deployWorkflow.includes('npx wrangler deploy'), 'production deploy must depend on validation');

require('./validate-igloo-floor.cjs');
console.log('PASS: requested site features validated with mobile native-document scrolling, desktop seamless-v7, responsive UI, feedback, downloads, deferred rendering and production gates.');
