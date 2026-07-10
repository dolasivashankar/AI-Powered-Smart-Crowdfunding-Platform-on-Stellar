import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default admin password hash (SHA-256 of "Admin@1234")
// Change this after first login
const DEFAULT_PASSWORD_HASH = 'admin@stellarflow';

interface AdminState {
  adminWalletAddress: string;
  passwordHash: string;
  isAdminLoggedIn: boolean;
  transfersEnabled: boolean;
  totalTransferred: number;

  // Actions
  login: (password: string) => boolean;
  logout: () => void;
  setAdminWalletAddress: (address: string, password: string) => boolean;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  toggleTransfers: (enabled: boolean) => void;
  recordTransfer: (amount: number) => void;
  checkPassword: (password: string) => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      adminWalletAddress: '',
      passwordHash: DEFAULT_PASSWORD_HASH,
      isAdminLoggedIn: false,
      transfersEnabled: true,
      totalTransferred: 0,

      checkPassword: (password: string) => {
        return password === get().passwordHash;
      },

      login: (password: string) => {
        const valid = get().checkPassword(password);
        if (valid) {
          set({ isAdminLoggedIn: true });
        }
        return valid;
      },

      logout: () => {
        set({ isAdminLoggedIn: false });
      },

      setAdminWalletAddress: (address: string, password: string) => {
        const valid = get().checkPassword(password);
        if (valid) {
          set({ adminWalletAddress: address });
          return true;
        }
        return false;
      },

      changePassword: (oldPassword: string, newPassword: string) => {
        const valid = get().checkPassword(oldPassword);
        if (valid && newPassword.length >= 8) {
          set({ passwordHash: newPassword });
          return true;
        }
        return false;
      },

      toggleTransfers: (enabled: boolean) => {
        set({ transfersEnabled: enabled });
      },

      recordTransfer: (amount: number) => {
        set((state) => ({ totalTransferred: state.totalTransferred + amount }));
      },
    }),
    {
      name: 'stellarflow-admin-config',
    }
  )
);
