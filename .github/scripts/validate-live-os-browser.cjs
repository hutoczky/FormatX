const fs = require('node:fs');
const { chromium } = require('playwright');

const baseUrl = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4182/scifi-ui/index.html';
const report = { sha: process.env.AUDITED_SHA || '', baseUrl, desktop: {}, mobile: {}, fallback: {}, errors: [] };

async function exercise(page, label, entry = 'keyboard') {
  const errors = [];
  page.on('pageerror', error => {
    const text = String(error);
    if (/formatx-live-os|Live OS/i.test(text)) errors.push(text);
  });
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && /formatx-live-os|Live OS/i.test(text)) errors.push(text);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => {
    window.__liveOsOriginalMag = window.FormatXLivingCore?.canvas || null;
    window.__liveOsOriginalContext = __liveOsOriginalMag?.getContext('webgl2') || null;
  });
  if (entry === 'keyboard') {
    // R1666 intentionally suppresses the legacy launcher in native mode.
    // The first complete shortcut must retain its request while its owners load.
    await page.keyboard.press('Control+k');
  } else {
    // Preserve the original visible-pointer path on the real no-WebGL HTML
    // fallback, where that canonical launcher is explicitly restored.
    await page.locator('[data-fx-live-os-launcher]').waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('[data-fx-live-os-launcher]').click();
  }
  const live = page.locator('#live-operating-system');
  await live.waitFor({ state: 'visible', timeout: 30000 });

  const input = live.locator('#fx-live-command');
  await input.fill(label === 'desktop' ? 'diagnosztika' : 'diagnostics');
  await input.press('Enter');
  await page.waitForFunction(() => document.querySelectorAll('#live-operating-system [data-fx-metrics] article').length === 8);

  await input.fill(label === 'desktop' ? 'tesztek' : 'tests');
  await input.press('Enter');
  await live.locator('[data-fx-proof-panel]').waitFor({ state: 'visible' });

  const threeButton = live.locator('[data-fx-three]');
  await threeButton.click();
  await page.waitForFunction(() => {
    const stage = document.querySelector('#live-operating-system [data-fx-stage]');
    return stage && ['ready', 'fallback', 'error'].includes(stage.dataset.state);
  }, null, { timeout: 45000 });

  // Record the user's actual viewport after the real topology button click,
  // without scrolling again to reframe the whole tall command section.
  await page.screenshot({ path: `live-os-${label}${entry === 'launcher' ? '-fallback' : ''}.png` });

  const result = await page.evaluate(() => {
    const live = document.querySelector('#live-operating-system');
    const stage = live.querySelector('[data-fx-stage]');
    const root = document.documentElement;
    return {
      title: live.querySelector('[data-fx-live-title]')?.textContent || '',
      metrics: live.querySelectorAll('[data-fx-metrics] article').length,
      proofCards: live.querySelectorAll('[data-fx-proof-grid] article').length,
      threeState: stage.dataset.state,
      liveState: root.dataset.fxLiveOsState,
      loadState: root.dataset.fxLiveOsLoadState,
      fallbackLoaded: root.dataset.fxLiveOsFallback === 'v1',
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      launcherVisible: Boolean(document.querySelector('[data-fx-live-os-launcher]')),
      originTitleCount: document.querySelectorAll('[data-fx-proof-title]').length,
      originTitle: document.querySelector('.fx-origin-proof [data-fx-proof-title]')?.textContent || '',
      firstProofTitle: document.querySelector('[data-fx-proof-title]')?.textContent || '',
      liveProofTitle: live.querySelector('[data-fx-live-os-proof-title]')?.textContent || '',
      hadNativeMag: Boolean(window.__liveOsOriginalMag),
      hadNativeContext: Boolean(window.__liveOsOriginalContext),
      sameMagCanvas: !window.__liveOsOriginalMag || window.__liveOsOriginalMag === window.FormatXLivingCore?.canvas,
      sameMagContext: !window.__liveOsOriginalContext || window.__liveOsOriginalContext === window.FormatXLivingCore?.canvas?.getContext('webgl2')
    };
  });

  if (result.metrics !== 8) throw new Error(`${label}: expected 8 diagnostics metrics`);
  if (result.proofCards !== 4) throw new Error(`${label}: expected 4 evidence cards`);
  if (!['ready', 'fallback'].includes(result.threeState)) throw new Error(`${label}: neither Three.js nor Canvas topology started (${result.threeState})`);
  if (!result.fallbackLoaded) throw new Error(`${label}: fallback runtime was not loaded`);
  if (result.horizontalOverflow) throw new Error(`${label}: horizontal overflow detected`);
  if (result.originTitleCount !== 1 || !result.originTitle || result.firstProofTitle !== result.originTitle || !result.liveProofTitle) throw new Error(`${label}: the original proof and Live OS evidence headings share an owner`);
  if (entry === 'keyboard' && (!result.hadNativeMag || !result.hadNativeContext)) throw new Error(`${label}: the normal command route did not start the real native WebGL MAG`);
  if (!result.sameMagCanvas || !result.sameMagContext) throw new Error(`${label}: command navigation replaced the native MAG`);
  if (errors.length) throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);

  return result;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
  });
  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    report.desktop = await exercise(await desktopContext.newPage(), 'desktop');
    await desktopContext.close();

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    report.mobile = await exercise(await mobileContext.newPage(), 'mobile');
    await mobileContext.close();

    for (const mobile of [false, true]) {
      const label = mobile ? 'mobile' : 'desktop';
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile
      });
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (/^(?:webgl2?|experimental-webgl)$/.test(String(type))) return null;
          return original.call(this, type, ...args);
        };
      });
      try {
        report.fallback[label] = await exercise(await context.newPage(), label, 'launcher');
      } finally {
        await context.close();
      }
    }

    fs.writeFileSync('live-os-browser-report.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    report.errors.push(String(error.stack || error));
    fs.writeFileSync('live-os-browser-report.json', JSON.stringify(report, null, 2));
    throw error;
  } finally {
    await browser.close();
  }
})();
