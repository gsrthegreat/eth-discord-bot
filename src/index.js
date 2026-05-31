import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { handleEth } from './commands/eth.js';
import { handleGas } from './commands/gas.js';
import { handleAlert } from './commands/alert.js';
import { handleWallet } from './commands/wallet.js';
import { getEthPrice, formatPrice } from './services/coingecko.js';
import { checkAlerts } from './services/alerts.js';

const PREFIX = process.env.COMMAND_PREFIX || '!';
const ALERT_POLL_MS = 60_000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

/** @type {Record<string, (message: import('discord.js').Message, args: string[]) => Promise<void>>} */
const commands = {
  eth: (message) => handleEth(message),
  gas: (message) => handleGas(message),
  alert: (message, args) => handleAlert(message, args),
  wallet: (message, args) => handleWallet(message, args),
  help: async (message) => {
    await message.reply(
      [
        '**ETH Tracker Bot** — Commands',
        `\`${PREFIX}eth\` — Current Ethereum price, 24h change, and market cap`,
        `\`${PREFIX}gas\` — Current gas prices (low / average / high)`,
        `\`${PREFIX}alert <price>\` — Set a price alert (e.g. \`${PREFIX}alert 3500\`)`,
        `\`${PREFIX}alert\` — List your active alerts`,
        `\`${PREFIX}wallet <address>\` — Check an Ethereum wallet balance`,
        `\`${PREFIX}help\` — Show this message`,
      ].join('\n'),
    );
  },
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
  startAlertPoller();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const withoutPrefix = message.content.slice(PREFIX.length).trim();
  const [commandName, ...args] = withoutPrefix.split(/\s+/);
  const handler = commands[commandName.toLowerCase()];

  if (!handler) return;

  try {
    await handler(message, args);
  } catch (err) {
    console.error(`Error handling !${commandName}:`, err);
    await message.reply('Something went wrong fetching that data. Try again in a moment.');
  }
});

function startAlertPoller() {
  setInterval(async () => {
    try {
      const { price } = await getEthPrice();
      const triggered = await checkAlerts(price);

      for (const alert of triggered) {
        const channel = await client.channels.fetch(alert.channelId).catch(() => null);
        if (!channel?.isTextBased()) continue;

        await channel.send(
          `<@${alert.userId}> 🔔 **ETH price alert triggered!**\n` +
            `ETH is now **${formatPrice(price)}** (target: **${formatPrice(alert.targetPrice)}**).`,
        );
      }
    } catch (err) {
      console.error('Alert poll error:', err);
    }
  }, ALERT_POLL_MS);
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in .env — copy .env.example to .env and add your bot token.');
  process.exit(1);
}

client.login(token);
