'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function prepare(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await page.goto(TEST_URL + '?lang=hu&scroll-test=platform-v2', { waitUntil: 'domcontentloaded' });

  // Production injects the continuous-scroll stylesheet before the seamless
  // runtime. The static fixture can already have started its runtime by the time
  // this validator adds the production stylesheet, so explicitly await CSS load
  // and then request the same geometry refresh a real viewport/layout change
  // would produce. This validates production ordering instead of a test-only race.
  await page.evaluate(origin => new Promise(resolve => {
    let link = document.querySelector('link[href*="formatx-continuous-scroll.css"]');
    const finish = () => resolve(true);
    if (link) {
      if (link.sheet) return finish();
      link.addEventListener('load', finish, { once: true });
      link.addEventListener('error', finish, { once: true });
      return;
    }
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = origin + '/scifi-ui/styles/formatx-continuous-scroll.css?v=platform-v2-browser-test';
    link.dataset.fxContinuousScrollTest = 'true';
    link.addEventListener('load', finish, { once: true });
    link.addEventListener('error', finish, { once: true });
    document.head.appendChild(link);
  }), new URL(TEST_URL).origin);

  if (!await page.locator('script[src*="formatx-infinite-scroll.js"]').count()) {
    const runtimeUrl = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=platform-v2-browser-test', document.baseURI).href);
    await page.addScriptTag({ url: runtimeUrl });
  }

  await page.evaluate(async () => {
    try { await document.fonts?.ready; } catch (_) {}
    dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(220);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const mirror = document.querySelector('.fx-loop-bridge [data-fx-loop-mirror]');
    const source = document.querySelector('#main-content > #hero');
    const bridgeStyle = bridge ? getComputedStyle(bridge) : null;
    return {
      controller: root.dataset.fxInfiniteController || '',
      automaticLoop: root.dataset.fxAutomaticLoop || '',
      bridgeState: root.dataset.fxLoopBridge || '',
      mobileMode: root.dataset.fxMobileScrollMode || '',
      mobilePolicy: root.dataset.fxMobileScrollPolicy || '',
      bootstrapState: root.dataset.fxScrollBootstrapState || '',
      bridgeCount: bridge ? 1 : 0,
      mirrorCount: mirror ? 1 : 0,
      mirrorFocusable: mirror?.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').length || 0,
      mirrorWebglCanvases: [...(mirror?.querySelectorAll('canvas') || [])].filter(canvas => canvas.getContext('webgl2') || canvas.getContext('webgl')).length,
      bridgeDisplay: bridgeStyle?.display || '',
      bridgeVisibility: bridgeStyle?.visibility || '',
      bridgeHeight: bridge?.offsetHeight || 0,
      bridgeTop: bridge?.offsetTop || 0,
      sourceTop: source?.offsetTop || 0,
      sourceHeight: source?.offsetHeight || 0,
      viewportHeight: innerHeight,
      loopCount: Number(root.dataset.fxLoopCount || 0),
      landing: Number(root.dataset.fxLoopLanding || NaN),
      scrollY,
      maximum: Math.max(0, root.scrollHeight - innerHeight),
      runtime: root.__FORMATX_INFINITE_SCROLL__ || null,
      snapRoot: getComputedStyle(root).scrollSnapType,
      snapBody: getComputedStyle(document.body).scrollSnapType,
      overflow: root.scrollWidth - root.clientWidth,
    };
  });
}

async function mobileContentFlowSnapshot(page) {
  return page.evaluate(() => {
    const inspect = (sectionSelector, contentSelector) => {
      const section = document.querySelector(sectionSelector);
      const heading = section?.querySelector(':scope > .section-heading');
      const content = section?.querySelector(contentSelector);
      if (!(section instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(content instanceof HTMLElement)) {
        return { sectionSelector, exists: false };
      }
      const sectionStyle = getComputedStyle(section);
      const contentStyle = getComputedStyle(content);
      const headingRect = heading.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      return {
        sectionSelector,
        exists: true,
        gap: contentRect.top - headingRect.bottom,
        sectionMinHeight: sectionStyle.minHeight,
        sectionHeight: sectionStyle.height,
        contentVisibility: contentStyle.contentVisibility,
        contentDisplay: contentStyle.display,
        contentOpacity: Number(contentStyle.opacity || 1),
        contentHeight: contentRect.height,
        firstRevealVisible: (() => {
          const node = content.querySelector('[data-reveal]');
          if (!(node instanceof HTMLElement)) return true;
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity || 1) > .02
            && rect.height > 0;
        })()
      };
    };
    return [
      inspect('#capabilities', ':scope > .cards'),
      inspect('#pricing', ':scope > .pricing'),
      inspect('#system', ':scope > .system-grid')
    ];
  });
}

async function waitForSeamless(page) {
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v7'
    && document.documentElement.dataset.fxLoopBridge === 'ready-v3'
  ), null, { timeout: 20000 });
  await page.evaluate(() => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    document.body.style.setProperty('scroll-behavior', 'auto', 'important');
    dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(2500);
}

async function verifyMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    locale: 'hu-HU',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await prepare(page);
  await waitForSeamless(page);

  const initial = await snapshot(page);
  assert(initial.automaticLoop === 'enabled', 'mobile seamless loop is not enabled: ' + JSON.stringify(initial));
  assert(initial.mobileMode === 'native-momentum-loop', 'mobile momentum-loop marker missing: ' + JSON.stringify(initial));
  assert(initial.mobilePolicy === 'native-momentum-loop-v1', 'mobile loop policy missing: ' + JSON.stringify(initial));
  assert(initial.bridgeCount === 1 && initial.mirrorCount === 1, 'mobile inert visual bridge contract broken: ' + JSON.stringify(initial));
  assert(initial.mirrorFocusable === 0 && initial.mirrorWebglCanvases === 0, 'mobile bridge duplicated interaction or WebGL state: ' + JSON.stringify(initial));
  assert(initial.bridgeDisplay !== 'none' && initial.bridgeVisibility !== 'hidden', 'mobile bridge is hidden: ' + JSON.stringify(initial));
  assert(initial.bridgeHeight >= initial.viewportHeight, 'mobile bridge has no usable runway: ' + JSON.stringify(initial));
  assert(initial.maximum > initial.bridgeTop + Math.min(220, initial.viewportHeight * .2), 'mobile document still ends at the footer/bridge boundary: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true && initial.runtime?.visualBridge === true, 'mobile seamless runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.runtime?.mobileTransfer === 'scrollend-or-idle', 'mobile transfer is not deferred until momentum end: ' + JSON.stringify(initial));
  assert(initial.runtime?.mobileNativeMomentumPreserved === true, 'mobile native momentum is not preserved: ' + JSON.stringify(initial));
  assert(initial.runtime?.inertReferenceMirror === true && initial.runtime?.mirrorContext === 'static-2d-snapshot-no-webgl', 'mobile inert mirror runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', 'mobile scroll snapping is active: ' + JSON.stringify(initial));
  assert(initial.overflow <= 2, 'mobile horizontal overflow: ' + JSON.stringify(initial));

  const flow = await mobileContentFlowSnapshot(page);
  for (const chapter of flow) {
    assert(chapter.exists, 'mobile content-flow section missing: ' + JSON.stringify(chapter));
    assert(chapter.gap >= -2 && chapter.gap <= 180, 'mobile phantom section gap detected: ' + JSON.stringify(chapter));
    assert(chapter.contentVisibility === 'visible', 'mobile chapter still uses synthetic content visibility: ' + JSON.stringify(chapter));
    assert(chapter.contentDisplay !== 'none' && chapter.contentOpacity > .02 && chapter.contentHeight > 40, 'mobile chapter content is not physically rendered: ' + JSON.stringify(chapter));
    assert(chapter.firstRevealVisible, 'mobile reveal content occupies layout while remaining hidden: ' + JSON.stringify(chapter));
  }

  const threshold = Math.max(36, Math.min(initial.viewportHeight * .18, 180));
  const relative = Math.min(Math.max(threshold + 84, 220), Math.max(220, initial.sourceHeight - 36));

  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo({ top: (bridge?.offsetTop || 0) + offset, left: 0, behavior: 'instant' });
  }, relative);

  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, initial.loopCount, { timeout: 6000 });
  await page.waitForTimeout(650);

  const after = await snapshot(page);
  assert(after.loopCount === initial.loopCount + 1, 'mobile loop did not transfer exactly once: ' + JSON.stringify({ initial, after }));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 110, 'mobile loop did not preserve the visual relative position: ' + JSON.stringify({ relative, after }));
  assert(after.scrollY < after.maximum - 100, 'mobile remained pinned at the physical document end after loop transfer: ' + JSON.stringify(after));

  const stableY = after.scrollY;
  await page.waitForTimeout(900);
  const settledY = await page.evaluate(() => scrollY);
  assert(Math.abs(settledY - stableY) <= 6, 'mobile kept moving after seamless landing settled: ' + JSON.stringify({ stableY, settledY }));

  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo({ top: (bridge?.offsetTop || 0) + offset, left: 0, behavior: 'instant' });
  }, relative);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, after.loopCount, { timeout: 6000 });
  await page.waitForTimeout(650);
  const second = await snapshot(page);
  assert(second.loopCount === after.loopCount + 1, 'mobile second cycle did not transfer exactly once: ' + JSON.stringify({ after, second }));
  assert(Math.abs(second.scrollY - (second.sourceTop + relative)) <= 110, 'mobile second cycle lost its relative landing: ' + JSON.stringify({ relative, second }));

  const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
  assert(!meaningful.length, 'mobile browser errors: ' + meaningful.join(' | '));
  console.log('PASS mobile seamless-v7 + r305 content flow', JSON.stringify({ flow, relative, loopBefore: initial.loopCount, loopAfter: second.loopCount, landing: second.scrollY }));
  await context.close();
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'hu-HU',
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  await prepare(page);
  await waitForSeamless(page);

  const initial = await snapshot(page);
  assert(initial.automaticLoop === 'enabled', 'desktop seamless loop not enabled: ' + JSON.stringify(initial));
  assert(initial.bridgeCount === 1 && initial.mirrorCount === 1, 'desktop inert visual bridge contract broken: ' + JSON.stringify(initial));
  assert(initial.mirrorFocusable === 0 && initial.mirrorWebglCanvases === 0, 'desktop bridge duplicated interaction or WebGL state: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true && initial.runtime?.visualBridge === true, 'desktop v7 runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', 'desktop scroll snapping is active');
  assert(initial.overflow <= 2, 'desktop horizontal overflow: ' + JSON.stringify(initial));

  const safeEnd = Math.max(200, initial.bridgeTop - initial.viewportHeight - 250);
  await page.evaluate(y => scrollTo({ top: y, left: 0, behavior: 'instant' }), Math.round(safeEnd * .2));
  const positions = [await page.evaluate(() => scrollY)];
  for (let i = 0; i < 10; i += 1) {
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(65);
    positions.push(await page.evaluate(() => scrollY));
  }
  for (let i = 1; i < positions.length; i += 1) {
    assert(positions[i] + 6 >= positions[i - 1], 'desktop wheel moved backwards before bridge: ' + JSON.stringify(positions));
  }

  const before = await snapshot(page);
  const threshold = Math.max(36, Math.min(before.viewportHeight * .18, 180));
  const relative = Math.min(Math.max(threshold + 70, 120), Math.max(120, before.sourceHeight - 30));
  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo({ top: (bridge?.offsetTop || 0) + offset, left: 0, behavior: 'instant' });
  }, relative);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(500);
  const after = await snapshot(page);
  assert(after.loopCount === before.loopCount + 1, 'desktop loop did not transfer exactly once: ' + JSON.stringify({ before, after }));
  assert(Number.isFinite(after.landing) && Math.abs(after.scrollY - after.landing) <= 80, 'desktop loop did not settle at its recorded visual landing: ' + JSON.stringify({ relative, after }));
  assert(after.landing >= after.sourceTop + relative - 80, 'desktop loop moved backwards across the boundary: ' + JSON.stringify({ relative, after }));
  assert(after.landing <= after.sourceTop + relative + Math.min(320, after.viewportHeight * .4), 'desktop loop overran the bounded wheel continuation: ' + JSON.stringify({ relative, after }));

  await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo({ top: (bridge?.offsetTop || 0) + offset, left: 0, behavior: 'instant' });
  }, relative);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, after.loopCount, { timeout: 5000 });
  await page.waitForTimeout(500);
  const second = await snapshot(page);
  assert(second.loopCount === after.loopCount + 1, 'desktop second cycle did not transfer exactly once: ' + JSON.stringify({ after, second }));
  assert(Number.isFinite(second.landing) && Math.abs(second.scrollY - second.landing) <= 80, 'desktop second cycle did not settle at its recorded visual landing: ' + JSON.stringify({ relative, second }));
  assert(second.landing >= second.sourceTop + relative - 80 && second.landing <= second.sourceTop + relative + 100, 'desktop second cycle lost its relative landing: ' + JSON.stringify({ relative, second }));

  console.log('PASS desktop seamless-v7', JSON.stringify({ positions, loopBefore: before.loopCount, loopAfter: second.loopCount }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.FORMATX_CHROMIUM_PATH || undefined,
    args: ['--disable-smooth-scrolling', '--enable-unsafe-swiftshader']
  });
  try {
    await verifyMobile(browser);
    await verifyDesktop(browser);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
