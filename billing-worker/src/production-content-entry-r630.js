import production from './production-content-entry-r529.js';

/* FormatX R630 — normal-product reference-mode boot without parser blocking.
   The canonical production chain injects a tiny external reference-mode script
   before </head>. On throttled mobile transport that script was parser-blocking:
   the body could not parse/paint until its network response arrived, producing a
   deterministic ~2.14s semantic FCP/LCP even though first-paint CSS was ready
   around ~1.36s. Keep the same script, responsive logic and high fetch priority,
   but make it async so the canonical hero never waits on its network round trip.
   This is the same production path for every visitor; no audit/headless gate. */

const REFERENCE_BOOT_RE = /<script\b(?=[^>]*\bdata-fx-reference-mode-boot-r504=["']true["'])[^>]*><\/script>/i;

function nonBlockingReferenceBoot(html) {
  return String(html || '').replace(REFERENCE_BOOT_RE, tag => {
    if (/\sasync(?:\s|>)/i.test(tag)) return tag;
    return tag.replace('<script', '<script async');
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await production.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    const headers = new Headers(response.headers);
    const type = headers.get('Content-Type') || '';
    if (!type.includes('text/html')) return response;
    const html = nonBlockingReferenceBoot(await response.text());
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    headers.delete('ETag');
    headers.set('X-FormatX-Reference-Boot-Delivery', 'r630-async-nonblocking-normal-product');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
