import React, { useState } from 'react';
import { useDonate } from '@/hooks/useDonation';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Coins, Heart, AlertCircle } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: () => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({ campaignId, campaignTitle, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const { isConnected, balance, connect, address } = useWallet();
  const { mutate: donate, isPending } = useDonate();
  const notify = useNotification();

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      notify.error('Please enter a valid donation amount.');
      return;
    }

    if (balance && Number(amount) > Number(balance)) {
      notify.error('Amount exceeds your wallet balance.');
      return;
    }

    donate(
      { campaignId, amount, donorAddress: address || '' },
      {
        onSuccess: () => {
          setAmount('');
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  const handleQuickSelect = (val: string) => {
    setAmount(val);
  };

  return (
    <form onSubmit={handleDonate} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Heart className="w-4 h-4 text-aurora-pink" />
          Back this campaign
        </h4>
        <p className="text-xs text-slate-400">
          Your donation goes directly into a secure smart contract escrow and is only released as milestones are completed.
        </p>
      </div>

      {!isConnected ? (
        <Button variant="primary" type="button" onClick={() => connect()} className="w-full">
          Connect Wallet to Donate
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Quick select presets */}
          <div className="flex gap-2 justify-between">
            {['10', '50', '100', '500'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickSelect(val)}
                className="flex-1 py-2 bg-slate-900/60 border border-glass-border hover:border-stellar-500/50 hover:bg-slate-950 rounded-xl text-xs text-slate-300 font-semibold transition-all"
              >
                +{val} XLM
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <Input
              type="number"
              placeholder="Amount in XLM"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="flex-1 font-mono text-sm"
              min="1"
              step="any"
              required
            />
            <Button
              type="submit"
              isLoading={isPending}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Coins className="w-4 h-4" />
              Pledge XLM
            </Button>
          </div>

          {/* Current balance helper */}
          {balance && (
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase px-1">
              <span>Your Balance</span>
              <span className="text-stellar-400 font-mono">{Number(balance).toFixed(2)} XLM</span>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default DonationForm;
