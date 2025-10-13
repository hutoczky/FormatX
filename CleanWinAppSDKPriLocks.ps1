\
# Clean locked WinAppSDK PRI caches and obj/bin
$ErrorActionPreference = "SilentlyContinue"

# Kill MakePri.exe if running
Get-Process MakePri -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process WinAppSDKExpandPriContent -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove intermediate PRI expansion folders
Get-ChildItem -Path ".\obj" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "WinAppSDKExpandPriContent" } | ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

# Clear TEMP caches related to Windows App SDK
Get-ChildItem "$env:TEMP" -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "WindowsAppRuntime.*" -or $_.Name -like "WinAppSDK*" } | Remove-Item -Recurse -Force

# Clean bin/obj
Remove-Item -Recurse -Force .\bin, .\obj

Write-Host "Cleanup done. Rebuild the solution."
