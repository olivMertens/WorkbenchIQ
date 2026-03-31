<#
.SYNOPSIS
    GroupaIQ — Full deployment script (ACR build + ACA update)
    Builds Docker images, pushes to ACR, updates Azure Container Apps.

.DESCRIPTION
    Minimal, fast deployment:
    1. Build backend image in ACR (remote build via az acr build)
    2. Build frontend image in ACR (remote build)
    3. Update both ACA container apps with new image tags
    4. Verify health checks
    5. Print deployment URLs

.PARAMETER SkipBackend
    Skip backend image build (use existing latest image)

.PARAMETER SkipFrontend
    Skip frontend image build (use existing latest image)

.PARAMETER Tag
    Override image tag (default: git short SHA)

.EXAMPLE
    .\infra\deploy.ps1                     # Full deploy
    .\infra\deploy.ps1 -SkipFrontend       # Backend only
    .\infra\deploy.ps1 -SkipBackend        # Frontend only
    .\infra\deploy.ps1 -Tag "v1.0"         # Custom tag
#>

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [string]$Tag = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ─────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────
$RG            = "rg-groupaiq-prod"
$ACR           = "acrgroupaiqprod"
$API_APP       = "ca-api-prod"
$FRONTEND_APP  = "ca-frontend-prod"
$TAGS          = @{ SecurityControl = "ignore"; CostControl = "ignore" }

if (-not $Tag) {
    $Tag = (git rev-parse --short HEAD 2>$null)
    if (-not $Tag) { $Tag = "latest" }
}

$ACR_SERVER = "$ACR.azurecr.io"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " GroupaIQ — Azure Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Resource Group : $RG"
Write-Host " ACR            : $ACR_SERVER"
Write-Host " Image Tag      : $Tag"
Write-Host " Backend        : $(if ($SkipBackend) { 'SKIP' } else { 'BUILD' })"
Write-Host " Frontend       : $(if ($SkipFrontend) { 'SKIP' } else { 'BUILD' })"
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────
# Verify Azure login
# ─────────────────────────────────────────────────────────────
Write-Host ">>> Checking Azure login..." -ForegroundColor Yellow
$account = az account show --query "name" -o tsv 2>$null
if (-not $account) {
    Write-Host "Not logged in. Running az login..." -ForegroundColor Red
    az login
}
Write-Host "    Subscription: $account" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────
# Ensure RG tags
# ─────────────────────────────────────────────────────────────
Write-Host ">>> Tagging resource group..." -ForegroundColor Yellow
az group update --name $RG --tags SecurityControl=ignore CostControl=ignore Project=GroupaIQ -o none 2>$null

# ─────────────────────────────────────────────────────────────
# Build backend image
# ─────────────────────────────────────────────────────────────
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host ">>> Building backend: groupaiq-api:$Tag" -ForegroundColor Yellow
    Write-Host "    Context: . (root), Dockerfile: ./Dockerfile"
    
    Push-Location $PSScriptRoot\..
    az acr build `
        --registry $ACR `
        --image "groupaiq-api:${Tag}" `
        --image "groupaiq-api:latest" `
        --file Dockerfile `
        . `
        --no-logs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    FAILED — backend image build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "    Backend image pushed" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# Build frontend image
# ─────────────────────────────────────────────────────────────
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host ">>> Building frontend: groupaiq-frontend:$Tag" -ForegroundColor Yellow
    Write-Host "    Context: frontend/, Dockerfile: frontend/Dockerfile"
    
    # Get API URL for the build arg
    $API_FQDN = az containerapp show -n $API_APP -g $RG --query "properties.configuration.ingress.fqdn" -o tsv 2>$null
    
    Push-Location "$PSScriptRoot\..\frontend"
    az acr build `
        --registry $ACR `
        --image "groupaiq-frontend:${Tag}" `
        --image "groupaiq-frontend:latest" `
        --file Dockerfile `
        --build-arg "API_URL=https://$API_FQDN" `
        . `
        --no-logs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    FAILED — frontend image build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "    Frontend image pushed" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# Update Container Apps
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> Updating Container Apps..." -ForegroundColor Yellow

if (-not $SkipBackend) {
    Write-Host "    Updating $API_APP -> groupaiq-api:$Tag"
    az containerapp update `
        --name $API_APP `
        --resource-group $RG `
        --image "$ACR_SERVER/groupaiq-api:${Tag}" `
        -o none
    Write-Host "    API updated" -ForegroundColor Green
}

if (-not $SkipFrontend) {
    Write-Host "    Updating $FRONTEND_APP -> groupaiq-frontend:$Tag"
    az containerapp update `
        --name $FRONTEND_APP `
        --resource-group $RG `
        --image "$ACR_SERVER/groupaiq-frontend:${Tag}" `
        -o none
    Write-Host "    Frontend updated" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────
# Health checks
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> Running health checks..." -ForegroundColor Yellow

$API_FQDN = az containerapp show -n $API_APP -g $RG --query "properties.configuration.ingress.fqdn" -o tsv
$FE_FQDN  = az containerapp show -n $FRONTEND_APP -g $RG --query "properties.configuration.ingress.fqdn" -o tsv

# API health check
$apiOk = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "https://$API_FQDN" -Method GET -TimeoutSec 10
        if ($resp.status -eq "ok" -and $resp.name -eq "GroupaIQ") {
            Write-Host "    API: OK (GroupaIQ v$($resp.version))" -ForegroundColor Green
            $apiOk = $true
            break
        }
    } catch {
        Write-Host "    API: attempt $i/5 - waiting 10s..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
}
if (-not $apiOk) {
    Write-Host "    API: FAILED after 5 attempts" -ForegroundColor Red
}

# Frontend health check
$feOk = $false
for ($i = 1; $i -le 3; $i++) {
    try {
        $feResp = Invoke-WebRequest -Uri "https://$FE_FQDN" -Method GET -UseBasicParsing -TimeoutSec 15
        if ($feResp.StatusCode -eq 200) {
            Write-Host "    Frontend: OK (HTTP 200)" -ForegroundColor Green
            $feOk = $true
            break
        }
    } catch {
        Write-Host "    Frontend: attempt $i/3 - waiting 15s..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
    }
}
if (-not $feOk) {
    Write-Host "    Frontend: FAILED (may need more cold-start time)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Deployment Complete!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " API      : https://$API_FQDN" -ForegroundColor White
Write-Host " Frontend : https://$FE_FQDN" -ForegroundColor White
Write-Host " Tag      : $Tag" -ForegroundColor White

# List images in ACR
Write-Host ""
Write-Host "ACR Images:" -ForegroundColor Gray
az acr repository show-tags --name $ACR --repository groupaiq-api --orderby time_desc --top 3 -o tsv 2>$null | ForEach-Object { Write-Host "  groupaiq-api:$_" -ForegroundColor Gray }
az acr repository show-tags --name $ACR --repository groupaiq-frontend --orderby time_desc --top 3 -o tsv 2>$null | ForEach-Object { Write-Host "  groupaiq-frontend:$_" -ForegroundColor Gray }

Write-Host "=============================================" -ForegroundColor Cyan
