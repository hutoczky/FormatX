'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');

const origin = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4173/scifi-ui/';
const output = process.env.FORMATX_CAPTURE_DIR || 'artifacts/r484-surface-energy';
fs.mkdirSync(output, { recursive: true });

// Timing instrumentation must not synchronously read back the GPU: doing that
// inside RAF stalls SwiftShader and changes the very timing being measured.
// Separate, deterministic single-frame screenshots below test visible motion.
function instrumentNativeFrames() {
  const audit = window.__magEnergyAudit = { frames: 0, maximumPhase: -1, phases: [], events: [] };
  const names = new WeakMap();
  const states = new WeakMap();
  const stateFor = gl => {
    if (!states.has(gl)) states.set(gl, { layer: -1, phase: -1, depthWrite: true });
    return states.get(gl);
  };
  addEventListener('formatx:coresurfacesweep', event => {
    audit.events.push({ ...event.detail, at: performance.now() });
  });
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
      // Only the later screenshot pass pins uniforms; the autonomous timing
      // pass above runs the unmodified production values and scheduler.
      if (Number.isFinite(window.__magCapturePhase)) {
        const fixed = { uSurfacePulse: window.__magCapturePhase, uTime: 0, uEnergy: .5, uBreath: .12 };
        if (Object.hasOwn(fixed, names.get(location))) value = fixed[names.get(location)];
      }
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
        if (state.phase >= 0) {
          audit.phases.push(state.phase);
          if (audit.phases.length > 180) audit.phases.shift();
        }
      }
      return result;
    };
  }
}

async function captureSurface(page, name, label, phase) {
  await page.evaluate(phase => {
    window.__magCapturePhase = phase;
    document.documentElement.dataset.fxReferenceMotionPaused = 'false';
    window.FormatXCoreMobileV69.requestRender(1);
  }, phase);
  await page.waitForTimeout(180);
  const box = await page.locator('#hero .fx-crystal-organism-r326-canvas').boundingBox();
  // Capture the actual compositor directly. Playwright's global animation
  // fast-forward also fires unrelated page animations and can change layout.
  const session = await page.context().newCDPSession(page);
  let screenshot;
  let timeout;
  try {
    const result = await Promise.race([
      session.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error(`Compositor capture timeout: ${name}/${label}`)), 30000); })
    ]);
    screenshot = Buffer.from(result.data, 'base64');
  } finally {
    clearTimeout(timeout);
    await session.detach();
  }
  fs.writeFileSync(path.join(output, `${name}-${label}.png`), screenshot);
  const png = PNG.sync.read(screenshot);
  const viewport = page.viewportSize();
  const scale = png.width / viewport.width;
  const grid = [];
  const left = Math.max(0, box.x), top = Math.max(0, box.y);
  const width = Math.min(viewport.width, box.x + box.width) - left;
  const height = Math.min(viewport.height, box.y + box.height) - top;
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const px = Math.min(png.width - 1, Math.floor((left + (x + .5) * width / 64) * scale));
    const py = Math.min(png.height - 1, Math.floor((top + (y + .5) * height / 64) * scale));
    const index = (py * png.width + px) * 4;
    grid.push(.2126 * png.data[index] + .7152 * png.data[index + 1] + .0722 * png.data[index + 2]);
  }
  return { phase, grid, mean: grid.reduce((sum, value) => sum + value, 0) / grid.length,
    maximum: Math.max(...grid), coverage: grid.filter(value => value > 20).length / grid.length };
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
    url.searchParams.set('r486-optics-energy-check', `${name}-${Date.now()}`);
    url.searchParams.set('lang', 'hu');
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => (
      document.documentElement.dataset.fxCoreSurfaceEnergyR484 === 'periodic-native-surface-energy'
      && document.documentElement.dataset.fxCrystalOrganismR326 === 'ready'
    ), null, { timeout: 60000 });
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
    report.audit = audit;
    // SwiftShader cadence varies with runner load. Allow one measured frame
    // interval at the end, not a guessed fixed FPS. A 240ms governor cutoff
    // still fails both the halfway and full-window coverage checks below.
    let previousPhase = 0;
    let maximumPhaseStep = 0;
    for (const phase of audit.phases) {
      if (phase < previousPhase) previousPhase = 0; // next autonomous sweep
      maximumPhaseStep = Math.max(maximumPhaseStep, phase - previousPhase);
      previousPhase = phase;
    }
    report.maximumPhaseStep = maximumPhaseStep;
    assert.ok(audit.phases.length >= 3 && audit.maximumPhase > .5,
      `${name}: sweep did not render beyond its midpoint`);
    assert.ok(audit.maximumPhase + maximumPhaseStep >= .97,
      `${name}: sweep truncated at phase ${audit.maximumPhase}; measured frame step ${maximumPhaseStep}`);
    const starts = audit.events.filter(e => e.phase === 'start' && e.source === 'autonomous');
    const ends = audit.events.filter(e => e.phase === 'end' && e.source === 'autonomous');
    assert.ok(starts.length >= 2 && ends.length >= 2, `${name}: recurring autonomous sweep missing`);
    report.intervalMs = starts[1].at - starts[0].at;
    report.durationMs = ends[0].at - starts[0].at;
    assert.ok(report.intervalMs >= 4500 && report.intervalMs < 8500, `${name}: interval ${report.intervalMs}ms`);
    assert.ok(report.durationMs >= 1100 && report.durationMs < 2300, `${name}: duration ${report.durationMs}ms`);
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
        shape: root.dataset.fxCoreShapeR337,
        optics: root.dataset.fxPrimaryMagOpticsR486 || '',
        ancestors: (() => { const list = []; for (let node = canvas; node; node = node.parentElement) {
          const s = getComputedStyle(node); list.push({ tag: node.tagName, id: node.id, class: node.className, opacity: s.opacity, filter: s.filter, blend: s.mixBlendMode });
        } return list; })()
      };
    });
    assert.equal(report.dom.canvasCount, 1, `${name}: duplicate native canvases`);
    assert.equal(report.dom.legacyCount, 0, `${name}: obsolete MAG stage returned`);
    assert.equal(report.dom.glError, 0, `${name}: WebGL error`);
    assert.ok(report.dom.overflow <= 1, `${name}: horizontal overflow`);
    if (mobile) {
      assert.match(report.dom.filter, /brightness\(0?\.965\)/);
      assert.match(report.dom.filter, /contrast\(0?\.885\)/);
      assert.match(report.dom.filter, /saturate\(1\.14\)/);
      assert.match(report.dom.filter, /blur\(0?\.58px\)/);
      assert.equal(report.dom.optics, 'calmer-luminance-feathered-mobile-silhouette');
      assert.equal(report.dom.budget, 'full-1160ms-sweep-then-zero-idle');
    }

    // Timing above used unmodified uniforms. Pin the same native material at
    // three phases only for this image comparison, keeping the normal layout.
    await page.locator('#hero .fx-crystal-organism-r326-canvas').evaluate(canvas => canvas.getAnimations().forEach(animation => animation.pause()));
    report.captures = {};
    report.captures.idle = await captureSurface(page, name, 'idle', -1);
    report.captures.early = await captureSurface(page, name, 'surface-early', .38);
    report.captures.late = await captureSurface(page, name, 'surface-late', .68);
    await page.evaluate(() => { delete window.__magCapturePhase; });
    await page.locator('#hero .fx-crystal-organism-r326-canvas').evaluate(canvas => canvas.getAnimations().forEach(animation => animation.play()));
    assert.ok(report.captures.idle.maximum > 60 && report.captures.idle.coverage > .02, `${name}: resting MAG is too dim`);
    report.earlyChange = surfaceChange(report.captures.idle, report.captures.early);
    report.lateChange = surfaceChange(report.captures.idle, report.captures.late);
    assert.ok(report.earlyChange.changed >= 8 && report.lateChange.changed >= 8, `${name}: surface energy is not visibly distinct`);
    assert.ok(Math.abs(report.lateChange.centroidY - report.earlyChange.centroidY) > 3, `${name}: light does not travel along the surface`);

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

    // Stay in a middle section. The production desktop intentionally loops
    // from the footer back to MAG, so scrolling to the bottom is not an
    // offscreen test. Verify the actual canvas bounds as well as the timer.
    await page.locator('#pricing').evaluate(section => section.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForFunction(() => {
      const box = document.querySelector('#hero .fx-crystal-organism-r326-canvas').getBoundingClientRect();
      return (box.bottom <= 0 || box.top >= innerHeight)
        && document.documentElement.dataset.fxCoreSurfaceSchedulerR484 === 'suspended';
    }, null, { timeout: 10000 });
    const offscreenCount = await page.evaluate(() => __magEnergyAudit.events.filter(e => e.phase === 'start').length);
    await page.waitForTimeout(6800);
    report.offscreenBounds = await page.locator('#hero .fx-crystal-organism-r326-canvas').evaluate(canvas => {
      const box = canvas.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, viewportHeight: innerHeight };
    });
    assert.ok(report.offscreenBounds.bottom <= 0 || report.offscreenBounds.top >= report.offscreenBounds.viewportHeight,
      `${name}: page returned to MAG during the offscreen test`);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.fxCoreSurfaceSchedulerR484), 'suspended');
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

    assert.deepEqual(errors, [], `${name}: page errors`);
    report.result = 'passed';
    console.log(`PASS ${name}: ${Math.round(report.durationMs)}ms native surface sweep / ${Math.round(report.intervalMs)}ms interval; zero idle frames; R486 mobile optics, pause, offscreen, reduced motion passed`);
  } catch (error) {
    report.result = 'failed';
    report.error = String(error.stack || error);
    report.failureState = await page.evaluate(() => ({ audit: window.__magEnergyAudit, root: { ...document.documentElement.dataset } })).catch(() => null);
    await page.screenshot({ path: path.join(output, `${name}-failure.png`), animations: 'disabled', timeout: 10000 }).catch(() => {});
    throw error;
  } finally {
    report.pageErrors = errors;
    fs.writeFileSync(path.join(output, `${name}-report.json`), JSON.stringify(report, null, 2));
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: process.env.FORMATX_HEADFUL !== '1', args: [
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