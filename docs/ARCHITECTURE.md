# StellarFlow AI — Architecture Deep Dive

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         StellarFlow AI System                            │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Frontend (React + TypeScript + Vite)          │    │
│  │                                                                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │    │
│  │  │ Landing  │  │Dashboard │  │Campaigns │  │Create Campaign│   │    │
│  │  │   Page   │  │   Page   │  │   Page   │  │     Page     │   │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │    │
│  │       └─────────────┴─────────────┴────────────────┘            │    │
│  │                            │                                      │    │
│  │  ┌─────────────────────────▼────────────────────────────────┐   │    │
│  │  │                   State Management                        │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │   │    │
│  │  │  │ walletStore  │  │campaignStore │  │  eventStore   │  │   │    │
│  │  │  │   (Zustand)  │  │  (Zustand)   │  │   (Zustand)   │  │   │    │
│  │  │  └──────────────┘  └──────────────┘  └───────────────┘  │   │    │
│  │  │                       React Query Cache                   │   │    │
│  │  └─────────────────────────┬────────────────────────────────┘   │    │
│  │                            │                                      │    │
│  │  ┌─────────────────────────▼────────────────────────────────┐   │    │
│  │  │                     Service Layer                         │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │   │    │
│  │  │  │ContractService│  │EventStream   │  │  AI Service   │  │   │    │
│  │  │  │(Stellar SDK) │  │Service       │  │  (OpenAI)     │  │   │    │
│  │  │  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │   │    │
│  │  └─────────┼─────────────────┼──────────────────────────────┘   │    │
│  └────────────┼─────────────────┼────────────────────────────────────┘  │
│               │                 │                                          │
│  ┌────────────▼─────────────────▼────────────────────────────────────┐  │
│  │                 StellarWalletsKit + Freighter                       │  │
│  │   Connect / Sign / Authorize transactions                           │  │
│  └──────────────────────────────┬─────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────▼─────────────────────────────────────┐  │
│  │                  Stellar Testnet Infrastructure                      │  │
│  │                                                                       │  │
│  │  ┌─────────────────────┐    ┌───────────────────────────────────┐  │  │
│  │  │   Soroban RPC       │    │         Horizon API               │  │  │
│  │  │ (soroban-testnet.   │    │  (horizon-testnet.stellar.org)    │  │  │
│  │  │  stellar.org)       │    │   Account info, XLM balance       │  │  │
│  │  └──────────┬──────────┘    └───────────────────────────────────┘  │  │
│  │             │                                                         │  │
│  │  ┌──────────▼──────────────────────────────────────────────────┐   │  │
│  │  │              Soroban Smart Contracts (WASM)                   │   │  │
│  │  │                                                               │   │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  calls  ┌─────────────┐  │   │  │
│  │  │  │  Campaign   │─►│   Escrow    │────────►│  Treasury   │  │   │  │
│  │  │  │  Contract   │  │  Contract   │         │  Contract   │  │   │  │
│  │  │  │             │  │             │         │  (2% fee)   │  │   │  │
│  │  │  │ create_     │  │ deposit()   │         └─────────────┘  │   │  │
│  │  │  │ campaign()  │  │ release()   │  calls                   │   │  │
│  │  │  │ get_        │  │ refund()    │────────►┌─────────────┐  │   │  │
│  │  │  │ campaign()  │  └─────────────┘         │  Milestone  │  │   │  │
│  │  │  │ list_       │                          │  Contract   │  │   │  │
│  │  │  │ campaigns() │                          │             │  │   │  │
│  │  │  └─────────────┘                          │ approve_    │  │   │  │
│  │  │                                           │ milestone() │  │   │  │
│  │  │                                           └─────────────┘  │   │  │
│  │  │                                                               │   │  │
│  │  │  Events: CampaignCreated │ DonationReceived │ EscrowLocked   │   │  │
│  │  │          MilestoneReleased │ RefundIssued │ CampaignClosed   │   │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Campaign Creation Flow

```
User fills form → clicks "Deploy Campaign"
       │
       ▼
WalletContext.signTransaction(xdr)
       │
       ▼
Freighter wallet prompts user
       │
       ▼ (approved)
ContractService.createCampaign(params)
       │
       ▼
Campaign Contract: create_campaign()
  - Validates inputs
  - Generates unique ID
  - Stores in persistent map
  - Emits CampaignCreated event
  - Returns campaign ID
       │
       ▼
EventStreamService polls and receives CampaignCreated
       │
       ▼
eventStore.addEvent() → ActivityFeed auto-updates
       │
       ▼
React Query invalidates campaigns query
       │
       ▼
UI shows new campaign in list
```

### Donation & Escrow Flow

```
Donor enters amount → clicks "Back This Campaign"
       │
       ▼
Confirm modal → user confirms
       │
       ▼
ContractService.donate(campaignId, amount)
       │
       ▼ (builds XLM transfer + invoke transaction)
Escrow Contract: deposit()
  - Transfers XLM to escrow contract
  - Creates EscrowRecord in storage
  - Calls Campaign Contract: update_amount()
  - Emits EscrowLocked + DonationReceived
  - Calculates 2% treasury fee
       │
       ▼
Treasury Contract: collect_fee() (called internally)
       │
       ▼
Campaign progress bar updates in real-time
Activity feed shows 2 new events
```

### Milestone Release Flow

```
Creator: submit_milestone(campaignId, index)
       │
       ▼
Milestone Contract:
  - Requires auth from campaign creator
  - Marks milestone as submitted
  - Emits milestone submitted event
       │
       ▼
Admin: approve_milestone(campaignId, index)
       │
       ▼
Milestone Contract:
  - Requires auth from admin
  - Calls Escrow Contract: release(amount)
  - Marks milestone as approved
  - Emits MilestoneReleased
       │
       ▼
Escrow Contract: release()
  - Transfers XLM to campaign creator
  - Updates EscrowRecord.released = true
       │
       ▼
Creator receives XLM in wallet
Activity feed shows MilestoneReleased
```

## Contract Storage Schema

### Campaign Contract Storage

```
Key                          Value
──────────────────────────   ────────────────────────────
DataKey::Admin               Address
DataKey::CampaignCount       u64
DataKey::Campaign(id: u64)   Campaign {
                               id: u64,
                               creator: Address,
                               title: String,
                               description: String,
                               goal_amount: i128,
                               current_amount: i128,
                               deadline: u64,
                               status: CampaignStatus,
                               milestone_count: u32,
                             }
```

### Escrow Contract Storage

```
Key                                        Value
────────────────────────────────────────   ────────────
DataKey::Admin                             Address
DataKey::CampaignContract                  Address
DataKey::Escrow(campaign_id, donor_addr)   EscrowRecord
DataKey::CampaignEscrow(campaign_id)       i128 (total)
```

### Treasury Contract Storage

```
Key                              Value
───────────────────────────────  ─────────
DataKey::Admin                   Address
DataKey::EscrowContract          Address
DataKey::FeeBalance              i128
DataKey::CollectedFee(campaign)  i128
```

### Milestone Contract Storage

```
Key                               Value
────────────────────────────────  ─────────────
DataKey::Admin                    Address
DataKey::EscrowContract           Address
DataKey::CampaignContract         Address
DataKey::Milestone(id, index)     Milestone {
                                    campaign_id: u64,
                                    index: u32,
                                    title: String,
                                    description: String,
                                    target_amount: i128,
                                    released_amount: i128,
                                    approved: bool,
                                    submitted: bool,
                                    submitted_at: u64,
                                  }
```

## Event Schema

All events follow this format:
```rust
env.events().publish(
    (symbol_short!("topic"), symbol_short!("event_name")),
    event_data,
)
```

| Event | Topic | Name | Data |
|-------|-------|------|------|
| Campaign Created | `campaign` | `created` | `(id, creator, title, goal)` |
| Donation Received | `donation` | `received` | `(campaign_id, donor, amount)` |
| Escrow Locked | `escrow` | `locked` | `(campaign_id, donor, amount)` |
| Milestone Released | `milestone` | `released` | `(campaign_id, index, amount)` |
| Refund Issued | `escrow` | `refunded` | `(campaign_id, donor, amount)` |
| Campaign Closed | `campaign` | `closed` | `(id, final_amount)` |

## Security Model

```
Role          │ Permissions
──────────────┼────────────────────────────────────────────
Admin         │ initialize contracts, approve milestones,
              │ withdraw treasury fees, close campaigns
Campaign Owner│ create campaigns, add milestones,
              │ submit milestones
Donor         │ deposit to escrow, claim refund
Anyone        │ read campaigns, read milestones
```

## Error Handling

```
Contract Error           HTTP-like Code   Description
────────────────────────────────────────────────────
NotFound                 404              Campaign/record doesn't exist
Unauthorized             401              Caller lacks required auth
AlreadyExists            409              Duplicate resource
GoalReached              400              Campaign already fully funded
InvalidInput             422              Validation failure
Expired                  410              Deadline has passed
NotFunded                402              Campaign not yet at goal
AlreadyApproved          409              Milestone already approved
InsufficientFunds        402              Not enough XLM
```
