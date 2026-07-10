import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletButton } from '@/components/wallet/WalletButton';
import { CreateCampaign } from '@/pages/CreateCampaign';
import { DonationForm } from '@/components/campaigns/DonationForm';
import { TransactionTimeline } from '@/components/dashboard/TransactionTimeline';
import { Dashboard } from '@/pages/Dashboard';
import { useAdminStore } from '@/store/adminStore';

// Mutable mock wallet state
const mockWallet = {
  isConnected: false,
  address: '',
  balance: '0.00',
  connect: vi.fn(),
  disconnect: vi.fn(),
  signTransaction: vi.fn(),
};

// Global mocks
vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => mockWallet,
  default: () => mockWallet,
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  default: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  }),
}));

// Helper to wrap test component with router and query client
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

// ── Tests Suite ────────────────────────────────────────────────
describe('StellarFlow AI — Frontend Components Suite', () => {
  
  // Test 1: Wallet Connection state
  it('renders connect wallet action when disconnected', () => {
    mockWallet.isConnected = false;
    mockWallet.address = '';
    renderWithProviders(<WalletButton />);
    expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
  });

  // Test 2: Campaign Creation Form validation
  it('requires title and goal target validation inside creation stepper', () => {
    mockWallet.isConnected = true;
    mockWallet.address = 'GBB...123';
    // Bypass the AdminGate by setting admin logged in state to true
    useAdminStore.setState({ isAdminLoggedIn: true });

    renderWithProviders(<CreateCampaign />);
    expect(screen.getByText(/Create Campaign/i)).toBeInTheDocument();
    
    // Attempting next step with empty inputs trigger errors
    const nextBtn = screen.getByText(/Configure Copy/i);
    fireEvent.click(nextBtn);
    expect(screen.getByLabelText(/Campaign Title/i)).toBeInvalid();
  });

  // Test 3: Donation pledge preset options
  it('renders quick selection presets when donor is connected', () => {
    mockWallet.isConnected = true;
    mockWallet.address = 'GBB...123';
    mockWallet.balance = '100.00';

    renderWithProviders(<DonationForm campaignId="1" campaignTitle="Test project" />);
    expect(screen.getByText(/\+10 XLM/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 XLM/i)).toBeInTheDocument();
    expect(screen.getByText(/\+100 XLM/i)).toBeInTheDocument();
  });

  // Test 4: Transaction status rendering
  it('renders ledger events inside the timeline list', () => {
    renderWithProviders(<TransactionTimeline />);
    expect(screen.getByText(/Donation Locked/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestone Submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/Campaign Created/i)).toBeInTheDocument();
  });

  // Test 5: Dashboard grids mount
  it('mounts stats cards, charts, and activity feeds inside dashboard', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText(/System Overview Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily donation volumes/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-Time Event Stream/i)).toBeInTheDocument();
  });
});
