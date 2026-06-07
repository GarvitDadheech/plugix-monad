import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "@/lib/auth";
import { executePaidApiCallOnChain } from "@/lib/payments";
import { env } from "@/lib/env";
import { getUserByPrivyId } from "@/lib/queries/users";

/**
 * MCP Callback Handler
 *
 * Called by the MCP server to execute a payment on behalf of the user.
 * The MCP server has already verified the user's auth token and wants to
 * pay for an API call using the user's Privy embedded wallet.
 *
 * Request body:
 * {
 *   userAuthToken: string,        // Privy auth token
 *   endpoint: string,              // e.g. "/api/generate-image"
 *   price: string,                 // USDC amount (e.g. "0.1")
 *   token: string                  // "USDC"
 * }
 *
 * Response:
 * {
 *   txHash: string                 // Monad tx hash for the payment
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the callback secret
    const secret = req.headers.get("x-mcp-callback-secret");
    const expectedSecret = env().MCP_CALLBACK_SECRET;

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userAuthToken, apiUrl, price, token } = body;

    if (!userAuthToken || !apiUrl || !price || !token) {
      return NextResponse.json(
        { error: "Missing required fields: userAuthToken, apiUrl, price, token" },
        { status: 400 }
      );
    }

    // Verify the JWT token from MCP
    let verifiedUser;
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

    try {
      const decoded = jwt.verify(userAuthToken, JWT_SECRET) as { userId: string; type: string };

      if (decoded.type !== "mcp") {
        return NextResponse.json(
          { error: "Invalid token type" },
          { status: 401 }
        );
      }

      // Get user from database using Privy ID
      const dbUser = await getUserByPrivyId(decoded.userId);
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      verifiedUser = {
        userId: decoded.userId,
        dbUserId: dbUser.id,
        walletAddress: dbUser.wallet_address
      };
    } catch (e) {
      return NextResponse.json(
        { error: `Invalid auth token: ${e instanceof Error ? e.message : String(e)}` },
        { status: 401 }
      );
    }

    if (!verifiedUser.walletAddress) {
      return NextResponse.json(
        { error: "User has no wallet address" },
        { status: 400 }
      );
    }

    // Execute the payment from the user's wallet
    const result = await executePaidApiCallOnChain({
      privyUserId: verifiedUser.userId,
      userWalletAddress: verifiedUser.walletAddress,
      amount: price,
      apiId: -1,         // TODO: map apiUrl to apiId from DB
      userId: verifiedUser.dbUserId
    });

    if (result.status !== "success") {
      return NextResponse.json({ error: "Payment failed" }, { status: 500 });
    }

    return NextResponse.json({ txHash: result.txHash }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[MCP Callback] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
