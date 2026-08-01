'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  await skip.waitFor({ state: 'visible', timeout: 6000 });
  await skip.click({ force: true });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete') && (!overlay || overlay.hidden);
  }, null, { timeout: 7000 });
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
  await page.mouse.move(680, 360);
  for (const delta of deltas) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(14);
  }
}

async function performWheelLoop(page, expectedCount) {
  const geometry = await page.evaluate(() => ({
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    heroTop: document.getElementById('hero')?.getBoundingClientRect().top + scrollY,
  }));
  assert(
    Number.isFinite(geometry.heroTop) && geometry.maximum > 120,
    'invalid loop geometry: ' + JSON.stringify(geometry)
  );

  await page.evaluate(target => scrollTo(0, target), Math.max(0, geometry.maximum - 84));
  await page.waitForTimeout(60);
  await highResolutionWheel(page, [9, 11, 10, 12, 14, 16, 18, 20]);

  await page.waitForFunction(count => (
    Number(document.documentElement.dataset.fxLoopCount || 0) === count
    && ['wheel', 'native-scroll'].includes(document.documentElement.dataset.fxLoopSource || '')
    && document.documentElement.dataset.fxInfiniteInput === 'idle'
    && document.documentElement.dataset.fxScrollActivity === 'idle'
    && !document.documentElement.classList.contains('fx-page-scrolling')
  ), expectedCount, { timeout: 10000 });

  const state = await loopState(page);
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
  ), null, { timeout: 30000 });

  const initial = await loopState(page);
  assert(initial.cloneCount === 0, name + ': clone exists before loop: ' + JSON.stringify(initial));
  assert(initial.boundaryControllerLoaded && !initial.legacyControllerLoaded, name + ': wrong controller loaded: ' + JSON.stringify(initial));

  const first = await performWheelLoop(page, 1);
  const firstFootprint = await footprint(page);

  await page.waitForTimeout(420);
  const startY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(260);
  const continuedY = await page.evaluate(() => window.scrollY);
  assert(continuedY > startY + 20, name + ': scrolling did not continue after loop');

  await page.waitForTimeout(260);
  const second = await performWheelLoop(page, 2);
  const secondFootprint = await footprint(page);
  assert(
    JSON.stringify(firstFootprint) === JSON.stringify(secondFootprint),
    name + ': resources accumulated: ' + JSON.stringify({ firstFootprint, secondFootprint })
  );

  const meaningful = diagnostics.filter(item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED/i.test(item));
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
