const SPEEDTEST_PREFIX = '/api/speedtest/';
const DOWNLOAD_PATH = '/api/speedtest/download';
const PING_PATH = '/api/speedtest/ping';
const UPLOAD_PATH = '/api/speedtest/upload';
const MAX_DOWNLOAD_BYTES = 12 * 1024 * 1024;
const MIN_DOWNLOAD_BYTES = 64 * 1024;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;

const DOWNLOAD_CHUNK = (() => {
  const bytes = new Uint8Array(CHUNK_BYTES);
  let state = 0x5f3759df;
  for (let index = 0; index < bytes.length; index += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    bytes[index] = state & 0xff;
  }
  return bytes;
})();

function speedHeaders(request, extra = {}) {
  const headers = new Headers({
    'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate, no-transform',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-FormatX-Speedtest': 'r1800-edge',
    ...extra,
  });
  const colo = String(request.cf?.colo || '').trim().toUpperCase();
  if (colo) headers.set('X-FormatX-Edge', colo);
  return headers;
}

function jsonResponse(request, payload, status = 200, extra = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: speedHeaders(request, {
      'Content-Type': 'application/json; charset=utf-8',
      ...extra,
    }),
  });
}

function clampDownloadBytes(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return 4 * 1024 * 1024;
  return Math.max(MIN_DOWNLOAD_BYTES, Math.min(MAX_DOWNLOAD_BYTES, parsed));
}

function downloadStream(totalBytes) {
  let remaining = totalBytes;
  return new ReadableStream({
    pull(controller) {
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const size = Math.min(DOWNLOAD_CHUNK.byteLength, remaining);
      controller.enqueue(size === DOWNLOAD_CHUNK.byteLength ? DOWNLOAD_CHUNK : DOWNLOAD_CHUNK.slice(0, size));
      remaining -= size;
      if (remaining <= 0) controller.close();
    },
  });
}

async function rateLimit(request, env, bucket) {
  const limiter = env?.PUBLIC_API_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const raw = new TextEncoder().encode(`formatx-speedtest|${bucket}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', raw);
  const key = Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  const result = await limiter.limit({ key });
  if (result.success) return null;

  return jsonResponse(request, {
    error: 'rate_limited',
    message: 'Túl sok mérési kérés érkezett. Várj egy percet, majd próbáld újra.',
  }, 429, { 'Retry-After': '60' });
}

function sameOriginRequest(request) {
  const site = request.headers.get('Sec-Fetch-Site');
  if (!site || site === 'same-origin' || site === 'none') return true;
  return false;
}

async function handlePing(request, env) {
  const limited = await rateLimit(request, env, 'ping');
  if (limited) return limited;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse(request, { error: 'method_not_allowed' }, 405, { Allow: 'GET, HEAD' });
  }
  const headers = speedHeaders(request, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': '1',
  });
  return new Response(request.method === 'HEAD' ? null : new Uint8Array([0x58]), { status: 200, headers });
}

async function handleDownload(request, env, url) {
  const limited = await rateLimit(request, env, 'download');
  if (limited) return limited;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse(request, { error: 'method_not_allowed' }, 405, { Allow: 'GET, HEAD' });
  }
  const bytes = clampDownloadBytes(url.searchParams.get('bytes'));
  const headers = speedHeaders(request, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': String(bytes),
    'X-FormatX-Speedtest-Bytes': String(bytes),
  });
  return new Response(request.method === 'HEAD' ? null : downloadStream(bytes), { status: 200, headers });
}

async function handleUpload(request, env) {
  const limited = await rateLimit(request, env, 'upload');
  if (limited) return limited;
  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'method_not_allowed' }, 405, { Allow: 'POST' });
  }

  const declared = Number.parseInt(request.headers.get('Content-Length') || '0', 10);
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES) {
    return jsonResponse(request, { error: 'payload_too_large', max_bytes: MAX_UPLOAD_BYTES }, 413);
  }

  let received = 0;
  const reader = request.body?.getReader();
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value?.byteLength || 0;
      if (received > MAX_UPLOAD_BYTES) {
        try { await reader.cancel('payload_too_large'); } catch (_) {}
        return jsonResponse(request, { error: 'payload_too_large', max_bytes: MAX_UPLOAD_BYTES }, 413);
      }
    }
  }

  return jsonResponse(request, {
    ok: true,
    received_bytes: received,
    measurement: 'formatx_edge_upload',
  });
}

export async function handleSpeedTestRequest(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(SPEEDTEST_PREFIX)) return null;

  if (!sameOriginRequest(request)) {
    return jsonResponse(request, { error: 'same_origin_required' }, 403);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: speedHeaders(request, { Allow: 'GET, HEAD, POST, OPTIONS' }),
    });
  }

  if (url.pathname === PING_PATH) return handlePing(request, env);
  if (url.pathname === DOWNLOAD_PATH) return handleDownload(request, env, url);
  if (url.pathname === UPLOAD_PATH) return handleUpload(request, env);

  return jsonResponse(request, { error: 'not_found' }, 404);
}

export const SPEEDTEST_LIMITS = Object.freeze({
  maxDownloadBytes: MAX_DOWNLOAD_BYTES,
  maxUploadBytes: MAX_UPLOAD_BYTES,
});
