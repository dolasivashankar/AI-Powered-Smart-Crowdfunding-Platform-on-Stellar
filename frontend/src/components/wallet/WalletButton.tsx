import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Copy, LogOut, ExternalLink, Check, ChevronDown } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useNotification } from '@/contexts/NotificationContext';
import { formatAddress } from '@/utils/format';
import { Button } from '../ui/Button';

export const WalletButton: React.FC = () => {
  const { isConnected, address, balance, disconnect } = useWallet();
  const notify = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      notify.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = () => {
    // Dispatch event to open modal
    const event = new CustomEvent('open-wallet-modal');
    window.dispatchEvent(event);
  };

  if (!isConnected || !address) {
    return (
      <Button
        variant="primary"
        onClick={openModal}
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  const formattedBal = balance
    ? `${Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`
    : '0.00 XLM';

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 px-4 py-2"
      >
        <div className="w-2 h-2 rounded-full bg-aurora-emerald animate-pulse shadow-glow shadow-aurora-emerald/50" />
        <span className="text-slate-300 font-mono text-xs hidden sm:inline">
          {formatAddress(address)}
        </span>
        <span className="text-stellar-300 text-xs font-semibold">
          {formattedBal}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </Button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-glass-border/80 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-glass-border mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Wallet Address
            </span>
            <span className="text-xs font-mono text-slate-300 break-all select-all">
              {address}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5" />
              Copy Address
            </span>
            {copied ? <Check className="w-3.5 h-3.5 text-aurora-emerald" /> : null}
          </button>

          <a
            href={`https://stellar.expert/explorer/testnet/account/${address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on Explorer
          </a>

          <button
            onClick={() => {
              disconnect();
              setDropdownOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-aurora-pink hover:bg-aurora-pink/5 hover:text-white transition-colors border-t border-glass-border/30 mt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
