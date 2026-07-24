import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';

const START_SALE_VERSION = '20260724-start-sale-1';
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

export default {
  async fetch(request, env, ctx) {
    const licenseResponse = await handleLicenseCenterRequest(request, env);
    if (licenseResponse) return licenseResponse;

    const response = await productionWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    return shouldInjectStartSale(url, response) ? injectStartSale(response) : response;
  },
};
