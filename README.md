# ETH Discord Bot

A lightweight Discord bot for tracking Ethereum — live price, gas fees, wallet balances, and custom price alerts.

## Bot Invite

https://discord.com/oauth2/authorize?client_id=1507741096774729808&permissions=2048&integration_type=0&scope=bot

## Commands

| Command | Description |
|---------|-------------|
| `!eth` | ETH price, 24h change, market cap |
| `!gas` | Gas prices (low / average / high) |
| `!alert 3500` | Alert when ETH hits a target price |
| `!wallet 0x...` | Wallet balance and USD value |
| `!help` | List all commands |

## Quick start

```bash
npm install
copy .env.example .env   # Windows — use cp on macOS/Linux
```

Add your keys to `.env`:

```env
DISCORD_TOKEN=your_discord_bot_token
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Discord:** Create a bot at the [Developer Portal](https://discord.com/developers/applications), enable **Message Content Intent**, and invite it to your server.

**Etherscan:** Free API key at [etherscan.io/apis](https://etherscan.io/apis) — required for `!gas` and `!wallet`. `!eth` and `!alert` use CoinGecko and need no extra key.

```bash
npm start
```

## Stack

- [discord.js](https://discord.js.org/) — Discord API
- [CoinGecko](https://www.coingecko.com/) — price data
- [Etherscan API V2](https://docs.etherscan.io/) — gas and wallet lookups

## License

MIT
