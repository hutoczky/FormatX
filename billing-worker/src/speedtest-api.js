const SPEED_ROOT = '/api/speedtest';
const PING_PATH = SPEED_ROOT + '/ping';
const DOWNLOAD_PATH = SPEED_ROOT + '/download';
const UPLOAD_PATH = SPEED_ROOT + '/upload';
const MIN_DOWNLOAD_BYTES = 64 * 1024;
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function commonHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...commonHeaders(),
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function sameOriginBrowserRequest(request, url) {
  const fetchSite = String(request.headers.get('Sec-Fetch-Site') || '').toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site') return false;
  const origin = request.headers.get('Origin');
  if (origin) {
    try {
      if (new URL(origin).hostname !== url.hostname) return false;
    } catch (_) {
      return false;
    }
  }
  return true;
}

async function rateLimitKey(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bytes = new TextEncoder().encode('formatx-speedtest|' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function applyRateLimit(request, env) {
  const limiter = env?.PUBLIC_API_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;
  const key = await rateLimitKey(request);
  const result = await limiter.limit({ key: 'speedtest:' + key });
  if (result?.success === false) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }
  return null;
}

export function isSpeedTestPath(pathname) {
  return pathname === PING_PATH || pathname === DOWNLOAD_PATH || pathname === UPLOAD_PATH;
}

export async function handleSpeedTestRequest(request, env) {
  const url = new URL(request.url);
  if (!isSpeedTestPath(url.pathname)) return null;
  if (!sameOriginBrowserRequest(request, url)) return json({ ok: false, error: 'same_origin_required' }, 403);
  const limited = await applyRateLimit(request, env);
  if (limited) return limited;

  if (url.pathname === PING_PATH) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ ok: false, error: 'method_not_allowed' }, 405);
    }
    const payload = {
      ok: true,
      edge: request.cf?.colo || null,
      at: Date.now(),
    };
    if (request.method === 'HEAD') {
      return new Response(null, { status: 204, headers: commonHeaders() });
    }
    return json(payload);
  }

  if (url.pathname === DOWNLOAD_PATH) {
    if (request.method !== 'GET') return json({ ok: false, error: 'method_not_allowed' }, 405);
    const bytes = clampInt(url.searchParams.get('bytes'), MIN_DOWNLOAD_BYTES, MAX_DOWNLOAD_BYTES, 2 * 1024 * 1024);
    const body = new Uint8Array(bytes);
    // A cheap deterministic non-zero pattern avoids pathological proxy/content heuristics
    // while keeping Worker CPU cost negligible compared with the network transfer itself.
    for (let i = 0; i < body.length; i += 4096) body[i] = (i >>> 12) & 255;
    return new Response(body, {
      status: 200,
      headers: {
        ...commonHeaders(),
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(bytes),
        'Content-Disposition': 'inline; filename="formatx-speed.bin"',
        'X-FormatX-SpeedTest-Bytes': String(bytes),
      },
    });
  }

  if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  const declared = clampInt(request.headers.get('Content-Length'), 0, MAX_UPLOAD_BYTES + 1, 0);
  if (declared > MAX_UPLOAD_BYTES) return json({ ok: false, error: 'payload_too_large' }, 413);
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_UPLOAD_BYTES) return json({ ok: false, error: 'payload_too_large' }, 413);
  return json({
    ok: true,
    bytes: body.byteLength,
    edge: request.cf?.colo || null,
    at: Date.now(),
  });
}

export const speedTestConstants = Object.freeze({
  SPEED_ROOT,
  PING_PATH,
  DOWNLOAD_PATH,
  UPLOAD_PATH,
  MIN_DOWNLOAD_BYTES,
  MAX_DOWNLOAD_BYTES,
  MAX_UPLOAD_BYTES,
});
