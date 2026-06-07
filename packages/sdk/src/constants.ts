export const PAYMENT_TX_HEADER = "x-payment-tx";
export const PAYMENT_REFERENCE_HEADER = "x-payment-reference";

export const DEFAULT_QUOTE_TTL_SECONDS = 5 * 60;

// USDC on Monad. Override via the TOKEN_ADDRESS / USDC_ADDRESS env var.
export const USDC_ADDRESS = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
export const USDC_TOKEN_NAME = "USDC";
export const USDC_NETWORK = "monad";

// Monad devnet chain id (used by the EVM clients when signing/sending).
export const MONAD_CHAIN_ID = 10143;
