'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
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
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
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

async function state(page) {
  return page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController || '',
    ready: document.documentElement.dataset.fxInfiniteScroll || '',
    input: document.documentElement.dataset.fxInfiniteInput || '',
    activity: document.documentElement.dataset.fxScrollActivity || '',
    count: Number(document.documentElement.dataset.fxLoopCount || 0),
    source: document.documentElement.dataset.fxLoopSource || '',
    scrollY,
    maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
    heroTop: document.getElementById('hero')?.getBoundingClientRect().top + scrollY,
    cloneCount: document.querySelectorAll('[data-fx-loop-bridge]').length,
    legacyControllerLoaded: Array.from(document.scripts).some(script => (
      /formatx-infinite-loop-(?:fix|controller-v2)\.js/.test(script.src)
    )),
    boundaryControllerLoaded: Array.from(document.scripts).some(script => (
      /formatx-infinite-scroll\.js/.test(script.src)
    ))
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
      loopBridges: document.querySelectorAll('[data-fx-loop-bridge]').length
    };
  });
}

async function moveToBoundary(page) {
  await closeInteractiveLayers(page);
  await page.evaluate(() => {
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    scrollTo(0, Math.max(0, maximum - 8));
  });
  await page.waitForTimeout(120);
}

async function dispatchWheelSequence(page) {
  await page.evaluate(() => {
    [18, 22, 26, 30, 34].forEach((delta, index) => {
      setTimeout(() => {
        window.dispatchEvent(new WheelEvent('wheel', {
          deltaY: delta,
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }, index * 18);
    });
  });
}

async function performLoop(page, expectedCount) {
  await moveToBoundary(page);
  await dispatchWheelSequence(page);

  const completed = await page.waitForFunction(count => (
    Number(document.documentElement.dataset.fxLoopCount || 0) >= count
    && ['wheel', 'native-scroll'].includes(document.documentElement.dataset.fxLoopSource || '')
    && document.documentElement.dataset.fxInfiniteInput === 'idle'
    && document.documentElement.dataset.fxScrollActivity === 'idle'
  ), expectedCount, { timeout: 12000 }).then(() => true).catch(() => false);

  const current = await state(page);
  assert(completed, 'laptop boundary loop did not complete: ' + JSON.stringify(current));
  assert(current.count === expectedCount, 'unexpected loop count: ' + JSON.stringify(current));
  assert(current.controller === 'boundary-v4' && current.ready === 'ready-v4',
    'wrong controller state: ' + JSON.stringify(current));
  assert(['wheel', 'native-scroll'].includes(current.source),
    'wrong loop source: ' + JSON.stringify(current));
  assert(current.activity === 'idle', 'scroll activity did not settle: ' + JSON.stringify(current));
  assert(current.cloneCount === 0, 'clone-based loop returned: ' + JSON.stringify(current));
  assert(current.boundaryControllerLoaded && !current.legacyControllerLoaded,
    'controller loading conflict: ' + JSON.stringify(current));
  assert(Math.abs(current.scrollY - current.heroTop) <= 3,
    'loop did not land on hero: ' + JSON.stringify(current));
  return current;
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
    && document.fonts.status === 'loaded'
  ), null, { timeout: 45000 });
  await page.waitForTimeout(400);

  const initial = await state(page);
  assert(initial.cloneCount === 0, name + ': clone exists before loop: ' + JSON.stringify(initial));
  assert(initial.boundaryControllerLoaded && !initial.legacyControllerLoaded,
    name + ': wrong controller loaded: ' + JSON.stringify(initial));

  const first = await performLoop(page, 1);
  const firstFootprint = await footprint(page);
  await page.waitForTimeout(500);

  await page.evaluate(() => scrollBy(0, 180));
  await page.waitForTimeout(250);
  assert(await page.evaluate(() => scrollY > 20), name + ': scrolling did not continue after loop');

  await page.waitForTimeout(350);
  const second = await performLoop(page, 2);
  const secondFootprint = await footprint(page);
  assert(JSON.stringify(firstFootprint) === JSON.stringify(secondFootprint),
    name + ': resources accumulated: ' + JSON.stringify({ firstFootprint, secondFootprint }));

  const meaningful = diagnostics.filter(item => (
    !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item)
  ));
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
