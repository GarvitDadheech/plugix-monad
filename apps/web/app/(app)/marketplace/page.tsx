"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { shortenAddress, formatAmount } from "@/lib/utils";

interface ApiListing {
  id: number;
  name: string;
  description: string | null;
  endpoint_url: string;
  price_per_call: string;
  chain: string;
  owner_wallet: string;
  created_at: string;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label ?? (copied ? "Copied" : "Copy")}
    </button>
  );
}

function ApiCard({ api }: { api: ApiListing }) {
  const mcpSnippet = JSON.stringify(
    {
      tool: "execute_api_call",
      params: { apiId: api.id, name: api.name },
    },
    null,
    2
  );

  return (
    <Card className="hover:border-primary/40 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{api.name}</CardTitle>
            <CardDescription className="mt-1 text-xs font-mono truncate">
              {shortenAddress(api.owner_wallet, 6)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-lg font-bold text-primary">
              {formatAmount(api.price_per_call)}
            </span>
            <span className="text-xs text-muted-foreground">MON / call</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {api.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{api.description}</p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs gap-1">
            <Globe className="h-2.5 w-2.5" />
            {api.chain}
          </Badge>
          <CopyButton text={mcpSnippet} label="Copy MCP snippet" />
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3 overflow-hidden">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
            {mcpSnippet}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const [apis, setApis] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/apis")
      .then((r) => r.json())
      .then(({ apis }) => setApis(apis ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading APIs…" : `${apis.length} APIs available for agents`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            Monad Devnet
          </div>
        </div>
      </div>

      <Input
        placeholder="Search APIs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          {search ? `No APIs matching "${search}"` : "No APIs published yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((api) => (
            <ApiCard key={api.id} api={api} />
          ))}
        </div>
      )}
    </div>
  );
}
