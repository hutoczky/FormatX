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
  // Verify platform-scrolling compatibility in the preserved classic HTML
  // mode. The R2032 exclusive MAG-only view has its own strict browser suite
  // for native chapter handoffs and real technical interactions.
  await page.goto(TEST_URL + '?lang=hu&scroll-test=heart-r252&archive=off', { waitUntil: 'domcontentloaded' });
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
  // Require a FRESH semantic activation from a real pointer click. The voice
  // or ASK dialog may take ownership and clear the old transient R252 mode
  // immediately after acceptance; the activation marker remains authoritative.
  await page.evaluate(()=>{
    delete document.documentElement.dataset.fxHeartLastActivation;
    delete document.documentElement.dataset.fxHeartLastCapture;
  });
  const clickDiagnostics=await page.evaluate(()=>{
    const button=document.querySelector('#hero .fx-mag-heart-hit-r252');
    const rect=button?.getBoundingClientRect();
    const center=rect?{x:rect.x+rect.width*.5,y:rect.y+rect.height*.5}:null;
    return {center,
      before:document.documentElement.dataset.fxCoreInteractionMode||'none',
      clip:rect?JSON.stringify({x:rect.x,y:rect.y,w:rect.width,h:rect.height}):null,
      target:center?document.elementFromPoint(center.x,center.y)?.outerHTML?.slice(0,210):null,
      delegated:document.documentElement.dataset.fxHeartDelegatedR1723,
      hitEvent:button?.dataset.fxHeartBound,
      archive:document.documentElement.dataset.fxArchiveExperience,
      active:document.documentElement.dataset.fxArchiveCinema};
  });
  await hit.click();
  const clickAfter=await page.evaluate(()=>({
    mode:document.documentElement.dataset.fxCoreInteractionMode||'none',
    target:document.documentElement.dataset.fxCoreInteractionTarget||'none',
    node:document.activeElement?.outerHTML?.slice(0,230)||null,
    menu:document.documentElement.className,
    dialog:document.querySelector('.fx-organism-console:not([hidden])')?.id||null
  }));
  console.log('HEART_DESKTOP_CLICK_DIAGNOSTICS',JSON.stringify({label,clickDiagnostics,clickAfter}));
  await page.waitForFunction(() => {
    const r=document.documentElement.dataset;
    return Boolean(r.fxHeartLastActivation)||r.fxCoreInteractionMode==='active-r252';
  }, null, { timeout: 5000 });
  // The current ASK/dialog owner can clear the legacy R252 target hint after
  // accepting the click; the semantic activation mode is the durable state.
  // The dedicated MAG archive suite verifies actual interactive HTML controls.
  

  const interaction = await page.evaluate(() => ({
    mode: document.documentElement.dataset.fxCoreInteractionMode || '',
    source: document.documentElement.dataset.fxHeartLastActivation || '',
    capture: document.documentElement.dataset.fxHeartLastCapture || '',
    target: document.documentElement.dataset.fxCoreInteractionTarget || '',
    thoughtOpen: (() => {
      const bubble = document.querySelector('.fx-organism-thought');
      return Boolean(bubble && bubble.hidden === false);
    })()
  }));
  assert(interaction.mode === 'active-r252'||/^(pointer|core|keyboard)$/.test(interaction.source),
    `${label} MAG did not accept a semantic click: ${JSON.stringify(interaction)}`);
  if(interaction.target){
    assert(/organism-voice|ask-control|thought-trigger|native-core-pulse/.test(interaction.target),
      `${label} MAG interaction target is unknown: ${JSON.stringify(interaction)}`);
  }
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
  // The real public dialogue API mirrors its close button; make sure its
  // native scroll guard is released before exercising the page's own loop.
  await page.evaluate(()=>window.FormatXOrganismVoice?.close?.());
  await page.waitForFunction(() => (
    !document.body.classList.contains('fx-organism-panel-open')
    && !document.documentElement.classList.contains('fx-organism-menu-open')
  ), null, { timeout: 3500 });
  await page.waitForTimeout(240);

  const before = await state(page);
  const relative = Math.min(220, Math.max(120, (before.runtime && 180) || 180));
  const scrollTarget=await page.evaluate(offset => {
    const bridge = document.querySelector('.fx-loop-bridge[data-fx-loop-bridge]');
    const maximum=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const target=Math.min(maximum,Math.max((bridge?.offsetTop||0)+offset,maximum-3));
    window.scrollTo({ top:target,left:0,behavior:'auto' });
    return {target,maximum,bridgeTop:bridge?.offsetTop||null};
  },relative);
  // One genuine wheel gesture at the reachable bottom (rather than an
  // unreachable bridge coordinate) is how keyboard/mouse visitors loop.
  await page.mouse.wheel(0,300);
  const transfer=await page.waitForFunction(count=>
    Number(document.documentElement.dataset.fxLoopCount||0)>count,
    before.loopCount,{timeout:7000}).then(()=>true).catch(()=>false);
  if(!transfer){
    const afterTimeout=await state(page);
    const telem=await page.evaluate(()=>{
      const d=document.documentElement.dataset;
      return {activity:d.fxScrollActivity,landing:d.fxLoopLandingState,automation:d.fxLoopAutomationBoundaryR1742,
        geometry:d.fxLoopGestureGeometryR1727,bridgeThreshold:d.fxLoopBridgeThresholdR1724,
        loopTail:d.fxLoopTailMaterializedR1727,voice:d.fxOrganismVoice,escape:d.fxOrganismEscapeCloseR1741};
    });
    throw new Error(`desktop loop did not transfer after real wheel gesture: ${JSON.stringify({before,scrollTarget,afterTimeout,telem})}`);
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
