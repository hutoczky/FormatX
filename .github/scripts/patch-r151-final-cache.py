from pathlib import Path

bootstrap_path = Path('docs/scifi-ui/scripts/formatx-core-real3d-v20.js')
index_path = Path('docs/scifi-ui/index.html')

bootstrap = bootstrap_path.read_text(encoding='utf-8')
index = index_path.read_text(encoding='utf-8')

replacements = [
    (
        "responsive-cinematic-reference-v69-r99-luminous-interactive-r151-hero-stability",
        "responsive-cinematic-reference-v69-r99-luminous-interactive-r151-final"
    ),
    (
        "/scifi-ui/styles/formatx-mobile-hero-stability-r151.css?v=20260815-r151-mobile-hero-stability",
        "/scifi-ui/styles/formatx-mobile-hero-stability-r151.css?v=20260815-r151-final"
    ),
    (
        "/scifi-ui/scripts/formatx-mobile-hero-stability-r151.js?v=20260815-r151-mobile-hero-stability",
        "/scifi-ui/scripts/formatx-mobile-hero-stability-r151.js?v=20260815-r151-final"
    ),
]

for old, new in replacements:
    if old not in bootstrap:
        raise SystemExit(f'bootstrap marker not found: {old}')
    bootstrap = bootstrap.replace(old, new, 1)

old_index = 'rev=20260815-r151-mobile-hero-stability'
new_index = 'rev=20260815-r151-final'
if old_index not in index:
    raise SystemExit('index r151 cache revision not found')
index = index.replace(old_index, new_index, 1)

bootstrap_path.write_text(bootstrap, encoding='utf-8')
index_path.write_text(index, encoding='utf-8')

print('r151 final cache bust applied')
print(new_index)
