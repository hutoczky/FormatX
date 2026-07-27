'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const BASE = 'https://www.formatxsuite.com';
const APEX = 'https://formatxsuite.com';
const ROOT = path.resolve('docs/scifi-ui');
const OUT = path.resolve('live-audit-report.json');
const findings = [];
const checks = [];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function record(name, pass, detail = '', severity = 'critical') {
  const entry = { name, pass: Boolean(pass), detail: String(detail || ''), severity };
  checks.push(entry);
  if (!entry.pass) findings.push(entry);
  console.log(`${entry.pass ? 'PASS' : 'FAIL'} [${severity}] ${name}${entry.detail ? ` — ${entry.detail}` : ''}`);
}

async function fetchResponse(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000);
  try {
    return await fetch(url, {
      redirect: options.redirect || 'follow',
      cache: 'no-store',
      headers: {
        'cache-control': 'no-cache, no-store, max-age=0',
        pragma: 'no-cache',
        'user-agent': 'FormatX-Live-Audit/2026.07.27',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

function encodePath(relativePath) {
  return relativePath.split(path.sep).map(encodeURIComponent).join('/');
}

function listFiles(directory, prefix = '') {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '_headers' || entry.name === '.DS_Store') continue;
    const absolute = path.join(directory, entry.name);
    const relative = prefix ? path.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) result.push(...listFiles(absolute, relative));
    else result.push({ absolute, relative });
  }
  return result;
}

async function auditHeadersAndRoutes() {
  const apex = await fetchResponse(`${APEX}/`, { redirect: 'manual' });
  record('Apex domain canonical redirect', [301, 302, 307, 308].includes(apex.status), `HTTP ${apex.status}; location=${apex.headers.get('location') || ''}`);
  record('Apex redirect points to www /scifi-ui/', /https:\/\/www\.formatxsuite\.com\/scifi-ui\/?$/i.test(apex.headers.get('location') || ''), apex.headers.get('location') || 'missing location');

  const root = await fetchResponse(`${BASE}/`, { redirect: 'manual' });
  record('www root canonical redirect', [301, 302, 307, 308].includes(root.status), `HTTP ${root.status}; location=${root.headers.get('location') || ''}`);
  record('www root points to /scifi-ui/', /\/scifi-ui\/?$/i.test(root.headers.get('location') || ''), root.headers.get('location') || 'missing location');

  const main = await fetchResponse(`${BASE}/scifi-ui/?audit=${Date.now()}`);
  const mainText = await main.text();
  record('Main product page responds', main.status === 200, `HTTP ${main.status}`);
  record('Main page content type is HTML', /text\/html/i.test(main.headers.get('content-type') || ''), main.headers.get('content-type') || 'missing');
  record('Main page remains protected from foreign framing', /DENY/i.test(main.headers.get('x-frame-options') || '') && /frame-ancestors\s+'none'/i.test(main.headers.get('content-security-policy') || ''), `x-frame-options=${main.headers.get('x-frame-options')}; csp=${main.headers.get('content-security-policy')}`);
  record('Main HTML contains the FormatX title', /FormatX Suite Pro/i.test(mainText), 'title/brand marker');

  const stage = await fetchResponse(`${BASE}/scifi-ui/three-stage.html?v=20260727-three-6&audit=${Date.now()}`);
  const stageText = await stage.text();
  const xfo = stage.headers.get('x-frame-options') || '';
  const csp = stage.headers.get('content-security-policy') || '';
  record('Three.js stage responds', stage.status === 200, `HTTP ${stage.status}`);
  record('Three.js stage is not denied by X-Frame-Options', !/DENY/i.test(xfo), `x-frame-options=${xfo || 'missing'}`);
  record('Three.js stage allows same-origin framing', /SAMEORIGIN/i.test(xfo) && /frame-ancestors\s+'self'/i.test(csp), `x-frame-options=${xfo}; csp=${csp}`);
  record('Three.js stage entry module is present', /experience-entry\.js/i.test(stageText), 'stage HTML module reference');

  const endpoints = [
    ['/scifi-ui/support.html', 'Support page'],
    ['/scifi-ui/privacy.html', 'Privacy page'],
    ['/scifi-ui/terms.html', 'Terms page'],
    ['/scifi-ui/checkout.html?plan=business_pro&cycle=monthly&currency=HUF&lang=hu', 'Checkout page'],
    ['/api/license/health', 'Licence API health'],
    ['/download/android', 'Android download route']
  ];

  for (const [urlPath, label] of endpoints) {
    const response = await fetchResponse(`${BASE}${urlPath}`);
    record(`${label} responds`, response.status >= 200 && response.status < 400, `HTTP ${response.status}; type=${response.headers.get('content-type') || ''}`);
    if (urlPath === '/api/license/health') {
      let payload = null;
      try { payload = await response.json(); } catch { payload = null; }
      record('Licence API returns JSON health payload', Boolean(payload && typeof payload === 'object'), JSON.stringify(payload || {}));
    }
  }
}

async function auditPublishedAssetParity() {
  const files = listFiles(ROOT);
  let matched = 0;
  let missing = 0;
  let mismatched = 0;
  let skippedLarge = 0;
  const details = [];

  for (const file of files) {
    const stat = fs.statSync(file.absolute);
    const relativePosix = file.relative.split(path.sep).join('/');
    const urlPath = relativePosix === 'index.html' ? '/scifi-ui/' : `/scifi-ui/${encodePath(file.relative)}`;
    const url = `${BASE}${urlPath}${urlPath.includes('?') ? '&' : '?'}audit=${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let response;
    try {
      response = await fetchResponse(url, { timeout: 45000 });
    } catch (error) {
      missing += 1;
      details.push({ file: relativePosix, status: 'network-error', error: error.message });
      continue;
    }

    if (response.status !== 200) {
      missing += 1;
      details.push({ file: relativePosix, status: response.status });
      continue;
    }

    if (stat.size > 12 * 1024 * 1024) {
      skippedLarge += 1;
      details.push({ file: relativePosix, status: 200, parity: 'size-skip', localBytes: stat.size });
      continue;
    }

    const live = Buffer.from(await response.arrayBuffer());
    const local = fs.readFileSync(file.absolute);
    const same = sha256(live) === sha256(local);
    if (same) matched += 1;
    else mismatched += 1;
    details.push({
      file: relativePosix,
      status: 200,
      parity: same,
      localBytes: local.length,
      liveBytes: live.length,
      localSha256: sha256(local),
      liveSha256: sha256(live)
    });
  }

  record('All public scifi-ui files are reachable', missing === 0, `files=${files.length}; missing=${missing}; skippedLarge=${skippedLarge}`);
  record('Live asset bundle matches current master source', mismatched === 0, `matched=${matched}; mismatched=${mismatched}; skippedLarge=${skippedLarge}`);
  return { files: files.length, matched, missing, mismatched, skippedLarge, details };
}

async function auditBrowserRuntime(viewport, label) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-dev-shm-usage',
      '--disable-background-networking'
    ]
  });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => failedRequests.push(`${request.url()} — ${request.failure()?.errorText || 'failed'}`));

  const auditUrl = `${BASE}/scifi-ui/?audit-runtime=${Date.now()}-${label}`;
  const response = await page.goto(auditUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  record(`${label}: main navigation response`, Boolean(response && response.status() === 200), response ? `HTTP ${response.status()}` : 'no response');

  await page.waitForFunction(() => {
    const value = document.documentElement.dataset.fxThree;
    return value === 'ready' || value === 'error';
  }, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => {
    const root = document.documentElement;
    const frame = document.getElementById('fx-three-frame');
    const qr = Array.from(document.querySelectorAll('[data-plan-qr-image]')).map(image => ({
      complete: image.complete,
      width: image.naturalWidth,
      height: image.naturalHeight,
      src: image.currentSrc || image.src
    }));
    const internalLinks = Array.from(document.querySelectorAll('a[href]'))
      .map(anchor => anchor.href)
      .filter(href => href.startsWith(location.origin));
    const resources = performance.getEntriesByType('resource');
    return {
      title: document.title,
      lang: root.lang,
      three: root.dataset.fxThree || '',
      threeError: root.dataset.fxThreeError || '',
      renderer: root.dataset.fxThreeRenderer || root.dataset.fxRenderer || '',
      quality: root.dataset.fxThreeQuality || '',
      loopCount: Number(root.dataset.fxLoopCount || 0),
      infinite: root.dataset.fxInfiniteFix || '',
      bootstrap: root.dataset.fxThreeBootstrap || '',
      frameSrc: frame instanceof HTMLIFrameElement ? frame.src : '',
      framePresent: frame instanceof HTMLIFrameElement,
      qr,
      planCards: document.querySelectorAll('[data-plan-id]').length,
      qrCards: document.querySelectorAll('[data-plan-qr]').length,
      duplicateIds: Array.from(document.querySelectorAll('[id]')).map(node => node.id).filter((id, index, all) => all.indexOf(id) !== index),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      internalLinks: Array.from(new Set(internalLinks)),
      resourceCount: resources.length,
      transferredBytes: resources.reduce((sum, entry) => sum + Number(entry.transferSize || 0), 0),
      externalHosts: Array.from(new Set(resources.map(entry => {
        try { return new URL(entry.name).host; } catch { return ''; }
      }).filter(host => host && host !== location.host))),
      telemetry: document.querySelector('[data-fx-three-telemetry]')?.textContent?.trim() || ''
    };
  });

  record(`${label}: Three.js runtime reaches ready`, state.three === 'ready', `state=${state.three}; error=${state.threeError}; telemetry=${state.telemetry}`);
  record(`${label}: Three.js iframe is present`, state.framePresent && /three-stage\.html/.test(state.frameSrc), state.frameSrc);
  record(`${label}: new stage cache version is active`, /20260727-three-6/.test(state.frameSrc), state.frameSrc);
  record(`${label}: mandatory infinite-loop bridge is active`, state.infinite === 'ready', `state=${state.infinite}`);
  record(`${label}: all three pricing and QR cards exist`, state.planCards === 3 && state.qrCards === 3, `plans=${state.planCards}; qrCards=${state.qrCards}`);
  record(`${label}: all QR images render`, state.qr.length === 3 && state.qr.every(item => item.complete && item.width >= 49 && item.height >= 49), JSON.stringify(state.qr));
  record(`${label}: no duplicate DOM ids`, state.duplicateIds.length === 0, JSON.stringify(state.duplicateIds));
  record(`${label}: no horizontal overflow`, state.horizontalOverflow <= 1, `overflow=${state.horizontalOverflow}px`);
  record(`${label}: no page exceptions`, pageErrors.length === 0, pageErrors.join(' | '));
  record(`${label}: no failed first-party requests`, failedRequests.filter(item => item.includes('formatxsuite.com')).length === 0, failedRequests.join(' | '));
  record(`${label}: no blocking console errors`, consoleErrors.filter(item => !/WebGL stall due to ReadPixels|GPU stall/i.test(item)).length === 0, consoleErrors.join(' | '), 'warning');

  let frameState = null;
  const stageFrame = page.frames().find(frame => /three-stage\.html/.test(frame.url()));
  if (stageFrame) {
    frameState = await stageFrame.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        canvas: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
        engine: document.documentElement.dataset.fxEngine || document.documentElement.dataset.fxRenderer || '',
        bodyChildren: document.body.children.length
      };
    }).catch(error => ({ error: error.message }));
  }
  record(`${label}: 3D canvas has a real drawing buffer`, Boolean(frameState && frameState.canvas && frameState.canvas[0] > 0 && frameState.canvas[1] > 0), JSON.stringify(frameState));

  if (label === 'desktop') {
    for (let cycle = 1; cycle <= 2; cycle += 1) {
      const before = await page.evaluate(() => Number(document.documentElement.dataset.fxLoopCount || 0));
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(previous => Number(document.documentElement.dataset.fxLoopCount || 0) > previous, before, { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    const loopCount = await page.evaluate(() => Number(document.documentElement.dataset.fxLoopCount || 0));
    record('desktop: two infinite scroll transfers complete', loopCount >= 2, `loopCount=${loopCount}`);
  }

  const linkResults = [];
  for (const href of state.internalLinks) {
    if (href.includes('#') && new URL(href).pathname === '/scifi-ui/') continue;
    try {
      const result = await context.request.get(href, { timeout: 30000, maxRedirects: 5 });
      linkResults.push({ href, status: result.status() });
    } catch (error) {
      linkResults.push({ href, status: 0, error: error.message });
    }
  }
  record(`${label}: internal links are reachable`, linkResults.every(item => item.status >= 200 && item.status < 400), JSON.stringify(linkResults.filter(item => item.status < 200 || item.status >= 400)));

  await page.screenshot({ path: `live-audit-${label}.png`, fullPage: true });
  await context.close();
  await browser.close();
  return { label, state, frameState, consoleErrors, pageErrors, failedRequests, linkResults };
}

(async () => {
  const report = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    sourceCommit: process.env.GITHUB_SHA || '',
    headersAndRoutes: null,
    assetParity: null,
    browser: []
  };

  try {
    await auditHeadersAndRoutes();
    report.assetParity = await auditPublishedAssetParity();
    report.browser.push(await auditBrowserRuntime({ width: 1440, height: 960 }, 'desktop'));
    report.browser.push(await auditBrowserRuntime({ width: 412, height: 915 }, 'mobile'));
  } catch (error) {
    record('Audit script completed without an uncaught exception', false, error.stack || error.message);
  }

  report.checks = checks;
  report.findings = findings;
  report.summary = {
    passed: checks.filter(item => item.pass).length,
    failed: findings.length,
    critical: findings.filter(item => item.severity === 'critical').length,
    warnings: findings.filter(item => item.severity === 'warning').length
  };
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`AUDIT SUMMARY ${JSON.stringify(report.summary)}`);
  process.exitCode = report.summary.critical > 0 ? 1 : 0;
})();
