'use strict';

const { chromium } = require('playwright');
const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function activateImmersiveRuntime(page, source) {
  const launch = page.locator('.fx-immersive-launch').first();
  if (await launch.count() && await launch.isVisible().catch(() => false)) {
    await launch.click().catch(() => {});
    const activated = await page.waitForFunction(() => (
      document.documentElement.dataset.fxThreeLoader === 'requested-on-demand'
      || Boolean(document.querySelector('script[data-fx-cryosphere-script]'))
    ), null, { timeout: 1500 }).then(() => true).catch(() => false);
    if (activated) return;
  }
  await page.evaluate(value => {
    const root = document.documentElement;
    root.dataset.fxImmersive = 'active';
    root.dataset.fxImmersiveSource = value;
    dispatchEvent(new CustomEvent('formatx:immersiveactivate', { detail: { source: value } }));
  }, source);
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxThreeLoader === 'requested-on-demand'
    || Boolean(document.querySelector('script[data-fx-cryosphere-script]'))
  ), null, { timeout: 10000 });
}

async function prepare(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  await page.goto(TEST_URL + '?lang=hu&scroll-test=heart-r252', { waitUntil: 'domcontentloaded' });
  await activateImmersiveRuntime(page, 'platform-scroll-validation');
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxInfiniteController === 'seamless-v7'
      && root.dataset.fxLoopBridge === 'ready-v3'
      && root.dataset.fxHeartCoreR252 === 'ready'
      && root.dataset.fxHeartDelegatedR1723 === 'ready';
  }, null, { timeout: 20000 });
  await page.evaluate(async () => {
    try { await document.fonts?.ready; } catch (_) {}
    dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(1200);
}

async function state(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const mirror = bridge?.querySelector('[data-fx-loop-mirror]');
    const hero = document.querySelector('#main-content > #hero');
    const hit = document.querySelector('#hero .fx-mag-heart-hit-r252');
    const stage = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const bridgeStyle = bridge ? getComputedStyle(bridge) : null;
    const hitStyle = hit ? getComputedStyle(hit) : null;
    const stageStyle = stage ? getComputedStyle(stage) : null;
    const hitRect = hit?.getBoundingClientRect();
    return {
      controller: root.dataset.fxInfiniteController || '',
      heart: root.dataset.fxHeartCoreR252 || '',
      heartPolicy: root.dataset.fxHeartLoopPolicy || '',
      mirrorMode: root.dataset.fxLoopMirrorMode || '',
      bridgeCount: bridge ? 1 : 0,
      mirrorCount: mirror ? 1 : 0,
      bridgeHeight: bridge?.offsetHeight || 0,
      bridgeTop: bridge?.offsetTop || 0,
      bridgeDisplay: bridgeStyle?.display || '',
      heroTop: hero?.offsetTop || 0,
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
      hitPointerEvents: hitStyle?.pointerEvents || '',
      stageExists: stage instanceof HTMLElement,
      stagePointerEvents: stageStyle?.pointerEvents || '',
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
    && (window.FormatXOrganismVoice?.open || document.querySelector('#hero .fx-reference-ask'))
  ), null, { timeout: 15000 });

  const hit = page.locator('#hero .fx-mag-heart-hit-r252').first();
  assert(await hit.count() === 1, `${label} MAG heart hit target missing`);
  await hit.scrollIntoViewIfNeeded();
  await hit.click();

  /* R2035: Chromium's animation-frame polling can stall when the 3D MAG is
     rendering in software. Assert the SAME semantic interaction contract
     with bounded wall-clock polling, not a synthetic click or relaxed gate. */
  try {
    await page.waitForFunction(() => {
      const root = document.documentElement;
      return root.dataset.fxCoreInteractionMode === 'active-r252'
        && Boolean(root.dataset.fxCoreInteractionTarget);
    }, null, { timeout: 5000, polling: 80 });
  } catch (error) {
    const details = await page.evaluate(() => ({
      mode: document.documentElement.dataset.fxCoreInteractionMode || null,
      target: document.documentElement.dataset.fxCoreInteractionTarget || null,
      source: document.documentElement.dataset.fxCoreInteractionSource || null,
      heartReady: document.documentElement.dataset.fxHeartDelegatedR1744 || null,
      currentScene: document.documentElement.dataset.fxCinematicSceneR536 || null,
      overlayPresent: Boolean(document.querySelector('#fx-mag-birth-prepaint-r1606')),
      hit: document.querySelector('#hero .fx-mag-heart-hit-r252')?.getBoundingClientRect().toJSON() || null
    }));
    throw new Error(`${label} MAG semantic click did not reach the canonical target: ${JSON.stringify(details)} :: ${error.message}`);
  }

  const interaction = await page.evaluate(() => ({
    mode: document.documentElement.dataset.fxCoreInteractionMode || '',
    target: document.documentElement.dataset.fxCoreInteractionTarget || '',
    thoughtOpen: (() => {
      const bubble = document.querySelector('.fx-organism-thought');
      return Boolean(bubble && bubble.hidden === false);
    })()
  }));
  assert(interaction.mode === 'active-r252', `${label} MAG did not activate core interaction: ${JSON.stringify(interaction)}`);
  assert(/organism-voice|ask-control|thought-trigger/.test(interaction.target), `${label} MAG has no canonical interaction target: ${JSON.stringify(interaction)}`);
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
  const initial = await state(page);
  assert(initial.controller === 'seamless-v7', `mobile seamless controller missing: ${JSON.stringify(initial)}`);
  assert(initial.heart === 'ready', `mobile heart core not ready: ${JSON.stringify(initial)}`);
  assert(initial.heartPolicy === 'footer-to-real-core-no-reference-mirror', `mobile heart loop policy missing: ${JSON.stringify(initial)}`);
  assert(initial.bridgeCount === 1, `mobile handoff bridge missing: ${JSON.stringify(initial)}`);
  assert(initial.mirrorCount === 0 && initial.mirrorMode === 'none-mobile-r252', `mobile fake hero mirror still exists: ${JSON.stringify(initial)}`);
  assert(initial.bridgeDisplay !== 'none', `mobile handoff bridge is hidden: ${JSON.stringify(initial)}`);
  assert(initial.bridgeHeight >= 80 && initial.bridgeHeight <= Math.max(180, initial.viewportHeight * .24), `mobile bridge is not a short handoff runway: ${JSON.stringify(initial)}`);
  assert(initial.hitExists && initial.hitWidth >= 180 && initial.hitHeight >= 180 && initial.hitLabel.length > 8, `mobile MAG is not a semantic interactive target: ${JSON.stringify(initial)}`);
  assert((!initial.stageExists || initial.stagePointerEvents === 'none') && initial.hitPointerEvents !== 'none', `mobile native MAG visual still intercepts the semantic hit target: ${JSON.stringify(initial)}`);
  assert(initial.snapRoot === 'none' && initial.snapBody === 'none', `mobile scroll snapping active: ${JSON.stringify(initial)}`);
  assert(initial.overflow <= 2, `mobile horizontal overflow: ${JSON.stringify(initial)}`);

  await verifyHeartInteraction(page, 'mobile');
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);

  for (let cycle = 0; cycle < 2; cycle += 1) {
    const before = await state(page);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'auto' }));
    await page.waitForFunction(count => Number(document.documentElement.dataset.fxLoopCount || 0) > count, before.loopCount, { timeout: 6000 });
    await page.waitForFunction(() => document.documentElement.dataset.fxLoopLandingState === 'heart-core-settled', null, { timeout: 4000 });
    await page.waitForTimeout(180);
    const after = await state(page);
    assert(after.loopCount === before.loopCount + 1, `mobile cycle ${cycle + 1} did not transfer exactly once: ${JSON.stringify({ before, after })}`);
    assert(/^heart-core-/.test(after.loopSource), `mobile cycle ${cycle + 1} did not use heart-core transfer: ${JSON.stringify(after)}`);
    assert(Math.abs(after.scrollY - after.heroTop) <= 8, `mobile cycle ${cycle + 1} did not return directly to real MAG: ${JSON.stringify(after)}`);
    assert(Math.abs(after.landing - after.heroTop) <= 8, `mobile cycle ${cycle + 1} recorded wrong MAG landing: ${JSON.stringify(after)}`);
  }

  const meaningful = errors.filter(value => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404/i.test(value));
  assert(!meaningful.length, `mobile browser errors: ${meaningful.join(' | ')}`);
  console.log('PASS r252 mobile footer → real MAG loop and MAG interaction');
  await context.close();
}

async function verifyDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark' });
  const page = await context.newPage();
  await prepare(page);
  const initial = await state(page);
  assert(initial.controller === 'seamless-v7', `desktop seamless controller missing: ${JSON.stringify(initial)}`);
  assert(initial.bridgeCount === 1 && initial.mirrorCount === 1, `desktop inert reference mirror contract changed: ${JSON.stringify(initial)}`);
  assert(initial.hitExists && initial.hitWidth >= 180 && initial.hitHeight >= 180, `desktop MAG interaction target missing: ${JSON.stringify(initial)}`);
  assert((!initial.stageExists || initial.stagePointerEvents === 'none') && initial.hitPointerEvents !== 'none', `desktop R1724 reference visual / semantic hit ownership invalid: ${JSON.stringify(initial)}`);
  assert(initial.overflow <= 2, `desktop horizontal overflow: ${JSON.stringify(initial)}`);
  await verifyHeartInteraction(page, 'desktop');
  /* Match the mobile path: scrolling is intentionally blocked while the
     organism dialogue/panel owns focus. Close it before validating the
     document-level seamless loop. */
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForFunction(() => (
    !document.body.classList.contains('fx-organism-panel-open')
    && !document.documentElement.classList.contains('fx-organism-menu-open')
  ), null, { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(200);

  const before = await state(page);
  const relative = Math.min(220, Math.max(120, (before.runtime && 180) || 180));
  // R2013: use the *reachable* physical boundary. On a native document
  // the bridge offset may exceed the scrollable limit after lazy reflow,
  // so a requested absolute y beyond the end is never actually visited.
  const boundary=await page.evaluate(offset=>{
    const root=document.documentElement;
    const bridge=document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const end=Math.max(0,root.scrollHeight-innerHeight);
    const requested=(bridge?.offsetTop||0)+offset;
    const target=Math.min(requested,end);
    window.scrollTo({top:target,left:0,behavior:'instant'});
    return{requested,target,end,bridgeTop:bridge?.offsetTop||0};
  },relative);
  try{
    await page.waitForFunction(count=>Number(document.documentElement.dataset.fxLoopCount||0)>count,before.loopCount,{timeout:8000});
  }catch(error){
    const after=await state(page);
    const recovery=await page.evaluate(()=>({
      endIntent:document.documentElement.dataset.fxLoopEndIntentR1724,
      loopLandingState:document.documentElement.dataset.fxLoopLandingState,
      desktopRecovery:document.documentElement.dataset.fxLoopDesktopRecoveryR1724,
      gestureBoundary:document.documentElement.dataset.fxLoopGestureBoundaryR1737,
      activity:document.documentElement.dataset.fxScrollActivity,
      panelOpen:document.body.classList.contains('fx-organism-panel-open'),
      sectionNavigation:document.documentElement.classList.contains('fx-section-navigation-active'),
      scrollEndRecovery:document.documentElement.dataset.fxLoopDesktopScrollEndRecoveryR1724
    }));
    throw new Error('Desktop native loop did not transfer: '+JSON.stringify({before,boundary,after,recovery})+' :: '+error.message);
  }
  await page.waitForTimeout(500);
  const after = await state(page);
  assert(after.loopCount === before.loopCount + 1, `desktop seamless loop failed: ${JSON.stringify({ before, after })}`);
  assert(!/^heart-core-/.test(after.loopSource), `desktop was incorrectly routed through mobile heart transfer: ${JSON.stringify(after)}`);
  console.log('PASS desktop seamless-v7 preserved + MAG interaction');
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await verifyMobile(browser);
    await verifyDesktop(browser);
    console.log('PASS FormatX r252 platform scroll and living MAG interaction contract');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error?.stack || error);
  process.exit(1);
});
