const fs = require('node:fs');
const { chromium } = require('playwright');

const baseUrl = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4182/scifi-ui/index.html';
const report = { baseUrl, desktop: {}, mobile: {}, errors: [] };

async function exercise(page, label) {
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
  await page.locator('[data-fx-live-os-launcher]').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('[data-fx-live-os-launcher]').click();
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
    return stage && ['ready', 'error'].includes(stage.dataset.state);
  }, null, { timeout: 45000 });

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
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      launcherVisible: Boolean(document.querySelector('[data-fx-live-os-launcher]'))
    };
  });

  if (result.metrics !== 8) throw new Error(`${label}: expected 8 diagnostics metrics`);
  if (result.proofCards !== 4) throw new Error(`${label}: expected 4 evidence cards`);
  if (result.threeState !== 'ready') throw new Error(`${label}: functional Three.js map did not start (${result.threeState})`);
  if (result.horizontalOverflow) throw new Error(`${label}: horizontal overflow detected`);
  if (errors.length) throw new Error(`${label}: browser errors: ${errors.join(' | ')}`);

  await live.screenshot({ path: `live-os-${label}.png` });
  return result;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
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
