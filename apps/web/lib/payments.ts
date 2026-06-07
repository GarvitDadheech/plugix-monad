/**
 * On-chain payment execution via Privy server-side wallet API.
 *
 * The Privy client (lib/privy.ts) is initialised with an authorization
 * private key registered as a key quorum in the Privy Dashboard. This
 * allows our server to send transactions FROM the user's embedded wallet
 * without any user-popup — the key quorum signs on their behalf.
 *
 * TODO: Once PRIVY_AUTHORIZATION_KEY is set and the key is registered as a
 *       Key Quorum in the Privy dashboard, uncomment the walletApi call below
 *       and remove the mock return.
 *
 * Monad devnet chain ID: 10143  (CAIP-2: "eip155:10143")
 */

import { privy, getEmbeddedWallet } from "@/lib/privy";

export interface PaymentParams {
  privyUserId: string;
  userWalletAddress: string;
  amount: string;       // in USDC (e.g. "0.01")
  apiId: number;
  userId: number;
}

export interface PaymentResult {
  txHash: string;
  status: "success" | "failed";
}

/** Platform address that receives API call fees */
const PLATFORM_RECEIVER =
  process.env.PLATFORM_RECEIVER_ADDRESS ?? "0x0000000000000000000000000000000000000000";

/** Monad devnet CAIP-2 identifier */
const MONAD_CAIP2 = "eip155:10143";

export async function executePaidApiCallOnChain(
  params: PaymentParams
): Promise<PaymentResult> {
  // ── Real implementation (uncomment when PRIVY_AUTHORIZATION_KEY is set) ──
  //
  // const wallet = await getEmbeddedWallet(params.privyUserId);
  // if (!wallet) throw new Error("No embedded wallet found for user");
  //
  // // Convert MON amount to wei (18 decimals)
  // const amountWei = BigInt(Math.round(parseFloat(params.amount) * 1e18));
  //
  // const { data } = await privy().walletApi.ethereum.sendTransaction({
  //   walletId: wallet.id,
  //   caip2: MONAD_CAIP2,
  //   transaction: {
  //     to: PLATFORM_RECEIVER,
  //     value: `0x${amountWei.toString(16)}`,
  //   },
  //   // Idempotency key prevents double-spend on retry
  //   idempotencyKey: `plugix-${params.userId}-${params.apiId}-${Date.now()}`,
  // });
  //
  // return { txHash: data.hash, status: "success" };

  // ── Mock (remove once real call is wired) ──────────────────────────────
  void privy;           // keep import live so TypeScript doesn't prune it
  void getEmbeddedWallet;
  void PLATFORM_RECEIVER;
  void MONAD_CAIP2;

  const mockHash = `0x${Buffer.from(
    `plugix-mock-${params.userId}-${params.apiId}-${Date.now()}`
  )
    .toString("hex")
    .padEnd(64, "0")
    .slice(0, 64)}`;

  return { txHash: mockHash, status: "success" };
}
