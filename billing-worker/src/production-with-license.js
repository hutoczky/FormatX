import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';
import { handleV100PricingRequest } from './pricing-v100-api.js';

const LICENSE_PERMISSIONS_POLICY = [
  'camera=()',
  'geolocation=()',
  'microphone=()',
  'payment=()',
  'publickey-credentials-get=()',
  'usb=()',
].join(', ');

const CANONICAL_PAGE_REDIRECTS = new Map([
  ['/', '/scifi-ui/'],
  ['/index.html', '/scifi-ui/'],
  ['/scifi-ui', '/scifi-ui/'],
  ['/checkout.html', '/scifi-ui/checkout.html'],
]);

function secureResponse(response) {
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

function canonicalPageRedirect(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  const targetPath = CANONICAL_PAGE_REDIRECTS.get(url.pathname);
  if (!targetPath) return null;

  const target = new URL(targetPath, url.origin);
  target.search = url.search;
  return Response.redirect(target.toString(), 308);
}

export default {
  async fetch(request, env, ctx) {
    const licenseResponse = await handleLicenseCenterRequest(request, env);
    if (licenseResponse) return secureResponse(licenseResponse);

    const pricingResponse = await handleV100PricingRequest(request, env);
    if (pricingResponse) return secureResponse(pricingResponse);

    const url = new URL(request.url);
    const redirect = canonicalPageRedirect(request, url);
    if (redirect) return secureResponse(redirect);

    const response = await productionWorker.fetch(request, env, ctx);
    return secureResponse(response);
  },
};
