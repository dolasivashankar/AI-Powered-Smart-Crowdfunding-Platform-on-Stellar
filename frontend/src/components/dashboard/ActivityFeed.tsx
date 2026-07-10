import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useEventStore } from '@/store/eventStore';
import { formatAddress, formatXLM } from '@/utils/format';
import { Activity, Plus, Heart, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { useEventStream } from '@/hooks/useEventStream';

export const ActivityFeed: React.FC = () => {
  // Triggers streaming poller hook to feed eventStore automatically
  useEventStream();
  const events = useEventStore((s) => s.events);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CampaignCreated':
        return <Plus className="w-4 h-4 text-aurora-cyan" />;
      case 'DonationReceived':
      case 'EscrowLocked':
        return <Heart className="w-4 h-4 text-aurora-pink" />;
      case 'MilestoneReleased':
        return <ShieldAlert className="w-4 h-4 text-aurora-emerald" />;
      case 'RefundIssued':
        return <RefreshCw className="w-4 h-4 text-aurora-amber" />;
      case 'CampaignClosed':
        return <Check className="w-4 h-4 text-slate-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventMessage = (evt: any) => {
    const data = evt.data || {};
    switch (evt.type) {
      case 'CampaignCreated':
        return (
          <span className="text-slate-300">
            New Campaign <strong className="text-stellar-200">#{evt.campaignId || data.id}</strong> deployed by{' '}
            <code className="text-slate-400 text-xs font-mono">{formatAddress(data.creator || '')}</code>
          </span>
        );
      case 'DonationReceived':
      case 'EscrowLocked':
        return (
          <span className="text-slate-300">
            Pledge of <strong className="text-aurora-pink">{formatXLM(data.amount || '0')}</strong> locked in Escrow
            by <code className="text-slate-400 text-xs font-mono">{formatAddress(data.donor || '')}</code>
          </span>
        );
      case 'MilestoneReleased':
        return (
          <span className="text-slate-300">
            Milestone approved. Released <strong className="text-aurora-emerald">{formatXLM(data.amount || '0')}</strong> from Escrow.
          </span>
        );
      case 'RefundIssued':
        return (
          <span className="text-slate-300">
            Escrow release failed. Refunded <strong className="text-aurora-amber">{formatXLM(data.amount || '0')}</strong> back to donor.
          </span>
        );
      case 'CampaignClosed':
        return <span className="text-slate-300">Campaign closed.</span>;
      default:
        return <span className="text-slate-300">Unknown event triggered.</span>;
    }
  };

  return (
    <Card hoverEffect={false} className="flex flex-col gap-4 shadow-glow shadow-aurora-cyan/5 max-h-[380px] overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between border-b border-glass-border pb-3">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-stellar-400 animate-pulse" />
          Real-Time Event Stream
        </h4>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Live feed (no refresh)
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-1">
          <span className="text-xs">Listening for Stellar on-chain events...</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
            Friendbot blocks polling
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {events.map((evt, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs border-b border-glass-border/10 pb-2.5 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-glass-border/60 flex items-center justify-center shrink-0">
                  {getEventIcon(evt.type)}
                </div>
                <div className="flex flex-col">
                  {getEventMessage(evt)}
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Badge variant="info" className="text-[9px] tracking-tighter shrink-0">
                {evt.type}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
