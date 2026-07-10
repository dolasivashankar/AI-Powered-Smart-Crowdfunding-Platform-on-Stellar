# StellarFlow AI — 2-Minute Demo Script

## Presenter Guide

**Total Time:** 2 minutes  
**Audience:** Judges / Technical Reviewers  
**Environment:** Chrome with Freighter wallet connected to Testnet

---

## [0:00 – 0:15] Opening Hook

> "What if you could launch a blockchain crowdfunding campaign in under 60 seconds, with AI writing your pitch, and escrow automatically protecting every backer's funds? That's StellarFlow AI."

**Action:** Show the landing page in browser

---

## [0:15 – 0:35] Wallet Connection

> "I'll connect my Freighter wallet on Stellar Testnet with one click."

**Action:**
1. Click "Connect Wallet" button in the top right
2. Select Freighter from the wallet modal
3. Approve in Freighter extension
4. Show wallet address and XLM balance appear

> "Connected. My wallet shows X XLM on testnet. Let's create a campaign."

---

## [0:35 – 1:05] Create Campaign with AI

> "Here's where it gets exciting — AI writes the campaign description for me."

**Action:**
1. Navigate to `/create`
2. Fill in: Title = "Solar Panels for Rural Schools", Category = "Environment", Goal = "1000 XLM"
3. Click **"Generate with AI"** button
4. Show the AI description appearing in the textarea
5. Fill in deadline (30 days) and set 3 milestones
6. Click **"Deploy Campaign"**
7. Approve transaction in Freighter
8. Show success toast with campaign ID

> "Our campaign is now live on the Stellar blockchain with 3 milestones defined."

---

## [1:05 – 1:30] Donate & Escrow

> "Now let's simulate a donation. Funds go into escrow — locked until milestones are approved."

**Action:**
1. Navigate to the campaign detail page
2. Enter 50 XLM in the donation form
3. Click "Back This Campaign"
4. Approve transaction in Freighter
5. Show progress bar updating in real-time
6. Point to the Activity Feed showing "EscrowLocked" and "DonationReceived" events

> "50 XLM locked in escrow. The Activity Feed updated automatically — no page refresh needed."

---

## [1:30 – 1:50] Milestone Release

> "The creator submits their first milestone, admin approves, and funds release automatically."

**Action:**
1. Show Milestone Tracker on campaign page
2. Click "Submit Milestone" on Milestone 1
3. Approve in Freighter
4. Show milestone status change to "Submitted"
5. Click "Approve Milestone" (as admin)
6. Show funds released, Activity Feed shows "MilestoneReleased"

> "Funds released from escrow to the campaign creator. Transparent, trustless, automatic."

---

## [1:50 – 2:00] Closing

> "StellarFlow AI: AI-powered campaigns, Soroban escrow security, milestone-based releases — all live on Stellar Testnet. Thank you."

**Action:** Show the dashboard with analytics charts and activity feed

---

## Key Talking Points (if asked)

- **4 Soroban contracts** with inter-contract calls (Campaign → Escrow → Treasury → Milestone)
- **Real-time events** using Stellar RPC event streaming (3-second polling)
- **AI descriptions** via OpenAI API with deterministic mock fallback
- **Full test suite**: 20+ contract tests + frontend tests + Playwright E2E
- **CI/CD** pipeline deploys automatically on push to main
- **Mobile-first** design tested at 6 breakpoints

---

## Backup Talking Points

| Question | Answer |
|----------|--------|
| "What if the campaign fails?" | Donors call refund(), escrow releases back to their wallets |
| "How is the 2% fee collected?" | Treasury contract automatically calculates fee on each deposit |
| "Is this secure?" | All functions use env.require_auth() + custom error types |
| "Can it run on Mainnet?" | Yes — change network config, re-deploy, same contracts |
