import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';
import { useCampaignStore } from '@/store/campaignStore';
import { useNotification } from '@/contexts/NotificationContext';
import { useWallet } from '@/hooks/useWallet';

export function useDonate() {
  const queryClient = useQueryClient();
  const notify = useNotification();
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);
  const { signTransaction } = useWallet();

  return useMutation({
    mutationFn: async ({
      campaignId,
      amount,
      donorAddress,
    }: {
      campaignId: string;
      amount: string;
      donorAddress: string;
    }) => {
      return await contractService.donate(campaignId, amount, donorAddress, signTransaction);
    },
    onSuccess: (txHash, variables) => {
      notify.success(`Donation successful! Tx: ${txHash.slice(0, 10)}...`);
      
      // Update local store immediately for instant UX feedback
      const donationStroops = BigInt(Math.floor(Number(variables.amount) * 10000000));
      const campaigns = useCampaignStore.getState().campaigns;
      const campaign = campaigns.find((c) => c.id === variables.campaignId);
      
      if (campaign) {
        const nextAmount = campaign.currentAmount + donationStroops;
        const status = nextAmount >= campaign.goalAmount ? 'Funded' : 'Active';
        updateCampaign(variables.campaignId, {
          currentAmount: nextAmount,
          status,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.campaignId, variables.donorAddress] });
    },
    onError: (error: any) => {
      notify.error(`Donation failed: ${error.message || error}`);
    },
  });
}

export default useDonate;
