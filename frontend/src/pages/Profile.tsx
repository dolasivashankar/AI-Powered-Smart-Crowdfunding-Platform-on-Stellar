import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatAddress } from '@/utils/format';
import { User, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Profile: React.FC = () => {
  const { isConnected, address, balance, connect, disconnect, network } = useWallet();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Wallet Node Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review your connected identity credentials and ledger configuration.
        </p>
      </div>

      <Card hoverEffect={false} className="flex flex-col gap-6 shadow-glow shadow-stellar-500/5">
        {!isConnected || !address ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
            <User className="w-12 h-12 text-slate-600" />
            <div>
              <h4 className="font-bold text-slate-300">Wallet disconnected</h4>
              <p className="text-xs text-slate-500">Connect your browser extension to view your node profile.</p>
            </div>
            <Button onClick={() => connect()} className="w-full sm:w-auto">
              Connect Freighter
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Wallet Info Header */}
            <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-glass-border/40 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-button-gradient flex items-center justify-center text-white shrink-0 shadow-lg">
                <User className="w-6 h-6" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Connected Wallet Node
                </span>
                <span className="text-sm font-mono text-slate-200 font-medium truncate max-w-md select-all">
                  {address}
                </span>
              </div>
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900/40 border border-glass-border rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 uppercase font-semibold block">Node Network</span>
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-pulse" />
                  Stellar {network}
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 border border-glass-border rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 uppercase font-semibold block">Total Node Balance</span>
                <span className="font-extrabold text-stellar-300 font-mono text-sm">
                  {balance ? `${Number(balance).toLocaleString()} XLM` : '0.00 XLM'}
                </span>
              </div>
            </div>

            {/* Platform links */}
            <div className="flex flex-col gap-3.5 border-t border-glass-border/30 pt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Explorer links
              </h4>

              <a
                href={`https://stellar.expert/explorer/testnet/account/${address}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-glass-border/40 hover:border-stellar-500/30 hover:bg-slate-950 rounded-xl transition-all text-xs text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-stellar-400" />
                  Account Ledger on Stellar.expert
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href="https://laboratory.stellar.org/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-glass-border/40 hover:border-stellar-500/30 hover:bg-slate-950 rounded-xl transition-all text-xs text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-aurora-amber" />
                  Stellar Laboratory RPC console
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>

            {/* Logout button */}
            <div className="flex justify-end border-t border-glass-border/20 pt-4 mt-2">
              <Button variant="danger" onClick={() => disconnect()}>
                Disconnect Profile
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
