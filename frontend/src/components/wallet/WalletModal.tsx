import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Modal } from '../ui/Modal';
import { WalletErrorMessages } from '@/utils/errors';
import { Wallet, Info } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { connect, isLoading, error, clearError } = useWallet();

  useEffect(() => {
    const handleOpen = () => {
      clearError();
      setIsOpen(true);
    };
    window.addEventListener('open-wallet-modal', handleOpen);
    return () => window.removeEventListener('open-wallet-modal', handleOpen);
  }, [clearError]);

  const handleConnect = async () => {
    await connect();
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Connect Wallet"
    >
      <div className="flex flex-col gap-4">
        <p className="text-slate-400 text-xs leading-relaxed">
          Connect your Stellar Freighter wallet browser extension to view your dashboard, create crowdfunding campaigns, or pledge tokens to secure escrow campaigns.
        </p>

        {error && (
          <div className="bg-aurora-pink/10 border border-aurora-pink/20 rounded-xl p-3 flex gap-2 text-xs text-aurora-pink">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{WalletErrorMessages[error] || 'Connection error occurred.'}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center justify-between w-full p-4 bg-slate-950/60 border border-glass-border/60 hover:border-stellar-500/50 hover:bg-slate-950 rounded-2xl transition-all duration-300 group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-button-gradient flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-slate-200 group-hover:text-stellar-300 transition-colors">
                Freighter Wallet
              </h4>
              <span className="text-[10px] text-slate-500 font-semibold block">
                Official Stellar Extension (Recommended)
              </span>
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-aurora-emerald" />
        </button>

        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noreferrer"
          className="text-center text-xs text-stellar-400 hover:text-stellar-300 font-medium mt-1 underline"
        >
          Install Freighter Extension
        </a>
      </div>
    </Modal>
  );
};

export default WalletModal;
