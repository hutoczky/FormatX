import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';
import { handleV100PricingRequest } from './pricing-v100-api.js';

const START_SALE_VERSION = '20260725-separate-qr-row-5';
const FUTURE_5000_VERSION = '20260725-year-5000-refined-3';
const FUTURE_5000_EFFECTS_VERSION = '20260725-year-5000-cinematic-1';
const FUTURE_5000_READABILITY_VERSION = '20260725-year-5000-readability-1';
const CAUSAL_HOVER_VERSION = '20260726-causal-hover-2';
const CAUSAL_BOOT_VERSION = '20260726-causal-boot-3';
const SITE_READABILITY_VERSION = '20260726-site-readability-1';
const SITE_AMBIENT_VERSION = '20260726-quantum-aurora-1';
const SITE_PREMIUM_VERSION = '20260726-premium-finish-1';
const CHECKOUT_SCRIPT = `/scifi-ui/scripts/checkout-v100.js?v=${START_SALE_VERSION}`;
const CHECKOUT_LANGUAGE_SCRIPT = `/scifi-ui/scripts/checkout-language-v100.js?v=${START_SALE_VERSION}`;
const LICENSE_PERMISSIONS_POLICY = [
  'camera=()',
  'geolocation=()',
  'microphone=()',
  'payment=()',
  'publickey-credentials-get=()',
  'usb=()',
].join(', ');

const START_SALE_PATHS = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);

const STATIC_VISUAL_PATHS = new Set([
  '/',
  '/index.html',
  '/scifi-ui',
  '/scifi-ui/',
  '/scifi-ui/index.html',
]);

const CHECKOUT_PATHS = new Set([
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);

class GlobalVisualHeadHandler {
  constructor(skipStaticVisuals) {
    this.skipStaticVisuals = skipStaticVisuals;
  }

  element(element) {
    if (this.skipStaticVisuals) return;
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/site-ambient-background.css?v=${SITE_AMBIENT_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/site-quantum-aurora.css?v=${SITE_AMBIENT_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/site-premium-finish.css?v=${SITE_PREMIUM_VERSION}">`,
      { html: true },
    );
  }
}

class GlobalVisualBodyHandler {
  constructor(skipStaticVisuals) {
    this.skipStaticVisuals = skipStaticVisuals;
  }

  element(element) {
    if (this.skipStaticVisuals) return;
    element.append(
      `<script defer src="/scifi-ui/scripts/site-ambient-background.js?v=${SITE_AMBIENT_VERSION}"></script>`,
      { html: true },
    );
  }
}

class StartSaleHeadHandler {
  constructor(isCheckout) {
    this.isCheckout = isCheckout;
  }

  element(element) {
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/start-sale.css?v=${START_SALE_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/pricing-v100.css?v=${START_SALE_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/future-5000.css?v=${FUTURE_5000_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/future-5000-effects.css?v=${FUTURE_5000_EFFECTS_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/future-5000-readability.css?v=${FUTURE_5000_READABILITY_VERSION}">`,
      { html: true },
    );
    if (!this.isCheckout) {
      element.append(
        `<link rel="stylesheet" href="/scifi-ui/styles/causal-memory-hover.css?v=${CAUSAL_HOVER_VERSION}">`,
        { html: true },
      );
      element.append(
        `<link rel="stylesheet" href="/scifi-ui/styles/causal-memory-boot.css?v=${CAUSAL_BOOT_VERSION}">`,
        { html: true },
      );
    }
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/site-readability-audit.css?v=${SITE_READABILITY_VERSION}">`,
      { html: true },
    );
  }
}

class StartSaleBodyHandler {
  constructor(isCheckout) {
    this.isCheckout = isCheckout;
  }

  element(element) {
    element.append(
      `<script defer src="/scifi-ui/scripts/start-sale.js?v=${START_SALE_VERSION}"></script>`,
      { html: true },
    );
    element.append(
      `<script defer src="/scifi-ui/scripts/future-5000.js?v=${FUTURE_5000_VERSION}"></script>`,
      { html: true },
    );
    element.append(
      `<script defer src="/scifi-ui/scripts/future-5000-effects.js?v=${FUTURE_5000_EFFECTS_VERSION}"></script>`,
      { html: true },
    );
    if (this.isCheckout) return;
    element.append(
      `<script defer src="/scifi-ui/scripts/causal-memory-hover.js?v=${CAUSAL_HOVER_VERSION}"></script>`,
      { html: true },
    );
    element.append(
      `<script defer src="/scifi-ui/scripts/causal-memory-boot.js?v=${CAUSAL_BOOT_VERSION}"></script>`,
      { html: true },
    );
  }
}

class CheckoutScriptHandler {
  constructor(isCheckout) {
    this.isCheckout = isCheckout;
  }

  element(element) {
    if (!this.isCheckout) return;
    const src = String(element.getAttribute('src') || '');
    if (src.includes('/scripts/checkout-language.js') || src.includes('./scripts/checkout-language.js')) {
      element.setAttribute('src', CHECKOUT_LANGUAGE_SCRIPT);
      return;
    }
    if (src.includes('/scripts/checkout.js') || src.includes('./scripts/checkout.js')) {
      element.setAttribute('src', CHECKOUT_SCRIPT);
    }
  }
}

function isHtmlResponse(response) {
  const contentType = response.headers.get('Content-Type') || '';
  return response.status === 200 && contentType.toLowerCase().includes('text/html');
}

function injectSiteAssets(response, url) {
  const startSale = START_SALE_PATHS.has(url.pathname);
  const isCheckout = CHECKOUT_PATHS.has(url.pathname);
  const staticVisuals = STATIC_VISUAL_PATHS.has(url.pathname);
  const rewriter = new HTMLRewriter()
    .on('head', new GlobalVisualHeadHandler(staticVisuals))
    .on('body', new GlobalVisualBodyHandler(staticVisuals));

  if (startSale) {
    rewriter
      .on('head', new StartSaleHeadHandler(isCheckout))
      .on('body', new StartSaleBodyHandler(isCheckout))
      .on('script[src]', new CheckoutScriptHandler(isCheckout));
  }

  return rewriter.transform(response);
}

function secureLicenseResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Permissions-Policy', LICENSE_PERMISSIONS_POLICY);
  headers.delete('Server');
  headers.delete('X-Powered-By');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const licenseResponse = await handleLicenseCenterRequest(request, env);
    if (licenseResponse) return secureLicenseResponse(licenseResponse);

    const pricingResponse = await handleV100PricingRequest(request, env);
    if (pricingResponse) return secureLicenseResponse(pricingResponse);

    const response = await productionWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    return isHtmlResponse(response) ? injectSiteAssets(response, url) : response;
  },
};
