"use client";

import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { shortenAddress } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONAD_CHAIN_ID = 10143;
const MONAD_HEX = `0x${MONAD_CHAIN_ID.toString(16)}`;

const USDC_ADDRESS = "0x534b2f3A21130d7a60830c2Df862319e593943A3";
const USDC_DECIMALS = 6;

type Token = "USDC" | "MON";
type ModalState = "idle" | "sending" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function encodeERC20Transfer(to: string, amount: bigint): string {
  const selector = "a9059cbb";
  const paddedTo = to.replace("0x", "").toLowerCase().padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  return `0x${selector}${paddedTo}${paddedAmount}`;
}

function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

// ─── Transfer Modal ───────────────────────────────────────────────────────────

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransferModal({ open, onClose }: TransferModalProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const fromAddress = embeddedWallet?.address ?? "";

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Token>("USDC");
  const [state, setState] = useState<ModalState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  const recipientValid = recipient === "" || isValidAddress(recipient);
  const formValid =
    isValidAddress(recipient) &&
    parseFloat(amount) > 0 &&
    !!embeddedWallet;

  const canSend = state === "idle" && formValid;

  const reset = useCallback(() => {
    setRecipient("");
    setAmount("");
    setToken("USDC");
    setState("idle");
    setTxHash(null);
    setErrorMsg("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSend = useCallback(async () => {
    if (!embeddedWallet || !canSend) return;
    setState("sending");
    setErrorMsg("");

    try {
      const provider = await embeddedWallet.getEthereumProvider();

      // Switch to Monad devnet
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: MONAD_HEX }],
        });
      } catch {
        // Chain may not be added yet — add it
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: MONAD_HEX,
            chainName: "Monad Devnet",
            nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
            rpcUrls: ["https://rpc.ankr.com/monad_testnet"],
            blockExplorerUrls: ["https://devnet.monadexplorer.com"],
          }],
        });
      }

      let hash: string;

      if (token === "MON") {
        const amountWei = BigInt(Math.round(parseFloat(amount) * 1e18));
        hash = await provider.request({
          method: "eth_sendTransaction",
          params: [{
            from: fromAddress,
            to: recipient,
            value: `0x${amountWei.toString(16)}`,
            chainId: MONAD_HEX,
          }],
        }) as string;
      } else {
        const amountWei = BigInt(Math.round(parseFloat(amount) * 10 ** USDC_DECIMALS));
        const data = encodeERC20Transfer(recipient, amountWei);
        hash = await provider.request({
          method: "eth_sendTransaction",
          params: [{
            from: fromAddress,
            to: USDC_ADDRESS,
            data,
            chainId: MONAD_HEX,
          }],
        }) as string;
      }

      setTxHash(hash);
      setState("success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErrorMsg(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
      setState("error");
    }
  }, [embeddedWallet, canSend, token, amount, recipient, fromAddress]);

  const copyHash = useCallback(async () => {
    if (!txHash) return;
    await navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  }, [txHash]);

  const initials = user?.email?.address
    ? user.email.address.slice(0, 2).toUpperCase()
    : fromAddress.slice(2, 4).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border bg-card">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">Transfer Funds</DialogTitle>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* ── Success state ── */}
          {state === "success" && txHash ? (
            <div className="py-4 space-y-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Transfer sent</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {amount} {token} → {shortenAddress(recipient)}
                  </p>
                </div>
              </div>

              {/* Tx hash */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                <p className="text-xs text-muted-foreground">Transaction hash</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-foreground truncate">{shortenAddress(txHash, 12)}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={copyHash} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={`https://devnet.monadexplorer.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  Send another
                </Button>
                <Button className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* ── From ── */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From</Label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {user?.email?.address && (
                      <p className="text-xs text-muted-foreground truncate">{user.email.address}</p>
                    )}
                    <p className="text-xs font-mono text-foreground">{shortenAddress(fromAddress)}</p>
                  </div>
                </div>
              </div>

              {/* ── To ── */}
              <div className="space-y-1.5">
                <Label htmlFor="recipient" className="text-xs text-muted-foreground">To</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className={`font-mono text-sm ${recipient && !recipientValid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  disabled={state === "sending"}
                />
                {recipient && !recipientValid && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Invalid address
                  </p>
                )}
              </div>

              {/* ── Amount + Token ── */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-sm"
                    disabled={state === "sending"}
                  />
                  {/* Token toggle */}
                  <div className="flex rounded-md border border-border overflow-hidden shrink-0">
                    {(["USDC", "MON"] as Token[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setToken(t)}
                        disabled={state === "sending"}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          token === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {token === "USDC" && (
                  <p className="text-xs text-muted-foreground/60">
                    USDC on Monad Devnet · {USDC_ADDRESS.slice(0, 10)}…
                  </p>
                )}
              </div>

              {/* ── Error ── */}
              {state === "error" && errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* ── Send button ── */}
              <Button
                className="w-full gap-2"
                onClick={handleSend}
                disabled={!formValid || state === "sending"}
              >
                {state === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Send {amount && parseFloat(amount) > 0 ? `${amount} ${token}` : "Funds"}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
