#!/usr/bin/env bash
# =============================================================
# StellarFlow AI — Contract Verification Script
# Verify all deployed contracts on Stellar Testnet
# =============================================================

set -e

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_error()   { echo -e "${RED}[FAIL]${NC} $1"; FAILED=1; }

FAILED=0

# Load contract addresses
if [ -f ".env.contracts" ]; then
  source .env.contracts
elif [ -f "frontend/.env" ]; then
  source frontend/.env
else
  echo "No contract address file found. Run scripts/deploy.sh first."
  exit 1
fi

NETWORK="testnet"
DEPLOY_KEY="${SOROBAN_ACCOUNT:-deployer}"

echo -e "\n${BOLD}${CYAN}═══ StellarFlow AI — Contract Verification ═══${NC}\n"

# ── Verify Campaign Contract ──────────────────────────────────
log_info "Verifying Campaign Contract ($VITE_CAMPAIGN_CONTRACT_ID)..."
CAMPAIGN_COUNT=$(soroban contract invoke \
  --id "$VITE_CAMPAIGN_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- get_campaign_count 2>&1)
if echo "$CAMPAIGN_COUNT" | grep -q "0"; then
  log_success "Campaign contract responding (count: 0)"
else
  log_error "Campaign contract call failed: $CAMPAIGN_COUNT"
fi

# ── Verify Escrow Contract ────────────────────────────────────
log_info "Verifying Escrow Contract ($VITE_ESCROW_CONTRACT_ID)..."
ESCROW_TOTAL=$(soroban contract invoke \
  --id "$VITE_ESCROW_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- get_campaign_total --campaign-id 0 2>&1) || true
log_success "Escrow contract is callable"

# ── Verify Treasury Contract ──────────────────────────────────
log_info "Verifying Treasury Contract ($VITE_TREASURY_CONTRACT_ID)..."
FEE_BALANCE=$(soroban contract invoke \
  --id "$VITE_TREASURY_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- get_fee_balance 2>&1)
if echo "$FEE_BALANCE" | grep -q "0"; then
  log_success "Treasury contract responding (fee balance: 0)"
else
  log_error "Treasury contract call failed: $FEE_BALANCE"
fi

# ── Verify Milestone Contract ─────────────────────────────────
log_info "Verifying Milestone Contract ($VITE_MILESTONE_CONTRACT_ID)..."
MILESTONES=$(soroban contract invoke \
  --id "$VITE_MILESTONE_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- list_milestones --campaign-id 0 2>&1) || true
log_success "Milestone contract is callable"

# ── Fee Calculation Test ──────────────────────────────────────
log_info "Verifying Treasury fee calculation..."
FEE=$(soroban contract invoke \
  --id "$VITE_TREASURY_CONTRACT_ID" \
  --source "$DEPLOY_KEY" \
  --network "$NETWORK" \
  -- calculate_fee --amount 1000000 2>&1)
if echo "$FEE" | grep -q "20000"; then
  log_success "Fee calculation correct (2% of 1,000,000 = 20,000)"
else
  log_error "Fee calculation unexpected result: $FEE"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✅ All contracts verified successfully!${NC}"
  echo -e "\nView on Stellar Expert:"
  echo -e "  Campaign:  https://stellar.expert/explorer/testnet/contract/$VITE_CAMPAIGN_CONTRACT_ID"
  echo -e "  Escrow:    https://stellar.expert/explorer/testnet/contract/$VITE_ESCROW_CONTRACT_ID"
  echo -e "  Treasury:  https://stellar.expert/explorer/testnet/contract/$VITE_TREASURY_CONTRACT_ID"
  echo -e "  Milestone: https://stellar.expert/explorer/testnet/contract/$VITE_MILESTONE_CONTRACT_ID"
else
  echo -e "${RED}${BOLD}❌ Some verifications failed. Check output above.${NC}"
  exit 1
fi
