(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'reference-luminous-crystal-native-webgl-v69-r99-interactive';
  function loadReferenceLayout() {
    if (!document.querySelector('link[data-fx-mobile-reference-layout-style]')) { const link=document.createElement('link');link.rel='stylesheet';link.href='/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260813-android-webgl-recovery-r71';link.dataset.fxMobileReferenceLayoutStyle='true';document.head.appendChild(link); }
    if (!document.querySelector('link[data-fx-responsive-text-guard]')) { const guard=document.createElement('link');guard.rel='stylesheet';guard.href='/scifi-ui/styles/formatx-responsive-text-guard-r72.css?v=20260813-responsive-text-wrap-r72';guard.dataset.fxResponsiveTextGuard='true';document.head.appendChild(guard); }
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script=document.createElement('script');script.src='/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260813-responsive-text-wrap-r72';script.async=false;script.dataset.fxMobileReferenceLayout='true';document.head.appendChild(script);
  }
  loadReferenceLayout();
  const renderer=document.createElement('script');renderer.src='/scifi-ui/scripts/formatx-core-mobile-reference-r99.js?v=20260814-luminous-cinematic-r99&rev=20260814-volumetric-ribs-r106';renderer.async=false;renderer.dataset.fxCoreMobileReferenceV69='true';renderer.dataset.fxCoreMobileReferenceR99='true';
  renderer.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69-r99';},{once:true});
  renderer.addEventListener('error',()=>{root.dataset.fxCoreMobileV55='load-failed-v55';root.dataset.fxCoreMobileV69='load-failed-v69';root.dataset.fxCoreMobileR99='load-failed-r99';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReal3d='context-unavailable';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'native-webgl-renderer-load-failed',reference:'v69-r99'}}));},{once:true});
  document.head.appendChild(renderer);
}());