import type { WalletError } from '@/types';

export const WalletErrorMessages: Record<WalletError, string> = {
  NOT_INSTALLED: 'Freighter Wallet extension is not installed.',
  LOCKED: 'Freighter Wallet is locked. Please unlock it to continue.',
  REJECTED: 'Transaction was rejected/canceled in the wallet.',
  INSUFFICIENT_BALANCE: 'Your wallet has insufficient XLM balance for this action.',
  INVALID_ADDRESS: 'The selected wallet address is invalid.',
  NETWORK_UNAVAILABLE: 'Could not connect to the Stellar Testnet RPC server.',
  UNKNOWN: 'An unknown wallet error occurred.',
};

export function parseContractError(error: any): string {
  if (!error) return 'Unknown contract execution failure.';
  const message = error.message || String(error);
  if (message.includes('Host error') || message.includes('Error(')) {
    // Attempt to extract contract status/error code
    const match = message.match(/Error\(Contract,\s*(\d+)\)/) || message.match(/status\s+(\d+)/);
    if (match && match[1]) {
      const code = Number(match[1]);
      switch (code) {
        case 1: return 'Campaign or resource not found.';
        case 2: return 'Campaign or resource already exists.';
        case 3: return 'Campaign funding goal has already been reached.';
        case 4: return 'Unauthorized. You do not have permission for this action.';
        case 5: return 'Invalid input values provided.';
        case 6: return 'Campaign deadline has passed or action expired.';
        case 7: return 'Campaign goal was not funded.';
        case 8: return 'Milestone already approved.';
        case 9: return 'Milestone already submitted.';
        default: return `Contract execution failed with error code: ${code}`;
      }
    }
  }
  return message;
}

export function parseWalletError(error: any): WalletError {
  const msg = String(error.message || error).toLowerCase();
  if (msg.includes('user reject') || msg.includes('user cancel') || msg.includes('declined')) {
    return 'REJECTED';
  }
  if (msg.includes('install') || msg.includes('not found') || msg.includes('extension')) {
    return 'NOT_INSTALLED';
  }
  if (msg.includes('lock') || msg.includes('login') || msg.includes('unlock')) {
    return 'LOCKED';
  }
  if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('underfunded')) {
    return 'INSUFFICIENT_BALANCE';
  }
  if (msg.includes('address') || msg.includes('public key')) {
    return 'INVALID_ADDRESS';
  }
  if (msg.includes('network') || msg.includes('rpc') || msg.includes('horizon')) {
    return 'NETWORK_UNAVAILABLE';
  }
  return 'UNKNOWN';
}

export function isUserRejection(error: any): boolean {
  return parseWalletError(error) === 'REJECTED';
}

export function isNetworkError(error: any): boolean {
  return parseWalletError(error) === 'NETWORK_UNAVAILABLE';
}
