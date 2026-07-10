#!/usr/bin/env bash
# =============================================================
# StellarFlow AI — Soroban Contract Deployment Script
# Deploy all 4 contracts to Stellar Testnet
# =============================================================

set -e

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_title()   { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}\n"; }

# ── Config ────────────────────────────────────────────────────
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
HORIZON_URL="https://horizon-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
DEPLOY_KEY="${SOROBAN_ACCOUNT:-deployer}"
OUTPUT_FILE=".env.contracts"

# ── Preflight checks ──────────────────────────────────────────
log_title "StellarFlow AI — Deployment Script"

# Check Rust
if ! command -v cargo &> /dev/null; then
  log_error "Rust/Cargo not found. Install from https://rustup.rs"
fi
log_success "Rust: $(rustc --version)"

# Check wasm32 target
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
  log_warn "Adding wasm32-unknown-unknown target..."
  rustup target add wasm32-unknown-unknown
fi

# Check Soroban CLI
if ! command -v soroban &> /dev/null; then
  log_warn "Soroban CLI not found. Installing..."
  cargo install --locked soroban-cli --features opt
fi
log_success "Soroban CLI: $(soroban --version)"

# ── Configure network ─────────────────────────────────────────
log_title "Configuring Stellar Testnet"

soroban network add \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  "$NETWORK" 2>/dev/null || true
log_success "Network configured: $NETWORK"

# ── Configure identity ────────────────────────────────────────
log_title "Setting Up Deployer Identity"

if ! soroban keys ls | grep -q "$DEPLOY_KEY"; then
  log_info "Generating new deployer keypair..."
  soroban keys generate "$DEPLOY_KEY" --network "$NETWORK"
  DEPLOYER_ADDRESS=$(soroban keys address "$DEPLOY_KEY")
  log_success "Keypair generated: $DEPLOYER_ADDRESS"

  log_info "Funding from Friendbot..."
  curl -s "https://friendbot.stellar.org?addr=$DEPLOYER_ADDRESS" > /dev/null
  sleep 2
  log_success "Account funded via Friendbot"
else
  DEPLOYER_ADDRESS=$(soroban keys address "$DEPLOY_KEY")
  log_success "Using existing identity: $DEPLOYER_ADDRESS"
fi

# ── Build contracts ───────────────────────────────────────────
log_title "Building Soroban Contracts"

log_info "Building campaign contract..."
soroban contract build --package campaign
log_success "campaign.wasm built"

log_info "Building escrow contract..."
soroban contract build --package escrow
log_success "escrow.wasm built"

log_info "Building treasury contract..."
soroban contract build --package treasury
log_success "treasury.wasm built"

log_info "Building milestone contract..."
soroban contract build --package milestone
log_success "milestone.wasm built"

# ── Optimize ──────────────────────────────────────────────────
log_title "Optimizing WASM Files"

for wasm in target/wasm32-unknown-unknown/release/*.wasm; do
  log_info "Optimizing $wasm..."
  soroban contract optimize --wasm "$wasm" || true
done
log_success "Optimization complete"

# ── Deploy campaign contract ──────────────────────────────────
log_title "Deploying Campaign Contract"

CAMPAIGN_CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/campaign.wasm \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK")
log_success "Campaign Contract: $CAMPAIGN_CONTRACT_ID"

# Initialize
soroban contract invoke \
  --id "$CAMPAIGN_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_ADDRESS"
log_success "Campaign contract initialized"

# ── Deploy escrow contract ────────────────────────────────────
log_title "Deploying Escrow Contract"

ESCROW_CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK")
log_success "Escrow Contract: $ESCROW_CONTRACT_ID"

soroban contract invoke \
  --id "$ESCROW_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_ADDRESS" \
  --campaign-contract "$CAMPAIGN_CONTRACT_ID"
log_success "Escrow contract initialized"

# ── Deploy treasury contract ──────────────────────────────────
log_title "Deploying Treasury Contract"

TREASURY_CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/treasury.wasm \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK")
log_success "Treasury Contract: $TREASURY_CONTRACT_ID"

soroban contract invoke \
  --id "$TREASURY_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_ADDRESS" \
  --escrow-contract "$ESCROW_CONTRACT_ID"
log_success "Treasury contract initialized"

# ── Deploy milestone contract ─────────────────────────────────
log_title "Deploying Milestone Contract"

MILESTONE_CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/milestone.wasm \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK")
log_success "Milestone Contract: $MILESTONE_CONTRACT_ID"

soroban contract invoke \
  --id "$MILESTONE_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$DEPLOYER_ADDRESS" \
  --escrow-contract "$ESCROW_CONTRACT_ID" \
  --campaign-contract "$CAMPAIGN_CONTRACT_ID"
log_success "Milestone contract initialized"

# ── Save addresses ────────────────────────────────────────────
log_title "Saving Contract Addresses"

cat > "$OUTPUT_FILE" << EOF
# StellarFlow AI — Deployed Contract Addresses
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Network: $NETWORK
# Deployer: $DEPLOYER_ADDRESS

VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_HORIZON_URL=$HORIZON_URL
VITE_STELLAR_RPC_URL=$RPC_URL
VITE_STELLAR_PASSPHRASE=$NETWORK_PASSPHRASE

VITE_CAMPAIGN_CONTRACT_ID=$CAMPAIGN_CONTRACT_ID
VITE_ESCROW_CONTRACT_ID=$ESCROW_CONTRACT_ID
VITE_TREASURY_CONTRACT_ID=$TREASURY_CONTRACT_ID
VITE_MILESTONE_CONTRACT_ID=$MILESTONE_CONTRACT_ID
EOF

log_success "Addresses saved to: $OUTPUT_FILE"

# ── Summary ───────────────────────────────────────────────────
log_title "Deployment Summary"

echo -e "${BOLD}Network:${NC}    $NETWORK"
echo -e "${BOLD}Deployer:${NC}   $DEPLOYER_ADDRESS"
echo -e "${BOLD}Campaign:${NC}   ${GREEN}$CAMPAIGN_CONTRACT_ID${NC}"
echo -e "${BOLD}Escrow:${NC}     ${GREEN}$ESCROW_CONTRACT_ID${NC}"
echo -e "${BOLD}Treasury:${NC}   ${GREEN}$TREASURY_CONTRACT_ID${NC}"
echo -e "${BOLD}Milestone:${NC}  ${GREEN}$MILESTONE_CONTRACT_ID${NC}"

echo -e "\n${GREEN}${BOLD}✅ All contracts deployed successfully!${NC}"
echo -e "\nNext steps:"
echo -e "  1. Copy ${CYAN}$OUTPUT_FILE${NC} contents to your ${CYAN}frontend/.env${NC}"
echo -e "  2. Run ${CYAN}cd frontend && npm run dev${NC}"
echo -e "  3. Connect Freighter wallet on Testnet"
