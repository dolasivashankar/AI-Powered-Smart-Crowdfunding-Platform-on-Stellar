import React from 'react';
import { Card } from '../ui/Card';
import { Compass, Coins, Flame, ShieldAlert } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cardData = [
    {
      title: 'Total Projects Raised',
      value: stats.totalCampaigns.toString(),
      change: '+14% this month',
      icon: Compass,
      color: 'text-stellar-400',
      glow: 'shadow-glow shadow-stellar-500/10',
    },
    {
      title: 'XLM Funds Donated',
      value: stats.totalRaised,
      change: '100% Locked in Escrow',
      icon: Coins,
      color: 'text-aurora-cyan',
      glow: 'shadow-glow-cyan shadow-aurora-cyan/10',
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      change: 'Interactive funding live',
      icon: Flame,
      color: 'text-aurora-amber',
      glow: 'shadow-glow shadow-aurora-amber/10',
    },
    {
      title: 'Success Release Rate',
      value: `${stats.successRate}%`,
      change: 'Trusted on-chain delivery',
      icon: ShieldAlert,
      color: 'text-aurora-emerald',
      glow: 'shadow-glow shadow-aurora-emerald/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((c, i) => (
        <Card key={i} className={`flex flex-col gap-3 relative overflow-hidden ${c.glow}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              {c.title}
            </span>
            <c.icon className={`w-5 h-5 ${c.color}`} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-extrabold text-slate-200">
              {c.value}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {c.change}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
