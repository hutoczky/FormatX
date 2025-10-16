# Windows App Certification Kit (WACK) - Local Precheck

1) Build a Release MSIX/Bundle with publish-and-package:
   powershell -ExecutionPolicy Bypass -File .\scripts\publish-and-package.ps1 -Rid win-x64 -Configuration Release -OutDir .\artifacts -Sign:$false

2) Launch Windows App Certification Kit:
   - Open Windows SDK Tools ? Windows App Certification Kit
   - Run tests on the generated MSIX/Bundle (path: .\\artifacts\\bundle)

3) Save results to .\\artifacts\\wack\\latest.xml (or .html) and then run:
   powershell -ExecutionPolicy Bypass -File .\scripts\wack\summarize-wack.ps1 -InputPath .\artifacts\wack\latest.xml -OutPath .\artifacts\wack-summary.txt
