'use strict';

const { chromium } = require('playwright');

const TEST_URL = process.env.FORMATX_TEST_URL || 'https://www.formatxsuite.com/';
const VIEWPORTS = [
  { name: 'hd-16x9', width: 1366, height: 768, maxShowcase: 1322, maxFeedback: 1182, ratingColumns: 3 },
  { name: 'full-hd-16x9', width: 1920, height: 1080, maxShowcase: 1542, maxFeedback: 1182, ratingColumns: 5 },
  { name: 'qhd-16x9', width: 2560, height: 1440, maxShowcase: 1542, maxFeedback: 1182, ratingColumns: 5 },
  { name: 'ultrawide-21x9', width: 3440, height: 1440, maxShowcase: 1902, maxFeedback: 1502, ratingColumns: 5 },
  { name: 'super-ultrawide-32x9', width: 5120, height: 1440, maxShowcase: 2102, maxFeedback: 1702, ratingColumns: 5 },
  { name: '4k-16x9', width: 3840, height: 2160, maxShowcase: 2202, maxFeedback: 1802, ratingColumns: 5 },
  { name: '8k-16x9', width: 7680, height: 4320, maxShowcase: 2202, maxFeedback: 1802, ratingColumns: 5 },
];

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function clearIntro(page) {
  await page.evaluate(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
    const root = document.documentElement;
    const overlay = document.getElementById('formatx-event-horizon');
    root.classList.remove('fx-intro-running', 'fx-intro-pending');
    root.classList.add('fx-intro-complete');
    if (overlay) {
      overlay.hidden = true;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body?.classList.remove('fx-organism-panel-open');
    document.dispatchEvent(new CustomEvent('formatx:introcomplete'));
  });
}

async function waitForProductShowcase(page) {
  const capabilities = page.locator('#capabilities').first();
  if (await capabilities.count()) await capabilities.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent('formatx:livingready'));
    window.dispatchEvent(new CustomEvent('formatx:livingready'));
  });
  await page.waitForSelector('#product-showcase .fx-product-showcase__card', { timeout: 30000 });
  await page.locator('#product-showcase').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('#product-showcase img'));
    return images.length >= 5 && images.every(image => image.complete && image.naturalWidth > 0);
  }, null, { timeout: 30000 });
}

async function waitForFeedback(page) {
  await page.waitForSelector('#user-feedback [data-fx-feedback-form]', { timeout: 30000 });
  await page.locator('#user-feedback').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.documentElement.dataset.fxFeedbackState === 'ready', null, { timeout: 20000 });
}

async function inspect(page) {
  return page.evaluate(() => {
    const rect = selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };
    const gridColumns = selector => {
      const element = document.querySelector(selector);
      if (!element) return 0;
      const value = getComputedStyle(element).gridTemplateColumns.trim();
      return value && value !== 'none' ? value.split(/\s+/).length : 0;
    };
    const images = Array.from(document.querySelectorAll('#product-showcase img')).map(image => ({
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));
    const visibleFixed = Array.from(document.querySelectorAll('body *')).filter(element => {
      const style = getComputedStyle(element);
      if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden') return false;
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    }).slice(0, 40).map(element => ({
      tag: element.tagName,
      className: String(element.className || '').slice(0, 120),
      id: element.id || '',
      rect: (() => { const box = element.getBoundingClientRect(); return { left: box.left, right: box.right, top: box.top, bottom: box.bottom }; })(),
    }));
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      },
      showcase: rect('#product-showcase'),
      feedback: rect('#user-feedback'),
      feedbackForm: rect('#user-feedback [data-fx-feedback-form]'),
      feedbackSubmit: rect('#user-feedback .fx-feedback-submit-row'),
      ratingColumns: gridColumns('#user-feedback .fx-feedback-ratings'),
      imageCount: images.length,
      images,
      portableImage: images.find(image => /portable-installer/i.test(image.src)) || null,
      feedbackFont: parseFloat(getComputedStyle(document.querySelector('#user-feedback') || document.body).fontSize),
      feedbackInputFont: parseFloat(getComputedStyle(document.querySelector('#user-feedback input:not([type="radio"]):not([type="checkbox"])') || document.body).fontSize),
      fixed: visibleFixed,
    };
  });
}

function assertInsideViewport(rect, viewportWidth, label) {
  assert(rect, `${label}: missing element`);
  assert(rect.width > 0, `${label}: zero width`);
  assert(rect.left >= -2, `${label}: left overflow ${rect.left}`);
  assert(rect.right <= viewportWidth + 2, `${label}: right overflow ${rect.right} > ${viewportWidth}`);
}

async function verifyViewport(browser, spec) {
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    locale: 'hu-HU',
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); } catch (_) {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${String(error)}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  try {
    await page.goto(`${TEST_URL}${TEST_URL.includes('?') ? '&' : '?'}responsive-matrix=${spec.name}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await clearIntro(page);
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 30000 });
    await waitForProductShowcase(page);
    await waitForFeedback(page);
    const data = await inspect(page);

    const overflow = Math.max(data.document.scrollWidth, data.document.bodyScrollWidth) - data.document.clientWidth;
    assert(overflow <= 2, `${spec.name}: horizontal document overflow ${overflow}px`);
    assertInsideViewport(data.showcase, spec.width, `${spec.name} product showcase`);
    assertInsideViewport(data.feedback, spec.width, `${spec.name} feedback section`);
    assertInsideViewport(data.feedbackForm, spec.width, `${spec.name} feedback form`);
    assertInsideViewport(data.feedbackSubmit, spec.width, `${spec.name} feedback submit row`);

    assert(data.showcase.width <= spec.maxShowcase, `${spec.name}: showcase too wide ${data.showcase.width} > ${spec.maxShowcase}`);
    assert(data.feedback.width <= spec.maxFeedback, `${spec.name}: feedback too wide ${data.feedback.width} > ${spec.maxFeedback}`);
    assert(data.showcase.width >= Math.min(900, spec.width - 48), `${spec.name}: showcase unexpectedly narrow ${data.showcase.width}`);
    assert(data.feedback.width >= Math.min(780, spec.width - 48), `${spec.name}: feedback unexpectedly narrow ${data.feedback.width}`);
    assert(data.ratingColumns === spec.ratingColumns, `${spec.name}: expected ${spec.ratingColumns} rating columns, got ${data.ratingColumns}`);
    assert(data.imageCount >= 5, `${spec.name}: product image count ${data.imageCount}`);
    assert(data.images.every(image => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0), `${spec.name}: broken product image ${JSON.stringify(data.images)}`);
    assert(data.portableImage, `${spec.name}: portable installer image missing`);
    assert(/portable-installer-compatible\.svg/i.test(data.portableImage.src), `${spec.name}: old portable installer image still active: ${data.portableImage.src}`);
    assert(data.feedbackFont >= 15, `${spec.name}: feedback base font too small ${data.feedbackFont}px`);
    assert(data.feedbackInputFont >= 15, `${spec.name}: feedback input font too small ${data.feedbackInputFont}px`);

    const meaningfulErrors = errors.filter(error => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404.*favicon/i.test(error));
    assert(meaningfulErrors.length === 0, `${spec.name}: browser errors: ${meaningfulErrors.join(' | ')}`);

    console.log(JSON.stringify({ case: spec.name, ...data }));
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-smooth-scrolling',
      '--enable-unsafe-swiftshader',
      '--force-device-scale-factor=1',
      '--disable-dev-shm-usage',
    ],
  });
  try {
    for (const spec of VIEWPORTS) await verifyViewport(browser, spec);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
