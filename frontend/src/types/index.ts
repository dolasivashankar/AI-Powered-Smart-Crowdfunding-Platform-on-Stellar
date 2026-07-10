// Campaign types
export interface Campaign {
  id: string;
  creator: string;
  title: string;
  description: string;
  goalAmount: bigint;
  currentAmount: bigint;
  deadline: number;
  status: CampaignStatus;
  milestoneCount: number;
  createdAt: number;
}

export type CampaignStatus = 'Active' | 'Funded' | 'Closed' | 'Refunded';

export interface CreateCampaignParams {
  title: string;
  description: string;
  goalAmount: string;
  deadline: string;
  milestoneCount: number;
}

// Milestone types
export interface Milestone {
  campaignId: string;
  index: number;
  title: string;
  description: string;
  targetAmount: bigint;
  releasedAmount: bigint;
  approved: boolean;
  submitted: boolean;
  submittedAt: number;
}

export interface CreateMilestoneParams {
  title: string;
  description: string;
  targetAmount: string;
}

// Escrow types
export interface EscrowRecord {
  campaignId: string;
  donor: string;
  amount: bigint;
  lockedAt: number;
  released: boolean;
  refunded: boolean;
}

// Wallet types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string;
  balance: string | null;
  isLoading: boolean;
  error: WalletError | null;
}

export type WalletError =
  | 'NOT_INSTALLED'
  | 'LOCKED'
  | 'REJECTED'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_ADDRESS'
  | 'NETWORK_UNAVAILABLE'
  | 'UNKNOWN';

// Event types
export interface StellarEvent {
  id: string;
  type: EventType;
  campaignId?: string;
  data: Record<string, any>;
  timestamp: number;
}

export type EventType =
  | 'CampaignCreated'
  | 'DonationReceived'
  | 'EscrowLocked'
  | 'MilestoneReleased'
  | 'RefundIssued'
  | 'CampaignClosed';

// Transaction types
export interface Transaction {
  id: string;
  hash: string;
  type: string;
  status: TransactionStatus;
  amount?: string;
  timestamp: number;
  campaignId?: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed';

// AI types
export interface AIGenerateParams {
  title: string;
  category: string;
  goalAmount: string;
  highlights: string[];
}

export interface AIResponse {
  description: string;
  loading: boolean;
  error: string | null;
}

// Analytics types
export interface DashboardStats {
  totalCampaigns: number;
  totalRaised: string;
  activeCampaigns: number;
  successRate: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  amount: number;
}

// Contract config
export interface ContractConfig {
  campaignContractId: string;
  escrowContractId: string;
  treasuryContractId: string;
  milestoneContractId: string;
  rpcUrl: string;
  networkPassphrase: string;
}
