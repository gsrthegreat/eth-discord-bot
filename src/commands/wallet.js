import { getEthPrice, formatPrice } from '../services/coingecko.js';
import { getWalletInfo, isValidEthAddress } from '../services/etherscan.js';

/**
 * @param {import('discord.js').Message} message
 * @param {string[]} args
 */
export async function handleWallet(message, args) {
  if (!process.env.ETHERSCAN_API_KEY?.trim()) {
    await message.reply(
      'Wallet lookups require an **Etherscan API key**. Add `ETHERSCAN_API_KEY` to your `.env` file (free at https://etherscan.io/apis).',
    );
    return;
  }

  const address = args[0];
  if (!address) {
    await message.reply('Please provide a wallet address, e.g. `!wallet 0x1234...abcd`');
    return;
  }

  if (!isValidEthAddress(address)) {
    await message.reply('Invalid Ethereum address. Must be a 42-character hex string starting with `0x`.');
    return;
  }

  const [{ balanceEth, txCount }, { price }] = await Promise.all([
    getWalletInfo(address),
    getEthPrice(),
  ]);

  const usdValue = balanceEth * price;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  await message.reply(
    [
      `**Wallet** \`${shortAddress}\``,
      `**Balance:** ${balanceEth.toFixed(6)} ETH (${formatPrice(usdValue)})`,
      `**Transactions:** ${txCount.toLocaleString('en-US')}`,
      `[View on Etherscan](https://etherscan.io/address/${address})`,
    ].join('\n'),
  );
}
