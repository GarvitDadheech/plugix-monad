"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Server,
  TrendingUp,
  Wallet,
  BadgeDollarSign,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { shortenAddress } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total_calls: string;
  total_spent: string;
  successful_calls: string;
  failed_calls: string;
}

interface IncomingStats {
  incoming_calls: string;
  total_earned: string;
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
  incomingStats: IncomingStats | null;
  recentCalls: RecentCall[];
  publishedApis: PublishedApi[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-8 w-8 rounded-lg mb-3" />
          <Skeleton className="h-7 w-20 mb-1.5" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      ))}
    </div>
  );
}

function EarningSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-8 w-8 rounded-lg mb-3" />
          <Skeleton className="h-7 w-24 mb-1.5" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function ApiListSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 group hover:border-primary/30 transition-colors">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors mb-3">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/50 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Earnings Card ────────────────────────────────────────────────────────────

function EarningCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 group hover:border-primary/40 hover:bg-primary/[0.07] transition-colors">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 mb-3">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-primary/50 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { getAccessToken, user } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const address = embeddedWallet?.address;

  const [data, setData] = useState<DashboardData>({
    stats: null,
    incomingStats: null,
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
          incomingStats: json.incomingStats ?? null,
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

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalCalls = Number(data.stats?.total_calls ?? 0);
  const successfulCalls = Number(data.stats?.successful_calls ?? 0);
  const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 100;

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.email?.address ?? shortenAddress(address ?? "")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingData}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Activity Stats ── */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Your Activity
        </p>
        {loadingData ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="Total API calls made"
              value={totalCalls.toLocaleString()}
            />
            <StatCard
              icon={Wallet}
              label="USDC spent"
              value={`${Number(data.stats?.total_spent ?? 0).toFixed(2)}`}
              sub="USDC"
            />
            <StatCard
              icon={CheckCircle2}
              label="Success rate"
              value={`${successRate}%`}
              sub={`${successfulCalls} successful`}
            />
            <StatCard
              icon={Server}
              label="Published APIs"
              value={data.publishedApis.length.toString()}
              sub="in marketplace"
            />
          </div>
        )}
      </div>

      {/* ── API Earnings ── */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          API Earnings
        </p>
        {loadingData ? (
          <EarningSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <EarningCard
              icon={TrendingUp}
              label="Calls received on your APIs"
              value={Number(data.incomingStats?.incoming_calls ?? 0).toLocaleString()}
              sub="by other agents"
            />
            <EarningCard
              icon={BadgeDollarSign}
              label="USDC earned from your APIs"
              value={Number(data.incomingStats?.total_earned ?? 0).toFixed(2)}
              sub="USDC received"
            />
          </div>
        )}
      </div>

      {/* ── Recent Calls + Published APIs ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Calls */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Calls</h2>
            <span className="text-xs text-muted-foreground">
              {loadingData ? "—" : `${data.recentCalls.length} shown`}
            </span>
          </div>

          {loadingData ? (
            <TableSkeleton />
          ) : data.recentCalls.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/30">
                <Activity className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No calls yet</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Connect the MCP server to start executing APIs
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    <tr key={call.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground truncate max-w-[160px]">
                        {call.api_name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {Number(call.amount_spent).toFixed(4)}{" "}
                        <span className="text-muted-foreground/50">USDC</span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                            call.status === "success"
                              ? "text-emerald-400 bg-emerald-400/8 border-emerald-400/15"
                              : call.status === "pending"
                              ? "text-amber-400 bg-amber-400/8 border-amber-400/15"
                              : "text-red-400 bg-red-400/8 border-red-400/15"
                          }`}
                        >
                          {call.status === "success" && <span className="h-1 w-1 rounded-full bg-emerald-400" />}
                          {call.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {call.tx_hash ? (
                          <a
                            href={`https://devnet.monadexplorer.com/tx/${call.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-mono transition-colors"
                          >
                            {shortenAddress(call.tx_hash, 6)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Published APIs */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Your APIs</h2>
            <a
              href="/publish"
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 hover:border-primary/50 transition-colors"
            >
              <PlusCircle className="h-3 w-3" />
              Publish
            </a>
          </div>

          {loadingData ? (
            <ApiListSkeleton />
          ) : data.publishedApis.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-5">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/30">
                <Server className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No APIs yet</p>
              <a
                href="/publish"
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Publish your first API
              </a>
            </div>
          ) : (
            <div className="divide-y divide-border/50 flex-1 overflow-y-auto">
              {data.publishedApis.map((api) => (
                <div key={api.id} className="px-5 py-3.5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate leading-snug">
                      {api.name}
                    </p>
                    {api.total_calls !== undefined && api.total_calls > 0 && (
                      <span className="text-[10px] rounded-full border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-primary font-medium shrink-0">
                        {api.total_calls}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <BadgeDollarSign className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs font-mono text-muted-foreground">
                      {api.price_per_call} USDC
                    </span>
                    <span className="text-xs text-muted-foreground/40">/ call</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View all link */}
          {data.publishedApis.length > 0 && (
            <div className="border-t border-border px-5 py-3">
              <a
                href="/publish"
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Manage APIs
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
