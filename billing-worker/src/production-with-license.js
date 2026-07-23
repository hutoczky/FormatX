import productionWorker from './production-entry.js';
import { handleLicenseCenterRequest } from './license-center.js';

export default {
  async fetch(request, env, ctx) {
    const licenseResponse = await handleLicenseCenterRequest(request, env);
    if (licenseResponse) return licenseResponse;
    return productionWorker.fetch(request, env, ctx);
  },
};
