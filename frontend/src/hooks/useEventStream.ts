import { useEffect } from 'react';
import { eventStreamService } from '@/services/eventService';
import { useEventStore } from '@/store/eventStore';
import { useNotification } from '@/contexts/NotificationContext';
import type { StellarEvent } from '@/types';
import { formatXLM } from '@/utils/format';

export function useEventStream() {
  const addEvent = useEventStore((s) => s.addEvent);
  const events = useEventStore((s) => s.events);
  const notify = useNotification();

  useEffect(() => {
    // Collect contract addresses to poll
    const campaignId = import.meta.env.VITE_CAMPAIGN_CONTRACT_ID || '';
    const escrowId = import.meta.env.VITE_ESCROW_CONTRACT_ID || '';
    const milestoneId = import.meta.env.VITE_MILESTONE_CONTRACT_ID || '';

    const contractIds = [campaignId, escrowId, milestoneId].filter(Boolean);

    // Setup listener
    const listenerId = `hook_listener_${Date.now()}`;
    eventStreamService.subscribe(listenerId, (event: StellarEvent) => {
      // Add to store
      addEvent(event);

      // Trigger user-friendly live notifications for real-time visual popups
      switch (event.type) {
        case 'CampaignCreated':
          notify.info(`New campaign created: "${event.data.title || 'Untitled'}"`);
          break;
        case 'DonationReceived':
          notify.success(`Donation received! ${formatXLM(event.data.amount || '0')}`);
          break;
        case 'MilestoneReleased':
          notify.success(`Milestone released! Funds sent to campaign creator.`);
          break;
        case 'RefundIssued':
          notify.info(`Refund issued successfully.`);
          break;
        case 'CampaignClosed':
          notify.info(`Campaign closed.`);
          break;
        default:
          break;
      }
    });

    // Start polling
    eventStreamService.start(contractIds);

    // Cleanup
    return () => {
      eventStreamService.unsubscribe(listenerId);
      eventStreamService.stop();
    };
  }, [addEvent, notify]);

  return {
    events,
    latestEvent: events[0] || null,
  };
}

export default useEventStream;
