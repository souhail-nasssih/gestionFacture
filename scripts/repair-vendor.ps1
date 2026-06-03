# Repare vendor (OneDrive verrouille souvent les fichiers)
# 1. Arrete "composer run dev" (Ctrl+C)
# 2. powershell -ExecutionPolicy Bypass -File .\scripts\repair-vendor.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$externalVendor = "C:\dev-vendor\gestionFacture"
$projectVendor = Join-Path (Get-Location) "vendor"

Write-Host "Arret des processus PHP/Node..." -ForegroundColor Cyan
Get-Process php, node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (Test-Path $projectVendor) {
    $item = Get-Item $projectVendor -Force
    if ($item.LinkType -eq "Junction") {
        cmd /c rmdir "$projectVendor"
    } else {
        Remove-Item -Recurse -Force $projectVendor
    }
}

New-Item -ItemType Directory -Force -Path $externalVendor | Out-Null
composer config --unset vendor-dir 2>$null
composer config vendor-dir $externalVendor.Replace('\', '/')

Write-Host "Installation dans $externalVendor (hors OneDrive)..." -ForegroundColor Cyan
composer install --no-interaction --prefer-dist

composer config --unset vendor-dir

Write-Host "Lien vendor -> $externalVendor ..." -ForegroundColor Cyan
cmd /c mklink /J "$projectVendor" "$externalVendor"

php artisan --version
php -r "require 'vendor/autoload.php'; if (!class_exists('Pusher\Pusher')) { exit(1); } echo 'Pusher OK';"

Write-Host ""
Write-Host "Termine. Relance : composer run dev" -ForegroundColor Green
