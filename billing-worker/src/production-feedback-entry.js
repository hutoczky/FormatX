import productionWorker from './production-entry.js';
import { handleFeedbackRequest } from './feedback-api.js';

export default {
  async fetch(request, env, ctx) {
    const feedbackResponse = await handleFeedbackRequest(request, env);
    if (feedbackResponse) return feedbackResponse;
    return productionWorker.fetch(request, env, ctx);
  },
};
