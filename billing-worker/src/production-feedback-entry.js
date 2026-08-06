import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';
import {
  ensureFeedbackSchemaCompatibility,
  isFeedbackRequestPath,
} from './feedback-schema.js';

const PUBLIC_PAGE_ALIASES = new Map([
  ['/downloads', '/scifi-ui/downloads/'],
  ['/downloads/', '/scifi-ui/downloads/'],
  ['/support', '/scifi-ui/support.html'],
  ['/support.html', '/scifi-ui/support.html'],
  ['/license', '/scifi-ui/license.html'],
  ['/license.html', '/scifi-ui/license.html'],
  ['/privacy', '/scifi-ui/privacy.html'],
  ['/privacy.html', '/scifi-ui/privacy.html'],
  ['/terms', '/scifi-ui/terms.html'],
  ['/terms.html', '/scifi-ui/terms.html'],
  ['/verification', '/scifi-ui/verification.html'],
  ['/verification.html', '/scifi-ui/verification.html'],
  ['/test-matrix', '/scifi-ui/test-matrix.html'],
  ['/test-matrix.html', '/scifi-ui/test-matrix.html'],
  ['/known-issues', '/scifi-ui/known-issues.html'],
  ['/known-issues.html', '/scifi-ui/known-issues.html'],
  ['/security', '/scifi-ui/security.html'],
  ['/security.html', '/scifi-ui/security.html'],
  ['/technical-report', '/scifi-ui/technical-report.html'],
  ['/technical-report.html', '/scifi-ui/technical-report.html'],
  ['/method', '/scifi-ui/method.html'],
  ['/method.html', '/scifi-ui/method.html'],
]);

function publicAliasRedirect(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const targetPath = PUBLIC_PAGE_ALIASES.get(url.pathname);
  if (!targetPath) return null;
  const target = new URL(targetPath, url.origin);
  target.search = url.search;
  return Response.redirect(target.toString(), 308);
}

function schemaFailure(error) {
  const incident = crypto.randomUUID();
  console.error('FormatX feedback schema recovery failed', {
    incident,
    message: error instanceof Error ? error.message : String(error),
  });
  return new Response(JSON.stringify({
    ok: false,
    error: 'feedback_schema_unavailable',
    incident,
    message: 'A visszajelző adatbázis helyreállítása folyamatban van. Töltsd újra az oldalt, majd próbáld újra.',
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const aliasResponse = publicAliasRedirect(request, url);
    if (aliasResponse) return aliasResponse;

    if (isFeedbackRequestPath(url.pathname)) {
      try {
        await ensureFeedbackSchemaCompatibility(env.LICENSE_DB);
      } catch (error) {
        return schemaFailure(error);
      }
    }

    const feedbackResponse = await handleFeedbackRequest(request, env);
    if (feedbackResponse) return feedbackResponse;
    return productionWorker.fetch(request, env, ctx);
  },
};

export const publicPageAliases = PUBLIC_PAGE_ALIASES;
