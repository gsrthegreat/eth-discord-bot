const ETHERSCAN_BASE = 'https://api.etherscan.io/v2/api';
const ETHEREUM_CHAIN_ID = '1';

function getApiKey() {
  return process.env.ETHERSCAN_API_KEY?.trim() || '';
}

async function etherscanRequest(params) {
  const apiKey = getApiKey();
  const url = new URL(ETHERSCAN_BASE);
  url.searchParams.set('chainid', ETHEREUM_CHAIN_ID);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  if (apiKey) {
    url.searchParams.set('apikey', apiKey);
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Etherscan request failed (${res.status})`);
  }

  const data = await res.json();
  if (data.status === '0' && data.message !== 'OK') {
    throw new Error(data.result || data.message || 'Etherscan API error');
  }

  return data.result;
}

/**
 * @returns {Promise<{ low: number, average: number, high: number }>}
 */
export async function getGasPrices() {
  const result = await etherscanRequest({
    module: 'gastracker',
    action: 'gasoracle',
  });

  return {
    low: Number(result.SafeGasPrice),
    average: Number(result.ProposeGasPrice),
    high: Number(result.FastGasPrice),
  };
}

/**
 * @param {string} address
 * @returns {Promise<{ balanceEth: number, txCount: number }>}
 */
export async function getWalletInfo(address) {
  const [balanceWei, txCount] = await Promise.all([
    etherscanRequest({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
    }),
    etherscanRequest({
      module: 'proxy',
      action: 'eth_getTransactionCount',
      address,
      tag: 'latest',
    }),
  ]);

  const balanceEth = Number(balanceWei) / 1e18;
  const nonce = typeof txCount === 'string' ? parseInt(txCount, 16) : Number(txCount);

  return {
    balanceEth,
    txCount: nonce,
  };
}

/**
 * @param {string} address
 * @returns {boolean}
 */
export function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
