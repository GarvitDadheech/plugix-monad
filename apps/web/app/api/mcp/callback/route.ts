import { type NextRequest } from "next/server";
import { serverError } from "@/lib/auth";
import { findUserByPrivyId } from "@/lib/queries/users";
import { findApiById } from "@/lib/queries/apis";
import { insertApiCall } from "@/lib/queries/api-calls";
import { executePaidApiCallOnChain } from "@/lib/payments";
import { env } from "@/lib/env";

interface McpCallbackBody {
  privyUserId: string;
  apiId: number;
  amountSpent: string;
  platformFee?: string;
  requestPayload?: Record<string, unknown>;
  responseMetadata?: Record<string, unknown>;
  txHash?: string;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-mcp-secret");
  if (secret !== env().MCP_CALLBACK_SECRET) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: McpCallbackBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { privyUserId, apiId, amountSpent, platformFee, requestPayload, responseMetadata, txHash } =
    body;

  if (!privyUserId || !apiId || !amountSpent) {
    return Response.json(
      { error: "privyUserId, apiId, and amountSpent are required" },
      { status: 400 }
    );
  }

  const user = await findUserByPrivyId(privyUserId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const api = await findApiById(apiId);
  if (!api) return Response.json({ error: "API not found" }, { status: 404 });

  // Trigger on-chain settlement via Privy signer (if enabled)
  let finalTxHash = txHash ?? null;
  if (user.server_signing_enabled && !finalTxHash) {
    try {
      const result = await executePaidApiCallOnChain({
        privyUserId,
        userWalletAddress: user.wallet_address,
        amount: amountSpent,
        apiId,
        userId: user.id,
      });
      finalTxHash = result.txHash;
    } catch (err) {
      console.error("[mcp/callback] on-chain payment error:", err);
    }
  }

  try {
    const call = await insertApiCall({
      userId: user.id,
      apiId,
      txHash: finalTxHash ?? undefined,
      amountSpent,
      platformFee: platformFee ?? "0",
      status: finalTxHash ? "success" : "pending",
      requestPayload,
      responseMetadata,
    });
    return Response.json({ call }, { status: 200 });
  } catch (err) {
    return serverError(err);
  }
}
