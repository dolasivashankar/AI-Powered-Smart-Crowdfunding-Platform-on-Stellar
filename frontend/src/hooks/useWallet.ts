import { useWalletContext } from '@/contexts/WalletContext';
import { useWalletStore } from '@/store/walletStore';

export function useWallet() {
  const { connect, disconnect, signTransaction, getAddress } = useWalletContext();
  const store = useWalletStore();

  return {
    isConnected: store.isConnected,
    address: store.address,
    balance: store.balance,
    isLoading: store.isLoading,
    error: store.error,
    network: store.network,
    connect,
    disconnect,
    signTransaction,
    getAddress,
    clearError: store.clearError,
  };
}

export default useWallet;
