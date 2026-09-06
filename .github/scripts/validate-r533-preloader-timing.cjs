'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME = process.env.CHROME_BIN;
const OUT = process.env.FORMATX_R533_EVIDENCE_DIR || 'artifacts/r533-preloader-timing';
fs.mkdirSync(OUT, { recursive: true });

function testUrl(name) { const url = new URL(BASE); url.searchParams.set('r543_preloader', `${name}-${Date.now()}`); return url.href; }
function cssTimeToMs(value) { const first = String(value || '').split(',')[0].trim(); if (first.endsWith('ms')) return Number.parseFloat(first); if (first.endsWith('s')) return Number.parseFloat(first) * 1000; return NaN; }

async function verify(browser, spec) {
  const context = await browser.newContext({ viewport: spec.viewport, isMobile: spec.mobile, hasTouch: spec.mobile, deviceScaleFactor: spec.mobile ? 2 : 1, locale: 'hu-HU', colorScheme: 'dark', reducedMotion: 'no-preference' });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|WebGL|WebGPU|GPU/i.test(message.text())) errors.push(message.text()); });
  await page.addInitScript(() => {
    window.__fxR543PreloaderEvidence = { completeAt: null, source: null, activeContract: null, magReadyAt: null };
    const capture = () => {
      const evidence = window.__fxR543PreloaderEvidence; if (!evidence) return;
      const root = document.documentElement;
      if (evidence.magReadyAt == null && (root.dataset.fxCrystalOrganismR326 === 'ready' || String(root.dataset.fxCurrentMagRequestR530 || '').startsWith('navigation-owned'))) evidence.magReadyAt = performance.now();
      if (evidence.activeContract) return;
      const overlay = document.getElementById('formatx-event-horizon'); if (!(overlay instanceof HTMLElement) || overlay.dataset.fxPreloaderR531 !== 'active') return;
      const main = document.querySelector('main'); const hero = document.getElementById('hero'); const s = getComputedStyle(overlay);
      evidence.activeContract = { capturedAt: performance.now(), animationName: s.animationName, animationDuration: s.animationDuration, animationFillMode: s.animationFillMode, mainVisibility: main ? getComputedStyle(main).visibility : '', mainDisplay: main ? getComputedStyle(main).display : '', heroVisibility: hero ? getComputedStyle(hero).visibility : '', heroDisplay: hero ? getComputedStyle(hero).display : '', heroHeight: hero?.getBoundingClientRect().height || 0 };
    };
    const observer = new MutationObserver(capture); observer.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-fx-preloader-r531','data-fx-crystal-organism-r326','data-fx-current-mag-request-r530'] });
    document.addEventListener('DOMContentLoaded', capture, { once: true, capture: true });
    document.addEventListener('formatx:preloadercomplete', event => { capture(); window.__fxR543PreloaderEvidence.completeAt = performance.now(); window.__fxR543PreloaderEvidence.source = String(event?.detail?.source || ''); observer.disconnect(); }, { once: true, capture: true });
  });
  try {
    await page.goto(testUrl(spec.name), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.fxPreloaderR531 === 'done', null, { timeout: 10000 });
    const state = await page.evaluate(() => { const root=document.documentElement, overlay=document.getElementById('formatx-event-horizon'), hero=document.getElementById('hero'), hs=hero?getComputedStyle(hero):null; return { evidence:window.__fxR543PreloaderEvidence||{}, timing:root.dataset.fxPreloaderTimingR533||'', bootAt:Number(root.dataset.fxPreloaderBootR533||NaN), lateSkip:root.dataset.fxPreloaderLateSkipR533==='true', preloader:root.dataset.fxPreloaderR531||'', release:root.dataset.fxPreloaderReleaseR531||'', overlayHidden:overlay?overlay.hidden:true, overlayDisplay:overlay?getComputedStyle(overlay).display:'none', heroVisible:Boolean(hero&&hs&&hs.display!=='none'&&hs.visibility!=='hidden'&&hero.getBoundingClientRect().height>0), pauseCount:document.querySelectorAll('.fx-reference-pause').length, overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth }; });
    const completeAt=Number(state.evidence.completeAt), source=String(state.evidence.source||state.release||''), duration=completeAt-state.bootAt, active=state.evidence.activeContract;
    assert.ok(Number.isFinite(completeAt)); assert.ok(Number.isFinite(state.bootAt)); assert.equal(state.timing,spec.timing); assert.equal(state.preloader,'done'); assert.equal(state.overlayHidden,true); assert.equal(state.heroVisible,true); assert.equal(state.pauseCount,0); assert.ok(state.overflow<=2); assert.ok(!/runtime-error|promise-error/.test(source));
    if (source==='late-boot-skip') { assert.equal(state.lateSkip,true); assert.ok(state.bootAt>=spec.max-20); assert.ok(duration>=0&&duration<=180); assert.equal(state.overlayDisplay,'none'); }
    else { assert.equal(state.lateSkip,false); assert.ok(active); assert.match(String(active.animationName),/fx-r533-preloader-visual-bound/); const animationMs=cssTimeToMs(active.animationDuration); assert.ok(Number.isFinite(animationMs)&&Math.abs(animationMs-spec.visualMax)<=20,`${spec.name}: wrong compositor bound ${active.animationDuration}`); assert.match(String(active.animationFillMode),/both/); assert.notEqual(active.mainVisibility,'hidden'); assert.notEqual(active.mainDisplay,'none'); assert.notEqual(active.heroVisibility,'hidden'); assert.notEqual(active.heroDisplay,'none'); assert.ok(active.heroHeight>0); assert.ok(duration>=spec.min-20,`${spec.name}: intro released early ${duration}ms`); assert.ok(duration<=spec.max+220,`${spec.name}: logical release exceeded bounded window ${duration}ms`); if(Number.isFinite(state.evidence.magReadyAt)) assert.ok(state.evidence.magReadyAt<=completeAt,`${spec.name}: MAG started after intro release`); }
    assert.equal(errors.length,0,`${spec.name}: browser errors ${errors.join(' | ')}`);
    return { name:spec.name, viewport:spec.viewport, minMs:spec.min, maxMs:spec.max, visualMaxMs:spec.visualMax, bootAtMs:state.bootAt, completeAtMs:completeAt, magReadyAtMs:state.evidence.magReadyAt, logicalDurationMs:duration, source, timing:state.timing, overflow:state.overflow };
  } finally { await context.close(); }
}

(async()=>{
  assert.ok(CHROME,'CHROME_BIN is required');
  const browser=await chromium.launch({ executablePath:CHROME, headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'] });
  try {
    const report={ auditedSha:process.env.AUDITED_SHA||'', contract:'r543-extended-static-intro-mag-behind-compositor-bounded', mobile:await verify(browser,{name:'mobile-390x844',viewport:{width:390,height:844},mobile:true,min:1180,max:1450,visualMax:1360,timing:'mobile-1180-1450'}), desktop:await verify(browser,{name:'desktop-1440x900',viewport:{width:1440,height:900},mobile:false,min:1350,max:1650,visualMax:1640,timing:'desktop-1350-1650'}) };
    fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n'); console.log('R543_PRELOADER_TIMING_PASS'); console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(error=>{fs.writeFileSync(path.join(OUT,'report-failure.json'),JSON.stringify({error:String(error?.stack||error)},null,2)+'\n');console.error(error?.stack||error);process.exit(1);});