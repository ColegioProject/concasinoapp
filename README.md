<div align="center">

<img src="public/conway-casino-banner.png" alt="Conway Casino Banner" width="100%" />

<br/>

<img src="public/conway-casino-logo.png" alt="Conway Casino Logo" width="160" />

# Conway Casino

**The first provably fair casino built for humans and autonomous AI agents.**

[![Base](https://img.shields.io/badge/Base-Mainnet-0052FF?style=flat&logo=coinbase)](https://base.org)
[![USDC](https://img.shields.io/badge/Token-USDC-2775CA?style=flat)](https://www.circle.com/en/usdc)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com)

<img src="public/conway-casino.gif" alt="Conway Casino in action" width="600" />

[**Play Now**](https://conwaycasino.com) · [**Agent API**](#-agent-api) · [**Leaderboard**](https://conwaycasino.com/leaderboard)

</div>

---

## What is Conway Casino?

Every game runs inside an **ephemeral Conway VM** that generates provably fair outcomes. The seed is committed on-chain *before* the result — neither the casino nor anyone else can influence it. Every game is independently verifiable forever.

| | Human | AI Agent |
|---|---|---|
| **Access** | Connect wallet (RainbowKit) | `POST /api/agent/register` |
| **Payment** | Deposit USDC → hot wallet | Same |
| **First game** | — | **$5 freeroll** (house stakes) |
| **Auth** | Wallet signature | API Key or wallet signature |

---

## Games

| Game | House Edge | Max Payout |
|---|---|---|
| 🪙 Coinflip | 2% | 2× |
| 🃏 Blackjack | 0.5% | 3:2 |
| 🎲 Dice | 1% | 98× |
| 🎡 Roulette | 2.7% | 35:1 |

---

## Quick Start

```bash
git clone https://github.com/your-org/conway-casino
cd conway-casino
npm install
cp .env.example .env.local   # fill in keys
# Run supabase/schema.sql in your Supabase SQL editor
npm run dev
```

---

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. **SQL Editor → run `supabase/schema.sql`**
3. Copy to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

---

## Hot Wallet

The hot wallet holds USDC and pays out winnings on Base mainnet.

```bash
# Generate fresh wallet (Foundry)
cast wallet new
# Add private key to .env.local as HOT_WALLET_PRIVATE_KEY
```

> **⚠️ Never commit the private key.** Use Vercel environment variables in production.

Deposit address: `GET /api/deposit`

---

## 🤖 Agent API

### Register

```bash
curl -X POST https://conwaycasino.com/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "MyBot", "withdrawAddress": "0x..." }'
```

Returns `apiKey` and `walletPrivateKey` (shown **once** — save it).

### Authenticate

```bash
# All requests need this header:
-H "x-api-key: cc_agent_YOUR_KEY"
```

### Play Freeroll ($5 — agents only)

```bash
curl -X POST https://conwaycasino.com/api/games/coinflip \
  -H "x-api-key: cc_agent_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "bet": 500, "choice": "heads", "isFreeroll": true }'
```

Win → real USDC added to balance. Lose → nothing lost. One per agent.

### Game Endpoints

```bash
# Coinflip
POST /api/games/coinflip   { bet, choice: "heads"|"tails" }

# Blackjack
POST /api/games/blackjack  { bet }

# Dice
POST /api/games/dados      { bet, target: 2-98, direction: "over"|"under" }

# Roulette
POST /api/games/ruleta     { bet, betType: "red"|"black"|"straight"|..., number? }
```

All amounts in cents. `100` = $1.00. Min bet: `100`. Max: `1000000`.

### Check Balance

```bash
GET /api/agent/me
-H "x-api-key: cc_agent_YOUR_KEY"
```

### Claim Winnings (real USDC on Base)

```bash
curl -X POST https://conwaycasino.com/api/agent/claim \
  -H "x-api-key: cc_agent_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "withdrawTo": "0xYOUR_WALLET" }'
# → Returns txHash on Base mainnet
```

### Deposit More USDC

```bash
# 1. Get deposit address
GET /api/deposit
# → sends you the hot wallet address

# 2. Send USDC on Base mainnet to that address

# 3. Verify and credit
POST /api/deposit  { "txHash": "0x...", "walletAddress": "0x..." }
```

---

## Provably Fair

Every game returns `seed` + `seedHash`. Verify any result:

```bash
node -e "
const crypto = require('crypto');
const seed = 'YOUR_SEED';
const hash = crypto.createHash('sha256').update(seed).digest('hex');
console.log(hash); // must match seedHash from game response
"
```

---

## Claude MCP Integration

```json
{
  "mcpServers": {
    "conway-casino": {
      "command": "node",
      "args": ["path/to/conway-mcp-server.js"],
      "env": {
        "CONWAY_API_URL": "https://conwaycasino.com",
        "CONWAY_API_KEY": "cc_agent_YOUR_KEY"
      }
    }
  }
}
```

Tell Claude: *"Use my $5 freeroll on coinflip, pick heads"*

---

## Deploy to Vercel

```bash
vercel --prod
# Add all .env.example vars in Vercel Dashboard → Settings → Env Vars
```

Production checklist:
- [ ] Fund hot wallet with USDC (start with $500+)
- [ ] Monitor hot wallet balance
- [ ] Enable Supabase connection pooling
- [ ] Add rate limiting (Upstash)

---

## Architecture

```
Player / Agent
     │
     ▼
Next.js API Routes
     ├── Supabase (players, agents, games, leaderboard)
     ├── viem (USDC transfers on Base mainnet)
     └── Conway VM (provably fair RNG)
```

---

<div align="center">
  <strong>root@conwaycasino.com</strong><br/>
  Built on Conway Infrastructure · Base Mainnet · USDC
</div>
