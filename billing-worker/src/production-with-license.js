import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';
import { handleV100PricingRequest } from './pricing-v100-api.js';

const START_SALE_VERSION = '20260725-introductory-pricing-3';
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
const CHECKOUT_PATHS = new Set([
  '/checkout.html',
  '/scifi-ui/checkout.html',
]);

class StartSaleHeadHandler {
  element(element) {
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/start-sale.css?v=${START_SALE_VERSION}">`,
      { html: true },
    );
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/pricing-v100.css?v=${START_SALE_VERSION}">`,
      { html: true },
    );
  }
}

class StartSaleBodyHandler {
  element(element) {
    element.append(
      `<script defer src="/scifi-ui/scripts/start-sale.js?v=${START_SALE_VERSION}"></script>`,
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

function shouldInjectStartSale(url, response) {
  const contentType = response.headers.get('Content-Type') || '';
  return START_SALE_PATHS.has(url.pathname)
    && response.status === 200
    && contentType.toLowerCase().includes('text/html');
}

function injectStartSale(response, url) {
  const isCheckout = CHECKOUT_PATHS.has(url.pathname);
  return new HTMLRewriter()
    .on('head', new StartSaleHeadHandler())
    .on('body', new StartSaleBodyHandler())
    .on('script[src]', new CheckoutScriptHandler(isCheckout))
    .transform(response);
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
    return shouldInjectStartSale(url, response) ? injectStartSale(response, url) : response;
  },
};
