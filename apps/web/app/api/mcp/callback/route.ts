import { type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { findUserByPrivyId } from "@/lib/queries/users";
import { insertApiCall } from "@/lib/queries/api-calls";

/**
 * MCP Callback — records a completed x402 API call in the DB.
 *
 * Called by the MCP server after a successful x402 payment + response.
 * Payment is already settled on-chain by the x402 protocol; this endpoint
 * just writes the record so the dashboard can show usage stats.
 *
 * Headers:
 *   x-mcp-secret: <MCP_CALLBACK_SECRET>
 *
 * Body:
 *   privyUserId  string   Privy user ID of the caller
 *   apiId        number   Marketplace API ID
 *   amountSpent  string   USDC amount, e.g. "0.01"
 *   txHash       string   On-chain tx hash
 *   status       string   "success" | "failed"
 */
export async function POST(req: NextRequest) {
  // Verify shared secret
  const secret = req.headers.get("x-mcp-secret");
  if (!secret || secret !== env().MCP_CALLBACK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    privyUserId?: string;
    apiId?: number;
    amountSpent?: string;
    txHash?: string;
    status?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { privyUserId, apiId, amountSpent, txHash, status } = body;
  if (!privyUserId || !apiId || !amountSpent) {
    return Response.json(
      { error: "privyUserId, apiId, and amountSpent are required" },
      { status: 400 }
    );
  }

  const user = await findUserByPrivyId(privyUserId);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const callStatus: "success" | "failed" | "pending" =
    status === "success" ? "success" : status === "failed" ? "failed" : "pending";

  await insertApiCall({
    userId: user.id,
    apiId,
    amountSpent,
    platformFee: "0",
    txHash: txHash ?? undefined,
    status: callStatus,
  });

  return Response.json({ ok: true }, { status: 200 });
}
