# Plugix — AI Agent Execution Layer

Plugix is the execution and payment layer for AI agents. Agents discover, pay for, and call APIs autonomously using **embedded wallets on Monad** — no API keys, no subscriptions, no human approval required.

Payments are settled in **USDC on Monad Devnet** (chain ID 10143).

---

## Architecture

```
plugix-monad/
├── apps/
│   └── web/                        # Next.js 15 dashboard (App Router)
│       ├── app/
│       │   ├── (marketing)/        # Public landing page (/)
│       │   ├── (app)/              # Auth-gated app shell w/ sidebar
│       │   │   ├── dashboard/      # Stats, recent calls, published APIs
│       │   │   ├── publish/        # Publish & manage APIs
│       │   │   └── marketplace/    # Browse public API listings
│       │   ├── docs/mcp/           # MCP integration docs (public)
│       │   └── api/                # Next.js API routes
│       │       ├── user/init/      # POST — upsert user + auto-enable signing
│       │       ├── apis/           # GET list / POST create
│       │       ├── stats/          # GET per-user analytics
│       │       └── mcp/callback/   # POST — called by MCP server
│       ├── components/
│       │   ├── ui/                 # shadcn/ui components
│       │   ├── providers.tsx       # PrivyProvider wrapper
│       │   ├── auth-gate.tsx       # Client-side auth redirect
│       │   ├── sidebar.tsx
│       │   └── topbar.tsx
│       ├── lib/
│       │   ├── db.ts               # pg Pool
│       │   ├── privy.ts            # Privy server client
│       │   ├── auth.ts             # getAuthUser — verifies token + auto-upserts user
│       │   ├── payments.ts         # executePaidApiCallOnChain (Privy signer)
│       │   ├── utils.ts
│       │   └── queries/            # Typed DB helpers (users, apis, api-calls)
│       └── db/
│           └── schema.sql          # CREATE TABLE statements
│
├── packages/
│   ├── sdk/                        # x402 USDC payment middleware (Express)
│   ├── mcp/                        # MCP server (Plugix tool definitions)
│   └── client/                     # x402 client library
```

---

## Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | Next.js 15 (App Router), React 19 |
| Styling     | Tailwind CSS v3 + shadcn/ui       |
| Auth        | Privy (`@privy-io/react-auth`)    |
| Wallet      | Privy embedded wallets            |
| Server auth | Privy server SDK + signers        |
| Database    | Postgres (node-postgres `pg`)     |
| Blockchain  | **Monad Devnet** (chain ID 10143) |
| Payments    | USDC via x402 + Privy signer      |

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Setup environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
DATABASE_URL=postgresql://plugix:plugix@localhost:5433/plugix
MCP_CALLBACK_SECRET=some-secret-for-mcp-webhook
NEXT_PUBLIC_CHAIN=monad-devnet
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 3. Start Postgres via Docker

```bash
docker compose up -d
```

Starts Postgres 16 on port **5433**, auto-runs `apps/web/db/schema.sql` on first boot, and persists data in a named volume.

```bash
# Stop
docker compose down

# Reset (wipe all data)
docker compose down -v

# Inspect DB
docker exec -it plugix-db psql -U plugix -d plugix
```

### 4. Run

```bash
npm run dev:web   # Web → http://localhost:3000
```

---

## Key Flows

### Auth + Onboarding
1. User visits `/` → clicks "Get Started" → Privy login
2. Privy creates an **embedded EVM wallet** (non-custodial, key in secure enclave)
3. First authenticated request auto-creates the user in Postgres with **server-side signing enabled** — no separate init call required

### Server-Side Signing (Privy Signers)
- Enabled automatically on account creation via `upsertUser` in `lib/queries/users.ts`
- Backend can execute on-chain USDC transfers from the user's embedded wallet **without any popup**
- Private key **never** leaves Privy's secure infrastructure
- See `lib/payments.ts` for the Privy signer integration

### MCP → Payment Flow
```
Agent (Claude)
  → MCP tool: execute_api_call { apiId }
  → MCP server calls target API endpoint
  → MCP server: POST /api/mcp/callback
  → Backend: inserts api_call row
  → Backend: calls executePaidApiCallOnChain (Privy signer)
  → USDC transfer settled on Monad Devnet
  → Response returned to agent
```

### API Publisher Flow
1. Developer wraps their Express endpoint with `paymentMiddleware` from `packages/sdk`
2. Publishes the endpoint URL + USDC price to the Plugix marketplace
3. AI agents discover it via MCP, pay per call in USDC — zero billing setup

---

## API Reference

| Method | Route                   | Auth         | Description                          |
|--------|-------------------------|--------------|--------------------------------------|
| POST   | `/api/user/init`        | Privy Bearer | Upsert user (auto-enables signing)   |
| GET    | `/api/apis`             | Public       | List all public APIs                 |
| POST   | `/api/apis`             | Privy Bearer | Publish a new API                    |
| GET    | `/api/stats`            | Privy Bearer | Per-user spend analytics             |
| POST   | `/api/mcp/callback`     | MCP secret   | Log an API call from MCP server      |

---

## Chain

All payments use **USDC on Monad Devnet**.

- Chain ID: `10143`
- CAIP-2: `eip155:10143`
- Explorer: `devnet.monadexplorer.com`
- USDC contract: `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea`

---

## Team

**Shubh Kesharwani** · **Garvit Dadheech**

---

**Plugix — Plug in. Execute anything.**
