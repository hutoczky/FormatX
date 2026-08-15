from pathlib import Path
import re

bootstrap_path = Path('docs/scifi-ui/scripts/formatx-core-real3d-v20.js')
index_path = Path('docs/scifi-ui/index.html')

bootstrap = bootstrap_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

old_boot = "responsive-cinematic-reference-v69-r99-luminous-interactive-r150-download"
new_boot = "responsive-cinematic-reference-v69-r99-luminous-interactive-r151-hero-stability"
if old_boot not in bootstrap:
    raise SystemExit('r150 BOOTSTRAP marker not found')
bootstrap = bootstrap.replace(old_boot, new_boot, 1)

old_style = "const MOBILE_DOWNLOAD_STYLE = '/scifi-ui/styles/formatx-mobile-download-r150.css?v=20260815-mobile-download-r150';"
new_style = "const MOBILE_HERO_STABILITY_STYLE = '/scifi-ui/styles/formatx-mobile-hero-stability-r151.css?v=20260815-r151-mobile-hero-stability';"
if old_style not in bootstrap:
    raise SystemExit('r150 download style constant not found')
bootstrap = bootstrap.replace(old_style, new_style, 1)

old_script = "const MOBILE_DOWNLOAD_SCRIPT = '/scifi-ui/scripts/formatx-mobile-download-r150.js?v=20260815-mobile-download-r150';"
new_script = "const MOBILE_HERO_STABILITY_SCRIPT = '/scifi-ui/scripts/formatx-mobile-hero-stability-r151.js?v=20260815-r151-mobile-hero-stability';"
if old_script not in bootstrap:
    raise SystemExit('r150 download script constant not found')
bootstrap = bootstrap.replace(old_script, new_script, 1)

pattern = re.compile(r"  function addMobileDownload\(\)\{.*?\}\n  function addLiveMotion\(\)", re.S)
replacement = """  function addMobileHeroStability(){addStyle(MOBILE_HERO_STABILITY_STYLE,'data-fx-mobile-hero-stability-r151-style','fxMobileHeroStabilityStyleR151');if(document.querySelector('script[data-fx-mobile-hero-stability-r151], script[src*=\"formatx-mobile-hero-stability-r151.js\"]'))return;const s=document.createElement('script');s.src=MOBILE_HERO_STABILITY_SCRIPT;s.async=false;s.dataset.fxMobileHeroStabilityR151='true';s.addEventListener('load',()=>{root.dataset.fxMobileHeroStabilityLoadR151='ready';},{once:true});s.addEventListener('error',()=>{root.dataset.fxMobileHeroStabilityLoadR151='failed';},{once:true});document.head.appendChild(s);}\n  function addLiveMotion()"""
bootstrap, count = pattern.subn(replacement, bootstrap, count=1)
if count != 1:
    raise SystemExit(f'expected one addMobileDownload function, got {count}')

bootstrap = bootstrap.replace('addMobileDownload()', 'addMobileHeroStability()')
if 'addMobileDownload' in bootstrap or 'MOBILE_DOWNLOAD_' in bootstrap:
    raise SystemExit('legacy r150 download loader remains in bootstrap')

old_rev = 'rev=20260815-r150-mobile-download-restored'
new_rev = 'rev=20260815-r151-mobile-hero-stability'
if old_rev not in index:
    raise SystemExit('r150 index cache revision not found')
index = index.replace(old_rev, new_rev, 1)

bootstrap_path.write_text(bootstrap, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')

print('r151 patch applied')
print('bootstrap:', new_boot)
print('index:', new_rev)
