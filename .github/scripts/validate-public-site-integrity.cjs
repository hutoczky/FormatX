'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const docs = path.join(repo, 'docs');
const publicRoot = path.join(docs, 'scifi-ui');
const failures = [];

const read = relative => fs.readFileSync(path.join(repo, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const report = message => failures.push(message);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return result;
}

function publicPath(file) {
  return '/' + path.relative(docs, file).split(path.sep).join('/');
}

function localTargetExists(pageFile, html, raw) {
  if (!raw || raw.startsWith('#')) return true;
  if (/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(raw)) return true;
  const pageUrl = new URL(publicPath(pageFile), 'https://formatxsuite.com');
  const baseMatch = html.match(/<base\b[^>]*href\s*=\s*["']([^"']+)["']/i);
  const baseUrl = baseMatch ? new URL(baseMatch[1], pageUrl) : pageUrl;
  const pathname = decodeURIComponent(new URL(raw, baseUrl).pathname);
  if (pathname.startsWith('/api/') || pathname.startsWith('/download/') || pathname.startsWith('/fx-owner-license/')) return true;
  if (pathname === '/' || pathname === '/index.html') return fs.existsSync(path.join(publicRoot, 'index.html'));
  const aliases = new Set([
    '/downloads', '/downloads/', '/support', '/support.html', '/license', '/license.html',
    '/privacy', '/privacy.html', '/terms', '/terms.html', '/verification', '/verification.html',
    '/test-matrix', '/test-matrix.html', '/known-issues', '/known-issues.html', '/security',
    '/security.html', '/technical-report', '/technical-report.html', '/method', '/method.html'
  ]);
  if (aliases.has(pathname)) return true;
  let target = path.join(docs, pathname.replace(/^\//, ''));
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  return fs.existsSync(target) || fs.existsSync(target + '.html') || fs.existsSync(path.join(target, 'index.html'));
}

const htmlFiles = walk(publicRoot).filter(file => file.endsWith('.html'));
assert.ok(htmlFiles.length >= 10, 'unexpectedly small public HTML surface');
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const label = path.relative(repo, file);
  const ids = new Map();
  for (const match of html.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const id = match[1] ?? match[2];
    ids.set(id, (ids.get(id) || 0) + 1);
  }
  for (const [id, count] of ids) if (count > 1) report(`${label}: duplicate id ${id} (${count})`);
  for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    const value = a.href || a.src || a.srcset;
    const candidate = value ? value.split(/\s+/)[0].replace(/,$/, '') : '';
    if (candidate && !localTargetExists(file, html, candidate)) report(`${label}: missing local target ${value}`);
    if (/^<img/i.test(match[0]) && !Object.hasOwn(a, 'alt')) report(`${label}: image without alt`);
    if (a.target === '_blank' && !/\bnoopener\b/i.test(a.rel || '')) report(`${label}: target=_blank without noopener`);
  }
  if (/\son[a-z]+\s*=/i.test(html)) report(`${label}: inline event handler conflicts with CSP`);
  if (/http:\/\//i.test(html)) report(`${label}: insecure http URL found`);
}

const homepage = read('docs/scifi-ui/index.html');
const downloads = read('docs/scifi-ui/downloads/index.html');
const checkout = read('docs/scifi-ui/scripts/checkout-v100.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const productionEntry = read('billing-worker/src/production-entry.js');
const feedbackEntry = read('billing-worker/src/production-feedback-entry.js');
const feedbackApi = read('billing-worker/src/feedback-api.js');
const scrollBootstrap = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const seamlessScroll = read('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');
const mobileCss = read('docs/scifi-ui/styles/formatx-mobile-production-r5.css');
const mobileLoopCss = read('docs/scifi-ui/styles/formatx-mobile-seamless-loop.css');
const platformStatus = json('docs/scifi-ui/data/platform-status.json');
const currentRelease = json('docs/scifi-ui/data/current-release.json');
const scrollPolicy = json('docs/scifi-ui/data/scroll-policy.json');
const productionConfig = json('billing-worker/wrangler.jsonc');

if ((homepage.match(/<h1\b/gi) || []).length !== 1) report('homepage: exactly one h1 is required');
if (!homepage.includes('id="resources"')) report('homepage: release section missing');
if (!homepage.includes('Teljes multiplatform verzió letöltése') || !homepage.includes('Download full multiplatform version')) report('homepage: full-release CTA copy missing');
if (/\b(?:nyilvános béta|public beta)\b/i.test(homepage)) report('homepage: retired generic beta wording remains');
if (!downloads.includes('FormatX-Updates/releases/latest')) report('downloads: JavaScript-free latest release fallback missing');
if (!downloads.includes('data-release-download="multiplatform"')) report('downloads: multiplatform download marker missing');
if (!downloads.includes('5 napos próbalicenc')) report('downloads: five-day trial copy missing');
if (/\b(?:nyilvános béta|public beta)\b/i.test(downloads)) report('downloads: retired beta wording remains');

const expectedPlatforms = {
  'linux-bazzite': 'full_release', windows: 'full_release', android: 'full_release',
  web: 'technical_preview', macos: 'planned', ios: 'planned'
};
const actualPlatforms = Object.fromEntries(platformStatus.platforms.map(item => [item.id, item.status]));
for (const [id, status] of Object.entries(expectedPlatforms)) if (actualPlatforms[id] !== status) report(`platform status: ${id} must be ${status}`);
if (platformStatus.product_release?.status !== 'full_release') report('platform status: product must be full_release');
if (platformStatus.product_release?.trial_days !== 5) report('platform status: trial_days must be 5');

const multi = currentRelease.channels?.multiplatform || currentRelease.channels?.windows;
if (!currentRelease.ok || !multi?.available) report('current release: public package unavailable');
if (!/^sha256:[0-9a-f]{64}$/i.test(multi?.digest || '')) report('current release: SHA-256 digest missing');

if (scrollPolicy.schema_version !== 1) report('scroll policy: schema version mismatch');
if (scrollPolicy.mobile?.controller !== 'seamless-v7') report('scroll policy: mobile seamless-v7 controller missing');
if (scrollPolicy.mobile?.automatic_loop !== true || scrollPolicy.mobile?.visual_bridge !== true) report('scroll policy: mobile loop/bridge must be enabled');
if (scrollPolicy.mobile?.automatic_page_position_changes !== true || scrollPolicy.mobile?.boundary_handoff_only !== true) report('scroll policy: mobile boundary-only handoff contract missing');
if (scrollPolicy.mobile?.transfer_mode !== 'scrollend-or-idle' || scrollPolicy.mobile?.native_momentum_preserved !== true) report('scroll policy: mobile native momentum handoff contract missing');
if (scrollPolicy.mobile?.finite_document !== false) report('scroll policy: mobile document must not terminate at the footer');
if (scrollPolicy.desktop?.controller !== 'seamless-v7' || scrollPolicy.desktop?.automatic_loop !== true) report('scroll policy: desktop seamless-v7 must remain enabled');
if (scrollPolicy.policy?.input_capture !== false || scrollPolicy.policy?.section_scroll_snap !== false) report('scroll policy: input capture/snap contract regressed');

if (!scrollBootstrap.includes('platform-scroll-v2') || !scrollBootstrap.includes("installSeamlessRuntime('mobile')")) report('scroll bootstrap: shared mobile seamless runtime missing');
if (!scrollBootstrap.includes("fxAutomaticLoop = mobile ? 'pending-mobile' : 'desktop-only'") || !scrollBootstrap.includes('native-momentum-loop-v1')) report('scroll bootstrap: mobile seamless loop policy missing');
if (!scrollBootstrap.includes('formatx-mobile-seamless-loop.css') || scrollBootstrap.includes("createElement('style')")) report('scroll bootstrap: CSP-safe external mobile bridge layer missing');
if (scrollBootstrap.includes('scrollTo(') || scrollBootstrap.includes('scrollIntoView(') || scrollBootstrap.includes('cloneNode(')) report('scroll bootstrap: mobile-capable bootstrap must not move or clone the document');
if (!scrollBootstrap.includes('formatx-infinite-scroll-desktop-v7.js')) report('scroll bootstrap: shared seamless runtime loader missing');
if (!seamlessScroll.includes("const VERSION = 'seamless-v7'")) report('seamless scroll: seamless-v7 runtime missing');
if (!seamlessScroll.includes('sourceHero.cloneNode(true)') || !seamlessScroll.includes('window.scrollTo(')) report('seamless scroll: visual bridge handoff implementation missing');
if (!seamlessScroll.includes("mobileTransfer: 'scrollend-or-idle'")) report('seamless scroll: mobile transfer must wait for scrollend/idle');
if (/addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,180}preventDefault/.test(seamlessScroll)) report('seamless scroll: wheel/touch input capture returned');
if (!mobileLoopCss.includes('min-height: calc(100svh + max(320px, 24svh))') || !mobileLoopCss.includes('display: block !important')) report('mobile seamless bridge: footer runway override missing');
if (!mobileCss.includes('.fx-award-proof__grid') || !mobileCss.includes('grid-template-columns: 1fr !important')) report('mobile CSS: public proof single-column safeguard missing');
if (!mobileCss.includes('.fx-plan-qr-card:not(.is-qr-ready)')) report('mobile CSS: QR broken-image safeguard missing');

if (!checkout.includes('new Uint8Array(12)') || !checkout.includes("return 'FX-' + ymd + '-' + random")) report('checkout: high-entropy order reference missing');
for (const [name, source] of [['pricing API', pricingApi], ['feedback entry', feedbackEntry], ['feedback API', feedbackApi]]) {
  if (/eval\s*\(|new Function\s*\(/.test(source)) report(`${name}: dynamic code execution is forbidden`);
}
if (!pricingApi.includes('SECURE_ORDER_REFERENCE = /^FX-\\d{8}-[A-F0-9]{24}$/')) report('pricing API: secure order-reference validation missing');
if (!feedbackEntry.includes("['/downloads/', '/scifi-ui/downloads/']")) report('feedback/public routing: downloads alias missing');
if (!feedbackApi.includes('publish_permission = 1')) report('feedback API: consent-gated public review query missing');

if (!productionEntry.includes('formatx-infinite-scroll.js') || !productionEntry.includes('data-fx-seamless-scroll-runtime')) report('production entry: scroll bootstrap delivery missing');
if (productionConfig.main !== 'src/production-content-entry.js') report('production config: content wrapper is not active');
const domains = (productionConfig.routes || []).map(route => route.pattern);
if (domains.join(',') !== 'formatxsuite.com,www.formatxsuite.com') report('production config: custom-domain ownership incomplete');

if (failures.length) {
  console.error('FormatX public-site integrity failures:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`PASS public-site integrity: ${htmlFiles.length} HTML pages, release/platform/security/routing and shared seamless scroll contracts validated.`);
