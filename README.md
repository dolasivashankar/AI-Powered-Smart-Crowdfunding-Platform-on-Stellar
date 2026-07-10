<div align="center">
  <h1>🌟 StellarFlow AI</h1>
  <p><strong>AI-Powered Smart Crowdfunding & Escrow Platform on Stellar</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Stellar-Testnet-7B68EE?style=for-the-badge&logo=stellar" alt="Stellar Testnet">
    <img src="https://img.shields.io/badge/Soroban-Smart%20Contracts-FF6B35?style=for-the-badge" alt="Soroban">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Rust-1.80-CE422B?style=for-the-badge&logo=rust" alt="Rust">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  </p>
  <p><em>Stellar Journey to Mastery — Orange Belt (Level 3)</em></p>
</div>

Deployment link - https://ai-powered-smart-crowdfunding-platf.vercel.app/
---

## 📖 Overview

StellarFlow AI is a production-ready decentralized crowdfunding platform built on the Stellar blockchain using Soroban smart contracts. It enables campaign creators to raise funds, lock them in escrow, and release them milestone-by-milestone with full transparency and AI-generated campaign descriptions.

### Key Features

- 🤖 **AI-Generated Descriptions** — OpenAI-powered campaign content generation
- 🔒 **Escrow Security** — Funds locked until milestones are approved
- 📊 **Milestone Releases** — Phased fund distribution to campaign creators
- ⚡ **Real-Time Events** — Automatic UI updates via Soroban event streaming
- 📱 **Mobile-First** — Responsive across all screen sizes (320px–1440px)
- 🎨 **Premium Web3 UI** — Glassmorphism dark theme with smooth animations
- 🛡️ **Full Error Handling** — 9 error states with friendly messages
- 🧪 **Comprehensive Tests** — Contract + frontend + E2E coverage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │Dashboard │  │Campaigns │  │  Create    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│         ↕ React Query + Zustand + StellarWalletsKit          │
├─────────────────────────────────────────────────────────────┤
│                   ContractService Layer                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Stellar SDK  │  SorobanRPC  │  Event Streaming     │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                 Soroban Smart Contracts (Rust)                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ Campaign │───►│  Escrow  │───►│ Treasury │               │
│  └──────────┘    └────┬─────┘    └──────────┘               │
│                       │                                       │
│                  ┌────▼─────┐                                │
│                  │Milestone │                                │
│                  └──────────┘                                │
├─────────────────────────────────────────────────────────────┤
│                  Stellar Testnet (RPC + Horizon)              │
└─────────────────────────────────────────────────────────────┘
```

### Inter-Contract Communication Flow

```
User Creates Campaign
        │
        ▼
Campaign Contract ──► stores campaign data, emits CampaignCreated
        │
Donor Donates
        │
        ▼
Escrow Contract ──► locks XLM, updates Campaign amount, emits EscrowLocked + DonationReceived
        │
        ▼
Treasury Contract ──► calculates 2% platform fee
        │
Creator Submits Milestone
        │
        ▼
Milestone Contract ──► marks submitted, admin approves
        │
        ▼
Escrow Contract ──► releases funds to creator, emits MilestoneReleased
```

---

## 📁 Folder Structure

```
stellarflow-ai/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── contracts/
│   ├── campaign/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs          # Campaign smart contract
│   ├── escrow/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs          # Escrow smart contract
│   ├── treasury/
│   │   ├── Cargo.toml
│   │   └── src/lib.rs          # Treasury smart contract
│   └── milestone/
│       ├── Cargo.toml
│       └── src/lib.rs          # Milestone smart contract
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons
│   │   ├── components/
│   │   │   ├── ui/             # Button, Card, Badge, Input, Modal...
│   │   │   ├── layout/         # AppShell, Header, Sidebar
│   │   │   ├── wallet/         # WalletButton, WalletModal
│   │   │   ├── campaigns/      # CampaignCard, DonationForm, MilestoneTracker
│   │   │   └── dashboard/      # StatsCards, DonationChart, ActivityFeed
│   │   ├── contexts/           # WalletContext, NotificationContext
│   │   ├── hooks/              # useWallet, useCampaigns, useDonation...
│   │   ├── pages/              # Landing, Dashboard, Campaigns, Create, Profile
│   │   ├── services/           # contractService, eventService, aiService
│   │   ├── store/              # walletStore, campaignStore, eventStore
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # format, errors, stellar helpers
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tests/
│   │   ├── unit/               # Vitest unit tests
│   │   └── e2e/                # Playwright E2E tests
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vercel.json
├── scripts/
│   ├── deploy.sh               # Linux/Mac deploy
│   ├── deploy.ps1              # Windows PowerShell deploy
│   └── verify.sh               # Contract verification
├── docs/
│   ├── DEMO_SCRIPT.md
│   ├── PITCH_DECK.md
│   ├── ARCHITECTURE.md
│   ├── WINDOWS_SETUP.md
│   └── SUBMISSION_CHECKLIST.md
├── Cargo.toml                  # Rust workspace
├── package.json                # Root package
├── .env.example                # Environment template
├── .gitignore
└── README.md
```

---

## 🛠️ Installation

### Prerequisites

| Tool | Version | Link |
|------|---------|------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Rust | 1.80+ | [rustup.rs](https://rustup.rs) |
| Soroban CLI | latest | `cargo install soroban-cli` |
| Freighter Wallet | latest | [freighter.app](https://freighter.app) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## 💻 Windows Setup Guide

### Step 1 — Install Node.js

1. Download Node.js 20 LTS from [nodejs.org](https://nodejs.org/en/download/)
2. Run the installer (`.msi` file)
3. Verify: open PowerShell and run `node --version`

### Step 2 — Install Rust

1. Download `rustup-init.exe` from [rustup.rs](https://rustup.rs)
2. Run the installer, choose option 1 (default install)
3. Restart PowerShell
4. Verify: `rustc --version`
5. Add wasm target:
   ```powershell
   rustup target add wasm32-unknown-unknown
   ```

### Step 3 — Install Soroban CLI

```powershell
cargo install --locked soroban-cli --features opt
```

Verify: `soroban --version`

### Step 4 — Install Freighter Wallet

1. Go to [freighter.app](https://freighter.app)
2. Install the browser extension (Chrome/Firefox/Brave)
3. Create a new wallet or restore existing
4. Switch to **Testnet** in Freighter settings

### Step 5 — Clone & Setup Project

```powershell
# Clone the repository
git clone https://github.com/YOUR_USERNAME/stellarflow-ai.git
cd stellarflow-ai

# Copy environment file
Copy-Item .env.example frontend\.env

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 6 — Get Testnet XLM (Friendbot)

```powershell
# Get your Freighter testnet address, then fund it:
$address = "YOUR_FREIGHTER_ADDRESS"
Invoke-RestMethod "https://friendbot.stellar.org?addr=$address"
```

---

## 🔗 Deploy Contracts (Windows)

```powershell
# From project root
.\scripts\deploy.ps1

# This will:
# 1. Build all 4 Rust contracts
# 2. Deploy to Stellar Testnet
# 3. Initialize all contracts
# 4. Save addresses to frontend\.env
```

After deployment, contract IDs are saved to `frontend/.env` automatically.

---

## 🚀 Run Frontend

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

Connect Freighter wallet (make sure Testnet is selected).

---

## 🧪 Testing

### Run Contract Tests

```powershell
# From project root
cargo test

# Test specific contract
cargo test -p campaign
cargo test -p escrow
cargo test -p treasury
cargo test -p milestone
```

### Run Frontend Tests

```powershell
cd frontend
npm run test
```

### Run E2E Tests (Playwright)

```powershell
cd frontend
npx playwright install --with-deps
npx playwright test
```

### Test Coverage

```powershell
cd frontend
npm run test:coverage
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `frontend/.env` and fill in values:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STELLAR_NETWORK` | Network name | `TESTNET` |
| `VITE_STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `VITE_STELLAR_HORIZON_URL` | Horizon API URL | `https://horizon-testnet.stellar.org` |
| `VITE_STELLAR_PASSPHRASE` | Network passphrase | `Test SDF Network ; September 2015` |
| `VITE_CAMPAIGN_CONTRACT_ID` | Campaign contract address | `CAA...` |
| `VITE_ESCROW_CONTRACT_ID` | Escrow contract address | `CAA...` |
| `VITE_TREASURY_CONTRACT_ID` | Treasury contract address | `CAA...` |
| `VITE_MILESTONE_CONTRACT_ID` | Milestone contract address | `CAA...` |
| `VITE_OPENAI_API_KEY` | OpenAI key (optional) | `sk-...` |

---

## 🌐 Vercel Deployment

https://ai-powered-smart-crowdfunding-platf.vercel.app/

---

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline runs on every push to `main`:

```
Push to main
    │
    ├── Lint & TypeCheck
    │       │
    ├── Frontend Tests (Vitest)
    │       │
    ├── Contract Tests (Rust)
    │       │
    ├── Build Frontend (Production)
    │       │
    ├── Build Contracts (WASM)
    │       │
    ├── E2E Tests (Playwright)
    │       │
    └── Deploy to Vercel ✅
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VITE_CAMPAIGN_CONTRACT_ID` | Deployed campaign contract |
| `VITE_ESCROW_CONTRACT_ID` | Deployed escrow contract |
| `VITE_TREASURY_CONTRACT_ID` | Deployed treasury contract |
| `VITE_MILESTONE_CONTRACT_ID` | Deployed milestone contract |
| `VITE_OPENAI_API_KEY` | OpenAI API key (optional) |

---

## 📸 Screenshots

contract-address

<img width="1907" height="942" alt="contract-address" src="https://github.com/user-attachments/assets/fe6c5e5a-0945-46ff-8f9a-5302f63d534d" />

CI-CD Pipeline

<img width="1885" height="927" alt="CI-CD Pipeline " src="https://github.com/user-attachments/assets/900a188c-e12d-450a-85a1-3a6d4c87c125" />

Mobile Responsive UI

<img width="1912" height="927" alt="Mobile Responsive UI" src="https://github.com/user-attachments/assets/dcb37e6f-f0ae-43f1-908a-d017bbd7b92a" />

Dashboard

<img width="1907" height="937" alt="Dashboard" src="https://github.com/user-attachments/assets/7a8dc336-9cc2-41c7-814a-1e3f881c0b0b" />


----
Demo Video


Drive Link = https://drive.google.com/file/d/1wFk7sp1XujWAqo38aG3mS6sbv2c6mVcj/view?usp=sharing



  


---

## 🗺️ Future Roadmap

- [ ] **Mainnet Deployment** — Deploy to Stellar Mainnet after audit
- [ ] **DAO Governance** — Community voting on milestone approvals
- [ ] **NFT Rewards** — Issue NFT badges to top backers
- [ ] **Mobile App** — React Native companion app
- [ ] **Multi-token Support** — Accept USDC, BTC wrapped on Stellar
- [ ] **Analytics Dashboard** — Advanced on-chain analytics
- [ ] **Email Notifications** — Campaign update emails
- [ ] **Social Integration** — Share campaigns to X/Twitter/Telegram

---

## 🔒 Security

- All contract functions use `env.require_auth()` for access control
- Treasury fee is hardcoded at 2% (not configurable by users)
- Escrow funds are only releasable by admin-approved addresses
- Refunds are only possible after campaign expiry
- All inputs validated on-chain before state changes

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org) — Blockchain infrastructure
- [Soroban](https://soroban.stellar.org) — Smart contract platform
- [StellarWalletsKit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) — Wallet integration
- [Freighter](https://freighter.app) — Stellar wallet browser extension

---

<div align="center">
  <p>Built with ❤️ on Stellar Soroban for the Orange Belt Submission</p>
  <p>
    <a href="https://stellar.org">Stellar</a> •
    <a href="https://soroban.stellar.org">Soroban</a> •
    <a href="https://freighter.app">Freighter</a>
  </p>
</div>
