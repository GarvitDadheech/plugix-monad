"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { LogOut, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { shortenAddress } from "@/lib/utils";
import { useState, useCallback } from "react";

export function Topbar() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const address = embeddedWallet?.address ?? "";

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  const initials = user?.email?.address
    ? user.email.address.slice(0, 2).toUpperCase()
    : address.slice(2, 4).toUpperCase();

  return (
    <header className="fixed top-0 left-60 right-0 h-16 z-20 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
      <div />

      <div className="flex items-center gap-3">
        {address && (
          <button
            onClick={copyAddress}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <span>{shortenAddress(address)}</span>
            <Copy className="h-3 w-3" />
            {copied && <span className="text-primary">Copied!</span>}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user?.email?.address && (
                  <p className="text-sm font-medium leading-none">{user.email.address}</p>
                )}
                {address && (
                  <p className="text-xs leading-none text-muted-foreground font-mono">
                    {shortenAddress(address)}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
