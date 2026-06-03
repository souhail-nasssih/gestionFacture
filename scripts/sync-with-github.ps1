# Synchronise main local avec GitHub sans perdre tes modifications ni les commits distants.
# Usage : depuis la racine du projet
#   powershell -ExecutionPolicy Bypass -File .\scripts\sync-with-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$backupName = "backup-local-$(Get-Date -Format 'yyyyMMdd-HHmm')"
Write-Host "1/5 Branche de secours : $backupName" -ForegroundColor Cyan
git branch $backupName

Write-Host "2/5 Recuperation des commits GitHub (fetch)..." -ForegroundColor Cyan
git fetch origin

Write-Host "3/5 Etat des branches :" -ForegroundColor Cyan
git status -sb
git log --oneline --left-right -10 HEAD...origin/main

Write-Host "4/5 Fusion : tes commits par-dessus ceux de GitHub (rebase)..." -ForegroundColor Cyan
git pull origin main --rebase

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Conflit detecte. Ouvre les fichiers marques, corrige, puis :" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor Yellow
    Write-Host "  git rebase --continue" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour annuler : git rebase --abort" -ForegroundColor Yellow
    Write-Host "Ta sauvegarde reste sur la branche : $backupName" -ForegroundColor Green
    exit 1
}

Write-Host "5/5 Envoi vers GitHub (push)..." -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "Termine. Branche de secours conservee : $backupName" -ForegroundColor Green
