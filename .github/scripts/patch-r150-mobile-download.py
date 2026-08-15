from pathlib import Path

real_path = Path('docs/scifi-ui/scripts/formatx-core-real3d-v20.js')
index_path = Path('docs/scifi-ui/index.html')
mobile_js = Path('docs/scifi-ui/scripts/formatx-mobile-download-r150.js')
mobile_css = Path('docs/scifi-ui/styles/formatx-mobile-download-r150.css')

for required in (real_path, index_path, mobile_js, mobile_css):
    if not required.exists():
        raise SystemExit(f'missing required file: {required}')

real = real_path.read_text(encoding='utf-8')
real = real.replace(
    "const BOOTSTRAP = 'responsive-cinematic-reference-v69-r99-luminous-interactive-r149b';",
    "const BOOTSTRAP = 'responsive-cinematic-reference-v69-r99-luminous-interactive-r150-download';"
)

live_style = "  const LIVE_MOTION_STYLE = '/scifi-ui/styles/formatx-live-motion-r147.css?v=20260815-centered-optics-safe-lane-r149b';\n"
download_style = "  const MOBILE_DOWNLOAD_STYLE = '/scifi-ui/styles/formatx-mobile-download-r150.css?v=20260815-mobile-download-r150';\n"
if 'MOBILE_DOWNLOAD_STYLE' not in real:
    if live_style not in real:
        raise SystemExit('LIVE_MOTION_STYLE anchor missing')
    real = real.replace(live_style, live_style + download_style, 1)

live_script = "  const LIVE_MOTION_SCRIPT = '/scifi-ui/scripts/formatx-core-live-motion-r147.js?v=20260815-centered-optics-safe-lane-r149b';\n"
download_script = "  const MOBILE_DOWNLOAD_SCRIPT = '/scifi-ui/scripts/formatx-mobile-download-r150.js?v=20260815-mobile-download-r150';\n"
if 'MOBILE_DOWNLOAD_SCRIPT' not in real:
    if live_script not in real:
        raise SystemExit('LIVE_MOTION_SCRIPT anchor missing')
    real = real.replace(live_script, live_script + download_script, 1)

function_anchor = "  function addLiveMotion(){"
download_function = """  function addMobileDownload(){addStyle(MOBILE_DOWNLOAD_STYLE,'data-fx-mobile-download-r150-style','fxMobileDownloadStyleR150');if(document.querySelector('script[data-fx-mobile-download-r150], script[src*=\"formatx-mobile-download-r150.js\"]'))return;const s=document.createElement('script');s.src=MOBILE_DOWNLOAD_SCRIPT;s.async=false;s.dataset.fxMobileDownloadR150='true';s.addEventListener('load',()=>{root.dataset.fxMobileDownloadLoadR150='ready';},{once:true});s.addEventListener('error',()=>{root.dataset.fxMobileDownloadLoadR150='failed';},{once:true});document.head.appendChild(s);}\n"""
if 'function addMobileDownload()' not in real:
    if function_anchor not in real:
        raise SystemExit('addLiveMotion anchor missing')
    real = real.replace(function_anchor, download_function + function_anchor, 1)

final_call = "  addMobileStyle();addReferenceLayout();addMobileScript();addInteractionScript();addLiveMotion();setTimeout(()=>{addExactStyle();addDetailScript();addFlowGuard();addReferenceCopy();addFinalizer();addGyro();addLiveMotion();},0);"
final_call_r150 = "  addMobileStyle();addMobileDownload();addReferenceLayout();addMobileScript();addInteractionScript();addLiveMotion();setTimeout(()=>{addExactStyle();addMobileDownload();addDetailScript();addFlowGuard();addReferenceCopy();addFinalizer();addGyro();addLiveMotion();},0);"
if final_call in real:
    real = real.replace(final_call, final_call_r150, 1)
elif final_call_r150 not in real:
    raise SystemExit('bootstrap final call anchor missing')

real_path.write_text(real, encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
old_rev = 'rev=20260815-centered-optics-safe-lane-r149b'
new_rev = 'rev=20260815-r150-mobile-download-restored'
if old_rev in index:
    index = index.replace(old_rev, new_rev, 1)
elif new_rev not in index:
    raise SystemExit('index real3d revision anchor missing')
index_path.write_text(index, encoding='utf-8')

checks = {
    'real3d': (real, [
        'MOBILE_DOWNLOAD_STYLE',
        'MOBILE_DOWNLOAD_SCRIPT',
        'function addMobileDownload()',
        'luminous-interactive-r150-download',
        'addMobileDownload();addReferenceLayout()'
    ]),
    'index': (index, [new_rev]),
    'mobile-js': (mobile_js.read_text(encoding='utf-8'), ['r150-mobile-download-restored', 'before-proof', 'mobile-hero-download-r150']),
    'mobile-css': (mobile_css.read_text(encoding='utf-8'), ['fx-mobile-download-r150', 'fx-r150-download-scan'])
}
for name, (text, needles) in checks.items():
    missing = [needle for needle in needles if needle not in text]
    if missing:
        raise SystemExit(f'{name} missing: {missing}')

print('r150 mobile download patch ready')
