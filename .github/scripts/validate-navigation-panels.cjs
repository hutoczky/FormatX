'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';
const scriptUrl = name => new URL('./scripts/' + name, TEST_URL).href;

async function installProductionShell(page) {
  await page.addScriptTag({ url: scriptUrl('single-language-toggle.js?v=ci-r247') });
  await page.addScriptTag({ url: scriptUrl('formatx-infinite-scroll.js?v=ci-r247') });
}

async function clearIntro(page) {
  const skip = page.locator('.fx-intro-skip');
  if (await skip.count()) await skip.evaluate(node => node.click()).catch(() => {});
  await page.evaluate(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function waitForScrollShell(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.classList.contains('fx-intro-complete')
      && root.dataset.fxSingleLanguageToggle === 'ready'
      && root.dataset.fxInfiniteController === 'seamless-v7'
      && root.dataset.fxInfiniteScroll === 'ready-seamless-v7'
      && root.dataset.fxInfiniteInput === 'native'
      && root.dataset.fxAutomaticLoop === 'enabled'
      && root.dataset.fxLoopBridge === 'ready-v3'
      && ['ready', 'desktop'].includes(root.dataset.fxReferenceProductionR244)
      && ['reference-frame-r244', 'desktop-reference-r244'].includes(root.dataset.fxReferenceComposition);
  }, null, { timeout: 45000 });
}

async function activateAndWaitForInterface(page) {
  const referenceMenu = page.locator('.fx-reference-menu-button');
  await referenceMenu.waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const controls = document.querySelector('#hero .fx-reference-controls-r204');
    return root.dataset.fxControlOwnerR268 === 'ready'
      && root.dataset.fxCurrentMagRuntimeR422 === 'ready'
      && Boolean(document.querySelector('#hero .fx-crystal-organism-r326-stage'))
      && Boolean(controls?.querySelector('.fx-three-sound'))
      && Boolean(controls?.querySelector('.fx-reference-ask'))
      && !controls?.querySelector('.fx-reference-pause');
  }, null, { timeout: 60000 });
}

async function assertSingleLanguageToggle(page) {
  const toggle = page.locator('.fx-language-toggle');
  if (await toggle.count() !== 1) throw new Error('Exactly one visible language toggle is required');
  await toggle.waitFor({ state: 'visible' });
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await toggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'hu');
}

async function openMenu(page) {
  await page.locator('.fx-reference-menu-button').click();
  await page.waitForFunction(() => {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    return toggle?.getAttribute('aria-expanded') === 'true'
      && nav?.classList.contains('open')
      && document.documentElement.classList.contains('fx-organism-menu-open');
  }, null, { timeout: 8000 });
}

async function assertSectionNavigation(page, href) {
  await openMenu(page);
  await page.locator(`#main-nav a[href="${href}"]`).click();
  try {
    await page.waitForFunction(target => {
      const node = document.querySelector(target);
      if (!(node instanceof HTMLElement)) return false;
      const r = node.getBoundingClientRect();
      const nav = document.getElementById('main-nav');
      return r.bottom > 80 && r.top < innerHeight * .72
        && !nav?.classList.contains('open')
        && document.documentElement.dataset.fxSectionNavigationSettledR581 === target;
    }, href, { timeout: 12000 });
  } catch (error) {
    const diag = await page.evaluate(target => {
      const node = document.querySelector(target);
      const nav = document.getElementById('main-nav');
      const r = node?.getBoundingClientRect?.();
      return {
        target,
        rect:r?{top:r.top,bottom:r.bottom,height:r.height}:null,
        scrollY,
        innerHeight,
        scrollHeight:document.documentElement.scrollHeight,
        navOpen:nav?.classList.contains('open')||false,
        menuExpanded:document.getElementById('menu-toggle')?.getAttribute('aria-expanded')||'',
        rootMenu:document.documentElement.classList.contains('fx-organism-menu-open'),
        hash:location.hash,
        r581:document.documentElement.dataset.fxSectionNavigationR581||'',
        settledR581:document.documentElement.dataset.fxSectionNavigationSettledR581||'',
        loopState:document.documentElement.dataset.fxLoopLandingState||'',
        loopSource:document.documentElement.dataset.fxLoopSource||'',
        loopCount:document.documentElement.dataset.fxLoopCount||'0',
        transfer:document.documentElement.classList.contains('fx-seamless-loop-transfer')
      };
    }, href);
    throw new Error(`Section navigation diagnostic ${href}: ${JSON.stringify(diag)} :: ${error.message}`);
  }
}

async function assertCore(page) {
  await page.locator('#hero').evaluate(node => node.scrollIntoView({block:'start',behavior:'instant'}));
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return Boolean(document.querySelector('#hero .fx-crystal-organism-r326-stage'))
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && document.querySelectorAll('#hero .fx-reference-pause').length === 0;
  }, null, { timeout: 12000 });
}

async function assertStableOrdinaryScroll(page, mobile = false) {
  const before = await page.evaluate(() => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    return {
      bridgeTop: bridge?.offsetTop || 0,
      loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
      viewport: innerHeight,
    };
  });
  const safeMaximum = Math.max(0, before.bridgeTop - before.viewport - 180);
  const target = Math.round(safeMaximum * .76);
  await page.evaluate(y => window.scrollTo(0, y), target);
  await page.waitForTimeout(650);
  const after = await page.evaluate(() => ({
    y: window.scrollY,
    loopCount: Number(document.documentElement.dataset.fxLoopCount || 0),
    loopSource: document.documentElement.dataset.fxLoopSource || '',
    landing: Number(document.documentElement.dataset.fxLoopLanding || 0),
    landingState: document.documentElement.dataset.fxLoopLandingState || '',
    actualBridgeTop: document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]')?.offsetTop || 0,
    gestureBridgeTop: Number(document.documentElement.dataset.fxLoopGestureBridgeTopR1727 || 0),
    gestureRelative: Number(document.documentElement.dataset.fxLoopGestureRelativeR1727 || 0),
    gestureGeometry: document.documentElement.dataset.fxLoopGestureGeometryR1727 || '',
    desktopRecovery: document.documentElement.dataset.fxLoopDesktopRecoveryR1724 || '',
    scrollEndRecovery: document.documentElement.dataset.fxLoopDesktopScrollEndRecoveryR1724 || '',
    bridges: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
    mirrors: document.querySelectorAll('[data-fx-loop-mirror]').length,
    mirrorFocusable: document.querySelector('[data-fx-loop-mirror]')?.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').length || 0,
    automatic: document.documentElement.dataset.fxAutomaticLoop,
    jumpGuard: document.documentElement.dataset.fxScrollJumpGuard,
    transfer: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
    rootSnap: getComputedStyle(document.documentElement).scrollSnapType,
    mirrorMode: document.documentElement.dataset.fxLoopMirrorMode || '',
    heartCore: document.documentElement.dataset.fxHeartCoreR252 || '',
    heartPolicy: document.documentElement.dataset.fxHeartLoopPolicy || '',
  }));
  if (Math.abs(after.y - target) > 6) throw new Error(`Ordinary page position changed away from the loop boundary: ${JSON.stringify({ target, after })}`);
  if (after.loopCount !== before.loopCount) throw new Error(`Loop counter changed away from the visual bridge: ${JSON.stringify({ before, after })}`);
  const mirrorContract = mobile
    ? after.mirrors === 0 && after.mirrorMode === 'none-mobile-r252' && after.heartCore === 'ready' && after.heartPolicy === 'footer-to-real-core-no-reference-mirror'
    : after.mirrors === 1;
  if (after.bridges !== 1 || !mirrorContract || after.mirrorFocusable !== 0 || after.transfer) throw new Error(`Seamless inert bridge state invalid during normal navigation: ${JSON.stringify(after)}`);
  if (after.automatic !== 'enabled' || after.jumpGuard !== 'visual-match-v4' || after.runtime?.automaticLoop !== true || after.runtime?.mobileNativeMomentumPreserved !== true) {
    throw new Error(`Seamless-v7 navigation contract missing: ${JSON.stringify(after)}`);
  }
  if (after.rootSnap !== 'none') throw new Error(`Section snap returned during normal navigation: ${JSON.stringify(after)}`);
}

async function assertTwoLoopCycles(page, name) {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    document.body.style.setProperty('scroll-behavior', 'auto', 'important');
  });
  for (let cycle = 1; cycle <= 2; cycle += 1) {
    await page.waitForFunction(() => {
      const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
      return document.documentElement.dataset.fxLoopBridge === 'ready-v3'
        && bridge instanceof HTMLElement
        && bridge.offsetHeight > 40;
    }, null, { timeout: 12000 });

    const before = await page.evaluate(() => {
      const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
      const hero = document.querySelector('#main-content > #hero');
      const relative = Math.max(48, Math.min(innerHeight * .24, Math.max(48, hero.offsetHeight - 12)));
      const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
      const documentEnd=Math.max(0,document.documentElement.scrollHeight-innerHeight);
      const target=Math.min(bridge.offsetTop+relative,documentEnd);
      const reachableRelative=Math.max(0,target-bridge.offsetTop);
      return {
        count: Number(document.documentElement.dataset.fxLoopCount || 0),
        target,
        requestedRelative:relative,
        reachableRelative,
        expectedLanding: mobile ? hero.offsetTop : hero.offsetTop + reachableRelative,
        documentEnd,
        mobile,
      };
    });

    await page.evaluate(target => window.scrollTo({ top: target, left: 0, behavior: 'auto' }), before.target);
    try {
      await page.waitForFunction(expected => (
        Number(document.documentElement.dataset.fxLoopCount || 0) === expected
        && document.documentElement.dataset.fxInfiniteInput === 'native'
        && ['settled','heart-core-settled'].includes(document.documentElement.dataset.fxLoopLandingState)
        && !document.documentElement.classList.contains('fx-seamless-loop-transfer')
      ), before.count + 1, { timeout: 12000 });
    } catch (error) {
      const diag = await page.evaluate(() => ({
        y: scrollY,
        end: Math.max(0, document.documentElement.scrollHeight-innerHeight),
        count: Number(document.documentElement.dataset.fxLoopCount || 0),
        input: document.documentElement.dataset.fxInfiniteInput || '',
        landingState: document.documentElement.dataset.fxLoopLandingState || '',
        loopSource: document.documentElement.dataset.fxLoopSource || '',
        bridgeState: document.documentElement.dataset.fxLoopBridge || '',
        bridgeTop: document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]')?.offsetTop || 0,
        sectionActive: document.documentElement.classList.contains('fx-section-navigation-active'),
        sectionSettled: document.documentElement.dataset.fxSectionNavigationSettledR581 || '',
        menuOpen: document.documentElement.classList.contains('fx-organism-menu-open'),
        introRunning: document.documentElement.classList.contains('fx-intro-running'),
        panelOpen: document.body.classList.contains('fx-organism-panel-open'),
        pageScrolling: document.documentElement.classList.contains('fx-page-scrolling'),
        transfer: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
        pendingPolicy: document.documentElement.dataset.fxLoopEndIntentPolicyR1724 || '',
        endIntent: document.documentElement.dataset.fxLoopEndIntentR1724 || '',
        desktopRecovery: document.documentElement.dataset.fxLoopDesktopRecoveryR1724 || '',
        scrollEndRecovery: document.documentElement.dataset.fxLoopDesktopScrollEndRecoveryR1724 || '',
        gestureRelative: document.documentElement.dataset.fxLoopGestureRelativeR1727 || '',
        gestureGeometry: document.documentElement.dataset.fxLoopGestureGeometryR1727 || ''
      }));
      throw new Error(`${name}: loop cycle ${cycle} timeout: ${JSON.stringify({before,diag})} :: ${error.message}`);
    }

    const after = await page.evaluate(() => ({
      count: Number(document.documentElement.dataset.fxLoopCount || 0),
      y: window.scrollY,
      landing: Number(document.documentElement.dataset.fxLoopLanding || NaN),
      source: document.documentElement.dataset.fxLoopSource,
      bridges: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
      mirrors: document.querySelectorAll('[data-fx-loop-mirror]').length,
    }));
    if (after.count !== before.count + 1
      || Math.abs(after.y - before.expectedLanding) > 8
      || Math.abs(after.landing - before.expectedLanding) > 8
      || after.bridges !== 1
      || after.mirrors !== (before.mobile ? 0 : 1)) {
      throw new Error(`${name}: loop cycle ${cycle} failed: ${JSON.stringify({ before, after })}`);
    }
    await page.waitForTimeout(500);
  }
}

async function preparePage(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
  await installProductionShell(page);
  await clearIntro(page);
  await waitForScrollShell(page);
  await activateAndWaitForInterface(page);
}

async function testDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);

  await assertSectionNavigation(page, '#experience');
  await assertSectionNavigation(page, '#pricing');
  await assertSectionNavigation(page, '#system');

  await assertStableOrdinaryScroll(page, false);
  await assertTwoLoopCycles(page, 'desktop');
  await page.close();
}

async function testMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);

  await assertSectionNavigation(page, '#capabilities');
  await assertSectionNavigation(page, '#experience');

  await assertStableOrdinaryScroll(page, true);
  await assertTwoLoopCycles(page, 'mobile');
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testDesktop(browser);
    await testMobile(browser);
    console.log('PASS FormatX language toggle, current section navigation, SOUND+ASK core and seamless-v7 ordinary scrolling');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
