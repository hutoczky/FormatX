'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const origin = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4173/scifi-ui/';
const output = process.env.FORMATX_CAPTURE_DIR || 'artifacts/r484-surface-energy';
fs.mkdirSync(output, { recursive: true });

// Instrument the *completed* native draw, not a cleared default framebuffer
// queried after browser compositing. These hooks exist only in this test.
function instrumentNativeFrames() {
  const audit = window.__magEnergyAudit = { frames: 0, maximumPhase: -1, events: [], captures: {} };
  const names = new WeakMap();
  const states = new WeakMap();
  const stateFor = gl => {
    if (!states.has(gl)) states.set(gl, { layer: -1, phase: -1, depthWrite: true });
    return states.get(gl);
  };
  addEventListener('formatx:coresurfacesweep', event => {
    audit.events.push({ ...event.detail, at: performance.now() });
  });
  const capture = (gl, label, phase) => {
    const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const grid = [], size = 64;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const px = Math.min(width - 1, Math.floor((x + .5) * width / size));
      const py = Math.min(height - 1, Math.floor((y + .5) * height / size));
      const index = (py * width + px) * 4;
      grid.push(.2126 * pixels[index] + .7152 * pixels[index + 1] + .0722 * pixels[index + 2]);
    }
    audit.captures[label] = {
      phase, width, height, grid,
      mean: grid.reduce((sum, value) => sum + value, 0) / grid.length,
      maximum: Math.max(...grid),
      coverage: grid.filter(value => value > 8).length / grid.length,
      png: gl.canvas.toDataURL('image/png')
    };
  };
  for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Type) continue;
    const proto = Type.prototype;
    const getUniformLocation = proto.getUniformLocation;
    const uniform1f = proto.uniform1f;
    const depthMask = proto.depthMask;
    const drawArrays = proto.drawArrays;
    proto.getUniformLocation = function(program, name) {
      const location = getUniformLocation.call(this, program, name);
      if (location) names.set(location, name);
      return location;
    };
    proto.uniform1f = function(location, value) {
      const state = stateFor(this);
      if (names.get(location) === 'uLayer') state.layer = value;
      if (names.get(location) === 'uSurfacePulse') state.phase = value;
      return uniform1f.call(this, location, value);
    };
    proto.depthMask = function(enabled) {
      stateFor(this).depthWrite = enabled;
      return depthMask.call(this, enabled);
    };
    proto.drawArrays = function(...args) {
      const result = drawArrays.apply(this, args);
      const state = stateFor(this);
      if (this.canvas?.matches('#hero .fx-crystal-organism-r326-canvas') && state.layer === 0 && state.depthWrite) {
        audit.frames++;
        audit.maximumPhase = Math.max(audit.maximumPhase, state.phase);
        if (state.phase < 0 && !audit.captures.idle) capture(this, 'idle', state.phase);
        if (state.phase >= .22 && state.phase <= .40 && !audit.captures.early) capture(this, 'early', state.phase);
        if (state.phase >= .62 && state.phase <= .80 && !audit.captures.late) capture(this, 'late', state.phase);
      }
      return result;
    };
  }
}

function surfaceChange(idle, sweep) {
  let energy = 0, weightedY = 0, changed = 0;
  sweep.grid.forEach((value, index) => {
    const delta = Math.max(0, value - idle.grid[index] - 5);
    energy += delta;
    weightedY += delta * Math.floor(index / 64);
    if (delta > 6) changed++;
  });
  return { energy, centroidY: weightedY / Math.max(1, energy), changed };
}

async function verify(browser, name, viewport, mobile) {
  const context = await browser.newContext({
    viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
    locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference'
  });
  await context.addInitScript(instrumentNativeFrames);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const report = { name, viewport, mobile };
  try {
    const url = new URL(origin);
    url.searchParams.set('r484-energy-check', `${name}-${Date.now()}`);
    url.searchParams.set('lang', 'hu');
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => (
      document.documentElement.dataset.fxCoreSurfaceEnergyR484 === 'periodic-native-surface-energy'
      && document.documentElement.dataset.fxCrystalOrganismR326 === 'ready'
    ), null, { timeout: 60000 });
    await page.screenshot({ path: path.join(output, `${name}-idle.png`), timeout: 10000 });

    // No click, artificial API pulse, hover or pointer movement is used here.
    await page.waitForFunction(() => __magEnergyAudit.events.some(e => e.phase === 'end' && e.source === 'autonomous'), null, { timeout: 18000 });
    await page.waitForTimeout(600);
    const frameCount = await page.evaluate(() => __magEnergyAudit.frames);
    await page.waitForTimeout(1000);
    report.idleFrames = await page.evaluate(before => __magEnergyAudit.frames - before, frameCount);
    assert.equal(report.idleFrames, 0, `${name}: native renderer must rest between sweeps`);
    await page.waitForFunction(() => __magEnergyAudit.events.filter(e => e.phase === 'end' && e.source === 'autonomous').length >= 2, null, { timeout: 14000 });
    await page.waitForTimeout(250);

    const audit = await page.evaluate(() => window.__magEnergyAudit);
    for (const [label, capture] of Object.entries(audit.captures)) {
      fs.writeFileSync(path.join(output, `${name}-native-${label}.png`), Buffer.from(capture.png.split(',')[1], 'base64'));
      delete capture.png;
    }
    report.audit = audit;
    assert.ok(audit.maximumPhase > .85, `${name}: sweep truncated at phase ${audit.maximumPhase}`);
    const starts = audit.events.filter(e => e.phase === 'start' && e.source === 'autonomous');
    const ends = audit.events.filter(e => e.phase === 'end' && e.source === 'autonomous');
    assert.ok(starts.length >= 2 && ends.length >= 2, `${name}: recurring autonomous sweep missing`);
    report.intervalMs = starts[1].at - starts[0].at;
    report.durationMs = ends[0].at - starts[0].at;
    assert.ok(report.intervalMs >= 4500 && report.intervalMs < 8500, `${name}: interval ${report.intervalMs}ms`);
    assert.ok(report.durationMs >= 1100 && report.durationMs < 2300, `${name}: duration ${report.durationMs}ms`);
    assert.ok(audit.captures.idle && audit.captures.early && audit.captures.late, `${name}: missing complete native sweep captures`);
    assert.ok(audit.captures.idle.maximum > 70 && audit.captures.idle.coverage > .02, `${name}: resting MAG is too dim`);
    report.earlyChange = surfaceChange(audit.captures.idle, audit.captures.early);
    report.lateChange = surfaceChange(audit.captures.idle, audit.captures.late);
    assert.ok(report.earlyChange.changed >= 8 && report.lateChange.changed >= 8, `${name}: surface energy is not visibly distinct`);
    assert.ok(Math.abs(report.lateChange.centroidY - report.earlyChange.centroidY) > 3, `${name}: light does not travel along the surface`);

    report.dom = await page.evaluate(() => {
      const root = document.documentElement;
      const canvas = document.querySelector('#hero .fx-crystal-organism-r326-canvas');
      const style = getComputedStyle(canvas);
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return {
        canvasCount: document.querySelectorAll('#hero canvas').length,
        legacyCount: document.querySelectorAll('#hero .fx-three-frame, #hero .fx-core-mobile-v55-stage:not(.fx-crystal-organism-r326-stage)').length,
        overflow: Math.max(0, root.scrollWidth - innerWidth),
        filter: style.filter, opacity: Number(style.opacity),
        glError: gl.getError(), budget: root.dataset.fxMobileSurfaceBudgetR484,
        policy: root.dataset.fxCoreMobileIdlePolicyR426,
        shape: root.dataset.fxCoreShapeR337
      };
    });
    assert.equal(report.dom.canvasCount, 1, `${name}: duplicate native canvases`);
    assert.equal(report.dom.legacyCount, 0, `${name}: obsolete MAG stage returned`);
    assert.equal(report.dom.glError, 0, `${name}: WebGL error`);
    assert.ok(report.dom.overflow <= 1, `${name}: horizontal overflow`);
    if (mobile) {
      assert.match(report.dom.filter, /brightness\(1\.02\)/);
      assert.match(report.dom.filter, /contrast\(0\.98\)/);
      assert.match(report.dom.filter, /blur\(0\.3px\)/);
      assert.equal(report.dom.budget, 'full-1160ms-sweep-then-zero-idle');
    }

    const pause = page.locator('#hero .fx-reference-pause').first();
    await pause.click();
    await page.waitForFunction(() => document.querySelector('#hero .fx-reference-pause')?.dataset.paused === 'true');
    await page.waitForTimeout(300);
    const pausedCount = await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length);
    await page.waitForTimeout(6800);
    assert.equal(await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length), pausedCount, `${name}: sweep ignores PAUSE`);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.fxCoreSurfaceSchedulerR484), 'suspended');
    await pause.click();
    await page.waitForFunction(count => __magEnergyAudit.events.filter(e => e.phase === 'start').length > count, pausedCount, { timeout: 10000 });
    report.pauseResume = 'passed';

    // Scroll completely past the MAG: there must be no background pulse timer.
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.documentElement.dataset.fxCoreSurfaceSchedulerR484 === 'suspended', null, { timeout: 10000 });
    const offscreenCount = await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length);
    await page.waitForTimeout(6800);
    assert.equal(await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length), offscreenCount, `${name}: offscreen sweep still running`);
    report.offscreen = 'passed';

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.fxCoreSurfaceSchedulerR484), 'suspended');
    const reducedCount = await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length);
    await page.waitForTimeout(6800);
    assert.equal(await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length), reducedCount, `${name}: reduced-motion sweep still running`);
    report.reducedMotion = 'passed';
    await page.screenshot({ path: path.join(output, `${name}-final.png`), timeout: 10000 });
    assert.deepEqual(errors, [], `${name}: page errors`);
    report.result = 'passed';
    console.log(`PASS ${name}: ${Math.round(report.durationMs)}ms native surface sweep / ${Math.round(report.intervalMs)}ms interval; zero idle frames; pause, offscreen, reduced motion passed`);
  } catch (error) {
    report.result = 'failed';
    report.error = String(error.stack || error);
    report.failureState = await page.evaluate(() => ({ audit: window.__magEnergyAudit, root: { ...document.documentElement.dataset } })).catch(() => null);
    await page.screenshot({ path: path.join(output, `${name}-failure.png`), timeout: 8000 }).catch(() => {});
    throw error;
  } finally {
    report.pageErrors = errors;
    fs.writeFileSync(path.join(output, `${name}-report.json`), JSON.stringify(report, null, 2));
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: [
    '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
  ] });
  try {
    await verify(browser, 'mobile-390', { width: 390, height: 844 }, true);
    await verify(browser, 'mobile-430', { width: 430, height: 932 }, true);
    await verify(browser, 'desktop-1440', { width: 1440, height: 960 }, false);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
