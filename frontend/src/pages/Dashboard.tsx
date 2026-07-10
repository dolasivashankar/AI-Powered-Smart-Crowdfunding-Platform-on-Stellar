import React from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DonationChart } from '@/components/dashboard/DonationChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TransactionTimeline } from '@/components/dashboard/TransactionTimeline';
import { useGetCampaigns } from '@/hooks/useCampaigns';
import { useWallet } from '@/hooks/useWallet';
import { Badge } from '@/components/ui/Badge';
import { formatXLM } from '@/utils/format';

export const Dashboard: React.FC = () => {
  const { data: campaigns, isLoading } = useGetCampaigns();
  const { isConnected, address } = useWallet();

  // Compute stats
  const totalCampaigns = campaigns ? campaigns.length : 0;
  const totalRaisedBig = campaigns
    ? campaigns.reduce((acc, c) => acc + c.currentAmount, 0n)
    : 0n;
  const totalRaised = formatXLM(totalRaisedBig);
  const activeCampaigns = campaigns
    ? campaigns.filter((c) => c.status === 'Active').length
    : 0;
  const successRate = campaigns && campaigns.length > 0
    ? Math.round((campaigns.filter((c) => c.status === 'Funded' || c.status === 'Closed').length / campaigns.length) * 100)
    : 100;

  const stats = {
    totalCampaigns,
    totalRaised,
    activeCampaigns,
    successRate,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            System Overview Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Soroban nodes tracking crowdfund allocations and milestone security.
          </p>
        </div>

        {isConnected && address && (
          <div className="bg-slate-900 border border-glass-border p-3 rounded-2xl flex items-center gap-3 shrink-0 shadow-sm max-w-sm">
            <div className="w-8 h-8 rounded-xl bg-button-gradient flex items-center justify-center shrink-0 text-white font-extrabold text-xs">
              SF
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Node Identity
              </span>
              <span className="text-xs text-slate-300 font-mono font-medium truncate max-w-[200px]">
                {address}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <StatsCards stats={stats} />

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <DonationChart />
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionTimeline />
        
        {/* Quick Guide Card */}
        <div className="bg-card-gradient border border-glass-border p-6 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-2">Platform Quick Guide</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              StellarFlow AI coordinates multiple escrow contracts. Campaigns define phased milestone funding targets. When backers donate, funds lock. The campaign creator submits delivery verification, and upon admin authorization, the escrow disburses funds.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan" />
                <span>Create campaign: write title, category, and goal. AI designs description copy.</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-aurora-pink" />
                <span>Escrow lock: pledges lock in smart contract. 2% treasury collected.</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-aurora-emerald" />
                <span>Deliver milestones: release funds step-by-step trustlessly.</span>
              </div>
            </div>
          </div>

          <div className="border-t border-glass-border/30 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 uppercase font-semibold">
            <span>Stellar Journey to Mastery</span>
            <span>Orange Belt Node v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
