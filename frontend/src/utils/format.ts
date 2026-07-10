export function formatXLM(amount: bigint | string | number): string {
  const stroops = BigInt(amount);
  const xlmValue = Number(stroops) / 10000000;
  return xlmValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }) + ' XLM';
}

export function parseXLM(xlm: string): bigint {
  const cleanXlm = xlm.replace(/[^\d.]/g, '');
  if (!cleanXlm) return 0n;
  const parts = cleanXlm.split('.');
  const integerPart = parts[0];
  let fractionalPart = parts[1] || '';
  fractionalPart = fractionalPart.padEnd(7, '0').slice(0, 7);
  return BigInt(integerPart + fractionalPart);
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address || '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeLeft(deadline: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  return `${hours}h left`;
}

export function formatPercent(current: bigint | string | number, goal: bigint | string | number): number {
  const c = Number(current);
  const g = Number(goal);
  if (g <= 0) return 0;
  const percent = (c / g) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
