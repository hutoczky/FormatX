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
  await page.goto(TEST_URL + '?lang=hu&scroll-test=heart-r252', { waitUntil: 'domcontentloaded' });

  const hasScrollBootstrap = await page.locator('script[src*="formatx-infinite-scroll.js"]').count();
  if (!hasScrollBootstrap) {
    await page.addScriptTag({
      url: new URL('/scifi-ui/scripts/formatx-infinite-scroll.js?v=ci-r508-single-owner', TEST_URL).href
    });
  }

  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxInfiniteController === 'seamless-v7'
      && root.dataset.fxLoopBridge === 'ready-v3'
      && root.dataset.fxHeartCoreR252 === 'ready';
  }, null, { timeout: 20000 });
  await page.evaluate(async () => {
    try { await document.fonts?.ready; } catch (_) {}
    dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(1200);
}

async function waitForStableLoopGeometry(page, label) {
  let previous = null;
  let stableSamples = 0;
  let latest = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    latest = await page.evaluate(() => {
      const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
      const hero = document.querySelector('#main-content > #hero');
      return {
        interfaceState: document.documentElement.dataset.fxOrganismInterface || '',
        panelOpen: document.body.classList.contains('fx-organism-panel-open'),
        bridgeReady: document.documentElement.dataset.fxLoopBridge || '',
        bridgeTop: bridge instanceof HTMLElement ? bridge.offsetTop : -1,
        bridgeHeight: bridge instanceof HTMLElement ? bridge.offsetHeight : -1,
        heroTop: hero instanceof HTMLElement ? hero.offsetTop : -1,
        heroHeight: hero instanceof HTMLElement ? hero.offsetHeight : -1,
        documentHeight: document.documentElement.scrollHeight,
      };
    });
    const key = [latest.bridgeTop, latest.bridgeHeight, latest.heroTop, latest.heroHeight, latest.documentHeight].join('|');
    if (latest.bridgeReady === 'ready-v3' && !latest.panelOpen && previous === key) stableSamples += 1;
    else stableSamples = 0;
    previous = key;
    if (stableSamples >= 3) return latest;
    await page.waitForTimeout(100);
  }
  throw new Error(`${label} seamless bridge geometry did not settle: ${JSON.stringify(latest)}`);
}

async function state(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const mirror = bridge?.querySelector('[data-fx-loop-mirror]');
    const hero = document.querySelector('#main-content > #hero');
    const hit = document.querySelector('#hero .fx-mag-heart-hit-r252');
    const bridgeStyle = bridge ? getComputedStyle(bridge) : null;
    const hitRect = hit?.getBoundingClientRect();
    const focusable = mirror?.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').length || 0;
    return {
      controller: root.dataset.fxInfiniteController || '',
      heart: root.dataset.fxHeartCoreR252 || '',
      heartPolicy: root.dataset.fxHeartLoopPolicy || '',
      heartScrollOwner: root.dataset.fxHeartScrollOwner || '',
      heartPointerOwner: root.dataset.fxHeartPointerOwnerR524 || '',
      bridgeCount: bridge ? 1 : 0,
      mirrorCount: mirror ? 1 : 0,
      mirrorInert: Boolean(mirror?.hasAttribute('inert')),
      mirrorAriaHidden: mirror?.getAttribute('aria-hidden') || '',
      mirrorFocusable: focusable,
      bridgeHeight: bridge?.offsetHeight || 0,
      bridgeTop: bridge?.offsetTop || 0,
      bridgeDisplay: bridgeStyle?.display || '',
      heroTop: hero?.offsetTop || 0,
      heroHeight: hero?.offsetHeight || 0,
      viewportHeight: innerHeight,
      maximum: Math.max(0, root.scrollHeight - innerHeight),
      scrollY,
      loopCount: Number(root.dataset.fxLoopCount || 0),
      loopSource: root.dataset.fxLoopSource || '',
      landing: Number(root.dataset.fxLoopLanding || 0),
      landingState: root.dataset.fxLoopLandingState || '',
      hitExists: hit instanceof HTMLButtonElement,
      hitWidth: hitRect?.width || 0,
      hitHeight: hitRect?.height || 0,
      hitLabel: hit?.getAttribute('aria-label') || '',
      interactionMode: root.dataset.fxCoreInteractionMode || '',
      interactionTarget: root.dataset.fxCoreInteractionTarget || '',
      overflow: root.scrollWidth - root.clientWidth,
      snapRoot: getComputedStyle(root).scrollSnapType,
      snapBody: getComputedStyle(document.body).scrollSnapType,
      runtime: root.__FORMATX_INFINITE_SCROLL__ || null
    };
  });
}

async function verifyHeartInteraction(page, label) {
  await page.waitForFunction(() => (
    document.querySelector('#hero .fx-mag-heart-hit-r252')
    && document.querySelector('#hero .hero-space')
    && (window.FormatXOrganismVoice?.open || document.querySelector('#hero .fx-reference-ask'))
  ), null, { timeout: 15000 });

  const hit = page.locator('#hero .fx-mag-heart-hit-r252').first();
  assert(await hit.count() === 1, `${label} MAG semantic hit target missing`);
  const surface = page.locator('#hero .hero-space').first();
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  assert(box && box.width > 120 && box.height > 120, `${label} visible MAG surface has no usable pointer geometry: ${JSON.stringify(box)}`);
  await page.mouse.click(box.x + box.width * .5, box.y + box.height * .5);

  await page.waitForFunction(() => document.documentElement.dataset.fxCoreInteractionMode === 'active-r252', null, { timeout: 5000 });
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.fxCoreInteractionTarget), null, { timeout: 5000 });

  const interaction = await page.evaluate(() => ({
    mode: document.documentElement.dataset.fxCoreInteractionMode || '',
    source: document.documentElement.dataset.fxCoreInteractionSource || '',
    pointerOwner: document.documentElement.dataset.fxHeartPointerOwnerR524 || '',
    target: document.documentElement.dataset.fxCoreInteractionTarget || '',
  }));
  assert(interaction.mode === 'active-r252', `${label} visible MAG surface did not activate core interaction: ${JSON.stringify(interaction)}`);
  assert(interaction.source === 'surface' || interaction.source === 'core', `${label} MAG interaction source is not the visible/semantic core surface: ${JSON.stringify(interaction)}`);
  assert(interaction.pointerOwner === 'visible-mag-surface-plus-semantic-keyboard-target', `${label} R524 pointer owner missing: ${JSON.stringify(interaction)}`);
  assert(/organism-voice|ask-control|thought-trigger/.test(interaction.target), `${label} MAG has no canonical interaction target: ${JSON.stringify(interaction)}`);

  /* The ASK fallback bootstraps the Organism interface on demand. That bootstrap
     intentionally restructures the document and triggers a seamless bridge rebuild.
     Do not sample a loop target from the transient pre-interface geometry. */
  if (interaction.target === 'ask-control') {
    await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 15000 });
  }
  await page.keyboard.press('Escape').catch(() => {});
  await waitForStableLoopGeometry(page, `${label} post-MAG`);
}

async function runLoopCycle(page, label, cycle) {
  await waitForStableLoopGeometry(page, `${label} cycle ${cycle}`);
  const before = await state(page);
  const target = await page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const hero = document.querySelector('#main-content > #hero');
    if (!(bridge instanceof HTMLElement) || !(hero instanceof HTMLElement)) return null;
    const relative = Math.max(48, Math.min(innerHeight * .24, Math.max(48, hero.offsetHeight - 12)));
    const bridgeTop = bridge.offsetTop;
    window.scrollTo({ top: bridgeTop + relative, left: 0, behavior: 'auto' });
    return { bridgeTop, relative, expectedLanding: hero.offsetTop + relative };
  });
  assert(target, `${label} cycle ${cycle} has no visual bridge target`);
  await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, before.loopCount, { timeout: 7000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxLoopLandingState === 'settled', null, { timeout: 5000 });
  await page.waitForTimeout(220);
  const after = await state(page);
  assert(after.loopCount === before.loopCount + 1, `${label} cycle ${cycle} did not transfer exactly once: ${JSON.stringify({ before, target, after })}`);
  assert(/^visual-bridge-/.test(after.loopSource), `${label} cycle ${cycle} did not use seamless-v7 visual bridge: ${JSON.stringify(after)}`);
  assert(!/^heart-core-/.test(after.loopSource), `${label} cycle ${cycle} was incorrectly routed through retired heart-core scrolling: ${JSON.stringify(after)}`);
  assert(Math.abs(after.scrollY - target.expectedLanding) <= 12, `${label} cycle ${cycle} did not preserve visual relative landing: ${JSON.stringify({ target, after })}`);
  assert(Math.abs(after.landing - target.expectedLanding) <= 12, `${label} cycle ${cycle} recorded wrong seamless landing: ${JSON.stringify({ target, after })}`);
}

async function verifyMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, locale: 'hu-HU', hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: 'dark' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await prepare(page);
  const initial = await state(page);
  assert(initial.controller === 'seamless-v7', `mobile seamless controller missing: ${JSON.stringify(initial)}`);
  assert(initial.heart === 'ready', `mobile heart core not ready: ${JSON.stringify(initial)}`);
  assert(initial.heartPolicy === 'seamless-v7-single-owner-interaction-only', `mobile heart ownership policy missing: ${JSON.stringify(initial)}`);
  assert(initial.heartScrollOwner === 'retired-r508-seamless-v7', `legacy heart scroll ownership returned: ${JSON.stringify(initial)}`);
  assert(initial.bridgeCount === 1 && initial.mirrorCount === 1, `mobile seamless inert mirror missing: ${JSON.stringify(initial)}`);
  assert(initial.mirrorInert && initial.mirrorAriaHidden === 'true' && initial.mirrorFocusable === 0, `mobile reference mirror is not inert: ${JSON.stringify(initial)}`);
  assert(initial.runtime?.inertReferenceMirror === true && initial.runtime?.mirrorContext === 'static-2d-snapshot-no-webgl', `mobile seamless mirror runtime contract missing: ${JSON.stringify(initial)}`);
  assert(initial.bridgeDisplay !== 'none' && initial.bridgeHeight > 40, `mobile visual bridge is unavailable: ${JSON.stringify(initial)}`);
  assert(initial.hitExists && initial.hitWidth >= 180 && initial.hitHeight >= 180 && initial.hitLabel.length > 8, `mobile MAG semantic keyboard target is missing: ${JSON.stringify(initial)}`);
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', `mobile scroll snapping active: ${JSON.stringify(initial)}`);
  assert(initial.overflow <= 2, `mobile horizontal overflow: ${JSON.stringify(initial)}`);

  await verifyHeartInteraction(page, 'mobile');
  await runLoopCycle(page, 'mobile', 1);
  await runLoopCycle(page, 'mobile', 2);

  const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
  assert(!meaningful.length, `mobile browser errors: ${meaningful.join(' | ')}`);
  console.log('PASS r526 mobile seamless-v7 loop ownership + stable post-Organism geometry + visible MAG interaction');
  await context.close();
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark' });
  const page = await context.newPage();
  await prepare(page);
  const initial = await state(page);
  assert(initial.controller === 'seamless-v7', `desktop seamless controller missing: ${JSON.stringify(initial)}`);
  assert(initial.bridgeCount === 1 && initial.mirrorCount === 1, `desktop inert reference mirror contract changed: ${JSON.stringify(initial)}`);
  assert(initial.mirrorInert && initial.mirrorFocusable === 0, `desktop reference mirror is interactive: ${JSON.stringify(initial)}`);
  assert(initial.hitExists && initial.hitWidth >= 180 && initial.hitHeight >= 180, `desktop MAG semantic keyboard target missing: ${JSON.stringify(initial)}`);
  assert(initial.overflow <= 2, `desktop horizontal overflow: ${JSON.stringify(initial)}`);
  await verifyHeartInteraction(page, 'desktop');
  await runLoopCycle(page, 'desktop', 1);
  console.log('PASS desktop seamless-v7 preserved + stable post-Organism geometry + visible MAG interaction');
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await verifyMobile(browser);
    await verifyDesktop(browser);
    console.log('PASS FormatX r526 single-owner platform scroll, stable bridge geometry and living MAG interaction contract');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error?.stack || error);
  process.exit(1);
});
