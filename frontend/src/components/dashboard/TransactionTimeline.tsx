import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowUpRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Transaction } from '@/types';

export const TransactionTimeline: React.FC = () => {
  // Mock transaction list for premium dashboard UI aesthetics
  const txs: Transaction[] = [
    {
      id: 'tx1',
      hash: '5c00a...231fe',
      type: 'Donation Locked',
      status: 'success',
      amount: '50.00 XLM',
      timestamp: Math.floor(Date.now() / 1000) - 1800,
    },
    {
      id: 'tx2',
      hash: 'bf89d...ee23b',
      type: 'Milestone Submitted',
      status: 'success',
      timestamp: Math.floor(Date.now() / 1000) - 7200,
    },
    {
      id: 'tx3',
      hash: '8f7a9...3b21c',
      type: 'Campaign Created',
      status: 'success',
      timestamp: Math.floor(Date.now() / 1000) - 86400,
    },
  ];

  return (
    <Card hoverEffect={false} className="flex flex-col gap-4 shadow-glow shadow-stellar-500/5">
      <div>
        <h4 className="text-sm font-bold text-slate-200">Transaction History</h4>
        <p className="text-[10px] text-slate-500 font-semibold uppercase">Pending & confirmed ledger actions</p>
      </div>

      <div className="flex flex-col gap-4">
        {txs.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs border-b border-glass-border/20 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-glass-border">
                <ArrowUpRight className="w-4 h-4 text-stellar-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">{tx.type}</span>
                <span className="font-mono text-[10px] text-slate-500 mt-0.5">Hash: {tx.hash}</span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
              {tx.amount && <span className="font-extrabold text-slate-200">{tx.amount}</span>}
              <div className="flex items-center gap-1 text-[10px] font-semibold text-aurora-emerald">
                <CheckCircle className="w-3.5 h-3.5 text-aurora-emerald" />
                Confirmed
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TransactionTimeline;
