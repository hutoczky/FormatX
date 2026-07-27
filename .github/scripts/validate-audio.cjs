'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function waitIntro(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout: 20000 });
}

async function runCase(browser, name, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const diagnostics = [];

  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });
  page.on('requestfailed', request => {
    diagnostics.push('requestfailed: ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown'));
  });

  await page.goto(TEST_URL + '?lang=hu&audio-test=1', { waitUntil: 'domcontentloaded' });
  await waitIntro(page);
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioOwner === 'verified-v3', null, { timeout: 15000 });
  await page.waitForFunction(() => ['passed', 'unsupported'].includes(document.documentElement.dataset.fxAudioSelfTest || ''), null, { timeout: 10000 });

  const button = page.locator('.fx-three-sound');
  await button.waitFor({ state: 'visible', timeout: 10000 });
  assert(await button.count() === 1, name + ': exactly one audio button is required');

  await button.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'on', null, { timeout: 10000 });
  await page.waitForFunction(() => ['signal-verified', 'wav-fallback'].includes(document.documentElement.dataset.fxAudioOutput || ''), null, { timeout: 10000 });

  const state = await page.evaluate(() => ({
    owner: document.documentElement.dataset.fxAudioOwner || '',
    engine: document.documentElement.dataset.fxAudioEngine || '',
    context: document.documentElement.dataset.fxAudioContext || '',
    state: document.documentElement.dataset.fxAudioState || '',
    level: document.documentElement.dataset.fxAudioLevel || '',
    selfTest: document.documentElement.dataset.fxAudioSelfTest || '',
    output: document.documentElement.dataset.fxAudioOutput || '',
    fallback: document.documentElement.dataset.fxAudioFallback || '',
    error: document.documentElement.dataset.fxAudioError || '',
    signal: getComputedStyle(document.documentElement).getPropertyValue('--fx-audio-signal').trim(),
    peak: getComputedStyle(document.documentElement).getPropertyValue('--fx-audio-self-test-peak').trim(),
    pressed: document.querySelector('.fx-three-sound')?.getAttribute('aria-pressed') || '',
    buttonOwner: document.querySelector('.fx-three-sound')?.dataset.fxAudioOwner || '',
    label: document.querySelector('.fx-three-sound span')?.textContent || ''
  }));

  assert(state.owner === 'verified-v3', name + ': wrong audio owner: ' + JSON.stringify(state));
  assert(state.buttonOwner === 'verified-v3', name + ': button owner was replaced: ' + JSON.stringify(state));
  assert(state.engine === 'web-audio-with-wav-fallback', name + ': wrong engine: ' + JSON.stringify(state));
  assert(state.state === 'on' && state.level === 'audible', name + ': audio did not turn on: ' + JSON.stringify(state));
  assert(state.pressed === 'true', name + ': button state is not active: ' + JSON.stringify(state));
  assert(state.context === 'running' || state.output === 'wav-fallback', name + ': audio context is not running: ' + JSON.stringify(state));
  assert(['signal-verified', 'wav-fallback'].includes(state.output), name + ': no verified audio signal: ' + JSON.stringify(state));
  assert(state.selfTest === 'passed' || state.selfTest === 'unsupported', name + ': offline audio graph failed: ' + JSON.stringify(state));

  await button.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'off');

  const meaningfulDiagnostics = diagnostics.filter(item => !/favicon|WebGL stall|GPU stall|net::ERR_ABORTED/i.test(item));
  assert(!meaningfulDiagnostics.length, name + ': browser diagnostics: ' + meaningfulDiagnostics.join(' | '));
  console.log(JSON.stringify({ case: name, state }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--autoplay-policy=user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--mute-audio=false'
    ]
  });

  try {
    await runCase(browser, 'desktop-audio', {
      viewport: { width: 1280, height: 840 },
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    await runCase(browser, 'mobile-audio', {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
