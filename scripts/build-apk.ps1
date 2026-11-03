# Reconstrói o APK Android (TWA) a partir do projecto versionado em android/.
# Requisitos: @bubblewrap/cli (npm i -g @bubblewrap/cli), Android SDK, JDK 17.
param(
  [string]$BuildDir = "$PSScriptRoot\..\android"
)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$env:BUBBLEWRAP_KEYSTORE_PASSWORD = "cts-consultoria-2026"
$env:BUBBLEWRAP_KEY_PASSWORD = "cts-consultoria-2026"

Push-Location (Join-Path $BuildDir ".")
try {
  bubblewrap build
  $unsigned = "app\build\outputs\apk\release\app-release-unsigned.apk"
  if (-not (Test-Path $unsigned)) { throw "APK nao gerado" }

  $sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
  $apksigner = Get-ChildItem "$sdk\build-tools\*\apksigner.bat" | Sort-Object Name -Descending | Select-Object -First 1
  $out = Join-Path $root "android\cts-consultoria.apk"
  & $apksigner.FullName sign --ks (Join-Path $root "android\cts-consultoria.keystore") --ks-pass pass:$env:BUBBLEWRAP_KEYSTORE_PASSWORD --key-pass pass:$env:BUBBLEWRAP_KEY_PASSWORD --out $out $unsigned
  & $apksigner.FullName verify --print-certs $out
  Write-Host "APK pronto: android\cts-consultoria.apk" -ForegroundColor Green
}
finally { Pop-Location }
