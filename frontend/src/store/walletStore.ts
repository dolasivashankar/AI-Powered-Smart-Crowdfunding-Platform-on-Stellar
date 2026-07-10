import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletState, WalletError } from '@/types';

interface WalletStore extends WalletState {
  setConnected: (address: string) => void;
  setDisconnected: () => void;
  setBalance: (balance: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: WalletError | null) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null,
      network: 'TESTNET',
      balance: null,
      isLoading: false,
      error: null,
      setConnected: (address) => set({ isConnected: true, address, error: null }),
      setDisconnected: () => set({ isConnected: false, address: null, balance: null, error: null }),
      setBalance: (balance) => set({ balance }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'wallet-store',
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        network: state.network,
      }),
    }
  )
);
