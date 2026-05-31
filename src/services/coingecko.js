const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * @returns {Promise<{ price: number, change24h: number, marketCap: number }>}
 */
export async function getEthPrice() {
  const url = new URL(`${COINGECKO_BASE}/simple/price`);
  url.searchParams.set('ids', 'ethereum');
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');
  url.searchParams.set('include_market_cap', 'true');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko request failed (${res.status})`);
  }

  const data = await res.json();
  const eth = data.ethereum;
  if (!eth) {
    throw new Error('Unexpected CoinGecko response');
  }

  return {
    price: eth.usd,
    change24h: eth.usd_24h_change ?? 0,
    marketCap: eth.usd_market_cap ?? 0,
  };
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatMarketCap(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${Math.round(value / 1e9)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString('en-US')}`;
}

/**
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * @param {number} change
 * @returns {string}
 */
export function formatChange(change) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
