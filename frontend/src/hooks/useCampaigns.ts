import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';
import { useCampaignStore } from '@/store/campaignStore';
import { useNotification } from '@/contexts/NotificationContext';
import type { CreateCampaignParams } from '@/types';
import { useEffect } from 'react';

export function useGetCampaigns() {
  const setCampaigns = useCampaignStore((s) => s.setCampaigns);

  const query = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => contractService.listCampaigns(),
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) {
      setCampaigns(query.data);
    }
  }, [query.data, setCampaigns]);

  return query;
}

export function useGetCampaign(id: string) {
  const selectCampaign = useCampaignStore((s) => s.selectCampaign);

  const query = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => contractService.getCampaign(id),
    staleTime: 10000,
  });

  useEffect(() => {
    if (query.data) {
      selectCampaign(query.data);
    }
  }, [query.data, selectCampaign]);

  return query;
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const notify = useNotification();
  const addCampaign = useCampaignStore((s) => s.addCampaign);

  return useMutation({
    mutationFn: async ({
      params,
      creatorAddress,
      signTx,
    }: {
      params: CreateCampaignParams;
      creatorAddress: string;
      signTx: (xdr: string) => Promise<string>;
    }) => {
      return await contractService.createCampaign(params, creatorAddress, signTx);
    },
    onSuccess: (newCampaignId, variables) => {
      notify.success('Campaign successfully deployed to Stellar blockchain!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      // Construct a local update structure for responsive UI
      const mockCampaign = {
        id: newCampaignId,
        creator: variables.creatorAddress,
        title: variables.params.title,
        description: variables.params.description,
        goalAmount: BigInt(Math.floor(Number(variables.params.goalAmount) * 10000000)),
        currentAmount: 0n,
        deadline: Math.floor(Date.now() / 1000) + (Number(variables.params.deadline) * 24 * 3600),
        status: 'Active' as const,
        milestoneCount: variables.params.milestoneCount,
        createdAt: Math.floor(Date.now() / 1000),
      };
      addCampaign(mockCampaign);
    },
    onError: (error: any) => {
      notify.error(`Deployment failed: ${error.message || error}`);
    },
  });
}
