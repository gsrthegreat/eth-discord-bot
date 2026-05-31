import { getGasPrices } from '../services/etherscan.js';

/**
 * @param {import('discord.js').Message} message
 */
export async function handleGas(message) {
  if (!process.env.ETHERSCAN_API_KEY?.trim()) {
    await message.reply(
      'Gas tracking requires an **Etherscan API key**. Add `ETHERSCAN_API_KEY` to your `.env` file (free at https://etherscan.io/apis).',
    );
    return;
  }

  const gas = await getGasPrices();

  await message.reply(
    [
      '**Ethereum Gas Prices** ⛽',
      `**Low:** ${gas.low} gwei`,
      `**Average:** ${gas.average} gwei`,
      `**High:** ${gas.high} gwei`,
    ].join('\n'),
  );
}
