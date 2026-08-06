import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';
import {
  ensureFeedbackSchemaCompatibility,
  isFeedbackRequestPath,
} from './feedback-schema.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (isFeedbackRequestPath(url.pathname)) {
      await ensureFeedbackSchemaCompatibility(env.LICENSE_DB);
    }

    const feedbackResponse = await handleFeedbackRequest(request, env);
    if (feedbackResponse) return feedbackResponse;
    return productionWorker.fetch(request, env, ctx);
  },
};
