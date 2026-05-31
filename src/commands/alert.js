import { getEthPrice, formatPrice } from '../services/coingecko.js';
import { createAlert, getUserAlerts } from '../services/alerts.js';

/**
 * @param {import('discord.js').Message} message
 * @param {string[]} args
 */
export async function handleAlert(message, args) {
  const priceArg = args[0];

  if (!priceArg) {
    const active = await getUserAlerts(message.author.id);
    if (active.length === 0) {
      await message.reply(
        'No active alerts. Set one with `!alert 3500` to get notified when ETH hits that price.',
      );
      return;
    }

    const list = active
      .map((a) => `• ${formatPrice(a.targetPrice)} (${a.direction}) — \`${a.id}\``)
      .join('\n');

    await message.reply(`**Your active alerts:**\n${list}`);
    return;
  }

  const targetPrice = parseFloat(priceArg.replace(/[$,]/g, ''));
  if (Number.isNaN(targetPrice) || targetPrice <= 0) {
    await message.reply('Please provide a valid price, e.g. `!alert 3500`');
    return;
  }

  const { price: currentPrice } = await getEthPrice();
  const alert = await createAlert(message.author.id, message.channel.id, targetPrice, currentPrice);

  const directionText = alert.direction === 'above' ? 'rises to or above' : 'falls to or below';

  await message.reply(
    [
      '**Price alert set** 🔔',
      `I'll notify you when ETH ${directionText} **${formatPrice(targetPrice)}**.`,
      `Current price: ${formatPrice(currentPrice)}`,
    ].join('\n'),
  );
}
