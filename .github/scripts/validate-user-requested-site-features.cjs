'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

const failures = [];
function requireFeature(label, condition) {
  if (!condition) failures.push(label);
}
function includesAll(source, tokens) {
  return tokens.every(token => source.includes(token));
}

const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const menu = read('docs/scifi-ui/scripts/organism-menu-controller.js');
const consoleState = read('docs/scifi-ui/scripts/organism-console-state.js');
const core = read('docs/scifi-ui/scripts/organism-core-controller.js');
const language = read('docs/scifi-ui/scripts/single-language-toggle.js');
const licenceLinks = read('docs/scifi-ui/scripts/formatx-license-links.js');
const licencePage = read('docs/scifi-ui/license.html');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const voice = read('docs/scifi-ui/scripts/organism-voice.js');
const voiceCss = read('docs/scifi-ui/styles/organism-voice.css');
const voiceDock = read('docs/scifi-ui/styles/organism-voice-dock.css');
const voiceForeground = read('docs/scifi-ui/scripts/organism-voice-foreground.js');
const thoughtGenome = read('docs/scifi-ui/scripts/synaptic-thought-genome.js');
const thoughtDisclosure = read('docs/scifi-ui/scripts/synaptic-thought-disclosure.js');
const mobileUnified = read('docs/scifi-ui/styles/formatx-mobile-unified.css');
const mobileEntry = read('docs/scifi-ui/scripts/mobile-webgl-entry.js');
const morphEngine = read('docs/scifi-ui/scripts/mobile-core-engine-v3.js');
const living = read('docs/scifi-ui/scripts/living-architecture.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const previewWorker = read('worker.js');
const deployWorkflow = read('.github/workflows/deploy-formatx-custom-domain.yml');

requireFeature('Loader is the current failure-tolerant v25 chain',
  includesAll(loader, ['safe-ready-v25', 'safe-degraded-v25', 'load(index + 1)']));
requireFeature('Loader orders core, voice, thought and renderer safely',
  loader.indexOf('organism-core-controller.js') < loader.indexOf('organism-voice.js')
  && loader.indexOf('organism-voice.js') < loader.indexOf('synaptic-thought-genome.js')
  && loader.indexOf('synaptic-thought-disclosure.js') < loader.indexOf('formatx-three-host-safe.js'));

requireFeature('Menu has explicit open/close state and accessibility state',
  includesAll(menu, ['function setOpen(toggle, nav, open)', "aria-expanded", 'fx-organism-menu-open']));
requireFeature('Menu starts and restores closed',
  menu.includes('setOpen(toggle, nav, false)') && menu.includes("event.key === 'Escape'"));
requireFeature('Organism console is physically closed unless authorised',
  includesAll(consoleState, ['forceClosed', 'is-authorised-open', "shell.hidden = true", "root.dataset.fxOrganismConsole = 'closed'"]));
requireFeature('01 MAG is the central Organism state',
  includesAll(core, ["bounded === 0 ? 'core'", "replaceHash('#hero')", "formatx:organismstatechange"]));

requireFeature('Exactly one visible language toggle is generated',
  includesAll(language, ["toggle.className = 'fx-language-toggle'", 'hideLegacyControls', 'current === \'hu\' ? \'en\' : \'hu\'']));
requireFeature('Language selection is persisted locally',
  includesAll(language, ['formatx-language', 'localStorage.setItem', 'localStorage.getItem']));

requireFeature('Detailed licence links remain inside the FormatX site',
  includesAll(licenceLinks, ["'/scifi-ui/license.html'", 'link.removeAttribute(\'target\')', 'data-fx-local-licence']));
requireFeature('Detailed licence page is bilingual and complete',
  includesAll(licencePage, ['Részletes licencfeltételek', 'Detailed licence terms', '5 napos próbalicenc', '5-day trial licence', 'Tiltott felhasználás', 'Prohibited use']));
requireFeature('Detailed licence page does not redirect to GitHub LICENSE',
  !licencePage.includes('github.com/hutoczky/FormatX/blob') && !licencePage.includes('github.com/hutoczky/FormatX/raw'));

requireFeature('Infinite scroll uses current boundary-v4 controller',
  includesAll(infinite, ['ready-v4', 'boundary-v4', 'clonedContent: false', 'reinitialisedRenderer: false']));
requireFeature('Infinite scroll preserves native mobile scrolling and nested panels',
  includesAll(infinite, ["addEventListener('scroll', onScroll, { passive: true })", 'nestedScrollerCanConsume', 'dialogueOpen']));
requireFeature('Infinite scroll never clones the page', !infinite.includes('cloneNode'));
requireFeature('Loader uses boundary-v4 cache version', loader.includes('formatx-infinite-scroll.js?v=20260730-infinite-boundary-v4'));

const qrFiles = [
  'docs/scifi-ui/assets/qr/business_lite-huf.svg',
  'docs/scifi-ui/assets/qr/business_lite-eur.svg',
  'docs/scifi-ui/assets/qr/business_pro-huf.svg',
  'docs/scifi-ui/assets/qr/business_pro-eur.svg',
  'docs/scifi-ui/assets/qr/technician_team-huf.svg',
  'docs/scifi-ui/assets/qr/technician_team-eur.svg',
];
requireFeature('All six local HUF/EUR QR fallbacks exist', qrFiles.every(exists));
requireFeature('QR delivery uses own API and local fallback',
  includesAll(loader, ['/api/checkout-qr?', './assets/qr/', 'fxQrFallback'])
  && includesAll(living, ['/api/checkout-qr?', './assets/qr/', 'fxQrFallback']));
requireFeature('Pricing Worker returns QR images',
  includesAll(pricingApi, ["url.pathname === '/api/checkout-qr'", "Content-Type', 'image/png"]));

requireFeature('Organism voice is local and bilingual',
  includesAll(voice, ['SpeechSynthesisUtterance', 'A FormatX Organizmus válaszai', 'FormatX Organism responses'])
  && !voice.includes('fetch(') && !voice.includes('XMLHttpRequest') && !voice.includes('WebSocket'));
requireFeature('Organism has independent master and speech switches',
  includesAll(voice, ['fx-organism-master-toggle', 'fx-organism-voice-toggle', 'formatx-organism-dialogue-enabled', 'let speechEnabled = false']));
requireFeature('Thought bubble starts closed and can be reopened',
  includesAll(voice, ['setOpen(false, false)', "hidden: ''", 'function setOpen(next']));
requireFeature('Voice state is visible and resilient on Android/browser speech services',
  includesAll(voice, ['voiceStarting', 'voiceWorking', 'voiceError', 'synth.resume()', 'speechWatchdog']));
requireFeature('Thought system remains local and starts collapsed',
  !thoughtGenome.includes('fetch(') && !thoughtDisclosure.includes('fetch(')
  && includesAll(thoughtDisclosure, ['details.open = false', 'defaultOpen: false']));
requireFeature('Voice foreground and dock layers are installed',
  voiceForeground.includes('fx-organism-dialogue')
  && voiceDock.includes('fx-organism-dialogue')
  && loader.includes('organism-voice-foreground.js'));

requireFeature('Voice UI is readable, compact and hidden under menus/panels',
  includesAll(voiceCss, ['font-size: 14.5px', 'line-height: 1.68', '.fx-organism-dialogue.is-disabled', 'body.fx-organism-panel-open .fx-organism-dialogue', 'html.fx-organism-menu-open .fx-organism-dialogue']));
requireFeature('Mobile layout prevents text and floating-control overlap',
  includesAll(mobileUnified, ['no text overlap', '#hero .hero-copy', '#hero .hero-space', '.fx-organism-dialogue:not(.is-open)', 'html.fx-page-scrolling .fx-organism-dialogue']));
requireFeature('Mobile thought button stays compact and the open bubble fits the viewport',
  includesAll(mobileUnified, ['width: 52px !important', 'max-height: min(58svh, 520px)', 'max-width: calc(100vw - 24px)']));

requireFeature('Visible morphing 3D Organism V3 is the active mobile/desktop stage',
  mobileEntry.includes('mobile-core-engine-v3.js?v=20260731-morphing-organism-v3')
  && includesAll(morphEngine, ['coreForm', 'neuralForm', 'organForm', 'heartForm', 'skeletonForm', 'beaconForm']));

for (const [name, worker] of [['production Worker', productionEntry], ['preview Worker', previewWorker]]) {
  requireFeature(`${name} serves all critical requested modules without stale cache`,
    includesAll(worker, [
      'single-language-toggle.js',
      'formatx-license-links.js',
      'formatx-infinite-scroll.js',
      'organism-menu-controller.js',
      'organism-console-state.js',
      'organism-voice.js',
      'organism-voice-foreground.js',
      'synaptic-thought-genome.js',
      'synaptic-thought-disclosure.js',
      'formatx-mobile-unified.css',
      'mobile-core-engine-v3.js',
    ]));
}

requireFeature('Production deployment validates before deploy',
  deployWorkflow.includes('needs: validate') && deployWorkflow.includes('npx wrangler deploy'));
requireFeature('Production deployment smoke-tests both custom domains',
  deployWorkflow.includes('https://formatxsuite.com') && deployWorkflow.includes('https://www.formatxsuite.com'));
requireFeature('Explicit production deploy marker remains supported',
  deployWorkflow.includes('[deploy-production]'));

if (failures.length) {
  console.error('FAILED requested-site feature audit:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('PASS: every requested FormatX website feature is present and production-gated.');
