const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const money = (n) => (n == null ? '—' : usd.format(n));
export const signedMoney = (n) => (n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${usd.format(Math.abs(n))}`);
export const pct = (n) => (n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}%`);
export const num = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 4 }));
