import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CampaignCard } from './CampaignCard';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Search, SlidersHorizontal, Info } from 'lucide-react';
import type { Campaign, CampaignStatus } from '@/types';

interface CampaignGridProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({ campaigns, isLoading }) => {
  const [filter, setFilter] = useState<CampaignStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories: (CampaignStatus | 'All')[] = ['All', 'Active', 'Funded', 'Closed', 'Refunded'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-full bg-slate-800/40 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters and Search toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-glass-border/80 hover:border-slate-700 focus:border-stellar-500 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-stellar-500 transition-all"
          />
        </div>

        {/* Filters Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                filter === cat
                  ? 'bg-stellar-600/20 border border-stellar-500/40 text-stellar-200 shadow-sm'
                  : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 rounded-2xl border border-glass-border/30 text-center gap-3">
          <Info className="w-10 h-10 text-slate-600" />
          <div>
            <h4 className="font-bold text-slate-300">No campaigns found</h4>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or filters.</p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCampaigns.map((camp) => (
            <motion.div key={camp.id} variants={item}>
              <CampaignCard campaign={camp} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CampaignGrid;
