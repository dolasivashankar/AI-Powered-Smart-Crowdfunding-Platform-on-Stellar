import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Cpu, ArrowRight, Activity, Coins, Heart } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05050d] text-slate-100 font-sans overflow-x-hidden relative flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-hero-gradient bg-no-repeat bg-cover pointer-events-none opacity-80" />

      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-button-gradient flex items-center justify-center shadow-glow shadow-stellar-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-100 text-lg tracking-wide">
              StellarFlow AI
            </h1>
            <span className="text-[9px] text-stellar-400 font-bold uppercase tracking-widest block">
              Orange Belt Node
            </span>
          </div>
        </div>

        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Launch App
        </Button>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-stellar-600/10 border border-stellar-500/20 rounded-full text-xs font-semibold text-stellar-300"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Powered by Stellar Soroban smart contracts
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none"
        >
          AI-Powered Smart <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar-400 via-stellar-200 to-aurora-cyan">
            Crowdfunding & Escrow
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-sm max-w-xl leading-relaxed mt-2"
        >
          Launch campaigns instantly with OpenAI descriptions. Secure donor pledges in escrow, releasing funds only upon verified milestone execution. Fully decentralized and built on Stellar Testnet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6"
        >
          <Button variant="primary" size="lg" onClick={() => navigate('/create')} className="w-full sm:w-auto">
            Start Campaign
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/campaigns')} className="w-full sm:w-auto">
            Explore Campaigns
          </Button>
        </motion.div>
      </section>

      {/* Feature stats */}
      <section className="max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 border-t border-glass-border/30">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-stellar-500/10 flex items-center justify-center border border-stellar-500/20 shrink-0 text-stellar-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200">AI Description Engine</h4>
            <p className="text-xs text-slate-400 mt-1">Generate comprehensive markdown campaigns with customizable highlights automatically.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-aurora-cyan/10 flex items-center justify-center border border-aurora-cyan/20 shrink-0 text-aurora-cyan">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200">Milestone Escrows</h4>
            <p className="text-xs text-slate-400 mt-1">Funds are protected in lockups, released step-by-step only upon admin approval.</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-aurora-pink/10 flex items-center justify-center border border-aurora-pink/20 shrink-0 text-aurora-pink">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200">Low Network Fees</h4>
            <p className="text-xs text-slate-400 mt-1">Harness Stellar’s sub-cent transaction costs to ensure maximized direct funding.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border/30 py-8 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider relative z-10 bg-slate-950/40 backdrop-blur-md">
        Built with ❤️ for the Stellar Orange Belt Journey.
      </footer>
    </div>
  );
};

export default Landing;
