import { NextResponse } from "next/server";
import { serverWalletPayer } from "@x402/client/server";
import { getServerEnv } from "../../../src/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = body.quote;

    if (!quote) {
      return NextResponse.json({ error: "Missing quote in request body" }, { status: 400 });
    }

    if (!quote.reference || !quote.tokenAddress || !quote.receiver) {
      return NextResponse.json({ error: "Invalid quote: missing required fields" }, { status: 400 });
    }

    const env = getServerEnv();
    console.log("[/api/pay] Processing payment with quote:", quote);
    console.log("[/api/pay] Using RPC URL:", env.MONAD_RPC_URL);
    const pay = serverWalletPayer({
      privateKey: env.PAYER_PRIVATE_KEY,
      rpcUrl: env.MONAD_RPC_URL
    });

    const txSig = await pay(quote);
    return NextResponse.json({ txSig });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/pay]", msg);
    return NextResponse.json(
      { error: msg, code: "PAYMENT_ERROR" },
      { status: 500 }
    );
  }
}
