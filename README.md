# Plugix — AI Agent Execution Layer

Plugix is the execution and payment layer for AI agents. Agents discover, pay for, and call APIs autonomously using **embedded wallets on Monad** — no API keys, no subscriptions, no human approval required.

---

## Architecture

```
plugix-monad/
├── apps/
│   └── web/                        # Next.js 15 dashboard (App Router)
│       ├── app/
│       │   ├── (marketing)/        # Public landing page (/)
│       │   ├── (app)/              # Auth-gated app shell w/ sidebar
│       │   │   ├── dashboard/      # Wallet, stats, recent calls
│       │   │   ├── publish/        # Publish & manage APIs
│       │   │   └── marketplace/    # Browse public API listings
│       │   ├── docs/mcp/           # MCP integration docs (public)
│       │   └── api/                # Next.js API routes
│       │       ├── user/init/      # POST — register user in DB
│       │       ├── user/enable-server-signing/
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
│       │   ├── auth.ts             # verifyAuthToken helper
│       │   ├── payments.ts         # executePaidApiCallOnChain (TODO: wire Privy signer)
│       │   ├── utils.ts
│       │   └── queries/            # Typed DB helpers (users, apis, api-calls)
│       └── db/
│           └── schema.sql          # CREATE TABLE statements
│
├── packages/
│   ├── sdk/                        # x402 payment middleware
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
| Blockchain  | Monad EVM testnet                 |
| Payments    | x402 + Privy signer (on-chain)    |

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Setup environment

Copy and fill in the env file for the web app:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id     # From privy.io dashboard
PRIVY_APP_SECRET=your-privy-app-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/plugix
MCP_CALLBACK_SECRET=some-secret-for-mcp-webhook
NEXT_PUBLIC_CHAIN=monad-testnet
```

### 3. Start Postgres via Docker

```bash
docker compose up -d
```

This starts a Postgres 16 container on port 5432, auto-runs `apps/web/db/schema.sql`
on first boot, and persists data in a named volume.

```bash
# Stop
docker compose down

# Reset (wipe all data)
docker compose down -v
```

### 4. Run

```bash
npm run dev:web   # Web → http://localhost:3000
```

---

## Key Flows

### Auth + Onboarding
1. User visits `/` → clicks "Sign In with Privy"
2. Privy creates an **embedded EVM wallet** (non-custodial, key in secure enclave)
3. Frontend calls `POST /api/user/init` to register in Postgres
4. Dashboard prompts user to enable **server-side signing** (one-time)

### Server-Side Signing (Privy Signers)
- User enables signing via the dashboard dialog
- Backend calls Privy's signer API to configure access to the user's embedded wallet
- From this point, our server can execute on-chain txs on behalf of the user **without popups**
- Private key **never** leaves Privy's secure infrastructure
- See `lib/payments.ts` for the integration hook point (TODO comments)

### MCP → Payment Flow
```
Agent (Claude)
  → MCP tool: execute_api_call { apiId }
  → MCP server calls target API endpoint
  → MCP server: POST /api/mcp/callback
  → Backend: inserts api_call row
  → Backend: calls executePaidApiCallOnChain (Privy signer)
  → On-chain tx settled on Monad
  → Response returned to agent
```

---

## API Reference

| Method | Route                              | Auth          | Description                       |
|--------|------------------------------------|---------------|-----------------------------------|
| POST   | `/api/user/init`                   | Privy Bearer  | Upsert user (privy_user_id + wallet) |
| POST   | `/api/user/enable-server-signing`  | Privy Bearer  | Enable Privy server-side signer   |
| GET    | `/api/apis`                        | Public        | List all public APIs              |
| POST   | `/api/apis`                        | Privy Bearer  | Publish a new API                 |
| GET    | `/api/stats`                       | Privy Bearer  | Per-user spend analytics          |
| POST   | `/api/mcp/callback`                | MCP secret    | Log an API call from MCP server   |

---

## Team

**Shubh Kesharwani** · **Garvit Dadheech**

---

**Plugix — Plug in. Execute anything.**
