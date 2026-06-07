import { type NextRequest } from "next/server";

const MONAD_RPC = process.env.MONAD_RPC_URL ?? "https://rpc.ankr.com/monad_testnet";
const USDC_ADDRESS = "0x534b2f3A21130d7a60830c2Df862319e593943A3";

async function rpc(method: string, params: unknown[]): Promise<string> {
  const res = await fetch(MONAD_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    cache: "no-store",
  });
  const data = await res.json();
  return (data.result as string) ?? "0x0";
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  try {
    const paddedAddr = address.replace("0x", "").toLowerCase().padStart(64, "0");

    const [monHex, usdcHex] = await Promise.all([
      rpc("eth_getBalance", [address, "latest"]),
      rpc("eth_call", [
        { to: USDC_ADDRESS, data: `0x70a08231${paddedAddr}` },
        "latest",
      ]),
    ]);

    const mon = (Number(BigInt(monHex || "0x0")) / 1e18).toFixed(4);
    const usdc = (Number(BigInt(usdcHex || "0x0")) / 1e6).toFixed(2);

    return Response.json({ mon, usdc });
  } catch (err) {
    console.error("[balance]", err);
    return Response.json({ mon: "—", usdc: "—" }, { status: 200 });
  }
}
