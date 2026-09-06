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
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const heart = document.querySelector('#hero .fx-mag-heart-hit-r252');
    return root.dataset.fxOrganismInterface === 'ready'
      || (root.dataset.fxThreeLoader === 'deferred-user-activation'
        && root.dataset.fxHeartCoreR252 === 'ready'
        && heart instanceof HTMLButtonElement
        && heart.dataset.fxHeartBound === 'true');
  }, null, { timeout: 30000 });

  if (await page.evaluate(() => document.documentElement.dataset.fxOrganismInterface !== 'ready')) {
    const heart = page.locator('#hero .fx-mag-heart-hit-r252').first();
    await heart.waitFor({ state: 'visible', timeout: 10000 });
    await heart.click({ position: { x: 20, y: 20 }, timeout: 5000 });
  }

  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxOrganismInterface === 'ready'
      && root.dataset.fxOrganismMenu === 'ready'
      && root.dataset.fxOrganismCoreController === 'ready'
      && root.dataset.fxOrganismConsoleState === 'ready'
      && root.dataset.fxInteractionGenomeExport === 'ready'
      && root.dataset.fxOrganismMasterSync === 'ready-v1'
      && root.dataset.fxTranscendLoader === 'safe-ready-v28';
  }, null, { timeout: 60000 });

  if (await page.evaluate(() => document.getElementById('main-nav')?.classList.contains('open'))) {
    await page.locator('.fx-reference-menu-button').click();
  }
  await page.waitForFunction(() => !document.getElementById('main-nav')?.classList.contains('open'));
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

async function assertPanel(page, id, scene) {
  await page.waitForFunction(({ expectedId, expectedScene }) => {
    const shell = document.getElementById('fx-organism-console');
    const panel = document.querySelector(`[data-organism-panel="${expectedId}"]`);
    return Boolean(
      shell
      && !shell.hidden
      && shell.getAttribute('aria-hidden') === 'false'
      && shell.classList.contains('is-authorised-open')
      && document.body.classList.contains('fx-organism-panel-open')
      && document.documentElement.dataset.fxScene === String(expectedScene)
      && panel
      && !panel.hidden
      && panel.getAttribute('aria-hidden') === 'false'
      && panel.textContent.trim().length > 20
    );
  }, { expectedId: id, expectedScene: scene }, { timeout: 10000 });
}

async function assertCore(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const shell = document.getElementById('fx-organism-console');
    return root.dataset.fxScene === '0'
      && root.dataset.fxOrganismState === 'core'
      && root.classList.contains('fx-organism-core-active')
      && root.dataset.fxOrganismConsole === 'closed'
      && !document.body.classList.contains('fx-organism-panel-open')
      && shell?.hidden === true
      && shell?.getAttribute('aria-hidden') === 'true';
  }, null, { timeout: 12000 });
}

async function closePanelAndAssertCore(page) {
  await page.locator('.fx-organism-console-close').click();
  await assertCore(page);
  await page.waitForTimeout(250);
}

async function assertStableOrdinaryScroll(page) {
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
    bridges: document.querySelectorAll('.fx-loop-bridge[data-fx-loop-bridge]').length,
    mirrors: document.querySelectorAll('[data-fx-loop-mirror]').length,
    mirrorFocusable: document.querySelector('[data-fx-loop-mirror]')?.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').length || 0,
    automatic: document.documentElement.dataset.fxAutomaticLoop,
    jumpGuard: document.documentElement.dataset.fxScrollJumpGuard,
    transfer: document.documentElement.classList.contains('fx-seamless-loop-transfer'),
    runtime: document.documentElement.__FORMATX_INFINITE_SCROLL__ || null,
    rootSnap: getComputedStyle(document.documentElement).scrollSnapType,
  }));
  if (Math.abs(after.y - target) > 6) throw new Error(`Ordinary page position changed away from the loop boundary: ${JSON.stringify({ target, after })}`);
  if (after.loopCount !== before.loopCount) throw new Error(`Loop counter changed away from the visual bridge: ${JSON.stringify({ before, after })}`);
  if (after.bridges !== 1 || after.mirrors !== 1 || after.mirrorFocusable !== 0 || after.transfer) throw new Error(`Seamless inert bridge state invalid during normal navigation: ${JSON.stringify(after)}`);
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
      return {
        count: Number(document.documentElement.dataset.fxLoopCount || 0),
        target: bridge.offsetTop + relative,
        expectedLanding: hero.offsetTop + relative,
      };
    });

    await page.evaluate(target => window.scrollTo({ top: target, left: 0, behavior: 'auto' }), before.target);
    await page.waitForFunction(expected => (
      Number(document.documentElement.dataset.fxLoopCount || 0) === expected
      && document.documentElement.dataset.fxInfiniteInput === 'native'
      && document.documentElement.dataset.fxLoopLandingState === 'settled'
      && !document.documentElement.classList.contains('fx-seamless-loop-transfer')
    ), before.count + 1, { timeout: 12000 });

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
      || after.mirrors !== 1) {
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

  /* R534+: the seamless runtime is intentionally outside navigation startup.
     A real wheel input arms it; all previous shell, panel and two-cycle checks remain. */
  await page.mouse.wheel(0, 48);
  await waitForScrollShell(page);
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  await activateAndWaitForInterface(page);
}

async function testDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#experience"]').click();
  await assertPanel(page, 'experience', 1);
  await closePanelAndAssertCore(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#pricing"]').click();
  await assertPanel(page, 'pricing', 3);
  await closePanelAndAssertCore(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#system"]').click();
  await assertPanel(page, 'system', 4);
  await closePanelAndAssertCore(page);

  await assertStableOrdinaryScroll(page);
  await assertTwoLoopCycles(page, 'desktop');
  await page.close();
}

async function testMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await preparePage(page);
  await assertSingleLanguageToggle(page);
  await assertCore(page);

  await openMenu(page);
  await page.locator('#main-nav a[href="#capabilities"]').click();
  await assertPanel(page, 'capabilities', 2);
  await closePanelAndAssertCore(page);

  await page.locator('.scroll-cue').evaluate(node => node.click());
  await assertPanel(page, 'experience', 1);
  await closePanelAndAssertCore(page);

  await assertStableOrdinaryScroll(page);
  await assertTwoLoopCycles(page, 'mobile');
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testDesktop(browser);
    await testMobile(browser);
    console.log('PASS FormatX language toggle, navigation, panels and seamless-v7 ordinary scrolling');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
