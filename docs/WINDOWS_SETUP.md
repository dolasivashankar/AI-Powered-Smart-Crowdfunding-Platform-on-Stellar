# StellarFlow AI — Windows Setup Guide

## Complete Step-by-Step Guide for Windows

This guide walks you through setting up StellarFlow AI from scratch on Windows 10/11.

---

## Prerequisites Summary

| Tool | Purpose | Time |
|------|---------|------|
| Git | Clone repository | 2 min |
| Node.js 20 | Frontend runtime | 3 min |
| Rust 1.80+ | Smart contracts | 5 min |
| Soroban CLI | Deploy contracts | 3 min |
| Freighter Wallet | Browser extension | 2 min |

Total setup time: ~15 minutes

---

## Step 1 — Install Git

1. Download from [git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer with all default options
3. Verify in PowerShell:
   ```powershell
   git --version
   # Expected: git version 2.x.x
   ```

---

## Step 2 — Install Node.js 20

1. Go to [nodejs.org/en/download](https://nodejs.org/en/download/)
2. Download **"20.x.x LTS"** Windows Installer (`.msi`)
3. Run the installer:
   - ✅ Accept the license
   - ✅ Keep default installation path (`C:\Program Files\nodejs\`)
   - ✅ Check "Automatically install the necessary tools" (optional but recommended)
4. Verify in a **new** PowerShell window:
   ```powershell
   node --version
   # Expected: v20.x.x
   
   npm --version
   # Expected: 10.x.x
   ```

---

## Step 3 — Install Rust

1. Go to [rustup.rs](https://rustup.rs)
2. Download `rustup-init.exe`
3. Run it. When prompted, choose **Option 1** (Proceed with standard installation)
4. Wait for installation (installs Rust + Cargo)
5. **Close and reopen PowerShell**
6. Verify:
   ```powershell
   rustc --version
   # Expected: rustc 1.80.x (...)
   
   cargo --version
   # Expected: cargo 1.80.x (...)
   ```
7. Add the WebAssembly target:
   ```powershell
   rustup target add wasm32-unknown-unknown
   # Verify:
   rustup target list --installed | Select-String "wasm32"
   # Expected: wasm32-unknown-unknown (installed)
   ```

> **Note:** On Windows, you might need Visual Studio Build Tools. If `rustup-init.exe` prompts you, install them (free, ~3GB download).

---

## Step 4 — Install Soroban CLI

```powershell
cargo install --locked soroban-cli --features opt
```

This takes 5–10 minutes to compile. Verify:
```powershell
soroban --version
# Expected: soroban x.x.x
```

---

## Step 5 — Install Freighter Wallet

1. Open Chrome/Edge/Brave
2. Go to [freighter.app](https://freighter.app) and click "Add to Chrome"
3. Install the extension
4. Open Freighter (click the puzzle icon → Freighter)
5. Create a new wallet or import existing
6. **IMPORTANT:** Switch to Testnet:
   - Click the network selector at the top of Freighter
   - Select "Testnet"
   - Confirm the switch

---

## Step 6 — Clone the Repository

```powershell
# Navigate to your desired folder
cd C:\Users\YourName\Projects

# Clone the repo
git clone https://github.com/YOUR_USERNAME/stellarflow-ai.git

# Enter the project
cd stellarflow-ai
```

---

## Step 7 — Setup Environment

```powershell
# Copy the environment template
Copy-Item .env.example frontend\.env

# Edit the file (notepad or VS Code)
notepad frontend\.env
```

For now, leave contract IDs empty — you'll fill them after deploying.

---

## Step 8 — Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

Expected: takes 30–60 seconds, installs ~500MB of packages.

---

## Step 9 — Get Testnet XLM

Your Freighter wallet needs Testnet XLM to pay transaction fees.

1. Open Freighter → copy your wallet address (starts with `G...`)
2. Run in PowerShell:
   ```powershell
   $address = "YOUR_WALLET_ADDRESS_HERE"
   Invoke-RestMethod "https://friendbot.stellar.org?addr=$address"
   ```
   Expected response: `{"hash": "..."}`
3. Open Freighter → should show 10,000 XLM on Testnet

---

## Step 10 — Deploy Smart Contracts

```powershell
# From project root (stellarflow-ai/)
.\scripts\deploy.ps1
```

This script will:
1. ✅ Check Rust, Soroban CLI
2. ✅ Generate deployer keypair (or reuse existing)
3. ✅ Fund deployer from Friendbot
4. ✅ Build all 4 WASM contracts
5. ✅ Deploy to Stellar Testnet
6. ✅ Initialize all contracts
7. ✅ Save addresses to `frontend\.env`

Expected output:
```
=== Deployment Summary ===
Network:    testnet
Campaign:   CABC...XYZ
Escrow:     CDEF...XYZ
Treasury:   CGHI...XYZ
Milestone:  CJKL...XYZ

✅ All contracts deployed!
```

---

## Step 11 — Run the Frontend

```powershell
cd frontend
npm run dev
```

Expected:
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open http://localhost:5173 in Chrome.

---

## Step 12 — Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Select **Freighter** from the modal
3. Freighter popup appears → click **"Connect"**
4. Your address and balance appear in the header

---

## Step 13 — Test the App

### Create a Campaign
1. Click **"Create Campaign"** → fill in the form
2. Click **"Generate with AI"** for description
3. Add milestones
4. Click **"Deploy Campaign"** → approve in Freighter

### Donate
1. Browse to a campaign
2. Enter XLM amount → click **"Back This Campaign"**
3. Approve in Freighter
4. Watch the progress bar update

### Check Activity Feed
- Dashboard shows real-time events
- No refresh needed — events stream automatically

---

## Troubleshooting

### "Freighter is not installed"
→ Install the browser extension from freighter.app

### "Transaction failed: insufficient funds"
→ Fund your wallet via Friendbot: `Invoke-RestMethod "https://friendbot.stellar.org?addr=YOUR_ADDRESS"`

### "cargo: command not found" after installing Rust
→ Close and reopen PowerShell. Rust adds itself to PATH.

### Contracts build fails on Windows
→ Install Visual Studio Build Tools 2022:
   Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

### Port 5173 already in use
```powershell
# Kill the process using the port
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

### Soroban CLI install takes too long
→ This is normal. It compiles ~200 Rust crates. Takes 5–15 min on first install.

---

## Running Tests on Windows

```powershell
# Contract tests (from project root)
cargo test

# Frontend unit tests
cd frontend
npm run test

# E2E tests (install browsers first)
npx playwright install --with-deps
npx playwright test
```

---

## Updating the App

```powershell
git pull origin main
cd frontend
npm install
npm run dev
```

---

## Uninstalling

```powershell
# Remove Node.js: Control Panel → Programs → Node.js → Uninstall
# Remove Rust:
rustup self uninstall

# Remove Soroban CLI:
cargo uninstall soroban-cli

# Remove project:
Remove-Item -Recurse -Force C:\path\to\stellarflow-ai
```
