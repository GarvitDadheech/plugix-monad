"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Cpu,
  Globe,
  Wallet,
  Lock,
  CheckCircle2,
  TrendingUp,
  Code2,
  Activity,
  Terminal,
  Users,
} from "lucide-react";
import Image from "next/image";
import { BackgroundBeams } from "@/components/aceternity/background-beams";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onLogin, ready }: { onLogin: () => void; ready: boolean }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/55 px-5 py-3 backdrop-blur-xl backdrop-saturate-150">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" width={28} height={28} alt="Plugix" className="rounded-lg" />
            <span className="font-display text-sm font-bold tracking-tight text-white">
              Plugix
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            <a
              href="#features"
              className="text-sm text-white/45 hover:text-white/80 transition-colors"
            >
              Product
            </a>
            <a
              href="#developer"
              className="text-sm text-white/45 hover:text-white/80 transition-colors"
            >
              For Developers
            </a>
            <Link
              href="/docs/mcp"
              className="text-sm text-white/45 hover:text-white/80 transition-colors"
            >
              Docs
            </Link>
          </nav>

          {/* Single CTA */}
          <button
            onClick={onLogin}
            disabled={!ready}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.38)] disabled:opacity-40"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Agent Flow Visual ────────────────────────────────────────────────────────

function AgentFlowVisual() {
  return (
    <div className="relative w-full max-w-[390px] mx-auto animate-float">
      {/* Main card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#07070e] overflow-hidden shadow-2xl shadow-black/70">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.018] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/55" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/55" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/55" />
          </div>
          <span className="ml-2 text-[11px] font-mono text-white/20">
            agent.run() — plugix.xyz
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] text-white/20">executing</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Call log */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              Live execution log
            </p>
            <div className="space-y-2">
              {[
                { fn: "weather.current()", price: "0.002", done: true },
                { fn: "prices.fetch(ETH)", price: "0.005", done: true },
                { fn: "ai.generate_text(…)", price: "0.020", done: false },
              ].map(({ fn, price, done }, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-violet-400/40 border-t-violet-400 animate-spin" />
                    )}
                    <code className="text-[12px] font-mono text-white/55">{fn}</code>
                  </div>
                  <span className="text-[11px] font-mono text-violet-400">{price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow row */}
          <div className="rounded-xl border border-violet-500/[0.18] bg-violet-950/30 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/35">Escrow locked · tx confirmed</p>
                <p className="mt-1 text-[22px] font-bold tracking-tight text-white leading-none">
                  0.027{" "}
                  <span className="text-sm font-medium text-white/30">MON</span>
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10">
                <Shield className="h-4 w-4 text-violet-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -right-5 rounded-xl border border-white/[0.07] bg-[#07070e] px-3.5 py-2.5 shadow-xl">
        <p className="text-[10px] text-white/30">Total calls</p>
        <p className="text-[18px] font-bold text-white leading-none mt-0.5">12,847</p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-emerald-400">
          <TrendingUp className="h-2.5 w-2.5" /> +18% this week
        </p>
      </div>

      <div className="absolute -bottom-4 -left-5 rounded-xl border border-white/[0.07] bg-[#07070e] px-3.5 py-2.5 shadow-xl">
        <p className="text-[10px] text-white/30">Success rate</p>
        <p className="text-[18px] font-bold text-emerald-400 leading-none mt-0.5">99.4%</p>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onLogin, ready }: { onLogin: () => void; ready: boolean }) {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 px-5 overflow-hidden">
      <BackgroundBeams />

      <div className="relative z-10 mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-14 items-center">
        {/* Left: copy */}
        <div className="space-y-7">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.09] px-4 py-1.5 text-xs font-semibold text-violet-300 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            Live on Monad Devnet · Privy-powered
          </div>

          {/* H1 */}
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-[-0.035em] leading-[1.04] animate-fade-up delay-100">
            Give your AI agents
            <br />a wallet, a marketplace,
            <br />
            <span className="gradient-text">and a way to pay.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-white/45 leading-relaxed max-w-[430px] animate-fade-up delay-200">
            AI agents are powerful but broke. Plugix fixes that — a non-custodial
            payment layer built for the agentic internet, running on Monad.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap animate-fade-up delay-300">
            <button
              onClick={onLogin}
              disabled={!ready}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] disabled:opacity-40"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/docs/mcp"
              className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white/60 transition-all hover:text-white hover:bg-white/[0.07]"
            >
              View MCP Docs
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-5 animate-fade-up delay-500">
            {["Non-custodial", "Embedded wallets", "On-chain settlement"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-white/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right: visual */}
        <div className="hidden lg:flex justify-end animate-fade-up delay-200">
          <AgentFlowVisual />
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Monad Devnet",
  "Non-Custodial",
  "MCP Native",
  "Pay Per Request",
  "Privy Powered",
  "EVM Compatible",
  "Instant Settlement",
  "Agent Ready",
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/[0.04] bg-white/[0.01] py-4 select-none">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="h-1 w-1 rounded-full bg-violet-500/50" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/25">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Sign up in seconds",
    desc: "Login with email or Google. Privy provisions a non-custodial embedded wallet automatically — no extension, no seed phrase.",
    icon: Wallet,
  },
  {
    num: "02",
    title: "Authorize once",
    desc: "Grant one-time server-side signing permission. Plugix can then execute payments from your wallet without interrupting the agent.",
    icon: Lock,
  },
  {
    num: "03",
    title: "Publish or browse",
    desc: "Wrap any API endpoint and publish to the marketplace at a MON price, or browse existing APIs to use as a consumer.",
    icon: Globe,
  },
  {
    num: "04",
    title: "Connect your agent",
    desc: "Add the MCP config block to Claude Code. Your agent now discovers, pays for, and executes APIs — completely autonomously.",
    icon: Terminal,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-24">
      <div className="mb-14 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
          How it works
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] text-white leading-[1.1]">
          From sign-up to{" "}
          <span className="gradient-text">autonomous execution</span>
          <br />in four steps.
        </h2>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connector line — lg only */}
        <div className="absolute top-[22px] left-[12.5%] right-[12.5%] hidden lg:block h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

        {STEPS.map(({ num, title, desc, icon: Icon }) => (
          <div
            key={num}
            className="group relative rounded-2xl border border-white/[0.06] bg-[#07070e] p-6 hover:border-violet-500/25 transition-all duration-300"
          >
            <div className="relative z-10 mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
              <Icon className="h-5 w-5 text-violet-400" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                {num.slice(1)}
              </span>
            </div>
            <h3 className="font-display text-[15px] font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/38 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Feature Bento ────────────────────────────────────────────────────────────

function FeatureBento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="mb-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
          Platform
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] text-white max-w-lg leading-[1.1]">
          Everything the{" "}
          <span className="gradient-text">agentic economy</span>{" "}
          needs.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Row 1: wide + narrow */}
        <div className="md:col-span-2 group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 hover:bg-[#080818] transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
            <Wallet className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            Agent-native embedded wallets
          </h3>
          <p className="text-sm text-white/38 leading-relaxed max-w-sm">
            Every user gets a Privy embedded wallet — provisioned on login, secured in hardware
            enclaves, under their full control. Agents use it without ever seeing a private key.
          </p>
        </div>

        <div className="group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 hover:bg-[#080818] transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
            <Lock className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            On-chain escrow
          </h3>
          <p className="text-sm text-white/38 leading-relaxed">
            Funds lock per call. Success pays the provider. Failure refunds the agent. Disputes
            are structurally impossible.
          </p>
        </div>

        {/* Row 2: narrow + wide */}
        <div className="group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 hover:bg-[#080818] transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
            <Globe className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            API marketplace
          </h3>
          <p className="text-sm text-white/38 leading-relaxed">
            Publish any endpoint. Set a MON price. Earn per execution — no billing setup,
            no invoicing, no chasing payments.
          </p>
        </div>

        <div className="md:col-span-2 group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 hover:bg-[#080818] transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
            <Cpu className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            MCP-native integration
          </h3>
          <p className="text-sm text-white/38 leading-relaxed max-w-sm">
            One JSON config block. Any MCP-compatible agent — Claude Code included — can
            discover and pay for marketplace APIs without writing a line of payment code.
          </p>
        </div>

        {/* Row 3: accent wide + narrow */}
        <div className="md:col-span-2 group rounded-2xl border border-violet-500/[0.13] bg-gradient-to-br from-violet-950/35 to-[#07070e] p-7 hover:border-violet-500/25 hover:from-violet-950/50 transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/[0.10] group-hover:bg-violet-500/[0.18] transition-colors">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            Privy-powered auth
          </h3>
          <p className="text-sm text-white/38 leading-relaxed max-w-sm">
            Email, Google, or web3 login. Embedded wallets live in hardware enclaves.
            Server-side signing keeps agents in flow — no popups, no seed phrases, no
            extensions required.
          </p>
        </div>

        <div className="group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 hover:bg-[#080818] transition-all duration-300 cursor-default">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08] group-hover:bg-violet-500/[0.14] transition-colors">
            <Activity className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-white mb-2">
            Monad performance
          </h3>
          <p className="text-sm text-white/38 leading-relaxed">
            Parallel EVM. Sub-second settlement. Built for the throughput that agent-scale
            micro-transactions demand.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Developer Section ────────────────────────────────────────────────────────

const MCP_CONFIG = `{
  "mcpServers": {
    "plugix": {
      "command": "npx",
      "args": ["-y", "@plugix/mcp-server"],
      "env": {
        "PLUGIX_USER_ID": "did:privy:abc123",
        "PLUGIX_ENDPOINT": "https://api.plugix.xyz"
      }
    }
  }
}`;

function CodeLine({ line }: { line: string }) {
  const colonIdx = line.indexOf('":', line.indexOf('"') + 1);
  if (colonIdx !== -1 && line.trimStart().startsWith('"')) {
    const key = line.slice(0, colonIdx + 1);
    const rest = line.slice(colonIdx + 1);
    return (
      <div>
        <span className="text-sky-300/75">{key}</span>
        <span className="text-white/25">:</span>
        <span className="text-amber-300/70">{rest}</span>
      </div>
    );
  }
  if (/^\s*[{}\[\]],?\s*$/.test(line)) {
    return (
      <div>
        <span className="text-white/22">{line}</span>
      </div>
    );
  }
  return (
    <div>
      <span className="text-white/40">{line}</span>
    </div>
  );
}

const SDK_SNIPPET = `import { paymentMiddleware } from "@plugix/sdk";

// One middleware call — that's it
app.use(
  paymentMiddleware({
    routes: {
      "/api/weather": { price: "0.01", token: "MON" },
    },
    receiverAddress: process.env.RECEIVER_ADDRESS,
    rpcUrl: process.env.MONAD_RPC_URL,
    tokenAddress: process.env.TOKEN_ADDRESS,
  })
);

// Your existing route — completely unchanged
app.get("/api/weather", (_req, res) => {
  res.json({ temp: 24, condition: "Clear" });
});`;

function SdkLine({ line }: { line: string }) {
  if (line.startsWith("//")) {
    return <div><span className="text-white/25 italic">{line}</span></div>;
  }
  if (line.startsWith("import ")) {
    return (
      <div>
        <span className="text-violet-400">import </span>
        <span className="text-sky-300/80">{line.slice(7, line.indexOf(" from"))}</span>
        <span className="text-violet-400"> from </span>
        <span className="text-amber-300/75">{line.slice(line.indexOf(" from") + 6)}</span>
      </div>
    );
  }
  const keyMatch = line.match(/^(\s+)(\w+):/);
  if (keyMatch && keyMatch[1] != null && keyMatch[2] != null) {
    const indent = keyMatch[1];
    const key = keyMatch[2];
    const rest = line.slice(indent.length + key.length + 1);
    return (
      <div>
        <span className="text-white/20">{indent}</span>
        <span className="text-sky-300/75">{key}</span>
        <span className="text-white/25">:</span>
        <span className="text-amber-300/65">{rest}</span>
      </div>
    );
  }
  return <div><span className="text-white/45">{line}</span></div>;
}

const TABS = [
  { id: "consume", label: "Consume an API", file: "~/.claude/claude_desktop_config.json" },
  { id: "publish", label: "Publish an API", file: "server.ts" },
] as const;

function DeveloperSection() {
  const [tab, setTab] = useState<"consume" | "publish">("consume");
  const mcpLines = MCP_CONFIG.split("\n");
  const sdkLines = SDK_SNIPPET.split("\n");
  const isConsume = tab === "consume";

  const consumeCopy = {
    heading: <>Two lines of config.<br /><span className="gradient-text">Fully autonomous.</span></>,
    body: "Add Plugix to your Claude Code MCP configuration. Your agent discovers APIs in the marketplace, pays per call in MON, and executes — without a single popup.",
    steps: [
      { color: "bg-violet-400", text: "Agent calls list_apis() → gets marketplace results" },
      { color: "bg-sky-400",    text: "MCP server routes the selected API call" },
      { color: "bg-emerald-400",text: "Plugix locks escrow and executes the endpoint" },
      { color: "bg-amber-400",  text: "Monad confirms the settlement on-chain" },
    ],
    link: { href: "/docs/mcp", label: "View full integration docs" },
  };

  const publishCopy = {
    heading: <>One middleware import.<br /><span className="gradient-text">Instant monetization.</span></>,
    body: "Wrap any existing Express API with the Plugix SDK. Set a MON price per route — Plugix handles payment verification, escrow, and settlement. Your route code stays untouched.",
    steps: [
      { color: "bg-sky-400",    text: "Client hits your endpoint without payment headers" },
      { color: "bg-amber-400",  text: "Middleware returns 402 with a MON price quote" },
      { color: "bg-violet-400", text: "Client pays and retries — middleware verifies on-chain" },
      { color: "bg-emerald-400",text: "Your route handler runs and earns per execution" },
    ],
    link: { href: "/marketplace", label: "Browse the marketplace" },
  };

  const copy = isConsume ? consumeCopy : publishCopy;

  return (
    <section id="developer" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="rounded-3xl border border-white/[0.05] bg-[#060610] p-10 md:p-14">
        {/* Tab switcher */}
        <div className="mb-10 flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.35)]"
                  : "text-white/40 hover:text-white/65"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: copy */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              For developers
            </p>
            <h2 className="font-display text-4xl font-bold tracking-[-0.025em] text-white leading-[1.12]">
              {copy.heading}
            </h2>
            <p className="text-base text-white/42 leading-relaxed">{copy.body}</p>
            <div className="space-y-3.5">
              {copy.steps.map(({ color, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
                  <p className="text-sm text-white/40">{text}</p>
                </div>
              ))}
            </div>
            <Link
              href={copy.link.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              {copy.link.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: code block */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#030308] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.015] px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="ml-2 text-[11px] font-mono text-white/20">
                {isConsume ? "~/.claude/claude_desktop_config.json" : "server.ts"}
              </span>
            </div>
            <div className="p-5">
              <pre className="overflow-x-auto text-[12.5px] font-mono leading-[1.75]">
                {isConsume
                  ? mcpLines.map((line, i) => <CodeLine key={i} line={line} />)
                  : sdkLines.map((line, i) => <SdkLine key={i} line={line} />)}
              </pre>
              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.04] pt-3.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400/60">
                  {isConsume ? "plugix · connected" : "plugix/sdk · middleware active"}
                </span>
                <span className="ml-auto cursor-blink text-sm text-white/22 font-mono">▋</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ─────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    icon: Terminal,
    audience: "AI Developers",
    desc: "Building Claude plugins, AutoGPT flows, or custom agent pipelines? Give your agents a wallet and instant access to a growing marketplace of callable APIs — no payment integration required.",
    tags: ["Claude Code", "AutoGPT", "LangChain"],
  },
  {
    icon: Code2,
    audience: "API Builders",
    desc: "Have a useful endpoint? Publish it to the Plugix marketplace at a MON price. Earn from every agent execution, automatically settled on-chain with zero billing overhead.",
    tags: ["Monetization", "Pay-per-use", "Passive income"],
  },
  {
    icon: Users,
    audience: "Enterprise Teams",
    desc: "Need predictable, auditable AI usage? Every call is logged, priced, and settled on-chain. Full transparency for compliance — without sacrificing autonomous execution speed.",
    tags: ["Compliance", "Audit logs", "Cost control"],
  },
];

function WhoItsFor() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="mb-12 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
          Who it&apos;s for
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] text-white">
          Built for builders.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PERSONAS.map(({ icon: Icon, audience, desc, tags }) => (
          <div
            key={audience}
            className="group rounded-2xl border border-white/[0.06] bg-[#070710] p-7 hover:border-violet-500/20 transition-all duration-300"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/[0.08]">
                <Icon className="h-4 w-4 text-violet-400" />
              </div>
              <h3 className="font-display text-[15px] font-semibold text-white">{audience}</h3>
            </div>
            <p className="mb-5 text-sm text-white/38 leading-relaxed">{desc}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/35"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA({ onLogin, ready }: { onLogin: () => void; ready: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-violet-950 px-10 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(ellipse 90% 90% at 50% 120%, rgba(109,40,217,0.5) 0%, transparent 65%)",
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative z-10 mx-auto max-w-lg space-y-7">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
            Ready to plug in?
          </h2>
          <p className="text-base text-white/50 leading-relaxed">
            Sign in, get your embedded wallet, and connect your agents to the
            marketplace — in under five minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLogin}
              disabled={!ready}
              className="flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-violet-900 transition-all hover:bg-white/90 disabled:opacity-40"
            >
              Get Started — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/docs/mcp"
              className="flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-10">
      <div className="mx-auto max-w-6xl px-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" width={24} height={24} alt="Plugix" className="rounded-md" />
          <span className="font-display text-sm font-bold text-white">Plugix</span>
          <span className="ml-1 text-xs text-white/20">— AI agent execution on Monad</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/30">
          <a href="#features" className="hover:text-white/55 transition-colors">
            Product
          </a>
          <Link href="/marketplace" className="hover:text-white/55 transition-colors">
            Marketplace
          </Link>
          <Link href="/docs/mcp" className="hover:text-white/55 transition-colors">
            Docs
          </Link>
          <Link href="/publish" className="hover:text-white/55 transition-colors">
            Publish
          </Link>
        </div>

        <p className="text-xs text-white/20">© 2025 Plugix · Shubh & Garvit</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.replace("/dashboard");
  }, [ready, authenticated, router]);

  // Don't flash the landing page for already-authenticated users
  if (!ready || authenticated) return null;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#040408" }}>
      <Navbar onLogin={login} ready={ready} />
      <Hero onLogin={login} ready={ready} />
      <Marquee />
      <HowItWorks />
      <FeatureBento />
      <DeveloperSection />
      <WhoItsFor />
      <CTA onLogin={login} ready={ready} />
      <Footer />
    </div>
  );
}
