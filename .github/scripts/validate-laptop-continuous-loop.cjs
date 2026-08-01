'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    if (root.classList.contains('fx-intro-complete') && (!overlay || overlay.hidden)) return true;
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
    return true;
  }, null, { timeout: 8000 });
}

async function loopState(page) {
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    ready: document.documentElement.dataset.fxInfiniteScroll || '',
    input: document.documentElement.dataset.fxInfiniteInput || '',
    activity: document.documentElement.dataset.fxScrollActivity || '',
    scrollingClass: document.documentElement.classList.contains('fx-page-scrolling'),
    count: Number(document.documentElement.dataset.fxLoopCount || 0),
    source: document.documentElement.dataset.fxLoopSource || '',
    target: Number(document.documentElement.dataset.fxLoopTarget || 0),
    scrollY: window.scrollY,
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    heroTop: document.getElementById('hero')?.getBoundingClientRect().top + window.scrollY,
    cloneCount: document.querySelectorAll('[data-fx-loop-bridge]').length,
    legacyControllerLoaded: Array.from(document.scripts).some(script => /formatx-infinite-loop-(?:fix|controller-v2)\.js/.test(script.src)),
    boundaryControllerLoaded: Array.from(document.scripts).some(script => /formatx-infinite-scroll\.js/.test(script.src)),
  }));
}

async function footprint(page) {
  return page.evaluate(() => {
    const frames = Array.from(document.querySelectorAll('.fx-three-stage-shell iframe'));
    const frameCanvases = frames.reduce((count, frame) => {
      try {
        return count + (frame.contentDocument?.querySelectorAll('canvas').length || 0);
      } catch (_) {
        return count;
      }
    }, 0);
    return {
      frames: frames.length,
      canvases: document.querySelectorAll('canvas').length + frameCanvases,
      modules: document.querySelectorAll('script[data-fx-transcend-module]').length,
      stageShells: document.querySelectorAll('.fx-three-stage-shell').length,
      loopBridges: document.querySelectorAll('[data-fx-loop-bridge]').length,
    };
  });
}

async function highResolutionWheel(page, deltas) {
  await page.mouse.move(24, 220);
  for (const delta of deltas) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(16);
  }
}

async function closeInteractiveLayers(page) {
  await page.evaluate(() => {
    document.querySelector('.fx-organism-thought-close')?.click();
    document.querySelector('.fx-organism-console-close')?.click();

    const dialogue = document.querySelector('.fx-organism-dialogue');
    if (dialogue instanceof HTMLElement) {
      dialogue.classList.remove('is-open');
      dialogue.hidden = true;
      dialogue.setAttribute('aria-hidden', 'true');
    }

    const consoleRoot = document.getElementById('fx-organism-console');
    if (consoleRoot instanceof HTMLElement) {
      consoleRoot.classList.remove('is-authorised-open');
      consoleRoot.hidden = true;
      consoleRoot.setAttribute('aria-hidden', 'true');
      consoleRoot.style.setProperty('display', 'none');
    }

    document.body.classList.remove('fx-organism-panel-open');
  });
}

async function moveToStableBottom(page) {
  await closeInteractiveLayers(page);
  let previous = -1;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const maximum = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    await page.evaluate(target => scrollTo(0, Math.max(0, target - 24)), maximum);
    await page.waitForTimeout(100);
    const current = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    if (Math.abs(current - previous) <= 1 && Math.abs(current - maximum) <= 1) return current;
    previous = current;
  }
  return page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
}

async function performWheelLoop(page, expectedCount) {
  const maximum = await moveToStableBottom(page);
  const geometry = await page.evaluate(() => ({
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    heroTop: document.getElementById('hero')?.getBoundingClientRect().top + scrollY,
    y: scrollY
  }));
  assert(
    Number.isFinite(geometry.heroTop) && maximum > 120,
    'invalid loop geometry: ' + JSON.stringify(geometry)
  );

  await highResolutionWheel(page, [18, 20, 22, 24, 26, 28, 30, 32]);

  const completed = await page.waitForFunction(count => (
    Number(document.documentElement.dataset.fxLoopCount || 0) >= count
    && ['wheel', 'native-scroll'].includes(document.documentElement.dataset.fxLoopSource || '')
    && document.documentElement.dataset.fxInfiniteInput === 'idle'
    && document.documentElement.dataset.fxScrollActivity === 'idle'
    && !document.documentElement.classList.contains('fx-page-scrolling')
  ), expectedCount, { timeout: 12000 }).then(() => true).catch(() => false);

  if (!completed) {
    const failed = await loopState(page);
    throw new Error('laptop boundary loop did not complete: ' + JSON.stringify(failed));
  }

  const state = await loopState(page);
  assert(state.count === expectedCount, 'unexpected loop count: ' + JSON.stringify(state));
  assert(state.controller === 'boundary-v4', 'wrong controller after loop: ' + JSON.stringify(state));
  assert(state.ready === 'ready-v4', 'controller not ready after loop: ' + JSON.stringify(state));
  assert(['wheel', 'native-scroll'].includes(state.source), 'wrong loop source: ' + JSON.stringify(state));
  assert(state.activity === 'idle' && !state.scrollingClass, 'floating UI did not settle after loop: ' + JSON.stringify(state));
  assert(state.cloneCount === 0, 'clone-based loop returned: ' + JSON.stringify(state));
  assert(state.boundaryControllerLoaded && !state.legacyControllerLoaded, 'controller loading conflict: ' + JSON.stringify(state));
  assert(Math.abs(state.scrollY - state.heroTop) <= 3, 'loop did not land on hero: ' + JSON.stringify(state));
  return state;
}

async function verifyViewport(browser, viewport, name) {
  const context = await browser.newContext({
    viewport,
    locale: 'hu-HU',
    colorScheme: 'dark',
    hasTouch: false,
    isMobile: false,
    deviceScaleFactor: 1
  });

  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });

  await page.goto(TEST_URL + '?lang=hu&loop-test=4', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'boundary-v4'
    && document.documentElement.dataset.fxInfiniteScroll === 'ready-v4'
    && document.documentElement.dataset.fxMobileUnified === 'ready-v1'
    && /^safe-(?:ready|degraded)-v26$/.test(
      document.documentElement.dataset.fxTranscendLoader || ''
    )
    && document.fonts.status === 'loaded'
  ), null, { timeout: 45000 });
  await page.waitForTimeout(500);

  const initial = await loopState(page);
  assert(initial.cloneCount === 0, name + ': clone exists before loop: ' + JSON.stringify(initial));
  assert(initial.boundaryControllerLoaded && !initial.legacyControllerLoaded, name + ': wrong controller loaded: ' + JSON.stringify(initial));

  const first = await performWheelLoop(page, 1);
  const firstFootprint = await footprint(page);

  await page.waitForTimeout(500);
  const startY = await page.evaluate(() => window.scrollY);
  await page.mouse.move(24, 220);
  await page.mouse.wheel(0, 180);
  await page.waitForTimeout(300);
  const continuedY = await page.evaluate(() => window.scrollY);
  assert(continuedY > startY + 20, name + ': scrolling did not continue after loop');

  await page.waitForTimeout(400);
  const second = await performWheelLoop(page, 2);
  const secondFootprint = await footprint(page);
  assert(
    JSON.stringify(firstFootprint) === JSON.stringify(secondFootprint),
    name + ': resources accumulated: ' + JSON.stringify({ firstFootprint, secondFootprint })
  );

  const meaningful = diagnostics.filter(item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));

  console.log(JSON.stringify({ case: name, viewport, first, second, footprint: secondFootprint }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-smooth-scrolling', '--enable-unsafe-swiftshader']
  });

  try {
    await verifyViewport(browser, { width: 1366, height: 768 }, 'laptop-1366x768');
    await verifyViewport(browser, { width: 1536, height: 864 }, 'laptop-1536x864');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
