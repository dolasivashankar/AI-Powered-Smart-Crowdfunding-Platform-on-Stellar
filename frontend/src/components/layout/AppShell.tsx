import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WalletModal } from '../wallet/WalletModal';

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-[#06060f] text-slate-100 overflow-hidden font-sans bg-hero-gradient bg-no-repeat bg-cover">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full"
            >
              <Sidebar onClose={closeMobileMenu} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header onToggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Wallet modal manager */}
      <WalletModal />
    </div>
  );
};

export default AppShell;
