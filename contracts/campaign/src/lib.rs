#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    Address, Env, String, Vec, panic_with_error,
};

// ---------------------------------------------------------------------------
// Error enum
// ---------------------------------------------------------------------------
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CampaignError {
    NotFound       = 1,
    AlreadyExists  = 2,
    GoalReached    = 3,
    Unauthorized   = 4,
    InvalidInput   = 5,
    Expired        = 6,
    NotFunded      = 7,
}

// ---------------------------------------------------------------------------
// Status enum
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CampaignStatus {
    Active,
    Funded,
    Closed,
    Refunded,
}

// ---------------------------------------------------------------------------
// Campaign struct
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone, Debug)]
pub struct Campaign {
    pub id:              u64,
    pub creator:         Address,
    pub title:           String,
    pub description:     String,
    pub goal_amount:     i128,
    pub current_amount:  i128,
    pub deadline:        u64,
    pub status:          CampaignStatus,
    pub milestone_count: u32,
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Campaign(u64),
    CampaignCount,
    Admin,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------
#[contract]
pub struct CampaignContract;

#[contractimpl]
impl CampaignContract {
    // -----------------------------------------------------------------------
    // Initialize – set admin
    // -----------------------------------------------------------------------
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        let storage = env.storage().persistent();
        if storage.has(&DataKey::Admin) {
            panic_with_error!(&env, CampaignError::AlreadyExists);
        }
        storage.set(&DataKey::Admin, &admin);
        storage.set(&DataKey::CampaignCount, &0_u64);
    }

    // -----------------------------------------------------------------------
    // Create campaign – returns new campaign id
    // -----------------------------------------------------------------------
    pub fn create_campaign(
        env:             Env,
        creator:         Address,
        title:           String,
        description:     String,
        goal_amount:     i128,
        deadline:        u64,
        milestone_count: u32,
    ) -> u64 {
        creator.require_auth();

        if goal_amount <= 0 {
            panic_with_error!(&env, CampaignError::InvalidInput);
        }
        if deadline <= env.ledger().timestamp() {
            panic_with_error!(&env, CampaignError::Expired);
        }

        let storage = env.storage().persistent();
        let id: u64 = storage.get(&DataKey::CampaignCount).unwrap_or(0);
        let new_id = id + 1;

        let campaign = Campaign {
            id:             new_id,
            creator:        creator.clone(),
            title:          title.clone(),
            description:    description.clone(),
            goal_amount,
            current_amount: 0,
            deadline,
            status:         CampaignStatus::Active,
            milestone_count,
        };

        storage.set(&DataKey::Campaign(new_id), &campaign);
        storage.set(&DataKey::CampaignCount, &new_id);

        // Emit event
        env.events().publish(
            (symbol_short!("campaign"), symbol_short!("created")),
            (new_id, creator, goal_amount, deadline),
        );

        new_id
    }

    // -----------------------------------------------------------------------
    // Get a single campaign by id
    // -----------------------------------------------------------------------
    pub fn get_campaign(env: Env, id: u64) -> Campaign {
        let storage = env.storage().persistent();
        storage
            .get(&DataKey::Campaign(id))
            .unwrap_or_else(|| panic_with_error!(&env, CampaignError::NotFound))
    }

    // -----------------------------------------------------------------------
    // List all campaigns
    // -----------------------------------------------------------------------
    pub fn list_campaigns(env: Env) -> Vec<Campaign> {
        let storage = env.storage().persistent();
        let count: u64 = storage.get(&DataKey::CampaignCount).unwrap_or(0);
        let mut campaigns: Vec<Campaign> = Vec::new(&env);
        for i in 1..=count {
            if let Some(c) = storage.get(&DataKey::Campaign(i)) {
                campaigns.push_back(c);
            }
        }
        campaigns
    }

    // -----------------------------------------------------------------------
    // Update current_amount – callable by the admin (escrow contract)
    // -----------------------------------------------------------------------
    pub fn update_amount(env: Env, id: u64, amount: i128) {
        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, CampaignError::Unauthorized));
        admin.require_auth();

        let mut campaign: Campaign = storage
            .get(&DataKey::Campaign(id))
            .unwrap_or_else(|| panic_with_error!(&env, CampaignError::NotFound));

        campaign.current_amount += amount;
        if campaign.current_amount >= campaign.goal_amount {
            campaign.status = CampaignStatus::Funded;
        }
        storage.set(&DataKey::Campaign(id), &campaign);
    }

    // -----------------------------------------------------------------------
    // Close campaign
    // -----------------------------------------------------------------------
    pub fn close_campaign(env: Env, id: u64, caller: Address) {
        caller.require_auth();

        let storage = env.storage().persistent();
        let admin: Address = storage
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, CampaignError::Unauthorized));

        let mut campaign: Campaign = storage
            .get(&DataKey::Campaign(id))
            .unwrap_or_else(|| panic_with_error!(&env, CampaignError::NotFound));

        // Only campaign creator or admin may close
        if caller != campaign.creator && caller != admin {
            panic_with_error!(&env, CampaignError::Unauthorized);
        }

        campaign.status = CampaignStatus::Closed;
        storage.set(&DataKey::Campaign(id), &campaign);

        env.events().publish(
            (symbol_short!("campaign"), symbol_short!("closed")),
            (id, caller),
        );
    }

    // -----------------------------------------------------------------------
    // Get total number of campaigns
    // -----------------------------------------------------------------------
    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    extern crate std;
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, CampaignContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CampaignContract, ());
        let client = CampaignContractClient::new(&env, &contract_id);
        (env, client)
    }

    #[test]
    fn test_initialize() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);
        // second call should panic
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            client.initialize(&admin);
        }));
        assert!(result.is_err());
    }

    #[test]
    fn test_create_campaign() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let description = String::from_str(&env, "A test campaign description");
        let goal: i128 = 1_000_000;
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        let id = client.create_campaign(&creator, &title, &description, &goal, &deadline, &3);
        assert_eq!(id, 1);
        assert_eq!(client.get_campaign_count(), 1);
    }

    #[test]
    fn test_get_campaign() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Get Campaign Test");
        let description = String::from_str(&env, "Description");
        let goal: i128 = 500_000;
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        let id = client.create_campaign(&creator, &title, &description, &goal, &deadline, &2);
        let campaign = client.get_campaign(&id);
        assert_eq!(campaign.id, 1);
        assert_eq!(campaign.goal_amount, 500_000);
        assert_eq!(campaign.current_amount, 0);
        assert_eq!(campaign.milestone_count, 2);
    }

    #[test]
    fn test_create_multiple_campaigns() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        for i in 1_u64..=5 {
            let title = String::from_str(&env, "Campaign");
            let desc = String::from_str(&env, "Desc");
            let id = client.create_campaign(&creator, &title, &desc, &1_000_000, &deadline, &1);
            assert_eq!(id, i);
        }
        assert_eq!(client.get_campaign_count(), 5);
        assert_eq!(client.list_campaigns().len(), 5);
    }

    #[test]
    fn test_close_campaign() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Close Test");
        let desc = String::from_str(&env, "Desc");
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        let id = client.create_campaign(&creator, &title, &desc, &1_000_000, &deadline, &1);
        client.close_campaign(&id, &creator);

        let campaign = client.get_campaign(&id);
        assert_eq!(campaign.status, CampaignStatus::Closed);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_close() {
        let (env, client) = setup();
        let admin = Address::generate(&env);
        client.initialize(&admin);

        let creator = Address::generate(&env);
        let attacker = Address::generate(&env);
        let title = String::from_str(&env, "Unauthorized Close");
        let desc = String::from_str(&env, "Desc");
        let deadline: u64 = env.ledger().timestamp() + 86_400;

        // We turn off mock_all_auths so auth is enforced for attacker
        let id = client.create_campaign(&creator, &title, &desc, &1_000_000, &deadline, &1);
        // attacker tries to close – should panic due to Unauthorized
        client.close_campaign(&id, &attacker);
    }
}
