/**
 * Auth helpers for Next.js Route Handlers.
 *
 * requirePrivy   — verify the Bearer token, return Privy user or a Response
 * getAuthUser    — requirePrivy + DB lookup, for routes that need dbUserId
 * serverError    — standard JSON error envelope for caught errors
 *
 * Usage:
 *
 *   export async function POST(req: NextRequest) {
 *     const auth = await requirePrivy(req);
 *     if (auth instanceof Response) return auth;   // 401 / 503
 *     // auth.privyUserId, auth.walletId, auth.wallet
 *   }
 *
 *   // When you also need the DB row:
 *   const auth = await getAuthUser(req);
 *   if (auth instanceof Response) return auth;
 *   // auth.dbUserId is available too
 */

import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/privy";
import { upsertUser } from "@/lib/queries/users";

// ─── Types ────────────────────────────────────────────────────────────────

export interface AuthedUser {
  privyUserId: string;
  walletId: string;
  wallet: `0x${string}`;
}

export interface AuthUserWithDb extends AuthedUser {
  dbUserId: number;
}

// ─── requirePrivy ─────────────────────────────────────────────────────────

export async function requirePrivy(
  req: NextRequest | Request
): Promise<AuthedUser | Response> {
  const header =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) {
    return Response.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  try {
    const verified = await verifyAccessToken(token);

    if (!verified.walletAddress || !verified.walletId) {
      // Embedded wallet is still being provisioned (async after sign-up).
      // verifyAccessToken already retried; give client a hint to back off.
      return Response.json(
        {
          error: "Wallet is still being provisioned — retry in a moment.",
          retryable: true,
        },
        { status: 503, headers: { "retry-after": "2" } }
      );
    }

    return {
      privyUserId: verified.userId,
      walletId: verified.walletId,
      wallet: verified.walletAddress,
    };
  } catch (e) {
    return Response.json(
      { error: "Invalid token", details: (e as Error).message },
      { status: 401 }
    );
  }
}

// ─── getAuthUser (requirePrivy + DB lookup) ───────────────────────────────

export async function getAuthUser(
  req: NextRequest | Request
): Promise<AuthUserWithDb | Response> {
  const authed = await requirePrivy(req);
  if (authed instanceof Response) return authed;

  // Auto-create (or update) the user on every request — no separate /init needed.
  const dbUser = await upsertUser(authed.privyUserId, authed.wallet, authed.walletId);
  return { ...authed, dbUserId: dbUser.id };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function serverError(err: unknown, status = 500): Response {
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[plugix] route error:", err);
  return Response.json({ error: message }, { status });
}
