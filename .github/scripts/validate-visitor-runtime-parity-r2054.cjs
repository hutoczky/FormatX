'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium, firefox } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT = process.env.FORMATX_PARITY_EVIDENCE_DIR || 'artifacts/r2054-visitor-parity';
fs.mkdirSync(OUT, { recursive: true });
const report = { sha: process.env.AUDITED_SHA || '', url: URL, cases: [], failures: [] };
const write = () => fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

// Observers record the real rendering calls and event order. They do not
// alter shaders, uniforms, timing, geometry, session state or readiness.
function observe() {
  const evidence = window.__fxVisitorEvidence = { draws: 0, ready: [], birth: [], birthStart: [], sweeps: [], options: null, shaders: [], glWork: [], longTasks: [], warmup: [] };
  const recordGlWork = (operation, startedAt, canvas, error) => {
    const returnedAt=performance.now();
    if(evidence.glWork.length<160)evidence.glWork.push({operation,startedAt,returnedAt,duration:returnedAt-startedAt,
      canvasClass:canvas?.className||'',error:error?String(error):null});
  };
  if(window.PerformanceObserver?.supportedEntryTypes?.includes('longtask')){
    new PerformanceObserver(list=>{
      for(const task of list.getEntries())if(evidence.longTasks.length<100)evidence.longTasks.push({startTime:task.startTime,duration:task.duration,name:task.name});
    }).observe({type:'longtask',buffered:true});
  }
  document.addEventListener('formatx:magbirthcorewarmup',event=>evidence.warmup.push({at:performance.now(),detail:event.detail}));
  const nativeCanvas = canvas => canvas?.classList?.contains('fx-crystal-organism-r326-canvas');
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, options) {
    const startedAt=performance.now();
    let gl,error;
    try{gl=getContext.call(this,type,options);}catch(caught){error=caught;throw caught;}
    finally{if(/webgl|2d/.test(type))recordGlWork('getContext:'+type,startedAt,this,error);}
    if (gl && nativeCanvas(this) && /webgl/.test(type)) evidence.options = gl.getContextAttributes();
    return gl;
  };
  for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Type) continue;
    const source = Type.prototype.shaderSource;
    const draw = Type.prototype.drawArrays;
    for(const method of ['compileShader','linkProgram','getProgramParameter']){
      const original=Type.prototype[method];
      if(typeof original!=='function')continue;
      Type.prototype[method]=function(...args){
        if(!nativeCanvas(this.canvas))return original.apply(this,args);
        const startedAt=performance.now();let error;
        try{return original.apply(this,args);}catch(caught){error=caught;throw caught;}
        finally{recordGlWork(method,startedAt,this.canvas,error);}
      };
    }
    Type.prototype.shaderSource = function(shader, text) {
      if (nativeCanvas(this.canvas)) evidence.shaders.push(text);
      return source.call(this, shader, text);
    };
    Type.prototype.drawArrays = function(...args) {
      const result = draw.apply(this, args);
      if (nativeCanvas(this.canvas)) evidence.draws++;
      return result;
    };
  }
  addEventListener('formatx:real3dready', event => {
    const core = window.FormatXLivingCore;
    evidence.ready.push({ at: performance.now(), detail: event.detail, draws: evidence.draws,
      firstFrame: document.documentElement.dataset.fxCoreFirstFrameR1913,
      vertexCount: core?.vertexCount, width: core?.canvas?.width, height: core?.canvas?.height });
  });
  document.addEventListener('formatx:magbirthstart', event => evidence.birthStart.push({ at: performance.now(), detail: event.detail }));
  document.addEventListener('formatx:magbirthcomplete', event => {
    const at = performance.now(), startedAt = evidence.birthStart[0]?.at;
    evidence.birth.push({ at, duration: Number.isFinite(startedAt) ? at - startedAt : null, detail: event.detail });
  });
  addEventListener('formatx:coresurfacesweep', event => evidence.sweeps.push({ at: performance.now(), ...event.detail }));
}

function check(condition, message, failures) {
  if (!condition) failures.push(message);
}

async function visit(browser, engine, profile, identity, userAgent) {
  const viewport = profile === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport, isMobile: engine === 'chromium' && profile === 'mobile',
    hasTouch: profile === 'mobile', deviceScaleFactor: profile === 'mobile' ? 2 : 1,
    locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference',
    ...(userAgent ? { userAgent } : {}) });
  if (identity === 'visitor') await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await context.addInitScript(observe);
  const page = await context.newPage();
  const errors = [], failedRequests = [], failures = [];
  const name = `${engine}-${profile}-${identity}`;
  page.on('pageerror', error => errors.push(String(error)));
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), method: request.method(), error: request.failure()?.errorText }));
  let result = { name, failures, errors, failedRequests };
  try {
    // No audit, proof, forced-intro or renderer-selection query is appended.
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const prepaint = await page.evaluate(() => ({ owner: document.documentElement.dataset.fxIntroPrepaintOwnerR1611,
      show: document.documentElement.dataset.fxIntroPrepaintR1611,
      hardware: { cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory } }));
    check(prepaint.show === 'show' && prepaint.owner === 'first-real-visit', 'Fresh navigation did not start the real intro', failures);
    await page.waitForFunction(() => window.__fxVisitorEvidence.birth.length > 0, null, { timeout: 18000 });
    await page.waitForFunction(() => window.__fxVisitorEvidence.ready.length > 0, null, { timeout: 20000 });
    await page.waitForFunction(() => window.__fxVisitorEvidence.sweeps.some(event => event.phase === 'end' && event.source === 'autonomous'), null, { timeout: 12000 });
    const state = await page.evaluate(() => {
      const core = window.FormatXLivingCore, root = document.documentElement;
      return { evidence: window.__fxVisitorEvidence, renderer: core?.renderer,
        canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length,
        apiOwnsCanvas: Boolean(core?.canvas?.isConnected && core?.stage?.contains(core.canvas)),
        birthRenderer: root.dataset.fxMagBirthRendererR1360, archive: root.dataset.fxArchiveExperience,
        title: document.querySelector('#hero-title')?.textContent?.trim(),
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        birthDuration: root.dataset.fxMagBirthDurationR1549 };
    });
    const initial = state.evidence.ready[0];
    check(initial?.draws > 0 && initial?.firstFrame === 'painted', 'Ready was published before a successful native draw', failures);
    check(state.canvasCount === 1 && state.apiOwnsCanvas, 'Canonical MAG does not have one connected canvas owner', failures);
    check(state.renderer === 'single-webgl-crystal-organism-r326', 'Real WebGL MAG renderer is missing', failures);
    check(state.evidence.options?.preserveDrawingBuffer === false, 'Rendering context differs from the normal visitor context', failures);
    check(state.overflow <= 2, `Horizontal overflow: ${state.overflow}`, failures);
    check(errors.length === 0, 'JavaScript errors occurred', failures);
    check(failedRequests.length === 0, 'Resource requests failed', failures);
    const shaders = state.evidence.shaders.map(source => crypto.createHash('sha256').update(source).digest('hex'));
    result = { ...result, prepaint, ...state, signature: { renderer: state.renderer, vertexCount: initial.vertexCount,
      options: state.evidence.options, shaders, birthRenderer: state.birthRenderer, title: state.title, archive: state.archive } };
    await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: false });
  } catch (error) {
    failures.push(String(error));
    result.partial = await page.evaluate(() => ({ evidence: window.__fxVisitorEvidence,
      dataset: { ...document.documentElement.dataset } })).catch(() => null);
    await page.screenshot({ path: path.join(OUT, name + '-failure.png'), timeout: 10000 }).catch(() => {});
  } finally {
    const observed=result.evidence||result.partial?.evidence;
    console.log('VISITOR_STARTUP_BLOCKING_EVIDENCE',JSON.stringify({name,birth:observed?.birth,warmup:observed?.warmup,
      ready:observed?.ready,glWork:observed?.glWork,longTasks:observed?.longTasks,
      rendererState:result.partial?.dataset?.fxCrystalOrganismR326,failures}));
    report.cases.push(result);
    report.failures.push(...failures.map(message => `${name}: ${message}`));
    write();
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  try {
    const probe = await browser.newPage();
    const userAgent = (await probe.evaluate(() => navigator.userAgent)).replace('HeadlessChrome', 'Chrome');
    await probe.close();
    for (const profile of ['desktop', 'mobile']) {
      for (const identity of ['visitor', 'webdriver', 'lighthouse']) {
        await visit(browser, 'chromium', profile, identity,
          identity === 'lighthouse' ? userAgent + ' Chrome-Lighthouse' : identity === 'visitor' ? userAgent : undefined);
      }
      const cases = report.cases.filter(item => item.name.startsWith(`chromium-${profile}-`));
      if (cases.every(item => item.signature)) {
        for (const item of cases.slice(1)) {
          try {
            assert.deepEqual(item.prepaint.hardware, cases[0].prepaint.hardware);
            assert.deepEqual(item.signature, cases[0].signature);
          } catch (error) { report.failures.push(`${item.name}: rendered visitor parity failed: ${error.message}`); }
        }
      }
    }
  } finally { await browser.close(); }
  const gecko = await firefox.launch({ headless: true });
  try { for (const profile of ['desktop', 'mobile']) await visit(gecko, 'firefox', profile, 'visitor'); }
  finally { await gecko.close(); }
  write();
  console.log(JSON.stringify({ cases: report.cases.length, failures: report.failures }, null, 2));
  if (report.failures.length) process.exitCode = 1;
})().catch(error => { report.failures.push(String(error.stack || error)); write(); console.error(error); process.exitCode = 1; });
