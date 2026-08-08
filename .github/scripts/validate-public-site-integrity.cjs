'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const docs = path.join(repo, 'docs');
const publicRoot = path.join(docs, 'scifi-ui');
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
function report(message) { failures.push(message); }
function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return result;
}
function publicPathForFile(file) { return '/' + path.relative(docs, file).split(path.sep).join('/'); }
function localTargetExists(pageFile, html, rawValue) {
  if (!rawValue || rawValue.startsWith('#')) return true;
  if (/^(?:https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(rawValue)) return true;
  const pageUrl = new URL(publicPathForFile(pageFile), 'https://www.formatxsuite.com');
  const baseMatch = html.match(/<base\b[^>]*href\s*=\s*["']([^"']+)["']/i);
  const baseUrl = baseMatch ? new URL(baseMatch[1], pageUrl) : pageUrl;
  const resolved = new URL(rawValue, baseUrl);
  const pathname = decodeURIComponent(resolved.pathname);
  if (pathname.startsWith('/api/') || pathname.startsWith('/download/') || pathname.startsWith('/fx-owner-license/')) return true;
  if (pathname === '/' || pathname === '/index.html') return fs.existsSync(path.join(publicRoot, 'index.html'));
  const aliases = new Set([
    '/downloads', '/downloads/', '/support', '/support.html', '/license', '/license.html',
    '/privacy', '/privacy.html', '/terms', '/terms.html', '/verification', '/verification.html',
    '/test-matrix', '/test-matrix.html', '/known-issues', '/known-issues.html', '/security',
    '/security.html', '/technical-report', '/technical-report.html', '/method', '/method.html',
  ]);
  if (aliases.has(pathname)) return true;
  const relative = pathname.replace(/^\//, '');
  let target = path.join(docs, relative);
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  return fs.existsSync(target) || fs.existsSync(target + '.html') || fs.existsSync(path.join(target, 'index.html'));
}
function read(relative) { return fs.readFileSync(path.join(repo, relative), 'utf8'); }
function json(relative) { return JSON.parse(read(relative)); }

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
  for (const tag of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    const value = attrs.href || attrs.src || attrs.srcset;
    const firstCandidate = value ? value.split(/\s+/)[0].replace(/,$/, '') : '';
    if (firstCandidate && !localTargetExists(file, html, firstCandidate)) report(`${label}: missing local target ${value}`);
    if (tag[0].toLowerCase().startsWith('<img') && !Object.hasOwn(attrs, 'alt')) report(`${label}: image without alt attribute`);
    if (attrs.target === '_blank' && !/\bnoopener\b/i.test(attrs.rel || '')) report(`${label}: target=_blank without rel=noopener (${attrs.href || ''})`);
  }
  if (/\son[a-z]+\s*=/i.test(html)) report(`${label}: inline event handler conflicts with CSP`);
  if (/http:\/\//i.test(html)) report(`${label}: insecure http URL found`);
}

const homepage = read('docs/scifi-ui/index.html');
const productionContent = read('billing-worker/src/production-content-entry.js');
const downloads = read('docs/scifi-ui/downloads/index.html');
const legacyAndroidDownload = read('docs/scifi-ui/downloads/android.html');
const support = read('docs/scifi-ui/support.html');
const siteRuntime = read('docs/scifi-ui/scripts/site.js');
const checkoutPage = read('docs/scifi-ui/checkout.html');
const checkoutRuntime = read('docs/scifi-ui/scripts/checkout-v100.js');
const pricingApi = read('billing-worker/src/pricing-v100-api.js');
const liveEntry = read('billing-worker/src/live-entry.js');
const productionWorker = read('billing-worker/src/production-with-license.js');
const portable = read('docs/scifi-ui/assets/images/product-showcase/portable-installer-compatible.svg');
const aliases = read('billing-worker/src/production-feedback-entry.js');
const loop = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const guard = read('docs/scifi-ui/scripts/formatx-full-release-guard.js');
const seo = read('docs/scifi-ui/scripts/formatx-seo.js');
const evidenceRenderer = read('docs/scifi-ui/scripts/public-evidence-pages.js');
const androidPage = read('docs/scifi-ui/android/index.html');
const salesGate = read('billing-worker/src/sales-gate.js');
const paymentSuccess = read('docs/scifi-ui/payment/success.html');
const paymentCancel = read('docs/scifi-ui/payment/cancel.html');
const sitemap = read('docs/sitemap.xml');
const androidManifest = json('docs/scifi-ui/downloads/android-native-update.json');
const platformStatus = json('docs/scifi-ui/data/platform-status.json');
const publicContract = json('docs/scifi-ui/data/public-platform-contract.json');
const currentRelease = json('docs/scifi-ui/data/current-release.json');
const knownIssues = json('docs/scifi-ui/data/known-issues.json');
const testMatrix = json('docs/scifi-ui/data/test-matrix.json');

if ((homepage.match(/<h1\b/gi) || []).length !== 1) report('homepage: exactly one h1 is required');
const feedbackAvailable = homepage.includes('id="user-feedback"') || (productionContent.includes('id="user-feedback"') && productionContent.includes('USER_FEEDBACK_SECTION'));
if (!feedbackAvailable) report('homepage: user feedback section missing from static page and production injection');
if (!homepage.includes('id="resources"')) report('homepage: release section missing');
if (!homepage.includes('Teljes multiplatform verzió letöltése') || !homepage.includes('Download full multiplatform version')) report('homepage: static full-release download copy missing');
if (/\b(?:nyilvános béta|public beta)\b/i.test(homepage)) report('homepage: retired generic beta wording remains in static source');
if (/Windows, macOS, web és Android hozzáférés támogatott|Windows, macOS, web and Android access are supported/i.test(homepage)) report('homepage: planned/preview platforms are presented as supported');
if (/A stabil csomagok|Stable packages and release information/i.test(homepage)) report('homepage: evidence-gated Stable is overstated');

if (!productionContent.includes('itemprop="operatingSystem" content="Linux, Bazzite, Windows, Android"')) report('production structured data: canonical native operating-system list missing');
if (/itemprop="operatingSystem" content="[^"]*(?:macOS|Web|iOS)/i.test(productionContent)) report('production structured data: planned/preview surface presented as supported OS');
if (/Lighthouse-kapuk|Lighthouse gates/.test(productionContent)) report('production Live OS evidence copy must use generic verified CI gates rather than an unscoped Lighthouse claim');

if (/data-release-download="multiplatform"[^>]+href=["']\.\/?["']/i.test(downloads)) report('downloads: primary fallback points to itself');
if (!downloads.includes('FormatX-Updates/releases/latest')) report('downloads: JavaScript-free latest release fallback missing');
if (!downloads.includes('Teljes multiplatform verzió letöltése') || !downloads.includes('5 napos próbalicenc')) report('downloads: full release / five-day trial copy missing');
if (/\b(?:nyilvános béta|public beta)\b/i.test(downloads)) report('downloads: retired generic beta wording remains');

if (/Android-1\.0\.4|release-unsigned\.aab/i.test(legacyAndroidDownload)) report('legacy Android download page: stale hard-coded package link remains');
if (!legacyAndroidDownload.includes('href="/download/android"')) report('legacy Android download page: canonical worker download route missing');
if (!/<meta\s+name="robots"\s+content="noindex,follow">/i.test(legacyAndroidDownload)) report('legacy Android download page: compatibility noindex missing');
if (!legacyAndroidDownload.includes('rel="canonical" href="https://www.formatxsuite.com/scifi-ui/android/"')) report('legacy Android download page: Android canonical target missing');

if (/Platform és irányadó állapot:\s*Public beta/i.test(support)) report('support: stale Public beta reporting state remains');
if (!support.includes('Full release, Technical preview vagy Planned')) report('support: canonical issue-report release states missing');
if (/const state = copy\('Nyilvános béta', 'Public beta'\)/.test(siteRuntime) || /public-beta-available/.test(siteRuntime)) report('shared site runtime: retired beta release state remains');
if (!siteRuntime.includes("data?.channels?.multiplatform")) report('shared site runtime: canonical multiplatform channel missing');

const canonicalPrices = [
  ['Business Lite HUF monthly', 'monthly: 7900'],
  ['Business Lite HUF annual', 'annual: 79000'],
  ['Business Pro HUF monthly', 'monthly: 15900'],
  ['Business Pro HUF annual', 'annual: 159000'],
  ['Technician Team HUF monthly', 'monthly: 29900'],
  ['Technician Team HUF annual', 'annual: 299000'],
  ['Business Lite EUR monthly', 'monthly: 22'],
  ['Business Pro EUR monthly', 'monthly: 44'],
  ['Technician Team EUR monthly', 'monthly: 83'],
];
for (const [label, token] of canonicalPrices) {
  if (!checkoutRuntime.includes(token)) report(`checkout pricing: missing ${label}`);
  if (!pricingApi.includes(token)) report(`pricing API: missing ${label}`);
  if (!liveEntry.includes(token)) report(`legacy live fallback pricing: missing ${label}`);
}
if (!checkoutPage.includes('checkout-v100.js') || checkoutPage.includes('scripts/checkout.js') || checkoutPage.includes('scripts/billing.js')) report('checkout: retired pricing runtime is referenced');
if (!checkoutRuntime.includes('new Uint8Array(12)') || !checkoutRuntime.includes("return 'FX-' + ymd + '-' + random")) report('checkout: high-entropy order reference generation missing');
for (const [name, source] of [['pricing API', pricingApi], ['live entry', liveEntry]]) {
  if (!source.includes('SECURE_ORDER_REFERENCE = /^FX-\\d{8}-[A-F0-9]{24}$/')) report(`${name}: secure order-reference format missing`);
  if (!source.includes('LEGACY_ORDER_REFERENCE')) report(`${name}: backward-compatible legacy order-reference validation missing`);
}
if (!liveEntry.includes("return jsonResponse({ error: 'Érvénytelen rendelési azonosító.' }, 400, corsHeaders);")) report('order status: invalid-reference rejection missing');
if (!productionWorker.includes("'/api/session-status'")) report('order status: production rate-limit route missing');

if (/\b(?:Public beta product status|FormatX beta|bétaállapot|beta package|Overall status['"],?\s*value:['"]Public beta)/i.test(seo)) report('SEO: retired generic beta metadata remains');
if (!seo.includes("value:'Full release'") || !seo.includes("value:'5 days'")) report('SEO: full release/trial structured data missing');
if (/Windows \(Public beta\)|Linux\/Bazzite \(Development\)/i.test(seo)) report('SEO: stale platform maturity remains');
if (/operatingSystem:'[^']*(?:macOS|iOS|Web)/i.test(seo)) report('SEO: planned/preview surface included as supported operating system');

if (!evidenceRenderer.includes('release?.channels?.multiplatform')) report('verification renderer: canonical multiplatform channel missing');
if (/language\(\) === 'en' \? 'Public beta' : 'Nyilvános béta'/i.test(evidenceRenderer)) report('verification renderer: retired beta status remains');
if (!evidenceRenderer.includes("'Full release'") || !evidenceRenderer.includes("'Teljes verzió'")) report('verification renderer: full-release status missing');

if (platformStatus.product_release?.status !== 'full_release') report('platform status: product is not full_release');
if (platformStatus.product_release?.trial_days !== 5) report('platform status: trial_days must be 5');
const byId = Object.fromEntries(platformStatus.platforms.map(platform => [platform.id, platform]));
for (const id of ['linux-bazzite', 'windows', 'android']) if (byId[id]?.status !== 'full_release') report(`platform status: ${id} must be full_release`);
if (byId.web?.status !== 'technical_preview') report('platform status: web must remain technical_preview');
for (const id of ['macos', 'ios']) if (byId[id]?.status !== 'planned') report(`platform status: ${id} must remain planned`);

if (publicContract.layout_contract?.scroll_controller !== 'seamless-continuous') report('public layout contract: scroll controller must remain seamless-continuous');
if (publicContract.layout_contract?.infinite_scroll_controller !== 'seamless-v7') report('public layout contract: seamless-v7 controller missing');
if (publicContract.layout_contract?.automatic_scroll_loop !== true) report('public layout contract: seamless automatic scroll loop must be enabled');
if (publicContract.layout_contract?.forced_scroll_transfer !== false) report('public layout contract: wheel/touch input must remain native; no forced input capture allowed');
if (publicContract.layout_contract?.automatic_page_position_changes !== true) report('public layout contract: seamless boundary handoff must be enabled');
if (publicContract.layout_contract?.hero_visual_bridge !== true) report('public layout contract: Hero visual bridge must be enabled');
if (publicContract.layout_contract?.cloned_hero_only !== true) report('public layout contract: only the inert Hero may be cloned for the loop bridge');
if (publicContract.layout_contract?.boundary_handoff_only !== true) report('public layout contract: automatic positioning must be boundary-only');
if (publicContract.layout_contract?.mobile_transfer_deferred_until_scroll_idle !== true) report('public layout contract: mobile handoff must wait for scroll idle');
if (publicContract.layout_contract?.mobile_native_momentum_preserved !== true) report('public layout contract: mobile native momentum must be preserved');
if (publicContract.layout_contract?.section_scroll_snap !== false) report('public layout contract: section scroll snapping must remain disabled');

const multi = currentRelease.channels?.multiplatform;
if (!currentRelease.ok || !multi?.available) report('current release: public multiplatform package unavailable');
if (!Array.isArray(multi?.supported_platforms) || !multi.supported_platforms.includes('linux-bazzite') || !multi.supported_platforms.includes('windows')) report('current release: canonical supported platform list incomplete');
if (!/^sha256:[0-9a-f]{64}$/i.test(multi?.digest || '')) report('current release: package SHA-256 digest missing');

const knownIssueText = JSON.stringify(knownIssues);
if (/no public native package is currently available|nincs nyilvános natív csomag|Treat the release as beta|kiadást bétaállapotként kezeld/i.test(knownIssueText)) report('known issues: stale full-release contradiction remains');
if (knownIssues.updated !== '2026-08-07') report('known issues: audit date is stale');

const matrixText = JSON.stringify(testMatrix);
if (/Install the public beta package|nyilvános béta csomag|edition is in Development and no public native package|native edition is in Development/i.test(matrixText)) report('test matrix: stale release maturity remains');
const linuxCase = testMatrix.cases.find(item => item.id === 'FX-LINUX-NATIVE-001');
if (!linuxCase || linuxCase.status === 'blocked') report('test matrix: Linux full release must not be blocked solely for package availability');

if (!/beta$/i.test(androidManifest.versionName || '')) report('Android Native manifest: expected separate beta channel marker');
if (!androidPage.includes('/download/android') || !androidPage.includes('ANDROID TELJES VERZIÓ')) report('Android page: canonical full-release route missing');
if (!androidPage.includes('NATÍV BÉTA') || !androidPage.includes('/download/android-native-beta')) report('Android page: Native beta channel/download route is not explicitly separated');
if (androidPage.includes('android-native-v1.1.0-beta')) report('Android page: upstream Native beta release URL must not be exposed as the action');
if (!androidPage.includes('rel="canonical" href="https://www.formatxsuite.com/scifi-ui/android/"')) report('Android page: canonical URL missing');
if (/WEBVIEW NÉLKÜLI NATÍV TELJES KIADÁS|current native edition is the full release|jelenlegi natív kiadás a teljes verzió/i.test(androidPage)) report('Android page: Native beta is falsely presented as full release');
if (!sitemap.includes('https://www.formatxsuite.com/scifi-ui/android/')) report('sitemap: Android release-status page missing');
if (!productionWorker.includes("'/download/android-native-beta'")) report('production worker: Native beta download route missing');

if (guard.includes("['NATÍV BÉTA'") || guard.includes("['NATIVE BETA'") || guard.includes("['BÉTA'") || guard.includes("['BETA'")) report('full-release guard: legitimate beta channel labels would be rewritten');
if (guard.includes("['Nyilvános béta'") || guard.includes("['Public beta'")) report('full-release guard: generic beta wording is over-broad; guard must target retired product-level labels only');
if (!guard.includes("fxFullRelease = 'full-release'") || !guard.includes("fxTrialDays = '5'")) report('full-release guard contract missing');

if (/PUBLIC BETA|FormatX V92|nyilvános béta|public beta/i.test(salesGate)) report('sales gate: retired beta/V92 copy remains');
if (!salesGate.includes('TELJES KIADÁS') || !salesGate.includes('5 napos próbalicenc')) report('sales gate: full-release/trial truth missing');
for (const [name, source] of [['payment success', paymentSuccess], ['payment cancel', paymentCancel]]) {
  if (!/<meta\s+name="robots"\s+content="noindex,nofollow,noarchive">/i.test(source)) report(`${name}: transactional noindex contract missing`);
}

if (/data:image\/webp|<image\b/i.test(portable)) report('portable installer: embedded raster/WebP is forbidden');
if (!loop.includes("const VERSION = 'seamless-v7'")) report('homepage: seamless-v7 scroll controller version missing');
if (!loop.includes("root.dataset.fxAutomaticLoop = 'enabled'") || !loop.includes('automaticLoop: true')) report('homepage: seamless cyclic scroll loop is not enabled');
if (!loop.includes("root.dataset.fxInfiniteCloneMode = 'visual-bridge'") || !loop.includes('clonedHeroOnly: true')) report('homepage: inert Hero visual bridge contract missing');
if (!loop.includes('sectionSnapDisabled: true') || !loop.includes("root.classList.add('fx-continuous-scroll-mode'")) report('homepage: section snap suppression missing');
if (!loop.includes('sourceHero.cloneNode(true)') || !loop.includes('window.scrollTo({ top: target')) report('homepage: seamless boundary handoff implementation missing');
if (!loop.includes("mobileTransfer: 'scrollend-or-idle'") || !loop.includes('mobileNativeMomentumPreserved: true')) report('homepage: mobile momentum-safe handoff contract missing');
if (/addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,180}preventDefault/.test(loop)) report('homepage: scroll runtime captures wheel or touch input');
if (loop.includes('document.body.cloneNode') || loop.includes('document.documentElement.cloneNode')) report('homepage: full-page cloning is forbidden');
for (const token of [
  "['/downloads/', '/scifi-ui/downloads/']",
  "['/support.html', '/scifi-ui/support.html']",
  "['/privacy.html', '/scifi-ui/privacy.html']",
  "['/terms.html', '/scifi-ui/terms.html']",
]) if (!aliases.includes(token)) report(`routing: missing public alias ${token}`);

if (failures.length) {
  console.error('FAILED FormatX public-site integrity audit:');
  failures.forEach(item => console.error(' - ' + item));
  process.exit(1);
}
console.log(`PASS: ${htmlFiles.length} public HTML pages, links, IDs, images, CSP hooks, release truth, SEO, support, pricing parity, secure order references, Android channel/download separation, legal gate, transactional noindex, seamless-v7 scrolling, downloads and aliases validated.`);
