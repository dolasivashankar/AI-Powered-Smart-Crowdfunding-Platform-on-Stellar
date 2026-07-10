import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { formatXLM, formatTimeLeft, formatPercent, formatAddress } from '@/utils/format';
import { Calendar, User, CheckCircle2 } from 'lucide-react';
import type { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const progress = formatPercent(campaign.currentAmount, campaign.goalAmount);
  const timeLeft = formatTimeLeft(campaign.deadline);

  const statusVariants = {
    Active: 'info' as const,
    Funded: 'success' as const,
    Closed: 'default' as const,
    Refunded: 'error' as const,
  };

  const statusLabels = {
    Active: 'Active Raising',
    Funded: 'Goal Funded',
    Closed: 'Closed out',
    Refunded: 'Refunded',
  };

  const handleCardClick = () => {
    navigate(`/campaigns/${campaign.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className="cursor-pointer flex flex-col justify-between h-[360px] relative overflow-hidden"
    >
      <div>
        {/* Status Badge & Milestones count */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant={statusVariants[campaign.status]}>
            {statusLabels[campaign.status]}
          </Badge>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {campaign.milestoneCount} Milestones
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-100 mb-2 line-clamp-1 group-hover:text-stellar-400 transition-colors">
          {campaign.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-6 leading-relaxed">
          {campaign.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {/* Progress Bar */}
        <ProgressBar progress={progress} color={campaign.status === 'Funded' ? 'emerald' : 'stellar'} />

        {/* Goal Raised stats */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Raised</span>
            <span className="font-extrabold text-slate-200">{formatXLM(campaign.currentAmount)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Goal Target</span>
            <span className="font-bold text-slate-300">{formatXLM(campaign.goalAmount)}</span>
          </div>
        </div>

        {/* Author / Date footer */}
        <div className="border-t border-glass-border/30 pt-3 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {formatAddress(campaign.creator)}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {timeLeft}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
