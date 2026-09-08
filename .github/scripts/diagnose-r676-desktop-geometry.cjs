'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html?lang=hu';
const CHROME = process.env.CHROME_BIN;
const ARGS = ['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ARGS });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    const report = await page.evaluate(() => {
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
      return {
        viewport: { width, height },
        scroll: { html:root.scrollWidth, body:body.scrollWidth, overflow:Math.max(root.scrollWidth,body.scrollWidth)-width },
        datasets: {
          preloader:root.dataset.fxPreloaderR531 || '',
          organism:root.dataset.fxOrganismInterface || root.dataset.fxOrganismThought || '',
          coreActive:root.classList.contains('fx-organism-core-active'),
          scrollBootstrap:root.dataset.fxScrollBootstrapRevision || '',
          desktopStableBoundary:root.dataset.fxDesktopStableBoundary || '',
        },
        bodyRect: rect(body),
        htmlBefore:pseudo(root,'::before'), htmlAfter:pseudo(root,'::after'),
        bodyBefore:pseudo(body,'::before'), bodyAfter:pseudo(body,'::after'),
        offenders:offenders.slice(0,40),
      };
    });
    console.log('R676_DESKTOP_GEOMETRY_DIAGNOSTIC');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
