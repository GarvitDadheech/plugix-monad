# Plugix-POC

### Execution Layer for AI Agents (Powered by USDC)

Plugix-POC is a working prototype of the Plugix execution layer — enabling **AI agents to autonomously discover, pay for, and execute APIs** using **USDC on Monad**.

This POC demonstrates how API calls can become **real-time, programmable financial transactions**, eliminating API keys, subscriptions, and manual billing.

---

## What This POC Demonstrates

* **Pay-per-use APIs** using USDC (no subscriptions)
* **HTTP-native payments (x402)** embedded directly in request flow
* **Agent-compatible execution** (no human intervention)
* **Programmable escrow-like payment validation**
* **End-to-end flow: Prompt → API → Payment → Response**

---

## Demo Video

Watch the Plugix-POC in action: [https://drive.google.com/file/d/1RgjwolP7M4rYapJSvi-raDQozVbogh9g/view?usp=sharing](https://drive.google.com/file/d/1RgjwolP7M4rYapJSvi-raDQozVbogh9g/view?usp=sharing)

### What the demo shows:

* AI agent initiating a request
* Receiving a `402 Payment Required` response
* Paying in **USDC**
* Retrying the request automatically
* Getting the final response
* No API keys, no manual billing

---

## Why Plugix?

AI agents today can think and generate — but they **cannot execute**.

Every API requires:

* Accounts
* API keys
* Billing setup

This breaks autonomy.

**Plugix fixes this by turning APIs into financial primitives.**

Instead of:

> Authenticate → Call API

We move to:

> Pay → Execute → Verify

---

## How It Works

### Flow Overview

```
Client / Agent        Plugix API Layer         Monad
      |                     |                    |
      |---- API Request --->|                    |
      |                     |                    |
      |<--- 402 (Price) ----|                    |
      |                     |                    |
      |---- Pay USDC ------>|------------------->|
      |                     |                    |
      |<--- tx hash --------|                    |
      |                     |                    |
      |---- Retry Request -->|                   |
      |                     |--- Verify Tx ----->|
      |                     |<-- Confirmed ------|
      |                     |                    |
      |<--- Response -------|                    |
```

---

## Example Use Case

A user asks an AI agent:

> "Generate a blog post about black holes"

Flow:

1. Agent calls `/api/ai/generate`
2. Receives `402 Payment Required` (price in USDC)
3. Pays instantly
4. Retries request with proof of payment
5. Receives generated response

**No signup. No API key. No billing dashboard.**

---

## API Endpoints

### Paid Endpoints

* `POST /api/ai/generate` — AI text generation (0.02 USDC)
* `GET /api/weather` — Weather data (0.01 USDC)
* `GET /api/crypto-price` — Crypto prices (0.02 USDC)

### Public Endpoints

* `GET /health`
* `GET /dashboard/metrics`

---

## Payment Model (x402 + USDC)

* Payment triggered via `402 Payment Required`
* Client pays using **USDC on Monad**
* Middleware verifies:

  * Transaction confirmation
  * Correct token + amount
  * Receiver address
  * Reference binding (prevents replay)
* Only then request is executed

---

## Architecture

* `packages/sdk/` → x402 payment middleware
* `apps/api/` → API server with paid endpoints
* `apps/web/` → Demo UI + dashboard

---

## Tech Stack

| Layer      | Tech            |
| ---------- | --------------- |
| Language   | TypeScript      |
| Backend    | Express         |
| Frontend   | Next.js + React |
| Blockchain | Monad (EVM)     |
| Payments   | x402 Protocol   |
| Token      | USDC (ERC-20)   |

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Setup `.env`

```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
RECEIVER_ADDRESS=0x<your_wallet>

PORT=4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

PAYER_PRIVATE_KEY=0x<payer_private_key>
TOKEN_ADDRESS=0x<usdc_token_address_on_monad>

AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=...
```

### 3. Run

```bash
npm run dev
```

* API → http://localhost:4000
* Web → http://localhost:3000

### 4. Test

Go to `/demo`:

* Enter prompt
* Click Generate
* Pay in USDC
* Get response

---

## Security Notes

* Demo uses a local wallet private key (not production-safe)
* Replay protection is in-memory
* Use proper wallet + DB in production

---

## Roadmap

* MCP-native API marketplace
* Smart escrow layer (on-chain)
* Agent SDK for autonomous execution
* Multi-chain payments
* Developer monetization layer

---

## Vision

Plugix aims to become the **default execution and payment layer for AI agents**.

Web2 had API marketplaces.
Humans had app stores.
**AI agents will have Plugix.**

---

## Team

**Shubh Kesharwani**
**Garvit Dadheech**

---

**Plugix — Plug in. Execute anything.**
