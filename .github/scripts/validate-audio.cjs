'use strict';

const { chromium } = require('playwright');
const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
  const done = await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout: 5000 }).then(() => true).catch(() => false);
  if (done) return;
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

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const button = document.querySelector('.fx-three-sound');
    const rect = button?.getBoundingClientRect();
    const hit = rect ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
    return {
      startup: root.dataset.fxStartupOwnerR461 || '',
      owner: root.dataset.fxAudioOwner || '',
      state: root.dataset.fxAudioState || '',
      level: root.dataset.fxAudioLevel || '',
      context: root.dataset.fxAudioContext || '',
      contextHandoff: root.dataset.fxAudioContextHandoff || '',
      handoff: root.dataset.fxAudioHandoffR508 || '',
      output: root.dataset.fxAudioOutput || '',
      music: root.dataset.fxAudioMusic || '',
      chord: root.dataset.fxAudioChord || '',
      section: root.dataset.fxAudioSection || '',
      engine: root.dataset.fxAudioEngine || '',
      character: root.dataset.fxAudioCharacter || '',
      arrangement: root.dataset.fxAudioArrangement || '',
      tempo: root.dataset.fxAudioTempo || '',
      selfTest: root.dataset.fxAudioSelfTest || '',
      error: root.dataset.fxAudioError || '',
      buttonOwner: button?.dataset.fxAudioOwner || '',
      pressed: button?.getAttribute('aria-pressed') || '',
      count: document.querySelectorAll('.fx-three-sound').length,
      scriptLoaded: Boolean(document.querySelector('script[src*="formatx-audio-repair.js"]')),
      hitSound: Boolean(button && hit instanceof Node && (hit === button || button.contains(hit))),
      rect: rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null
    };
  });
}

async function runCase(browser, name, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') diagnostics.push('console-error: ' + message.text()); });
  page.on('requestfailed', request => diagnostics.push('requestfailed: ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown')));

  await page.goto(TEST_URL + '?lang=hu&audio-test=1&score=v6', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => document.documentElement.dataset.fxStartupOwnerR461 === 'single-current-runtime-no-postdom-repair-stack', null, { timeout: 10000 });

  const button = page.locator('.fx-three-sound');
  await button.waitFor({ state: 'visible', timeout: 15000 });
  assert(await button.count() === 1, name + ': exactly one music button is required');

  const before = await snapshot(page);
  assert(before.owner === 'r461-lightweight-first-party', name + ': first-paint audio owner changed: ' + JSON.stringify(before));
  assert(before.handoff === 'idle-lazy-professional', name + ': professional handoff was not idle before intent: ' + JSON.stringify(before));
  assert(!before.scriptLoaded, name + ': professional engine loaded before user intent: ' + JSON.stringify(before));
  assert(before.state === 'off' && before.pressed === 'false', name + ': audio was not muted by default: ' + JSON.stringify(before));
  assert(before.hitSound, name + ': SOUND control is covered: ' + JSON.stringify(before));

  if (contextOptions.isMobile) await button.tap();
  else await button.click();

  await page.waitForFunction(() => document.documentElement.dataset.fxAudioOwner === 'professional-v6', null, { timeout: 15000 });
  await page.waitForFunction(() => ['passed', 'unsupported'].includes(document.documentElement.dataset.fxAudioSelfTest || ''), null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'on', null, { timeout: 15000 });
  await page.waitForFunction(() => ['signal-verified', 'wav-fallback'].includes(document.documentElement.dataset.fxAudioOutput || ''), null, { timeout: 15000 });
  await page.waitForFunction(() => ['playing', 'fallback-playing'].includes(document.documentElement.dataset.fxAudioMusic || ''), null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioMusic === 'fallback-playing' || Boolean(document.documentElement.dataset.fxAudioChord), null, { timeout: 15000 });

  const on = await snapshot(page);
  assert(on.owner === 'professional-v6' && on.buttonOwner === 'professional-v6', name + ': professional owner handoff failed: ' + JSON.stringify(on));
  assert(on.scriptLoaded, name + ': professional engine script missing after intent: ' + JSON.stringify(on));
  assert(on.contextHandoff === 'reused-r508-first-gesture' || on.output === 'wav-fallback', name + ': trusted AudioContext was not reused: ' + JSON.stringify(on));
  assert(on.engine === 'professional-cinematic-score-v6', name + ': wrong engine: ' + JSON.stringify(on));
  assert(on.character === 'premium-cinematic-music', name + ': wrong score character: ' + JSON.stringify(on));
  assert(on.arrangement === 'sixteen-bar-evolving-score', name + ': wrong arrangement: ' + JSON.stringify(on));
  assert(on.tempo === '72', name + ': wrong tempo: ' + JSON.stringify(on));
  assert(on.state === 'on' && on.level === 'audible' && on.pressed === 'true', name + ': score is not active: ' + JSON.stringify(on));
  assert(on.context === 'running' || on.output === 'wav-fallback', name + ': audio context is not running: ' + JSON.stringify(on));
  assert(['signal-verified', 'wav-fallback'].includes(on.output), name + ': no verified audio signal: ' + JSON.stringify(on));
  assert(['playing', 'fallback-playing'].includes(on.music), name + ': score is not playing: ' + JSON.stringify(on));
  assert(on.music === 'fallback-playing' || on.chord.length > 0, name + ': harmonic scheduler did not start: ' + JSON.stringify(on));
  assert(on.selfTest === 'passed' || on.selfTest === 'unsupported', name + ': offline graph self-test failed: ' + JSON.stringify(on));
  assert(!on.error, name + ': professional score reported an error: ' + JSON.stringify(on));

  await page.waitForTimeout(1200);
  const sustained = await snapshot(page);
  assert(['signal-verified', 'wav-fallback'].includes(sustained.output), name + ': audio signal was not sustained: ' + JSON.stringify(sustained));
  assert(sustained.music === 'fallback-playing' || sustained.chord.length > 0, name + ': scheduler stopped: ' + JSON.stringify(sustained));

  if (contextOptions.isMobile) await button.tap();
  else await button.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'off', null, { timeout: 5000 });

  const meaningful = diagnostics.filter(item => !/favicon|WebGL stall|GPU stall|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));
  console.log(JSON.stringify({ case: name, before, on, sustained }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=user-gesture-required', '--use-fake-ui-for-media-stream', '--mute-audio=false']
  });
  try {
    await runCase(browser, 'desktop-professional-score', {
      viewport: { width: 1280, height: 840 }, locale: 'hu-HU', colorScheme: 'dark'
    });
    await runCase(browser, 'mobile-professional-score', {
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU', colorScheme: 'dark'
    });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
