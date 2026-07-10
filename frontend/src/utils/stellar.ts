export function getNetworkConfig() {
  return {
    network: import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET',
    rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    horizonUrl: import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    networkPassphrase: import.meta.env.VITE_STELLAR_PASSPHRASE || 'Test SDF Network ; September 2015',
  };
}

export function isValidStellarAddress(address: string): boolean {
  if (!address) return false;
  // Simple check for G... (public key) or C... (contract key) format, length 56
  return /^[GC][A-Z2-7]{55}$/.test(address);
}

export function xlmToStroops(xlm: string): bigint {
  const clean = xlm.replace(/[^\d.]/g, '');
  if (!clean) return 0n;
  const parts = clean.split('.');
  const intPart = parts[0];
  let fracPart = parts[1] || '';
  fracPart = fracPart.padEnd(7, '0').slice(0, 7);
  return BigInt(intPart + fracPart);
}

export function stroopsToXlm(stroops: bigint | string | number): string {
  const s = BigInt(stroops);
  const val = Number(s) / 10000000;
  return val.toFixed(7);
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function daysToTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
}
