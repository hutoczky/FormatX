'use strict';

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

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
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); sessionStorage.setItem('formatx:mag-birth-live-r533-seen', '1'); } catch (_) {}
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
  // R590: first mount the intent-deferred origin/showcase loader, then move its
  // real IntersectionObserver target into view. Scrolling before the loader
  // exists cannot be observed and is not representative of an actual user
  // session where the intent event and subsequent navigation are ordered.
  await page.keyboard.press('Tab');
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxContentRuntimeR241 === 'requested-r497-user-intent'
  ), null, { timeout: 10000 });
  await page.waitForFunction(() => (
    document.documentElement.dataset.fxProductShowcaseLoader === 'v2'
  ), null, { timeout: 10000 });

  const capabilities = page.locator('#capabilities').first();
  if (await capabilities.count()) await capabilities.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent('formatx:livingready'));
    window.dispatchEvent(new CustomEvent('formatx:livingready'));
  });
  await page.waitForFunction(() => (
    ['loading','ready'].includes(document.documentElement.dataset.fxProductShowcaseLoadState || '')
  ), null, { timeout: 10000 });
  await page.waitForSelector('#product-showcase .fx-product-showcase__card', { timeout: 30000 });
  await page.evaluate(() => {
    const showcase = document.getElementById('product-showcase');
    if (showcase) window.scrollTo({ top: Math.max(0, showcase.offsetTop - 96), left: 0, behavior: 'auto' });
  });
  await page.waitForTimeout(120);
  const showcaseImages = page.locator('#product-showcase .fx-product-showcase__media > img');
  const imageCount = await showcaseImages.count();
  assert(imageCount >= 5, `product showcase image count ${imageCount}`);
  for (let index = 0; index < imageCount; index += 1) {
    await page.evaluate(i => {
      const image = document.querySelectorAll('#product-showcase .fx-product-showcase__media > img')[i];
      if (image instanceof HTMLElement) image.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    }, index);
    await page.waitForTimeout(40);
  }
  const imageHealth = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('#product-showcase .fx-product-showcase__media > img'));
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const waitForImage = image => new Promise(resolve => {
      if (image.complete) return resolve();
      const done = () => resolve();
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
      setTimeout(done, 8000);
    });

    return Promise.all(images.map(async (image, index) => {
      const original = image.currentSrc || image.src;
      let http = { ok: false, status: 0, type: '', bytes: 0, error: '' };
      try {
        const response = await fetch(original, { cache: 'no-store', credentials: 'same-origin' });
        const body = await response.arrayBuffer();
        http = {
          ok: response.ok,
          status: response.status,
          type: response.headers.get('content-type') || '',
          bytes: body.byteLength,
          error: '',
        };
      } catch (error) {
        http.error = String(error);
      }

      for (let attempt = 0; attempt < 2 && !(image.complete && image.naturalWidth > 0); attempt += 1) {
        try { await image.decode(); } catch (_) {}
        if (image.complete && image.naturalWidth > 0) break;
        if (attempt === 0) {
          const retry = new URL(original, location.href);
          retry.searchParams.set('formatx-matrix-retry', String(Date.now()) + '-' + String(index));
          image.src = retry.href;
          await Promise.race([waitForImage(image), sleep(8000)]);
        }
      }

      return {
        index,
        src: image.currentSrc || image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        http,
      };
    }));
  });

  assert(
    imageHealth.length >= 5 && imageHealth.every(item =>
      item.http.ok && item.http.status === 200 && item.http.bytes > 100 &&
      item.complete && item.naturalWidth > 0 && item.naturalHeight > 0
    ),
    'product showcase live image verification failed ' + JSON.stringify(imageHealth)
  );
}

async function waitForFeedback(page) {
  await page.waitForSelector('#user-feedback [data-fx-feedback-form]', { timeout: 30000 });
  await page.locator('#user-feedback').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => ['ready','ready-visible'].includes(document.documentElement.dataset.fxFeedbackState || ''), null, { timeout: 20000 });
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
    const images = Array.from(document.querySelectorAll('#product-showcase .fx-product-showcase__media > img')).map(image => ({
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
    try { localStorage.setItem('formatx:intro-seen-v1', '1'); sessionStorage.setItem('formatx:mag-birth-live-r533-seen', '1'); } catch (_) {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${String(error)}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  try {
    await page.goto(`${TEST_URL}${TEST_URL.includes('?') ? '&' : '?'}responsive-matrix=${spec.name}&magchapters=off`, {
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

    const meaningfulErrors = errors.filter(error => !/favicon|WebGL|WebGPU|GPU|ERR_ABORTED|404.*favicon|Permissions policy violation: accelerometer is not allowed/i.test(error));
    assert(meaningfulErrors.length === 0, `${spec.name}: browser errors: ${meaningfulErrors.join(' | ')}`);

    console.log(JSON.stringify({ case: spec.name, ...data }));
  } finally {
    await context.close();
  }
}


/* R2201: verify the production MAG chapter aperture on desktop and touch.
   The legacy geometry tests above intentionally use ?magchapters=off. */
async function verifyMagChapters(browser, spec) {
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    locale: 'hu-HU',
    deviceScaleFactor: 1,
    isMobile: spec.mobile,
    hasTouch: spec.mobile,
    reducedMotion: 'reduce'
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem('formatx:intro-seen-v1', '1');
      sessionStorage.setItem('formatx:mag-birth-live-r533-seen', '1');
    } catch (_) {}
  });
  const page = await context.newPage();
  try {
    await page.goto(TEST_URL + (TEST_URL.includes('?') ? '&' : '?') + 'mag-aperture-matrix=' + spec.name, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await clearIntro(page);
    // No heading rewrite or reflow before the visitor's first interaction.
    const firstPaint=await page.evaluate(()=>{
      const title=document.getElementById('hero-title');
      const bounds=title?.getBoundingClientRect();
      return {
        mounted:!!document.querySelector('#experience .fx-mag-chapter-title'),
        heroWidth:bounds?.width||0,
        heroHeight:bounds?.height||0,
        heroSectionHeight:document.getElementById('hero')?.getBoundingClientRect().height||0
      };
    });
    assert(!firstPaint.mounted, spec.name+': chapters activated before interaction '+JSON.stringify(firstPaint));
    assert(firstPaint.heroSectionHeight>200, spec.name+': hero collapsed before interaction '+JSON.stringify(firstPaint));
    if(!spec.mobile)assert(firstPaint.heroWidth>100 && firstPaint.heroHeight>10,
      spec.name+': desktop hero headline collapsed before interaction '+JSON.stringify(firstPaint));
    // Real wheel intent activates the chapter layer; scripted scroll must not.
    await page.mouse.wheel(0, Math.max(200, Math.round(spec.height * .38)));
    await page.waitForFunction(() => (
      document.documentElement.dataset.fxMagChapters === 'r2217' &&
      Number(document.documentElement.dataset.fxMagChapterCount) >= 8
    ), null, {timeout:30000});
    const baseline = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('main#main-content > section.fx-mag-chapter'));
      return {
        count:rows.length,
        buttons:rows.filter(s=>!!s.querySelector('h2 .fx-mag-chapter-title')).length,
        closed:rows.filter(s=>s.dataset.fxExpanded==='false').length,
        commerceOpen:document.getElementById('pricing')?.dataset.fxExpanded==='true',
        experienceFlow:getComputedStyle(document.querySelector('#experience .flow')).display,
        chromeWidth:document.documentElement.scrollWidth,
        viewportWidth:document.documentElement.clientWidth,
        magCanvas:!!document.querySelector('#hero canvas'),
        titleVisibility:rows.map(section=>{
          const trigger=section.querySelector('h2 .fx-mag-chapter-title');
          const box=trigger?.getBoundingClientRect();
          const css=trigger?getComputedStyle(trigger):null;
          const visible=!!trigger && trigger.textContent.trim().length>3 && box.width>120 && box.height>44 &&
            css.display!=='none' && css.visibility!=='hidden' && Number(css.opacity)>.6;
          return {section:section.id||section.className,visible,width:box?.width||0,height:box?.height||0};
        }),
        hiddenBodies:rows.filter(section=>section.id!=='pricing').every(section=>Array.from(section.querySelectorAll(
          '[data-fx-mag-route]:not(h2) > :not([data-fx-mag-route])'
        )).filter(node=>node instanceof HTMLElement).every(node=>getComputedStyle(node).display==='none'))
      };
    });
    assert(baseline.count >= 8, spec.name + ': injected/static section folding incomplete '+JSON.stringify(baseline));
    assert(baseline.buttons === baseline.count, spec.name + ': missing title triggers '+JSON.stringify(baseline));
    assert(baseline.closed === baseline.count-1 && baseline.commerceOpen, spec.name + ': only checkout is allowed open by default '+JSON.stringify(baseline));
    assert(baseline.experienceFlow === 'none', spec.name + ': hidden chapter content visible');
    const titles=await page.evaluate(()=>({
      experience:document.querySelector('#experience .fx-mag-title-copy')?.textContent.trim()||'',
      capabilities:document.querySelector('#capabilities .fx-mag-title-copy')?.textContent.trim()||'',
      pricing:document.querySelector('#pricing .fx-mag-title-copy')?.textContent.trim()||'',
      experienceEditorialHidden:document.querySelector('#experience .fx-mag-editorial-heading')?.hidden,
      pricingEditorialHidden:document.querySelector('#pricing .fx-mag-editorial-heading')?.hidden
    }));
    assert(titles.experience==='MAG' && titles.capabilities==='KÉPESSÉGEK' &&
      titles.pricing==='CSOMAGOK',spec.name+': headings are not short keywords '+JSON.stringify(titles));
    assert(titles.experienceEditorialHidden && !titles.pricingEditorialHidden,
      spec.name+': editorial text leaked while chapters closed '+JSON.stringify(titles));

    assert(baseline.titleVisibility.every(entry=>entry.visible),
      spec.name+': one or more collapsed chapter headings missing '+JSON.stringify(baseline.titleVisibility));
    assert(baseline.hiddenBodies, spec.name+': at least one collapsed section leaks content');

    const commerce=await page.evaluate(()=>{
      const sec=document.getElementById('pricing');
      const isVisible=el=>{
        if(!(el instanceof HTMLElement))return false;
        const cs=getComputedStyle(el),box=el.getBoundingClientRect();
        return box.width>30 && box.height>20 && cs.display!=='none' &&
          cs.visibility!=='hidden' && Number(cs.opacity)>.1;
      };
      const cards=Array.from(sec?.querySelectorAll('.price-card')||[]);
      const links=cards.map(card=>card.querySelector('a[href*="checkout"]'));
      const payment=sec?.querySelector('.payment');
      const console=sec?.querySelector('.payment-console');
      const primary=sec?.querySelector('#preview-checkout-link');
      const qr=sec?.querySelector('#formatx-plan-qr-dock');
      return {
        sectionOpen:sec?.dataset.fxExpanded==='true',
        commerceFlag:sec?.dataset.fxCommerceVisible,
        cards:cards.map(isVisible),
        links:links.map(link=>({visible:isVisible(link),href:link?.getAttribute('href')})),
        paymentVisible:isVisible(payment),consoleVisible:isVisible(console),
        primaryVisible:isVisible(primary),
        primaryHref:primary?.getAttribute('href'),
        qrVisible:isVisible(qr)
      };
    });
    assert(commerce.sectionOpen && commerce.commerceFlag==='true',
      spec.name+': payment is not permanently open '+JSON.stringify(commerce));
    assert(commerce.cards.length===3 && commerce.cards.every(Boolean),
      spec.name+': paid plans hidden '+JSON.stringify(commerce));
    assert(commerce.links.length===3 && commerce.links.every(x=>x.visible && x.href?.includes('checkout.html')),
      spec.name+': checkout links hidden or invalid '+JSON.stringify(commerce));
    assert(commerce.paymentVisible && commerce.consoleVisible && commerce.primaryVisible &&
      commerce.primaryHref?.includes('checkout.html') && commerce.qrVisible,
      spec.name+': payment console or QR unavailable '+JSON.stringify(commerce));

    const rootLeak=await page.evaluate(()=>Array.from(document.querySelectorAll(
      'main#main-content > section.fx-mag-chapter[data-fx-expanded="false"] > :not([data-fx-mag-route])'
    )).filter(node=>node instanceof HTMLElement && getComputedStyle(node).display!=='none')
      .map(node=>({chapter:node.parentElement.id,tag:node.tagName,className:node.className})).slice(0,15));
    assert(rootLeak.length===0,spec.name+': top-level chapter body leaked '+JSON.stringify(rootLeak));

    assert(baseline.chromeWidth <= baseline.viewportWidth+2, spec.name + ': folded horizontal overflow '+JSON.stringify(baseline));
    const screenshotDir=process.env.FORMATX_MAG_SCREENSHOT_DIR;
    if(screenshotDir){
      fs.mkdirSync(screenshotDir,{recursive:true});
      await page.screenshot({path:path.join(screenshotDir,spec.name+'-headings.jpg'),
        type:'jpeg',quality:70,fullPage:true,timeout:30000});
    }
    const experience = page.locator('#experience .fx-mag-chapter-title');
    await experience.scrollIntoViewIfNeeded();
    await experience.click();
    await page.waitForFunction(() => document.getElementById('experience').dataset.fxMagPhase === 'open');
    assert(await experience.getAttribute('aria-expanded') === 'true', spec.name + ': experience button not expanded');
    const relation=await experience.evaluate(button=>{
      const ids=(button.getAttribute('aria-controls')||'').split(/\s+/).filter(Boolean);
      return {
        count:ids.length,
        allWithin:ids.every(id=>document.getElementById(id)?.closest('section')===button.closest('section'))
      };
    });
    assert(relation.count>0 && relation.allWithin,
      spec.name+': aria-controls missing or points outside section '+JSON.stringify(relation));
    assert(await page.locator('#experience .fx-mag-iris i').count() === 4, spec.name + ': four-arm iris missing');
    const flowVisible=await page.locator('#experience .flow').evaluate(el=>getComputedStyle(el).display!=='none');
    assert(flowVisible, spec.name + ': expanded chapter body remains hidden');
    const editorial=await page.locator('#experience .fx-mag-editorial-heading').evaluate(el=>({
      visible:!el.hidden && getComputedStyle(el).display!=='none',
      text:(el.textContent||'').trim()
    }));
    assert(editorial.visible && editorial.text.length>10,
      spec.name+': full original editorial heading not revealed '+JSON.stringify(editorial));

    if(screenshotDir){
      await page.screenshot({path:path.join(screenshotDir,spec.name+'-opened.jpg'),
        type:'jpeg',quality:70,fullPage:true,timeout:30000});
    }
    const capabilities=page.locator('#capabilities .fx-mag-chapter-title');
    await capabilities.scrollIntoViewIfNeeded();
    const beforeY=await capabilities.evaluate(el=>el.getBoundingClientRect().top);
    if(spec.mobile)await capabilities.tap();else await capabilities.click();
    const afterY=await capabilities.evaluate(el=>el.getBoundingClientRect().top);
    assert(Math.abs(afterY-beforeY)<=16,
      spec.name+': switching accordion chapters jumps the viewport '+JSON.stringify({beforeY,afterY}));
    await page.waitForFunction(() => (
      document.getElementById('experience').dataset.fxExpanded === 'false' &&
      document.getElementById('capabilities').dataset.fxExpanded === 'true'
    ));
    assert(await experience.getAttribute('aria-expanded')==='false', spec.name+': accordion prior chapter not closed');
    assert(await page.locator('#pricing').getAttribute('data-fx-expanded')==='true',
      spec.name+': pricing closed when another chapter opened');
    await capabilities.click();
    await page.waitForFunction(() => document.getElementById('capabilities').dataset.fxExpanded==='false');
    assert(await capabilities.getAttribute('aria-expanded')==='false', spec.name+': section does not close');
    await capabilities.focus();
    await capabilities.press('Enter');
    await page.waitForFunction(() => document.getElementById('capabilities').dataset.fxExpanded==='true');
    await capabilities.press('Space');
    await page.waitForFunction(() => document.getElementById('capabilities').dataset.fxExpanded==='false');
    // New sections injected by first-party modules must share the same rule.
    await page.evaluate(()=>{
      const section=document.createElement('section');
      section.className='scene';
      section.id='fx-mag-smoke-injected';
      section.setAttribute('aria-labelledby','fx-mag-smoke-title');
      section.innerHTML='<header><h2 id="fx-mag-smoke-title">INJECTED TEST</h2></header><div id="fx-mag-smoke-body">Hidden on initial view</div>';
      document.getElementById('main-content').appendChild(section);
    });
    const injected=page.locator('#fx-mag-smoke-injected .fx-mag-chapter-title');
    await injected.waitFor({state:'attached',timeout:10000});
    assert(await page.locator('#fx-mag-smoke-body').evaluate(el=>getComputedStyle(el).display)==='none',
      spec.name+': lazy inserted section content visible while closed');
    if(spec.mobile)await injected.tap();else await injected.click();
    await page.waitForFunction(()=>document.getElementById('fx-mag-smoke-injected').dataset.fxExpanded==='true');
    assert(await page.locator('#fx-mag-smoke-body').evaluate(el=>getComputedStyle(el).display)!=='none',
      spec.name+': lazy injected section did not open');
    const audit=await page.evaluate(()=>window.FormatXMagChapters?.audit());
    assert(audit && audit.missingTriggers===0, spec.name+': disconnected headings '+JSON.stringify(audit));
    console.log('MAG aperture smoke PASS '+spec.name+' '+JSON.stringify({baseline,audit}));
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
    await verifyMagChapters(browser,{name:'mobile-touch',width:390,height:844,mobile:true});
    await verifyMagChapters(browser,{name:'desktop',width:1366,height:768,mobile:false});
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
