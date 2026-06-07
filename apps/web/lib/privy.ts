/**
 * Privy server SDK wrapper.
 *
 * Responsibilities:
 *   1. Verify Privy access tokens on incoming HTTP requests.
 *   2. Expose the PrivyClient (with authorization key) for server-side
 *      wallet operations (signing txs without user popup).
 *
 * Authorization key normalisation
 * ─────────────────────────────────
 * @privy-io/server-auth accepts exactly one format for the authorization
 * private key: base64-encoded PKCS8 DER prefixed with "wallet-auth:".
 * Keys are usually stored on disk / in .env as a PEM file:
 *
 *   -----BEGIN EC PRIVATE KEY-----
 *   <base64...>
 *   -----END EC PRIVATE KEY-----
 *
 * We accept all of:
 *   • PEM (SEC1 or PKCS8, single-line or multi-line)
 *   • bare base64 PKCS8 DER (no markers)
 *   • already-prefixed "wallet-auth:<base64>"
 *
 * … and coerce to "wallet-auth:<base64>" via node:crypto so there is
 * no dependency on openssl at runtime.
 *
 * Setup
 * ──────
 * 1. Generate a key pair:
 *      openssl ecparam -name prime256v1 -genkey -noout -out private.pem
 *      openssl ec -in private.pem -pubout -out public.pem
 *
 * 2. Paste the contents of public.pem into the Privy Dashboard
 *    (Settings → Authorization Keys → Add Key). Note the Key-Quorum ID.
 *
 * 3. Add to .env.local:
 *      PRIVY_AUTHORIZATION_KEY="$(cat private.pem)"
 *      PRIVY_KEY_QUORUM_ID=<id from dashboard>
 */

import { PrivyClient } from "@privy-io/server-auth";
import { createPrivateKey } from "node:crypto";
import { env } from "@/lib/env";

let _client: PrivyClient | null = null;

// ─── Key normalisation ────────────────────────────────────────────────────

/**
 * Re-serialise a PEM string into canonical form:
 *   - BEGIN/END on their own lines
 *   - body base64 wrapped at 64 chars
 *
 * Handles: collapsed single-line PEMs, indented PEMs, over-long body lines.
 */
function rebuildPem(input: string): string {
  let s = input.trim().replace(/^['"]|['"]$/g, "");

  const beginRe = /-----BEGIN ([A-Z0-9 ]+?)-----/;
  const endRe = /-----END ([A-Z0-9 ]+?)-----/;
  const bm = s.match(beginRe);
  const em = s.match(endRe);

  if (!bm || !em) throw new Error("PRIVY_AUTHORIZATION_KEY: PEM is missing BEGIN/END markers");

  const label = bm[1];
  const body = s
    .slice(bm.index! + bm[0].length, em.index)
    .replace(/\s+/g, "");

  if (!body) throw new Error("PRIVY_AUTHORIZATION_KEY: PEM body is empty");

  const wrapped = body.match(/.{1,64}/g)!.join("\n");
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----`;
}

/**
 * Accept any of:
 *   1. "wallet-auth:<base64>"  → pass through
 *   2. PEM (SEC1 or PKCS8)    → node:crypto → PKCS8 DER → base64 → prefix
 *   3. bare base64             → prefix only
 */
function normalisePrivyAuthKey(input: string): string {
  const trimmed = input.trim();

  if (trimmed.startsWith("wallet-auth:")) return trimmed;

  if (trimmed.includes("BEGIN") && trimmed.includes("PRIVATE KEY")) {
    const pem = rebuildPem(trimmed);
    try {
      const keyObj = createPrivateKey({ key: pem, format: "pem" });
      const der = keyObj.export({ type: "pkcs8", format: "der" });
      return `wallet-auth:${(der as Buffer).toString("base64")}`;
    } catch (e) {
      throw new Error(
        `PRIVY_AUTHORIZATION_KEY could not be parsed as a PEM private key. ` +
          `Underlying error: ${(e as Error).message}. ` +
          `Ensure the value is wrapped in single quotes and BEGIN/body/END are on separate lines.`
      );
    }
  }

  // Bare base64 PKCS8 DER without prefix
  return `wallet-auth:${trimmed}`;
}

// ─── Client factory ───────────────────────────────────────────────────────

export function privy(): PrivyClient {
  if (_client) return _client;
  const { PRIVY_APP_ID, PRIVY_APP_SECRET, PRIVY_AUTHORIZATION_KEY } = env();
  _client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET, {
    walletApi: {
      authorizationPrivateKey: normalisePrivyAuthKey(PRIVY_AUTHORIZATION_KEY),
    },
  });
  return _client;
}

// ─── Token verification ───────────────────────────────────────────────────

export interface VerifiedPrivyUser {
  userId: string;
  walletAddress: `0x${string}` | null;
  walletId: string | null;
}

interface LinkedAccountLike {
  type: string;
  address?: string;
  id?: string;
  walletClientType?: string;
  chainType?: string;
}

function pickEmbeddedWallet(
  linkedAccounts: ReadonlyArray<{ type: string }>
): { address: `0x${string}`; id: string } | null {
  const accs = linkedAccounts as ReadonlyArray<LinkedAccountLike>;
  const ethEmbedded = accs.find(
    (a) =>
      a.type === "wallet" &&
      a.walletClientType === "privy" &&
      a.chainType === "ethereum"
  );
  const fallback = ethEmbedded ?? accs.find((a) => a.type === "wallet");
  if (!fallback?.address || !fallback?.id) return null;
  return { address: fallback.address as `0x${string}`, id: fallback.id };
}

/**
 * Verify an access token and return the user with their embedded wallet.
 *
 * Retry logic: with `createOnLogin: "all-users"` Privy provisions the
 * embedded wallet asynchronously after issuing the first auth token. For
 * brand-new accounts the wallet may not be linked yet on the first request.
 * We retry the getUserById lookup a few times with backoff before giving up.
 */
export async function verifyAccessToken(
  token: string
): Promise<VerifiedPrivyUser> {
  const claims = await privy().verifyAuthToken(token);

  const RETRY_DELAYS_MS = [0, 500, 1100, 1800];
  let wallet: { address: `0x${string}`; id: string } | null = null;

  for (const delay of RETRY_DELAYS_MS) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    const user = await privy().getUserById(claims.userId);
    wallet = pickEmbeddedWallet(user.linkedAccounts);
    if (wallet) break;
  }

  return {
    userId: claims.userId,
    walletAddress: wallet?.address ?? null,
    walletId: wallet?.id ?? null,
  };
}

/** Get the embedded wallet for a user without verifying a token. */
export async function getEmbeddedWallet(
  privyUserId: string
): Promise<{ address: `0x${string}`; id: string } | null> {
  const user = await privy().getUserById(privyUserId);
  return pickEmbeddedWallet(user.linkedAccounts);
}
