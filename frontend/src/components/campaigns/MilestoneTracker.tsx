import React from 'react';
import { useSubmitMilestone, useApproveMilestone, useGetMilestones } from '@/hooks/useMilestones';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatXLM } from '@/utils/format';
import { ShieldCheck, ArrowUpRight, HelpCircle, Loader2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface MilestoneTrackerProps {
  campaignId: string;
  creatorAddress: string;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ campaignId, creatorAddress }) => {
  const { data: milestones, isLoading } = useGetMilestones(campaignId);
  const { isConnected, address } = useWallet();
  const { mutate: submitMilestone, isPending: isSubmitting } = useSubmitMilestone();
  const { mutate: approveMilestone, isPending: isApproving } = useApproveMilestone();
  const notify = useNotification();

  const isCreator = isConnected && address === creatorAddress;
  // Simple check: first user is admin for demo/mock simplicity
  const isAdmin = isConnected;

  const handleSubmit = (index: number) => {
    if (!address) return;
    submitMilestone({ campaignId, index, creatorAddress: address });
  };

  const handleApprove = (index: number) => {
    if (!address) return;
    approveMilestone({ campaignId, index, adminAddress: address });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-stellar-400" />
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-900/20 border border-glass-border/30 rounded-xl">
        <p className="text-xs text-slate-500">No milestones registered for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-glass-border/40 pb-3">
        <h4 className="text-sm font-bold text-slate-200">Milestone Funding Timeline</h4>
        <span className="text-[10px] text-slate-500 uppercase font-semibold">
          {milestones.length} Steps
        </span>
      </div>

      <div className="relative border-l border-glass-border pl-6 ml-3 flex flex-col gap-6">
        {milestones.map((m, idx) => {
          const isReleased = m.approved;
          const isPendingReview = m.submitted && !m.approved;
          const isWaiting = !m.submitted && !m.approved;

          return (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 ${
                  isReleased
                    ? 'bg-aurora-emerald border-aurora-emerald/30 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : isPendingReview
                    ? 'bg-aurora-amber border-aurora-amber/30 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-950 border-glass-border'
                }`}
              />

              <div className="flex flex-col gap-2 p-4 bg-slate-900/40 border border-glass-border rounded-2xl group-hover:border-stellar-500/20 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{m.title || `Milestone ${m.index}`}</h5>
                    <p className="text-[10px] text-slate-400 mt-1">{m.description}</p>
                  </div>
                  <Badge variant={isReleased ? 'success' : isPendingReview ? 'warning' : 'default'}>
                    {isReleased ? 'Released' : isPendingReview ? 'Under Review' : 'Locked'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-glass-border/30 pt-3 mt-1.5">
                  <div className="text-[10px]">
                    <span className="text-slate-500 uppercase font-semibold block">Target Release</span>
                    <span className="font-extrabold text-stellar-300">{formatXLM(m.targetAmount)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isWaiting && isCreator && (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={isSubmitting}
                        onClick={() => handleSubmit(m.index)}
                        className="text-[10px] py-1 h-7"
                      >
                        Submit Proof
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}

                    {isPendingReview && isAdmin && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isApproving}
                        onClick={() => handleApprove(m.index)}
                        className="text-[10px] py-1 h-7 bg-success-gradient"
                      >
                        Approve Release
                        <ShieldCheck className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}

                    {isReleased && (
                      <span className="text-[10px] text-aurora-emerald font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Funds Disbursed
                      </span>
                    )}

                    {isWaiting && !isCreator && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Awaiting Delivery
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTracker;
