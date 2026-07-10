import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, User, Award, Activity, ShieldCheck } from 'lucide-react';
import { classNames } from '@/utils/format';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/campaigns', label: 'Campaigns', icon: Compass },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 h-full bg-slate-950/80 border-r border-glass-border/40 flex flex-col justify-between py-6 px-4 backdrop-blur-lg">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-button-gradient flex items-center justify-center shadow-glow shadow-stellar-500/20">
            <Award className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stellar-300 via-stellar-100 to-aurora-cyan text-base tracking-wide">
              StellarFlow AI
            </h1>
            <span className="text-[10px] text-stellar-400 font-semibold tracking-widest uppercase">
              Orange Belt
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border',
                  isActive
                    ? 'bg-stellar-600/10 border-stellar-500/30 text-stellar-200'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin Section */}
        <div className="border-t border-glass-border/30 pt-3">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-4 mb-1.5">Administration</p>
          <nav className="flex flex-col gap-1.5">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border',
                    isActive
                      ? 'bg-aurora-purple/10 border-aurora-purple/30 text-aurora-purple'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="border-t border-glass-border/30 pt-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 px-3">
          <Activity className="w-4 h-4 text-aurora-emerald animate-pulse-slow" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Network Status
            </span>
            <span className="text-xs text-slate-200 font-medium">Stellar Testnet</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
