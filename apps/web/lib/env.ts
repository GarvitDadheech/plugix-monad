/**
 * Single-source env accessor for all server-side code.
 * Throws early (at first use) if a required variable is missing so the
 * error surfaces clearly in logs rather than as a cryptic downstream failure.
 */

interface ServerEnv {
  PRIVY_APP_ID: string;
  PRIVY_APP_SECRET: string;
  /** PEM private key (SEC1 or PKCS8) OR bare base64 PKCS8 DER, optionally
   *  prefixed with "wallet-auth:".  lib/privy.ts normalises all forms. */
  PRIVY_AUTHORIZATION_KEY: string;
  /** The key-quorum ID shown in the Privy dashboard after registering the
   *  public key.  Optional — only needed when you have multiple quorums. */
  PRIVY_KEY_QUORUM_ID: string;
  DATABASE_URL: string;
  MCP_CALLBACK_SECRET: string;
}

let _cached: ServerEnv | null = null;

function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string): string {
  return process.env[key] ?? "";
}

export function env(): ServerEnv {
  if (_cached) return _cached;
  _cached = {
    PRIVY_APP_ID: require("NEXT_PUBLIC_PRIVY_APP_ID"),
    PRIVY_APP_SECRET: require("PRIVY_APP_SECRET"),
    PRIVY_AUTHORIZATION_KEY: require("PRIVY_AUTHORIZATION_KEY"),
    PRIVY_KEY_QUORUM_ID: optional("PRIVY_KEY_QUORUM_ID"),
    DATABASE_URL: require("DATABASE_URL"),
    MCP_CALLBACK_SECRET: require("MCP_CALLBACK_SECRET"),
  };
  return _cached;
}
