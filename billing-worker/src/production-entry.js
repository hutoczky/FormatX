import liveWorker from './live-entry.js';
import { handleProjectAi } from './project-ai.js';
import {
  annotateHealthResponse,
  createSalesUnavailableJson,
  createSalesUnavailablePage,
  isSalesLegallyReady,
} from './sales-gate.js';

const ANDROID_APK_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const ANDROID_APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.6.apk';
const PUBLIC_ORIGIN = 'https://www.formatxsuite.com';
const LEGACY_HOME_PATHS = new Set([
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);
const CHECKOUT_PATHS = new Set([
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);
const RATE_LIMITED_API_PATHS = new Set([
  '/api/create-checkout-session',
  '/api/payment-confirmation',
  '/api/license/verify',
  '/api/admin/approve-bank-transfer',
]);

const THEME_SCRIPT = '/scifi-ui/scripts/theme-system.js?v=20260720-theme-1';
const THEME_STYLES = '/scifi-ui/styles/theme-system.css?v=20260720-theme-1';
const PROJECT_AI_SCRIPT = '/scifi-ui/scripts/project-ai.js?v=20260720-project-ai-1';
const PROJECT_AI_STYLES = '/scifi-ui/styles/project-ai.css?v=20260720-project-ai-1';
const RESPONSIVE_PARITY_SCRIPT = '/scifi-ui/scripts/responsive-parity.js?v=20260720-responsive-parity-1';
const RESPONSIVE_PARITY_STYLES = '/scifi-ui/styles/responsive-parity.css?v=20260720-responsive-parity-1';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join('; ');

const CHECKOUT_CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY.replace(
  "img-src 'self' data:",
  "img-src 'self' data: https://quickchart.io",
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const salesReady = isSalesLegallyReady(env);

    if (!salesReady) {
      if (request.method === 'GET' && CHECKOUT_PATHS.has(url.pathname)) {
        return await secureAndEnhanceResponse(createSalesUnavailablePage(), url);
      }
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await secureAndEnhanceResponse(createSalesUnavailableJson(), url);
      }
    }

    if (request.method !== 'OPTIONS' && RATE_LIMITED_API_PATHS.has(url.pathname)) {
      const rateLimitedResponse = await enforceApiRateLimit(request, env, url.pathname);
      if (rateLimitedResponse) {
        return await secureAndEnhanceResponse(rateLimitedResponse, url);
      }
    }

    let response;
    if (url.pathname === '/api/project-ai') {
      response = await handleProjectAi(request, env);
    } else if (
      request.method === 'GET'
      && (
        url.pathname === '/'
        || url.pathname === '/index.html'
        || LEGACY_HOME_PATHS.has(url.pathname)
      )
    ) {
      response = await serveEnhancedHome(request, env);
    } else if (request.method === 'GET' && url.pathname === '/download/android') {
      response = await serveAndroidApk(request, env);
    } else {
      response = await liveWorker.fetch(request, env, ctx);
    }

    if (url.pathname === '/api/health') {
      response = await annotateHealthResponse(response, salesReady);
    }

    if (url.pathname.startsWith('/api/') && response.status >= 500) {
      response = sanitiseApiServerError(response, url.pathname);
    }

    return await secureAndEnhanceResponse(response, url);
  },
};

async function enforceApiRateLimit(request, env, pathname) {
  const limiter = env.PUBLIC_API_RATE_LIMIT || env.PROJECT_AI_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') {
    return null;
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const data = new TextEncoder().encode(`formatx-public-api|${pathname}|${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const key = Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const result = await limiter.limit({ key });
  if (result.success) return null;

  return new Response(JSON.stringify({
    error: 'rate_limited',
    message: 'Túl sok kérés érkezett. Várj egy percet, majd próbáld újra.',
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '60',
    },
  });
}

function sanitiseApiServerError(response, pathname) {
  console.error(`FormatX API server error: ${pathname} returned ${response.status}`);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  return new Response(JSON.stringify({
    error: 'internal_server_error',
    message: 'A szolgáltatás átmeneti hibát észlelt. Próbáld újra később.',
  }), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serveEnhancedHome(request, env) {
  const assetUrl = new URL('/scifi-ui/index.html', request.url);
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: request.headers,
  }));

  if (!upstream.ok) return upstream;

  let html = await upstream.text();
  html = html
    .replaceAll('="./', '="/scifi-ui/')
    .replaceAll("='./", "='/scifi-ui/")
    .replaceAll('https://formatx1.formatx.workers.dev/download/android?v=1.0.4', '/download/android')
    .replace(
      '</head>',
      [
        '<link rel="stylesheet" href="/scifi-ui/styles/main-spatial.css?v=20260720-spatial-7">',
        '<link rel="stylesheet" href="/scifi-ui/styles/main-readability.css?v=20260720-readability-2">',
        '<link rel="stylesheet" href="/scifi-ui/styles/quantum-twin.css?v=20260720-quantum-1">',
        '</head>',
      ].join(''),
    )
    .replace(
      '</body>',
      [
        '<script defer src="/scifi-ui/scripts/project-hub.js?v=20260720-project-hub-8"></script>',
        '<script defer src="/scifi-ui/scripts/quantum-twin.js?v=20260720-quantum-1"></script>',
        '</body>',
      ].join(''),
    );

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Content-Location', new URL(request.url).pathname);
  headers.set('Vary', 'Accept-Encoding');
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');

  return new Response(html, {
    status: 200,
    headers,
  });
}

async function serveAndroidApk(request, env) {
  const assetUrl = new URL(ANDROID_APK_PATH, request.url);
  assetUrl.searchParams.set('v', '1.0.6');
  const assetHeaders = new Headers();
  const range = request.headers.get('Range');
  if (range) assetHeaders.set('Range', range);

  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: assetHeaders,
  }));

  if (!upstream.ok && upstream.status !== 206) {
    return new Response('Az Android alkalmazás jelenleg nem tölthető le.', {
      status: 502,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', 'application/vnd.android.package-archive');
  headers.set('Content-Disposition', `attachment; filename="${ANDROID_APK_FILENAME}"`);
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function secureAndEnhanceResponse(response, url) {
  const pathname = url.pathname;
  const headers = new Headers(response.headers);
  const contentType = headers.get('Content-Type') || '';
  const isHtml = contentType.includes('text/html');
  let body = response.body;

  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'camera=()',
    'display-capture=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'publickey-credentials-get=()',
    'usb=()',
  ].join(', '));

  if (isHtml) {
    const canonicalPath = pathname === '/index.html' || LEGACY_HOME_PATHS.has(pathname)
      ? '/'
      : pathname;
    headers.set('Link', `<${PUBLIC_ORIGIN}${canonicalPath}>; rel="canonical"`);
    headers.set(
      'Content-Security-Policy',
      pathname.endsWith('/checkout.html')
        ? CHECKOUT_CONTENT_SECURITY_POLICY
        : CONTENT_SECURITY_POLICY,
    );

    if (response.status >= 200 && response.status < 300 && response.body) {
      let html = await response.text();
      if (!html.includes(THEME_SCRIPT)) {
        html = html.replace(
          '<head>',
          `<head><script src="${THEME_SCRIPT}"></script>`,
        );
      }
      if (!html.includes(THEME_STYLES)) {
        html = html.replace(
          '</head>',
          `<link rel="stylesheet" href="${THEME_STYLES}"></head>`,
        );
      }
      if (!html.includes(PROJECT_AI_STYLES)) {
        html = html.replace(
          '</head>',
          `<link rel="stylesheet" href="${PROJECT_AI_STYLES}"></head>`,
        );
      }
      if (!html.includes(RESPONSIVE_PARITY_STYLES)) {
        html = html.replace(
          '</head>',
          `<link rel="stylesheet" href="${RESPONSIVE_PARITY_STYLES}"></head>`,
        );
      }
      if (!html.includes(RESPONSIVE_PARITY_SCRIPT)) {
        html = html.replace(
          '</body>',
          `<script defer src="${RESPONSIVE_PARITY_SCRIPT}"></script></body>`,
        );
      }
      if (!html.includes(PROJECT_AI_SCRIPT)) {
        html = html.replace(
          '</body>',
          `<script defer src="${PROJECT_AI_SCRIPT}"></script></body>`,
        );
      }
      body = html;
      headers.delete('Content-Length');
      headers.delete('Content-Encoding');
      headers.set('Cache-Control', pathname === '/' ? 'no-store, max-age=0' : 'private, max-age=0, must-revalidate');
    }
  }

  headers.delete('Server');
  headers.delete('X-Powered-By');

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
