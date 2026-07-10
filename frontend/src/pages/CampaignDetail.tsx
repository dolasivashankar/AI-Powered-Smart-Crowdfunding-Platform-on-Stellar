import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCampaign } from '@/hooks/useCampaigns';
import { DonationForm } from '@/components/campaigns/DonationForm';
import { MilestoneTracker } from '@/components/campaigns/MilestoneTracker';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useWallet } from '@/hooks/useWallet';
import { formatXLM, formatTimeLeft, formatPercent, formatAddress, formatDate } from '@/utils/format';
import { Calendar, User, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { contractService } from '@/services/contractService';
import { useNotification } from '@/contexts/NotificationContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useGetCampaign(id || '');
  const { isConnected, address } = useWallet();
  const notify = useNotification();
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!id || !address) throw new Error('Params missing');
      return await contractService.refund(id, address);
    },
    onSuccess: (txHash) => {
      notify.success(`Refund processed successfully! Tx: ${txHash.slice(0, 10)}...`);
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
    onError: (err: any) => {
      notify.error(`Refund failed: ${err.message || err}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-6 w-24 bg-slate-800/40 rounded" />
        <div className="h-10 w-2/3 bg-slate-800/40 rounded" />
        <div className="h-64 w-full bg-slate-800/40 rounded-2xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
        <AlertCircle className="w-10 h-10 text-aurora-pink" />
        <div>
          <h3 className="text-lg font-bold">Campaign not found</h3>
          <p className="text-xs text-slate-400">The requested campaign does not exist or has been deleted.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const progress = formatPercent(campaign.currentAmount, campaign.goalAmount);
  const timeLeft = formatTimeLeft(campaign.deadline);
  const hasEnded = campaign.deadline < Math.floor(Date.now() / 1000);
  const isFunded = campaign.currentAmount >= campaign.goalAmount;
  const eligibleForRefund = hasEnded && !isFunded && isConnected;

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

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Info Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card hoverEffect={false} className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Badge variant={statusVariants[campaign.status]}>
                {statusLabels[campaign.status]}
              </Badge>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold uppercase">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {formatAddress(campaign.creator)}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {formatDate(campaign.createdAt)}
                </span>
              </div>
            </div>

            <h1 className="text-xl md:text-3xl font-extrabold text-slate-100 leading-tight">
              {campaign.title}
            </h1>

            {/* Render full description with line breaks */}
            <div className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap border-t border-glass-border/30 pt-6">
              {campaign.description}
            </div>
          </Card>

          {/* Milestones tracker */}
          <MilestoneTracker campaignId={campaign.id} creatorAddress={campaign.creator} />
        </div>

        {/* Action sidebar column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card hoverEffect={false} className="flex flex-col gap-6 shadow-glow shadow-stellar-500/5">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Funding Target Progress
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-extrabold text-slate-100">
                  {formatXLM(campaign.currentAmount).split(' ')[0]}
                </span>
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  / {formatXLM(campaign.goalAmount)}
                </span>
              </div>
            </div>

            <ProgressBar progress={progress} color={isFunded ? 'emerald' : 'stellar'} />

            {/* Campaign metadata grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-glass-border/30 py-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Time Left</span>
                <span className="font-extrabold text-slate-200">{timeLeft}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Milestones count</span>
                <span className="font-bold text-slate-300">{campaign.milestoneCount} steps</span>
              </div>
            </div>

            {/* Pledge inputs or actions */}
            {campaign.status === 'Active' && !hasEnded && (
              <DonationForm campaignId={campaign.id} campaignTitle={campaign.title} />
            )}

            {eligibleForRefund && (
              <div className="flex flex-col gap-3 mt-2 bg-aurora-pink/5 border border-aurora-pink/20 p-4 rounded-xl text-xs text-aurora-pink">
                <p className="leading-relaxed">
                  This campaign failed to reach its target goal by the deadline. If you participated as a donor, you are entitled to claim a refund of your locked XLM balance.
                </p>
                <Button
                  variant="danger"
                  onClick={() => refundMutation.mutate()}
                  isLoading={refundMutation.isPending}
                  className="w-full text-xs py-2 bg-danger-gradient"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin-slow" />
                  Claim My Refund
                </Button>
              </div>
            )}

            {hasEnded && isFunded && (
              <div className="bg-aurora-emerald/5 border border-aurora-emerald/20 p-4 rounded-xl text-xs text-aurora-emerald text-center font-bold">
                Campaign successfully funded! Milestones are locked in escrow.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
