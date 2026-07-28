'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function waitFrames(page, count = 2) {
  await page.evaluate(frameCount => new Promise(resolve => {
    let remaining = frameCount;
    function frame() {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }), count);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  await skip.waitFor({ state: 'visible', timeout: 6000 });
  await skip.click({ force: true });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    return root.classList.contains('fx-intro-complete')
      && !root.classList.contains('fx-intro-running')
      && (!overlay || overlay.hidden);
  }, null, { timeout: 6000 });
}

async function geometry(page) {
  return page.evaluate(() => {
    const hero = document.getElementById('hero');
    const clone = document.querySelector('[data-fx-loop-bridge="true"]');
    if (!hero || !clone) return null;
    const heroTop = hero.getBoundingClientRect().top + scrollY;
    const cloneTop = clone.getBoundingClientRect().top + scrollY;
    const cloneHeight = clone.getBoundingClientRect().height || clone.offsetHeight;
    const trigger = cloneTop + Math.max(0, cloneHeight - innerHeight) * 0.58;
    return {
      heroTop,
      heroHeight: hero.getBoundingClientRect().height || hero.offsetHeight,
      cloneTop,
      cloneHeight,
      trigger,
      viewport: [innerWidth, innerHeight]
    };
  });
}

async function loopState(page) {
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    fix: document.documentElement.dataset.fxInfiniteFix || '',
    input: document.documentElement.dataset.fxInfiniteInput || '',
    count: Number(document.documentElement.dataset.fxLoopCount || 0),
    source: document.documentElement.dataset.fxLoopSource || '',
    target: Number(document.documentElement.dataset.fxLoopTarget || 0),
    scrollY: window.scrollY,
    snap: getComputedStyle(document.documentElement).scrollSnapType,
    precisionClass: document.documentElement.classList.contains('fx-precision-wheel'),
    cloneCount: document.querySelectorAll('[data-fx-loop-bridge="true"]').length,
    oldControllerLoaded: Array.from(document.scripts).some(script => /formatx-infinite-loop-fix\.js/.test(script.src)),
    newControllerLoaded: Array.from(document.scripts).some(script => /formatx-infinite-loop-controller-v2\.js/.test(script.src))
  }));
}

async function positionBeforeHandoff(page, margin) {
  const data = await geometry(page);
  assert(data, 'missing hero or loop clone');
  await page.evaluate(target => scrollTo(0, target), Math.max(0, data.trigger - margin));
  await waitFrames(page, 3);
  return data;
}

async function highResolutionWheel(page, deltas) {
  await page.mouse.move(680, 360);
  for (const delta of deltas) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(14);
  }
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

  await page.goto(TEST_URL + '?lang=hu&loop-test=2', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await page.waitForFunction(() => document.documentElement.dataset.fxInfiniteController === 'authoritative-wheel-v2', null, { timeout: 30000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-fx-loop-bridge="true"]').length === 1, null, { timeout: 15000 });

  let state = await loopState(page);
  assert(state.controller === 'authoritative-wheel-v2', name + ': wrong controller: ' + JSON.stringify(state));
  assert(state.fix === 'ready-v2', name + ': V2 controller not ready: ' + JSON.stringify(state));
  assert(state.cloneCount === 1, name + ': clone count: ' + JSON.stringify(state));
  assert(state.newControllerLoaded && !state.oldControllerLoaded, name + ': controller loading conflict: ' + JSON.stringify(state));

  const firstGeometry = await positionBeforeHandoff(page, 76);
  const firstCount = (await loopState(page)).count;
  await highResolutionWheel(page, [9, 11, 10, 12, 14, 16, 18, 20]);
  await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous, firstCount, { timeout: 7000 });
  await waitFrames(page, 3);

  const first = await loopState(page);
  assert(first.source.startsWith('wheel'), name + ': first loop did not come from wheel input: ' + JSON.stringify(first));
  assert(first.scrollY >= firstGeometry.heroTop - 2, name + ': first loop landed above hero: ' + JSON.stringify({ first, firstGeometry }));
  assert(first.scrollY < firstGeometry.cloneTop, name + ': first loop remained in clone: ' + JSON.stringify({ first, firstGeometry }));

  const continuedFrom = first.scrollY;
  await page.mouse.wheel(0, 140);
  await page.waitForTimeout(180);
  const continued = await loopState(page);
  assert(continued.scrollY > continuedFrom + 20, name + ': wheel momentum did not continue after transfer: ' + JSON.stringify({ first, continued }));

  const secondGeometry = await positionBeforeHandoff(page, 54);
  const secondCount = (await loopState(page)).count;
  await highResolutionWheel(page, [6, 7, 8, 8, 9, 10, 11, 12]);
  await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous, secondCount, { timeout: 7000 });
  await waitFrames(page, 3);

  const second = await loopState(page);
  assert(second.count >= firstCount + 2, name + ': two continuous cycles were not completed: ' + JSON.stringify(second));
  assert(second.scrollY >= secondGeometry.heroTop - 2 && second.scrollY < secondGeometry.cloneTop, name + ': second landing is outside the original cycle: ' + JSON.stringify({ second, secondGeometry }));

  const meaningful = diagnostics.filter(item => !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED/i.test(item));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));

  console.log(JSON.stringify({ case: name, viewport, first, continued, second }));
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
