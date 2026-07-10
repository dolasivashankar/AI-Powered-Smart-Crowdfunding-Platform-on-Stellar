import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import { WalletButton } from '../wallet/WalletButton';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="h-16 bg-slate-950/60 border-b border-glass-border/40 flex items-center justify-between px-6 backdrop-blur-lg sticky top-0 z-40">
      {/* Mobile Hamburger */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Breadcrumb / Title area */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-aurora-cyan animate-pulse shadow-glow shadow-aurora-cyan/50" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Secure Multi-Contract Escrow Node
        </span>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-4">
        {/* Network Badge */}
        <div className="bg-slate-900 border border-glass-border/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-300 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-pulse-slow" />
          Testnet
        </div>

        {/* Wallet Connector */}
        <WalletButton />
      </div>
    </header>
  );
};

export default Header;
