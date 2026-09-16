import canonicalProduction from './production-content-entry.js';

/* FormatX R854 — R837 evidence-locked Lighthouse probe.
   Preserve the exact R837 canonical production wrapper, DOM order and cascade.
   Start only the already-blocking intro stylesheet earlier from the HTTP Link
   header so its settled hero geometry is available sooner on desktop and mobile. */

const PUBLIC_HOSTS = new Set(['formatxsuite.com', 'www.formatxsuite.com']);
const HOMEPAGE_PATHS = new Set(['/', '/index.html', '/scifi-ui', '/scifi-ui/', '/scifi-ui/index.html']);
const INTRO_P0_PATH = '/scifi-ui/styles/formatx-intro-p0-r575.css';
const INTRO_P0_PRELOAD = '<' + INTRO_P0_PATH + '?v=20260907-r635-three-phase-absolute-reveal>; rel=preload; as=style';

function mergeIntroPreload(existing) {
  const values = String(existing || '')
    .split(/,\s*(?=<)/)
    .map(value => value.trim())
    .filter(Boolean)
    .filter(value => !value.includes(INTRO_P0_PATH));
  return [...values, INTRO_P0_PRELOAD].join(', ');
}

export default {
  async fetch(request, env, ctx) {
    const response = await canonicalProduction.fetch(request, env, ctx);
    const url = new URL(request.url);
    const safeMethod = request.method === 'GET' || request.method === 'HEAD';
    if (!safeMethod || !PUBLIC_HOSTS.has(url.hostname) || !HOMEPAGE_PATHS.has(url.pathname)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Link', mergeIntroPreload(headers.get('Link')));
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
