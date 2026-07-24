import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';

const START_SALE_VERSION = '20260724-start-sale-1';
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

class StartSaleHeadHandler {
  element(element) {
    element.append(
      `<link rel="stylesheet" href="/scifi-ui/styles/start-sale.css?v=${START_SALE_VERSION}">`,
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

function shouldInjectStartSale(url, response) {
  const contentType = response.headers.get('Content-Type') || '';
  return START_SALE_PATHS.has(url.pathname)
    && response.status === 200
    && contentType.toLowerCase().includes('text/html');
}

function injectStartSale(response) {
  return new HTMLRewriter()
    .on('head', new StartSaleHeadHandler())
    .on('body', new StartSaleBodyHandler())
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

    const response = await productionWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    return shouldInjectStartSale(url, response) ? injectStartSale(response) : response;
  },
};
