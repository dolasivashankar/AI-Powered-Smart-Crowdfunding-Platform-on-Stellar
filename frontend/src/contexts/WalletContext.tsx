import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  xBullModule,
  AlbedoModule,
  LobstrModule,
} from '@creit.tech/stellar-wallets-kit';
import { useWalletStore } from '@/store/walletStore';
import { parseWalletError } from '@/utils/errors';
import type { WalletError } from '@/types';

interface WalletContextType {
  kit: StellarWalletsKit | null;
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
  getAddress: () => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const store = useWalletStore();

  useEffect(() => {
    const kitInstance = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
        new LobstrModule(),
      ],
    });
    setKit(kitInstance);

    if (store.isConnected && store.address) {
      store.setConnected(store.address);
    }
  }, []);

  const connect = async (walletId: string = FREIGHTER_ID) => {
    if (!kit) return;
    store.setLoading(true);
    store.clearError();

    try {
      kit.setWallet(walletId);

      const result = await kit.getAddress();
      const address =
        typeof result === 'string' ? result : (result as { address: string }).address;

      if (!address) throw new Error('No address returned from wallet.');

      store.setConnected(address);

      // Fetch balance from Horizon
      try {
        const horizonUrl =
          import.meta.env.VITE_STELLAR_HORIZON_URL ||
          'https://horizon-testnet.stellar.org';
        const res = await fetch(`${horizonUrl}/accounts/${address}`);
        if (res.ok) {
          const account = await res.json();
          const native = account.balances?.find(
            (b: { asset_type: string; balance: string }) => b.asset_type === 'native'
          );
          store.setBalance(native ? native.balance : '0.00');
        } else {
          store.setBalance('0.00');
        }
      } catch {
        store.setBalance('0.00');
      }
    } catch (error: unknown) {
      console.error('Wallet connection failed:', error);
      store.setError(parseWalletError(error) as WalletError);
    } finally {
      store.setLoading(false);
    }
  };

  const disconnect = async () => {
    store.setLoading(true);
    try {
      store.setDisconnected();
    } catch (e) {
      console.error(e);
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Signs an XDR transaction using the selected wallet module via the kit's
   * official `signTransaction` method (which is always available after kit v1.x).
   */
  const signTransaction = async (xdr: string): Promise<string> => {
    if (!kit) throw new Error('Wallet kit not initialized');
    store.setLoading(true);
    try {
      const networkPassphrase =
        import.meta.env.VITE_STELLAR_PASSPHRASE ||
        'Test SDF Network ; September 2015';

      const result = await kit.signTransaction(xdr, {
        networkPassphrase,
      });

      // kit.signTransaction returns { signedTxXdr, signerAddress? }
      return result.signedTxXdr;
    } catch (error: unknown) {
      store.setError(parseWalletError(error) as WalletError);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const getAddress = async (): Promise<string> => {
    if (!kit) throw new Error('Wallet kit not initialized');
    const result = await kit.getAddress();
    return typeof result === 'string'
      ? result
      : (result as { address: string }).address;
  };

  return (
    <WalletContext.Provider value={{ kit, connect, disconnect, signTransaction, getAddress }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
