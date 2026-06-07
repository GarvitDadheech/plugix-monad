import { NextResponse } from "next/server";
import { serverWalletPayer } from "@x402/client/server";

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

    const privateKey = process.env.PAYER_PRIVATE_KEY;
    const rpcUrl = process.env.MONAD_RPC_URL ?? "https://rpc.ankr.com/monad_testnet";

    if (!privateKey) {
      return NextResponse.json({ error: "PAYER_PRIVATE_KEY not configured" }, { status: 500 });
    }

    const pay = serverWalletPayer({ privateKey, rpcUrl });
    const txSig = await pay(quote);
    return NextResponse.json({ txSig });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/pay]", msg);
    return NextResponse.json({ error: msg, code: "PAYMENT_ERROR" }, { status: 500 });
  }
}
