import React from 'react';
import { CampaignGrid } from '@/components/campaigns/CampaignGrid';
import { useGetCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Compass } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const { data: campaigns, isLoading } = useGetCampaigns();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-stellar-400" />
            Explore Crowdfunding Campaigns
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse through active projects seeking backing or view historical funded campaigns.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/create')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      {/* Grid listing */}
      <CampaignGrid campaigns={campaigns || []} isLoading={isLoading} />
    </div>
  );
};

export default Campaigns;
