#!/usr/bin/env node
/**
 * x402 MCP server for Plugix.
 *
 * This server lists available APIs and calls them via x402 payment flow.
 * Payment is handled by the backend (`/api/mcp/callback`) using the user's
 * Privy embedded wallet and server-side signing.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";

const DASHBOARD_URL = process.env.DASHBOARD_URL ?? "http://localhost:3000";
const MCP_CALLBACK_URL = process.env.MCP_CALLBACK_URL ?? "http://localhost:3000/api/mcp/callback";
const MCP_CALLBACK_SECRET = process.env.MCP_CALLBACK_SECRET ?? "";

if (!MCP_CALLBACK_SECRET) {
  console.error("[x402 MCP] Missing MCP_CALLBACK_SECRET");
  process.exit(1);
}

// Auth token storage
const AUTH_DIR = path.join(os.homedir(), ".x402");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

const ensureAuthDir = () => {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
};

const getStoredToken = (): string | null => {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
      return data.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

const storeToken = (token: string) => {
  ensureAuthDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ token, timestamp: Date.now() }, null, 2));
};

const clearToken = () => {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      fs.unlinkSync(AUTH_FILE);
    }
  } catch {
    // Ignore
  }
};

const server = new McpServer({ name: "x402-apis-marketplace", version: "0.1.0" });

server.tool(
  "x402_login",
  "Authenticate with Plugix dashboard. Opens a browser for you to log in with Privy. After logging in, paste the access token back here.",
  {},
  async () => {
    const deviceCode = randomUUID().slice(0, 8).toUpperCase();
    const loginUrl = `${DASHBOARD_URL}/mcp/login?device_code=${deviceCode}`;

    return {
      content: [
        {
          type: "text" as const,
          text: `🔐 Please log in to Plugix Dashboard:\n\n${loginUrl}\n\nAfter logging in, you'll see your access token. Copy it and paste it back to me using:\n\nx402_set_token(access_token_here)\n\nOr wait here and I'll check for the token...`
        }
      ]
    };
  }
);

server.tool(
  "x402_set_token",
  "Store your access token from the dashboard login.",
  {
    token: z.string()
  } as any,
  async ({ token }: { token: string }) => {
    if (!token || token.length < 10) {
      return { content: [{ type: "text" as const, text: "❌ Invalid token" }] };
    }

    storeToken(token);
    return { content: [{ type: "text" as const, text: "✅ Authentication successful! You can now use x402_call_api and x402_list_apis." }] };
  }
);

server.tool(
  "x402_logout",
  "Clear your stored authentication token.",
  {},
  async () => {
    clearToken();
    return { content: [{ type: "text" as const, text: "✅ Logged out successfully" }] };
  }
);

server.tool(
  "x402_list_apis",
  "List all available pay-per-use APIs and their USDC prices. You must be logged in first (use x402_login).",
  {},
  async () => {
    const token = getStoredToken();
    if (!token) {
      throw new Error("❌ Not authenticated. Please run x402_login first.");
    }

    const res = await fetch(`${DASHBOARD_URL}/api/apis`, {
      headers: { "authorization": `Bearer ${token}` }
    });

    if (res.status === 401) {
      clearToken();
      throw new Error("❌ Authentication expired. Please run x402_login again.");
    }

    if (!res.ok) throw new Error(`Failed to fetch API list: ${res.status}`);
    const data = await res.json();
    const apis = data.apis || [];

    return { content: [{ type: "text" as const, text: JSON.stringify(apis, null, 2) }] };
  }
);

server.tool(
  "x402_call_api",
  "Call a pay-per-use API endpoint. Payment is handled server-side using your Privy embedded wallet. You must be logged in first (use x402_login).",
  {
    apiUrl: z.string(),
    body: z.string()
  } as any,
  async ({ apiUrl, body }: { apiUrl: string; body: string }) => {
    const token = getStoredToken();
    if (!token) {
      throw new Error("❌ Not authenticated. Please run x402_login first.");
    }

    const url = apiUrl;

    // Fetch the API with 402 challenge
    const initialRes = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body
    });

    if (initialRes.status !== 402) {
      if (initialRes.ok) {
        return { content: [{ type: "text" as const, text: JSON.stringify(await initialRes.json()) }] };
      }
      throw new Error(`API call failed (${initialRes.status}): ${await initialRes.text()}`);
    }

    // We got a 402, notify the backend to handle payment
    const quote = await initialRes.json();

    // Call the backend MCP callback to log the call and execute payment
    const callbackRes = await fetch(MCP_CALLBACK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-mcp-callback-secret": MCP_CALLBACK_SECRET
      },
      body: JSON.stringify({
        userAuthToken: token,
        apiUrl,
        price: quote.price,
        token: quote.token
      })
    });

    if (callbackRes.status === 401) {
      clearToken();
      throw new Error("❌ Authentication expired. Please run x402_login again.");
    }

    if (!callbackRes.ok) {
      const err = await callbackRes.text();
      throw new Error(`Payment failed: ${err}`);
    }

    const { txHash } = await callbackRes.json();

    // Retry the request with the payment proof from the callback
    const retryRes = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-payment-tx": txHash,
        "x-payment-reference": quote.reference
      },
      body
    });

    if (!retryRes.ok) {
      const errText = await retryRes.text();
      throw new Error(`API call failed after payment (${retryRes.status}): ${errText}`);
    }

    const result = await retryRes.json();
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
