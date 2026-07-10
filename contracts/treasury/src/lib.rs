#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    token, Address, Env, panic_with_error,
};

// ---------------------------------------------------------------------------
// Platform fee: 200 basis points = 2%
// ---------------------------------------------------------------------------
const FEE_BPS: i128 = 200;
const BPS_DENOM: i128 = 10_000;

// ---------------------------------------------------------------------------
// Error enum
// ---------------------------------------------------------------------------
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TreasuryError {
    Unauthorized       = 1,
    InsufficientFunds  = 2,
    InvalidAmount      = 3,
    AlreadyCollected   = 4,
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    FeeBalance,
    CollectedFee(u64),
    EscrowContract,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------
#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    // -----------------------------------------------------------------------
    // Initialize
    // -----------------------------------------------------------------------
    pub fn initialize(env: Env, admin: Address, escrow_contract: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, TreasuryError::AlreadyCollected);
        }
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::EscrowContract, &escrow_contract);
        storage.set(&DataKey::FeeBalance, &0_i128);
    }

    // -----------------------------------------------------------------------
    // Calculate 2% fee (pure, no state mutation)
    // -----------------------------------------------------------------------
    pub fn calculate_fee(amount: i128) -> i128 {
        amount * FEE_BPS / BPS_DENOM
    }

    // -----------------------------------------------------------------------
    // Collect fee for a campaign – callable by admin / escrow contract
    // -----------------------------------------------------------------------
    pub fn collect_fee(env: Env, campaign_id: u64, amount: i128) -> i128 {
        if amount <= 0 {
            panic_with_error!(&env, TreasuryError::InvalidAmount);
        }

        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, TreasuryError::Unauthorized));
        admin.require_auth();

        let fee_key = DataKey::CollectedFee(campaign_id);
        if storage.has(&fee_key) {
            panic_with_error!(&env, TreasuryError::AlreadyCollected);
        }

        let fee = Self::calculate_fee(amount);
        storage.set(&fee_key, &fee);

        let current: i128 = storage.get(&DataKey::FeeBalance).unwrap_or(0);
        storage.set(&DataKey::FeeBalance, &(current + fee));

        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("fee")),
            (campaign_id, fee),
        );

        fee
    }

    // -----------------------------------------------------------------------
    // Get current accumulated fee balance
    // -----------------------------------------------------------------------
    pub fn get_fee_balance(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::FeeBalance)
            .unwrap_or(0)
    }

    // -----------------------------------------------------------------------
    // Admin withdraws all accumulated fees to recipient
    // -----------------------------------------------------------------------
    pub fn withdraw_fees(
        env:       Env,
        caller:    Address,
        token:     Address,
        recipient: Address,
    ) {
        caller.require_auth();

        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, TreasuryError::Unauthorized));

        if caller != admin {
            panic_with_error!(&env, TreasuryError::Unauthorized);
        }

        let balance: i128 = storage.get(&DataKey::FeeBalance).unwrap_or(0);
        if balance <= 0 {
            panic_with_error!(&env, TreasuryError::InsufficientFunds);
        }

        storage.set(&DataKey::FeeBalance, &0_i128);

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &recipient, &balance);

        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("withdraw")),
            (caller, recipient, balance),
        );
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        token::{Client as TokenClient, StellarAssetClient},
        Env,
    };

    fn setup() -> (Env, TreasuryContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(TreasuryContract, ());
        let client = TreasuryContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let escrow = Address::generate(&env);
        client.initialize(&admin, &escrow);
        (env, client, admin)
    }

    fn create_token<'a>(env: &'a Env, admin: &'a Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        let token_address = token_id.address();
        let token_client = TokenClient::new(env, &token_address);
        let asset_client = StellarAssetClient::new(env, &token_address);
        (token_address, token_client, asset_client)
    }

    #[test]
    fn test_fee_calculation() {
        // 2% of 1_000_000 = 20_000
        let fee = TreasuryContract::calculate_fee(1_000_000);
        assert_eq!(fee, 20_000);

        // 2% of 50 = 1
        let fee2 = TreasuryContract::calculate_fee(50);
        assert_eq!(fee2, 1);

        // 2% of 0 = 0
        let fee3 = TreasuryContract::calculate_fee(0);
        assert_eq!(fee3, 0);
    }

    #[test]
    fn test_collect_fee() {
        let (_env, client, _admin) = setup();

        let fee = client.collect_fee(&1u64, &1_000_000i128);
        assert_eq!(fee, 20_000);

        let balance = client.get_fee_balance();
        assert_eq!(balance, 20_000);
    }

    #[test]
    fn test_withdraw_fees() {
        let (env, client, admin) = setup();
        let (token_address, token_client, asset_client) = create_token(&env, &admin);

        // We need to mint tokens to the treasury contract so it can transfer them
        asset_client.mint(&client.address, &20_000);

        client.collect_fee(&10u64, &1_000_000i128);

        let recipient = Address::generate(&env);
        client.withdraw_fees(&admin, &token_address, &recipient);

        let balance = token_client.balance(&recipient);
        assert_eq!(balance, 20_000);

        let fee_balance = client.get_fee_balance();
        assert_eq!(fee_balance, 0);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_withdraw() {
        let (env, client, admin) = setup();
        let (token_address, _token_client, _asset_client) = create_token(&env, &admin);

        client.collect_fee(&20u64, &1_000_000i128);

        let attacker = Address::generate(&env);
        let recipient = Address::generate(&env);
        // attacker != admin → should panic
        client.withdraw_fees(&attacker, &token_address, &recipient);
    }

    #[test]
    #[should_panic]
    fn test_double_collect_fails() {
        let (_env, client, _admin) = setup();
        client.collect_fee(&30u64, &1_000_000i128);
        // Second collect for same campaign should fail
        client.collect_fee(&30u64, &1_000_000i128);
    }
}
