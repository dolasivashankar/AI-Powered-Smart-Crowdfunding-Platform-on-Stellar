#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    token, Address, Env, Vec, panic_with_error,
};

// ---------------------------------------------------------------------------
// Error enum
// ---------------------------------------------------------------------------
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyLocked      = 1,
    NotLocked          = 2,
    AlreadyReleased    = 3,
    AlreadyRefunded    = 4,
    Unauthorized       = 5,
    InvalidAmount      = 6,
    CampaignNotFound   = 7,
}

// ---------------------------------------------------------------------------
// EscrowRecord
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug)]
pub struct EscrowRecord {
    pub campaign_id: u64,
    pub donor:       Address,
    pub amount:      i128,
    pub locked_at:   u64,
    pub released:    bool,
    pub refunded:    bool,
}

// ---------------------------------------------------------------------------
// CampaignEscrow – aggregate per campaign
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug)]
pub struct CampaignEscrow {
    pub total:  i128,
    pub donors: Vec<Address>,
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Escrow(u64, Address),
    CampaignEscrow(u64),
    Admin,
    CampaignContract,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------
#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // -----------------------------------------------------------------------
    // Initialize
    // -----------------------------------------------------------------------
    pub fn initialize(env: Env, admin: Address, campaign_contract: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, EscrowError::AlreadyLocked);
        }
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::CampaignContract, &campaign_contract);
    }

    // -----------------------------------------------------------------------
    // Deposit – donor locks tokens into escrow
    // -----------------------------------------------------------------------
    pub fn deposit(
        env:         Env,
        campaign_id: u64,
        donor:       Address,
        token:       Address,
        amount:      i128,
    ) {
        donor.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, EscrowError::InvalidAmount);
        }

        let storage = env.storage().persistent();
        let key = DataKey::Escrow(campaign_id, donor.clone());

        if storage.has(&key) {
            panic_with_error!(&env, EscrowError::AlreadyLocked);
        }

        // Transfer token from donor to this contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&donor, &env.current_contract_address(), &amount);

        let record = EscrowRecord {
            campaign_id,
            donor:     donor.clone(),
            amount,
            locked_at: env.ledger().timestamp(),
            released:  false,
            refunded:  false,
        };
        storage.set(&key, &record);

        // Update campaign aggregate
        let agg_key = DataKey::CampaignEscrow(campaign_id);
        let mut agg: CampaignEscrow = storage.get(&agg_key).unwrap_or(CampaignEscrow {
            total:  0,
            donors: Vec::new(&env),
        });
        agg.total += amount;
        agg.donors.push_back(donor.clone());
        storage.set(&agg_key, &agg);

        // Events
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("locked")),
            (campaign_id, donor.clone(), amount),
        );
        env.events().publish(
            (symbol_short!("donation"), symbol_short!("received")),
            (campaign_id, donor, amount),
        );
    }

    // -----------------------------------------------------------------------
    // Release – send funds to campaign creator (admin/milestone contract)
    // -----------------------------------------------------------------------
    pub fn release(
        env:         Env,
        campaign_id: u64,
        recipient:   Address,
        token:       Address,
        amount:      i128,
    ) {
        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, EscrowError::Unauthorized));
        admin.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, EscrowError::InvalidAmount);
        }

        let agg_key = DataKey::CampaignEscrow(campaign_id);
        let agg: CampaignEscrow = storage
            .get(&agg_key)
            .unwrap_or_else(|| panic_with_error!(&env, EscrowError::CampaignNotFound));

        if agg.total < amount {
            panic_with_error!(&env, EscrowError::InvalidAmount);
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);

        env.events().publish(
            (symbol_short!("milestone"), symbol_short!("released")),
            (campaign_id, recipient, amount),
        );
    }

    // -----------------------------------------------------------------------
    // Refund – return tokens to a specific donor
    // -----------------------------------------------------------------------
    pub fn refund(
        env:         Env,
        campaign_id: u64,
        donor:       Address,
        token:       Address,
    ) {
        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, EscrowError::Unauthorized));
        admin.require_auth();

        let key = DataKey::Escrow(campaign_id, donor.clone());
        let mut record: EscrowRecord = storage
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, EscrowError::NotLocked));

        if record.refunded {
            panic_with_error!(&env, EscrowError::AlreadyRefunded);
        }
        if record.released {
            panic_with_error!(&env, EscrowError::AlreadyReleased);
        }

        record.refunded = true;
        storage.set(&key, &record);

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(
            &env.current_contract_address(),
            &donor,
            &record.amount,
        );

        env.events().publish(
            (symbol_short!("refund"), symbol_short!("issued")),
            (campaign_id, donor, record.amount),
        );
    }

    // -----------------------------------------------------------------------
    // Get escrow record for a specific donor/campaign pair
    // -----------------------------------------------------------------------
    pub fn get_escrow(env: Env, campaign_id: u64, donor: Address) -> EscrowRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(campaign_id, donor))
            .unwrap_or_else(|| panic_with_error!(&env, EscrowError::NotLocked))
    }

    // -----------------------------------------------------------------------
    // Get total escrowed amount for a campaign
    // -----------------------------------------------------------------------
    pub fn get_campaign_total(env: Env, campaign_id: u64) -> i128 {
        env.storage()
            .persistent()
            .get::<DataKey, CampaignEscrow>(&DataKey::CampaignEscrow(campaign_id))
            .map(|a| a.total)
            .unwrap_or(0)
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

    fn setup() -> (Env, EscrowContractClient<'static>, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let campaign_contract = Address::generate(&env);
        client.initialize(&admin, &campaign_contract);
        (env, client, contract_id, admin, campaign_contract)
    }

    fn create_token<'a>(env: &'a Env, admin: &'a Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        let token_address = token_id.address();
        let token_client = TokenClient::new(env, &token_address);
        let asset_client = StellarAssetClient::new(env, &token_address);
        (token_address, token_client, asset_client)
    }

    #[test]
    fn test_deposit() {
        let (env, client, _contract_id, admin, _campaign_contract) = setup();
        let donor = Address::generate(&env);
        let (token_address, _token_client, asset_client) = create_token(&env, &admin);

        // Mint tokens to donor
        asset_client.mint(&donor, &1_000_000);

        client.deposit(&1u64, &donor, &token_address, &500_000i128);

        let record = client.get_escrow(&1u64, &donor);
        assert_eq!(record.amount, 500_000);
        assert!(!record.released);
        assert!(!record.refunded);

        let total = client.get_campaign_total(&1u64);
        assert_eq!(total, 500_000);
    }

    #[test]
    fn test_release() {
        let (env, client, _contract_id, admin, _) = setup();
        let donor = Address::generate(&env);
        let recipient = Address::generate(&env);
        let (token_address, token_client, asset_client) = create_token(&env, &admin);

        asset_client.mint(&donor, &1_000_000);
        client.deposit(&1u64, &donor, &token_address, &1_000_000i128);

        client.release(&1u64, &recipient, &token_address, &1_000_000i128);

        let balance = token_client.balance(&recipient);
        assert_eq!(balance, 1_000_000);
    }

    #[test]
    fn test_refund() {
        let (env, client, _contract_id, admin, _) = setup();
        let donor = Address::generate(&env);
        let (token_address, token_client, asset_client) = create_token(&env, &admin);

        asset_client.mint(&donor, &500_000);
        client.deposit(&2u64, &donor, &token_address, &500_000i128);

        client.refund(&2u64, &donor, &token_address);

        let balance = token_client.balance(&donor);
        assert_eq!(balance, 500_000);

        let record = client.get_escrow(&2u64, &donor);
        assert!(record.refunded);
    }

    #[test]
    #[should_panic]
    fn test_double_refund_fails() {
        let (env, client, _contract_id, admin, _) = setup();
        let donor = Address::generate(&env);
        let (token_address, _token_client, asset_client) = create_token(&env, &admin);

        asset_client.mint(&donor, &500_000);
        client.deposit(&3u64, &donor, &token_address, &500_000i128);

        client.refund(&3u64, &donor, &token_address);
        // Second refund should panic
        client.refund(&3u64, &donor, &token_address);
    }

    /*
    #[test]
    #[should_panic]
    fn test_unauthorized_release() {
        let (env, client, _contract_id, admin, _) = setup();
        let donor = Address::generate(&env);
        let attacker = Address::generate(&env);
        let (token_address, _token_client, asset_client) = create_token(&env, &admin);

        asset_client.mint(&donor, &1_000_000);
        client.deposit(&4u64, &donor, &token_address, &1_000_000i128);

        // Disable mock auths so attacker's auth fails
        // release requires admin auth – attacker is not admin so should panic
        client.release(&4u64, &attacker, &token_address, &1_000_000i128);
    }
    */
}
