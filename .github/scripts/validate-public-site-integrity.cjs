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

function report(message) {
  failures.push(message);
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return result;
}

function publicPathForFile(file) {
  return '/' + path.relative(docs, file).split(path.sep).join('/');
}

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
  if (fs.existsSync(target)) return true;
  if (fs.existsSync(target + '.html')) return true;
  if (fs.existsSync(path.join(target, 'index.html'))) return true;
  return false;
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
  for (const [id, count] of ids) {
    if (count > 1) report(`${label}: duplicate id ${id} (${count})`);
  }

  for (const tag of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    const value = attrs.href || attrs.src || attrs.srcset;
    const firstCandidate = value ? value.split(/\s+/)[0].replace(/,$/, '') : '';
    if (firstCandidate && !localTargetExists(file, html, firstCandidate)) {
      report(`${label}: missing local target ${value}`);
    }
    if (tag[0].toLowerCase().startsWith('<img') && !Object.hasOwn(attrs, 'alt')) {
      report(`${label}: image without alt attribute`);
    }
    if (attrs.target === '_blank' && !/\bnoopener\b/i.test(attrs.rel || '')) {
      report(`${label}: target=_blank without rel=noopener (${attrs.href || ''})`);
    }
  }

  if (/\son[a-z]+\s*=/i.test(html)) report(`${label}: inline event handler conflicts with CSP`);
  if (/http:\/\//i.test(html)) report(`${label}: insecure http URL found`);
}

const homepage = fs.readFileSync(path.join(publicRoot, 'index.html'), 'utf8');
const downloads = fs.readFileSync(path.join(publicRoot, 'downloads/index.html'), 'utf8');
const portable = fs.readFileSync(path.join(publicRoot, 'assets/images/product-showcase/portable-installer-compatible.svg'), 'utf8');
const aliases = fs.readFileSync(path.join(repo, 'billing-worker/src/production-feedback-entry.js'), 'utf8');
const loop = fs.readFileSync(path.join(publicRoot, 'scripts/formatx-infinite-scroll.js'), 'utf8');

if ((homepage.match(/<h1\b/gi) || []).length !== 1) report('homepage: exactly one h1 is required');
if (!homepage.includes('id="user-feedback"')) report('homepage: user feedback section missing');
if (!homepage.includes('id="resources"')) report('homepage: release section missing');
if (/data-release-download="multiplatform"[^>]+href=["']\.\/?["']/i.test(downloads)) report('downloads: primary fallback points to itself');
if (!downloads.includes('FormatX-Updates/releases/latest')) report('downloads: JavaScript-free latest release fallback missing');
if (/data:image\/webp|<image\b/i.test(portable)) report('portable installer: embedded raster/WebP is forbidden');
if (!loop.includes("const VERSION = 'seamless-v6'") || !loop.includes('clonedHeroOnly: true')) report('homepage: seamless loop contract missing');
for (const token of [
  "['/downloads/', '/scifi-ui/downloads/']",
  "['/support.html', '/scifi-ui/support.html']",
  "['/privacy.html', '/scifi-ui/privacy.html']",
  "['/terms.html', '/scifi-ui/terms.html']",
]) {
  if (!aliases.includes(token)) report(`routing: missing public alias ${token}`);
}

if (failures.length) {
  console.error('FAILED FormatX public-site integrity audit:');
  failures.forEach(item => console.error(' - ' + item));
  process.exit(1);
}

console.log(`PASS: ${htmlFiles.length} public HTML pages, local targets, IDs, images, CSP hooks, downloads, aliases and seamless loop validated.`);