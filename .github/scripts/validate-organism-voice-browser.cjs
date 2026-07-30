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
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismCoreInteraction === 'ready-v1', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismSpeakingVisual === 'ready', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileReadability === 'ready', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 15000 });
}

async function validateSpeakingVisual(page, name) {
  await page.evaluate(() => { document.documentElement.dataset.fxOrganismSpeech = 'speaking'; });
  await page.waitForTimeout(120);
  const speaking = await page.locator('.fx-three-stage-shell').evaluate(node => {
    const shell = getComputedStyle(node);
    const ring = getComputedStyle(node, '::before');
    return {
      shellAnimation: shell.animationName,
      shellFilter: shell.filter,
      ringAnimation: ring.animationName,
      ringPointerEvents: ring.pointerEvents,
    };
  });
  assert(speaking.shellAnimation.includes('fx-core-speaking-light'), `${name}: 3D core light animation is not active while speaking`);
  assert(speaking.shellFilter !== 'none', `${name}: speaking state does not brighten the 3D core`);
  assert(speaking.ringAnimation.includes('fx-core-speaking-ring'), `${name}: speaking rings are not active`);
  assert(speaking.ringPointerEvents === 'none', `${name}: speaking visual blocks clicks`);

  await page.evaluate(() => { document.documentElement.dataset.fxOrganismSpeech = 'idle'; });
  await page.waitForTimeout(80);
  const idleAnimation = await page.locator('.fx-three-stage-shell').evaluate(node => getComputedStyle(node).animationName);
  assert(idleAnimation === 'none', `${name}: 3D speech animation did not stop`);
}

async function validateMobileReadability(page, viewport) {
  const actionsDisplay = await page.locator('#hero .hero-actions').evaluate(node => getComputedStyle(node).display);
  const factsDisplay = await page.locator('#hero .hero-facts').evaluate(node => getComputedStyle(node).display);
  assert(actionsDisplay === 'none', 'mobile: duplicate hero actions remain visible');
  assert(factsDisplay === 'none', 'mobile: hero fact row remains visible over the Living Core');

  const simulator = page.locator('#hero [data-fx-simulator-entry="hero"]');
  if (await simulator.count()) {
    assert(await simulator.evaluate(node => getComputedStyle(node).display) === 'none', 'mobile: duplicate project simulator hero button remains visible');
  }

  await page.locator('#fx-three-frame').waitFor({ state: 'attached', timeout: 15000 });
  const frameVisual = await page.locator('#fx-three-frame').evaluate(node => {
    const style = getComputedStyle(node);
    return { transform: style.transform, opacity: Number(style.opacity), width: node.getBoundingClientRect().width };
  });
  assert(frameVisual.transform !== 'none', 'mobile: Living Core iframe was not visually reduced');
  assert(frameVisual.opacity <= 0.9, `mobile: Living Core iframe is too opaque (${frameVisual.opacity})`);

  const thoughtBox = await page.locator('.fx-organism-thought-trigger').boundingBox();
  const genome = page.locator('.fx-genome-launcher');
  if (await genome.count() && await genome.isVisible()) {
    const genomeBox = await genome.boundingBox();
    assert(!overlaps(thoughtBox, genomeBox), 'mobile: thought and Interaction DNA controls overlap');
  }

  const actionbar = page.locator('.fx-organism-actionbar');
  if (await actionbar.count() && await actionbar.isVisible()) {
    const actionbarBox = await actionbar.boundingBox();
    assert(!overlaps(thoughtBox, actionbarBox), 'mobile: thought control overlaps the action dock');
  }

  const heroCopy = await page.locator('#hero .hero-copy').evaluate(node => {
    const style = getComputedStyle(node);
    return { background: style.backgroundColor, color: style.color, width: node.getBoundingClientRect().width };
  });
  assert(heroCopy.width <= viewport.width - 20, 'mobile: hero copy exceeds viewport width');

  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileCoreVisible === 'false', null, { timeout: 5000 });
  const stageOpacity = await page.locator('.fx-three-stage-shell').evaluate(node => Number(getComputedStyle(node).opacity));
  assert(stageOpacity === 0, `mobile: Living Core remains visible after leaving hero (${stageOpacity})`);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileCoreVisible === 'true', null, { timeout: 5000 });
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

  if (mobile) await validateMobileReadability(page, viewport);
  await validateSpeakingVisual(page, name);

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

  if (!mobile) {
    const magNode = page.locator('[data-organ-node="0"]');
    await magNode.click();
    await bubble.waitFor({ state: 'visible' });
    assert(await page.evaluate(() => document.documentElement.dataset.fxOrganismCoreActivation) === 'mag-navigation', `${name}: MAG navigation did not activate the dialogue`);
    await page.locator('.fx-organism-thought-close').click();
    await bubble.waitFor({ state: 'hidden' });
  }

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
    console.log('PASS: Organism dialogue and mobile Living Core remain readable, switchable and collision-free.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
