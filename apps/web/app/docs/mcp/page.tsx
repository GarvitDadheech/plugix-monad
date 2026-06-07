import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Terminal, Zap, BookOpen, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const configSnippet = `{
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

const listApisSnippet = `// In Claude Code or any MCP host:
const apis = await mcp.call("list_apis", {});
// Returns: [{ id, name, description, pricePerCall, chain }, ...]`;

const executeSnippet = `// Execute a paid API call:
const result = await mcp.call("execute_api_call", {
  apiId: 3,
  payload: { query: "latest ETH price" }
});
// Plugix MCP server:
// 1. Notifies backend via POST /api/mcp/callback
// 2. Backend logs the call and triggers Privy signer settlement
// 3. Returns the API response to the agent`;

const callbackPayloadSnippet = `POST /api/mcp/callback
x-mcp-secret: <shared-secret>

{
  "privyUserId": "did:privy:abc123",
  "apiId": 3,
  "amountSpent": "0.01",
  "platformFee": "0.001",
  "requestPayload": { "query": "latest ETH price" },
  "responseMetadata": { "statusCode": 200, "latencyMs": 142 }
}`;

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function McpDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" width={24} height={24} alt="Plugix" className="rounded" />
            <span className="font-semibold text-sm">Plugix</span>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Marketplace
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">MCP</Badge>
            <Badge variant="outline">v1.0</Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">MCP Integration Guide</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Plug our Model Context Protocol (MCP) server into Claude Code or any MCP-compatible
            agent to discover and pay for APIs autonomously — no API keys, no manual billing.
          </p>
        </div>

        <Separator />

        {/* Overview */}
        <Section icon={BookOpen} title="Overview">
          <p className="text-muted-foreground leading-relaxed">
            The Plugix MCP server exposes two tools to any MCP host:
          </p>
          <ul className="space-y-2 text-sm">
            {[
              {
                name: "list_apis",
                desc: "Returns all public APIs from the Plugix marketplace with name, description, and price.",
              },
              {
                name: "execute_api_call",
                desc: "Calls a specific API by ID. Plugix notifies the backend, which logs the call and settles payment from the user's embedded wallet via Privy signers.",
              },
            ].map(({ name, desc }) => (
              <li key={name} className="flex gap-3 rounded-lg border border-border p-3">
                <code className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary self-start mt-0.5">
                  {name}
                </code>
                <span className="text-muted-foreground">{desc}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Setup */}
        <Section icon={Terminal} title="Claude Code Setup">
          <p className="text-sm text-muted-foreground">
            Add the following to your Claude Code MCP configuration file (
            <code className="text-xs bg-muted px-1 py-0.5 rounded">~/.claude/claude_desktop_config.json</code> or project-level
            <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">.mcp.json</code>):
          </p>
          <CodeBlock code={configSnippet} lang="json — ~/.claude/claude_desktop_config.json" />
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300/80">
            <strong>Note:</strong> Get your <code className="text-xs bg-muted px-1 py-0.5 rounded">PLUGIX_PRIVY_USER_ID</code> from
            the dashboard after logging in. It&apos;s the Privy DID shown in your profile.
          </div>
        </Section>

        {/* Discover APIs */}
        <Section icon={Zap} title="Discover APIs">
          <p className="text-sm text-muted-foreground">
            Ask the agent to list available APIs. It will call{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">list_apis</code> under the hood:
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm italic text-muted-foreground">
              &ldquo;What APIs are available on Plugix?&rdquo;
            </p>
          </div>
          <CodeBlock code={listApisSnippet} lang="javascript" />
        </Section>

        {/* Execute */}
        <Section icon={Cpu} title="Execute a Paid API Call">
          <p className="text-sm text-muted-foreground">
            When the agent calls <code className="text-xs bg-muted px-1 py-0.5 rounded">execute_api_call</code>:
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>The MCP server forwards the request to the target API endpoint.</li>
            <li>
              It notifies <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/mcp/callback</code> with call metadata.
            </li>
            <li>
              Our backend looks up the user&apos;s embedded wallet and (if server-signing is enabled) calls{" "}
              <strong className="text-foreground">Privy&apos;s signer API</strong> to settle the payment
              on-chain — no popup required.
            </li>
            <li>The API response is returned to the agent.</li>
          </ol>
          <CodeBlock code={executeSnippet} lang="javascript" />
        </Section>

        {/* Callback spec */}
        <Section icon={Terminal} title="MCP Callback Payload">
          <p className="text-sm text-muted-foreground">
            The MCP server calls this endpoint on every paid execution. Authenticate with the shared
            secret configured in your environment:
          </p>
          <CodeBlock code={callbackPayloadSnippet} lang="http" />
        </Section>

        <Separator />

        <div className="text-sm text-muted-foreground text-center pb-8">
          Questions?{" "}
          <a
            href="https://github.com/plugix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open an issue on GitHub
          </a>
          .
        </div>
      </div>
    </div>
  );
}
