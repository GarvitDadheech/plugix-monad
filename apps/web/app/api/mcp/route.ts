import type { NextRequest } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { createUsdcClient } from "@x402/client";
import { serverWalletPayer } from "@x402/client/server";
import { listPublicApis, findApiById } from "@/lib/queries/apis";

// Allow up to 60 seconds — blockchain tx confirmation takes time
export const maxDuration = 60;

const PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY ?? "";
const RPC_URL = process.env.MONAD_RPC_URL ?? "https://rpc.ankr.com/monad_testnet";

function buildServer(): McpServer {
  const server = new McpServer({ name: "plugix-marketplace", version: "0.1.0" });

  server.tool(
    "x402_list_apis",
    "List all pay-per-use APIs on the Plugix marketplace. Returns each API's id, name, description, endpoint_url, price_per_call (USDC), chain, and JSON schema for request/response bodies. Always call this first to discover available APIs before calling x402_call_api.",
    {},
    async () => {
      const apis = await listPublicApis();
      const listing = apis.map(({ id, name, description, endpoint_url, price_per_call, chain, sample_request, sample_response }) => ({
        id,
        name,
        description,
        endpoint_url,
        price_per_call,
        chain,
        sample_request,
        sample_response,
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify(listing, null, 2) }],
      };
    }
  );

  server.tool(
    "x402_call_api",
    "Call a pay-per-use API by its marketplace ID. Automatically handles the HTTP 402 payment flow: issues USDC on Monad and retries with proof. Every successful response includes x402Tnx: { tnxHash, amount, token } — always show the user: '💳 Paid [amount] [token] — tx: [tnxHash]'.",
    {
      apiId: z.number().describe("The numeric API id from x402_list_apis"),
      body: z.string().describe("Request body as a JSON string, matching the API's sample_request schema"),
    },
    async ({ apiId, body }) => {
      if (!PRIVATE_KEY) {
        throw new Error(
          "PAYER_PRIVATE_KEY is not configured on this server. Add it to your deployment environment variables."
        );
      }

      const api = await findApiById(apiId);
      if (!api) throw new Error(`No API with id ${apiId} found in the marketplace.`);

      const client = createUsdcClient({
        payer: serverWalletPayer({ privateKey: PRIVATE_KEY, rpcUrl: RPC_URL }),
      });

      const res = await client.fetch(api.endpoint_url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API call failed (${res.status}): ${text}`);
      }

      const result = await res.json();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  return server;
}

// Each request gets a fresh stateless transport — correct for serverless deployments
async function handler(req: NextRequest): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = buildServer();
  await server.connect(transport);
  return transport.handleRequest(req);
}

export { handler as GET, handler as POST, handler as DELETE };
