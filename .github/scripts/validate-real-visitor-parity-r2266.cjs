'use strict';
// R2266: Performance audits must load the same physical cinematic and original
// full GPU MAG as visitors, never an audit-only static or simplified substitute.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const root='docs/scifi-ui/';
const html=read(root+'index.html');
const worker=read('billing-worker/src/production-content-entry.js');
const intro=read(root+'scripts/formatx-mag-birth-live-r533.js');
const rescue=read(root+'scripts/formatx-intro-bootstrap-r1629.js');
const scheduler=read(root+'scripts/formatx-p0-motion-scheduler-r490.js');
const loader=read(root+'scripts/formatx-current-mag-loader-r422.js');
const native=read(root+'scripts/formatx-crystal-organism-r326.js');
const architecture=read(root+'scripts/formatx-living-architecture-loader-r1985.js');
const architectureRuntime=read(root+'scripts/living-architecture.js');
const css=read(root+'scripts/formatx-deferred-css-r487.js');
const sensory=read(root+'scripts/formatx-sensory-on-demand-r2000.js');
const award=read(root+'scripts/formatx-award-runtime-r206.js');
const apex=read(root+'scripts/formatx-apex.js');
const tag='<script data-fx-intro-bootstrap-r1629="true">';
const inline=html.split(tag)[1]?.split('</script>')[0];
assert(inline,'Canonical exact parser bootstrap missing');
const hash="'sha256-"+crypto.createHash('sha256').update(inline,'utf8').digest('base64')+"'";
assert(html.includes(hash),'Exact production HTML CSP must allow real film');
const declaration=worker.split('\n').find(x=>x.includes(' = "'+hash+'";'));
assert(declaration,'Worker must publish same parser hash');
const owner=declaration.trim().split(/\s+/)[1];
const token=String.fromCharCode(36)+'{'+owner+'}';
assert.equal(worker.split(token).length-1,2,
  'Cloudflare meta and header CSP must both allow the visitor film');
assert(inline.includes("const a=navigator.webdriver===true&&f;"),
  'Automated metrics cannot silently skip normal Genesis');
assert(inline.includes('formatx-mag-birth-live-r533.js?v=20261101-r2278-early-native-gpu-fence'),
  'Exact full cinematic cache key not active');
assert(rescue.includes('20261101-r2278-early-native-gpu-fence'),
  'Fallback and parser must load identical film');
assert(intro.includes('const AUTOMATION = navigator.webdriver === true &&'),
  'Automation fast path must be explicitly requested by QA');
assert(intro.includes('const SOFTWARE_SAFE = CONSTRAINED;') &&
  !intro.includes('HEADLESS_SOFTWARE') &&
  !intro.includes('/HeadlessChrome/i'),
  'Normal headless visitor must not silently receive the 2D film');
assert(intro.includes("PARAMS.get('r548') === 'mobile-skip'"),
  'Preserve explicit legacy QA skip');
assert(!scheduler.includes('if(AUDIT)') &&
  !scheduler.includes("root.dataset.fxP0AuditModeR1728='static-first-paint-no-late-webgl'"),
  'No Lighthouse-only native MAG loader suppression');
assert(!loader.includes('if(lighthouse)') &&
  !loader.includes('lighthouse-static-photographic-shell-r1741'),
  'Measured visitors cannot receive a static GPU replacement');
assert(native.includes('const auditMode = false;'),
  'Full GPU geometry and motion cadence must match visitors');
assert(!architecture.includes('audit-zero-fetch-r1985') &&
  !architectureRuntime.includes("ROOT.dataset.fxThree = 'audit-skip'"),
  'Same living system must load for measured visitors');
assert(!css.includes('if (audit && link.hasAttribute'),
  'Same critical CSS must load for both paths');
assert(!sensory.includes('audit-no-activation') &&
  !award.includes('audit-passive-r1964') &&
  !apex.includes("ROOT.dataset.fxRenderer = 'static-audit'"),
  'User interfaces cannot be disabled for Lighthouse');
assert(html.includes('20261031-r2266-full-visitor-mag') &&
  worker.includes('20261031-r2266-full-visitor-mag'),
  'Native original MAG cache must match on page and Cloudflare Worker');
console.log('R2266_REAL_VISITOR_LIGHTHOUSE_CORE_PARITY_PASS');
