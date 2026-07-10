import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contractService';
import { useNotification } from '@/contexts/NotificationContext';

export function useGetMilestones(campaignId: string) {
  return useQuery({
    queryKey: ['milestones', campaignId],
    queryFn: () => contractService.getMilestones(campaignId),
    enabled: !!campaignId,
    staleTime: 10000,
  });
}

export function useSubmitMilestone() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: async ({
      campaignId,
      index,
      creatorAddress,
    }: {
      campaignId: string;
      index: number;
      creatorAddress: string;
    }) => {
      return await contractService.submitMilestone(campaignId, index, creatorAddress);
    },
    onSuccess: (txHash, variables) => {
      notify.success(`Milestone ${variables.index} submitted for review.`);
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.campaignId] });
    },
    onError: (error: any) => {
      notify.error(`Milestone submission failed: ${error.message || error}`);
    },
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  const notify = useNotification();

  return useMutation({
    mutationFn: async ({
      campaignId,
      index,
      adminAddress,
    }: {
      campaignId: string;
      index: number;
      adminAddress: string;
    }) => {
      return await contractService.approveMilestone(campaignId, index, adminAddress);
    },
    onSuccess: (txHash, variables) => {
      notify.success(`Milestone ${variables.index} approved. Funds released!`);
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
    },
    onError: (error: any) => {
      notify.error(`Approval failed: ${error.message || error}`);
    },
  });
}
