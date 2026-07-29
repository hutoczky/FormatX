// Ordered cache refresh for the true-depth FormatX organism engines.
// This module completes before the following direct experience-entry module
// executes, while keeping the entry visible to production diagnostics.
const sources = [
  new URL('./ExperienceWebGPU.js?v=20260729-true-depth-4', import.meta.url).href,
  new URL('./webgl-fallback-loader.js?v=20260729-true-depth-fallback-1', import.meta.url).href
];

await Promise.all(sources.map(async url => {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
  } catch (error) {
    console.warn('FormatX engine refresh warning:', error);
  }
}));

try {
  parent.document.documentElement.dataset.fxTrueDepthPreload = 'ready';
} catch (_) {}