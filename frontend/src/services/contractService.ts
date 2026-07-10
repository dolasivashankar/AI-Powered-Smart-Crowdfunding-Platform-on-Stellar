import {
  Contract,
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
  xdr,
  Account,
  Asset,
  Operation,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { getNetworkConfig, isValidStellarAddress } from '@/utils/stellar';
import type { Campaign, Milestone, EscrowRecord, CreateCampaignParams } from '@/types';
import { useAdminStore } from '@/store/adminStore';

// Suppress unused import warnings — these will be used in real deployment
void Contract;
void TransactionBuilder;
void Networks;
void nativeToScVal;
void scValToNative;
void xdr;
void Account;
void Asset;
void Operation;
void BASE_FEE;

class ContractService {
  private server: SorobanRpc.Server;
  private networkConfig = getNetworkConfig();

  constructor() {
    this.server = new SorobanRpc.Server(this.networkConfig.rpcUrl);
  }

  // Returns true if contract IDs are set in environment variables
  private hasContracts(): boolean {
    return (
      !!import.meta.env.VITE_CAMPAIGN_CONTRACT_ID &&
      import.meta.env.VITE_CAMPAIGN_CONTRACT_ID.startsWith('C') &&
      import.meta.env.VITE_CAMPAIGN_CONTRACT_ID.length === 56
    );
  }

  // Mock database stored in localStorage for simulated fallback
  private getMockCampaigns(): Campaign[] {
    const data = localStorage.getItem('stellarflow_mock_campaigns');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((c: Record<string, unknown>) => ({
          ...c,
          goalAmount: BigInt(c.goalAmount as string),
          currentAmount: BigInt(c.currentAmount as string),
        }));
      } catch (e) {
        console.error(e);
      }
    }

    // Default initial mock campaigns
    const defaults: Campaign[] = [
      {
        id: '1',
        creator: 'GA3D2S6TKM56GQLP6T7ZUXM2W5J37JFL5U3S4546Q7QW5ERFXYZABC12',
        title: 'Clean Water for Greenfield Village',
        description: 'Implementing a solar-powered water filtration system in Greenfield, providing clean drinking water to over 500 families. Backed by community leaders.',
        goalAmount: 20000000000n, // 2000 XLM
        currentAmount: 14500000000n, // 1450 XLM
        deadline: Math.floor(Date.now() / 1000) + 86400 * 15,
        status: 'Active',
        milestoneCount: 3,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
      },
      {
        id: '2',
        creator: 'GBS774ERKM56GQLP6T7ZUXM2W5J37JFL5U3S4546Q7QW5ERFXYZABC12',
        title: 'AI Education Bootcamp in Kenya',
        description: 'A 6-week intensive blockchain and AI developer bootcamp in Nairobi. Funds will cover laptops, space rental, and internet for 30 students.',
        goalAmount: 50000000000n, // 5000 XLM
        currentAmount: 50000000000n, // 5000 XLM
        deadline: Math.floor(Date.now() / 1000) - 3600,
        status: 'Funded',
        milestoneCount: 2,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
      },
      {
        id: '3',
        creator: 'GCDEF56GQLP6T7ZUXM2W5J37JFL5U3S4546Q7QW5ERFXYZABC12GHIJ',
        title: 'SolarGrid Rural India Initiative',
        description: 'Deploying solar microgrids to 20 off-grid villages across Rajasthan. Each grid will power homes, schools, and health clinics, improving the lives of 3000+ residents.',
        goalAmount: 100000000000n, // 10000 XLM
        currentAmount: 25000000000n, // 2500 XLM
        deadline: Math.floor(Date.now() / 1000) + 86400 * 45,
        status: 'Active',
        milestoneCount: 4,
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
      },
    ];
    this.saveMockCampaigns(defaults);
    return defaults;
  }

  private saveMockCampaigns(campaigns: Campaign[]) {
    const serialized = campaigns.map((c) => ({
      ...c,
      goalAmount: c.goalAmount.toString(),
      currentAmount: c.currentAmount.toString(),
    }));
    localStorage.setItem('stellarflow_mock_campaigns', JSON.stringify(serialized));
  }

  private getMockMilestones(campaignId: string): Milestone[] {
    const key = `stellarflow_mock_milestones_${campaignId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((m: Record<string, unknown>) => ({
          ...m,
          targetAmount: BigInt(m.targetAmount as string),
          releasedAmount: BigInt(m.releasedAmount as string),
        }));
      } catch (e) {
        console.error(e);
      }
    }

    // Default mock milestones
    const defaults: Milestone[] = [
      {
        campaignId,
        index: 1,
        title: 'Phase 1: Planning and Logistics',
        description: 'Securing partnership approvals, buying initial components, setting up the local workspace.',
        targetAmount: 5000000000n, // 500 XLM
        releasedAmount: 0n,
        approved: false,
        submitted: false,
        submittedAt: 0,
      },
      {
        campaignId,
        index: 2,
        title: 'Phase 2: Deployment & Testing',
        description: 'Physical installation of filtration systems or classrooms, conducting public testing, gathering community feedback.',
        targetAmount: 10000000000n, // 1000 XLM
        releasedAmount: 0n,
        approved: false,
        submitted: false,
        submittedAt: 0,
      },
    ];
    this.saveMockMilestones(campaignId, defaults);
    return defaults;
  }

  private saveMockMilestones(campaignId: string, milestones: Milestone[]) {
    const serialized = milestones.map((m) => ({
      ...m,
      targetAmount: m.targetAmount.toString(),
      releasedAmount: m.releasedAmount.toString(),
    }));
    localStorage.setItem(`stellarflow_mock_milestones_${campaignId}`, JSON.stringify(serialized));
  }

  // ── Blockchain / Soroban Methods ─────────────────────────────

  async createCampaign(params: CreateCampaignParams, creatorAddress: string, _signTransaction: (xdr: string) => Promise<string>): Promise<string> {
    if (!this.hasContracts()) {
      // Simulation mode
      const campaigns = this.getMockCampaigns();
      const newId = String(campaigns.length + 1);
      const goalStr = params.goalAmount;
      const parsedGoal = BigInt(Math.floor(Number(goalStr) * 10000000));
      const days = Number(params.deadline);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);

      const newCampaign: Campaign = {
        id: newId,
        creator: creatorAddress,
        title: params.title,
        description: params.description,
        goalAmount: parsedGoal,
        currentAmount: 0n,
        deadline: deadlineTimestamp,
        status: 'Active',
        milestoneCount: params.milestoneCount,
        createdAt: Math.floor(Date.now() / 1000),
      };

      campaigns.push(newCampaign);
      this.saveMockCampaigns(campaigns);

      // Initialize mock milestones
      const milestones: Milestone[] = [];
      const targetPerMilestone = parsedGoal / BigInt(params.milestoneCount);
      for (let i = 1; i <= params.milestoneCount; i++) {
        milestones.push({
          campaignId: newId,
          index: i,
          title: `Milestone ${i} for ${params.title}`,
          description: `Deliverables and progress review for phase ${i} of the campaign.`,
          targetAmount: targetPerMilestone,
          releasedAmount: 0n,
          approved: false,
          submitted: false,
          submittedAt: 0,
        });
      }
      this.saveMockMilestones(newId, milestones);

      this.addMockEvent({
        id: `evt_create_${Date.now()}`,
        type: 'CampaignCreated',
        campaignId: newId,
        data: { id: newId, title: params.title, creator: creatorAddress, goalAmount: parsedGoal.toString() },
        timestamp: Math.floor(Date.now() / 1000),
      });

      return newId;
    }

    // Real Soroban call placeholder
    const contractId = import.meta.env.VITE_CAMPAIGN_CONTRACT_ID;
    void contractId;
    throw new Error('Real deployment active. Contracts will call transaction builder directly.');
  }

  async listCampaigns(): Promise<Campaign[]> {
    if (!this.hasContracts()) {
      return this.getMockCampaigns();
    }
    try {
      return this.getMockCampaigns();
    } catch (e) {
      return this.getMockCampaigns();
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const campaigns = await this.listCampaigns();
    return campaigns.find((c) => c.id === id) || null;
  }

  async donate(
    campaignId: string,
    amount: string,
    donorAddress: string,
    signTransaction?: (xdr: string) => Promise<string>
  ): Promise<string> {
    const adminStore = useAdminStore.getState();
    const adminAddress = adminStore.adminWalletAddress;

    // Check if we should attempt a real Testnet payment transaction to the admin address
    if (adminAddress && isValidStellarAddress(adminAddress) && signTransaction) {
      try {
        const config = getNetworkConfig();
        const horizonUrl = config.horizonUrl;
        const response = await fetch(`${horizonUrl}/accounts/${donorAddress}`);
        if (!response.ok) {
          throw new Error('Failed to load donor account details from Stellar network. Ensure it is funded.');
        }
        const accountData = await response.ok ? await response.json() : null;
        if (!accountData) {
          throw new Error('Donor account not found on Testnet.');
        }

        const source = new Account(donorAddress, accountData.sequence);
        const tx = new TransactionBuilder(source, {
          fee: BASE_FEE,
          networkPassphrase: config.networkPassphrase,
        })
          .addOperation(
            Operation.payment({
              destination: adminAddress,
              asset: Asset.native(),
              amount: amount,
            })
          )
          .setTimeout(30)
          .build();

        const xdrString = tx.toXDR();
        const signedXdr = await signTransaction(xdrString);

        // Submit transaction to Horizon
        const submitResponse = await fetch(`${horizonUrl}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ tx: signedXdr }).toString(),
        });
        const submitResult = await submitResponse.json();

        if (!submitResponse.ok || submitResult.status === 'failed') {
          throw new Error(submitResult.title || 'Transaction submission failed.');
        }

        // Successfully paid real XLM on Testnet, update local mock states for UI feedback
        const campaigns = this.getMockCampaigns();
        const idx = campaigns.findIndex((c) => c.id === campaignId);
        const donationStroops = BigInt(Math.floor(Number(amount) * 10000000));
        if (idx !== -1) {
          campaigns[idx].currentAmount += donationStroops;
          if (campaigns[idx].currentAmount >= campaigns[idx].goalAmount) {
            campaigns[idx].status = 'Funded';
          }
          this.saveMockCampaigns(campaigns);
        }
        adminStore.recordTransfer(Number(amount));

        this.addMockEvent({
          id: `evt_donate_${Date.now()}`,
          type: 'DonationReceived',
          campaignId,
          data: {
            campaignId,
            donor: donorAddress,
            amount: donationStroops.toString(),
            recipient: adminAddress,
            realTx: true,
          },
          timestamp: Math.floor(Date.now() / 1000),
        });

        return submitResult.hash;
      } catch (e: any) {
        console.warn('Real Testnet payment failed, falling back to mock environment:', e);
        // Throw the error so the user is notified if they cancel the signature or run out of funds
        throw new Error(e.message || 'Real transaction failed.');
      }
    }

    // Offline / Mock Mode fallback (or no admin address configured)
    if (!this.hasContracts()) {
      const campaigns = this.getMockCampaigns();
      const idx = campaigns.findIndex((c) => c.id === campaignId);
      if (idx === -1) throw new Error('Campaign not found.');

      const donationStroops = BigInt(Math.floor(Number(amount) * 10000000));
      campaigns[idx].currentAmount += donationStroops;

      if (campaigns[idx].currentAmount >= campaigns[idx].goalAmount) {
        campaigns[idx].status = 'Funded';
      }

      this.saveMockCampaigns(campaigns);

      // Record transfer in Admin Panel if set
      if (adminAddress) {
        adminStore.recordTransfer(Number(amount));
      }

      const escrowKey = `stellarflow_mock_escrow_${campaignId}_${donorAddress}`;
      const existingStr = localStorage.getItem(escrowKey);
      const existingAmount = existingStr ? BigInt(existingStr) : 0n;
      localStorage.setItem(escrowKey, (existingAmount + donationStroops).toString());

      this.addMockEvent({
        id: `evt_donate_${Date.now()}`,
        type: 'DonationReceived',
        campaignId,
        data: {
          campaignId,
          donor: donorAddress,
          amount: donationStroops.toString(),
          recipient: adminAddress || 'Escrow Vault',
        },
        timestamp: Math.floor(Date.now() / 1000),
      });

      this.addMockEvent({
        id: `evt_escrow_${Date.now()}`,
        type: 'EscrowLocked',
        campaignId,
        data: {
          campaignId,
          donor: donorAddress,
          amount: donationStroops.toString(),
          recipient: adminAddress || 'Escrow Vault',
        },
        timestamp: Math.floor(Date.now() / 1000),
      });

      return `tx_mock_hash_${Date.now()}`;
    }

    throw new Error('Real deployment active.');
  }

  async getMilestones(campaignId: string): Promise<Milestone[]> {
    return this.getMockMilestones(campaignId);
  }

  async submitMilestone(campaignId: string, index: number, _creatorAddress: string): Promise<string> {
    const milestones = this.getMockMilestones(campaignId);
    const mIdx = milestones.findIndex((m) => m.index === index);
    if (mIdx === -1) throw new Error('Milestone not found.');

    milestones[mIdx].submitted = true;
    milestones[mIdx].submittedAt = Math.floor(Date.now() / 1000);
    this.saveMockMilestones(campaignId, milestones);

    return `tx_mock_submit_${Date.now()}`;
  }

  async approveMilestone(campaignId: string, index: number, _adminAddress: string): Promise<string> {
    const milestones = this.getMockMilestones(campaignId);
    const mIdx = milestones.findIndex((m) => m.index === index);
    if (mIdx === -1) throw new Error('Milestone not found.');

    milestones[mIdx].approved = true;
    milestones[mIdx].releasedAmount = milestones[mIdx].targetAmount;
    this.saveMockMilestones(campaignId, milestones);

    this.addMockEvent({
      id: `evt_milestone_release_${Date.now()}`,
      type: 'MilestoneReleased',
      campaignId,
      data: { campaignId, index, amount: milestones[mIdx].targetAmount.toString() },
      timestamp: Math.floor(Date.now() / 1000),
    });

    return `tx_mock_approve_${Date.now()}`;
  }

  async refund(campaignId: string, donorAddress: string): Promise<string> {
    const escrowKey = `stellarflow_mock_escrow_${campaignId}_${donorAddress}`;
    const amountStr = localStorage.getItem(escrowKey);
    if (!amountStr || amountStr === '0') throw new Error('No lockup amount found to refund.');

    localStorage.setItem(escrowKey, '0');

    this.addMockEvent({
      id: `evt_refund_${Date.now()}`,
      type: 'RefundIssued',
      campaignId,
      data: { campaignId, donor: donorAddress, amount: amountStr },
      timestamp: Math.floor(Date.now() / 1000),
    });

    return `tx_mock_refund_${Date.now()}`;
  }

  private addMockEvent(event: any) {
    const data = localStorage.getItem('stellarflow_mock_events') || '[]';
    const parsed = JSON.parse(data);
    parsed.unshift(event);
    localStorage.setItem('stellarflow_mock_events', JSON.stringify(parsed.slice(0, 50)));
  }
}

export const contractService = new ContractService();
export default contractService;
