import type { Metadata } from "next";
import {
  DocsPage,
  DocsH2,
  DocsCodeBlock,
  DocsTable,
} from "@/components/docs/docs-shell";

export const metadata: Metadata = {
  title: "MCP Integration — Plugix Docs",
  description:
    "Connect Plugix to any MCP-compatible host and give agents access to paid APIs on Monad.",
};

const CONFIG_SNIPPET = `{
  "mcpServers": {
    "plugix": {
      "command": "npx",
      "args": ["-y", "@plugix/mcp-server"],
      "env": {
        "PLUGIX_PRIVY_USER_ID": "<your-privy-user-id>",
        "PLUGIX_API_BASE_URL": "https://app.plugix.xyz"
      }
    }
  }
}`;

const RUN_SNIPPET = `# Restart your MCP host, then prompt your agent:

"What APIs are available on Plugix?"

# The agent calls list_apis and returns marketplace listings with USDC prices.`;

const QUICK_STEPS = [
  {
    step: "01",
    title: "Install",
    body: "The MCP server runs via npx. No global install required.",
    code: "npx -y @plugix/mcp-server",
  },
  {
    step: "02",
    title: "Configure",
    body: "Add the Plugix server block to your host config file.",
    code: "~/.claude/claude_desktop_config.json",
  },
  {
    step: "03",
    title: "Run",
    body: "Restart the host. Agents can discover and pay for APIs.",
    code: "list_apis → execute_api_call",
  },
] as const;

const ARCHITECTURE = [
  "Agent Host",
  "Plugix MCP Server",
  "API Marketplace",
  "Monad Settlement",
] as const;

export default function McpDocsPage() {
  return (
    <DocsPage>
      {/* Page header */}
      <header className="mb-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60 mb-3">
          Integration
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f0eeea]">
          MCP Integration
        </h1>
        <p className="mt-3 text-[15px] text-white/45 leading-relaxed max-w-[52ch]">
          Connect Plugix to any MCP-compatible host and give agents access to paid
          APIs on Monad.
        </p>
      </header>

      {/* Quick start */}
      <section className="mb-14 space-y-6">
        <DocsH2 id="quick-start">Quick start</DocsH2>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_STEPS.map((s) => (
            <div
              key={s.step}
              className="border border-white/[0.07] bg-white/[0.015] p-4"
            >
              <p className="font-mono text-[10px] text-white/25">{s.step}</p>
              <p className="mt-2 font-display text-[15px] font-semibold text-[#e8e6e0]">
                {s.title}
              </p>
              <p className="mt-2 text-[13px] text-white/38 leading-relaxed">{s.body}</p>
              <p className="mt-3 font-mono text-[11px] text-emerald-400/60 break-all">
                {s.code}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-14 space-y-5">
        <DocsH2 id="configuration">Configuration</DocsH2>
        <p className="text-[14px] text-white/40 leading-relaxed">
          Add this block to your MCP host configuration. Use your Privy user ID from
          the Plugix dashboard after signing in.
        </p>
        <DocsCodeBlock
          code={CONFIG_SNIPPET}
          title="claude_desktop_config.json"
          lang="json"
        />
        <p className="text-[13px] text-white/35 border-l border-white/[0.08] pl-4">
          <span className="text-white/50">Note:</span>{" "}
          <code className="font-mono text-[12px] text-emerald-400/70">
            PLUGIX_PRIVY_USER_ID
          </code>{" "}
          is the Privy DID shown in your dashboard profile.
        </p>
      </section>

      {/* Run */}
      <section className="mb-14 space-y-5">
        <DocsH2 id="run">Run</DocsH2>
        <DocsCodeBlock code={RUN_SNIPPET} title="Agent prompt" lang="shell" />
      </section>

      {/* Architecture */}
      <section className="mb-14 space-y-5">
        <DocsH2 id="architecture">Architecture</DocsH2>
        <p className="text-[14px] text-white/40 leading-relaxed max-w-[52ch]">
          The MCP server exposes tools to the host. Paid executions notify the
          Plugix backend, which settles USDC on Monad.
        </p>
        <div className="border border-white/[0.07] bg-white/[0.01] px-6 py-5 max-w-xs">
          {ARCHITECTURE.map((layer, i) => (
            <div key={layer}>
              <p
                className={`font-mono text-[12px] ${
                  i === ARCHITECTURE.length - 1
                    ? "text-emerald-400/75"
                    : "text-white/50"
                }`}
              >
                {layer}
              </p>
              {i < ARCHITECTURE.length - 1 && (
                <p className="py-1.5 pl-1 font-mono text-[10px] text-white/20">↓</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reference */}
      <section className="space-y-8">
        <DocsH2 id="reference">Reference</DocsH2>

        <div className="space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-white/30">
            Environment variables
          </h3>
          <DocsTable
            headers={["Variable", "Description"]}
            rows={[
              [
                "PLUGIX_PRIVY_USER_ID",
                "Your Privy DID. Identifies the agent wallet for settlement.",
              ],
              [
                "PLUGIX_API_BASE_URL",
                "Plugix API base URL. Defaults to the production app URL.",
              ],
            ]}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-white/30">
            MCP tools
          </h3>
          <DocsTable
            headers={["Tool", "Description"]}
            rows={[
              [
                "list_apis",
                "Returns public marketplace APIs with name, price, and metadata.",
              ],
              [
                "execute_api_call",
                "Executes a paid API call by ID. Triggers backend settlement on Monad.",
              ],
            ]}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-white/30">
            Callback endpoint
          </h3>
          <p className="text-[14px] text-white/40 leading-relaxed">
            The MCP server notifies Plugix on each paid execution.
          </p>
          <DocsCodeBlock
            lang="http"
            title="POST /api/mcp/callback"
            code={`x-mcp-secret: <shared-secret>

{
  "privyUserId": "did:privy:abc123",
  "apiId": 3,
  "amountSpent": "0.01",
  "platformFee": "0.001",
  "requestPayload": {},
  "responseMetadata": { "statusCode": 200, "latencyMs": 142 }
}`}
          />
        </div>
      </section>

      <footer className="mt-14 border-t border-white/[0.06] pt-8">
        <p className="text-[13px] text-white/30">
          Questions?{" "}
          <a
            href="https://github.com/plugix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400/70 hover:text-emerald-400 transition-colors"
          >
            GitHub
          </a>
        </p>
      </footer>
    </DocsPage>
  );
}
