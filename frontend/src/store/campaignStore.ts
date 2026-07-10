import { create } from 'zustand';
import type { Campaign } from '@/types';

interface CampaignStore {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  setCampaigns: (campaigns: Campaign[]) => void;
  selectCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  setCampaigns: (campaigns) => set({ campaigns }),
  selectCampaign: (selectedCampaign) => set({ selectedCampaign }),
  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  updateCampaign: (id, updates) => set((state) => {
    const updated = state.campaigns.map((c) => c.id === id ? { ...c, ...updates } : c);
    const selected = state.selectedCampaign && state.selectedCampaign.id === id
      ? { ...state.selectedCampaign, ...updates }
      : state.selectedCampaign;
    return { campaigns: updated, selectedCampaign: selected };
  }),
}));
