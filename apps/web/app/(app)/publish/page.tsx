"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PlusCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAmount, shortenAddress } from "@/lib/utils";

interface PublishedApi {
  id: number;
  name: string;
  description: string | null;
  endpoint_url: string;
  price_per_call: string;
  chain: string;
  created_at: string;
}

const CHAINS = [
  { value: "monad-devnet", label: "Monad Devnet" },
  { value: "ethereum-mainnet", label: "Ethereum Mainnet" },
  { value: "base-mainnet", label: "Base Mainnet" },
];

export default function PublishPage() {
  const { getAccessToken } = usePrivy();
  const [apis, setApis] = useState<PublishedApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingApis, setFetchingApis] = useState(true);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    endpointUrl: "",
    pricePerCall: "",
    chain: "monad-devnet",
  });

  const fetchMyApis = useCallback(async () => {
    const token = await getAccessToken();
    const res = await fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const { publishedApis } = await res.json();
      setApis(publishedApis ?? []);
    }
    setFetchingApis(false);
  }, [getAccessToken]);

  useEffect(() => {
    fetchMyApis();
  }, [fetchMyApis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const token = await getAccessToken();
    const res = await fetch("/api/apis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        endpointUrl: form.endpointUrl,
        pricePerCall: form.pricePerCall,
        chain: form.chain,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setForm({ name: "", description: "", endpointUrl: "", pricePerCall: "", chain: "monad-testnet" });
      fetchMyApis();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Publish API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register your API endpoint for agents to discover and pay for.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">API Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Weather Data"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Call (MON) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.01"
                  value={form.pricePerCall}
                  onChange={(e) => setForm({ ...form, pricePerCall: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL *</Label>
              <Input
                id="endpoint"
                type="url"
                placeholder="https://api.example.com/v1/data"
                value={form.endpointUrl}
                onChange={(e) => setForm({ ...form, endpointUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your API does…"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Chain</Label>
              <Select
                value={form.chain}
                onValueChange={(val) => setForm({ ...form, chain: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={loading}>
                {loading ? "Publishing…" : "Publish API"}
              </Button>
              {success && (
                <span className="text-sm text-emerald-400 font-medium">
                  Published successfully!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* My APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your APIs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {fetchingApis ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !apis.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No APIs published yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Chain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apis.map((api) => (
                  <TableRow key={api.id}>
                    <TableCell className="font-medium">{api.name}</TableCell>
                    <TableCell>
                      <a
                        href={api.endpoint_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {shortenAddress(api.endpoint_url.replace(/^https?:\/\//, ""), 8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatAmount(api.price_per_call)} MON
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {api.chain}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
