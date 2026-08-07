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

if (/data-release-download="multiplatform"[^>]+href=["']\.\/?["']/i.test(downloads)) report('downloads: primary fallback points to itself');
if (!downloads.includes('FormatX-Updates/releases/latest')) report('downloads: JavaScript-free latest release fallback missing');
if (!downloads.includes('Teljes multiplatform verzió letöltése') || !downloads.includes('5 napos próbalicenc')) report('downloads: full release / five-day trial copy missing');
if (/\b(?:nyilvános béta|public beta)\b/i.test(downloads)) report('downloads: retired generic beta wording remains');

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
if (!androidPage.includes('NATÍV BÉTA') || !androidPage.includes('android-native-v1.1.0-beta')) report('Android page: Native beta channel is not explicitly separated');
if (!androidPage.includes('rel="canonical" href="https://www.formatxsuite.com/scifi-ui/android/"')) report('Android page: canonical URL missing');
if (/WEBVIEW NÉLKÜLI NATÍV TELJES KIADÁS|current native edition is the full release|jelenlegi natív kiadás a teljes verzió/i.test(androidPage)) report('Android page: Native beta is falsely presented as full release');
if (!sitemap.includes('https://www.formatxsuite.com/scifi-ui/android/')) report('sitemap: Android release-status page missing');

if (/PUBLIC BETA|FormatX V92|nyilvános béta|public beta/i.test(salesGate)) report('sales gate: retired beta/V92 copy remains');
if (!salesGate.includes('TELJES KIADÁS') || !salesGate.includes('5 napos próbalicenc')) report('sales gate: full-release/trial truth missing');
for (const [name, source] of [['payment success', paymentSuccess], ['payment cancel', paymentCancel]]) {
  if (!/<meta\s+name="robots"\s+content="noindex,nofollow,noarchive">/i.test(source)) report(`${name}: transactional noindex contract missing`);
}

if (/data:image\/webp|<image\b/i.test(portable)) report('portable installer: embedded raster/WebP is forbidden');
if (!loop.includes("const VERSION = 'seamless-v6'") || !loop.includes('clonedHeroOnly: true')) report('homepage: seamless loop contract missing');
if (!guard.includes("fxFullRelease = 'full-release'") || !guard.includes("fxTrialDays = '5'")) report('full-release guard contract missing');
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
console.log(`PASS: ${htmlFiles.length} public HTML pages, links, IDs, images, CSP hooks, release truth, SEO, evidence data, Android channel separation, legal gate, transactional noindex, downloads, aliases and seamless loop validated.`);
