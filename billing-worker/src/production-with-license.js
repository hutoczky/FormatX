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
const RELEASE_METADATA_PATH = '/scifi-ui/data/current-release.json';
const PUBLIC_RELEASE_API_PATH = '/api/public-release';
const MULTIPLATFORM_DOWNLOAD_PATH = '/download/multiplatform';
const ANDROID_APK_PATH = '/scifi-ui/downloads/FormatX-Suite-Pro-Android.apk';
const ANDROID_APK_FILENAME = 'FormatX-Suite-Pro-Android-1.0.6.apk';
const ANDROID_NATIVE_BETA_PATH = '/scifi-ui/downloads/FormatX-Native-Android.apk';
const ANDROID_NATIVE_BETA_FILENAME = 'FormatX-Native-Android-1.1.0-beta.apk';
const AUDIO_TEST_WAV_PATH = '/scifi-ui/assets/audio/formatx-audio-test.wav';
const AUDIO_TEST_WAV = createAudioTestWav();
const THREE_STAGE_PATHS = new Set([
  '/scifi-ui/three-stage',
  '/scifi-ui/three-stage.html',
]);
const LIVING_CORE_PATHS = new Set([
  '/scifi-ui/living-core',
  '/scifi-ui/living-core.html',
]);

const CHECKOUT_PATHS = new Set([
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);

const RATE_LIMITED_API_PATHS = new Set([
  '/api/payment-confirmation',
  '/api/admin/approve-bank-transfer',
]);

const HOMEPAGE_PATHS = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const CANONICAL_PAGE_REDIRECTS = new Map([
  ['/index.html', '/'],
  ['/scifi-ui', '/scifi-ui/'],
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
  "connect-src 'self'",
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
  "script-src 'self' blob: 'sha256-l1yP9fGwg/zCCCWl6g2Cen0mXM6bs3A7z30qWUVzQ9c=' https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'none'",
  "connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
  "media-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const LIVING_CORE_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "media-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=(self)',
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

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === AUDIO_TEST_WAV_PATH
    ) {
      return secureResponse(serveAudioTestWav(request), url);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === RELEASE_METADATA_PATH
    ) {
      const response = await servePublicReleaseMetadata(request, env);
      return secureResponse(response, url);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === PUBLIC_RELEASE_API_PATH
    ) {
      const response = await servePublicReleaseApi(request, env);
      return secureResponse(response, url);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === MULTIPLATFORM_DOWNLOAD_PATH
    ) {
      const response = await serveMultiplatformPackage(request, env);
      return secureResponse(response, url);
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === '/download/android-native-beta'
    ) {
      const response = await serveLocalDownload(
        request,
        env,
        ANDROID_NATIVE_BETA_PATH,
        ANDROID_NATIVE_BETA_FILENAME,
        'application/vnd.android.package-archive',
      );
      return secureResponse(response, url);
    }

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

    if (
      (request.method === 'GET' || request.method === 'HEAD')
      && url.pathname === '/download/android'
    ) {
      const apkResponse = await serveLocalDownload(
        request,
        env,
        ANDROID_APK_PATH,
        ANDROID_APK_FILENAME,
        'application/vnd.android.package-archive',
      );
      return secureResponse(apkResponse, url);
    }

    const liveRequest = isCanonicalHomepageRequest(request, url)
      ? createHomepageAssetRequest(request)
      : request;
    let response = await liveWorker.fetch(liveRequest, env, ctx);

    if (url.pathname === '/api/health') {
      response = await annotateHealthResponse(response, salesReady);
    }

    response = sanitiseApiServerError(response, url.pathname);
    response = await concealUpstreamPlatform(response);
    return secureResponse(response, url);
  },
};

function normalisePath(pathname) {
  return String(pathname || '').replace(/\/+$/, '') || '/';
}

export function isThreeStagePath(pathname) {
  return THREE_STAGE_PATHS.has(normalisePath(pathname));
}

export function isLivingCorePath(pathname) {
  return LIVING_CORE_PATHS.has(normalisePath(pathname));
}

export function canonicalPageRedirect(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  if (url.hostname === 'formatxsuite.com' && HOMEPAGE_PATHS.has(url.pathname)) {
    const target = new URL('/', PUBLIC_ORIGIN);
    target.search = url.search;
    return Response.redirect(target.toString(), 308);
  }

  const targetPath = CANONICAL_PAGE_REDIRECTS.get(url.pathname);
  if (!targetPath) return null;

  const targetOrigin = url.hostname === 'formatxsuite.com'
    ? PUBLIC_ORIGIN
    : url.origin;
  const target = new URL(targetPath, targetOrigin);
  target.search = url.search;
  if (target.href === url.href) return null;
  return Response.redirect(target.toString(), 308);
}

function isCanonicalHomepageRequest(request, url) {
  return (request.method === 'GET' || request.method === 'HEAD')
    && url.hostname === 'www.formatxsuite.com'
    && url.pathname === '/';
}

function createHomepageAssetRequest(request) {
  const assetUrl = new URL('/scifi-ui/', request.url);
  return new Request(assetUrl, request);
}

export function createAudioTestWav() {
  const sampleRate = 8000;
  const durationSeconds = 0.3;
  const sampleCount = Math.round(sampleRate * durationSeconds);
  const bytesPerSample = 2;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeText = (offset, text) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const inFirstTone = time < 0.14;
    const inGap = time >= 0.14 && time < 0.16;
    const segmentTime = inFirstTone ? time : time - 0.16;
    const frequency = inGap ? 0 : inFirstTone ? 700 : 1050;
    const segmentDuration = inGap ? 0.02 : 0.14;
    const attack = Math.min(1, Math.max(0, segmentTime / 0.008));
    const release = Math.min(1, Math.max(0, (segmentDuration - segmentTime) / 0.02));
    const envelope = frequency ? Math.min(attack, release) : 0;
    const value = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.65;
    view.setInt16(44 + index * 2, Math.round(value * 32767), true);
  }

  return new Uint8Array(buffer);
}

function serveAudioTestWav(request) {
  return new Response(request.method === 'HEAD' ? null : AUDIO_TEST_WAV.slice(), {
    status: 200,
    headers: {
      'Content-Type': 'audio/wav',
      'Content-Length': String(AUDIO_TEST_WAV.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'none',
    },
  });
}

async function readRawReleaseMetadata(request, env) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') return null;
  const assetUrl = new URL(RELEASE_METADATA_PATH, request.url);
  assetUrl.searchParams.set('internal', '1');
  const response = await env.ASSETS.fetch(new Request(assetUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  }));
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

function publicReleaseMetadata(raw) {
  if (!raw || raw.ok !== true) {
    return {
      schema_version: 3,
      ok: false,
      source: 'formatx_release_service',
      error: 'release_metadata_unavailable',
    };
  }

  const multiplatform = raw.channels?.multiplatform || null;
  const android = raw.channels?.android || null;
  return {
    schema_version: 3,
    ok: true,
    source: 'formatx_release_service',
    version: raw.version || null,
    release_name: raw.release_name || 'FormatX Suite Pro',
    published_at: raw.published_at || null,
    source_updated_at: raw.source_updated_at || null,
    prerelease: Boolean(raw.prerelease),
    release_url: '/scifi-ui/downloads/',
    notes_url: '/scifi-ui/verification.html',
    channels: {
      multiplatform: multiplatform ? {
        available: multiplatform.available === true,
        name: multiplatform.name || 'FormatX-Suite-Pro.zip',
        download_url: MULTIPLATFORM_DOWNLOAD_PATH,
        size: Number(multiplatform.size) || null,
        digest: multiplatform.digest || null,
        content_type: multiplatform.content_type || 'application/zip',
        download_count: Number(multiplatform.download_count) || null,
        source: 'formatx_release_service',
        primary_platform: multiplatform.primary_platform || 'linux-bazzite',
        supported_platforms: Array.isArray(multiplatform.supported_platforms)
          ? multiplatform.supported_platforms
          : ['linux-bazzite', 'windows'],
      } : { available: false, download_url: MULTIPLATFORM_DOWNLOAD_PATH },
      android: android ? {
        available: android.available === true,
        name: android.name || ANDROID_APK_FILENAME,
        download_url: '/download/android',
        size: Number(android.size) || null,
        digest: android.digest || null,
        content_type: 'application/vnd.android.package-archive',
        source: 'formatx_release_service',
      } : {
        available: true,
        name: ANDROID_APK_FILENAME,
        download_url: '/download/android',
        content_type: 'application/vnd.android.package-archive',
        source: 'formatx_release_service',
      },
    },
    evidence: {
      test_matrix_url: '/scifi-ui/test-matrix.html',
      known_issues_url: '/scifi-ui/known-issues.html',
      verification_url: '/scifi-ui/verification.html',
      checksum_asset_url: null,
      signature_asset_url: null,
    },
    integrity: raw.integrity || {
      package_digest_available: Boolean(multiplatform?.digest),
      checksum_asset_available: false,
      signature_asset_available: false,
      status: multiplatform?.digest ? 'digest_published' : 'package_only',
    },
    error: null,
  };
}

async function servePublicReleaseMetadata(request, env) {
  const payload = publicReleaseMetadata(await readRawReleaseMetadata(request, env));
  const body = JSON.stringify(payload);
  return new Response(request.method === 'HEAD' ? null : body, {
    status: payload.ok ? 200 : 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(new TextEncoder().encode(body).byteLength),
    },
  });
}

async function servePublicReleaseApi(request, env) {
  const release = publicReleaseMetadata(await readRawReleaseMetadata(request, env));
  if (!release.ok) {
    return new Response(JSON.stringify({ error: 'release_metadata_unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const asset = release.channels.multiplatform;
  const payload = {
    tag_name: release.version || '',
    name: release.release_name || 'FormatX Suite Pro',
    draft: false,
    prerelease: Boolean(release.prerelease),
    published_at: release.published_at,
    html_url: '/scifi-ui/downloads/',
    assets: asset?.available ? [{
      name: asset.name,
      size: asset.size,
      browser_download_url: MULTIPLATFORM_DOWNLOAD_PATH,
    }] : [],
  };
  const body = JSON.stringify(payload);
  return new Response(request.method === 'HEAD' ? null : body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(new TextEncoder().encode(body).byteLength),
    },
  });
}

function isTrustedReleaseAsset(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname === 'github.com'
      && url.pathname.startsWith('/hutoczky/FormatX-Updates/releases/download/');
  } catch (_) {
    return false;
  }
}

async function serveMultiplatformPackage(request, env) {
  const raw = await readRawReleaseMetadata(request, env);
  const asset = raw?.channels?.multiplatform;
  if (!asset?.available || !isTrustedReleaseAsset(asset.download_url)) {
    return new Response('A FormatX multiplatform csomag jelenleg nem tölthető le.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const upstreamHeaders = new Headers({
    Accept: 'application/octet-stream, application/zip;q=0.9, */*;q=0.1',
    'User-Agent': 'FormatX-Release-Proxy/1.0',
  });
  const range = request.headers.get('Range');
  if (range) upstreamHeaders.set('Range', range);

  let upstream;
  try {
    upstream = await fetch(asset.download_url, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'follow',
    });
  } catch (_) {
    upstream = null;
  }

  if (!upstream || (!upstream.ok && upstream.status !== 206)) {
    return new Response('A FormatX multiplatform csomag jelenleg nem tölthető le.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const filename = String(asset.name || 'FormatX-Suite-Pro.zip').replace(/[^A-Za-z0-9._-]/g, '_');
  const headers = new Headers({
    'Content-Type': asset.content_type || upstream.headers.get('Content-Type') || 'application/zip',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  for (const name of ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Last-Modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function serveLocalDownload(request, env, assetPath, filename, contentType) {
  if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') {
    return new Response('A kért FormatX csomag jelenleg nem tölthető le.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const assetUrl = new URL(assetPath, request.url);
  const assetHeaders = new Headers();
  const range = request.headers.get('Range');
  if (range) assetHeaders.set('Range', range);
  const upstream = await env.ASSETS.fetch(new Request(assetUrl, {
    method: request.method,
    headers: assetHeaders,
  }));

  if (!upstream.ok && upstream.status !== 206) {
    return new Response('A kért FormatX csomag jelenleg nem tölthető le.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  for (const name of ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Last-Modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
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

export function concealUpstreamText(value) {
  return String(value || '')
    .replace(/connect-src 'self' https:\/\/api\.github\.com/gi, "connect-src 'self'")
    .replace(/https:\/\/raw\.githubusercontent\.com\/hutoczky\/FormatX\/master\/docs\/scifi-ui\/downloads\/FormatX-Native-Android\.apk/gi, '/download/android-native-beta')
    .replace(/https:\/\/api\.github\.com\/repos\/hutoczky\/FormatX-Updates\/releases\/latest/gi, PUBLIC_RELEASE_API_PATH)
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/download\/[^"'\s<>()]+/gi, MULTIPLATFORM_DOWNLOAD_PATH)
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX-Updates\/releases\/(?:latest|tag\/[^"'\s<>()]+)/gi, '/scifi-ui/downloads/')
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX\/releases\/tag\/android-native-v1\.1\.0-beta/gi, '/scifi-ui/android/')
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX\/issues(?:\/new)?/gi, '/scifi-ui/support.html')
    .replace(/https:\/\/github\.com\/hutoczky\/FormatX(?:\/)?/gi, '/')
    .replace(/https:\/\/api\.github\.com(?:\/[^"'\s<>()]*)?/gi, PUBLIC_RELEASE_API_PATH)
    .replace(/https:\/\/raw\.githubusercontent\.com\/[^"'\s<>()]+/gi, '/')
    .replace(/https:\/\/github\.com\/[^"'\s<>()]+/gi, '/')
    .replace(/\bGitHub Releases\b/gi, 'hivatalos kiadási csatorna')
    .replace(/\bGitHub release(?:s)?\b/gi, 'hivatalos kiadás')
    .replace(/\bGitHub hibajegy\b/gi, 'nyilvános hibajegy')
    .replace(/githubusercontent/gi, 'formatx-assets')
    .replace(/github/gi, 'formatx');
}

async function concealUpstreamPlatform(response) {
  const contentType = response.headers.get('Content-Type') || '';
  if (!/(?:text\/|application\/(?:json|javascript|ld\+json)|image\/svg\+xml)/i.test(contentType)) {
    return response;
  }

  let body;
  try {
    body = concealUpstreamText(await response.text());
  } catch (_) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  headers.delete('ETag');
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function secureResponse(response, url) {
  const headers = new Headers(response.headers);
  const contentType = headers.get('Content-Type') || '';
  const isThreeStage = isThreeStagePath(url.pathname);
  const isLivingCore = isLivingCorePath(url.pathname);

  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', isThreeStage ? 'SAMEORIGIN' : 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  headers.delete('Server');
  headers.delete('X-Powered-By');
  headers.delete('Via');
  headers.delete('X-GitHub-Request-Id');
  headers.delete('X-Fastly-Request-Id');

  if (contentType.includes('text/html')) {
    const canonicalPath = ['/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html'].includes(url.pathname)
      ? '/'
      : url.pathname;
    headers.set('Link', `<${PUBLIC_ORIGIN}${canonicalPath}>; rel="canonical"`);
    const contentSecurityPolicy = isThreeStage
      ? THREE_STAGE_CONTENT_SECURITY_POLICY
      : isLivingCore
        ? LIVING_CORE_CONTENT_SECURITY_POLICY
        : url.pathname.endsWith('/checkout.html')
          ? CHECKOUT_CONTENT_SECURITY_POLICY
          : CONTENT_SECURITY_POLICY;
    headers.set('Content-Security-Policy', contentSecurityPolicy);
    headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  } else if (/\.(?:css|js)$/i.test(url.pathname)) {
    headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
