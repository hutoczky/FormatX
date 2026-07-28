'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4192/scifi-ui/project-simulator.html?lang=hu&reality-test=1';

async function waitForTwin(page) {
  await page.waitForFunction(() => document.documentElement.dataset.projectSimulator === 'operational-twin-v1');
  await page.waitForFunction(() => document.documentElement.dataset.fxOperationalTwinBridge === 'ready');
  await page.waitForFunction(() => document.documentElement.dataset.fxRealityFork === 'ready');
  await page.waitForSelector('#reality-fork-capsule', { state: 'visible' });
}

async function inspectLayout(page, expectedWidth) {
  const result = await page.evaluate(() => ({
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    width: innerWidth,
    feature: document.documentElement.dataset.fxRealityFork,
    bridge: document.documentElement.dataset.fxOperationalTwinBridge,
    section: Boolean(document.getElementById('reality-fork-capsule')),
    sealHeight: document.getElementById('rf-seal')?.getBoundingClientRect().height || 0,
    interventionCount: document.querySelectorAll('[data-intervention]').length
  }));
  assert.equal(result.width, expectedWidth);
  assert.ok(result.overflow <= 2, 'horizontal overflow: ' + JSON.stringify(result));
  assert.equal(result.feature, 'ready');
  assert.equal(result.bridge, 'ready');
  assert.equal(result.section, true);
  assert.ok(result.sealHeight >= 40, 'seal control too short: ' + JSON.stringify(result));
  assert.equal(result.interventionCount, 4);
  return result;
}

async function desktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'hu-HU', acceptDownloads: true });
  const page = await context.newPage();
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push('pageerror: ' + String(error)));
  page.on('console', message => { if (message.type() === 'error') diagnostics.push('console: ' + message.text()); });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await waitForTwin(page);
  const layout = await inspectLayout(page, 1440);

  await page.locator('#run-simulation').click();
  await page.waitForFunction(() => document.documentElement.dataset.simulatorState === 'complete', null, { timeout: 15000 });
  await page.locator('#rf-capture').click();
  await page.waitForFunction(() => Boolean(window.FormatXRealityFork?.getState().baseline));

  await page.locator('[data-intervention="fault"]').click();
  await page.locator('#rf-fork').click();
  await page.waitForFunction(() => window.FormatXRealityFork?.getState().branch?.outcome === 'fail-closed');

  const forkState = await page.evaluate(() => window.FormatXRealityFork.getState());
  assert.equal(forkState.delta.divergence_step, 'execute');
  assert.equal(forkState.delta.intervention, 'fault');
  assert.equal(forkState.branch.real_device_access, false);

  await page.locator('#rf-replay').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-lane="baseline"] .done').length === 5, null, { timeout: 5000 });
  const replayState = await page.evaluate(() => ({
    baselineDone: document.querySelectorAll('[data-lane="baseline"] .done').length,
    branchBlocked: document.querySelectorAll('[data-lane="branch"] .blocked').length,
    divergence: document.getElementById('rf-div-step')?.textContent || ''
  }));
  assert.equal(replayState.baselineDone, 5);
  assert.ok(replayState.branchBlocked >= 1);
  assert.match(replayState.divergence, /VÉGREHAJTÁS|EXECUTE/);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#rf-seal').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  assert.ok(downloadPath, 'capsule download path missing');
  const capsule = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  assert.equal(capsule.payload.schema, 'formatx-reality-fork-capsule-v1');
  assert.equal(capsule.payload.real_device_access, false);
  assert.equal(capsule.payload.counterfactual.outcome, 'fail-closed');
  assert.equal(capsule.proof.algorithm, 'ECDSA-P256-SHA256');
  assert.match(capsule.proof.digest_sha256, /^[a-f0-9]{64}$/);

  const verified = await page.evaluate(value => window.FormatXRealityFork.verifyCapsule(value, false), capsule);
  assert.equal(verified, true);
  const tampered = JSON.parse(JSON.stringify(capsule));
  tampered.payload.baseline.project.name += ' TAMPERED';
  const rejected = await page.evaluate(value => window.FormatXRealityFork.verifyCapsule(value, false), tampered);
  assert.equal(rejected, false);
  await page.waitForFunction(() => /ÉRVÉNYTELEN|INVALID/.test(document.getElementById('rf-verification')?.textContent || ''));

  assert.deepEqual(diagnostics, [], 'browser diagnostics: ' + diagnostics.join(' | '));
  console.log(JSON.stringify({ case: 'desktop-reality-fork', layout, replayState, capsule: { digest: capsule.proof.digest_sha256, algorithm: capsule.proof.algorithm, verified, tamperRejected: !rejected } }));
  await context.close();
}

async function mobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'hu-HU' });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await waitForTwin(page);
  const layout = await inspectLayout(page, 390);
  const controls = await page.evaluate(() => Array.from(document.querySelectorAll('[data-intervention]'), node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
  controls.forEach(control => { assert.ok(control.width >= 38); assert.ok(control.height >= 44); });
  console.log(JSON.stringify({ case: 'mobile-reality-fork', layout, controls }));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await desktop(browser);
    await mobile(browser);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
