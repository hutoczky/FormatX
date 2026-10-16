'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { chromium } = require('playwright');
const url = process.env.FORMATX_ARCHIVE_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';

const archiveSource=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const layoutStart=archiveSource.indexOf('  const folioLayoutStates=new WeakMap();');
assert.ok(layoutStart>=0,'The original chapter owner must retain native folio layout state');
const layoutSource=archiveSource.slice(layoutStart,archiveSource.indexOf('  function syncCinema(){',layoutStart));
for(const initial of [[],[['content-visibility','auto',''],['contain-intrinsic-size','auto 700px','important']]]){
  const properties=new Map(initial.map(([name,value,priority])=>[name,{value,priority}]));
  properties.set('opacity',{value:'.7',priority:'important'});
  const original=JSON.stringify([...properties]);let writes=0;
  const panel={style:{getPropertyValue:name=>properties.get(name)?.value||'',
    getPropertyPriority:name=>properties.get(name)?.priority||'',
    setProperty(name,value,priority){writes++;properties.set(name,{value,priority});},
    removeProperty(name){writes++;properties.delete(name);}}};
  const context={WeakMap};vm.createContext(context);vm.runInContext(layoutSource,context);
  context.setFolioLayout(panel,false,true);
  assert.equal(panel.style.getPropertyValue('content-visibility'),'hidden');
  assert.equal(panel.style.getPropertyPriority('content-visibility'),'important');
  const hiddenWrites=writes;context.setFolioLayout(panel,false,true);
  assert.equal(writes,hiddenWrites,'An unchanged hidden folio must not receive repeated style writes');
  context.setFolioLayout(panel,true,true);
  assert.equal(panel.style.getPropertyValue('content-visibility'),'visible');
  const visibleWrites=writes;context.setFolioLayout(panel,true,true);
  assert.equal(writes,visibleWrites,'An unchanged active folio must not receive repeated style writes');
  context.setFolioLayout(panel,false,false);
  assert.equal(JSON.stringify([...properties]),original,'Fallback must restore exact prior inline values and priorities');
  const restoredWrites=writes;context.setFolioLayout(panel,false,false);
  assert.equal(writes,restoredWrites,'Repeated fallback restoration must be idempotent');
}
console.log('ARCHIVE_FOLIO_LAYOUT_RESTORE_R2116_PASS');

(async () => {
  const browser = await chromium.launch({ headless: true, args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'
  ] });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
        colorScheme: 'dark', locale: 'hu-HU'
      });
      try {
        const page = await context.newPage();
        await page.route('**/formatx-cinematic-archive-r1987.css*', route => {
          if (!new URL(route.request().url()).searchParams.has('fx-folio-layout-regression'))
            return route.continue();
          const css = fs.readFileSync('docs/scifi-ui/styles/formatx-cinematic-archive-r1987.css', 'utf8');
          return route.fulfill({ contentType: 'text/css', body: css + '\n'
            + 'html:root:root:root[data-fx-archive-cinema="active"] body.living-architecture main#main-content '
            + '.fx-archive-cinema-folio-r2030{content-visibility:visible!important;contain-intrinsic-size:900px!important}' });
        });
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // Match the original archive fixture's readiness budget. Automatic
        // first-visit duration remains independently asserted by its timing lane.
        await page.waitForFunction(() => document.documentElement.dataset.fxArchiveExperience === 'ready'
          && document.querySelector('[data-fx-cinema-panel-active="true"]')?.dataset.fxCinemaSource,
        null, { timeout: 90000 });
        await page.evaluate(() => { window.__r2110OriginalCanvas = window.FormatXLivingCore.canvas; });
        for (const key of ['ecosystem', 'diagnostics', 'systems']) {
          const state = await page.evaluate(key => new Promise((resolve, reject) => {
            const scene = window.FormatXArchiveExperience.scenes.find(scene => scene.key === key);
            const node = document.querySelector(/^[#.]/.test(scene.id) ? scene.id : '#' + scene.id);
            const box = node.getBoundingClientRect();
            const destination = Math.max(0, scrollY + box.top + box.height / 2 - innerHeight * .52);
            let deadline;
            const snapshot = () => {
              clearTimeout(deadline);
              removeEventListener('scroll', snapshot);
              const panel = document.querySelector('[data-fx-cinema-panel-active="true"]');
              const panels = [...document.querySelectorAll('.fx-archive-cinema-folio-r2030')];
              let opacity = 1, painted = Boolean(panel);
              for (let node = panel; node; node = node.parentElement) {
                const style = getComputedStyle(node);
                opacity *= Number(style.opacity);
                if (style.display === 'none' || style.contentVisibility === 'hidden') painted = false;
              }
              const rect = panel?.getBoundingClientRect();
              const currentHost = document.querySelector('[data-fx-archive-scene="' + key + '"]');
              const originalHeading = currentHost?.querySelector('h2,h3');
              const handoff = document.querySelector('.fx-archive-physical-paper-r2026');
              const visiblePaper = painted && opacity > .1 && rect?.width > 8 && rect?.height > 8
                && rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight;
              resolve({ key, expectedSource: scene.source, scene: window.FormatXArchiveExperience.state.scene,
                source: panel?.dataset.fxCinemaSource, activeCount: panels.filter(panel => panel.dataset.fxCinemaPanelActive === 'true').length,
                focusSafe: panels.every(panel => panel.inert === (panel.dataset.fxCinemaPanelActive !== 'true')),
                originalTitle: originalHeading?.textContent.trim().slice(0, 140),
                handoffTitle: handoff?.querySelector('.fx-archive-telemetry-r2022__title')?.textContent.trim(),
                handoffChapter: handoff?.dataset.scene,
                visiblePaper, opacity,
                sameCanvas: window.FormatXLivingCore.canvas === window.__r2110OriginalCanvas,
                canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length });
            };
            addEventListener('scroll', snapshot, { once: true });
            deadline = setTimeout(() => { removeEventListener('scroll', snapshot); reject(new Error('Native scroll did not reach ' + key)); }, 8000);
            if (Math.abs(destination - scrollY) < 1) snapshot();
            else scrollTo({ top: destination, behavior: 'instant' });
          }), key);
          assert.equal(state.scene, key, 'The native scroll selected another chapter');
          assert.equal(state.source, state.expectedSource, 'The original folio source must commit in the same native scroll event as its chapter');
          assert.equal(state.handoffChapter, key, 'The MAG handoff must identify the same chapter in the native scroll event');
          assert.ok(state.originalTitle?.length > 5, 'The active original chapter heading must be present');
          assert.equal(state.handoffTitle, state.originalTitle, 'The MAG handoff must retain the actual original chapter title without a deferred-frame mismatch');
          assert.equal(state.visiblePaper, true, 'The original native paper must be visible through every ancestor, not only report visibility on itself');
          assert.equal(state.activeCount, 1, 'Chapter handoff must show one original native paper');
          assert.equal(state.focusSafe, true, 'Inactive original papers must remain inert during chapter handoff');
          assert.equal(state.sameCanvas, true, 'Chapter handoff replaced the original MAG canvas');
          assert.equal(state.canvasCount, 1, 'Chapter handoff created another MAG canvas');
          console.log('ARCHIVE_ATOMIC_CHAPTER_R2110_PASS ' + JSON.stringify({ profile: mobile ? 'mobile' : 'desktop', ...state }));
        }
        // Preserve the original six normal native handoffs above. Reload the
        // actual external stylesheet through CSP with a late legacy override;
        // the chapter owner must still keep seven original folios suspended.
        await page.evaluate(() => new Promise((resolve, reject) => {
          const link = [...document.querySelectorAll('link')]
            .find(node => node.href.includes('formatx-cinematic-archive-r1987.css'));
          if (!link) { reject(new Error('Actual archive stylesheet is missing')); return; }
          const deadline = setTimeout(() => reject(new Error('External archive stylesheet reload did not complete')), 5000);
          link.addEventListener('load', () => { clearTimeout(deadline); resolve(); }, { once: true });
          link.addEventListener('error', () => { clearTimeout(deadline); reject(new Error('External archive stylesheet reload failed')); }, { once: true });
          const target = new URL(link.href);
          target.searchParams.set('fx-folio-layout-regression', 'r2116');
          link.href = target.href;
        }));
        await page.locator('#experience').evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(() => window.FormatXArchiveExperience.state.scene === 'ecosystem', null, { timeout: 8000 });
        const layout = await page.evaluate(() => {
          const panels = [...document.querySelectorAll('.fx-archive-cinema-folio-r2030')];
          window.__r2116LayoutPanels = panels;
          window.__r2116OriginalHeadings = panels.map(panel => panel.querySelector('h2,h3'));
          return { scene: window.FormatXArchiveExperience.state.scene,
            sameCanvas: window.FormatXLivingCore.canvas === window.__r2110OriginalCanvas,
            panels: panels.map(panel => ({ active: panel.dataset.fxCinemaPanelActive === 'true',
              inert: panel.inert, visibility: getComputedStyle(panel).contentVisibility })) };
        });
        assert.equal(layout.panels.length, 8, 'Late CSS must retain all eight original folios');
        assert.equal(layout.panels.filter(panel => panel.active).length, 1, 'Late CSS must retain one active original folio');
        assert.ok(layout.panels.every(panel => panel.visibility === (panel.active ? 'visible' : 'hidden') && panel.inert !== panel.active),
          'Late CSS materialized an inactive original folio: ' + JSON.stringify(layout));
        assert.equal(layout.sameCanvas, true, 'Layout isolation replaced the original MAG canvas');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => window.FormatXArchiveExperience.state.disposed, null, { timeout: 5000 });
        const restored = await page.evaluate(() => ({
          originalLayout: __r2116LayoutPanels.every(panel => !panel.isConnected
            && panel.style.getPropertyValue('content-visibility') === ''
            && panel.style.getPropertyValue('contain-intrinsic-size') === ''),
          originalHeadings: __r2116OriginalHeadings.every(node => node?.isConnected && !node.closest('.fx-archive-cinema-folio-r2030')),
          sameCanvas: window.FormatXLivingCore.canvas === window.__r2110OriginalCanvas,
          canvasCount: document.querySelectorAll('.fx-crystal-organism-r326-canvas').length
        }));
        assert.equal(restored.originalLayout, true, 'Fallback must restore the original inline layout properties');
        assert.equal(restored.originalHeadings, true, 'Fallback must restore the same original semantic headings');
        assert.equal(restored.sameCanvas, true, 'Fallback replaced the original MAG canvas');
        assert.equal(restored.canvasCount, 1, 'Fallback created another MAG canvas');
        console.log('ARCHIVE_FOLIO_LAYOUT_R2116_PASS ' + JSON.stringify({ profile: mobile ? 'mobile' : 'desktop', layout, restored }));
        assert.deepEqual(errors, [], 'Browser errors during native chapter handoff');
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
