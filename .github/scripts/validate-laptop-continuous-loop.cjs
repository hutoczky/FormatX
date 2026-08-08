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
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function ensureContinuousPolicy(page) {
  if (!await page.locator('link[data-fx-continuous-scroll-style]').count()) {
    await page.addStyleTag({ url: new URL('/scifi-ui/styles/formatx-continuous-scroll.css?v=seamless-v7-browser-test', TEST_URL).href });
  }
}

async function simulateOrganismSnapConflict(page) {
  if (!await page.locator('link[data-fx-test-organism-style]').count()) {
    await page.evaluate(origin => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = origin + '/scifi-ui/styles/organism-interface.css?v=seamless-v7-browser-test';
      link.dataset.fxTestOrganismStyle = 'true';
      document.head.appendChild(link);
    }, new URL(TEST_URL).origin);
    await page.waitForFunction(() => Boolean(document.querySelector('link[data-fx-test-organism-style]')?.sheet));
  }
  await page.evaluate(() => document.documentElement.classList.add('fx-organism-interface-ready'));
}

async function ensureScrollRuntime(page) {
  await ensureContinuousPolicy(page);
  await simulateOrganismSnapConflict(page);
  if (await page.locator('script[src*="formatx-infinite-scroll.js"]').count()) return;
  const runtimeUrl = await page.evaluate(() => new URL('./scripts/formatx-infinite-scroll.js?v=seamless-v7-browser-test', document.baseURI).href);
  await page.addScriptTag({ url: runtimeUrl });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const source = document.querySelector('#main-content > #hero');
    const clone = bridge?.querySelector('.fx-loop-hero-clone');
    return {
      controller: document.documentElement.dataset.fxInfiniteController || '',
      ready: document.documentElement.dataset.fxInfiniteScroll || '',
      input: document.documentElement.dataset.fxInfiniteInput || '',
      automaticLoop: document.documentElement.dataset.fxAutomaticLoop || '',
      jumpGuard: document.documentElement.dataset.fxScrollJumpGuard || '',
      bridgeState: document.documentElement.dataset.fxLoopBridge || '',
      mobileMode: document.documentElement.dataset.fxMobileScrollMode || '',
      landingState: document.documentElement.dataset.fxLoopLandingState || '',
      loopSource: document.documentElement.dataset.fxLoopSource || '',
      rootScrollSnapType: getComputedStyle(document.documentElement).scrollSnapType,
      bodyScrollSnapType: getComputedStyle(document.body).scrollSnapType,
      sceneSnap: Array.from(document.querySelectorAll('#hero, main > .scene')).map(node => getComputedStyle(node).scrollSnapAlign),
      scrollY,
      viewportHeight: innerHeight,
      maximum: Math.max(0, document.documentElement.scrollHeight - innerHeight),
      loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
      bridgeCount: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
      cloneCount: document.querySelectorAll('.fx-loop-bridge [data-fx-loop-clone="true"]').length,
      heroIdCount: document.querySelectorAll('#hero').length,
      transferClass: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
      runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
      bridgeTop: bridge?.offsetTop || 0,
      bridgeHeight: bridge?.offsetHeight || 0,
      sourceTop: source?.offsetTop || 0,
      sourceHeight: source?.offsetHeight || 0,
      cloneHeight: clone?.offsetHeight || 0,
      sourceTitle: source?.querySelector('.hero-title-main')?.textContent?.trim() || '',
      cloneTitle: clone?.querySelector('.hero-title-main')?.textContent?.trim() || '',
      footerInPanel: Boolean(document.querySelector('[data-organism-panel="resources"] .site-footer')),
      footerInFlow: Boolean(document.querySelector('body > .site-footer')),
    };
  });
}

async function verifyProgressiveScroll(page, name) {
  const positions = await page.evaluate(async () => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const maximumBeforeBridge = Math.max(0, (bridge?.offsetTop || document.documentElement.scrollHeight) - innerHeight - 100);
    const start = Math.round(maximumBeforeBridge * .18);
    const end = Math.round(maximumBeforeBridge * .82);
    const values = [];
    scrollTo(0, start);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let index = 1; index <= 20; index += 1) {
      const target = Math.round(start + (end - start) * index / 20);
      scrollTo(0, target);
      await new Promise(resolve => setTimeout(resolve, 32));
      values.push(scrollY);
    }
    return values;
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert(positions[index] + 8 >= positions[index - 1],
      name + ': ordinary scrolling moved backwards or snapped to a previous heading: ' + JSON.stringify(positions));
  }
}

async function verifyRealWheelContinuity(page, name) {
  const geometry = await snapshot(page);
  const safeMaximum = Math.max(120, geometry.bridgeTop - geometry.viewportHeight - 240);
  const start = Math.max(80, Math.min(Math.round(safeMaximum * .18), safeMaximum - 80));
  await page.evaluate(y => scrollTo(0, y), start);
  await page.waitForTimeout(120);
  const viewport = await page.viewportSize();
  await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));

  const positions = [await page.evaluate(() => scrollY)];
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(70);
    positions.push(await page.evaluate(() => scrollY));
  }

  let forwardSteps = 0;
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] > positions[index - 1] + 2) forwardSteps += 1;
    assert(positions[index] + 6 >= positions[index - 1],
      name + ': real wheel input moved backwards at a chapter boundary: ' + JSON.stringify(positions));
  }
  assert(forwardSteps >= 8,
    name + ': real wheel input did not produce continuous forward movement: ' + JSON.stringify(positions));

  const idleStart = await page.evaluate(() => scrollY);
  await page.waitForTimeout(720);
  const idleEnd = await page.evaluate(() => scrollY);
  assert(Math.abs(idleEnd - idleStart) <= 6,
    name + ': page snapped after wheel input stopped before the loop bridge: ' + JSON.stringify({ idleStart, idleEnd, positions }));
}

async function verifyDesktopTransfer(page, name) {
  const before = await snapshot(page);
  const threshold = Math.max(36, Math.min(before.viewportHeight * .18, 180));
  const relative = Math.round(Math.min(before.cloneHeight - 24, threshold + 64));
  assert(relative > threshold && relative < before.cloneHeight,
    name + ': invalid desktop bridge transfer point: ' + JSON.stringify({ relative, threshold, before }));

  await page.evaluate(relativeOffset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + relativeOffset);
  }, relative);
  await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous,
    before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(220);

  const after = await snapshot(page);
  assert(after.loopCount === before.loopCount + 1,
    name + ': exactly one desktop cycle transfer was expected: ' + JSON.stringify({ before, after }));
  assert(after.loopSource === 'visual-bridge-desktop',
    name + ': desktop loop source marker missing: ' + JSON.stringify(after));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 56,
    name + ': desktop transfer did not preserve relative visual position: ' + JSON.stringify({ relative, after }));
  assert(!after.transferClass && after.input === 'native',
    name + ': desktop transfer state did not settle: ' + JSON.stringify(after));
}

async function verifyMobileDeferredTransfer(page, name) {
  const before = await snapshot(page);
  const threshold = Math.max(36, Math.min(before.viewportHeight * .18, 180));
  const relative = Math.round(Math.min(before.cloneHeight - 24, threshold + 72));
  assert(relative > threshold && relative < before.cloneHeight,
    name + ': invalid mobile bridge transfer point: ' + JSON.stringify({ relative, threshold, before }));

  await page.evaluate(relativeOffset => {
    document.dispatchEvent(new Event('touchstart', { bubbles: true }));
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    scrollTo(0, (bridge?.offsetTop || 0) + relativeOffset);
  }, relative);
  await page.waitForTimeout(520);

  const duringTouch = await snapshot(page);
  assert(duringTouch.loopCount === before.loopCount,
    name + ': mobile loop transferred while touch/momentum ownership was still active: ' + JSON.stringify({ before, duringTouch }));
  assert(duringTouch.scrollY >= duringTouch.bridgeTop,
    name + ': mobile scroll was pulled out of the bridge before touch end: ' + JSON.stringify(duringTouch));

  await page.evaluate(() => document.dispatchEvent(new Event('touchend', { bubbles: true })));
  await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous,
    before.loopCount, { timeout: 5000 });
  await page.waitForTimeout(260);

  const after = await snapshot(page);
  assert(after.loopCount === before.loopCount + 1,
    name + ': exactly one deferred mobile cycle transfer was expected: ' + JSON.stringify({ before, after }));
  assert(after.loopSource === 'visual-bridge-mobile-idle',
    name + ': deferred mobile loop source marker missing: ' + JSON.stringify(after));
  assert(Math.abs(after.scrollY - (after.sourceTop + relative)) <= 64,
    name + ': mobile transfer did not preserve relative visual position: ' + JSON.stringify({ relative, after }));
  assert(!after.transferClass && after.input === 'native',
    name + ': mobile transfer state did not settle: ' + JSON.stringify(after));
}

async function verifyViewport(browser, viewport, name, mobile) {
  const context = await browser.newContext({
    viewport,
    locale: 'hu-HU',
    colorScheme: 'dark',
    hasTouch: mobile,
    isMobile: mobile,
    deviceScaleFactor: mobile ? 2 : 1
  });
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push('console-error: ' + message.text());
  });

  await page.goto(TEST_URL + '?lang=hu&scroll-test=seamless-v7', { waitUntil: 'domcontentloaded' });
  await clearIntro(page);
  await ensureScrollRuntime(page);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxInfiniteController === 'seamless-v7'
    && document.documentElement.dataset.fxInfiniteScroll === 'ready-seamless-v7'
    && document.documentElement.dataset.fxAutomaticLoop === 'enabled'
    && document.documentElement.dataset.fxLoopBridge === 'ready-v3'
  ), null, { timeout: 45000 });
  await page.waitForTimeout(500);

  const initial = await snapshot(page);
  assert(initial.bridgeCount === 1, name + ': exactly one visual bridge container required: ' + JSON.stringify(initial));
  assert(initial.cloneCount === 1, name + ': exactly one inert Hero clone required: ' + JSON.stringify(initial));
  assert(initial.heroIdCount === 1, name + ': duplicate #hero id detected: ' + JSON.stringify(initial));
  assert(initial.sourceTitle && initial.sourceTitle === initial.cloneTitle,
    name + ': visual bridge title differs from source hero: ' + JSON.stringify(initial));
  assert(initial.cloneHeight >= initial.viewportHeight - 4 && initial.bridgeHeight >= initial.viewportHeight - 4,
    name + ': visual bridge must cover the full viewport: ' + JSON.stringify(initial));
  assert(initial.footerInFlow && !initial.footerInPanel,
    name + ': footer must remain in document flow, not inside the release dialog: ' + JSON.stringify(initial));
  assert(initial.runtime?.automaticLoop === true
    && initial.runtime?.visualBridge === true
    && initial.runtime?.clonedHeroOnly === true
    && initial.runtime?.jumpFree === true
    && initial.runtime?.sectionSnapDisabled === true
    && initial.runtime?.mobileNativeMomentumPreserved === true,
    name + ': seamless-v7 runtime contract missing: ' + JSON.stringify(initial));
  assert(initial.rootScrollSnapType === 'none' && initial.bodyScrollSnapType === 'none',
    name + ': root/body scroll snapping is active: ' + JSON.stringify(initial));
  assert(initial.sceneSnap.every(value => value === 'none'),
    name + ': a chapter/scene still has snap alignment: ' + JSON.stringify(initial));

  await verifyProgressiveScroll(page, name);
  if (mobile) await verifyMobileDeferredTransfer(page, name);
  else {
    await verifyRealWheelContinuity(page, name);
    await verifyDesktopTransfer(page, name);
  }

  const meaningful = diagnostics.filter(item => (
    !/favicon|WebGL|WebGPU|GPU|net::ERR_ABORTED|Failed to load resource:.*404/i.test(item)
  ));
  assert(!meaningful.length, name + ': browser diagnostics: ' + meaningful.join(' | '));

  console.log(JSON.stringify({ case: name, viewport, state: await snapshot(page) }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-smooth-scrolling', '--enable-unsafe-swiftshader']
  });
  try {
    await verifyViewport(browser, { width: 412, height: 915 }, 'mobile-412x915', true);
    await verifyViewport(browser, { width: 1366, height: 768 }, 'laptop-1366x768', false);
    await verifyViewport(browser, { width: 1920, height: 1080 }, 'full-hd-1920x1080', false);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
