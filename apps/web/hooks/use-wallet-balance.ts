"use client";

import { useState, useEffect, useCallback } from "react";

export interface WalletBalances {
  mon: string;
  usdc: string;
  loading: boolean;
  refetch: () => void;
}

export function useWalletBalance(address: string | undefined): WalletBalances {
  const [mon, setMon] = useState("—");
  const [usdc, setUsdc] = useState("—");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/balance?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      setMon(data.mon ?? "—");
      setUsdc(data.usdc ?? "—");
    } catch {
      setMon("—");
      setUsdc("—");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  return { mon, usdc, loading, refetch: load };
}
