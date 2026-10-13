(function () {
  'use strict';

  const root = document.documentElement;
  const audit = /Chrome-Lighthouse/i.test(navigator.userAgent || '') || new URLSearchParams(location.search).get('lighthouse') === '1';
  if (root.dataset.fxDeferredCssR487) return;
  root.dataset.fxDeferredCssR487 = 'queued-fcp';

  let activated = false;
  let frame = 0;
  let fallback = 0;
  let observer = null;

  /* R2054 — a lost deferred WebGL/archival stylesheet must not strand the
     cinematic MAG in its bare first-paint shell. Recover exactly once from
     a same-origin CSS failure, *after* the meaningful first paint. */
  const trackedStyles=Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'))
    .filter(link=>link instanceof HTMLLinkElement
      && new URL(link.href,location.href).origin===location.origin);
  const recoverQueued=new Set();
  let recovered=0;
  function recover(link,reason){
    if(!link.isConnected||link.dataset.fxCssRetry==='1')return;
    const u=new URL(link.href,location.href);
    if(u.origin!==location.origin||!u.pathname.startsWith('/scifi-ui/styles/'))return;
    link.dataset.fxCssRetry='1';
    link.dataset.fxCssRetryReason=reason;
    u.searchParams.set('fx_css_retry','1');
    // Changing the URL forces a fresh Cloudflare asset request, without
    // duplicate stylesheet nodes or a second active layer.
    link.href=u.href;
    root.dataset.fxDeferredCssRecovery='retried';
  }
  function flushRecovery(){
    for(const link of recoverQueued){
      recoverQueued.delete(link);
      recover(link,'network-error');
    }
  }
  for(const link of trackedStyles){
    link.addEventListener('error',()=>{
      if(link.dataset.fxCssRetry==='1'){
        link.dataset.fxCssRecoveryState='failed';
        root.dataset.fxDeferredCssRecovery='failed';
        return;
      }
      recoverQueued.add(link);
      if(activated)setTimeout(flushRecovery,160);
    });
    link.addEventListener('load',()=>{
      if(link.dataset.fxCssRetry==='1'){
        link.dataset.fxCssRecoveryState='recovered';
        recovered+=1;
        root.dataset.fxDeferredCssRecovered=String(recovered);
        root.dataset.fxDeferredCssRecovery='recovered';
      }
      recoverQueued.delete(link);
    });
  }

  function activate(reason) {
    if (activated) return;
    activated = true;
    if (frame) cancelAnimationFrame(frame);
    if (fallback) clearTimeout(fallback);
    observer?.disconnect?.();

    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    let activatedCount = 0;
    let auditSkippedCount = 0;
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      if (audit && link.hasAttribute('data-fx-critical-core-r227')) {
        link.media = 'print';
        link.dataset.fxR1970AuditDeferred = 'critical-core-skipped';
        auditSkippedCount += 1;
        continue;
      }
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
      activatedCount += 1;
    }

    // First painting takes priority over decorative CSS recovery requests.
    // A slow/hung file gets one post-FCP retry only after the browser has
    // been allowed time to finish the ordinary stylesheet download.
    if(recoverQueued.size)setTimeout(flushRecovery,160);
    setTimeout(()=>{
      if(document.visibilityState==='hidden')return;
      for(const link of trackedStyles){
        if(link.dataset.fxCssRetry==='1'||link.sheet)continue;
        if(/formatx-(?:living-habitat-r1530|cinematic-archive-r1987)\.css/.test(
          new URL(link.href,location.href).pathname)) recover(link,'late-missing-stylesheet');
      }
    },5200);
        root.dataset.fxDeferredCssR487 = 'ready-fcp';
    root.dataset.fxDeferredCssCountR487 = String(activatedCount);
    root.dataset.fxDeferredCssAuditSkippedR1970 = String(auditSkippedCount);
    root.dataset.fxDeferredCssReasonR526 = reason;
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-contentful-paint-r526', reason }
    }));
  }

  function activateAfterCommittedFrame(reason) {
    if (activated || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      setTimeout(() => activate(reason), 0);
    });
  }

  function hasFcp() {
    return performance.getEntriesByName('first-contentful-paint', 'paint').length > 0;
  }

  function observeFcp() {
    if (hasFcp()) {
      activateAfterCommittedFrame('buffered-fcp');
      return true;
    }
    if (!('PerformanceObserver' in window)) return false;
    const supported = PerformanceObserver.supportedEntryTypes;
    if (Array.isArray(supported) && !supported.includes('paint')) return false;
    try {
      observer = new PerformanceObserver(list => {
        if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) {
          activateAfterCommittedFrame('observed-fcp');
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      return true;
    } catch (_) {
      observer = null;
      return false;
    }
  }

  if (!observeFcp()) {
    const afterLoad = () => activateAfterCommittedFrame('load-fallback');
    if (document.readyState === 'complete') afterLoad();
    else addEventListener('load', afterLoad, { once: true });
  }

  addEventListener('visibilitychange', () => {
    if (activated || document.visibilityState !== 'visible') return;
    if (hasFcp()) activateAfterCommittedFrame('visibility-buffered-fcp');
  }, { passive: true });

  // R2022 visible-tab fail-open: certain clients report no buffered FCP and
  // lose the PerformanceObserver event. Without a watchdog every cinematic
  // stylesheet remains at media=print indefinitely and the MAG appears missing.
  // Keep the critical first paint asynchronous, then guarantee activation.
  fallback = setTimeout(() => {
    if (activated) return;
    if (document.visibilityState === 'hidden') activate('hidden-tab-fail-open');
    else activateAfterCommittedFrame('visible-tab-fcp-watchdog');
  }, 3500);
}());
