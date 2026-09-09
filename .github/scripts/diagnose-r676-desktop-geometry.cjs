'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';
const CHROME = process.env.CHROME_BIN;
const ARGS = ['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'];

async function activateImmersive(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const hit = document.querySelector('.fx-mag-heart-hit-r252');
    return root.dataset.fxOrganismInterface === 'ready'
      || (root.dataset.fxThreeLoader === 'deferred-user-activation'
        && root.dataset.fxHeartCoreR252 === 'ready'
        && hit instanceof HTMLButtonElement
        && hit.dataset.fxHeartBound === 'true');
  }, null, { timeout: 30000 });
  if (await page.evaluate(() => document.documentElement.dataset.fxOrganismInterface === 'ready')) return;
  const heart = page.locator('.fx-mag-heart-hit-r252').first();
  await heart.waitFor({ state: 'visible', timeout: 10000 });
  const box = await heart.boundingBox();
  if (!box) throw new Error('R702 missing trusted MAG hit geometry');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismInterface === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismMenu === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(120);
}

async function waitSemanticMagReady(page) {
  await page.waitForFunction(() => {
    const root = document.documentElement;
    const canvas = document.querySelector('#hero .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas');
    return root.dataset.fxCrystalOrganismR326 === 'ready'
      && root.dataset.fxMagShapeSyncR476 === 'ready-r634'
      && root.dataset.fxCoreRenderer === 'single-webgl-crystal-organism-r326'
      && canvas instanceof HTMLElement;
  }, null, { timeout: 45000 });
  await page.waitForTimeout(350);
}

async function snapshot(page, label) {
  return page.evaluate(labelValue => {
    const root = document.documentElement;
    const body = document.body;
    const width = innerWidth;
    const height = innerHeight;
    const rect = node => {
      const r = node.getBoundingClientRect();
      return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
    };
    const visible = node => {
      const s = getComputedStyle(node);
      return s.display !== 'none' && s.visibility !== 'hidden' && Number.parseFloat(s.opacity || '1') > 0;
    };
    const offenders = [];
    for (const node of document.querySelectorAll('body *')) {
      if (!(node instanceof HTMLElement || node instanceof SVGElement)) continue;
      const r = node.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const leftOverflow = Math.max(0, -r.left);
      const rightOverflow = Math.max(0, r.right - width);
      if (leftOverflow <= 1 && rightOverflow <= 1) continue;
      const s = getComputedStyle(node);
      offenders.push({
        tag: node.tagName,
        id: node.id || '',
        className: typeof node.className === 'string' ? node.className : String(node.className?.baseVal || ''),
        rect: { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height },
        overflow: { left:leftOverflow, right:rightOverflow },
        visible: visible(node),
        position: s.position,
        display: s.display,
        visibility: s.visibility,
        opacity: s.opacity,
        transform: s.transform,
        translate: s.translate,
        width: s.width,
        maxWidth: s.maxWidth,
        overflowX: s.overflowX,
        contain: s.contain,
        contentVisibility: s.contentVisibility,
        zIndex: s.zIndex,
      });
    }
    offenders.sort((a,b) => Math.max(b.overflow.left,b.overflow.right) - Math.max(a.overflow.left,a.overflow.right));
    const pseudo = (node, which) => {
      const s = getComputedStyle(node, which);
      return { content:s.content, display:s.display, position:s.position, left:s.left, right:s.right, width:s.width, transform:s.transform, translate:s.translate, overflow:s.overflow, visibility:s.visibility, opacity:s.opacity };
    };
    const fallbackScript = document.querySelector('script[data-fx-r571-fallback]');
    const stage = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    const canvas = stage?.querySelector('.fx-crystal-organism-r326-canvas');
    return {
      label: labelValue,
      now: performance.now(),
      viewport: { width, height },
      scroll: { html:root.scrollWidth, body:body.scrollWidth, overflow:Math.max(root.scrollWidth,body.scrollWidth)-width },
      datasets: {
        preloader:root.dataset.fxPreloaderR531 || '',
        preloaderRelease:root.dataset.fxPreloaderReleaseR531 || '',
        preloaderReleaseElapsed:root.dataset.fxPreloaderReleaseElapsedR635 || '',
        organism:root.dataset.fxOrganismInterface || '',
        thought:root.dataset.fxOrganismThought || '',
        crystal:root.dataset.fxCrystalOrganismR326 || '',
        coreReal3d:root.dataset.fxCoreReal3d || '',
        shapeSync:root.dataset.fxMagShapeSyncR476 || '',
        renderer:root.dataset.fxCoreRenderer || '',
        contextPolicy:root.dataset.fxMagContextPolicyR561 || '',
        offscreen564:root.dataset.fxMagOffscreenR564 || '',
        offscreen571:root.dataset.fxMagOffscreenR571 || '',
        transport598:root.dataset.fxMagOffscreenTransportR598 || '',
        workerInitAt:root.dataset.fxMagWorkerInitAtR565 || '',
        shaderCompile550:root.dataset.fxCoreShaderCompileR550 || '',
        shaderCompile558:root.dataset.fxCoreShaderCompileR558 || '',
        shaderCompile563:root.dataset.fxCoreShaderCompileR563 || '',
        currentMagRequest:root.dataset.fxCurrentMagRequestR530 || '',
        coreMobile55:root.dataset.fxCoreMobileV55 || '',
        coreMobile69:root.dataset.fxCoreMobileV69 || '',
        coreActive:root.classList.contains('fx-organism-core-active'),
        scrollBootstrap:root.dataset.fxScrollBootstrapRevision || '',
        desktopStableBoundary:root.dataset.fxDesktopStableBoundary || '',
      },
      magDom: {
        stageExists: stage instanceof HTMLElement,
        canvasExists: canvas instanceof HTMLCanvasElement,
        fallbackScript: fallbackScript instanceof HTMLScriptElement,
        fallbackSrc: fallbackScript instanceof HTMLScriptElement ? fallbackScript.src : '',
        stageRevision: stage instanceof HTMLElement ? stage.dataset.revision || '' : '',
      },
      classes: { html:root.className, body:body.className },
      bodyRect: rect(body),
      htmlBefore:pseudo(root,'::before'), htmlAfter:pseudo(root,'::after'),
      bodyBefore:pseudo(body,'::before'), bodyAfter:pseudo(body,'::after'),
      offenders:offenders.slice(0,40),
    };
  }, label);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ARGS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const skip = page.locator('.fx-intro-skip');
    if (await skip.isVisible().catch(() => false)) await skip.click({ force: true, timeout: 1500 }).catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 30000 });
    await activateImmersive(page);
    const early = await snapshot(page, 'organism-interface-ready');
    console.log('R719_DESKTOP_GEOMETRY_EARLY');
    console.log(JSON.stringify(early, null, 2));

    try {
      await waitSemanticMagReady(page);
    } catch (error) {
      const stalled = await snapshot(page, 'semantic-mag-timeout');
      console.log('R719_DESKTOP_MAG_STALLED');
      console.log(JSON.stringify(stalled, null, 2));
      throw error;
    }
    const semantic = await snapshot(page, 'semantic-mag-ready');
    console.log('R719_DESKTOP_GEOMETRY_SEMANTIC_MAG_READY');
    console.log(JSON.stringify(semantic, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});