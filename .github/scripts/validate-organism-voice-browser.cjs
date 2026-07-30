'use strict';

const { chromium } = require('playwright');

const baseUrl = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function overlaps(a, b, tolerance = 2) {
  if (!a || !b) return false;
  return !(
    a.x + a.width <= b.x + tolerance
    || b.x + b.width <= a.x + tolerance
    || a.y + a.height <= b.y + tolerance
    || b.y + b.height <= a.y + tolerance
  );
}

async function waitForReady(page) {
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismVoice === 'ready-v2', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 15000 });
}

async function validateViewport(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.removeItem('formatx-organism-dialogue-enabled'));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);

  const trigger = page.locator('.fx-organism-thought-trigger');
  const bubble = page.locator('.fx-organism-thought');
  const heroCopy = page.locator('#hero .hero-copy');
  await trigger.waitFor({ state: 'visible' });
  assert(await bubble.isHidden(), `${name}: thought bubble must start closed`);
  assert(await trigger.getAttribute('aria-expanded') === 'false', `${name}: trigger must start collapsed`);

  const [triggerBox, heroBox] = await Promise.all([trigger.boundingBox(), heroCopy.boundingBox()]);
  assert(!overlaps(triggerBox, heroBox), `${name}: compact thought trigger overlaps hero copy`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `${name}: Organism dialogue causes horizontal overflow (${overflow}px)`);

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  const bubbleBox = await bubble.boundingBox();
  assert(bubbleBox && bubbleBox.x >= -1 && bubbleBox.y >= -1, `${name}: dialogue leaves viewport at top or left`);
  assert(bubbleBox.x + bubbleBox.width <= viewport.width + 1, `${name}: dialogue leaves viewport horizontally`);
  assert(bubbleBox.y + bubbleBox.height <= viewport.height + 1, `${name}: dialogue leaves viewport vertically`);
  assert((await page.locator('.fx-organism-thought-output').textContent()).trim().length > 20, `${name}: welcome response is missing`);

  await page.locator('#fx-organism-question-input').fill('Mennyibe kerül?');
  await page.locator('.fx-organism-question').evaluate(form => form.requestSubmit());
  await page.waitForFunction(() => document.querySelector('.fx-organism-thought-output')?.textContent.includes('7 900'));

  const languageToggle = page.locator('.fx-language-toggle');
  await languageToggle.click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.locator('#fx-organism-question-input').fill('What is the price?');
  await page.locator('.fx-organism-question').evaluate(form => form.requestSubmit());
  await page.waitForFunction(() => document.querySelector('.fx-organism-thought-output')?.textContent.includes('7,900'));
  assert((await page.locator('.fx-organism-privacy').textContent()).includes('no data is sent'), `${name}: local-only privacy copy did not switch to English`);

  const master = page.locator('.fx-organism-master-toggle');
  await master.click();
  await bubble.waitFor({ state: 'hidden' });
  assert(await page.locator('.fx-organism-dialogue').evaluate(node => node.classList.contains('is-disabled')), `${name}: disabled visual state missing`);
  assert(await page.evaluate(() => document.documentElement.dataset.fxOrganismDialogueEnabled) === 'false', `${name}: disabled state marker missing`);
  assert(await page.evaluate(() => localStorage.getItem('formatx-organism-dialogue-enabled')) === 'false', `${name}: disabled state not persisted locally`);

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  assert(await page.evaluate(() => document.documentElement.dataset.fxOrganismDialogueEnabled) === 'true', `${name}: trigger did not re-enable dialogue`);

  await page.locator('.fx-organism-thought-close').click();
  await bubble.waitFor({ state: 'hidden' });
  await page.locator('#menu-toggle').click();
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-organism-menu-open'));
  const menuHiddenState = await page.locator('.fx-organism-dialogue').evaluate(node => {
    const style = getComputedStyle(node);
    return { opacity: style.opacity, pointerEvents: style.pointerEvents };
  });
  assert(menuHiddenState.opacity === '0' && menuHiddenState.pointerEvents === 'none', `${name}: dialogue remains interactive under the menu`);

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await validateViewport(browser, 'desktop', { width: 1440, height: 900 }, false);
    await validateViewport(browser, 'mobile', { width: 390, height: 844 }, true);
    console.log('PASS: Organism dialogue is closed by default, readable, local and fully switchable.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});