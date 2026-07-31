'use strict';

const { chromium } = require('playwright');

const url = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForReady(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismVoice === 'ready-v3', null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxThoughtGenome === 'ready-v1', null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxThoughtDisclosure === 'ready-v1', null, { timeout: 20000 });
}

async function validateViewport(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.removeItem('formatx-organism-dialogue-enabled');
    localStorage.removeItem('formatx-thought-genome-enabled');
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);

  const trigger = page.locator('.fx-organism-thought-trigger');
  const bubble = page.locator('.fx-organism-thought');
  const details = page.locator('.fx-thought-genome-disclosure');
  const summary = details.locator('summary');
  const controls = details.locator('.fx-thought-genome-controls');
  const genomeLayer = page.locator('.fx-thought-genome-layer');

  await trigger.waitFor({ state: 'visible' });
  await genomeLayer.waitFor({ state: 'attached', timeout: 15000 });
  assert(await bubble.isHidden(), `${name}: dialogue must start closed`);

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  await details.waitFor({ state: 'visible' });
  assert(!(await details.evaluate(node => node.open)), `${name}: thought genome details must start closed`);
  assert(await controls.isHidden(), `${name}: advanced thought controls are visible before disclosure`);
  assert((await summary.locator('strong').textContent()).trim() === 'Gondolatgenom', `${name}: Hungarian disclosure label is missing`);

  const closedBox = await bubble.boundingBox();
  assert(closedBox, `${name}: dialogue has no layout box`);
  assert(closedBox.x >= -1 && closedBox.y >= -1, `${name}: closed disclosure dialogue leaves viewport`);
  assert(closedBox.x + closedBox.width <= viewport.width + 1, `${name}: closed disclosure causes horizontal overflow`);
  assert(closedBox.y + Math.min(closedBox.height, viewport.height) <= viewport.height + 1, `${name}: closed disclosure exceeds viewport`);

  await summary.click();
  await page.waitForFunction(() => document.querySelector('.fx-thought-genome-disclosure')?.open === true);
  assert(await controls.isVisible(), `${name}: advanced controls did not appear after explicit opening`);
  const openBox = await bubble.boundingBox();
  assert(openBox && openBox.x + openBox.width <= viewport.width + 1, `${name}: open disclosure causes horizontal overflow`);
  const bubbleStyle = await bubble.evaluate(node => ({
    overflowY: getComputedStyle(node).overflowY,
    maxHeight: getComputedStyle(node).maxHeight,
  }));
  assert(['auto', 'scroll'].includes(bubbleStyle.overflowY), `${name}: dialogue cannot scroll when advanced controls are open`);
  assert(bubbleStyle.maxHeight !== 'none', `${name}: dialogue has no maximum height`);

  const languageToggle = page.locator('.fx-language-toggle');
  await languageToggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert((await summary.locator('strong').textContent()).trim() === 'Thought genome', `${name}: English disclosure label is missing`);

  await page.locator('.fx-organism-thought-close').click();
  await bubble.waitFor({ state: 'hidden' });
  assert(!(await details.evaluate(node => node.open)), `${name}: disclosure remained open after dialogue close`);

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  await page.locator('.fx-organism-master-toggle').click();
  await bubble.waitFor({ state: 'hidden' });
  assert(await page.evaluate(() => document.documentElement.dataset.fxOrganismDialogueEnabled === 'false'), `${name}: Organism master switch did not disable the dialogue`);
  assert((await trigger.locator('b').textContent()).trim() === 'OFF', `${name}: disabled trigger does not show OFF`);
  await page.waitForFunction(() => {
    const layer = document.querySelector('.fx-thought-genome-layer');
    return layer && Number(getComputedStyle(layer).opacity) <= 0.01;
  }, null, { timeout: 2000 });
  const disabledGenomeOpacity = await genomeLayer.evaluate(node => Number(getComputedStyle(node).opacity));
  assert(disabledGenomeOpacity <= 0.01, `${name}: thought constellation remains visible while Organism is off (${disabledGenomeOpacity})`);

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  assert(await page.evaluate(() => document.documentElement.dataset.fxOrganismDialogueEnabled === 'true'), `${name}: trigger did not re-enable the Organism`);
  assert(!(await details.evaluate(node => node.open)), `${name}: disclosure reopened after Organism re-enable`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `${name}: disclosure creates horizontal page overflow (${overflow}px)`);

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await validateViewport(browser, 'desktop', { width: 1440, height: 900 }, false);
    await validateViewport(browser, 'mobile', { width: 390, height: 844 }, true);
    console.log('PASS: thought genome disclosure is compact, bilingual, switchable and responsive.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
