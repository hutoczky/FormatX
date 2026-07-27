'use strict';

const fs = require('fs');
const { chromium } = require('playwright');

const URL = 'http://127.0.0.1:4178/scifi-ui/three-stage.html?webgpu-debug=1';
const ARGS = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan,WebGPU',
  '--use-angle=swiftshader',
  '--use-gl=angle',
  '--disable-vulkan-surface',
  '--ignore-gpu-blocklist',
  '--enable-unsafe-swiftshader',
  '--disable-dev-shm-usage'
];

(async () => {
  const report = {
    url: URL,
    console: [],
    pageErrors: [],
    rejections: [],
    protocolExceptions: [],
    protocolLog: [],
    failed: [],
    state: null,
    mode: ''
  };
  const browser = await chromium.launch({ headless: true, args: ARGS });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => {
    window.__FORMATX_REJECTIONS__ = [];
    addEventListener('unhandledrejection', event => {
      const reason = event.reason;
      window.__FORMATX_REJECTIONS__.push({
        name: reason?.name || '',
        message: reason?.message || String(reason),
        stack: reason?.stack || ''
      });
    });
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  cdp.on('Runtime.exceptionThrown', event => report.protocolExceptions.push(event.exceptionDetails));
  cdp.on('Log.entryAdded', event => report.protocolLog.push(event.entry));

  page.on('console', message => report.console.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', error => report.pageErrors.push({
    name: error.name || '',
    message: error.message || String(error),
    stack: error.stack || ''
  }));
  page.on('requestfailed', request => report.failed.push({ url: request.url(), error: request.failure()?.errorText || 'failed' }));

  const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  report.http = response?.status() || 0;
  await page.waitForFunction(() => {
    const root = document.documentElement;
    return root.dataset.fxThree === 'ready' || root.dataset.fxThree === 'error';
  }, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  report.state = await page.evaluate(async () => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const canvas = canvases.at(-1) || null;
    const root = document.documentElement;
    let adapter = null;
    if (navigator.gpu) {
      try {
        const gpuAdapter = await navigator.gpu.requestAdapter();
        adapter = gpuAdapter ? {
          features: Array.from(gpuAdapter.features || []),
          limits: {
            maxBufferSize: Number(gpuAdapter.limits?.maxBufferSize || 0),
            maxStorageBufferBindingSize: Number(gpuAdapter.limits?.maxStorageBufferBindingSize || 0)
          }
        } : null;
      } catch (error) {
        adapter = { error: String(error) };
      }
    }
    return {
      secure: isSecureContext,
      navigatorGpu: Boolean(navigator.gpu),
      three: root.dataset.fxThree || '',
      renderer: root.dataset.fxThreeRenderer || '',
      webgpu: root.dataset.fxWebgpu || '',
      webgpuError: root.dataset.fxWebgpuError || '',
      canvasCount: canvases.length,
      canvas: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
      bodyChildren: document.body.children.length,
      scripts: Array.from(document.scripts, script => script.src),
      rejections: window.__FORMATX_REJECTIONS__ || [],
      adapter
    };
  });
  report.rejections = report.state.rejections;

  const nativeWebGpu = report.state.renderer === 'webgpu-tsl'
    && report.state.webgpu === 'ready'
    && report.rejections.length === 0
    && report.pageErrors.length === 0;
  const recoveredWebGl = report.state.renderer === 'three-webgl'
    && report.state.webgpu === 'fallback'
    && /GPU|WebGPU|popErrorScope|Instance dropped|device|pipeline/i.test(report.state.webgpuError || report.rejections.map(item => item.message).join(' '));
  report.mode = nativeWebGpu ? 'native-webgpu' : recoveredWebGl ? 'webgl2-recovery' : 'failed';

  await page.screenshot({ path: 'webgpu-stage-debug.png' });
  fs.writeFileSync('webgpu-stage-debug.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  await browser.close();

  const blockingConsoleErrors = report.console.filter(entry => entry.type === 'error');
  const success = report.state?.navigatorGpu
    && (nativeWebGpu || recoveredWebGl)
    && report.state?.three === 'ready'
    && report.state?.canvas?.[0] > 0
    && report.failed.length === 0
    && (nativeWebGpu ? blockingConsoleErrors.length === 0 : true);
  process.exitCode = success ? 0 : 1;
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
