'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});

  const completed = await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout: 5000 }).then(() => true).catch(() => false);

  if (completed) return;
  await page.evaluate(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
  });
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

  await page.goto(TEST_URL + '?lang=hu&audio-test=1&score=v6', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioOwner === 'professional-v6', null, { timeout: 45000 });
  await page.waitForFunction(() => ['passed', 'unsupported'].includes(document.documentElement.dataset.fxAudioSelfTest || ''), null, { timeout: 20000 });

  const button = page.locator('.fx-three-sound');
  await button.waitFor({ state: contextOptions.isMobile ? 'attached' : 'visible', timeout: 15000 });
  assert(await button.count() === 1, name + ': exactly one music button is required');

  if (contextOptions.isMobile) await button.evaluate(node => node.click());
  else await button.click({ force: true });
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'on', null, { timeout: 15000 });
  await page.waitForFunction(() => ['signal-verified', 'wav-fallback'].includes(document.documentElement.dataset.fxAudioOutput || ''), null, { timeout: 15000 });
  await page.waitForFunction(() => ['playing', 'fallback-playing'].includes(document.documentElement.dataset.fxAudioMusic || ''), null, { timeout: 15000 });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxAudioMusic === 'fallback-playing' || Boolean(root.dataset.fxAudioChord);
  }, null, { timeout: 15000 });

  const state = await page.evaluate(() => ({
    owner: document.documentElement.dataset.fxAudioOwner || '',
    engine: document.documentElement.dataset.fxAudioEngine || '',
    character: document.documentElement.dataset.fxAudioCharacter || '',
    arrangement: document.documentElement.dataset.fxAudioArrangement || '',
    tempo: document.documentElement.dataset.fxAudioTempo || '',
    music: document.documentElement.dataset.fxAudioMusic || '',
    chord: document.documentElement.dataset.fxAudioChord || '',
    section: document.documentElement.dataset.fxAudioSection || '',
    context: document.documentElement.dataset.fxAudioContext || '',
    state: document.documentElement.dataset.fxAudioState || '',
    level: document.documentElement.dataset.fxAudioLevel || '',
    selfTest: document.documentElement.dataset.fxAudioSelfTest || '',
    output: document.documentElement.dataset.fxAudioOutput || '',
    error: document.documentElement.dataset.fxAudioError || '',
    signal: getComputedStyle(document.documentElement).getPropertyValue('--fx-audio-signal').trim(),
    peak: getComputedStyle(document.documentElement).getPropertyValue('--fx-audio-self-test-peak').trim(),
    pressed: document.querySelector('.fx-three-sound')?.getAttribute('aria-pressed') || '',
    buttonOwner: document.querySelector('.fx-three-sound')?.dataset.fxAudioOwner || '',
    label: document.querySelector('.fx-three-sound span')?.textContent || ''
  }));

  assert(state.owner === 'professional-v6', name + ': wrong score owner: ' + JSON.stringify(state));
  assert(state.buttonOwner === 'professional-v6', name + ': button owner was replaced: ' + JSON.stringify(state));
  assert(state.engine === 'professional-cinematic-score-v6', name + ': wrong score engine: ' + JSON.stringify(state));
  assert(state.character === 'premium-cinematic-music', name + ': wrong score character: ' + JSON.stringify(state));
  assert(state.arrangement === 'sixteen-bar-evolving-score', name + ': wrong arrangement: ' + JSON.stringify(state));
  assert(state.tempo === '72', name + ': wrong tempo: ' + JSON.stringify(state));
  assert(state.state === 'on' && state.level === 'audible', name + ': score did not turn on: ' + JSON.stringify(state));
  assert(state.pressed === 'true', name + ': music button is not active: ' + JSON.stringify(state));
  assert(state.context === 'running' || state.output === 'wav-fallback', name + ': audio context is not running: ' + JSON.stringify(state));
  assert(['signal-verified', 'wav-fallback'].includes(state.output), name + ': no verified music signal: ' + JSON.stringify(state));
  assert(['playing', 'fallback-playing'].includes(state.music), name + ': score is not playing: ' + JSON.stringify(state));
  assert(state.music === 'fallback-playing' || state.chord.length > 0, name + ': harmonic scheduler did not start: ' + JSON.stringify(state));
  assert(state.selfTest === 'passed' || state.selfTest === 'unsupported', name + ': offline score graph failed: ' + JSON.stringify(state));
  assert(!state.error, name + ': score reported an error: ' + JSON.stringify(state));

  await page.waitForTimeout(1400);
  const sustained = await page.evaluate(() => ({
    output: document.documentElement.dataset.fxAudioOutput || '',
    chord: document.documentElement.dataset.fxAudioChord || '',
    music: document.documentElement.dataset.fxAudioMusic || ''
  }));
  assert(['signal-verified', 'wav-fallback'].includes(sustained.output), name + ': music signal was not sustained: ' + JSON.stringify(sustained));
  assert(sustained.music === 'fallback-playing' || sustained.chord.length > 0, name + ': score scheduler stopped: ' + JSON.stringify(sustained));

  if (contextOptions.isMobile) await button.evaluate(node => node.click());
  else await button.click({ force: true });
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'off');

  const meaningfulDiagnostics = diagnostics.filter(item => !/favicon|WebGL stall|GPU stall|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item));
  assert(!meaningfulDiagnostics.length, name + ': browser diagnostics: ' + meaningfulDiagnostics.join(' | '));
  console.log(JSON.stringify({ case: name, state, sustained }));
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
    await runCase(browser, 'desktop-professional-score', {
      viewport: { width: 1280, height: 840 },
      locale: 'hu-HU',
      colorScheme: 'dark'
    });
    await runCase(browser, 'mobile-professional-score', {
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
