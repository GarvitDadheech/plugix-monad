/**
 * On-chain USDC payment via Privy server-side wallet signing.
 *
 * Architecture
 * ────────────
 * Privy's embedded wallet lives in their infrastructure. Our server holds a
 * P-256 authorization key registered as a Key Quorum in the Privy Dashboard,
 * which allows us to sign transactions FROM the user's wallet without a popup.
 *
 * Flow (signTransaction → broadcast pattern, more reliable on custom networks)
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. estimateGas + getTransactionCount via Monad RPC
 *   2. privy().walletApi.ethereum.signTransaction(...)  ← our key quorum signs
 *   3. publicClient.sendRawTransaction(signedTx)        ← we broadcast
 *
 * This pattern avoids depending on Privy's own broadcasting infrastructure
 * supporting Monad testnet, and gives us full control over calldata (e.g.
 * appending the x402 reference to ERC-20 transfer input).
 *
 * Field name note
 * ───────────────
 * Privy accepts gasLimit (not gas), all numeric values as hex strings, and
 * type=2 for EIP-1559. The `toPrivyTx` helper handles the conversion.
 * We accept whichever signed-tx field name the SDK version returns.
 */

import {
  createPublicClient,
  http,
  encodeFunctionData,
  parseAbi,
  concatHex,
  toHex,
  getAddress,
  type Hex,
} from "viem";
import { privy, getEmbeddedWallet } from "@/lib/privy";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONAD_CHAIN_ID = 10143;
const MONAD_CAIP2 = `eip155:${MONAD_CHAIN_ID}`;
const USDC_ADDRESS = "0x534b2f3A21130d7a60830c2Df862319e593943A3";
const USDC_DECIMALS = 6;

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 value) returns (bool)",
]);

function rpcUrl(): string {
  return process.env.MONAD_RPC_URL ?? "https://rpc.ankr.com/monad_testnet";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toHexNum(v: bigint | number | undefined): string | undefined {
  if (v === undefined || v === null) return undefined;
  return `0x${BigInt(v).toString(16)}`;
}

/**
 * Map a prepared transaction to the shape Privy's walletApi expects.
 * Privy wants: hex strings for numeric fields, `gasLimit` not `gas`,
 * and explicit `type` / EIP-1559 fee fields.
 */
function toPrivyTx(tx: {
  to: string;
  data: string;
  value?: bigint;
  chainId: number;
  nonce: number;
  gas: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}): Record<string, unknown> {
  const base: Record<string, unknown> = {
    to: tx.to,
    value: toHexNum(tx.value ?? 0n),
    data: tx.data,
    chainId: tx.chainId,
    nonce: tx.nonce,
    gasLimit: toHexNum(tx.gas),
  };

  if (tx.maxFeePerGas || tx.maxPriorityFeePerGas) {
    base.type = 2;
    if (tx.maxFeePerGas) base.maxFeePerGas = toHexNum(tx.maxFeePerGas);
    if (tx.maxPriorityFeePerGas) base.maxPriorityFeePerGas = toHexNum(tx.maxPriorityFeePerGas);
  }

  return base;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface UsdcTransferParams {
  privyUserId: string;
  to: string;           // receiver address
  amount: string;       // human-readable USDC, e.g. "0.01"
  reference?: string;   // optional x402 reference to bind to calldata
}

export interface TransferResult {
  txHash: string;
  status: "success" | "failed";
}

/**
 * Send USDC from the user's Privy embedded wallet to `to`, optionally with an
 * x402 reference appended to the ERC-20 transfer calldata for payment binding.
 */
export async function executeUsdcTransfer(
  params: UsdcTransferParams
): Promise<TransferResult> {
  const wallet = await getEmbeddedWallet(params.privyUserId);
  if (!wallet) throw new Error("No embedded wallet found for this user.");

  const publicClient = createPublicClient({ transport: http(rpcUrl()) });

  // Build ERC-20 transfer calldata, optionally with x402 reference appended.
  // ERC-20 contracts ignore trailing bytes; the x402 verifier reads them back.
  const transferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [
      getAddress(params.to),
      BigInt(Math.round(parseFloat(params.amount) * 10 ** USDC_DECIMALS)),
    ],
  });

  const data: Hex = params.reference
    ? concatHex([transferData, toHex(`x402:${params.reference}`)])
    : transferData;

  // Fetch nonce and fee estimates in parallel
  const [nonce, fees] = await Promise.all([
    publicClient.getTransactionCount({ address: wallet.address }),
    publicClient.estimateFeesPerGas().catch(() => ({
      maxFeePerGas: undefined as bigint | undefined,
      maxPriorityFeePerGas: undefined as bigint | undefined,
    })),
  ]);

  // Estimate gas with a 20 % safety buffer
  const gasEstimate = await publicClient.estimateGas({
    account: wallet.address,
    to: getAddress(USDC_ADDRESS),
    data,
  });
  const gas = (gasEstimate * 12n) / 10n;

  // Sign via Privy key quorum — returns raw signed tx bytes
  const signResult: unknown = await (privy() as any).walletApi.ethereum.signTransaction({
    walletId: wallet.id,
    caip2: MONAD_CAIP2,
    transaction: toPrivyTx({
      to: USDC_ADDRESS,
      data,
      chainId: MONAD_CHAIN_ID,
      nonce,
      gas,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
    }),
  });

  // Accept whichever field name this SDK version uses
  const signed: string | undefined =
    (signResult as any)?.signedTransaction ??
    (signResult as any)?.signed_transaction ??
    (signResult as any)?.rawTransaction ??
    (signResult as any)?.raw_transaction;

  if (!signed) {
    throw new Error(
      `Privy signTransaction returned no signed payload. Raw: ${JSON.stringify(signResult)}`
    );
  }

  const rawTx = (signed.startsWith("0x") ? signed : `0x${signed}`) as Hex;
  const txHash = await publicClient.sendRawTransaction({ serializedTransaction: rawTx });

  return { txHash, status: "success" };
}

// ─── Legacy alias (keep callers compiling) ────────────────────────────────────

export interface PaymentParams {
  privyUserId: string;
  userWalletAddress: string;
  amount: string;
  apiId: number;
  userId: number;
}

export interface PaymentResult {
  txHash: string;
  status: "success" | "failed";
}

/** @deprecated use executeUsdcTransfer directly */
export async function executePaidApiCallOnChain(
  params: PaymentParams
): Promise<PaymentResult> {
  const PLATFORM_RECEIVER = process.env.PLATFORM_RECEIVER_ADDRESS;
  if (!PLATFORM_RECEIVER) {
    console.warn("[payments] PLATFORM_RECEIVER_ADDRESS not set — skipping on-chain payment");
    return { txHash: "", status: "failed" };
  }

  try {
    return await executeUsdcTransfer({
      privyUserId: params.privyUserId,
      to: PLATFORM_RECEIVER,
      amount: params.amount,
    });
  } catch (e) {
    console.error("[payments] executePaidApiCallOnChain failed:", e);
    return { txHash: "", status: "failed" };
  }
}
