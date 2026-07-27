import liveWorker from './live-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';
import { handleV100PricingRequest } from './pricing-v100-api.js';
import { handleProjectAi } from './project-ai.js';
import {
  annotateHealthResponse,
  createSalesUnavailableJson,
  createSalesUnavailablePage,
  isSalesLegallyReady,
} from './sales-gate.js';

const PUBLIC_ORIGIN = 'https://www.formatxsuite.com';
const ANDROID_APK_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const ANDROID_APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.6.apk';
const THREE_STAGE_PATHS = new Set([
  '/scifi-ui/three-stage',
  '/scifi-ui/three-stage.html',
]);

const CHECKOUT_PATHS = new Set([
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);

const RATE_LIMITED_API_PATHS = new Set([
  '/api/payment-confirmation',
  '/api/admin/approve-bank-transfer',
]);

const CANONICAL_PAGE_REDIRECTS = new Map([
  ['/', '/scifi-ui/'],
  ['/index.html', '/scifi-ui/'],
  ['/scifi-ui', '/scifi-ui/'],
  ['/scifi-ui/index.html', '/scifi-ui/'],
  ['/checkout.html', '/scifi-ui/checkout.html'],
]);

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
  'upgrade-insecure-requests',
].join('; ');

const CHECKOUT_CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY.replace(
  "img-src 'self' data:",
  "img-src 'self' data: https://quickchart.io",
);

const THREE_STAGE_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "script-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'none'",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
  "media-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const PERMISSIONS_POLICY = [
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
].join(', ');

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const licenseResponse = await handleLicenseCenterRequest(request, env);
    if (licenseResponse) return secureResponse(licenseResponse, url);

    const salesReady = isSalesLegallyReady(env);
    if (!salesReady) {
      if (request.method === 'GET' && CHECKOUT_PATHS.has(url.pathname)) {
        return secureResponse(createSalesUnavailablePage(), url);
      }
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return secureResponse(createSalesUnavailableJson(), url);
      }
    }

    const pricingResponse = await handleV100PricingRequest(request, env);
    if (pricingResponse) return secureResponse(pricingResponse, url);

    if (url.pathname === '/api/project-ai') {
      const projectAiResponse = await handleProjectAi(request, env);
      return secureResponse(sanitiseApiServerError(projectAiResponse, url.pathname), url);
    }

    if (request.method !== 'OPTIONS' && RATE_LIMITED_API_PATHS.has(url.pathname)) {
      const rateLimitedResponse = await enforceApiRateLimit(request, env, url.pathname);
      if (rateLimitedResponse) return secureResponse(rateLimitedResponse, url);
    }

    const redirect = canonicalPageRedirect(request, url);
    if (redirect) return secureResponse(redirect, url);

    if (request.method === 'GET' && url.pathname === '/download/android') {
      const apkResponse = await serveAndroidApk(request, env);
      return secureResponse(apkResponse, url);
    }

    let response = await liveWorker.fetch(request, env, ctx);

    if (url.pathname === '/api/health') {
      response = await annotateHealthResponse(response, salesReady);
    }

    response = sanitiseApiServerError(response, url.pathname);
    return secureResponse(response, url);
  },
};

export function isThreeStagePath(pathname) {
  const normalized = String(pathname || '').replace(/\/+$/, '') || '/';
  return THREE_STAGE_PATHS.has(normalized);
}

export function canonicalPageRedirect(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  const targetPath = CANONICAL_PAGE_REDIRECTS.get(url.pathname);
  if (!targetPath) return null;

  const targetOrigin = url.hostname === 'formatxsuite.com'
    ? PUBLIC_ORIGIN
    : url.origin;
  const target = new URL(targetPath, targetOrigin);
  target.search = url.search;
  return Response.redirect(target.toString(), 308);
}

async function enforceApiRateLimit(request, env, pathname) {
  const limiter = env.PUBLIC_API_RATE_LIMIT || env.PROJECT_AI_RATE_LIMIT;
  if (!limiter || typeof limiter.limit !== 'function') return null;

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
  if (!pathname.startsWith('/api/') || response.status < 500) return response;

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

export function secureResponse(response, url) {
  const headers = new Headers(response.headers);
  const contentType = headers.get('Content-Type') || '';
  const isThreeStage = isThreeStagePath(url.pathname);

  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', isThreeStage ? 'SAMEORIGIN' : 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  headers.delete('Server');
  headers.delete('X-Powered-By');

  if (contentType.includes('text/html')) {
    const canonicalPath = url.pathname === '/scifi-ui/index.html'
      ? '/scifi-ui/'
      : url.pathname;
    headers.set('Link', `<${PUBLIC_ORIGIN}${canonicalPath}>; rel="canonical"`);
    const contentSecurityPolicy = isThreeStage
      ? THREE_STAGE_CONTENT_SECURITY_POLICY
      : url.pathname.endsWith('/checkout.html')
        ? CHECKOUT_CONTENT_SECURITY_POLICY
        : CONTENT_SECURITY_POLICY;
    headers.set('Content-Security-Policy', contentSecurityPolicy);
    headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  } else if (/\.(?:css|js)$/i.test(url.pathname)) {
    // The public HTML uses stable asset URLs. Revalidation prevents a browser
    // from keeping an older cinematic controller after a new deployment.
    headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
