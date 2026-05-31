import {
  getEthPrice,
  formatPrice,
  formatChange,
  formatMarketCap,
} from '../services/coingecko.js';

/**
 * @param {import('discord.js').Message} message
 */
export async function handleEth(message) {
  const { price, change24h, marketCap } = await getEthPrice();

  await message.reply(
    [
      `**Ethereum Price:** ${formatPrice(price)}`,
      `**24h Change:** ${formatChange(change24h)}`,
      `**Market Cap:** ${formatMarketCap(marketCap)}`,
    ].join('\n'),
  );
}
