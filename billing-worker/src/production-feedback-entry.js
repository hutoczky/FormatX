import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';
import {
  ensureFeedbackSchemaCompatibility,
  isFeedbackRequestPath,
} from './feedback-schema.js';

function schemaFailure(request, error) {
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
    if (isFeedbackRequestPath(url.pathname)) {
      try {
        await ensureFeedbackSchemaCompatibility(env.LICENSE_DB);
      } catch (error) {
        return schemaFailure(request, error);
      }
    }

    const feedbackResponse = await handleFeedbackRequest(request, env);
    if (feedbackResponse) return feedbackResponse;
    return productionWorker.fetch(request, env, ctx);
  },
};
