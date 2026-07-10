import { rpc as SorobanRpc } from '@stellar/stellar-sdk';
import { getNetworkConfig } from '@/utils/stellar';
import type { StellarEvent } from '@/types';

class EventStreamService {
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastLedger: number = 0;
  private callbacks: Map<string, (event: StellarEvent) => void> = new Map();
  private networkConfig = getNetworkConfig();
  private server: SorobanRpc.Server;

  constructor() {
    this.server = new SorobanRpc.Server(this.networkConfig.rpcUrl);
  }

  private hasContracts(): boolean {
    return (
      !!import.meta.env.VITE_CAMPAIGN_CONTRACT_ID &&
      import.meta.env.VITE_CAMPAIGN_CONTRACT_ID.startsWith('C') &&
      import.meta.env.VITE_CAMPAIGN_CONTRACT_ID.length === 56
    );
  }

  start(contractIds: string[]): void {
    if (this.pollInterval) return;

    const intervalTime = Number(import.meta.env.VITE_EVENT_POLL_INTERVAL_MS) || 3000;

    this.pollInterval = setInterval(() => {
      this.poll(contractIds);
    }, intervalTime);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  subscribe(id: string, callback: (event: StellarEvent) => void): void {
    this.callbacks.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.callbacks.delete(id);
  }

  private async poll(contractIds: string[]): Promise<void> {
    if (!this.hasContracts()) {
      // Simulation mode
      const mockEvents = localStorage.getItem('stellarflow_mock_events');
      if (mockEvents) {
        try {
          const events: StellarEvent[] = JSON.parse(mockEvents);
          events.forEach((event) => {
            this.callbacks.forEach((cb) => cb(event));
          });
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    try {
      // Real Stellar RPC Event Polling
      const latestLedgerResponse = await this.server.getLatestLedger();
      const currentLedger = latestLedgerResponse.sequence;

      if (this.lastLedger === 0) {
        this.lastLedger = currentLedger - 10;
      }

      if (this.lastLedger >= currentLedger) return;

      const eventsResponse = await this.server.getEvents({
        startLedger: this.lastLedger,
        filters: contractIds.map((cid) => ({
          contractIds: [cid],
        })),
        limit: 10,
      });

      this.lastLedger = currentLedger;

      eventsResponse.events.forEach((rawEvent: SorobanRpc.Api.EventResponse) => {
        const parsed = this.parseEvent(rawEvent);
        if (parsed) {
          this.callbacks.forEach((cb) => cb(parsed));
        }
      });
    } catch (error) {
      console.warn('Stellar RPC event polling error:', error);
    }
  }

  private parseEvent(raw: SorobanRpc.Api.EventResponse): StellarEvent | null {
    try {
      const topics = raw.topic.map((t: { toString(): string }) => t.toString());
      const value = raw.value.toString();

      let eventType = 'Unknown';
      if (topics.includes('campaign') && topics.includes('created')) {
        eventType = 'CampaignCreated';
      } else if (topics.includes('donation') && topics.includes('received')) {
        eventType = 'DonationReceived';
      } else if (topics.includes('escrow') && topics.includes('locked')) {
        eventType = 'EscrowLocked';
      } else if (topics.includes('milestone') && topics.includes('released')) {
        eventType = 'MilestoneReleased';
      } else if (topics.includes('escrow') && topics.includes('refunded')) {
        eventType = 'RefundIssued';
      } else if (topics.includes('campaign') && topics.includes('closed')) {
        eventType = 'CampaignClosed';
      }

      if (eventType === 'Unknown') return null;

      return {
        id: raw.id,
        type: eventType as StellarEvent['type'],
        campaignId: topics[2] || undefined,
        data: { value, topics },
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch (e) {
      console.error('Failed to parse raw event:', e);
      return null;
    }
  }
}

export const eventStreamService = new EventStreamService();
export default eventStreamService;
