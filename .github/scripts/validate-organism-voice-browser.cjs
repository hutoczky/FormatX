'use strict';

const { chromium } = require('playwright');

const baseUrl = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installVoiceMock(page) {
  await page.addInitScript(() => {
    const voices = [
      {
        name: 'eSpeak Hungarian',
        voiceURI: 'espeak-hu',
        lang: 'hu-HU',
        localService: true,
        default: true,
      },
      {
        name: 'Microsoft Noemi Online Natural',
        voiceURI: 'Microsoft Noemi Online Natural',
        lang: 'hu-HU',
        localService: false,
        default: false,
      },
      {
        name: 'Microsoft Sonia Online Natural',
        voiceURI: 'Microsoft Sonia Online Natural',
        lang: 'en-GB',
        localService: false,
        default: false,
      },
    ];

    if (!('SpeechSynthesisUtterance' in window)) {
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        configurable: true,
        value: class SpeechSynthesisUtteranceMock {},
      });
    }

    const synth = window.speechSynthesis || {
      cancel() {},
      speak() {},
      addEventListener() {},
    };
    try {
      Object.defineProperty(synth, 'getVoices', {
        configurable: true,
        value: () => voices,
      });
    } catch (_) {}
    if (!window.speechSynthesis) {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
    }
  });
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
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismVoice === 'ready-v3', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismDock === 'ready-v2', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismCoreInteraction === 'ready-v1', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxOrganismSpeakingVisual === 'ready', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileReadability === 'ready', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileUnified === 'ready-v1', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.dataset.fxInfiniteScroll === 'ready-v4', null, { timeout: 15000 });
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-intro-complete'), null, { timeout: 15000 });
  await page.waitForTimeout(240);

  const profile = await page.evaluate(() => window.FormatXOrganismVoice?.voiceInfo?.());
  assert(profile?.name === 'Microsoft Noemi Online Natural', `Natural Hungarian voice was not selected (${profile?.name || 'none'})`);
  assert(profile?.quality === 'premium', `Natural voice quality was not classified as premium (${profile?.quality || 'none'})`);
  assert(profile?.service === 'browser-online', `Online Natural voice service was not disclosed (${profile?.service || 'none'})`);
  assert(profile?.mode === 'sentence-prosody-v3', `Natural sentence prosody is not active (${profile?.mode || 'none'})`);
}

async function visibleBox(locator) {
  if (!await locator.count() || !await locator.isVisible()) return null;
  const opacity = await locator.evaluate(node => Number(getComputedStyle(node).opacity));
  if (opacity <= 0.02) return null;
  return locator.boundingBox();
}

async function assertNoCollision(subject, others, name, phase) {
  const subjectBox = await visibleBox(subject);
  assert(subjectBox, `${name}: ${phase} subject is not visible`);
  for (const [label, locator] of others) {
    const box = await visibleBox(locator);
    if (box) assert(!overlaps(subjectBox, box), `${name}: ${phase} overlaps ${label}`);
  }
  return subjectBox;
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

async function validateContinuousLoop(page, name) {
  const before = Number(await page.evaluate(() => document.documentElement.dataset.fxLoopCount || 0));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(expected => Number(document.documentElement.dataset.fxLoopCount || 0) > expected, before, { timeout: 7000 });
  await page.waitForFunction(() => window.scrollY < 50, null, { timeout: 5000 });
  await page.waitForFunction(() => !document.documentElement.classList.contains('fx-page-scrolling'), null, { timeout: 3000 });
  const contract = await page.evaluate(() => ({
    controller: document.documentElement.dataset.fxInfiniteController,
    input: document.documentElement.dataset.fxInfiniteInput,
    scrollActivity: document.documentElement.dataset.fxScrollActivity,
  }));
  assert(contract.controller === 'boundary-v4', `${name}: boundary-v4 controller is not active`);
  assert(contract.input === 'idle', `${name}: continuous loop input did not settle`);
  assert(contract.scrollActivity === 'idle', `${name}: floating UI remained in scrolling state`);
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
    const box = node.getBoundingClientRect();
    return { transform: style.transform, opacity: Number(style.opacity), width: box.width, y: box.y };
  });
  assert(frameVisual.transform !== 'none', 'mobile: Living Core iframe was not visually reduced');
  assert(frameVisual.opacity <= 0.9, `mobile: Living Core iframe is too opaque (${frameVisual.opacity})`);
  assert(frameVisual.width <= viewport.width * 1.01, `mobile: Living Core iframe exceeds unified viewport (${frameVisual.width})`);

  const thoughtBox = await page.locator('.fx-organism-thought-trigger').boundingBox();
  assert(thoughtBox && thoughtBox.x > viewport.width * 0.68, 'mobile: thought control is not docked to the right edge');

  const genome = page.locator('.fx-genome-launcher');
  if (await genome.count() && await genome.isVisible()) {
    const genomeBox = await genome.boundingBox();
    assert(!overlaps(thoughtBox, genomeBox), 'mobile: thought and Interaction DNA controls overlap');
  }

  const actionbar = page.locator('.fx-organism-actionbar');
  if (await actionbar.count() && await actionbar.isVisible()) {
    const actionbarBox = await actionbar.boundingBox();
    assert(!overlaps(thoughtBox, actionbarBox), 'mobile: thought control overlaps the action dock');
    assert(actionbarBox.height <= 58, `mobile: action dock is too tall (${actionbarBox.height}px)`);
    assert(actionbarBox.x >= 6 && actionbarBox.x + actionbarBox.width <= viewport.width - 6, 'mobile: action dock leaves the viewport');
  }

  const heroCopy = await page.locator('#hero .hero-copy').evaluate(node => ({ width: node.getBoundingClientRect().width }));
  assert(heroCopy.width <= viewport.width - 20, 'mobile: hero copy exceeds viewport width');

  await page.evaluate(() => window.scrollTo(0, Math.min(window.innerHeight * 0.7, document.documentElement.scrollHeight - window.innerHeight - 80)));
  await page.waitForFunction(() => document.documentElement.classList.contains('fx-page-scrolling'), null, { timeout: 3000 });
  const hiddenDuringScroll = await page.evaluate(() => {
    const dialogue = getComputedStyle(document.querySelector('.fx-organism-dialogue'));
    const dock = getComputedStyle(document.querySelector('.fx-organism-actionbar'));
    return { dialogueOpacity: dialogue.opacity, dockOpacity: dock.opacity, dockPointer: dock.pointerEvents };
  });
  assert(hiddenDuringScroll.dialogueOpacity === '0', 'mobile: thought control remains visible during active scrolling');
  assert(hiddenDuringScroll.dockOpacity === '0' && hiddenDuringScroll.dockPointer === 'none', 'mobile: action dock remains active during scrolling');
  await page.waitForFunction(() => !document.documentElement.classList.contains('fx-page-scrolling'), null, { timeout: 3000 });

  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileCoreVisible === 'false', null, { timeout: 5000 });
  const stageOpacity = await page.locator('.fx-three-stage-shell').evaluate(node => Number(getComputedStyle(node).opacity));
  assert(stageOpacity === 0, `mobile: Living Core remains visible after leaving hero (${stageOpacity})`);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => document.documentElement.dataset.fxMobileCoreVisible === 'true', null, { timeout: 5000 });
}

async function validateDesktopCollisionLayout(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await installVoiceMock(page);
  await page.addInitScript(() => localStorage.removeItem('formatx-organism-dialogue-enabled'));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await waitForReady(page);

  const trigger = page.locator('.fx-organism-thought-trigger');
  const bubble = page.locator('.fx-organism-thought');
  const heroCopy = page.locator('#hero .hero-copy');
  const actionbar = page.locator('.fx-organism-actionbar');
  const organismMap = page.locator('#hero .fx-organism-map');
  const stage = page.locator('.fx-three-stage-shell');

  await trigger.waitFor({ state: 'visible' });
  assert(await bubble.isHidden(), `${name}: thought bubble must start closed`);
  await assertNoCollision(trigger, [
    ['hero copy', heroCopy],
    ['action dock', actionbar],
    ['Organism map', organismMap],
  ], name, 'closed trigger');

  await trigger.click();
  await bubble.waitFor({ state: 'visible' });
  const bubbleBox = await assertNoCollision(bubble, [
    ['hero copy', heroCopy],
    ['action dock', actionbar],
    ['Organism map', organismMap],
    ['Three.js stage', stage],
  ], name, 'open dialogue');

  assert(bubbleBox.x >= -1 && bubbleBox.y >= -1, `${name}: dialogue leaves viewport at top or left`);
  assert(bubbleBox.x + bubbleBox.width <= viewport.width + 1, `${name}: dialogue leaves viewport horizontally`);
  assert(bubbleBox.y + bubbleBox.height <= viewport.height + 1, `${name}: dialogue leaves viewport vertically`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `${name}: dialogue causes horizontal overflow (${overflow}px)`);

  if (viewport.width / viewport.height >= 21 / 9) {
    const rightGap = viewport.width - (bubbleBox.x + bubbleBox.width);
    assert(rightGap >= 24 && rightGap <= 60, `${name}: ultrawide dialogue lane is not anchored safely (${rightGap}px)`);
  }

  await context.close();
}

async function validateViewport(browser, name, viewport, mobile) {
  const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  await installVoiceMock(page);
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
  await validateContinuousLoop(page, name);
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
  assert((await page.locator('.fx-organism-privacy').textContent()).includes('speech uses the device or browser voice service'), `${name}: speech service disclosure did not switch to English`);

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
    await validateViewport(browser, 'desktop-functional', { width: 1440, height: 900 }, false);
    await validateViewport(browser, 'mobile-functional', { width: 390, height: 844 }, true);

    const desktopLayouts = [
      ['desktop-1024x768', { width: 1024, height: 768 }],
      ['desktop-1366x768', { width: 1366, height: 768 }],
      ['desktop-1536x864', { width: 1536, height: 864 }],
      ['desktop-1920x1080', { width: 1920, height: 1080 }],
      ['ultrawide-2560x1080', { width: 2560, height: 1080 }],
      ['ultrawide-3440x1440', { width: 3440, height: 1440 }],
      ['super-ultrawide-5120x1440', { width: 5120, height: 1440 }],
    ];
    for (const [name, viewport] of desktopLayouts) {
      await validateDesktopCollisionLayout(browser, name, viewport);
    }

    console.log('PASS: Organism dialogue is readable, collision-free, selects the premium Natural voice over eSpeak, and discloses the speech service.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});