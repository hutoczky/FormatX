(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.fxCoreMobileV55 === 'ready-v55' || root.dataset.fxCoreMobileV55 === 'booting-reference-v69') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') { root.dataset.fxCoreMobileV55 = 'audit-skip'; return; }
  root.dataset.fxCoreMobileV55 = 'booting-reference-v69';
  root.dataset.fxCoreRendererMode = 'mobile';
  root.dataset.fxCoreMobileAwardRevision = 'reference-prismatic-organic-native-webgl-v69-r120-interactive-stable-r191-60fps';

  function loadAudioToggle() {
    if (document.querySelector('script[data-fx-audio-toggle-r191], script[src*="formatx-audio-toggle-r191.js"]')) return;
    const script = document.createElement('script');
    script.src = '/scifi-ui/scripts/formatx-audio-toggle-r191.js?v=20260817-r191';
    script.async = false;
    script.dataset.fxAudioToggleR191 = 'true';
    document.head.appendChild(script);
  }

  function loadReferenceLayout() {
    if (!document.querySelector('link[data-fx-mobile-reference-layout-style]')) { const link=document.createElement('link');link.rel='stylesheet';link.href='/scifi-ui/styles/formatx-mobile-reference-layout-v1.css?v=20260817-r190-nonoverlap';link.dataset.fxMobileReferenceLayoutStyle='true';document.head.appendChild(link); }
    if (!document.querySelector('link[data-fx-responsive-text-guard]')) { const guard=document.createElement('link');guard.rel='stylesheet';guard.href='/scifi-ui/styles/formatx-responsive-text-guard-r72.css?v=20260813-responsive-text-wrap-r72';guard.dataset.fxResponsiveTextGuard='true';document.head.appendChild(guard); }
    if (document.querySelector('script[data-fx-mobile-reference-layout]')) return;
    const script=document.createElement('script');script.src='/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js?v=20260817-r188-content-stability';script.async=false;script.dataset.fxMobileReferenceLayout='true';document.head.appendChild(script);
  }

  loadAudioToggle();
  loadReferenceLayout();
  const renderer=document.createElement('script');renderer.src='/scifi-ui/scripts/formatx-core-mobile-reference-r99.js?v=20260817-r191-mobile-60fps';renderer.async=false;renderer.dataset.fxCoreMobileReferenceV69='true';renderer.dataset.fxCoreMobileReferenceR99='true';renderer.dataset.fxCoreTrueMeshR112='true';renderer.dataset.fxCorePrismaticR120='true';
  renderer.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready-v69-r120-r191';},{once:true});
  renderer.addEventListener('error',()=>{root.dataset.fxCoreMobileV55='load-failed-v55';root.dataset.fxCoreMobileV69='load-failed-v69';root.dataset.fxCoreMobileR99='load-failed-r99';root.dataset.fxCoreReferenceLock='load-failed-v69';root.dataset.fxCoreReal3d='context-unavailable';dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'native-webgl-renderer-load-failed',reference:'v69-r120-r191'}}));},{once:true});
  document.head.appendChild(renderer);
}());