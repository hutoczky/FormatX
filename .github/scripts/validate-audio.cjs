'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  await page.evaluate(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const button = document.querySelector('.fx-audio-toggle-r191');
    const legacy = document.querySelector('.fx-three-sound');
    const rect = button?.getBoundingClientRect();
    const hit = rect ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null;
    const style = button ? getComputedStyle(button) : null;
    const legacyStyle = legacy ? getComputedStyle(legacy) : null;
    return {
      owner: root.dataset.fxAudioOwner || '',
      audioState: root.dataset.fxAudioState || '',
      audioLevel: root.dataset.fxAudioLevel || '',
      output: root.dataset.fxAudioOutput || '',
      music: root.dataset.fxAudioMusic || '',
      publicControl: root.dataset.fxAudioPublicControl || '',
      publicState: root.dataset.fxAudioPublicControlState || '',
      publicAvailable: root.dataset.fxAudioPublicControlAvailable || '',
      toggleRuntime: root.dataset.fxAudioToggleR191 || '',
      count: document.querySelectorAll('.fx-audio-toggle-r191').length,
      legacyCount: document.querySelectorAll('.fx-three-sound').length,
      label: button?.querySelector('[data-fx-audio-toggle-label]')?.textContent?.trim() || '',
      pressed: button?.getAttribute('aria-pressed') || '',
      ariaLabel: button?.getAttribute('aria-label') || '',
      disabled: Boolean(button?.disabled),
      inlineStyle: button?.getAttribute('style') || '',
      display: style?.display || '',
      visibility: style?.visibility || '',
      pointerEvents: style?.pointerEvents || '',
      zIndex: Number.parseInt(style?.zIndex || '0', 10) || 0,
      rect: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
      viewport: { width: innerWidth, height: innerHeight },
      hitPublic: Boolean(button && hit instanceof Node && (hit === button || button.contains(hit))),
      legacyDisplay: legacyStyle?.display || '',
      legacyVisibility: legacyStyle?.visibility || ''
    };
  });
}

async function waitReady(page, name) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxAudioToggleR191 === 'ready'
      && root.dataset.fxAudioOwner === 'professional-v6'
      && root.dataset.fxAudioPublicControlAvailable === 'true';
  }, null, { timeout: 45000 });

  const state = await snapshot(page);
  assert(state.count === 1, name + ': exactly one public MUTE/UNMUTE control is required: ' + JSON.stringify(state));
  assert(state.legacyCount === 1, name + ': professional audio actuator missing: ' + JSON.stringify(state));
  assert(state.publicControl === 'mute-unmute-r191', name + ': wrong public audio contract: ' + JSON.stringify(state));
  assert(state.display !== 'none' && state.visibility !== 'hidden', name + ': public audio control is hidden: ' + JSON.stringify(state));
  assert(state.pointerEvents !== 'none' && !state.disabled, name + ': public audio control is not interactive: ' + JSON.stringify(state));
  assert(state.hitPublic, name + ': public audio control is covered by another layer: ' + JSON.stringify(state));
  assert(!state.inlineStyle, name + ': public audio control must remain CSP-safe without inline style: ' + JSON.stringify(state));
  assert(state.rect && state.rect.height >= 44 && state.rect.width >= 92, name + ': touch target is too small: ' + JSON.stringify(state));
  assert(state.rect.left >= 0 && state.rect.right <= state.viewport.width + 1, name + ': audio control escapes viewport: ' + JSON.stringify(state));
  assert(state.rect.top >= 0 && state.rect.top < 190, name + ': audio control is not in the upper-right control zone: ' + JSON.stringify(state));
  assert(state.label === 'UNMUTE' && state.pressed === 'false', name + ': initial state must be visibly muted: ' + JSON.stringify(state));
  assert(state.audioState === 'off' || state.audioState === '', name + ': audio must not autoplay: ' + JSON.stringify(state));
  assert(state.legacyDisplay === 'none' || state.legacyVisibility === 'hidden', name + ': legacy audio control must not duplicate the public control: ' + JSON.stringify(state));
}

async function runCase(browser, name, options) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') diagnostics.push('console-error: ' + message.text()); });
  page.on('requestfailed', request => diagnostics.push('requestfailed: ' + request.url() + ' — ' + (request.failure()?.errorText || 'unknown')));

  await page.goto(TEST_URL + '?lang=en&audio-r191=1', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await clearIntro(page);
  await waitReady(page, name);

  const button = page.locator('.fx-audio-toggle-r191');
  await button.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'on', null, { timeout: 15000 });
  await page.waitForFunction(() => ['signal-verified', 'wav-fallback'].includes(document.documentElement.dataset.fxAudioOutput || ''), null, { timeout: 15000 });
  const on = await snapshot(page);
  assert(on.label === 'MUTE' && on.pressed === 'true' && on.publicState === 'on', name + ': UNMUTE did not enter audible state: ' + JSON.stringify(on));
  assert(['signal-verified', 'wav-fallback'].includes(on.output), name + ': no verified audio signal: ' + JSON.stringify(on));
  assert(['playing', 'fallback-playing'].includes(on.music), name + ': audio score is not running: ' + JSON.stringify(on));

  await button.click();
  await page.waitForFunction(() => document.documentElement.dataset.fxAudioState === 'off', null, { timeout: 10000 });
  const off = await snapshot(page);
  assert(off.label === 'UNMUTE' && off.pressed === 'false' && off.publicState === 'off', name + ': MUTE did not return to silent state: ' + JSON.stringify(off));

  const meaningful = diagnostics.filter(item => !/favicon|WebGL stall|GPU stall|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));
  console.log(JSON.stringify({ case: name, initial: 'muted', on, off }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=user-gesture-required', '--mute-audio=false', '--enable-unsafe-swiftshader']
  });
  try {
    await runCase(browser, 'desktop-audio-control-r191', {
      viewport: { width: 1440, height: 900 },
      locale: 'en-US',
      colorScheme: 'dark'
    });
    await runCase(browser, 'mobile-audio-control-r191', {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
      locale: 'en-US',
      colorScheme: 'dark'
    });
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
