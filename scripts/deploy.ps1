# StellarFlow AI — PowerShell Deployment Script for Windows
# Deploy all 4 Soroban contracts to Stellar Testnet

param(
    [string]$Network = "testnet",
    [string]$DeployKey = "deployer",
    [string]$RpcUrl = "https://soroban-testnet.stellar.org",
    [string]$HorizonUrl = "https://horizon-testnet.stellar.org",
    [string]$NetworkPassphrase = "Test SDF Network ; September 2015"
)

$ErrorActionPreference = "Stop"

function Write-Info    { param($msg) Write-Host "[INFO] $msg"    -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK]   $msg"    -ForegroundColor Green }
function Write-Warn    { param($msg) Write-Host "[WARN] $msg"    -ForegroundColor Yellow }
function Write-Fail    { param($msg) Write-Host "[ERROR] $msg"   -ForegroundColor Red; exit 1 }
function Write-Title   { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan -BackgroundColor DarkBlue }

Write-Title "StellarFlow AI — Windows Deployment"

# ── Check prerequisites ───────────────────────────────────────
Write-Title "Checking Prerequisites"

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Fail "Rust/Cargo not found. Install from https://rustup.rs"
}
Write-Success "Rust: $(cargo --version)"

if (-not (Get-Command soroban -ErrorAction SilentlyContinue)) {
    Write-Warn "Soroban CLI not found. Installing..."
    cargo install --locked soroban-cli --features opt
}
Write-Success "Soroban CLI: $(soroban --version)"

# ── Configure network ─────────────────────────────────────────
Write-Title "Configuring Testnet"

try {
    soroban network add `
        --rpc-url $RpcUrl `
        --network-passphrase $NetworkPassphrase `
        $Network 2>$null
} catch {}
Write-Success "Network configured: $Network"

# ── Configure identity ────────────────────────────────────────
Write-Title "Setting Up Identity"

$existingKeys = soroban keys ls 2>&1
if ($existingKeys -notmatch $DeployKey) {
    Write-Info "Generating new deployer keypair..."
    soroban keys generate $DeployKey --network $Network
    $DeployerAddress = soroban keys address $DeployKey
    Write-Success "Keypair generated: $DeployerAddress"

    Write-Info "Funding from Friendbot..."
    Invoke-RestMethod -Uri "https://friendbot.stellar.org?addr=$DeployerAddress" | Out-Null
    Start-Sleep -Seconds 3
    Write-Success "Account funded"
} else {
    $DeployerAddress = soroban keys address $DeployKey
    Write-Success "Using existing identity: $DeployerAddress"
}

# ── Build contracts ───────────────────────────────────────────
Write-Title "Building Contracts"

Write-Info "Building campaign..."
soroban contract build --package campaign
Write-Success "campaign.wasm built"

Write-Info "Building escrow..."
soroban contract build --package escrow
Write-Success "escrow.wasm built"

Write-Info "Building treasury..."
soroban contract build --package treasury
Write-Success "treasury.wasm built"

Write-Info "Building milestone..."
soroban contract build --package milestone
Write-Success "milestone.wasm built"

# ── Deploy ───────────────────────────────────────────────────
Write-Title "Deploying Campaign Contract"
$CampaignId = soroban contract deploy `
    --wasm "target\wasm32-unknown-unknown\release\campaign.wasm" `
    --source $DeployKey `
    --network $Network
Write-Success "Campaign: $CampaignId"

soroban contract invoke `
    --id $CampaignId `
    --source $DeployKey `
    --network $Network `
    -- initialize --admin $DeployerAddress
Write-Success "Campaign initialized"

Write-Title "Deploying Escrow Contract"
$EscrowId = soroban contract deploy `
    --wasm "target\wasm32-unknown-unknown\release\escrow.wasm" `
    --source $DeployKey `
    --network $Network
Write-Success "Escrow: $EscrowId"

soroban contract invoke `
    --id $EscrowId `
    --source $DeployKey `
    --network $Network `
    -- initialize --admin $DeployerAddress --campaign-contract $CampaignId
Write-Success "Escrow initialized"

Write-Title "Deploying Treasury Contract"
$TreasuryId = soroban contract deploy `
    --wasm "target\wasm32-unknown-unknown\release\treasury.wasm" `
    --source $DeployKey `
    --network $Network
Write-Success "Treasury: $TreasuryId"

soroban contract invoke `
    --id $TreasuryId `
    --source $DeployKey `
    --network $Network `
    -- initialize --admin $DeployerAddress --escrow-contract $EscrowId
Write-Success "Treasury initialized"

Write-Title "Deploying Milestone Contract"
$MilestoneId = soroban contract deploy `
    --wasm "target\wasm32-unknown-unknown\release\milestone.wasm" `
    --source $DeployKey `
    --network $Network
Write-Success "Milestone: $MilestoneId"

soroban contract invoke `
    --id $MilestoneId `
    --source $DeployKey `
    --network $Network `
    -- initialize --admin $DeployerAddress --escrow-contract $EscrowId --campaign-contract $CampaignId
Write-Success "Milestone initialized"

# ── Save .env ─────────────────────────────────────────────────
Write-Title "Saving Contract Addresses"

$envContent = @"
# StellarFlow AI - Deployed Contract Addresses
# Generated: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
# Network: $Network

VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_HORIZON_URL=$HorizonUrl
VITE_STELLAR_RPC_URL=$RpcUrl
VITE_STELLAR_PASSPHRASE=$NetworkPassphrase

VITE_CAMPAIGN_CONTRACT_ID=$CampaignId
VITE_ESCROW_CONTRACT_ID=$EscrowId
VITE_TREASURY_CONTRACT_ID=$TreasuryId
VITE_MILESTONE_CONTRACT_ID=$MilestoneId
"@

$envContent | Out-File -FilePath ".env.contracts" -Encoding utf8
Write-Success "Saved to .env.contracts"

# Copy to frontend
$envContent | Out-File -FilePath "frontend\.env" -Encoding utf8
Write-Success "Copied to frontend\.env"

# ── Summary ───────────────────────────────────────────────────
Write-Title "Deployment Summary"
Write-Host "Network:    $Network"       -ForegroundColor White
Write-Host "Deployer:   $DeployerAddress" -ForegroundColor White
Write-Host "Campaign:   $CampaignId"   -ForegroundColor Green
Write-Host "Escrow:     $EscrowId"     -ForegroundColor Green
Write-Host "Treasury:   $TreasuryId"   -ForegroundColor Green
Write-Host "Milestone:  $MilestoneId"  -ForegroundColor Green

Write-Host "`n✅ All contracts deployed! Run: cd frontend; npm run dev" -ForegroundColor Green
