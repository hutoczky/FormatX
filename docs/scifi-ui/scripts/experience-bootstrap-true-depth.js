// Cache-safe bootstrap for the true-depth FormatX organism engines.
// GitHub Pages and mobile browsers may retain nested module URLs longer than
// the stage document. Refresh the engine sources before importing the entry.
(async () => {
  'use strict';

  const sources = [
    './ExperienceWebGPU.js?v=20260729-true-depth-4',
    './webgl-fallback-loader.js?v=20260729-true-depth-fallback-1'
  ];

  await Promise.all(sources.map(async url => {
    try {
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
    } catch (error) {
      console.warn('FormatX engine refresh warning:', error);
    }
  }));

  await import('./experience-entry.js?v=20260729-true-depth-entry-4');
})().catch(error => {
  console.error('FormatX true-depth bootstrap failed:', error);
  try {
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', {
      detail: { message: error instanceof Error ? error.message : String(error) }
    }));
  } catch (_) {}
});