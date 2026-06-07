"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Activity,
  Zap,
  DollarSign,
  Server,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortenAddress } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total_calls: number;
  total_spent: string;
  successful_calls: number;
  failed_calls: number;
}

interface RecentCall {
  id: number;
  api_name: string;
  amount_spent: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
}

interface PublishedApi {
  id: number;
  name: string;
  price_per_call: string;
  total_calls?: number;
}

interface DashboardData {
  stats: Stats | null;
  recentCalls: RecentCall[];
  publishedApis: PublishedApi[];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3">
        {loading ? (
          <>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { getAccessToken, user } = usePrivy();
  const [data, setData] = useState<DashboardData>({
    stats: null,
    recentCalls: [],
    publishedApis: [],
  });
  const [loadingData, setLoadingData] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoadingData(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData({
          stats: json.stats ?? null,
          recentCalls: json.recentCalls ?? [],
          publishedApis: json.publishedApis ?? [],
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  }, [getAccessToken]);

  // Fetch stats on mount — getAuthUser inside /api/stats auto-creates the user
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const successRate =
    data.stats && data.stats.total_calls > 0
      ? Math.round((data.stats.successful_calls / data.stats.total_calls) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.email?.address ?? "Your agent execution overview"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1.5 text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Monad Devnet · signing active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboard}
            disabled={loadingData}
          >
            <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total API calls"
          value={data.stats?.total_calls.toLocaleString() ?? "0"}
          loading={loadingData}
        />
        <StatCard
          icon={DollarSign}
          label="Total spent"
          value={`${Number(data.stats?.total_spent ?? 0).toFixed(4)} USDC`}
          loading={loadingData}
        />
        <StatCard
          icon={Zap}
          label="Success rate"
          value={`${successRate}%`}
          sub={`${data.stats?.successful_calls ?? 0} successful`}
          loading={loadingData}
        />
        <StatCard
          icon={Server}
          label="Published APIs"
          value={data.publishedApis.length.toString()}
          sub="in marketplace"
          loading={loadingData}
        />
      </div>

      {/* Recent calls + Published APIs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent calls */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent calls</h2>
            <span className="text-xs text-muted-foreground">{data.recentCalls.length} shown</span>
          </div>
          {loadingData ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data.recentCalls.length === 0 ? (
            <div className="py-14 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No calls yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Connect the MCP server to start executing APIs
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">API</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground truncate max-w-[180px]">
                      {call.api_name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {Number(call.amount_spent).toFixed(4)} USDC
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          call.status === "success"
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                            : call.status === "pending"
                            ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            : "text-destructive bg-destructive/10 border-destructive/20"
                        }
                      >
                        {call.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {call.tx_hash ? (
                        <a
                          href={`https://devnet.monadexplorer.com/tx/${call.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                        >
                          {shortenAddress(call.tx_hash)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Published APIs */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Your APIs</h2>
            <a href="/publish" className="text-xs text-primary hover:underline">
              + Publish new
            </a>
          </div>
          {loadingData ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : data.publishedApis.length === 0 ? (
            <div className="py-14 text-center">
              <Server className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No APIs published</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                <a href="/publish" className="text-primary hover:underline">
                  Publish your first API
                </a>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.publishedApis.map((api) => (
                <div key={api.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <p className="text-sm font-medium text-foreground truncate">{api.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {api.price_per_call} USDC / call
                    </span>
                    {api.total_calls !== undefined && (
                      <span className="text-xs text-muted-foreground/60">
                        {api.total_calls} calls
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
